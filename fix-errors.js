const fs = require('fs');
const path = require('path');

const dir = 'backend/src/main/java/com/swp/horseracing/controller';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.endsWith('.java')) {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const newContent = content.split('return ResponseEntity.badRequest().body(e.getMessage());')
                                  .join('return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));');
        
        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated ' + file);
        }
    }
});
