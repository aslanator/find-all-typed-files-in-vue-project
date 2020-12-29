const {promisify} = require('util');
const { readFile, readdir } = require("fs");
const config = require('./config');

const asyncReadFile = promisify(readFile);
const asyncReaddir = promisify(readdir);

async function recursivelyGetAllFiles() {
    const allFiles = [];
    async function getFilesFromDir(path = '') {
        try {
            const files = await asyncReaddir(`${config.path}${path}`);
            for(const file of files) {
                if(/\.\w+$/.test(file)) {
                    allFiles.push((`${config.path}${path}/${file}`));
                }
                else {
                    await getFilesFromDir(`${path}/${file}`);
                }
            }
        }
        catch(e) {
        }
    }   
    await getFilesFromDir();
    return allFiles;
}

(async function() {
    const typedFiles = [];
    const files = await recursivelyGetAllFiles();
    for(const file of files) {
        if(/\.ts$/.test(file)) {
            typedFiles.push((file));
        }
        else {
            const content = await asyncReadFile(file);
            if(/extends Vue/gi.test(content.toString())) {
                typedFiles.push((file));
            }
        }
    }
    console.log(typedFiles);
})();