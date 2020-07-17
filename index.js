const MagicString = require('magic-string');
const fs = require('fs');

function systemJSLoader(config) {
    let contentLoading = false;
    let contentToInclude;

    function before(content){
        return `if(!window.System){ ${content} }`;
    }

    function after(fileName){
        return `System.import('./${fileName}')`;
    }

    function saveContentToInclude() {
        if (contentLoading) {
            return;
        }
        contentLoading = true;
        return Promise.all(config.include.map((file) => {
            return fs.promises.readFile(file, 'utf8');
        })).then((include) => {
            contentToInclude = include.join('\n');
        });
    }


    return {
        name: 'systemjs-loader',
        renderStart() {
            return saveContentToInclude();
        },
        augmentChunkHash(chunk) {
            if(chunk.isEntry){
                return before(contentToInclude) + after(chunk.name);
            }
        },
        async renderChunk(code, chunk, options) {
            if (!chunk.isEntry) {
                return null;
            }
            if (!contentToInclude) {
                await getContentToInclude();
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

module.exports = systemJSLoader;