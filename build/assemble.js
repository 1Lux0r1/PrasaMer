// Собирает index.html из артбордов холста. Запуск: node assemble.js <project dir> <out file>
const fs = require('fs');
const path = require('path');
// Запуск из корня репозитория: node build/assemble.js  (аргументы необязательны: <папка со слайдами> <index.html>)
const src = process.argv[2] || path.join(__dirname, 'canvas/project');
const out = process.argv[3] || path.join(__dirname, '..', 'index.html');
const map = { PowerAbout: 'about', PowerData: 'data', PowerScheme: 'scheme', PowerTasks: 'tasks', PowerEffect: 'effect' };

function body(name) {
  const html = fs.readFileSync(path.join(src, name + '.dc.html'), 'utf8');
  let inner = html.split('</helmet>')[1].split('</x-dc>')[0].trim();
  // корневой div артборда -> его содержимое и фон
  const m = inner.match(/^<div style="([^"]*)">([\s\S]*)<\/div>$/);
  const bg = (m[1].match(/background: (#[0-9a-fA-F]+)/) || [])[1] || '#161d2b';
  inner = m[2];
  inner = inner.replace(/<div style="([^"]*)">\s*<dc-import name="MoscowMap" mode="(\w+)" cx="(\d+)" cy="(\d+)" scale="(\d+)"[^>]*><\/dc-import>\s*<\/div>/g,
    '<div data-map="$2" data-cx="$3" data-cy="$4" data-scale="$5" style="$1"></div>');
  inner = inner.replace(/<div style="([^"]*)">\s*<dc-import name="PowerNav" current="(\d)"[^>]*><\/dc-import>\s*<\/div>/g,
    '<div data-nav="$2" style="$1"></div>');
  inner = inner.replace(/href="(Power\w+)\.dc\.html"/g, (_, n) => 'href="#' + map[n] + '"');
  inner = inner.replace('/_blob/9ade71bfb0fa3e8df8005b480e7b46bd', 'img/view-map-3.jpg');
  if (name === 'PowerTasks') inner += fs.readFileSync(path.join(__dirname, 'demos.html'), 'utf8');
  if (/dc-import|\{\{|sc-if|sc-for|_blob/.test(inner)) throw new Error('unconverted template syntax in ' + name);
  return { bg, inner };
}

// версия файлов в адресе: браузер не подставит старый app.js/styles.css из кэша
const ver = (f) => require('crypto').createHash('md5').update(fs.readFileSync(path.join(path.dirname(out), f))).digest('hex').slice(0, 8);
let sections = '';
for (const name of Object.keys(map)) {
  const id = map[name];
  const b = name === 'PowerScheme'
    ? { bg: '#161d2b', inner: fs.readFileSync(path.join(__dirname, 'scheme.html'), 'utf8') }
    : body(name);
  sections += `\n<section class="slide" id="${id}" style="background: ${b.bg}">\n${b.inner}\n</section>\n`;
}

fs.writeFileSync(out, `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Схема электроснабжения — цифровой двойник Москвы</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?v=${ver('styles.css')}">
</head>
<body>
<div id="stage">${sections}</div>
<script src="app.js?v=${ver('app.js')}"></script>
</body>
</html>
`);

// Автономная версия: всё в одном файле (стили, скрипт, подложка карты, шрифт), открывается без интернета
{
  const dir = path.dirname(out), b64 = (f) => fs.readFileSync(path.join(dir, f)).toString('base64');
  const ranges = JSON.parse(fs.readFileSync(path.join(dir, 'fonts/ranges.json'), 'utf8'));
  const fontCss = ranges.map(([name, range]) => `@font-face{font-family:'Onest';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,${b64('fonts/onest-' + name + '-wght-normal.woff2')}) format('woff2');unicode-range:${range}}`).join('\n');
  let page = fs.readFileSync(out, 'utf8');
  page = page.replace(/<link rel="preconnect"[^>]*>\n/g, '').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n/, '');
  page = page.replace(/<link rel="stylesheet" href="styles\.css[^"]*">/, () => '<style>\n' + fontCss + '\n' + fs.readFileSync(path.join(dir, 'styles.css'), 'utf8') + '</style>');
  page = page.replace(/<script src="app\.js[^"]*"><\/script>/, () => '<script>\n' + fs.readFileSync(path.join(dir, 'app.js'), 'utf8') + '</script>');
  page = page.split('img/moscow-base.svg').join('data:image/svg+xml;base64,' + b64('img/moscow-base.svg'));
  if (/fonts\.googleapis|fonts\.gstatic|href="styles\.css|src="app\.js|img\/moscow-base/.test(page)) throw new Error('offline build still has external references');
  fs.writeFileSync(path.join(dir, 'offline.html'), page);
  console.log('ok offline.html', Math.round(page.length / 1024) + ' KB');
}
console.log('ok', out);
