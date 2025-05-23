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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NULL_FUNCTION = exports.numberOfUniqueContributorsPastMonth = exports.numberOfCommitsPastMonth = exports.numberOfCommits = exports.loc = exports.countNuttXDrivers = exports.countNuttXBoards = exports.countFreeRTOSBoards = exports.countZephyrMaintainers = exports.countZephyrBoards = exports.countZephyrSamples = exports.countZephyrDrivers = exports.getCountFileByNameInFolderFn = exports.countFileByNameInFolder = exports.getCountFoldersInSubFolderFn = exports.countFoldersInSubFolder = void 0;
const child_process_promise_1 = require("child-process-promise");
function countFoldersInSubFolder(repo, subfolder) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return (0, child_process_promise_1.exec)(`find '${workingDir}${subfolder}' -type d -maxdepth 1 | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
exports.countFoldersInSubFolder = countFoldersInSubFolder;
function countFileByNameInFolder(repo, subfolder, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return (0, child_process_promise_1.exec)(`find '${workingDir}${subfolder}' -name ${fileName} | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
exports.countFileByNameInFolder = countFileByNameInFolder;
function getCountFoldersInSubFolderFn(subfolder) {
    return (repo) => __awaiter(this, void 0, void 0, function* () {
        return countFoldersInSubFolder(repo, subfolder);
    });
}
exports.getCountFoldersInSubFolderFn = getCountFoldersInSubFolderFn;
function getCountFileByNameInFolderFn(subfolder, fileName) {
    return (repo) => __awaiter(this, void 0, void 0, function* () {
        return countFileByNameInFolder(repo, subfolder, fileName);
    });
}
exports.getCountFileByNameInFolderFn = getCountFileByNameInFolderFn;
// ----------------- //
// Zephyr Snippets   //
// ----------------- //
function countZephyrDrivers(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return (0, child_process_promise_1.exec)(`find '${workingDir}/dts/bindings/sensor' -type f -exec grep "compatible" {} \\; | sort -u | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
exports.countZephyrDrivers = countZephyrDrivers;
function countZephyrSamples(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return (0, child_process_promise_1.exec)(`find '${workingDir}/samples' -type f | grep sample.yaml | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
exports.countZephyrSamples = countZephyrSamples;
function countZephyrBoards(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        if (context.moment.isBefore('2024-03-01T00:00:00.000Z')) {
            // count the number of Kconfig.board files in the boards folder
            return (0, child_process_promise_1.exec)(`find '${workingDir}/boards' -type f -name "Kconfig.board" | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
        }
        else {
            // count the number of unique board names in the board.yml files
            const command = `
        find '${workingDir}/boards' -type f -name 'board.yml' -print0 |
        xargs -0 yq eval-all '.board.name, .boards[].name' -N |
        grep -Ev 'null' |
        wc -l`;
            return (0, child_process_promise_1.exec)(command).then((res) => { return parseInt(res.stdout.trim()); });
        }
    });
}
exports.countZephyrBoards = countZephyrBoards;
function countZephyrMaintainers(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        // if MAINTAINERS file exists, use it and count the unique name/emails in it
        //      format of a matching line is:
        //      M:	Ruud Derwig <Ruud.Derwig@synopsys.com>
        //      M:	Chuck Jordan <Chuck.Jordan@synopsys.com
        // else, if CODEOWNERS files exist and MAINTAINERS.yml does not exist:
        //      count unique github handles in CODEOWNERS file
        // else:
        //      yq '.[] | .maintainers[]' MAINTAINERS.yml | sort | uniq | wc -l
        let cmd = `if [ -f '${workingDir}/MAINTAINERS' ]; then grep -h "^M:" '${workingDir}/MAINTAINERS' | sed "s/^M:\s*//" | sort -u | wc -l; \
               elif [ -f '${workingDir}/CODEOWNERS' ] && [ ! -f '${workingDir}/MAINTAINERS.yml' ]; \
               then grep -h "^[^#]*@" '${workingDir}/CODEOWNERS' | sed "s/.*@//" | sort -u | wc -l; \
               else yq '.[] | .maintainers[]' '${workingDir}/MAINTAINERS.yml' | sort | uniq | wc -l; fi`;
        return (0, child_process_promise_1.exec)(cmd).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
exports.countZephyrMaintainers = countZephyrMaintainers;
// ----------------- //
// FreeRTOS Snippets //
// ----------------- //
function countFreeRTOSBoards(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return (0, child_process_promise_1.exec)(`find '${workingDir}/FreeRTOS/Demo' -type d -maxdepth 1 | sed s/_IAR// | sed s/_GCC// | sed s/_MPLAB// | sed "s/[\_\-]R[SD]K.*//" | sed s/_CrossWorks// | sed "s/_EnvisionKit_.*//" | sed s/_Eclipse// | sed s/_CodeWarrior// | sed s/_Keil// | sed s/_Rowley// | sed s/_AtmelStudio// | sort -u | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
exports.countFreeRTOSBoards = countFreeRTOSBoards;
// ----------------- //
// NuttX Snippets    //
// ----------------- //
function countNuttXBoards(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.moment.isBefore('2019-08-30T00:00:00.000Z')) {
            return getCountFileByNameInFolderFn("/configs", "Kconfig")(repo);
        }
        else {
            return getCountFileByNameInFolderFn("/boards", "Kconfig")(repo);
        }
    });
}
exports.countNuttXBoards = countNuttXBoards;
function countNuttXDrivers(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return (0, child_process_promise_1.exec)(`grep "CONFIG_SENSORS_.*" '${workingDir}/drivers/sensors/Make.defs' | wc -l`).then((res) => { return parseInt(res.stdout.trim()); });
    });
}
exports.countNuttXDrivers = countNuttXDrivers;
function loc(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let workingDir = yield repo.revparse('--show-toplevel');
        return (0, child_process_promise_1.exec)(`scc '${workingDir}' -f json`).then((res) => {
            try {
                let out = JSON.parse(res.stdout);
                const sumOfLines = out.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue.Lines;
                }, 0);
                return sumOfLines;
            }
            catch (_a) {
                return null;
            }
        });
    });
}
exports.loc = loc;
// let loc = NULL_FUNCTION;
/**
 * Returns a string with the before and after arguments for git log/shortlog etc.
 * If the current day is the last day of the month, the after argument will be the last day of the previous month,
 * otherwise it will be exactly 1 month before the current day.
 * @param context The context object
 * @returns before and after arguments for git log/shortlog etc.
 */
function getBeforeAfter(context) {
    let before = `--before=${context.moment.format('YYYY-MM-DD')}`;
    let after;
    if (context.moment.date() == context.moment.daysInMonth()) {
        after = `--after=${context.moment.subtract(1, 'month').endOf('month').format('YYYY-MM-DD')}`;
    }
    else {
        after = `--after=${context.moment.subtract(1, 'month').format('YYYY-MM-DD')}`;
    }
    return { before, after };
}
function numberOfCommits(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        return repo.raw(['rev-list', 'HEAD', '--count', '--first-parent']).then((x) => { return parseInt(x); });
    });
}
exports.numberOfCommits = numberOfCommits;
function numberOfCommitsPastMonth(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let { before, after } = getBeforeAfter(context);
        return repo.raw(['rev-list', 'HEAD', before, after, '--count', '--first-parent']).then((x) => { return parseInt(x); });
    });
}
exports.numberOfCommitsPastMonth = numberOfCommitsPastMonth;
function numberOfUniqueContributorsPastMonth(repo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let { before, after } = getBeforeAfter(context);
        return repo.raw(['shortlog', '-sn', 'HEAD', before, after]).then((x) => { return x.split(/\n/).length; });
    });
}
exports.numberOfUniqueContributorsPastMonth = numberOfUniqueContributorsPastMonth;
function NULL_FUNCTION() {
    return __awaiter(this, void 0, void 0, function* () { return null; });
}
exports.NULL_FUNCTION = NULL_FUNCTION;
//# sourceMappingURL=snippets.js.map