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
const chalk_1 = __importDefault(require("chalk"));
const terminal_link_1 = __importDefault(require("terminal-link"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const parse_diff_1 = __importDefault(require("parse-diff"));
const BLOG_URL = 'https://blog.benjamin-cabe.com';
const TAG = 529; //'zephyr-weekly-update';
function getMostRecentPostDate(tag) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiUrl = `${BLOG_URL}/wp-json/wp/v2/posts?tags=${tag}&per_page=1&_fields=date_gmt`;
        console.log(apiUrl);
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
const octokit = new rest_1.Octokit({
    auth: GITHUB_API_TOKEN
});
const owner = 'zephyrproject-rtos';
const repo = 'zephyr';
const SHOW_COMMIT_DETAILS = true;
function listCommits() {
    var _a;
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
        // List pull request numbers, titles and links
        for (const pr of searchResult) {
            // Fetch the diff corresponding to the pull request
            const diffUrl = (_a = pr.pull_request) === null || _a === void 0 ? void 0 : _a.diff_url;
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
                const prLink = (0, terminal_link_1.default)(`#${pr.number}`, `https://github.com/${owner}/${repo}/pull/${pr.number}`);
                if (((added - deleted) > 100) ||
                    ((deleted - added) > 50) ||
                    (added >= 30 && deleted < 5) ||
                    added > 150 ||
                    deleted > 150) {
                    let specialFlag = '🔘';
                    if (['fix', 'bug'].some((keyword) => pr.title.toLowerCase().includes(keyword))) {
                        specialFlag = '🪳';
                    }
                    else if (added - deleted > 300) {
                        specialFlag = '🚀';
                    }
                    else if (added > 300) {
                        specialFlag = '⚙️';
                    }
                    console.log(chalk_1.default.green(`${specialFlag} ${prLink}`, `${pr.title}`), chalk_1.default.green(`+${added}`), chalk_1.default.red(`-${deleted}`));
                    // list all commits in the pull request
                    const commits = yield octokit.rest.pulls.listCommits({
                        owner,
                        repo,
                        pull_number: pr.number,
                    });
                    for (const commit of commits.data) {
                        const commitLink = (0, terminal_link_1.default)(commit.sha.substring(0, 7), `https://github.com/${owner}/${repo}/commit/${commit.sha}`);
                        console.log(`  - ${chalk_1.default.blueBright(commitLink)} ${commit.commit.message.split('\n')[0]}`);
                    }
                }
                else {
                    console.log(chalk_1.default.grey(`🔘 ${prLink}`, `${pr.title}`), chalk_1.default.green.dim(`+${added}`), chalk_1.default.red.dim(`-${deleted}`));
                }
            }
        }
        ;
    });
}
listCommits();
//# sourceMappingURL=zephyr-noteworthy-commits.js.map