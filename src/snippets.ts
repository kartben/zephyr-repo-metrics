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
    return exec(`find '${workingDir}/boards' -type f -name "*.yaml" -printf "%h\n" | sort -u | wc -l`).then((res: any) => { return parseInt(res.stdout.trim()) });
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




// async function cloc(repo: SimpleGit): Promise<Number> {
//     let workingDir = await repo.revparse('--show-toplevel');
//     return exec(`cloc '${workingDir}' --json --quiet`).then((res: any) => { 
//         try {
//             let out = JSON.parse(res.stdout) ; 
//             return out.SUM.code + out.SUM.comment
//         }
//         catch {
//             return null;
//         }
//     });
// }
let cloc = NULL_FUNCTION;

async function numberOfCommits(repo: SimpleGit): Promise<Number> {
    return repo.raw(['rev-list', 'HEAD', '--count', '--first-parent']).then((x) => { return parseInt(x) });
}

async function numberOfCommitsPastMonth(repo: SimpleGit, context: IAnalyticsSnippetContext): Promise<Number> {
    let revRange: string = context.prevSHA1 ? `${context.prevSHA1}..HEAD` : 'HEAD';
    return repo.raw(['rev-list', revRange, '--count', '--first-parent']).then((x) => { return parseInt(x) });
}

async function numberOfUniqueContributorsPastMonth(repo: SimpleGit, context: IAnalyticsSnippetContext): Promise<Number> {
    let revRange: string = context.prevSHA1 ? `${context.prevSHA1}..HEAD` : 'HEAD';
    return repo.raw(['shortlog', '-sn', revRange]).then((x) => { return x.split(/\n/).length });
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
    
    cloc,
    
    numberOfCommits,
    numberOfCommitsPastMonth,
    
    numberOfUniqueContributorsPastMonth,

    NULL_FUNCTION
  }
