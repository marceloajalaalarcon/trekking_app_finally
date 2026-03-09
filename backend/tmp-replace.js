const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        // We also want to replace 'http://localhost:3333/events' safely
        // and '/events' safely.
        let newContent = content.replace(/\/events/g, '/trekkings');
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log('Updated ' + filePath);
        }
    } catch (err) {
        // skip
    }
}

function walk(dir) {
    try {
        let list = fs.readdirSync(dir);
        for (let file of list) {
            file = path.resolve(dir, file);
            let stat = fs.statSync(file);
            if (stat && stat.isDirectory()) walk(file);
            else if (file.endsWith('.tsx') || file.endsWith('.ts')) replaceInFile(file);
        }
    } catch (err) {
        // skip
    }
}

walk('e:/Arquivos/TRABALHOS/apps/TRACKING_ECOSISTEM/dashboard/src/app');
