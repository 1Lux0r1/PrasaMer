// Проверка страницы без сети: node shot.js <страница.html> <снимок.png> [пауза, мс] [селектор для наведения]
// Печатает ошибки консоли; снимок 1920×1080. Пауза нужна, чтобы досмотреть вступительную анимацию.
const { chromium } = require('playwright'), path = require('path');
(async () => {
  const [page, png, wait, hover] = process.argv.slice(2);
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1920, height: 1080 }, offline: true });
  const p = await c.newPage(); const errs = [];
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + path.resolve(page)); await p.waitForTimeout(+wait || 800);
  if (hover) { await p.hover(hover); await p.waitForTimeout(400); }
  await p.screenshot({ path: png }); console.log(errs.length ? 'ОШИБКИ:\n' + errs.join('\n') : 'ошибок нет');
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
