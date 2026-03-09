const fs = require('fs');
const path = require('path');

function replaceInSchema() {
    let schemaPath = path.join(__dirname, 'prisma/schema.prisma');
    let content = fs.readFileSync(schemaPath, 'utf8');

    content = content.replace(/model Event /g, 'model Trekking ');
    content = content.replace(/EventRole/g, 'TrekkingRole');
    content = content.replace(/EventMember/g, 'TrekkingMember');
    content = content.replace(/EventTeam/g, 'TrekkingTeam');

    // Relation changes
    content = content.replace(/event_id/g, 'trekking_id');
    content = content.replace(/ event +Event/g, ' trekking Trekking');
    content = content.replace(/ events +EventTeam/g, ' trekkings TrekkingTeam');
    content = content.replace(/ event_id/g, ' trekking_id');

    fs.writeFileSync(schemaPath, content);
    console.log('Schema updated.');
}

function processBackendTS(dir) {
    let list = fs.readdirSync(dir);
    for (let file of list) {
        file = path.join(dir, file);
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) processBackendTS(file);
        else if (file.endsWith('.ts')) {
            let content = fs.readFileSync(file, 'utf8');
            let newContent = content.replace(/prisma\.event/g, 'prisma.trekking');
            newContent = newContent.replace(/event_id/g, 'trekking_id');
            // Check other potential types
            newContent = newContent.replace(/Event /g, 'Trekking ');
            if (content !== newContent) {
                fs.writeFileSync(file, newContent);
                console.log('Updated', file);
            }
        }
    }
}

replaceInSchema();
processBackendTS(path.join(__dirname, 'src'));
