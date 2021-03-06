import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.js',
            format: 'cjs',
        },
        plugins: [
            resolve(),
            babel({
                exclude: 'node_modules/**', // only transpile our source code
            }),
        ],
    },
    {
        input: 'src/accessories/MainZoneAccessory.js',
        output: {
            file: 'dist/accessories/MainZoneAccessory.js',
            format: 'cjs',
        },
        plugins: [
            resolve(),
            babel({
                exclude: 'node_modules/**', // only transpile our source code
            }),
        ],
    },
    {
        input: 'src/accessories/SecondZoneAccessory.js',
        output: {
            file: 'dist/accessories/SecondZoneAccessory.js',
            format: 'cjs',
        },
        plugins: [
            resolve(),
            babel({
                exclude: 'node_modules/**', // only transpile our source code
            }),
        ],
    },
];
