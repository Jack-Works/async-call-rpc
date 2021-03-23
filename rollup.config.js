import rollup from 'rollup'
import ts from '@rollup/plugin-sucrase'
import { terser } from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'

/** @returns {rollup.RollupOptions} */
const shared = () => ({
    plugins: [ts({ transforms: ['typescript'] })],
})

/** @type {rollup.RollupOptions} */
const base = {
    input: './src/Async-Call.ts',
    output: outputMatrix('base'),
    ...shared(),
}

/** @type {rollup.RollupOptions} */
const full = {
    input: './src/index.ts',
    output: outputMatrix('full'),
    ...shared(),
}

/** @type {rollup.RollupOptions[]} */
const dtsConfig = [
    {
        input: './es/Async-Call.d.ts',
        output: [
            { file: './out/base.d.ts', format: 'es' },
            { file: './out/base.min.d.ts', format: 'es' },
        ],
        plugins: [dts()],
    },
    {
        input: './es/index.d.ts',
        output: [
            { file: './out/full.d.ts', format: 'es' },
            { file: './out/full.min.d.ts', format: 'es' },
        ],
        plugins: [dts()],
    },
]
export default [base, full, ...dtsConfig]

/**
 * @param {string} name
 * @param {('es' | 'umd')[]} format
 * @returns {rollup.OutputOptions[]}
 */
function outputMatrix(name, format = ['es', 'umd']) {
    return format.flatMap((f) => {
        /** @returns {rollup.OutputOptions} */
        const base = (compress = false) => {
            const baseName = getBaseName(name, compress)
            return {
                file: `./out/${baseName}.${f === 'es' ? 'm' : ''}js`,
                name: 'AsyncCall',
                sourcemap: true,
                format: f,
                banner: `/// <reference types="./${baseName}.d.ts" />`,
                plugins: [
                    compress &&
                        terser({
                            compress: {
                                unsafe: true,
                                ecma: 2018,
                                passes: 3,
                                unsafe_arrows: true,
                                unsafe_symbols: true,
                                unsafe_undefined: true,
                                drop_debugger: false,
                                pure_getters: true,
                                keep_fargs: false,
                                module: f === 'es',
                            },
                            // @ts-ignore
                            output: {
                                ecma: 2018,
                                comments: /reference types/,
                            },
                        }),
                ],
            }
        }
        return [base(false), base(true)]
    })
}
function getBaseName(name, compress) {
    if (!compress) return name
    return `${name}.min`
}
