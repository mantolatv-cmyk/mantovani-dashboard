import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const buf = fs.readFileSync('contrato_final_mantovani.pdf');
const data = await pdfParse(buf);
console.log('Pages:', data.numpages);
console.log('---TEXT START---');
console.log(data.text);
console.log('---TEXT END---');
