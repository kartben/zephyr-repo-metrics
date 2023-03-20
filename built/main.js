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
const cli_progress_1 = require("cli-progress");
const ansi_colors_1 = __importDefault(require("ansi-colors"));
var exec = require('child-process-promise').exec;
const DATES = [];
//let m = moment("2019-01-31");
let m = (0, moment_1.default)().subtract(10, 'year').endOf('month');
const beginningOfCurrentMonth = (0, moment_1.default)().startOf('month');
while (m.isBefore(beginningOfCurrentMonth)) {
    DATES.push(m.format('YYYY-MM-DD'));
    m.add(1, 'month').endOf('month');
}
const multibar = new cli_progress_1.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '{project} |' + ansi_colors_1.default.cyan('{bar}') + '| {percentage}% | ETA: {eta}s',
}, cli_progress_1.Presets.rect);
function countNuttXDrivers(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`grep "CONFIG_SENSORS_.*" ${workingDir}/drivers/sensors/Make.defs | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function countFoldersInSubFolder(repo, subfolder) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`find '${workingDir}${subfolder}' -type d -maxdepth 1 | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function countFileByNameInFolder(repo, subfolder, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`find '${workingDir}${subfolder}' -name ${fileName} | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
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
        return exec(`find '${workingDir}/dts/bindings/sensor' -type f | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function countZephyrSamples(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`find '${workingDir}/samples' -type f | grep sample.yaml | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function countZephyrBoards(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`find '${workingDir}/boards' -type f | grep /board.cmake | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function cloc(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return exec(`cloc '${workingDir}' --json --quiet`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
function numberOfCommits(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        return repo.raw(['rev-list', 'HEAD', '--count', '--first-parent']).then((x) => { return parseInt(x); });
    });
}
function numberOfUniqueContributorsPastMonth(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let revRange = context.prevSHA1 ? `${context.prevSHA1}..HEAD` : 'HEAD';
        return repo.raw(['shortlog', '-sn', revRange]).then((x) => { return x.split(/\n/).length; });
    });
}
function NULL_FUNCTION() {
    return __awaiter(this, void 0, void 0, function* () { return null; });
}
function computeStats(project, progressBar) {
    return __awaiter(this, void 0, void 0, function* () {
        let results = {};
        let repoPath = './repos/' + project.name;
        let repo;
        let git = (0, simple_git_1.simpleGit)({
            progress({ method, stage, progress }) {
                //   console.log(`git.${method} ${stage} stage ${progress}% complete`);
            }
        });
        try {
            yield (0, promises_1.access)(repoPath, promises_1.constants.R_OK | promises_1.constants.W_OK);
            // repo already exists, fetch updates.
            repo = git.cwd(repoPath);
            repo.fetch('origin');
        }
        catch (_a) {
            repo = git.clone(project.url, repoPath).cwd({ path: repoPath });
        }
        // const zephyrRepo: SimpleGit = git.clone('/tmp/zephyr-bare', '/tmp/repos/zephyr')
        //     .cwd({ path: '/tmp/repos/zephyr' })
        project.snippets.forEach((snippet) => {
            results[snippet.name] = [];
        });
        let promises;
        let prevSHA1 = null;
        for (const date of DATES) {
            //        console.log(`Checking out ${date} for repo ${project.name}...`)
            try {
                let rev = yield repo.raw(['rev-list', project.branch, '-n', '1', '--first-parent', '--before=' + date]);
                let sha1 = yield repo.checkout([rev.trim(), '-f']).revparse(['HEAD']);
                promises = project.snippets.map((snippet) => snippet.fn(repo, { prevSHA1: prevSHA1 }));
                prevSHA1 = sha1;
            }
            catch (e) {
                //            console.log(`** ${date} -- ${project.name}. Skipping... **`)
                promises = project.snippets.map((snippet) => NULL_FUNCTION());
            }
            // Execute all the snippets in parallel
            let res = yield Promise.all(promises);
            res.forEach((r, i) => {
                results[project.snippets[i].name].push({ date: new Date(date), result: res[i] });
            });
            progressBar.increment();
        }
        return results;
    });
}
let projects = [
    {
        name: 'Zephyr',
        url: 'https://github.com/zephyrproject-rtos/zephyr',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: countZephyrDrivers },
            { name: 'samples', fn: countZephyrSamples },
            { name: 'boards', fn: countZephyrBoards },
            //    { name: 'cloc', fn: cloc },
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'numberOfUniqueContributorsPastMonth', fn: numberOfUniqueContributorsPastMonth },
        ]
    },
    {
        name: 'FreeRTOS',
        url: 'https://github.com/FreeRTOS/FreeRTOS',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: NULL_FUNCTION },
            { name: 'samples', fn: NULL_FUNCTION },
            { name: 'boards', fn: NULL_FUNCTION },
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'numberOfUniqueContributorsPastMonth', fn: numberOfUniqueContributorsPastMonth },
        ]
    },
    {
        name: 'Apache NuttX',
        url: 'https://github.com/apache/nuttx',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: countNuttXDrivers },
            { name: 'samples', fn: NULL_FUNCTION },
            { name: 'boards', fn: getCountFileByNameInFolderFn("/boards", "Kconfig") },
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'numberOfUniqueContributorsPastMonth', fn: numberOfUniqueContributorsPastMonth },
        ]
    },
    {
        name: 'RIOT OS',
        url: 'https://github.com/RIOT-OS/RIOT',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: getCountFoldersInSubFolderFn("/drivers") },
            { name: 'samples', fn: getCountFoldersInSubFolderFn("/examples") },
            { name: 'boards', fn: getCountFoldersInSubFolderFn("/boards") },
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'numberOfUniqueContributorsPastMonth', fn: numberOfUniqueContributorsPastMonth },
        ]
    },
    {
        name: 'Azure RTOS ThreadX',
        url: 'https://github.com/azure-rtos/threadx',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: NULL_FUNCTION },
            { name: 'samples', fn: NULL_FUNCTION },
            { name: 'boards', fn: NULL_FUNCTION },
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'numberOfUniqueContributorsPastMonth', fn: numberOfUniqueContributorsPastMonth },
        ]
    },
    {
        name: 'Apache Mynewt',
        url: 'https://github.com/apache/mynewt-core',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: getCountFoldersInSubFolderFn("/hw/drivers/sensors") },
            { name: 'samples', fn: getCountFoldersInSubFolderFn("/apps") },
            { name: 'boards', fn: getCountFoldersInSubFolderFn("/hw/bsp") },
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'numberOfUniqueContributorsPastMonth', fn: numberOfUniqueContributorsPastMonth },
        ]
    },
    {
        name: 'RT-Thread',
        url: 'https://github.com/RT-Thread/rt-thread',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: NULL_FUNCTION },
            { name: 'samples', fn: NULL_FUNCTION },
            { name: 'boards', fn: getCountFileByNameInFolderFn("/bsp", "board.c") },
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'numberOfUniqueContributorsPastMonth', fn: numberOfUniqueContributorsPastMonth },
        ]
    },
    {
        name: 'chibi-os',
        url: 'https://github.com/ChibiOS/ChibiOS',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: NULL_FUNCTION },
            { name: 'samples', fn: NULL_FUNCTION },
            { name: 'boards', fn: getCountFoldersInSubFolderFn('/os/hal/boards') },
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'numberOfUniqueContributorsPastMonth', fn: numberOfUniqueContributorsPastMonth },
        ]
    },
    {
        name: 'Contiki-NG',
        url: 'https://github.com/contiki-ng/contiki-ng',
        branch: 'develop',
        snippets: [
            { name: 'drivers', fn: getCountFoldersInSubFolderFn('/arch/dev/sensors') },
            { name: 'samples', fn: getCountFoldersInSubFolderFn('/examples') },
            { name: 'boards', fn: NULL_FUNCTION },
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'numberOfUniqueContributorsPastMonth', fn: numberOfUniqueContributorsPastMonth },
        ]
    },
    {
        name: 'TizenRT',
        url: 'https://github.com/Samsung/TizenRT',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: NULL_FUNCTION },
            { name: 'samples', fn: NULL_FUNCTION },
            { name: 'boards', fn: NULL_FUNCTION },
            { name: 'numberOfCommits', fn: numberOfCommits },
            { name: 'numberOfUniqueContributorsPastMonth', fn: numberOfUniqueContributorsPastMonth },
        ]
    },
];
fs_1.default.writeFileSync(`stats/all.csv`, `project,date,${projects[0].snippets.map(s => s.name).join(',')}\n`);
for (let project of projects) {
    let progressBar = multibar.create(DATES.length, 0, { project: project.name.padStart(18) });
    computeStats(project, progressBar).then((results) => {
        // save stats as json file
        Object.entries(results).forEach(([key, value]) => {
            fs_1.default.writeFileSync(`stats/${project.name}-${key}.json`, JSON.stringify(value));
        });
        fs_1.default.writeFileSync(`stats/${project.name}.csv`, `date,${project.snippets.map(s => s.name).join(',')}\n`);
        let idx = 0;
        for (const date of DATES) {
            fs_1.default.appendFileSync(`stats/${project.name}.csv`, `${date},${project.snippets.map(s => results[s.name][idx].result).join(',')}\n`);
            fs_1.default.appendFileSync(`stats/all.csv`, `${project.name},${date},${project.snippets.map(s => results[s.name][idx].result).join(',')}\n`);
            idx++;
        }
        progressBar.stop();
    }).catch((err) => {
        console.error(err);
    });
}
//# sourceMappingURL=main.js.map