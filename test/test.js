import path from 'path';
import fs from 'fs';
import test from 'ava';
import { rollup } from 'rollup';
import systemJSLoader from '../dist/index.es.js';

async function build({ input, include, baseURL }) {
    const bundle = await rollup({
        input,
        plugins: [
            {
                resolveId(id) {
                    if (id === input) {
                        return id;
                    }
                    return null;
                },
                load(id) {
                    if (id === input) {
                        return `console.log("test");`;
                    }
                    return null;
                }
            },
            systemJSLoader({
                include,
                baseURL
            }),
        ]
    });
    const { output } = await bundle.generate({
        format: 'system',
        dir: 'dist',
        sourcemap: true,
        entryFileNames: '[name].[hash].js'
    });
    return output[0]
}

test('Generated content', async (t) => {
    const input = 'foo';
    const include1 = path.resolve('test', 'fixtures', 'include1.js');
    const baseURL = '/x/';
    const includedCode = await fs.promises.readFile(include1, 'utf8');
    const chunk = await build({ input, include: [include1], baseURL });
    const code = chunk.code.trim();
    const before = `if(!window.System){ ${includedCode} }`;
    const after = `System.import('${baseURL}${chunk.fileName}')`;
    t.true(code.startsWith(before), 'should include code when System is not defined');
    t.true(code.endsWith(after), 'should import the chunk using System');
});

test('Chunk hashes', async (t) => {
    const input = 'foo';
    const include1 = path.resolve('test', 'fixtures', 'include1.js');
    const include2 = path.resolve('test', 'fixtures', 'include2.js');
    const baseURL = '/x/';
    const [chunk1, chunk2] = await Promise.all([
        build({ input, include: [include1], baseURL }),
        build({ input, include: [include2], baseURL })
    ]);
    t.not(chunk1.fileName, chunk2.fileName, 'should depend on included content');
});