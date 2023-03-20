#!/usr/bin/env node
//import csv from 'csv';
import { simpleGit, SimpleGit, ResetMode } from 'simple-git';
import moment from 'moment';
import fs from 'fs';
import { access, constants } from 'node:fs/promises';
import { Presets, MultiBar, SingleBar } from 'cli-progress';
import ansiColors from 'ansi-colors';

var exec = require('child-process-promise').exec;

const DATES: string[] = [];

interface IAnalyticsSnippetContext {
    prevSHA1: string | null;
}

interface IAnalyticsSnippet {
    name: string;
    fn(repo: SimpleGit, context?: IAnalyticsSnippetContext): Promise<string | Number | null>;
}

interface IResult {
    date: Date;
    result: string | Number | null
}

interface IResults {
    [key: string]: IResult[]
}

interface IProject {
    name: string;
    url: string;
    branch: string;
    snippets: IAnalyticsSnippet[];
}


//let m = moment("2019-01-31");
let m = moment().subtract(10, 'year').endOf('month');
const beginningOfCurrentMonth = moment().startOf('month');

while (m.isBefore(beginningOfCurrentMonth)) {
    DATES.push(m.format('YYYY-MM-DD'));
    m.add(1, 'month').endOf('month');
}


const multibar = new MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '{project} |' + ansiColors.cyan('{bar}') + '| {percentage}% | ETA: {eta}s',
}, Presets.rect);

async function countNuttXDrivers(repo: SimpleGit): Promise<string> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`grep "CONFIG_SENSORS_.*" ${workingDir}/drivers/sensors/Make.defs | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countFoldersInSubFolder(repo: SimpleGit, subfolder: string): Promise<string> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}${subfolder}' -type d -maxdepth 1 | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countFileByNameInFolder(repo: SimpleGit, subfolder: string, fileName: string): Promise<string> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}${subfolder}' -name ${fileName} | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

function getCountFoldersInSubFolderFn(subfolder: string) {
    return async (repo: SimpleGit) => {
        return countFoldersInSubFolder(repo, subfolder);
    }
}

function getCountFileByNameInFolderFn(subfolder: string, fileName: string) {
    return async (repo: SimpleGit) => {
        return countFileByNameInFolder(repo, subfolder, fileName);
    }
}

async function countZephyrDrivers(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}/dts/bindings/sensor' -type f | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countZephyrSamples(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}/samples' -type f | grep sample.yaml | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countZephyrBoards(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}/boards' -type f | grep /board.cmake | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function cloc(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`cloc '${workingDir}' --json --quiet`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function numberOfCommits(repo: SimpleGit): Promise<Number> {
    return repo.raw(['rev-list', 'HEAD', '--count', '--first-parent']).then((x) => { return parseInt(x) });
}

async function numberOfUniqueContributorsPastMonth(repo: SimpleGit, context: IAnalyticsSnippetContext): Promise<Number> {
    let revRange: string = context.prevSHA1 ? `${context.prevSHA1}..HEAD` : 'HEAD';
    return repo.raw(['shortlog', '-sn', revRange]).then((x) => { return x.split(/\n/).length });
}

async function NULL_FUNCTION() { return null }



async function computeStats(project: IProject, progressBar: SingleBar) {
    let results: IResults = {}

    let repoPath = './repos/' + project.name;
    let repo: SimpleGit;

    let git = simpleGit({
        progress({ method, stage, progress }) {
            //   console.log(`git.${method} ${stage} stage ${progress}% complete`);
        }
    });

    try {
        await access(repoPath, constants.R_OK | constants.W_OK);
        // repo already exists, fetch updates.
        repo = git.cwd(repoPath);
        repo.fetch('origin');
    } catch {
        repo = git.clone(project.url, repoPath).cwd({ path: repoPath });
    }


    // const zephyrRepo: SimpleGit = git.clone('/tmp/zephyr-bare', '/tmp/repos/zephyr')
    //     .cwd({ path: '/tmp/repos/zephyr' })

    project.snippets.forEach((snippet: IAnalyticsSnippet) => {
        results[snippet.name] = [];
    });

    let promises: Promise<string | Number | null>[];
    let prevSHA1: string | null = null;
    for (const date of DATES) {
        //        console.log(`Checking out ${date} for repo ${project.name}...`)
        try {
            let rev: string = await repo.raw(['rev-list', project.branch, '-n', '1', '--first-parent', '--before=' + date])
            let sha1: string = await repo.checkout([rev.trim(), '-f']).revparse(['HEAD']);
            promises = project.snippets.map((snippet: IAnalyticsSnippet) => snippet.fn(repo, { prevSHA1: prevSHA1 }));
            prevSHA1 = sha1;
        }
        catch (e) {
            //            console.log(`** ${date} -- ${project.name}. Skipping... **`)
            promises = project.snippets.map((snippet: IAnalyticsSnippet) => NULL_FUNCTION());
        }

        // Execute all the snippets in parallel
        let res = await Promise.all(promises)
        res.forEach((r, i) => {
            results[project.snippets[i].name].push({ date: new Date(date), result: res[i] });
        })

        progressBar.increment();


    }
    return results;
}

let projects: IProject[] = [
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



]

if (!fs.existsSync('stats')) {
    fs.mkdirSync('stats');
  }
fs.writeFileSync(`stats/all.csv`, `project,date,${projects[0].snippets.map(s => s.name).join(',')}\n`);

for (let project of projects) {
    let progressBar = multibar.create(DATES.length, 0, { project: project.name.padStart(18) });

    computeStats(project, progressBar).then((results) => {
        // save stats as json file
        Object.entries(results).forEach(([key, value]) => {
            fs.writeFileSync(`stats/${project.name}-${key}.json`, JSON.stringify(value));
        });

        fs.writeFileSync(`stats/${project.name}.csv`, `date,${project.snippets.map(s => s.name).join(',')}\n`);
        let idx = 0;
        for (const date of DATES) {
            fs.appendFileSync(`stats/${project.name}.csv`, `${date},${project.snippets.map(s => results[s.name][idx].result).join(',')}\n`);
            fs.appendFileSync(`stats/all.csv`, `${project.name},${date},${project.snippets.map(s => results[s.name][idx].result).join(',')}\n`);
            idx++;
        }
        progressBar.stop();
    }).catch((err) => {
        console.error(err);
    });
}


