import fs from 'fs';

const content = fs.readFileSync('c:/laragon/www/tugas-akhir_FIX/spa-peta-bima/resources/js/Pages/Admin/Penelitian/Index.jsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
let balanceMatch = 0;
let parenBalance = 0;
lines.forEach((line, i) => {
    const openers = (line.match(/\{/g) || []).length;
    const closers = (line.match(/\}/g) || []).length;
    balanceMatch += openers - closers;
    console.log(`${i + 1}: ${balanceMatch} | ${line.trim()}`);
});
