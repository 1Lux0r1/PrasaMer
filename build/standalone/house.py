#!/usr/bin/env python3
"""Генерирует сцену слайда «Баланс дома» (дом в изометрии, трубы, линии данных)
и вставляет её в balans-doma.html между метками SCENE:BEGIN / SCENE:END.

Запуск из корня репозитория:  python3 -I build/standalone/house.py && node build/assemble.js
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, 'balans-doma.html')

# --- геометрия дома: изометрия, видны левая стена (в разрезе), правая стена и крыша
OX, OY, A, B, H, BASE, N = 1095, 665, 200, 150, 370, 80, 10
KX, KY = 0.9, 0.3
FH = (H - BASE) / N
GVS, GVS_D, GVS_L = '#F0B37E', '#7A4E22', '#FFE2BF'
CO, CO_D, CO_L = '#FF7A8A', '#8A2C3A', '#FFD0D6'
TEAL = '#7CCFD0'

P = lambda x, y, z=0: (OX + (x - y) * KX, OY + (x + y) * KY - z)
L = lambda u, z: P(u, B, z)          # левая стена: u — вдоль стены, z — высота
R = lambda v, z: P(A, B - v, z)      # правая стена: v — от ближнего угла
f = lambda q: '%.1f %.1f' % q
poly = lambda pts: 'M' + 'L'.join(f(q) for q in pts) + 'Z'
line = lambda pts: 'M' + 'L'.join(f(q) for q in pts)
EDGE = 'stroke: rgba(255,255,255,0.34); stroke-width: 1.4; stroke-linejoin: round'


def tube(d, color, dark, w, flow='flowA'):
    """Труба: тёмный контур, тело, блик и бегущий поток."""
    return (
        '<path d="%s" style="fill: none; stroke: rgba(0,0,0,0.45); stroke-width: %.1f; stroke-linecap: round; stroke-linejoin: round" transform="translate(0 4)"></path>' % (d, w + 2)
        + '<path d="%s" style="fill: none; stroke: %s; stroke-width: %.1f; stroke-linecap: round; stroke-linejoin: round"></path>' % (d, dark, w)
        + '<path d="%s" style="fill: none; stroke: %s; stroke-width: %.1f; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 0 7px %s)"></path>' % (d, color, w - 3.5, color)
        + '<path d="%s" style="fill: none; stroke: rgba(255,255,255,0.38); stroke-width: %.1f; stroke-linecap: round; stroke-linejoin: round" transform="translate(0 %.1f)"></path>' % (d, max(1.2, w * 0.16), -w * 0.2)
        + '<path class="%s" d="%s" style="fill: none; stroke: #ffffff; stroke-width: %.1f; opacity: 0.9"></path>' % (flow, d, max(1.6, w * 0.26))
    )


def flange(x, y, w, light, dark):
    return '<rect x="%.1f" y="%.1f" width="9" height="%.1f" rx="2.5" style="fill: %s; stroke: %s; stroke-width: 1.5"></rect>' % (x - 4.5, y - w / 2 - 4, w + 8, light, dark)


o = []
o.append('<defs>'
         '<marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M1 1l7 4-7 4" style="fill: none; stroke: #5FD6A2; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round"></path></marker>'
         '<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24304a"></stop><stop offset="1" stop-color="#141b29"></stop></linearGradient>'
         '<linearGradient id="fr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2334"></stop><stop offset="1" stop-color="#0d121b"></stop></linearGradient>'
         '<linearGradient id="ft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#40506e"></stop><stop offset="1" stop-color="#2a3650"></stop></linearGradient>'
         '<radialGradient id="gl"><stop offset="0" stop-color="rgba(255,122,138,0.30)"></stop><stop offset="0.55" stop-color="rgba(240,179,126,0.10)"></stop><stop offset="1" stop-color="rgba(240,179,126,0)"></stop></radialGradient>'
         '</defs>')

# площадка и свечение под домом
g = 18
o.append('<ellipse cx="1118" cy="742" rx="250" ry="62" style="fill: url(#gl)"></ellipse>')
o.append('<path d="%s" style="fill: rgba(29,38,54,0.6); stroke: rgba(255,255,255,0.12)"></path>' % poly([P(-g, -g), P(A + g, -g), P(A + g, B + g), P(-g, B + g)]))

# стены и крыша
o.append('<path d="%s" style="fill: url(#fl); %s"></path>' % (poly([L(0, 0), L(A, 0), L(A, H), L(0, H)]), EDGE))
o.append('<path d="%s" style="fill: url(#fr); %s"></path>' % (poly([R(0, 0), R(B, 0), R(B, H), R(0, H)]), EDGE))
o.append('<path d="%s" style="fill: url(#ft); %s"></path>' % (poly([P(0, 0, H), P(A, 0, H), P(A, B, H), P(0, B, H)]), EDGE))
i = 12
o.append('<path d="%s" style="fill: none; stroke: rgba(255,255,255,0.22)"></path>' % poly([P(i, i, H), P(A - i, i, H), P(A - i, B - i, H), P(i, B - i, H)]))
for (x0, x1, y0, y1, bh) in ((36, 86, 34, 80, 14), (120, 160, 60, 110, 9)):
    o.append('<path d="%s" style="fill: #1a2233; %s"></path>' % (poly([P(x0, y1, H), P(x1, y1, H), P(x1, y1, H + bh), P(x0, y1, H + bh)]), EDGE))
    o.append('<path d="%s" style="fill: #111723; %s"></path>' % (poly([P(x1, y1, H), P(x1, y0, H), P(x1, y0, H + bh), P(x1, y1, H + bh)]), EDGE))
    o.append('<path d="%s" style="fill: #36445f; %s"></path>' % (poly([P(x0, y0, H + bh), P(x1, y0, H + bh), P(x1, y1, H + bh), P(x0, y1, H + bh)]), EDGE))
ax, ay = P(150, 30, H)
o.append('<path d="M%.1f %.1fv-26" style="stroke: rgba(255,255,255,0.5); stroke-width: 1.4"></path><circle class="blink" cx="%.1f" cy="%.1f" r="3" style="fill: #FF2D46"></circle>' % (ax, ay, ax, ay - 28))

# цоколь, шахта стояков, перекрытия
o.append('<path d="%s" style="fill: rgba(6,9,14,0.45)"></path>' % poly([L(0, 0), L(A, 0), L(A, BASE), L(0, BASE)]))
o.append('<path d="%s" style="fill: rgba(6,9,14,0.45)"></path>' % poly([R(0, 0), R(B, 0), R(B, BASE), R(0, BASE)]))
o.append('<path d="%s" style="fill: rgba(6,9,14,0.5)"></path>' % poly([L(82, BASE), L(118, BASE), L(118, H - 6), L(82, H - 6)]))
floors = ''
for k in range(N):
    z = BASE + FH * k
    floors += line([L(0, z), L(A, z), R(B, z)])
o.append('<path d="%s" style="fill: none; stroke: rgba(255,255,255,0.10)"></path>' % floors)

# окна по этажам: загораются волной снизу вверх
for k in range(N):
    zb = BASE + FH * k + 4
    z0, z1 = zb + 7, zb + 21
    left = ''.join(poly([L(u, z0), L(u + 28, z0), L(u + 28, z1), L(u, z1)]) for u in (12, 46, 124, 158))
    right = ''.join(poly([R(v, z0), R(v + 22, z0), R(v + 22, z1), R(v, z1)]) for v in (14, 48, 82, 116))
    o.append('<path d="%s" style="fill: rgba(143,180,240,0.10); stroke: rgba(255,255,255,0.12); stroke-width: 0.7"></path>' % (left + right))
    o.append('<g class="fw" style="--k: %d"><path d="%s" style="fill: #FFC98F; filter: drop-shadow(0 0 5px rgba(240,179,126,0.7))"></path><path d="%s" style="fill: #C98F5A"></path></g>' % (k, left, right))

# поэтажная разводка от стояков к квартирам
bg = bc = ''
for k in range(N):
    zb = BASE + FH * k + 4
    bg += line([L(10, zb + 3), L(190, zb + 3)])
    bc += line([L(10, zb), L(190, zb)])
o.append('<path d="%s" style="fill: none; stroke: %s; stroke-width: 1.5; opacity: 0.8"></path>' % (bg, GVS))
o.append('<path d="%s" style="fill: none; stroke: %s; stroke-width: 1.5; opacity: 0.8"></path>' % (bc, CO))

# трубы: ввод в цоколь, вдоль цоколя до шахты, стояк вверх
YG, YC = 650, 690
zg, zc = L(0, 0)[1] - YG, L(0, 0)[1] - YC
xl = L(0, 0)[0]
o.append(tube(line([L(0, zg), L(91, zg), L(91, H - 10)]), GVS, GVS_D, 7.5, 'flowB'))
o.append(tube(line([L(0, zc), L(109, zc), L(109, H - 10)]), CO, CO_D, 7.5, 'flowB'))
o.append('<path d="%s" style="fill: none; stroke: rgba(255,255,255,0.6); stroke-width: 1.6"></path>' % line([L(A, 0), L(A, H)]))
o.append(tube('M506 %d H%.1f' % (YG, xl), GVS, GVS_D, 15))
o.append(tube('M506 %d H%.1f' % (YC, xl), CO, CO_D, 15))
for x in (530, 700, 905):
    o.append(flange(x, YG, 15, GVS_L, GVS_D) + flange(x, YC, 15, CO_L, CO_D))
o.append('<rect x="%.1f" y="%.1f" width="12" height="27" rx="3" style="fill: %s; stroke: %s; stroke-width: 1.5"></rect>' % (xl - 8, YG - 13.5, GVS_L, GVS_D))
o.append('<rect x="%.1f" y="%.1f" width="12" height="27" rx="3" style="fill: %s; stroke: %s; stroke-width: 1.5"></rect>' % (xl - 8, YC - 13.5, CO_L, CO_D))

# узел учёта
o.append('<rect x="740" y="616" width="120" height="108" rx="16" style="fill: rgba(12,17,24,0.9); stroke: %s; stroke-width: 1.5; filter: drop-shadow(0 0 10px rgba(124,207,208,0.45))"></rect>' % TEAL)
o.append('<text x="812" y="604" style="fill: %s; font-size: 15px; font-weight: 700; letter-spacing: 0.06em">ОДПУ</text>' % TEAL)
for (y, c) in ((YG, GVS), (YC, CO)):
    o.append('<g transform="translate(800 %d)"><circle r="17" style="fill: #0c1118; stroke: %s; stroke-width: 3"></circle>'
             '<path d="M-11 0h3M8 0h3M0 -11v3M-8 -8l2 2M8 -8l-2 2" style="fill: none; stroke: rgba(255,255,255,0.45); stroke-width: 1.4; stroke-linecap: round"></path>'
             '<path class="needle" d="M0 3V-10" style="fill: none; stroke: #ffffff; stroke-width: 2.2; stroke-linecap: round"></path><circle r="2.4" style="fill: #ffffff"></circle></g>' % (y, c))

# данные в АСУПР и подтверждённые объёмы
rso = 'M506 385H640Q660 385 660 365V330Q660 310 680 310H709'
odpu = 'M800 616V392'
o.append('<g style="fill: none; stroke: %s; stroke-width: 1.8; stroke-dasharray: 6 6; opacity: 0.7"><path d="%s"></path><path d="%s"></path></g>' % (TEAL, rso, odpu))
o.append('<g style="fill: none; stroke: %s; stroke-width: 2.6"><path class="flow" d="%s"></path><path class="flow" d="%s"></path></g>' % (TEAL, rso, odpu))
o.append('<text x="520" y="374" style="fill: #A7B2C2; font-size: 14px">данные РСО</text>')
o.append('<text x="814" y="508" style="fill: #A7B2C2; font-size: 14px">показания ОДПУ</text>')
o.append('<path d="M877 250H1378" marker-end="url(#arr)" style="fill: none; stroke: #5FD6A2; stroke-width: 2"></path>')
o.append('<path class="flow" d="M877 250H1370" style="fill: none; stroke: #5FD6A2; stroke-width: 2.6"></path>')
o.append('<text x="1128" y="238" style="fill: #A7B2C2; font-size: 14px; text-anchor: middle">подтверждённые объёмы</text>')

svg = ('<svg viewBox="0 0 1920 1080" width="1920" height="1080" role="img" aria-label="ГВС и ЦО поступают в многоквартирный дом по трубам через общедомовые приборы учёта, поднимаются по стоякам и расходятся по этажам; показания и данные РСО передаются в АСУПР, которая рассчитывает баланс и передаёт подтверждённые объёмы" '
       'style="position: absolute; left: 0; top: 0; display: block; pointer-events: none; font-family: inherit">\n    '
       + '\n    '.join(o) + '\n  </svg>')

page = open(PAGE, encoding='utf-8').read()
page, n = re.subn(r'<!-- SCENE:BEGIN -->.*?<!-- SCENE:END -->', lambda m: '<!-- SCENE:BEGIN -->\n  ' + svg + '\n  <!-- SCENE:END -->', page, flags=re.S)
assert n == 1, 'метки SCENE не найдены'
open(PAGE, 'w', encoding='utf-8').write(page)
print('scene written, %d KB' % (len(svg) // 1024))
