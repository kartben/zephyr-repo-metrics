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

    console.log(apiUrl)

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

async function listCommits() {
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

    // List pull request numbers, titles and links
    for (const pr of searchResult) {
        // check if this PR is author's first merged PR using GH Search API
        // https://docs.github.com/en/rest/reference/search#search-issues-and-pull-requests
        const author = pr.user?.login;
        let isFirstPR = false;
        if (author) {
            const query = `repo:${owner}/${repo} is:pr is:merged author:${author} closed:<=${pr.closed_at}`;
            const { status: searchStatus, data: searchResults } = await octokit.rest.search.issuesAndPullRequests({ q: query });
            if (searchResults.total_count === 1) {
                isFirstPR = true;
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

            const prLink = terminalLink(
                `#${pr.number}`,
                `https://github.com/${owner}/${repo}/pull/${pr.number}`
            );
            if (((added - deleted) > 100) ||
                ((deleted - added) > 50) ||
                (added >= 30 && deleted < 5) ||
                added > 150 ||
                deleted > 150) {

                let specialFlag = '🔘';
                if (['fix', 'bug'].some((keyword) => pr.title.toLowerCase().includes(keyword))) {
                    specialFlag = '🪳';
                } else if (added - deleted > 300) {
                    specialFlag = '🚀';
                } else if (added > 300) {
                    specialFlag = '⚙️';
                }

                let highlight = (isFirstPR) ? c.bold : c.reset;

                console.log([
                    c.green(`${specialFlag} ${prLink} ${pr.title}`),
                    c.green(`+${added}`),
                    c.red(`-${deleted}`),
                    //pr.labels.map((label) => c.bgHex(label.color || '#000').black(label.name)).join(' ')
                    isFirstPR ?
                        c.bold(`(@${pr.user?.login} 🆕)`) :
                        `(@${pr.user?.login})`
                ].map(highlight).join(' ')
                );

                // list all commits in the pull request
                const commits = await octokit.rest.pulls.listCommits({
                    owner,
                    repo,
                    pull_number: pr.number,
                });
                for (const commit of commits.data) {
                    const commitLink = terminalLink(
                        commit.sha.substring(0, 7),
                        `https://github.com/${owner}/${repo}/commit/${commit.sha}`
                    );
                    console.log(`  - ${c.blueBright(commitLink)} ${commit.commit.message.split('\n')[0]}`);
                }
            } else {
                console.log(c.grey(`🔘 ${prLink} ${pr.title}`),
                    c.green.dim(`+${added}`),
                    c.red.dim(`-${deleted}`),
                    isFirstPR ?
                        c.bold(`(@${pr.user?.login} 🆕)`) :
                        c.grey(`(@${pr.user?.login})`)
                );
            }
        }
    };
}

listCommits();