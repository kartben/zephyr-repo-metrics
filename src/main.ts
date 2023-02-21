#!/usr/bin/env node
//import csv from 'csv';
import { simpleGit, SimpleGit, ResetMode } from 'simple-git';
import moment from 'moment';
import fs from 'fs';
var exec = require('child-process-promise').exec;

const DATES: string[] = [];

let m = moment("2019-01-31");
const beginningOfCurrentMonth = moment().startOf('month');

while (m.isBefore(beginningOfCurrentMonth)) {
    DATES.push(m.format('YYYY-MM-DD'));
    m.add(1, 'month').endOf('month');
}

let git = simpleGit({
    progress({ method, stage, progress }) {
        console.log(`git.${method} ${stage} stage ${progress}% complete`);
    }
});


async function countDrivers(): Promise<string> {
    return exec('find /tmp/repos/zephyr/dts/bindings/sensor -type f | wc -l').then((res: any) => { return res.stdout.trim() });
}

async function countSamples(): Promise<string> {
    return exec('find /tmp/repos/zephyr/samples -type f | grep sample.yaml | wc -l').then((res: any) => { return res.stdout.trim() });
}

async function countBoards(): Promise<string> {
    return exec('find /tmp/repos/zephyr/boards -type f | grep /board.cmake | wc -l').then((res: any) => { return res.stdout.trim() });
}

async function cloc(): Promise<string> {
    return exec('cloc /tmp/repos/zephyr --json --quiet').then((res: any) => { return res.stdout });
}


interface IAnalyticsSnippet {
    name: string;
    fn(): Promise<string>;
}

let analyticsSnippets: IAnalyticsSnippet[] = [
    { name: 'drivers', fn: countDrivers },
    { name: 'samples', fn: countSamples },
    { name: 'boards', fn: countBoards },
    { name: 'cloc', fn: cloc }
];

console.log(analyticsSnippets);

interface IResult {
    date: Date;
    result: string
}

interface IResults {
    [key: string]: IResult[]
}

let results: IResults = {}


async function computeStats() {
    //cloneRepo('zephyr', 'https://github.com/zephyrproject-rtos/zephyr', '/tmp/repos/zephyr')
    const zephyrRepo: SimpleGit = git.clone('/tmp/zephyr-bare', '/tmp/repos/zephyr')
        .cwd({ path: '/tmp/repos/zephyr' })

    analyticsSnippets.forEach((snippet: IAnalyticsSnippet) => {
        results[snippet.name] = [];
    });

    for (const date of DATES) {
        console.log(date)
        let rev: string = await zephyrRepo.raw(['rev-list', 'main', '-n', '1', '--first-parent', '--before=' + date])
        let sha1: string = await zephyrRepo.checkout([rev.trim()]).revparse(['HEAD']);
        console.log('Repo now at ' + sha1);

        const promises = analyticsSnippets.map((snippet: IAnalyticsSnippet) => snippet.fn());
        console.log(promises);

        // Execute all the hooks in parallel
        let res = await Promise.all(promises)
        res.forEach((r, i) => {
            results[analyticsSnippets[i].name].push({ date: new Date(date), result: res[i] });
        })

        // stats.set(new Date(date),
        //     new Map([
        //         ['drivers', res[0]],
        //         ['samples', res[1]],
        //         ['boards', res[2]],
        //         ['cloc', JSON.parse(res[3])]
        //     ]));

    }
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

computeStats().then(() => {
    console.log('Done!');
    // save stats as json file
    Object.entries(results).forEach(([key, value]) => {
        fs.writeFileSync(`${key}.json`, JSON.stringify(value));
    });
}).catch((err) => {
    console.error(err);
});