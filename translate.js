const fs = require('fs');
const path = require('path');

const map = {
    'PENDING': 'CH? X? L?',
    'COMPLETED': 'Ð? HOÀN T?T',
    'REJECTED': 'T? CH?I',
    'APPROVED': 'Ð? DUY?T',
    'BANNED': 'Ð? B? KHÓA',
    'RED_FLAG': 'B? C?NH BÁO',
    'WON': 'TH?NG',
    'LOST': 'THUA',
    'FINISHED': 'Ð? K?T THÚC',
    'IN': 'N?P VÀO',
    'OUT': 'RÚT RA',
    'DEPOSIT': 'N?P TI?N',
    'WITHDRAW': 'RÚT TI?N',
    'BET': 'Ð?T CÝ?C',
    'REWARD': 'NH?N THÝ?NG'
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Replace inline returns of plain tags, e.g. return <Tag ...>STATUS</Tag>
    // We only want to replace if it is being rendered as text!
    // Example: {status} -> {translate(status)} but that requires logic changes.
    
    // Instead of doing regex, it's much safer if I just manually do the replace_file_content for the remaining files.
}
