import rollup from 'rollup'
import ts from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'

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

/** @type {rollup.RollupOptions[]} */
const dtsConfig = [
    {
        input: './es/Async-Call.d.ts',
        output: [{ file: './out/base.d.ts', format: 'es' }],
        plugins: [dts()],
    },
    {
        input: './es/index.d.ts',
        output: [{ file: './out/full.d.ts', format: 'es' }],
        plugins: [dts()],
    },
]
export default [base, full, ...dtsConfig]

/**
 * @param {string} name
 * @param {('es' | 'umd')[]} format
 * @returns {rollup.OutputOptions[]}
 */
function outputMatrix(name, format) {
    return format.map((f) => ({
        file: `./out/${name}.${f === 'es' ? 'm' : 'c'}js`,
        name: 'AsyncCall',
        sourcemap: true,
        format: f,
        banner: `/// <reference types="./${name}.d.ts" />`,
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
