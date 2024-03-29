import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { throttling } from "@octokit/plugin-throttling";

import c from 'ansi-colors';
import terminalLink from 'terminal-link';
import fetch from 'node-fetch';
import parseDiff from 'parse-diff';

const BLOG_URL = 'https://blog.benjamin-cabe.com';
const TAG = 529; //'zephyr-weekly-update';

interface WPPost {
    date_gmt: string;
}

async function getMostRecentPostDate(tag: number): Promise<string | null> {
    const apiUrl = `${BLOG_URL}/wp-json/wp/v2/posts?tags=${tag}&per_page=1&_fields=date_gmt`;
    try {
        const response = await fetch(apiUrl);
        const data: WPPost[] = await response.json() as WPPost[];

        if (data.length > 0) {
            return data[0].date_gmt;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    return null;
}

// get GitHub API token from environment variable
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

const MyOctokit = Octokit.plugin(throttling);
const octokit = new MyOctokit({
    auth: GITHUB_API_TOKEN,
    throttle: {
        onSecondaryRateLimit: (retryAfter, options) => {
            return true;
        },
        onRateLimit: (retryAfter, options, octokit, retryCount) => {
            if (retryCount < 5) {
                return true;
            }
        }
    },
});

const owner = 'zephyrproject-rtos';
const repo = 'zephyr';

const SHOW_COMMIT_DETAILS = true;

async function listPRs(showCommitDetails = true) {
    const sinceDate = await getMostRecentPostDate(TAG);

    // Use github search API to get the list of all pull requests merged since the last blog post
    // https://docs.github.com/en/rest/reference/search#search-issues-and-pull-requests
    const query = `repo:${owner}/${repo} is:pr is:merged merged:>${sinceDate}`;

    const searchResult = await octokit.paginate(octokit.rest.search.issuesAndPullRequests, {
        q: query,
        per_page: 100,
    });

    console.log(`Found ${searchResult.length} pull requests merged since ${sinceDate}`);

    // Sort pull requests by title
    searchResult.sort((a, b) => {
        return a.title.localeCompare(b.title);
    });

    let firstTimeContributors = [];
    // map GitHub user to name and email
    let githubUserToIdentityFromCommitInfo: Record<string, { name: string, email: string }> = {};

    // List pull request numbers, titles and links
    for (const pr of searchResult) {
        // check if this PR is author's first merged PR using GH Search API
        // https://docs.github.com/en/rest/reference/search#search-issues-and-pull-requests
        const author = pr.user?.login;
        let isFirstPR = false;
        if (author) {
            const query = `repo:${owner}/${repo} is:pr is:merged author:${author} closed:<=${pr.closed_at}`;
            try {
                const { status: searchStatus, data: searchResults } = await octokit.rest.search.issuesAndPullRequests({ q: query });
                if (searchResults.total_count === 1) {
                    firstTimeContributors.push(pr.user);
                    isFirstPR = true;
                }
            }
            catch (error) {
                // ignore -- user may have deleted their account or have privacy settings preventing search
            }
        }

        // Fetch the diff corresponding to the pull request
        const diffUrl = pr.pull_request?.diff_url;
        if (diffUrl) {
            const response = await fetch(diffUrl);
            const diff = await response.text();
            const d = parseDiff(diff);
            // compute total additions and total deletions for the entire diff
            let added = 0;
            let deleted = 0;
            d.forEach((file) => {
                added += file.additions;
                deleted += file.deletions;
            });

            let specialFlag = '🔘';
            if (['fix', 'bug', 'issue'].some((keyword) => pr.title.toLowerCase().includes(keyword))) {
                specialFlag = '🐛';
            }

            const prLink = terminalLink(
                `#${pr.number}`,
                `https://github.com/${owner}/${repo}/pull/${pr.number}`,
                { fallback: (text, url) => text }
            );

            if (((added - deleted) > 40) ||
                ((deleted - added) > 80) ||
                (added >= 30 && deleted < 5) ||
                added > 150 ||
                deleted > 150 ||
                isFirstPR) {

                if (added - deleted > 300) {
                    specialFlag = '🚀';
                } else if (added > 300) {
                    specialFlag = '⚙️';
                }

                let highlight = (isFirstPR) ? c.bold : c.reset;

                console.log(
                    highlight([
                        c.green(`${specialFlag} ${pr.title}`),
                        c.green(`+${added}`),
                        c.red(`-${deleted}`),
                        //pr.labels.map((label) => c.bgHex(label.color || '#000').black(label.name)).join(' ')
                        isFirstPR ?
                            c.bold(`[@${pr.user?.login} 🆕]`) :
                            `[@${pr.user?.login}]`,

                    ].map(highlight).join(' '),
                    ),
                    `(PR ${prLink})`
                );

                if (showCommitDetails) {
                    // list all commits in the pull request
                    const commits = await octokit.rest.pulls.listCommits({
                        owner,
                        repo,
                        pull_number: pr.number,
                    });
                    for (const commit of commits.data) {
                        if (author) {
                            let name = commit.commit.author?.name;
                            let email = commit.commit.author?.email;
                            if (name && email) {
                                githubUserToIdentityFromCommitInfo[author] = { name: name, email: email };
                            }
                        }
                        const commitLink = terminalLink(
                            commit.sha.substring(0, 7),
                            `https://github.com/${owner}/${repo}/commit/${commit.sha}`,
                            { fallback: (text, url) => text }
                        );
                        console.log(`  - ${c.blueBright(commitLink)} ${commit.commit.message.split('\n')[0]}`);
                    }
                }
            } else {
                console.log(c.grey(`${specialFlag} ${pr.title}`),
                    c.green.dim(`+${added}`),
                    c.red.dim(`-${deleted}`),
                    isFirstPR ?
                        c.bold(`[@${pr.user?.login} 🆕]`) :
                        c.grey(`[@${pr.user?.login}]`),
                    c.grey(`(PR ${prLink})`)
                );
            }
        }
    };

    console.log(); console.log();

    if (firstTimeContributors.length === 0) {
        // no first time contributors, add an emoji to make it more fun
        console.log(`No first time contributors on the period. 🤷‍♂️`);
    }
    else {
        console.log(`The following ${firstTimeContributors.length} contributors had their first pull request(s) merged on the period:\n`);
        for (const author of firstTimeContributors) {
            if (author) {
                // get more info about the author
                const { data: authorData } = await octokit.rest.users.getByUsername({
                    username: author.login,
                });

                let authorLink = terminalLink('@' + author?.login || '', author?.html_url || '',
                    { fallback: (text, url) => text }
                );
                // get author name and email from GitHub, and revert to commit info if not set in Github
                let authorName = authorData.name || (githubUserToIdentityFromCommitInfo[author.login] ? githubUserToIdentityFromCommitInfo[author.login].name : '');
                let authorEmail = authorData.email || (githubUserToIdentityFromCommitInfo[author.login] ? githubUserToIdentityFromCommitInfo[author.login].email : '');

                console.log(`🧑🏼‍💻 ${authorLink} // ${authorName} ${authorEmail ? `<${authorEmail}>` : ''}`);

                if (authorData.company)
                    console.log(`   🏢 ${authorData.company}`);

                if (authorData.location)
                    console.log(`   🌍 ${authorData.location}`);

                if (authorData.blog)
                    console.log(`   📝 ${authorData.blog}`);

                if (authorData.twitter_username) {
                    let twitterLink = terminalLink('@' + authorData.twitter_username, `https://twitter.com/${authorData.twitter_username}`,
                        { fallback: (text, url) => text }
                    );
                    console.log(`   🐦 ${twitterLink}`);
                }

                console.log();
            }
        }

        // Log first-time contributors as copy-pasteable HTML
        // Example: <p>A big thank you to the <strong>6 individuals</strong> who had their first pull request accepted this week, 💙 🙌: <a href="https://github.com/feraralashkar" target="_blank" rel="noreferrer noopener">Ferar</a>, <a href="https://github.com/markxoe" target="_blank" rel="noreferrer noopener">Mark</a>, <a href="https://github.com/MBradbury" target="_blank" rel="noreferrer noopener">Matthew</a>, <a href="https://github.com/nono313" target="_blank" rel="noreferrer noopener">Nathan</a>, <a href="https://github.com/nickstoughton" target="_blank" rel="noreferrer noopener">Nick</a>, and <a href="https://github.com/plbossart" target="_blank" rel="noreferrer noopener">Pierre-Louis</a>.</p>
        console.log(`<p>A big thank you to the <strong>${firstTimeContributors.length} individuals</strong> who had their first pull request accepted this week, 💙 🙌:`,
            `${firstTimeContributors.map((author) => { return `<a href="${author?.html_url}" target="_blank" rel="noreferrer noopener">@${author?.login}</a>` }).join(', ')}.`
            + `</p>`);


    }

}

listPRs(true);