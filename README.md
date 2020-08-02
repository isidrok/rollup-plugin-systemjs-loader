# rollup-plugin-systemjs-loader

Rollup plugin to include SystemJS runtime in entry chunks.

## Install

```bash
npm i -D rollup-plugin-systemjs-loader
# or
yarn add -D rollup-plugin-systemjs-loader
```

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

## Options

### `baseURL`

Type: `String`<br>
Default: `/`

Base URL from which entry chunks must be imported.

### `include`

Type: `Array[...String]`<br>
Required

Array of file paths that must be included for loading SystemJS.

