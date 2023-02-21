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
var exec = require('child-process-promise').exec;
const DATES = [];
let m = (0, moment_1.default)("2019-01-31");
const beginningOfCurrentMonth = (0, moment_1.default)().startOf('month');
while (m.isBefore(beginningOfCurrentMonth)) {
    DATES.push(m.format('YYYY-MM-DD'));
    m.add(1, 'month').endOf('month');
}
let git = (0, simple_git_1.simpleGit)({
    progress({ method, stage, progress }) {
        console.log(`git.${method} ${stage} stage ${progress}% complete`);
    }
});
function countDrivers() {
    return __awaiter(this, void 0, void 0, function* () {
        return exec('find /tmp/repos/zephyr/dts/bindings/sensor -type f | wc -l').then((res) => { return res.stdout.trim(); });
    });
}
function countSamples() {
    return __awaiter(this, void 0, void 0, function* () {
        return exec('find /tmp/repos/zephyr/samples -type f | grep sample.yaml | wc -l').then((res) => { return res.stdout.trim(); });
    });
}
function countBoards() {
    return __awaiter(this, void 0, void 0, function* () {
        return exec('find /tmp/repos/zephyr/boards -type f | grep /board.cmake | wc -l').then((res) => { return res.stdout.trim(); });
    });
}
function cloc() {
    return __awaiter(this, void 0, void 0, function* () {
        return exec('cloc /tmp/repos/zephyr --json --quiet').then((res) => { return res.stdout; });
    });
}
let analyticsSnippets = [
    { name: 'drivers', fn: countDrivers },
    { name: 'samples', fn: countSamples },
    { name: 'boards', fn: countBoards },
    { name: 'cloc', fn: cloc }
];
console.log(analyticsSnippets);
let results = {};
function computeStats() {
    return __awaiter(this, void 0, void 0, function* () {
        //cloneRepo('zephyr', 'https://github.com/zephyrproject-rtos/zephyr', '/tmp/repos/zephyr')
        const zephyrRepo = git.clone('/tmp/zephyr-bare', '/tmp/repos/zephyr')
            .cwd({ path: '/tmp/repos/zephyr' });
        analyticsSnippets.forEach((snippet) => {
            results[snippet.name] = [];
        });
        for (const date of DATES) {
            console.log(date);
            let rev = yield zephyrRepo.raw(['rev-list', 'main', '-n', '1', '--first-parent', '--before=' + date]);
            let sha1 = yield zephyrRepo.checkout([rev.trim()]).revparse(['HEAD']);
            console.log('Repo now at ' + sha1);
            const promises = analyticsSnippets.map((snippet) => snippet.fn());
            console.log(promises);
            // Execute all the hooks in parallel
            let res = yield Promise.all(promises);
            res.forEach((r, i) => {
                results[analyticsSnippets[i].name].push({ date: new Date(date), result: res[i] });
            });
            // stats.set(new Date(date),
            //     new Map([
            //         ['drivers', res[0]],
            //         ['samples', res[1]],
            //         ['boards', res[2]],
            //         ['cloc', JSON.parse(res[3])]
            //     ]));
        }
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
computeStats().then(() => {
    console.log('Done!');
    // save stats as json file
    Object.entries(results).forEach(([key, value]) => {
        fs_1.default.writeFileSync(`${key}.json`, JSON.stringify(value));
    });
}).catch((err) => {
    console.error(err);
});
//# sourceMappingURL=main.js.map