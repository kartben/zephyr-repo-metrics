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
Object.defineProperty(exports, "__esModule", { value: true });
exports.projects = void 0;
const snippets = __importStar(require("./snippets"));
let projects = [
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
            { name: 'loc', fn: snippets.loc },
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
            { name: 'loc', fn: snippets.loc },
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
            { name: 'loc', fn: snippets.loc },
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
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
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
            { name: 'loc', fn: snippets.loc },
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
            { name: 'loc', fn: snippets.loc },
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
            { name: 'loc', fn: snippets.loc },
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
            { name: 'loc', fn: snippets.loc },
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
            { name: 'loc', fn: snippets.loc },
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
            { name: 'loc', fn: snippets.loc },
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
            { name: 'loc', fn: snippets.loc },
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
            { name: 'loc', fn: snippets.loc },
            { name: 'numberOfCommits', fn: snippets.numberOfCommits },
            { name: 'numberOfCommitsPastMonth', fn: snippets.numberOfCommitsPastMonth },
            { name: 'numberOfUniqueContributorsPastMonth', fn: snippets.numberOfUniqueContributorsPastMonth },
        ]
    },
];
exports.projects = projects;
//# sourceMappingURL=projects.js.map