/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
        'ts-jest': {
            isolatedModules: true,
            module: 'ESNext',
        },
    },
    testPathIgnorePatterns: ['__tests__/utils', '__file_snapshots__'],
    watchPathIgnorePatterns: ['__file_snapshots__'],
    coveragePathIgnorePatterns: ['__tests__/utils', 'node_modules'],
}
