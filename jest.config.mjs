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
}
