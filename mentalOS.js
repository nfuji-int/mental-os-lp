/* =========================================================
   メンタルOS — interactions
   1. Clickable buttons laid over the section images
   2. 資料ダウンロード / オンラインで相談 modal form
   3. Smooth scrolling (footer menu, sticky header offset)
   4. Sticky header shadow + back-to-top button
   5. Scroll-reveal animation
   6. FAQ accordion (expand / collapse)
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- section anchors ---------- */
  function markSections() {
    var map = [
      ['#what', 'img[alt="測る、支える、向上させる。"]'],
      ['#why', 'img[alt^="why we are chosen"]'],
      ['#plans', 'img[alt="どこまで任せるかで、選べます。"]'],
      ['#contact', 'img[alt="働きやすい環境づくりを、ここから始めませんか。"]']
    ];
    map.forEach(function (m) {
      var el = $(m[1]);
      if (!el) return;
      var target = el.closest('.hs-wrap') || el;
      if (m[0] === '#contact') target = target.parentElement || target;
      if (m[0] === '#what' || m[0] === '#plans') target = el;
      target.id = m[0].slice(1);
    });
  }

  /* ---------- clickable areas over images (x, y, w, h in % of the image) ---------- */
  var HOTSPOTS = [
    { img: 'img[alt="header"]', sticky: true, spots: [
      { x: 68.3, y: 19,   w: 14.9, h: 62,   act: 'download', label: '資料ダウンロード' },
      { x: 84.1, y: 19,   w: 14.4, h: 62,   act: 'consult',  label: 'オンラインで相談' } ] },
    { img: 'img.hero-copy-img', wrapClass: 'hero-copy-wrap', spots: [
      { x: 0,    y: 72.4, w: 46.8, h: 17.4, act: 'download', label: '資料をダウンロード' },
      { x: 49.4, y: 72.4, w: 45.7, h: 17.4, act: 'consult',  label: 'オンラインで相談する' } ] },
    { img: 'img[alt^="Open／Base／Care／Boost"]', spots: [
      { x: 32.5, y: 49.4, w: 34.8, h: 6.6,  act: 'download', label: '資料をダウンロード' } ] },
    { img: '.final-cta-buttons img', spots: [
      { x: 2.0,  y: 10.4, w: 46.5, h: 79.2, act: 'register', label: '今すぐ無料プランを登録する' },
      { x: 51.5, y: 10.4, w: 46.5, h: 79.2, act: 'download', label: '資料ダウンロード' } ] },
    { img: 'img[alt="働きやすい環境づくりを、ここから始めませんか。"]', spots: [
      { x: 12.9, y: 51.4, w: 36,   h: 26,   act: 'download', label: '資料をダウンロードする' },
      { x: 51.2, y: 51.4, w: 36,   h: 26,   act: 'consult',  label: 'オンラインで相談する（下部）' } ] },
    { img: 'img[alt="footer"]', spots: [
      { x: 62,   y: 14,   w: 7,    h: 13,   act: '#what',    label: 'できること' },
      { x: 71,   y: 14,   w: 8,    h: 13,   act: '#why',     label: '選ばれる理由' },
      { x: 81,   y: 14,   w: 3.6,  h: 13,   act: '#plans',   label: '料金' },
      { x: 87,   y: 14,   w: 9,    h: 13,   act: '#contact', label: 'ココロチェック' } ] }
  ];

  function buildHotspots() {
    HOTSPOTS.forEach(function (cfg) {
      var img = $(cfg.img);
      if (!img) return;
      var wrap;
      if (img.parentElement.classList.contains('hs-wrap')) {
        wrap = img.parentElement;                 // wrapper already in the HTML
        if ($('.hotspot', wrap)) return;
      } else {
        wrap = document.createElement('div');
        wrap.className = 'hs-wrap' + (cfg.wrapClass ? ' ' + cfg.wrapClass : '') + (cfg.sticky ? ' hs-sticky' : '');
        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);
      }
      cfg.spots.forEach(function (s) {
        var a = document.createElement('a');
        a.className = 'hotspot';
        a.href = s.act.charAt(0) === '#' ? s.act : '#contact-form';
        a.setAttribute('role', 'button');
        a.setAttribute('aria-label', s.label);
        a.dataset.action = s.act;
        a.style.cssText = 'left:' + s.x + '%;top:' + s.y + '%;width:' + s.w + '%;height:' + s.h + '%;';
        wrap.appendChild(a);
      });
    });

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.hotspot');
      if (!a) return;
      e.preventDefault();
      var act = a.dataset.action;
      if (act.charAt(0) === '#') scrollToId(act.slice(1));
      else openModal(act, a);
    });
  }

  /* ---------- smooth scroll with sticky-header offset ---------- */
  function headerHeight() {
    var h = $('.hs-sticky');
    return h ? h.getBoundingClientRect().height : 0;
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight() - 12;
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* ---------- modal form ---------- */
  var modal, lastFocus;
  var TITLES = {
    download: { title: '資料をダウンロード', btn: '資料を受け取る' },
    consult:  { title: 'オンラインで相談する', btn: '相談を申し込む' },
    register: { title: '無料プランを登録する', btn: '無料で登録する' }
  };

  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'mos-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="mos-modal__backdrop" data-close></div>' +
      '<div class="mos-modal__card" role="dialog" aria-modal="true" aria-labelledby="mos-modal-title">' +
        '<button type="button" class="mos-modal__x" data-close aria-label="閉じる">&times;</button>' +
        '<form class="mos-form" novalidate>' +
          '<h2 id="mos-modal-title" class="mos-modal__title"></h2>' +
          '<label>会社名<input name="company" type="text" autocomplete="organization" required></label>' +
          '<label>お名前<input name="name" type="text" autocomplete="name" required></label>' +
          '<label>メールアドレス<input name="email" type="email" autocomplete="email" required></label>' +
          '<p class="mos-form__error" role="alert" hidden></p>' +
          '<button type="submit" class="mos-form__submit"></button>' +
          '<p class="mos-form__note">入力1分／この場で料金は発生しません／しつこい営業はいたしません</p>' +
        '</form>' +
        '<div class="mos-done" hidden>' +
          '<p class="mos-done__mark">&#10003;</p>' +
          '<p class="mos-done__text">送信ありがとうございます。<br>担当よりご連絡いたします。</p>' +
          '<button type="button" class="mos-form__submit" data-close>閉じる</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
      if (e.key === 'Tab' && !modal.hidden) trapFocus(e);
    });

    var form = $('.mos-form', modal);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('.mos-form__error', modal);
      var f = form.elements, bad = null;
      ['company', 'name', 'email'].forEach(function (n) {
        f[n].classList.remove('is-invalid');
        if (!bad && !f[n].value.trim()) bad = f[n];
      });
      if (!bad && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) bad = f.email;
      if (bad) {
        bad.classList.add('is-invalid'); bad.focus();
        err.textContent = bad === f.email && f.email.value.trim() ? 'メールアドレスの形式をご確認ください。' : '未入力の項目があります。';
        err.hidden = false;
        return;
      }
      err.hidden = true;
      // TODO: send the form data to your server here (fetch / form endpoint)
      form.hidden = true;
      $('.mos-done', modal).hidden = false;
      $('.mos-done .mos-form__submit', modal).focus();
    });
  }

  function openModal(kind, trigger) {
    var t = TITLES[kind] || TITLES.download;
    lastFocus = trigger || document.activeElement;
    $('.mos-modal__title', modal).textContent = t.title;
    $('.mos-form__submit', modal).textContent = t.btn;
    var form = $('.mos-form', modal);
    form.reset(); form.hidden = false;
    $$('.is-invalid', modal).forEach(function (n) { n.classList.remove('is-invalid'); });
    $('.mos-form__error', modal).hidden = true;
    $('.mos-done', modal).hidden = true;
    modal.hidden = false;
    document.documentElement.classList.add('mos-lock');
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    setTimeout(function () { form.elements.company.focus(); }, 30);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    setTimeout(function () { modal.hidden = true; }, reduceMotion ? 0 : 200);
    document.documentElement.classList.remove('mos-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function trapFocus(e) {
    var f = $$('button, input, a[href]', modal).filter(function (n) { return !n.hidden && n.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- header shadow + back-to-top ---------- */
  function initScrollUI() {
    var header = $('.hs-sticky');
    var top = $('.back-to-top');
    if (top) {
      top.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
    var ticking = false;
    function update() {
      var y = window.pageYOffset;
      if (header) header.classList.toggle('is-stuck', y > 4);
      if (top) top.classList.toggle('is-visible', y > 600);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var els = $$('.wrap > img, .wrap > .hs-wrap, .wrap > div, .reason-card-img, .flow-connector')
      .filter(function (el) { return !el.closest('.hero') && !el.classList.contains('stats-wrap'); });
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh) return;      // already on screen: leave alone
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    $$('.faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var open = !item.classList.contains('is-open');
        if (open) {                       // only one answer open at a time
          $$('.faq-item.is-open').forEach(function (other) {
            if (other === item) return;
            other.classList.remove('is-open');
            $('.faq-q', other).setAttribute('aria-expanded', 'false');
          });
        }
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFaq();
    buildHotspots();
    markSections();
    buildModal();
    initScrollUI();
    initReveal();
  });
})();