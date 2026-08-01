const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('backend/src/main/java', function(filePath) {
    if (filePath.endsWith('.java')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('LocalDateTime.now()')) {
            content = content.replace(/LocalDateTime\.now\(\)/g, 'LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"))');
            fs.writeFileSync(filePath, content);
            console.log('Updated', filePath);
        }
    }
});
