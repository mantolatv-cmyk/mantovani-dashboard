const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const buf = fs.readFileSync('./contrato_final_mantovani.pdf');
const uint8 = new Uint8Array(buf);
const parser = new PDFParse(uint8);
parser.load().then(function() {
    const info = parser.getInfo();
    console.log('Info:', JSON.stringify(info));
    const numPages = info.numPages || 1;
    for (let i = 1; i <= numPages; i++) {
        try {
            const text = parser.getPageText(i);
            console.log('--- Page ' + i + ' ---');
            console.log(text);
        } catch(e) {
            console.log('Page ' + i + ' error:', e.message);
        }
    }
}).catch(function(err) {
    console.error('Load error:', err.message);
});
