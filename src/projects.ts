// import interfaces
import { IProject } from './interfaces';
import * as snippets from './snippets';

let projects: IProject[] = [
    {
        name: 'Zephyr',
        url: 'https://github.com/zephyrproject-rtos/zephyr',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: snippets.countZephyrDrivers },
            { name: 'samples', fn: snippets.countZephyrSamples },
            { name: 'boards', fn: snippets.countZephyrBoards },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
        ]

    },

    {
        name: 'FreeRTOS',
        url: 'https://github.com/FreeRTOS/FreeRTOS',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.countFreeRTOSBoards },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },

        ]
    },

    {
        name: 'FreeRTOS-Kernel',
        url: 'https://github.com/FreeRTOS/FreeRTOS-Kernel',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.NULL_FUNCTION },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },

        ]
    },

    {
        name: 'Apache NuttX',
        url: 'https://github.com/apache/nuttx',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: snippets.countNuttXDrivers },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.countNuttXBoards },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },

        ]
    },

    {
        name: 'RIOT OS',
        url: 'https://github.com/RIOT-OS/RIOT',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: snippets.getCountFoldersInSubFolderFn("/drivers") },
            { name: 'samples', fn: snippets.getCountFoldersInSubFolderFn("/examples") },
            { name: 'boards', fn: snippets.getCountFoldersInSubFolderFn("/boards") },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },

        ]
    },

    {
        name: 'Azure RTOS ThreadX',
        url: 'https://github.com/azure-rtos/threadx',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.NULL_FUNCTION },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },

        ]
    },

    {
        name: 'Apache Mynewt',
        url: 'https://github.com/apache/mynewt-core',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: snippets.getCountFoldersInSubFolderFn("/hw/drivers/sensors") },
            { name: 'samples', fn: snippets.getCountFoldersInSubFolderFn("/apps") },
            { name: 'boards', fn: snippets.getCountFoldersInSubFolderFn("/hw/bsp") },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },

        ]
    },

    {
        name: 'RT-Thread',
        url: 'https://github.com/RT-Thread/rt-thread',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.getCountFileByNameInFolderFn("/bsp", "board.c") },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
        ]
    },

    {
        name: 'chibi-os',
        url: 'https://github.com/ChibiOS/ChibiOS',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.getCountFoldersInSubFolderFn('/os/hal/boards') },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
        ]
    },

    {
        name: 'Contiki-NG',
        url: 'https://github.com/contiki-ng/contiki-ng',
        branch: 'develop',
        snippets: [
            { name: 'drivers', fn: snippets.getCountFoldersInSubFolderFn('/arch/dev/sensor') },
            { name: 'samples', fn: snippets.getCountFoldersInSubFolderFn('/examples') },
            { name: 'boards', fn: snippets.NULL_FUNCTION },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
        ]
    },

    {
        name: 'TizenRT',
        url: 'https://github.com/Samsung/TizenRT',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.NULL_FUNCTION },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
        ]
    },


    {
        name: 'Arm Mbed OS',
        url: 'https://github.com/ARMmbed/mbed-os',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.NULL_FUNCTION },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
        ]
    },

    {
        name: 'Amazon FreeRTOS',
        url: 'https://github.com/aws/amazon-freertos',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.NULL_FUNCTION },
            { name: 'cloc', fn: snippets.cloc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
        ]
    },
];

export {projects};