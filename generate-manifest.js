const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (
            fs.statSync(fullPath).isDirectory() &&
            !['node_modules', '.git'].includes(file) // exclude common dirs
        ) {
            getAllFiles(fullPath, arrayOfFiles);
        } else if (fs.statSync(fullPath).isFile()) {
            arrayOfFiles.push(path.relative(__dirname, fullPath));
        }
    });

    return arrayOfFiles;
}

const fileList = getAllFiles(__dirname);

fs.writeFileSync('manifest.txt', fileList.join('\n'));
console.log('✅ Manifest created: manifest.txt');
