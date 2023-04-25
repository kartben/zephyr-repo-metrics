#!/usr/bin/env node
import { SimpleGit, simpleGit } from 'simple-git';
import moment from 'moment';
import { access, constants } from 'node:fs/promises';
import { MultiBar, Presets, SingleBar } from 'cli-progress';
import ansiColors from 'ansi-colors';
import { exec } from 'child-process-promise';
import fs, { writeFileSync, appendFileSync, mkdirSync } from 'fs';

import { IAnalyticsSnippet, IProject, IResults } from './interfaces';
import * as snippets from './snippets';
import { projects } from './projects';

const DATES: string[] = [];

let startingMoment = moment().subtract(10, 'year').endOf('month');
const beginningOfCurrentMonth = moment().startOf('month');

while (startingMoment.isBefore(beginningOfCurrentMonth)) {
    DATES.push(startingMoment.format('YYYY-MM-DD'));
    startingMoment.add(1, 'month').endOf('month');
}
// add "today" to also compute stats for the past 30 days
DATES.push(moment().format('YYYY-MM-DD'));

const multibar = new MultiBar({
    //clearOnComplete: true,
    stopOnComplete: true,
    hideCursor: true,
    format: '{project} |' + ansiColors.cyan('{bar}') + '| {percentage}% | ETA: {eta}s | {stage}',

    // support non-TTY environments (ex. Github Actions)
    noTTYOutput: true, 
    notTTYSchedule: 5000,
}, Presets.rect);

async function computeStats(project: IProject, progressBar: SingleBar) {
    let results: IResults = {}

    let repoPath = './repos/' + project.name;
    let repo: SimpleGit;

    let git = simpleGit({
        progress({ method, stage, progress }) {
            if ((method === 'clone')) {
                progressBar.update(progress, { stage: `Git ${method}: ${stage} ${progress}%` });
            } else {
                progressBar.update({ stage: `Git ${method}: ${stage}` });
            }
        }
    });

    try {
        await access(repoPath, constants.R_OK | constants.W_OK);
        // repo already exists, only fetch updates.
        repo = git.cwd(repoPath);
        repo.fetch('origin');
    } catch {
        let currentTotal = progressBar.getTotal();
        progressBar.setTotal(currentTotal + 100);
        repo = git.clone(project.url, repoPath).cwd({ path: repoPath });
    }

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
            promises = project.snippets.map((snippet: IAnalyticsSnippet) => snippet.fn(repo, { prevSHA1: prevSHA1, moment: moment(date) }));
            prevSHA1 = sha1;
        }
        catch (e) {
            //            console.log(`** ${date} -- ${project.name}. Skipping... **`)
            promises = project.snippets.map((snippet: IAnalyticsSnippet) => snippets.NULL_FUNCTION());
        }

        // Execute all the snippets in parallel
        let res = await Promise.all(promises)
        res.forEach((r, i) => {
            results[project.snippets[i].name].push({ date: new Date(date), result: res[i] });
        })

        progressBar.increment({stage: `${date}`});
    }
    progressBar.update(progressBar.getTotal(), {stage: `✅`});
    return results;
}


if (!fs.existsSync('stats')) {
    fs.mkdirSync('stats');
}
fs.writeFileSync(`stats/all.csv`, `project,date,${projects[0].snippets.map(s => s.name).join(',')}\n`);

for (let project of projects.sort((a, b) => a.name.localeCompare(b.name))) {
    let progressBar = multibar.create(DATES.length, 0, { project: project.name.padStart(18), stage: 'Starting…' }, {stopOnComplete: true});

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

    }).catch((err) => {
        console.error(err);
    });
}


