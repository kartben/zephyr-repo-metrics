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
var exec = require('child-process-promise').exec;
const DATES = [];
let stats = new Map();
//let m = moment("2019-01-31");
let m = (0, moment_1.default)("2020-10-31");
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
        return exec('cloc /tmp/repos/zephyr').then((res) => { return res.stdout; });
    });
}
function computeStats() {
    return __awaiter(this, void 0, void 0, function* () {
        //cloneRepo('zephyr', 'https://github.com/zephyrproject-rtos/zephyr', '/tmp/repos/zephyr')
        const zephyrRepo = git.clone('/tmp/zephyr-bare', '/tmp/repos/zephyr')
            .cwd({ path: '/tmp/repos/zephyr' });
        for (const date of DATES) {
            console.log(date);
            let rev = yield zephyrRepo.raw(['rev-list', 'main', '-n', '1', '--first-parent', '--before=' + date]);
            let sha1 = yield zephyrRepo.checkout([rev.trim()]).revparse(['HEAD']);
            console.log('Repo now at ' + sha1);
            // Execute all the hooks in parallel
            const promises = [countDrivers(), countSamples(), countBoards(), cloc()];
            let res = yield Promise.all(promises);
            stats.set(new Date(date), new Map([
                ['drivers', res[0]],
                ['samples', res[1]],
                ['boards', res[2]],
                ['cloc', res[3]]
            ]));
        }
    });
}
computeStats().then(() => {
    console.log('Done!');
    console.log(stats);
}).catch((err) => {
    console.error(err);
});
//# sourceMappingURL=main.js.map