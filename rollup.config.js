import rollup from 'rollup'
import ts from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

/** @returns {rollup.RollupOptions} */
const shared = () => ({
    plugins: [ts({})],
})
/** @type {rollup.RollupOptions} */
const base = {
    input: './src/Async-Call.ts',
    output: outputMatrix('base', ['es', 'umd']),
    ...shared(),
}

/** @type {rollup.RollupOptions} */
const full = {
    input: './src/index.ts',
    output: outputMatrix('full', ['es', 'umd']),
    ...shared(),
}
export default [base, full]

/**
 * @param {string} name
 * @param {rollup.ModuleFormat[]} format
 * @returns {rollup.OutputOptions[]}
 */
function outputMatrix(name, format) {
    return format.map((f) => ({
        file: `./out/${name}.${f}.js`,
        name: 'AsyncCall',
        sourcemap: true,
        banner: '/// <reference types="./full.es.d.ts" />',
        plugins: [
            terser({
                compress: {
                    unsafe: true,
                    ecma: 2018,
                    unsafe_arrows: true,
                    passes: 2,
                },
                output: {
                    ecma: 2018,
                    semicolons: false,
                    comments: /reference types/,
                },
            }),
        ],
    }))
}
