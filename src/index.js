import fs from 'fs';
import MagicString from 'magic-string';

const defaults = {
    baseURL: '/',
    include: null
}

function systemJSLoader(options) {
    const config = { ...defaults, ...options };

    let contentToInclude;

    function before(content) {
        return `if(!window.System){ ${content} }`;
    }

    function after(fileName) {
        return `System.import('${config.baseURL}${fileName}')`;
    }

    return {
        name: 'systemjs-loader',
        renderStart() {
            if (!config.include || !config.include.length) {
                this.error('You must supply at least one file to be included');
            }
            return Promise.all(config.include.map((file) => {
                return fs.promises.readFile(file, 'utf8');
            })).then((include) => {
                contentToInclude = include.join('\n');
            });
        },
        augmentChunkHash(chunk) {
            if (chunk.isEntry) {
                return before(contentToInclude) + after(chunk.name);
            }
        },
        async renderChunk(code, chunk, options) {
            if (!chunk.isEntry) {
                return null;
            }
            const magicString = new MagicString(code, { filename: chunk.fileName });
            magicString
                .prepend(before(contentToInclude))
                .append(after(chunk.fileName));
            return {
                code: magicString.toString(),
                map: options.sourcemap ? magicString.generateMap() : null
            }
        }
    }
}

export default systemJSLoader;