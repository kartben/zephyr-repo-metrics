// import interfaces
import { IProject } from './interfaces.js';
import * as snippets from './snippets.js';

let projects: IProject[] = [
    {
        name: 'Zephyr',
        url: 'https://github.com/zephyrproject-rtos/zephyr',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: snippets.countZephyrDrivers },
            { name: 'samples', fn: snippets.countZephyrSamples },
            { name: 'boards', fn: snippets.countZephyrBoards },
            { name: 'maintainers', fn: snippets.countZephyrMaintainers },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },
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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },

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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },

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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },

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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },

        ]
    },

    {
        name: 'Eclipse ThreadX',
        url: 'https://github.com/eclipse-threadx/threadx',
        branch: 'master',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.NULL_FUNCTION },
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },

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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },

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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },
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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },
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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },
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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },
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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },
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
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },
        ]
    },

    {
        name: 'Ariel OS',
        url: 'https://github.com/ariel-os/ariel-os',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.getCountFoldersInSubFolderFn('/examples') },
            { name: 'boards', fn: snippets.NULL_FUNCTION },
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },
        ]
    },

    {
        name: 'RTEMS',
        url: 'https://gitlab.rtems.org/rtems/rtos/rtems.git',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.countRTEMSBoards },
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },
        ]
    },

    {
        name: 'PebbleOS',
        url: 'https://github.com/coredevices/pebbleos',
        branch: 'main',
        snippets: [
            { name: 'drivers', fn: snippets.NULL_FUNCTION },
            { name: 'samples', fn: snippets.NULL_FUNCTION },
            { name: 'boards', fn: snippets.NULL_FUNCTION },
            { name: 'maintainers', fn: snippets.NULL_FUNCTION },
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'assistedByCommitsPastMonth', fn: snippets.assistedByCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
            { name: 'nonMergeCommitsPastMonth', fn: snippets.nonMergeCommitsPastMonth },
        ]
    },
];

export {projects};