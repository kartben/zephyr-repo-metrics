#!/usr/bin/env node
//import csv from 'csv';
import { simpleGit, SimpleGit, ResetMode } from 'simple-git';
import moment from 'moment';
import fs from 'fs';
var exec = require('child-process-promise').exec;

const DATES: string[] = [];
let stats: Map<Date, Map<string, string>> = new Map();

//let m = moment("2019-01-31");
let m = moment("2020-10-31");
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

async function cloc() {
    return exec('cloc /tmp/repos/zephyr').then((res: any) => { return res.stdout });
}


async function computeStats() {
    //cloneRepo('zephyr', 'https://github.com/zephyrproject-rtos/zephyr', '/tmp/repos/zephyr')
    const zephyrRepo: SimpleGit = git.clone('/tmp/zephyr-bare', '/tmp/repos/zephyr')
        .cwd({ path: '/tmp/repos/zephyr' })

    for (const date of DATES) {
        console.log(date)
        let rev: string = await zephyrRepo.raw(['rev-list', 'main', '-n', '1', '--first-parent', '--before=' + date])
        let sha1: string = await zephyrRepo.checkout([rev.trim()]).revparse(['HEAD']);
        console.log('Repo now at ' + sha1);

        // Execute all the hooks in parallel
        const promises = [countDrivers(), countSamples(), countBoards(), cloc()];
        let res = await Promise.all(promises)
        stats.set(new Date(date),
            new Map([
                ['drivers', res[0]],
                ['samples', res[1]],
                ['boards', res[2]],
                ['cloc', res[3]]
            ]));

    }
}

computeStats().then(() => {
    console.log('Done!');
    console.log(stats);
}).catch((err) => {
    console.error(err);
});