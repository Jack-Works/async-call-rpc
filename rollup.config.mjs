import { terser } from 'rollup-plugin-terser'
import ts from '@rollup/plugin-sucrase'

/** @type {import('rollup').RollupOptions} */
const base = {
    input: './src/Async-Call.ts',
    output: outputMatrix('base'),
    plugins: [ts({ transforms: ['typescript'] })],
}

/** @type {import('rollup').RollupOptions} */
const full = {
    input: './src/index.ts',
    output: outputMatrix('full'),
    plugins: [ts({ transforms: ['typescript'] })],
}
export default [base, full]

/**
 * @param {string} name
 * @param {('es' | 'umd')[]} format
 * @returns {import('rollup').OutputOptions[]}
 */
function outputMatrix(name, format = ['es', 'umd']) {
    return format.flatMap((f) => {
        /** @returns {import('rollup').OutputOptions} */
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
/**
 * @param {string} name
 * @param {boolean} compress
 */
function getBaseName(name, compress) {
    if (!compress) return name
    return `${name}.min`
}
