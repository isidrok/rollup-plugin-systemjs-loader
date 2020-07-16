# rollup-plugin-systemjs-loader

Rollup plugin to include SystemJS runtime in entry chunks.

## Usage

```js
import systemJSLoader from 'rollup-plugin-systemjs-loader';

export default {
    input: 'index.js',
    output: {
        format: 'system',
        dir: 'dist',
        sourcemap: true
    },
    plugins: [
        systemJSLoader({
            include: [
                require.resolve('systemjs/dist/s.js')
            ]
        })
    ]
}
```