const MagicString = require('magic-string');
const fs = require('fs');

function systemJSLoader(config) {
    let contentToInclude;

    async function getContentToInclude(){
        const include = await Promise.all(config.include.map((file) => { 
            return fs.promises.readFile(file, 'utf8');
        }));
        contentToInclude = include.join('\n');
    }
    
    return {
        name: 'systemjs-loader',
        async renderChunk(code, chunk, options) {
            if (!chunk.isEntry) {
                return null;
            }
            if(!contentToInclude){
                await getContentToInclude();
            }
            const magicString = new MagicString(code, { filename: chunk.fileName });
            magicString
                .prepend(`if(!window.System){ ${contentToInclude} }`)
                .append(`System.import('./${chunk.fileName}')`);
            return {
                code: magicString.toString(),
                map: options.sourcemap ? magicString.generateMap() : null
            }
        }
    }
}

module.exports = systemJSLoader;