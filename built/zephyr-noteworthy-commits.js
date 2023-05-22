"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@octokit/rest");
const plugin_throttling_1 = require("@octokit/plugin-throttling");
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const terminal_link_1 = __importDefault(require("terminal-link"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const parse_diff_1 = __importDefault(require("parse-diff"));
const BLOG_URL = 'https://blog.benjamin-cabe.com';
const TAG = 529; //'zephyr-weekly-update';
function getMostRecentPostDate(tag) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiUrl = `${BLOG_URL}/wp-json/wp/v2/posts?tags=${tag}&per_page=1&_fields=date_gmt`;
        try {
            const response = yield (0, node_fetch_1.default)(apiUrl);
            const data = yield response.json();
            if (data.length > 0) {
                return data[0].date_gmt;
            }
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
        return null;
    });
}
// get GitHub API token from environment variable
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;
const MyOctokit = rest_1.Octokit.plugin(plugin_throttling_1.throttling);
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
function listCommits() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        const sinceDate = yield getMostRecentPostDate(TAG);
        // Use github search API to get the list of all pull requests merged since the last blog post
        // https://docs.github.com/en/rest/reference/search#search-issues-and-pull-requests
        const query = `repo:${owner}/${repo} is:pr is:merged merged:>${sinceDate}`;
        const searchResult = yield octokit.paginate(octokit.rest.search.issuesAndPullRequests, {
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
        let githubUserToIdentityFromCommitInfo = {};
        // List pull request numbers, titles and links
        for (const pr of searchResult) {
            // check if this PR is author's first merged PR using GH Search API
            // https://docs.github.com/en/rest/reference/search#search-issues-and-pull-requests
            const author = (_a = pr.user) === null || _a === void 0 ? void 0 : _a.login;
            let isFirstPR = false;
            if (author) {
                const query = `repo:${owner}/${repo} is:pr is:merged author:${author} closed:<=${pr.closed_at}`;
                const { status: searchStatus, data: searchResults } = yield octokit.rest.search.issuesAndPullRequests({ q: query });
                if (searchResults.total_count === 1) {
                    firstTimeContributors.push(pr.user);
                    isFirstPR = true;
                }
            }
            // Fetch the diff corresponding to the pull request
            const diffUrl = (_b = pr.pull_request) === null || _b === void 0 ? void 0 : _b.diff_url;
            if (diffUrl) {
                const response = yield (0, node_fetch_1.default)(diffUrl);
                const diff = yield response.text();
                const d = (0, parse_diff_1.default)(diff);
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
                const prLink = (0, terminal_link_1.default)(`#${pr.number}`, `https://github.com/${owner}/${repo}/pull/${pr.number}`);
                if (((added - deleted) > 100) ||
                    ((deleted - added) > 50) ||
                    (added >= 30 && deleted < 5) ||
                    added > 150 ||
                    deleted > 150 ||
                    isFirstPR) {
                    if (added - deleted > 300) {
                        specialFlag = '🚀';
                    }
                    else if (added > 300) {
                        specialFlag = '⚙️';
                    }
                    let highlight = (isFirstPR) ? ansi_colors_1.default.bold : ansi_colors_1.default.reset;
                    console.log([
                        ansi_colors_1.default.green(`${specialFlag} ${prLink} ${pr.title}`),
                        ansi_colors_1.default.green(`+${added}`),
                        ansi_colors_1.default.red(`-${deleted}`),
                        //pr.labels.map((label) => c.bgHex(label.color || '#000').black(label.name)).join(' ')
                        isFirstPR ?
                            ansi_colors_1.default.bold(`(@${(_c = pr.user) === null || _c === void 0 ? void 0 : _c.login} 🆕)`) :
                            `(@${(_d = pr.user) === null || _d === void 0 ? void 0 : _d.login})`
                    ].map(highlight).join(' '));
                    // list all commits in the pull request
                    const commits = yield octokit.rest.pulls.listCommits({
                        owner,
                        repo,
                        pull_number: pr.number,
                    });
                    for (const commit of commits.data) {
                        if (author) {
                            let name = (_e = commit.commit.author) === null || _e === void 0 ? void 0 : _e.name;
                            let email = (_f = commit.commit.author) === null || _f === void 0 ? void 0 : _f.email;
                            if (name && email) {
                                githubUserToIdentityFromCommitInfo[author] = { name: name, email: email };
                            }
                        }
                        const commitLink = (0, terminal_link_1.default)(commit.sha.substring(0, 7), `https://github.com/${owner}/${repo}/commit/${commit.sha}`);
                        console.log(`  - ${ansi_colors_1.default.blueBright(commitLink)} ${commit.commit.message.split('\n')[0]}`);
                    }
                }
                else {
                    console.log(ansi_colors_1.default.grey(`${specialFlag} ${prLink} ${pr.title}`), ansi_colors_1.default.green.dim(`+${added}`), ansi_colors_1.default.red.dim(`-${deleted}`), isFirstPR ?
                        ansi_colors_1.default.bold(`(@${(_g = pr.user) === null || _g === void 0 ? void 0 : _g.login} 🆕)`) :
                        ansi_colors_1.default.grey(`(@${(_h = pr.user) === null || _h === void 0 ? void 0 : _h.login})`));
                }
            }
        }
        ;
        console.log();
        console.log();
        console.log(`The following ${firstTimeContributors.length} contributors had their first pull requet(s) merged on the period:\n`);
        for (const author of firstTimeContributors) {
            if (author) {
                // get more info about the author
                const { data: authorData } = yield octokit.rest.users.getByUsername({
                    username: author.login,
                });
                let authorLink = (0, terminal_link_1.default)('@' + (author === null || author === void 0 ? void 0 : author.login) || '', (author === null || author === void 0 ? void 0 : author.html_url) || '');
                // get author name and email from GitHub, and revert to commit info if not set in Github
                let authorName = authorData.name || (githubUserToIdentityFromCommitInfo[author.login] ? githubUserToIdentityFromCommitInfo[author.login].name : '');
                let authorEmail = authorData.email || (githubUserToIdentityFromCommitInfo[author.login] ? githubUserToIdentityFromCommitInfo[author.login].email : '');
                console.log(`🧑🏼‍💻 ${authorLink} // 🪪  ${authorName} <${authorEmail}>`);
                if (authorData.company)
                    console.log(`   🏢 ${authorData.company}`);
                if (authorData.location)
                    console.log(`   🌍 ${authorData.location}`);
                if (authorData.blog)
                    console.log(`   📝 ${authorData.blog}`);
                if (authorData.twitter_username)
                    console.log(`   🐦 ${authorData.twitter_username}`);
                console.log();
            }
        }
    });
}
listCommits();
//# sourceMappingURL=zephyr-noteworthy-commits.js.map