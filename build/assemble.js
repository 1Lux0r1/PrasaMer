// Собирает index.html из артбордов холста. Запуск: node assemble.js <project dir> <out file>
const fs = require('fs');
const path = require('path');
// Запуск из корня репозитория: node build/assemble.js  (аргументы необязательны: <папка со слайдами> <index.html>)
const src = process.argv[2] || path.join(__dirname, 'canvas/project');
const out = process.argv[3] || path.join(__dirname, '..', 'index.html');
const map = { PowerAbout: 'about', PowerData: 'data', PowerScheme: 'scheme', PowerTasks: 'tasks' };

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
  // общая шапка большой презентации (раздел 05 активен), под ней — навигация по слайдам раздела и плашка «План на 2027»;
  // содержимое слайда лежит в .deck-body и уменьшено, чтобы уместиться под шапкой
  const HEAD = '<header class="deck-head"><div class="dh-logos"><div class="dh-cgu"><i></i>ЦГУ</div><div class="dh-mos"><img src="img/logo-mosinzh-dark.svg" alt="Платформа МосИнженерия"></div></div><div class="dh-tabs"><div class="dh-tab"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.500"/><path d="M12 2v6.500M12 15.500V22M2 12h6.500M15.500 12H22"/></svg><span><small>01</small><b>Инженерный каркас</b></span></div><div class="dh-tab"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 13a4 4 0 0 1 8 0M12 13l2-3"/></svg><span><small>02</small><b>Учет ресурсов</b></span></div><div class="dh-tab"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-2 1-3.500 2-4.500 0 2 1 3 2 3 0-4 1-7 2-9.500z"/></svg><span><small>03</small><b>Теплоснабжение</b></span></div><div class="dh-tab"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"/><path d="M12 13s2.500 2 2.500 4a2.500 2.500 0 0 1-5 0c0-2 2.500-4 2.500-4z"/></svg><span><small>04</small><b>Газоснабжение</b></span></div><div class="dh-tab is-plan is-on"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 5 13.500h6L10 22l9-12h-6.500z"/></svg><span><small>05</small><b>Электроснабжение</b></span></div><div class="dh-tab is-plan"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9.500 12h6M9.500 16h6"/></svg><span><small>06</small><b>АРМ КСИО</b></span></div></div></header>';
  const inner = b.inner.replace(/\s*<div data-nav="\d" style="[^"]*"><\/div>/, '');
  const n = Object.keys(map).indexOf(name) + 1;
  sections += `\n<section class="slide" id="${id}" style="background: ${b.bg}">\n<div class="deck-body">\n${inner}\n</div>\n${HEAD}\n<div class="deck-sub" data-nav="${n}"></div>\n<div class="plan-badge"><i></i>План на 2027</div>\n</section>\n`;
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
  fs.readdirSync(path.join(dir, 'img')).filter((f) => f.endsWith('.svg')).forEach((f) => { page = page.split('img/' + f).join('data:image/svg+xml;base64,' + b64('img/' + f)); });
  if (/fonts\.googleapis|fonts\.gstatic|href="styles\.css|src="app\.js|"img\//.test(page)) throw new Error('offline build still has external references');
  fs.writeFileSync(path.join(dir, 'offline.html'), page);
  // Отдельные самостоятельные слайды: build/standalone/*.html -> корень репозитория, шрифт встраивается
  const sa = path.join(__dirname, 'standalone');
  if (fs.existsSync(sa)) fs.readdirSync(sa).filter((f) => f.endsWith('.html')).forEach((f) => {
    fs.writeFileSync(path.join(dir, f), fs.readFileSync(path.join(sa, f), 'utf8').replace('<!--FONTS-->', () => '<style>\n' + fontCss + '\n</style>').replace('<!--MAP-->', () => fs.readFileSync(path.join(dir, 'img/moscow-full.svg'), 'utf8').replace(/<rect width="1600" height="940" fill="url\(#bg\)"\/>/, '').replace('<svg ', '<svg class="geo" ')));
    console.log('ok', f);
  });
  console.log('ok offline.html', Math.round(page.length / 1024) + ' KB');
}
console.log('ok', out);
