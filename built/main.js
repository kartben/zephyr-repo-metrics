#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const simple_git_1 = require("simple-git");
const moment_1 = __importDefault(require("moment"));
const promises_1 = require("node:fs/promises");
const cli_progress_1 = require("cli-progress");
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const fs_1 = __importDefault(require("fs"));
const snippets = __importStar(require("./snippets"));
const projects_1 = require("./projects");
const DATES = [];
let startingMoment = (0, moment_1.default)().subtract(10, 'year').endOf('month');
const beginningOfCurrentMonth = (0, moment_1.default)().startOf('month');
while (startingMoment.isBefore(beginningOfCurrentMonth)) {
    DATES.push(startingMoment.format('YYYY-MM-DD'));
    startingMoment.add(1, 'month').endOf('month');
}
const multibar = new cli_progress_1.MultiBar({
    //clearOnComplete: true,
    stopOnComplete: true,
    hideCursor: true,
    format: '{project} |' + ansi_colors_1.default.cyan('{bar}') + '| {percentage}% | ETA: {eta}s | {stage}',
    // support non-TTY environments (ex. Github Actions)
    noTTYOutput: true,
    notTTYSchedule: 5000,
}, cli_progress_1.Presets.rect);
function computeStats(project, progressBar) {
    return __awaiter(this, void 0, void 0, function* () {
        let results = {};
        let repoPath = './repos/' + project.name;
        let repo;
        let git = (0, simple_git_1.simpleGit)({
            progress({ method, stage, progress }) {
                if ((method === 'clone')) {
                    progressBar.update(progress, { stage: `Git ${method}: ${stage} ${progress}%` });
                }
                else {
                    progressBar.update({ stage: `Git ${method}: ${stage}` });
                }
            }
        });
        try {
            yield (0, promises_1.access)(repoPath, promises_1.constants.R_OK | promises_1.constants.W_OK);
            // repo already exists, only fetch updates.
            repo = git.cwd(repoPath);
            repo.fetch('origin');
        }
        catch (_a) {
            let currentTotal = progressBar.getTotal();
            progressBar.setTotal(currentTotal + 100);
            repo = git.clone(project.url, repoPath).cwd({ path: repoPath });
        }
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
                promises = project.snippets.map((snippet) => snippet.fn(repo, { prevSHA1: prevSHA1, moment: (0, moment_1.default)(date) }));
                prevSHA1 = sha1;
            }
            catch (e) {
                //            console.log(`** ${date} -- ${project.name}. Skipping... **`)
                promises = project.snippets.map((snippet) => snippets.NULL_FUNCTION());
            }
            // Execute all the snippets in parallel
            let res = yield Promise.all(promises);
            res.forEach((r, i) => {
                results[project.snippets[i].name].push({ date: new Date(date), result: res[i] });
            });
            progressBar.increment({ stage: `${date}` });
        }
        progressBar.update({ stage: `✅` });
        return results;
    });
}
if (!fs_1.default.existsSync('stats')) {
    fs_1.default.mkdirSync('stats');
}
fs_1.default.writeFileSync(`stats/all.csv`, `project,date,${projects_1.projects[0].snippets.map(s => s.name).join(',')}\n`);
for (let project of projects_1.projects.sort((a, b) => a.name.localeCompare(b.name))) {
    let progressBar = multibar.create(DATES.length, 0, { project: project.name.padStart(18), stage: 'Starting…' }, { stopOnComplete: true });
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
    }).catch((err) => {
        console.error(err);
    });
}
//# sourceMappingURL=main.js.map