(function () {
  'use strict';

  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 装飾用のCSSをJSから追加（style.cssは触らない） ---------- */
  var css = [
    '.kd-progress{position:fixed;left:0;top:0;height:4px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#ff7aa2,#ffc92e,#6fa8ff);z-index:1000;pointer-events:none}',
    'h1.kd-typing::after{content:"";display:inline-block;width:.08em;height:.9em;margin-left:.08em;background:currentColor;vertical-align:-.08em;animation:kd-blink .8s steps(1) infinite}',
    '@keyframes kd-blink{50%{opacity:0}}',
    '.kd-hide{opacity:0;transform:translateY(14px)}',
    '.kd-show{opacity:1;transform:none;transition:opacity .6s ease,transform .6s ease}',
    '.kd-usagi{position:relative;display:inline-block}',
    '.kd-usagi img{display:block;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.kd-bubble{position:absolute;left:100%;top:4px;margin-left:10px;padding:6px 12px;border:2px solid #222;border-radius:14px;background:#fff;color:#222;font-size:14px;white-space:nowrap;opacity:0;pointer-events:none}',
    'tr{transition:background-color .2s}',
    'tr:hover{background-color:rgba(255,201,46,.28)}',
    '.kd-spark{position:fixed;left:0;top:0;pointer-events:none;z-index:999;line-height:1}'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- 1. スクロール進捗バー ---------- */
  var bar = document.createElement('div');
  bar.className = 'kd-progress';
  document.body.appendChild(bar);
  var ticking = false;
  function updateBar() {
    var max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  addEventListener('resize', updateBar);
  updateBar();

  /* ---------- 2. うさぎ：クリックで跳ねて、ひとことしゃべる ---------- */
  var img = document.querySelector('img[src="usagi.png"]');
  var bubble = null, lastMsg = '';
  var MESSAGES = ['こんにちは！', 'ようこそ！', 'ゆっくり見ていってね', 'よろしくね', 'スクロールしてみてね'];

  function hop() {
    if (!img || RM) return;
    img.animate([
      { transform: 'translateY(0) scale(1,1)' },
      { transform: 'translateY(0) scale(1.1,.9)', offset: .15 },
      { transform: 'translateY(-26px) scale(.95,1.08)', offset: .5 },
      { transform: 'translateY(0) scale(1.1,.9)', offset: .85 },
      { transform: 'translateY(0) scale(1,1)' }
    ], { duration: 600, easing: 'ease-out' });
  }
  function say(msg) {
    if (!bubble) return;
    if (!msg) {
      do { msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]; } while (msg === lastMsg);
    }
    lastMsg = msg;
    bubble.textContent = msg;
    bubble.animate([
      { opacity: 0, transform: 'translateY(6px) scale(.9)' },
      { opacity: 1, transform: 'none', offset: .12 },
      { opacity: 1, transform: 'none', offset: .85 },
      { opacity: 0, transform: 'none' }
    ], { duration: 2400 });
  }
  if (img) {
    var wrap = document.createElement('span');
    wrap.className = 'kd-usagi';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    bubble = document.createElement('span');
    bubble.className = 'kd-bubble';
    wrap.appendChild(bubble);
    img.title = 'クリックしてみてね';
    img.addEventListener('click', function () { hop(); say(); });
  }

  /* ---------- 3. タイトルを1文字ずつ表示 ---------- */
  var h1 = document.querySelector('h1');
  if (h1 && !RM) {
    var full = h1.textContent;
    h1.setAttribute('aria-label', full);
    h1.style.minHeight = h1.offsetHeight + 'px'; // 文字が空の間も高さを保つ
    h1.textContent = '';
    h1.classList.add('kd-typing');
    var n = 0;
    (function type() {
      h1.textContent = full.slice(0, ++n);
      if (n < full.length) {
        setTimeout(type, 110);
      } else {
        setTimeout(function () { h1.classList.remove('kd-typing'); }, 2500);
        setTimeout(function () { hop(); say('ようこそ！'); }, 400);
      }
    })();
  }

  /* ---------- 4. スクロールで順番に表示 ---------- */
  var targets = document.querySelectorAll('body > h2, body > h3, body > p, body > ul, body > table, body > iframe');
  if (!RM && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove('kd-hide');
        en.target.classList.add('kd-show');
        io.unobserve(en.target);
      });
    }, { threshold: .15 });
    targets.forEach(function (el) { el.classList.add('kd-hide'); io.observe(el); });
  }

  /* ---------- 5. マウスの軌跡にきらきら ---------- */
  if (!RM) {
    var COLORS = ['#ff7aa2', '#ffc92e', '#6fa8ff', '#7bdcb5'];
    var MARKS = ['✦', '✧', '★'];
    var last = 0;
    addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;      // スマホでは出さない
      if (e.timeStamp - last < 45) return;        // 出しすぎないよう間引く
      last = e.timeStamp;
      var s = document.createElement('span');
      s.className = 'kd-spark';
      s.textContent = MARKS[Math.floor(Math.random() * MARKS.length)];
      s.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      s.style.fontSize = (10 + Math.random() * 12) + 'px';
      document.body.appendChild(s);
      var x = e.clientX, y = e.clientY;
      var dx = (Math.random() - .5) * 30, dy = 20 + Math.random() * 30;
      s.animate([
        { transform: 'translate(' + x + 'px,' + y + 'px) scale(1)', opacity: 1 },
        { transform: 'translate(' + (x + dx) + 'px,' + (y + dy) + 'px) scale(.2) rotate(120deg)', opacity: 0 }
      ], { duration: 700, easing: 'ease-out' }).onfinish = function () { s.remove(); };
    });
  }
})();
