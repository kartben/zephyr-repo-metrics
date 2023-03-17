#!/usr/bin/env node
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
//import csv from 'csv';
const simple_git_1 = require("simple-git");
const moment_1 = __importDefault(require("moment"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = require("node:fs/promises");
var exec = require('child-process-promise').exec;
const DATES = [];
//let m = moment("2019-01-31");
let m = (0, moment_1.default)().subtract(2, 'month').startOf('month');
const beginningOfCurrentMonth = (0, moment_1.default)().startOf('month');
while (m.isBefore(beginningOfCurrentMonth)) {
    DATES.push(m.format('YYYY-MM-DD'));
    m.add(1, 'month').endOf('month');
}
function countFoldersInSubFolder(repo, subfolder) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`find ${workingDir}${subfolder} -type d -maxdepth 1 | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function countFileByNameInFolder(repo, subfolder, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`find ${workingDir}${subfolder} -name ${fileName} | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function getCountFoldersInSubFolderFn(subfolder) {
    return (repo) => __awaiter(this, void 0, void 0, function* () {
        return countFoldersInSubFolder(repo, subfolder);
    });
}
function getCountFileByNameInFolderFn(subfolder, fileName) {
    return (repo) => __awaiter(this, void 0, void 0, function* () {
        return countFileByNameInFolder(repo, subfolder, fileName);
    });
}
function countZephyrDrivers(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`find ${workingDir}/dts/bindings/sensor -type f | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function countZephyrSamples(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`find ${workingDir}/samples -type f | grep sample.yaml | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function countZephyrBoards(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`find ${workingDir}/boards -type f | grep /board.cmake | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function cloc(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`cloc ${workingDir} --json --quiet`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function numberOfCommits(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        return repo.raw(['rev-list', 'HEAD', '--count', '--first-parent']).then((x) => { return parseInt(x); });
    });
}
function computeStats(repoName, repoURL, branchName = 'main', snippets) {
    return __awaiter(this, void 0, void 0, function* () {
        let results = {};
        let repoPath = './repos/' + repoName;
        let repo;
        let git = (0, simple_git_1.simpleGit)({
            progress({ method, stage, progress }) {
                //   console.log(`git.${method} ${stage} stage ${progress}% complete`);
            }
        });
        try {
            yield (0, promises_1.access)(repoPath, promises_1.constants.R_OK | promises_1.constants.W_OK);
            console.log(`Repo ${repoURL} exists. Fetching updates...`);
            repo = git.cwd(repoPath);
            repo.fetch('origin');
        }
        catch (_a) {
            console.log(`Repo ${repoURL} does not exist. Cloning...`);
            repo = git.clone(repoURL, repoPath).cwd({ path: repoPath });
        }
        // const zephyrRepo: SimpleGit = git.clone('/tmp/zephyr-bare', '/tmp/repos/zephyr')
        //     .cwd({ path: '/tmp/repos/zephyr' })
        snippets.forEach((snippet) => {
            results[snippet.name] = [];
        });
        let promises;
        for (const date of DATES) {
            console.log(`Checking out ${date} for repo ${repoName}...`);
            try {
                let rev = yield repo.raw(['rev-list', branchName, '-n', '1', '--first-parent', '--before=' + date]);
                let sha1 = yield repo.checkout([rev.trim(), '-f']).revparse(['HEAD']);
                //console.log('Repo now at ' + sha1);
                promises = snippets.map((snippet) => snippet.fn(repo));
            }
            catch (e) {
                console.log(`** ${date} -- ${repoName}. Skipping... **`);
                let a = function () {
                    return __awaiter(this, void 0, void 0, function* () { return null; });
                };
                promises = snippets.map((snippet) => a());
            }
            //console.log(promises);
            // Execute all the hooks in parallel
            let res = yield Promise.all(promises);
            res.forEach((r, i) => {
                results[snippets[i].name].push({ date: new Date(date), result: res[i] });
            });
            // stats.set(new Date(date),
            //     new Map([
            //         ['drivers', res[0]],
            //         ['samples', res[1]],
            //         ['boards', res[2]],
            //         ['cloc', JSON.parse(res[3])]
            //     ]));
        }
        return results;
    });
}
function replacer(_key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    }
    else {
        return value;
    }
}
let projects = [
    {
        name: 'zephyr',
        url: 'https://github.com/zephyrproject-rtos/zephyr',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: countZephyrDrivers },
            { name: 'samples', fn: countZephyrSamples },
            { name: 'boards', fn: countZephyrBoards },
            //    { name: 'cloc', fn: cloc },
            { name: 'numberOfCommits', fn: numberOfCommits }
        ]
    },
    {
        name: 'freertos',
        url: 'https://github.com/FreeRTOS/FreeRTOS',
        branch: 'main',
        snippets: [
            { name: 'numberOfCommits', fn: numberOfCommits }
        ]
    },
    {
        name: 'nuttx',
        url: 'https://github.com/apache/nuttx',
        branch: 'master',
        snippets: [
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'boards', fn: getCountFileByNameInFolderFn("/boards", "Kconfig") },
        ]
    },
    {
        name: 'riot',
        url: 'https://github.com/RIOT-OS/RIOT',
        branch: 'master',
        snippets: [
            { name: 'boards', fn: getCountFoldersInSubFolderFn("/boards") },
            { name: 'drivers', fn: getCountFoldersInSubFolderFn("/drivers") },
            { name: 'samples', fn: getCountFoldersInSubFolderFn("/examples") },
            { name: 'numberOfCommits', fn: numberOfCommits }
        ]
    },
    {
        name: 'threadx',
        url: 'https://github.com/azure-rtos/threadx',
        branch: 'master',
        snippets: [
            { name: 'numberOfCommits', fn: numberOfCommits }
        ]
    },
    {
        name: 'mynewt',
        url: 'https://github.com/apache/mynewt-core',
        branch: 'master',
        snippets: [
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'samples', fn: getCountFoldersInSubFolderFn("/apps") },
        ]
    },
    {
        name: 'rt-thread',
        url: 'https://github.com/RT-Thread/rt-thread',
        branch: 'master',
        snippets: [
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'boards', fn: getCountFileByNameInFolderFn("/bsp", "board.c") },
        ]
    },
];
for (let project of projects) {
    computeStats(project.name, project.url, project.branch, project.snippets).then((results) => {
        console.log(`Stats for ${project.name} computed.`);
        // save stats as json file
        Object.entries(results).forEach(([key, value]) => {
            fs_1.default.writeFileSync(`stats/${project.name}-${key}.json`, JSON.stringify(value));
        });
        console.log(`Creating CSV file for ${project.name}...`);
        fs_1.default.writeFileSync(`stats/${project.name}.csv`, `date,${project.snippets.map(s => s.name).join(',')}\n`);
        let idx = 0;
        for (const date of DATES) {
            console.log(`Processing ${date}...`);
            fs_1.default.appendFileSync(`stats/${project.name}.csv`, `${date},${project.snippets.map(s => results[s.name][idx].result).join(',')}\n`);
            idx++;
        }
    }).catch((err) => {
        console.error(err);
    });
}
//# sourceMappingURL=main.js.map