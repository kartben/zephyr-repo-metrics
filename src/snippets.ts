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
    return exec(`find '${workingDir}/dts/bindings/sensor' -type f | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countZephyrSamples(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}/samples' -type f | grep sample.yaml | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
}

async function countZephyrBoards(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`find '${workingDir}/boards' -type f -name "*.dts" -exec grep -l "model =" {} \\; | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
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




async function loc(repo: SimpleGit): Promise<Number> {
    let workingDir = await repo.revparse('--show-toplevel');
    return exec(`scc '${workingDir}' -f json`).then((res: any) => { 
        try {
            let out = JSON.parse(res.stdout) ; 
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
 * otherwise it will be 30 days before the current day.
 * @param context The context object
 * @returns before and after arguments for git log/shortlog etc.
 */
function getBeforeAfter(context: IAnalyticsSnippetContext): { before: string, after: string } {
    let before: string = `--before=${context.moment.format('YYYY-MM-DD')}`;
    let after: string;
    if (context.moment.date() == context.moment.daysInMonth()) {
        after = `--after=${context.moment.subtract(1, 'month').format('YYYY-MM-DD')}`;
    } else {
        after = `--after=${context.moment.subtract(30, 'days').hour(0).minute(0).second(1).format('YYYY-MM-DD')}`;
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

    countFreeRTOSBoards,

    countNuttXBoards,
    countNuttXDrivers,

    loc,

    numberOfCommits,
    numberOfCommitsPastMonth,

    numberOfUniqueContributorsPastMonth,

    NULL_FUNCTION
}
