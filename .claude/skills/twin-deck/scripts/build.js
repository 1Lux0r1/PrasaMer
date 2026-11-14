// Сборка автономной страницы: node build.js <исходник.html> <результат.html>
// Встраивает шрифт Onest (метка <!--FONTS-->) и карту Москвы (метка <!--MAP-->), чтобы файл открывался без интернета.
const fs = require('fs'), path = require('path');
const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('usage: node build.js <src.html> <out.html>'); process.exit(1); }
const assets = path.join(__dirname, '..', 'assets');
const b64 = (f) => fs.readFileSync(path.join(assets, f)).toString('base64');
const ranges = JSON.parse(fs.readFileSync(path.join(assets, 'fonts/ranges.json'), 'utf8'));
const fontCss = ranges.map(([name, range]) => `@font-face{font-family:'Onest';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,${b64('fonts/onest-' + name + '-wght-normal.woff2')}) format('woff2');unicode-range:${range}}`).join('\n');
// карта без собственного тёмного фона: она ложится на фон страницы
const map = () => fs.readFileSync(path.join(assets, 'moscow-base.svg'), 'utf8').replace(/<rect width="1600" height="940" fill="url\(#bg\)"\/>/, '').replace('<svg ', '<svg class="geo" ');
let page = fs.readFileSync(src, 'utf8').replace('<!--FONTS-->', () => '<style>\n' + fontCss + '\n</style>').replace('<!--MAP-->', map);
const ext = page.match(/(src|href)="https?:\/\/[^"]+"|url\(https?:[^)]+\)/g);
if (ext) { console.error('внешние ссылки — файл не будет работать без интернета:\n' + ext.join('\n')); process.exit(1); }
fs.writeFileSync(out, page);
console.log('ok', out, Math.round(page.length / 1024) + ' KB');
