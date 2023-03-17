#!/usr/bin/env node
//import csv from 'csv';
import { simpleGit, SimpleGit, ResetMode } from 'simple-git';
import moment from 'moment';
import fs from 'fs';
import { access, constants } from 'node:fs/promises';
import { worker } from 'cluster';

var exec = require('child-process-promise').exec;

const DATES: string[] = [];


interface IAnalyticsSnippet {
    name: string;
    fn(repo: SimpleGit): Promise<string | Number | null>;
}

interface IResult {
    date: Date;
    result: string | Number | null
}

interface IResults {
    [key: string]: IResult[]
}


//let m = moment("2019-01-31");
let m = moment().subtract(2, 'month').startOf('month');
const beginningOfCurrentMonth = moment().startOf('month');

while (m.isBefore(beginningOfCurrentMonth)) {
    DATES.push(m.format('YYYY-MM-DD'));
    m.add(1, 'month').endOf('month');
}

async function countFoldersInSubFolder(repo: SimpleGit, subfolder: string): Promise<string> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find ${workingDir}${subfolder} -type d -maxdepth 1 | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countFileByNameInFolder(repo: SimpleGit, subfolder: string, fileName: string): Promise<string> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find ${workingDir}${subfolder} -name ${fileName} | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
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
    return exec(`find ${workingDir}/dts/bindings/sensor -type f | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countZephyrSamples(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find ${workingDir}/samples -type f | grep sample.yaml | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countZephyrBoards(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find ${workingDir}/boards -type f | grep /board.cmake | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function cloc(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`cloc ${workingDir} --json --quiet`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function numberOfCommits(repo: SimpleGit): Promise<Number> {
    return repo.raw(['rev-list', 'HEAD', '--count', '--first-parent']).then((x) => { return parseInt(x) });
}




async function computeStats(repoName: string, repoURL: string, branchName: string = 'main', snippets: IAnalyticsSnippet[]) {
    let results: IResults = {}

    let repoPath = './repos/' + repoName;
    let repo: SimpleGit;

    let git = simpleGit({
        progress({ method, stage, progress }) {
            //   console.log(`git.${method} ${stage} stage ${progress}% complete`);
        }
    });

    try {
        await access(repoPath, constants.R_OK | constants.W_OK);
        console.log(`Repo ${repoURL} exists. Fetching updates...`)
        repo = git.cwd(repoPath);
        repo.fetch('origin');
    } catch {
        console.log(`Repo ${repoURL} does not exist. Cloning...`)
        repo = git.clone(repoURL, repoPath).cwd({ path: repoPath });
    }


    // const zephyrRepo: SimpleGit = git.clone('/tmp/zephyr-bare', '/tmp/repos/zephyr')
    //     .cwd({ path: '/tmp/repos/zephyr' })

    snippets.forEach((snippet: IAnalyticsSnippet) => {
        results[snippet.name] = [];
    });

    let promises: Promise<string | Number | null>[];
    for (const date of DATES) {
        console.log(`Checking out ${date} for repo ${repoName}...`)
        try {
            let rev: string = await repo.raw(['rev-list', branchName, '-n', '1', '--first-parent', '--before=' + date])
            let sha1: string = await repo.checkout([rev.trim(), '-f']).revparse(['HEAD']);
            //console.log('Repo now at ' + sha1);
            promises = snippets.map((snippet: IAnalyticsSnippet) => snippet.fn(repo));
        }
        catch (e) {
            console.log(`** ${date} -- ${repoName}. Skipping... **`)
            let a = async function () { return null }
            promises = snippets.map((snippet: IAnalyticsSnippet) => a());
        }
        //console.log(promises);

        // Execute all the hooks in parallel
        let res = await Promise.all(promises)
        res.forEach((r, i) => {
            results[snippets[i].name].push({ date: new Date(date), result: res[i] });
        })

        // stats.set(new Date(date),
        //     new Map([
        //         ['drivers', res[0]],
        //         ['samples', res[1]],
        //         ['boards', res[2]],
        //         ['cloc', JSON.parse(res[3])]
        //     ]));

    }
    return results;
}

function replacer(_key: any, value: any) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
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
]


for (let project of projects) {
    computeStats(project.name, project.url, project.branch, project.snippets).then((results) => {
        console.log(`Stats for ${project.name} computed.`);
        // save stats as json file
        Object.entries(results).forEach(([key, value]) => {
            fs.writeFileSync(`stats/${project.name}-${key}.json`, JSON.stringify(value));
        });

        console.log(`Creating CSV file for ${project.name}...`)
        fs.writeFileSync(`stats/${project.name}.csv`, `date,${project.snippets.map(s => s.name).join(',')}\n`);
        let idx = 0;
        for (const date of DATES) {
            console.log(`Processing ${date}...`)
            fs.appendFileSync(`stats/${project.name}.csv`, `${date},${project.snippets.map(s => results[s.name][idx].result).join(',')}\n`);
            idx++;
        }



    }).catch((err) => {
        console.error(err);
    });
}


