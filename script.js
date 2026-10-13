(function () {
var track = document.getElementById('track');
var nav = document.getElementById('nav');
var indicator = document.getElementById('indicator');
var buttons = Array.prototype.slice.call(nav.querySelectorAll('button'));
var slides = track.children;
var clip = document.getElementById('photoClip');
var stage = document.querySelector('.stage');
var photoWrap = document.querySelector('.photo-wrap');
var current = 0;

function moveIndicator() {
  var b = buttons[current];
  indicator.style.width = b.offsetWidth + 'px';
  indicator.style.transform = 'translateX(' + b.offsetLeft + 'px)';
}

function retrigger(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // restart the animation
  el.classList.add(cls);
}

function go(i) {
  if (i < 0 || i >= slides.length) return;
  var changed = i !== current;
  current = i;
  track.style.transform = 'translateX(' + (-100 * i) + '%)';
  buttons.forEach(function (b, n) {
    if (n === i) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });
  // keep each slide scrolled to the top and hide offscreen ones from assistive tech
  Array.prototype.forEach.call(slides, function (s, n) {
    s.setAttribute('aria-hidden', n === i ? 'false' : 'true');
    if (n !== i) s.scrollTop = 0;
  });
  // the photo and its box only show on About
  stage.classList.toggle('no-photo', i !== 0);
  photoWrap.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
  moveIndicator();
  buttons[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  if (changed) {
    if (i === 0) retrigger(clip, 'pop');
    retrigger(indicator, 'squish');
    retrigger(buttons[i], 'hop');
  }
}

// Any element with data-go (nav buttons and in-slide buttons)
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-go]');
  if (t) go(parseInt(t.getAttribute('data-go'), 10));
});

// Arrow keys move between sections
document.addEventListener('keydown', function (e) {
  if (e.target.closest('input, textarea')) return;
  if (e.key === 'ArrowRight') go(Math.min(current + 1, slides.length - 1));
  if (e.key === 'ArrowLeft') go(Math.max(current - 1, 0));
});

window.addEventListener('resize', moveIndicator);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
go(0);
// first load: no bounce on the indicator
requestAnimationFrame(moveIndicator);
})();

/* ---------- Falling numbers and variables (outside the main box) ---------- */
(function () {
  var canvas = document.getElementById('rain');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var TOKENS = [
    // numbers and code
    '0', '1', '7', '42', '255', '1010', '0x1F', '0xDEAD', 'i++', 'let', 'const', 'null', 'true', '=>', '{ }', '</>', '&&',
    // networking
    'TCP', 'UDP', 'ICMP', 'ARP', 'DNS', 'DHCP', 'HTTP', 'HTTPS', 'TLS', 'SSL', 'FTP', 'SMTP', 'VPN', 'VLAN', 'NAT',
    'SYN', 'ACK', 'FIN', '200 OK', '404', '403', '80', '443', '22', '53', '3389',
    '192.168.1.1', '10.0.0.1', '172.16.0.1', '8.8.8.8', '127.0.0.1', '::1', '/24', 'AA:BB:CC',
    'ping', 'ping 8.8.8.8', 'traceroute', 'netstat', 'ipconfig', 'nslookup', 'tcpdump', 'wireshark', 'packet', 'router',
    'switch', 'subnet', 'gateway', 'proxy', 'port 22', 'GET /login', 'POST /api',
    // cybersecurity
    'firewall', 'allow 443', 'deny all', 'sudo', 'ssh', 'nmap', 'root', 'chmod 600', 'ls -la', 'hash', 'SHA-256', 'MD5',
    'AES', 'RSA', 'XOR', 'base64', 'cert', 'token', 'auth', 'MFA', 'IDS', 'SIEM', 'SOC', 'CVE', 'XSS', 'SQLi', 'CSRF',
    'DDoS', 'malware', 'phishing', 'exploit', 'payload', 'brute force', 'encrypt', 'decrypt', 'password', '*****',
    'SELECT *', 'DROP TABLE', 'access denied', 'logged in'
  ];
  // small outline icons (24 x 24 grid): shield, padlock, key, bug, terminal, wifi,
  // network, server, globe, cloud, firewall, mail, router
  var ICONS = [
    'M12 2.5 L20 5.5 V11.5 C20 16.5 16.6 20.2 12 21.8 C7.4 20.2 4 16.5 4 11.5 V5.5 Z M8.5 12 L11 14.5 L15.5 9.5',
    'M5.5 11 H18.5 V21 H5.5 Z M8.5 11 V7.5 A3.5 3.5 0 0 1 15.5 7.5 V11 M12 15 V17.5',
    'M3.5 15 A4 4 0 1 0 11.5 15 A4 4 0 1 0 3.5 15 Z M10.5 12 L20.5 2.5 M17.5 5.5 L20 8 M14.5 8.5 L16.5 10.5',
    'M9 8.5 A3 3.5 0 0 1 15 8.5 V14 A3 4.5 0 0 1 9 14 Z M12 8.5 V18.5 M9 11.5 H4.5 M9 15 H4.5 M15 11.5 H19.5 M15 15 H19.5 M9.5 6 L7 3.5 M14.5 6 L17 3.5',
    'M3 5 H21 V19 H3 Z M7 9.5 L10.5 12 L7 14.5 M12.5 15 H17',
    'M2 9 A15 15 0 0 1 22 9 M5 12.5 A10.5 10.5 0 0 1 19 12.5 M8.5 16 A5 5 0 0 1 15.5 16 M12 19.5 L12.01 19.5',
    'M10 5 A2 2 0 1 0 14 5 A2 2 0 1 0 10 5 Z M3 19 A2 2 0 1 0 7 19 A2 2 0 1 0 3 19 Z M17 19 A2 2 0 1 0 21 19 A2 2 0 1 0 17 19 Z M11 6.8 L6 17.2 M13 6.8 L18 17.2 M7 19 H17',
    'M4 4 H20 V10 H4 Z M4 14 H20 V20 H4 Z M7 7 H7.01 M7 17 H7.01 M11 7 H17 M11 17 H17',
    'M3 12 A9 9 0 1 0 21 12 A9 9 0 1 0 3 12 Z M3 12 H21 M12 3 C8 7 8 17 12 21 C16 17 16 7 12 3',
    'M7 18 A4 4 0 0 1 6.5 10.1 A5.5 5.5 0 0 1 17 9 A4.5 4.5 0 0 1 17.5 18 Z',
    'M3 5 H21 V19 H3 Z M3 9.7 H21 M3 14.3 H21 M9 5 V9.7 M15 9.7 V14.3 M9 14.3 V19',
    'M3 6 H21 V18 H3 Z M3 6 L12 13 L21 6',
    'M4 14 H20 V19 H4 Z M8 16.5 H8.01 M12 16.5 H12.01 M7 14 L5 7 M17 14 L19 7'
  ].map(function (d) { return new Path2D(d); });
  var ICON_SHARE = 0.22;                    // about 1 in 5 falling items is an icon
  var COLOR = 'rgba(125, 82, 38, 0.45)';   // one dark bronze for everything, no highlights
  var DENSITY = 10000;                      // lower number = more falling items
  // the background is meant to be live, so it always runs; it just falls slower if the computer asks for reduced motion
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPEED = reduce ? 0.5 : 1;

  var items = [], w = 0, h = 0, dpr = 1, last = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick() { return TOKENS[Math.floor(Math.random() * TOKENS.length)]; }

  // every item is on its own: its own spot, speed and text
  function spawn(item, anywhere) {
    item.x = rnd(20, w - 20);
    item.y = anywhere ? rnd(-20, h) : rnd(-60, -10);
    item.speed = rnd(35, 110);               // pixels per second
    item.text = pick();
    item.icon = Math.random() < ICON_SHARE ? ICONS[Math.floor(Math.random() * ICONS.length)] : null;
    return item;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLOR;
    ctx.strokeStyle = COLOR;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    var count = Math.max(30, Math.round((w * h) / DENSITY));
    items = [];
    for (var i = 0; i < count; i++) items.push(spawn({}, true));
  }

  function step(t) {
    var dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      it.y += it.speed * SPEED * dt;
      if (it.y > h + 20) spawn(it, false);   // left the bottom: comes back in at the top, somewhere else
      if (it.icon) {
        ctx.save();
        ctx.translate(it.x - 12, it.y - 12);
        ctx.stroke(it.icon);
        ctx.restore();
      } else {
        ctx.fillText(it.text, it.x, it.y);
      }
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  last = performance.now();
  requestAnimationFrame(step);
})();