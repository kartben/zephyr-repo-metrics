import { IAnalyticsSnippetContext } from './interfaces';
import { SimpleGit } from 'simple-git';
import { exec } from 'child-process-promise';

async function countFoldersInSubFolder(repo: SimpleGit, subfolder: string): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}${subfolder}' -type d -maxdepth 1 | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countFileByNameInFolder(repo: SimpleGit, subfolder: string, fileName: string): Promise<Number> {
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

// ----------------- //
// Zephyr Snippets   //
// ----------------- //

async function countZephyrDrivers(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}/dts/bindings/sensor' -type f -exec grep "compatible" {} \\; | sort -u | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countZephyrSamples(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}/samples' -type f | grep sample.yaml | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countZephyrBoards(repo: SimpleGit, context: IAnalyticsSnippetContext): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');

    if (context.moment.isBefore('2024-03-01T00:00:00.000Z')) {
        // count the number of Kconfig.board files in the boards folder
        return exec(`find '${workingDir}/boards' -type f -name "Kconfig.board" | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
    } else {
        // count the number of unique board names in the board.yml files
        const command = `
        find '${workingDir}/boards' -type f -name 'board.yml' -print0 |
        xargs -0 yq eval-all '.board.name, .boards[].name' -N |
        grep -Ev 'null' |
        wc -l`;
        return exec(command).then((res: any) => { return parseInt(res.stdout.trim()) });
    }
}

async function countZephyrMaintainers(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');

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

    return exec(cmd).then((res: any) => { return parseInt(res.stdout.trim()) });
}

// ----------------- //
// FreeRTOS Snippets //
// ----------------- //

async function countFreeRTOSBoards(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}/FreeRTOS/Demo' -type d -maxdepth 1 | sed s/_IAR// | sed s/_GCC// | sed s/_MPLAB// | sed "s/[\_\-]R[SD]K.*//" | sed s/_CrossWorks// | sed "s/_EnvisionKit_.*//" | sed s/_Eclipse// | sed s/_CodeWarrior// | sed s/_Keil// | sed s/_Rowley// | sed s/_AtmelStudio// | sort -u | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}


// ----------------- //
// NuttX Snippets    //
// ----------------- //

async function countNuttXBoards(repo: SimpleGit, context: IAnalyticsSnippetContext): Promise<Number> {
    if (context.moment.isBefore('2019-08-30T00:00:00.000Z')) {
        return getCountFileByNameInFolderFn("/configs", "Kconfig")(repo)
    }
    else {
        return getCountFileByNameInFolderFn("/boards", "Kconfig")(repo)
    }
}

async function countNuttXDrivers(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`grep "CONFIG_SENSORS_.*" '${workingDir}/drivers/sensors/Make.defs' | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}


// ----------------- //
// RTEMS Snippets    //
// ----------------- //

/* Count .yml files that contain a bsp definition (line starting with 'bsp:' ) */
/* TODO: check if this is really the right way to do this */
async function countRTEMSBoards(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}' -type f -name "*.yml" | xargs grep -h "^bsp:" | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}



async function loc(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`scc '${workingDir}' -f json`).then((res: any) => {
        try {
            let out = JSON.parse(res.stdout);
            const sumOfLines = out.reduce((accumulator: number, currentValue: any) => {
                return accumulator + currentValue.Lines;
            }, 0);

            return sumOfLines;
        }
        catch {
            return null;
        }
    });
}
// let loc = NULL_FUNCTION;

/**
 * Returns a string with the before and after arguments for git log/shortlog etc.
 * If the current day is the last day of the month, the after argument will be the last day of the previous month,
 * otherwise it will be exactly 1 month before the current day.
 * @param context The context object
 * @returns before and after arguments for git log/shortlog etc.
 */
function getBeforeAfter(context: IAnalyticsSnippetContext): { before: string, after: string } {
    let before: string = `--before=${context.moment.format('YYYY-MM-DD')}`;
    let after: string;
    if (context.moment.date() == context.moment.daysInMonth()) {
        after = `--after=${context.moment.subtract(1, 'month').endOf('month').format('YYYY-MM-DD')}`;
    } else {
        after = `--after=${context.moment.subtract(1, 'month').format('YYYY-MM-DD')}`;
    }
    return { before, after };
}

async function numberOfCommits(repo: SimpleGit): Promise<Number> {
    return repo.raw(['rev-list', 'HEAD', '--count', '--first-parent']).then((x) => { return parseInt(x) });
}

async function numberOfCommitsPastMonth(repo: SimpleGit, context: IAnalyticsSnippetContext): Promise<Number> {
    let { before, after } = getBeforeAfter(context);

    return repo.raw(['rev-list', 'HEAD', before, after, '--count', '--first-parent']).then((x) => { return parseInt(x) });
}

async function numberOfUniqueContributorsPastMonth(repo: SimpleGit, context: IAnalyticsSnippetContext): Promise<Number> {
    let { before, after } = getBeforeAfter(context);

    return repo.raw(['shortlog', '-sn', 'HEAD', before, after]).then((x) => { return x.split(/\n/).length });
}

async function NULL_FUNCTION() { return null }


export {
    countFoldersInSubFolder,
    getCountFoldersInSubFolderFn,

    countFileByNameInFolder,
    getCountFileByNameInFolderFn,

    countZephyrDrivers,
    countZephyrSamples,
    countZephyrBoards,
    countZephyrMaintainers,

    countFreeRTOSBoards,

    countNuttXBoards,
    countNuttXDrivers,

    countRTEMSBoards,

    loc,

    numberOfCommits,
    numberOfCommitsPastMonth,

    numberOfUniqueContributorsPastMonth,

    NULL_FUNCTION
}
