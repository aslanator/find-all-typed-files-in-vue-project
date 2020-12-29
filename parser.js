const {promisify} = require('util');
const { readFile, readdir, writeFile } = require("fs");
const config = require('./config');

const asyncReadFile = promisify(readFile);
const asyncReaddir = promisify(readdir);
const asyncWriteFile = promisify(writeFile);

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

async function getTypedFiles(files) {
    const typedFiles = [];
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
    return typedFiles;
}

(async function() {
    const files = await recursivelyGetAllFiles();
    const typedFiles = await getTypedFiles(files);
    const replace = new RegExp(config.path);
    const stringFiles = typedFiles.reduce((carry, file) => carry += `${file.replace(replace, '')}\n`, '');
    asyncWriteFile('./result.txt', stringFiles);
})();