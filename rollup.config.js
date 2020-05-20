import rollup from 'rollup'
import ts from '@rollup/plugin-typescript'

/** @type {rollup.RollupOptions} */
const shared = { plugins: [ts()] }
/** @type {rollup.RollupOptions} */
const base = {
    input: './src/Async-Call.ts',
    output: outputMatrix('base', ['es', 'umd']),
}

/** @type {rollup.RollupOptions} */
const full = {
    input: './src/Async-Call-Generator.ts',
    output: outputMatrix('full', ['es', 'umd']),
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
        ...shared,
    }))
}
