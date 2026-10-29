/* Aniruddha Das Photography — main.js
   Vanilla JS, no libraries. One rAF loop drives every scroll-linked effect. */
(function () {
  "use strict";

  var S = window.SITE || { albums: [], films: [], contact: {} };
  var body = document.body;
  var root = document.documentElement;
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ICON = function (n) { return '<svg aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function safe(fn) { try { return fn(); } catch (e) { return null; } }
  var isHome = body.classList.contains("page-home");
  var isGallery = body.classList.contains("page-gallery");
  var isFilms = body.classList.contains("page-films");
  var vh = window.innerHeight;

  /* ======================================================
     Text splitting
     ====================================================== */
  function splitWords(el) {
    var label = el.textContent.replace(/\s+/g, " ").trim();
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "wd";
            var s = document.createElement("span"); s.style.setProperty("--i", i++); s.textContent = t;
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", label);
  }
  $$("[data-words]").forEach(splitWords);
  $$("[data-chars]").forEach(function (el) {
    var t = el.textContent, i = 0;
    el.innerHTML = t.split("").map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + esc(c) + "</span>"; }).join("");
  });

  /* ======================================================
     Intro + page curtain
     ====================================================== */
  var cur = $("#curtain");
  var covered = root.classList.contains("cur-cover");
  var intro = root.classList.contains("cur-intro");
  function reveal() { body.classList.add("is-ready"); }
  if (covered && cur && !RM) {
    if (intro) safe(function () { sessionStorage.setItem("ad-intro", "1"); });
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1400); })]).then(function () {
      setTimeout(function () {
        cur.classList.add("up");
        root.classList.remove("cur-cover", "cur-intro");
        setTimeout(reveal, intro ? 450 : 260);
        setTimeout(function () { cur.classList.remove("up"); }, 2600);
      }, intro ? 1500 : 90);
    });
  } else {
    root.classList.remove("cur-cover", "cur-intro");
    if (isHome) safe(function () { sessionStorage.setItem("ad-intro", "1"); });
    requestAnimationFrame(function () { requestAnimationFrame(reveal); });
  }
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && cur) { cur.classList.remove("show", "in", "up"); reveal(); }
  });

  function normPath(p) { return p.replace(/index\.html$/, ""); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!href || /^(mailto|tel):/i.test(href)) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    var same = normPath(url.pathname) === normPath(location.pathname) && url.search === location.search;
    if (same && url.hash) {
      var t = $(url.hash);
      if (t) { e.preventDefault(); closeMenu(); t.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }); }
      return;
    }
    if (same && !url.hash) { e.preventDefault(); closeMenu(); return; }
    if (RM || !cur) return;
    e.preventDefault();
    closeMenu();
    safe(function () { sessionStorage.setItem("ad-leave", "1"); });
    cur.classList.add("show");
    void cur.offsetWidth;
    cur.classList.add("in");
    setTimeout(function () { location.href = url.href; }, 820);
  });
  $$("[data-top]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }); });
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ======================================================
     Menu
     ====================================================== */
  var burger = $(".burger"), menu = $("#menu");
  function closeMenu() {
    if (!menu || !menu.classList.contains("open")) return;
    menu.classList.remove("open"); body.classList.remove("menu-open", "no-scroll");
    burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Open menu"); menu.setAttribute("aria-hidden", "true");
  }
  if (burger && menu) {
    $$("nav a", menu).forEach(function (a, i) { a.style.setProperty("--n", i); });
    burger.addEventListener("click", function () {
      var open = !menu.classList.contains("open");
      if (!open) return closeMenu();
      menu.classList.add("open"); body.classList.add("menu-open", "no-scroll");
      burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Close menu"); menu.setAttribute("aria-hidden", "false");
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 1100) closeMenu(); });
  }
  // nav highlight on sub pages
  $$(".hdr__nav a").forEach(function (a) {
    var h = a.getAttribute("href");
    if ((isFilms && h === "films.html") || (isGallery && /albums/.test(h))) a.classList.add("on");
  });

  /* ======================================================
     Reveals
     ====================================================== */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null;
  function watch(el) { if (io) io.observe(el); else el.classList.add("in"); }
  $$(".rv,[data-words],.foot__big").forEach(watch);

  /* ======================================================
     Hero video (lazy)
     ====================================================== */
  var hero = $("#hero");
  var heroVid = $("#heroVideo");
  if (hero && heroVid && !RM && !(navigator.connection && navigator.connection.saveData)) {
    var heroStarted = false;
    setTimeout(function () {
      heroVid.src = heroVid.dataset.src;
      heroVid.addEventListener("playing", function () { heroVid.classList.add("on"); }, { once: true });
      heroVid.play().catch(function () {});
      heroStarted = true;
    }, 2400);
    if (io) new IntersectionObserver(function (es) {
      if (!heroStarted) return;
      if (es[0].isIntersecting) heroVid.play().catch(function () {}); else heroVid.pause();
    }, { threshold: 0.05 }).observe(hero);
  }
  $$(".float").forEach(function (f) { f.style.setProperty("--k", f.dataset.fl); });

  /* ======================================================
     Statement words + counters
     ====================================================== */
  var stmt = $("#statement");
  var swords = [];
  if (stmt) {
    var text = stmt.textContent.trim();
    stmt.innerHTML = text.split(/\s+/).map(function (w) {
      var hl = /^(feeling,|forget)$/i.test(w) ? " hl" : "";
      return '<span class="sw' + hl + '">' + esc(w) + "</span>";
    }).join(" ");
    swords = $$(".sw", stmt);
  }
  var statsEl = $(".stats");
  if (statsEl && io) {
    new IntersectionObserver(function (es, ob) {
      if (!es[0].isIntersecting) return;
      ob.disconnect();
      $$("[data-count]", statsEl).forEach(function (b) {
        var end = +b.dataset.count, t0 = performance.now(), dur = 1700;
        if (RM) { b.textContent = end; return; }
        (function tick(t) {
          var k = clamp((t - t0) / dur, 0, 1), e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
          b.textContent = Math.round(end * e);
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.5 }).observe(statsEl);
    $$("[data-count]", statsEl).forEach(function (b) { if (!RM) b.textContent = "0"; });
  }

  /* ======================================================
     Scroll loop
     ====================================================== */
  var progress = $(".progress i");
  var header = $(".hdr");
  var fab = $(".fab");
  var contactEl = $("#contact");
  var parallax = $$("[data-speed]").map(function (el) { return { el: el, k: +el.dataset.speed, ref: el.parentElement }; });
  var cols = [];
  var marqs = $$("[data-marq]").map(function (box) {
    var inner = box.firstElementChild;
    return { box: box, inner: inner, dir: +box.dataset.marq, x: 0, w: 0, on: false };
  });
  function measureMarq() {
    marqs.forEach(function (m) { m.w = m.inner.firstElementChild.offsetWidth; if (m.dir > 0 && !m.x) m.x = -m.w * 0.5; });
  }
  measureMarq();
  window.addEventListener("resize", function () { vh = window.innerHeight; measureMarq(); });
  window.addEventListener("load", measureMarq);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureMarq);
  if (io) marqs.forEach(function (m) {
    new IntersectionObserver(function (es) { m.on = es[0].isIntersecting; }, { rootMargin: "100px" }).observe(m.box);
  }); else marqs.forEach(function (m) { m.on = true; });

  var lastY = window.scrollY, lastShown = 0, swOn = -1;
  var tick = function () {
    var y = window.scrollY, dv = y - lastY;
    // progress bar + header + fab
    var maxY = document.documentElement.scrollHeight - vh;
    if (progress) progress.parentElement.style.setProperty("--sp", maxY > 0 ? (y / maxY).toFixed(4) : 0);
    if (header) {
      if (y < vh * 0.6 || dv < -4 || body.classList.contains("menu-open")) header.classList.remove("hide");
      else if (dv > 4) header.classList.add("hide");
    }
    if (fab) {
      fab.classList.toggle("show", y > vh * 0.7);
      if (contactEl) { var cr = contactEl.getBoundingClientRect(); fab.classList.toggle("away", cr.top < vh * 0.6 && cr.bottom > 0); }
    }
    // hero scroll progress
    if (hero && y < hero.offsetHeight * 1.2) hero.style.setProperty("--p", clamp(y / (hero.offsetHeight * 0.85), 0, 1).toFixed(4));
    // parallax
    for (var i = 0; i < parallax.length; i++) {
      var p = parallax[i], r = p.ref.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      p.el.style.setProperty("--py", ((r.top + r.height / 2 - vh / 2) * -p.k * (window.innerWidth < 820 ? 0.4 : 1)).toFixed(1) + "px");
    }
    // gallery column drift
    if (cols.length) {
      var gr = cols[0].parentElement.getBoundingClientRect();
      if (gr.bottom > -300 && gr.top < vh + 300) {
        var c = gr.top + gr.height / 2 - vh / 2;
        cols.forEach(function (col, k) { col.style.setProperty("--py", (c * [0.02, -0.07, 0.05][k % 3] * -1).toFixed(1) + "px"); });
      }
    }
    // marquees (speed up with scroll velocity)
    for (var m = 0; m < marqs.length; m++) {
      var q = marqs[m]; if (!q.on || !q.w) continue;
      q.x += q.dir * -1 * (0.7 + Math.min(Math.abs(dv), 60) * 0.55) * (RM ? 0 : 1);
      if (q.x <= -q.w) q.x += q.w; else if (q.x > 0) q.x -= q.w;
      q.inner.style.transform = "translate3d(" + q.x.toFixed(1) + "px,0,0)";
    }
    // statement fill
    if (swords.length) {
      var sr = stmt.getBoundingClientRect();
      if (sr.top < vh && sr.bottom > 0) {
        var t = clamp((vh * 0.88 - sr.top) / (sr.height + vh * 0.88 - vh * 0.5), 0, 1);
        var on = RM ? swords.length : Math.round(t * swords.length);
        if (on !== swOn) { swords.forEach(function (w, k) { w.classList.toggle("on", k < on); }); swOn = on; }
      }
    }
    lastY = y;
    cursorTick();
    requestAnimationFrame(tick);
  };

  /* ======================================================
     Custom cursor (fine pointers only)
     ====================================================== */
  var cursor = $("#cursor"), cLabel = cursor && cursor.firstElementChild;
  var mx = -100, my = -100, cx = -100, cy = -100, cursorOn = false;
  function cursorTick() {
    if (!cursorOn) return;
    cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
    cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
  }
  if (cursor && FINE && !RM) {
    cursorOn = true;
    body.classList.add("has-cursor");
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; cursor.classList.add("show"); }, { passive: true });
    document.addEventListener("mouseleave", function () { cursor.classList.remove("show"); });
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest && e.target.closest("[data-cursor]");
      if (t) { cLabel.textContent = t.getAttribute("data-cursor"); cursor.classList.add("big"); }
      else cursor.classList.remove("big");
    });
  }
  // magnetic orb
  var orb = $(".orb");
  if (orb && FINE && !RM) {
    orb.addEventListener("mousemove", function (e) {
      var r = orb.getBoundingClientRect();
      orb.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + "px) scale(1.06)";
    });
    orb.addEventListener("mouseleave", function () { orb.style.transform = ""; });
  }
  requestAnimationFrame(tick);

  /* ======================================================
     Film modal (shared)
     ====================================================== */
  var fm = $("#fm"), fmStage = $("#fmStage"), fmTitle = $("#fmTitle");
  var fmLast = null;
  function filmById(id) { return S.films.filter(function (f) { return f.id === id; })[0]; }
  function openFilm(id) {
    var f = filmById(id); if (!f || !fm) return;
    fmLast = document.activeElement;
    fmTitle.textContent = f.title;
    var v = document.createElement("video");
    v.controls = true; v.playsInline = true; v.autoplay = true;
    v.setAttribute("playsinline", ""); v.setAttribute("controlslist", "nodownload");
    v.poster = "assets/video/posters/" + f.id + ".webp";
    v.src = f.src || "assets/video/films/" + f.id + ".mp4";
    if (f.orientation === "portrait") v.className = "portrait";
    fmStage.innerHTML = ""; fmStage.appendChild(v);
    fm.classList.add("open"); fm.setAttribute("aria-hidden", "false"); body.classList.add("no-scroll");
    v.play().catch(function () {});
    setTimeout(function () { var x = $(".fm__x", fm); x && x.focus({ preventScroll: true }); }, 60);
  }
  function closeFilm() {
    if (!fm || !fm.classList.contains("open")) return;
    fm.classList.remove("open"); fm.setAttribute("aria-hidden", "true");
    if (!menu || !menu.classList.contains("open")) body.classList.remove("no-scroll");
    var v = $("video", fmStage); if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
    setTimeout(function () { if (!fm.classList.contains("open")) fmStage.innerHTML = ""; }, 500);
    if (fmLast) fmLast.focus({ preventScroll: true });
  }
  if (fm) {
    $(".fm__x", fm).addEventListener("click", closeFilm);
    fm.addEventListener("click", function (e) { if (e.target === fm || e.target === fmStage) closeFilm(); });
  }
  var dragMoved = false;
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-film]");
    if (!t) return;
    if (dragMoved) { dragMoved = false; return; }
    openFilm(t.getAttribute("data-film"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeFilm(); closeLB(); closeMenu(); }
    if (lb && lb.classList.contains("open")) {
      if (e.key === "ArrowRight") stepLB(1, 1);
      if (e.key === "ArrowLeft") stepLB(-1, -1);
    }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-film][role=button]")) { e.preventDefault(); openFilm(e.target.getAttribute("data-film")); }
  });

  /* ======================================================
     Preview-video helper: play only the few cards near the centre
     ====================================================== */
  function attachPreview(v) {
    if (!v.src) { v.src = v.dataset.src; v.addEventListener("playing", function () { v.classList.add("on"); }); }
    v.muted = true; v.defaultMuted = true; v.playsInline = true;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  function detachPreview(v) { if (!v.paused) v.pause(); }

  /* ======================================================
     HOME: albums deck
     ====================================================== */
  var albList = $("#albList");
  if (albList && S.albums.length) {
    var sec = $("#albums"), deckWrap = $("#albDeck"), blurb = $("#albBlurb"), openA = $("#albOpen"), prog = $("#albProg");
    var albums = S.albums;
    albList.innerHTML = albums.map(function (a, i) {
      return '<li><button type="button" role="tab" aria-selected="false" data-i="' + i + '"><span class="n">' + String(i + 1).padStart(2, "0") + '</span><span class="t">' + esc(a.title) + '</span><span class="c">' + a.count + "</span></button></li>";
    }).join("");
    function img(a, n, eager) {
      var b = "assets/img/" + a.slug + "/" + n;
      return '<img src="' + b + '-sm.webp" srcset="' + b + '-sm.webp 560w, ' + b + '.webp 1200w" sizes="(max-width:820px) 56vw, 24vw" alt="" width="560" height="700" ' + (eager ? "" : 'loading="lazy"') + ">";
    }
    deckWrap.innerHTML = albums.map(function (a, i) {
      return '<div class="deck" data-i="' + i + '"><span class="deck__tab">' + esc(a.title) + " &middot; " + a.count + '</span>' +
        '<div class="card">' + img(a, a.stack[1], i > 0) + '</div><div class="card">' + img(a, a.stack[0], i > 0) + '</div><div class="card">' + img(a, a.cover, i > 0) + "</div>" +
        '<a class="deck__link" href="gallery.html?album=' + a.slug + '" aria-label="Open the ' + esc(a.title) + ' album" tabindex="-1"></a></div>';
    }).join("");
    var btns = $$("button", albList), decks = $$(".deck", deckWrap);
    var idx = -1, elapsed = 0, hold = false, lastTouch = 0, albVisible = false, DUR = 5200;
    function setAlbum(i) {
      i = (i + albums.length) % albums.length;
      if (i === idx) return;
      idx = i; elapsed = 0;
      decks.forEach(function (d, k) { d.classList.toggle("on", k === i); d.classList.toggle("past", k < i); d.querySelector(".deck__link").tabIndex = k === i ? 0 : -1; });
      btns.forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); });
      var a = albums[i];
      sec.style.setProperty("--alb", a.tint);
      blurb.textContent = a.blurb;
      openA.href = "gallery.html?album=" + a.slug;
      var li = btns[i].parentElement, ul = albList;
      if (ul.scrollWidth > ul.clientWidth + 4) ul.scrollTo({ left: li.offsetLeft - ul.clientWidth / 2 + li.clientWidth / 2, behavior: "smooth" });
    }
    setAlbum(0);
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { setAlbum(i); lastTouch = performance.now(); });
      if (FINE) b.addEventListener("mouseenter", function () { setAlbum(i); });
    });
    $$(".albums__nav button").forEach(function (b) { b.addEventListener("click", function () { setAlbum(idx + (+b.dataset.dir)); lastTouch = performance.now(); }); });
    [albList.parentElement, deckWrap].forEach(function (el) {
      el.addEventListener("mouseenter", function () { hold = true; });
      el.addEventListener("mouseleave", function () { hold = false; });
    });
    var tx = 0, ty = 0;
    deckWrap.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    deckWrap.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { setAlbum(idx + (dx < 0 ? 1 : -1)); lastTouch = performance.now(); }
    }, { passive: true });
    new IntersectionObserver(function (es) { albVisible = es[0].isIntersecting; }, { threshold: 0.35 }).observe(sec);
    var albLast = performance.now();
    (function albLoop(now) {
      var dt = Math.min(60, now - albLast); albLast = now;
      var rest = now - lastTouch < 7000;
      if (albVisible && !hold && !rest && !document.hidden && !RM) {
        elapsed += dt;
        if (elapsed >= DUR) setAlbum(idx + 1);
      }
      prog.style.transform = "scaleX(" + clamp(rest || RM ? 0 : elapsed / DUR, 0, 1).toFixed(3) + ")";
      requestAnimationFrame(albLoop);
    })(albLast);
  }

  /* ======================================================
     HOME: reel strip (auto-drifting, draggable, swipeable)
     ====================================================== */
  var strip = $("#reelStrip"), track = $("#reelTrack");
  function reelHTML(f, ghost) {
    return '<button type="button" class="reel" data-film="' + f.id + '" data-cursor="Play"' + (ghost ? ' aria-hidden="true" tabindex="-1"' : "") + '><span class="phone"><span class="phone__screen">' +
      '<img src="assets/video/posters/' + f.id + '-sm.webp" alt="" width="400" height="500" loading="lazy">' +
      '<video muted loop playsinline preload="none" data-src="assets/video/previews/' + f.id + '.mp4" aria-hidden="true"></video>' +
      '<span class="phone__notch"></span><span class="phone__dur">' + esc(f.duration) + '</span>' +
      '<span class="phone__cap"><small>' + esc(f.kind) + '</small><b>' + esc(f.title) + '</b></span>' +
      '<span class="phone__play">' + ICON("play") + "</span></span></span></button>";
  }
  if (strip && track && S.films.length) {
    track.innerHTML = S.films.map(function (f) { return reelHTML(f, false); }).join("") + S.films.map(function (f) { return reelHTML(f, true); }).join("");
    var pos = 0, loopW = 0, userUntil = 0, over = false, inView = false;
    function measureStrip() { loopW = track.scrollWidth / 2 - 0; var firstGhost = track.children[S.films.length]; if (firstGhost) loopW = firstGhost.offsetLeft - track.children[0].offsetLeft; }
    measureStrip();
    window.addEventListener("resize", measureStrip);
    window.addEventListener("load", measureStrip);
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { rootMargin: "80px" }).observe(strip);
    ["touchstart", "wheel", "pointerdown"].forEach(function (ev) {
      strip.addEventListener(ev, function () { userUntil = performance.now() + 2600; }, { passive: true });
    });
    if (FINE) {
      strip.addEventListener("mouseenter", function () { over = true; });
      strip.addEventListener("mouseleave", function () { over = false; });
      // mouse drag
      var dragging = false, sx = 0, sl = 0;
      strip.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; dragging = true; dragMoved = false; sx = e.clientX; sl = strip.scrollLeft; });
      window.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - sx; if (Math.abs(dx) > 5) dragMoved = true;
        strip.scrollLeft = sl - dx;
      });
      window.addEventListener("pointerup", function () { dragging = false; setTimeout(function () { dragMoved = false; }, 30); });
    }
    var lastT = performance.now();
    (function stripLoop(now) {
      var dt = Math.min(48, now - lastT); lastT = now;
      if (loopW > 0) {
        if (strip.scrollLeft >= loopW) { strip.scrollLeft -= loopW; pos = strip.scrollLeft; }
        else if (strip.scrollLeft <= 0 && now < userUntil) { strip.scrollLeft += loopW; pos = strip.scrollLeft; }
        if (inView && !over && now > userUntil && !RM && !document.hidden) { pos += dt * 0.045; strip.scrollLeft = pos; }
        else pos = strip.scrollLeft;
      }
      requestAnimationFrame(stripLoop);
    })(lastT);
    // previews: play the 3 cards nearest the centre of the strip
    var vids = $$("video", track);
    setInterval(function () {
      if (!inView || document.hidden || RM) { vids.forEach(detachPreview); return; }
      var cx0 = window.innerWidth / 2;
      var ranked = vids.map(function (v) { var r = v.getBoundingClientRect(); return { v: v, d: Math.abs(r.left + r.width / 2 - cx0), vis: r.right > 0 && r.left < window.innerWidth }; })
        .filter(function (o) { return o.vis; }).sort(function (a, b) { return a.d - b.d; }).slice(0, window.innerWidth < 700 ? 2 : 3);
      var keep = ranked.map(function (o) { return o.v; });
      vids.forEach(function (v) { if (keep.indexOf(v) < 0) detachPreview(v); });
      keep.forEach(function (v) { if (v.paused) attachPreview(v); });
    }, 700);
  }

  /* ======================================================
     Contact form -> WhatsApp
     ====================================================== */
  var form = $("#enquiry");
  if (form) {
    var err = $("#enqErr");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form), name = (d.get("name") || "").toString().trim();
      if (!name) { err.hidden = false; form.elements.name.focus(); return; }
      err.hidden = true;
      var date = (d.get("date") || "").toString(), place = (d.get("place") || "").toString().trim(), pretty = "";
      if (date) { var dt = new Date(date + "T00:00:00"); if (!isNaN(dt)) pretty = dt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); }
      var lines = ["Hi Aniruddha, I'm " + name + ".", "I'd like to check if you are free for my wedding.", pretty ? "Date: " + pretty : "", place ? "Venue / city: " + place : ""].filter(Boolean);
      var url = "https://wa.me/" + (S.contact.whatsapp || "917002710266") + "?text=" + encodeURIComponent(lines.join("\n"));
      var w = window.open(url, "_blank", "noopener");
      if (!w) location.href = url;
    });
    form.elements.name.addEventListener("input", function () { err.hidden = true; });
  }

  /* ======================================================
     Lightbox (gallery)
     ====================================================== */
  var lb = $("#lb"), lbImg = $("#lbImg"), lbCount = $("#lbCount");
  var lbList = [], lbIdx = 0, lbLast = null;
  function showLB(i, dir) {
    lbIdx = (i + lbList.length) % lbList.length;
    var it = lbList[lbIdx];
    lbImg.classList.remove("swap"); void lbImg.offsetWidth;
    lbImg.style.setProperty("--dx", (dir || 0) * 60 + "px");
    lbImg.src = it.src; lbImg.alt = it.alt;
    if (dir !== undefined && !RM) lbImg.classList.add("swap");
    lbCount.textContent = String(lbIdx + 1).padStart(2, "0") + " / " + String(lbList.length).padStart(2, "0");
    [1, -1].forEach(function (d) { var p = new Image(); p.src = lbList[(lbIdx + d + lbList.length) % lbList.length].src; });
  }
  function openLB(i) {
    lbLast = document.activeElement;
    showLB(i);
    lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); body.classList.add("no-scroll");
    setTimeout(function () { $(".lb__x", lb).focus({ preventScroll: true }); }, 60);
  }
  function closeLB() {
    if (!lb || !lb.classList.contains("open")) return;
    lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
    if (!menu || !menu.classList.contains("open")) body.classList.remove("no-scroll");
    if (lbLast) lbLast.focus({ preventScroll: true });
  }
  function stepLB(d, dir) { showLB(lbIdx + d, dir); }
  if (lb) {
    $(".lb__x", lb).addEventListener("click", closeLB);
    $(".lb__prev", lb).addEventListener("click", function () { stepLB(-1, -1); });
    $(".lb__next", lb).addEventListener("click", function () { stepLB(1, 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb__fig")) closeLB(); });
    var lsx = 0;
    lb.addEventListener("touchstart", function (e) { lsx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - lsx; if (Math.abs(dx) > 50) stepLB(dx < 0 ? 1 : -1, dx < 0 ? 1 : -1); }, { passive: true });
  }

  /* ======================================================
     GALLERY page
     ====================================================== */
  if (isGallery) {
    var slug = safe(function () { return new URLSearchParams(location.search).get("album"); });
    var ai = 0;
    S.albums.forEach(function (a, i) { if (a.slug === slug) ai = i; });
    var album = S.albums[ai], next = S.albums[(ai + 1) % S.albums.length];
    root.style.setProperty("--alb", album.tint);
    var tm = $('meta[name="theme-color"]'); if (tm) tm.setAttribute("content", album.tint);
    document.title = album.title + " | Aniruddha Das Photography, Guwahati";
    var gTitle = $("#gTitle");
    gTitle.textContent = album.title; gTitle.setAttribute("data-words", ""); splitWords(gTitle); watch(gTitle);
    $("#gCount").textContent = album.count + " photographs · folder " + (ai + 1) + " of " + S.albums.length;
    $("#gBlurb").textContent = album.blurb;
    $("#gTabs").innerHTML = S.albums.map(function (a, i) {
      return '<a href="gallery.html?album=' + a.slug + '"' + (i === ai ? ' aria-current="page"' : "") + ">" + esc(a.title) + " <small>" + a.count + "</small></a>";
    }).join("");
    $("#gNext").href = "gallery.html?album=" + next.slug;
    $("#gNextT").textContent = next.title;

    lbList = [];
    for (var n = 1; n <= album.count; n++) {
      var num = String(n).padStart(2, "0");
      lbList.push({ src: "assets/img/" + album.slug + "/" + num + ".webp", alt: album.title + ", photograph " + n + " of " + album.count, sm: "assets/img/" + album.slug + "/" + num + "-sm.webp" });
    }
    var grid = $("#gGrid"), ncols = 0;
    var gio = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); gio.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }) : null;
    function buildGrid() {
      var want = window.innerWidth <= 620 ? 2 : 3;
      if (want === ncols) return;
      ncols = want;
      grid.innerHTML = "";
      cols = [];
      for (var c = 0; c < ncols; c++) { var col = document.createElement("div"); col.className = "gcol"; grid.appendChild(col); cols.push(col); }
      lbList.forEach(function (it, i) {
        var fig = document.createElement("figure"); fig.className = "gi";
        fig.innerHTML = '<button type="button" data-cursor="View" aria-label="Open photograph ' + (i + 1) + '"><img src="' + it.sm + '" srcset="' + it.sm + ' 560w, ' + it.src + ' 1200w" sizes="(max-width:620px) 48vw, 32vw" alt="' + esc(it.alt) + '" width="560" height="700" ' + (i < 6 ? "" : 'loading="lazy"') + '></button><span class="gi__n">' + String(i + 1).padStart(2, "0") + "</span>";
        fig.querySelector("button").addEventListener("click", function () { openLB(i); });
        cols[i % ncols].appendChild(fig);
        if (gio) gio.observe(fig); else fig.classList.add("in");
      });
    }
    buildGrid();
    window.addEventListener("resize", buildGrid);
  }

  /* ======================================================
     FILMS page
     ====================================================== */
  if (isFilms) {
    var fg = $("#filGrid");
    fg.innerHTML = S.films.map(function (f) {
      return '<button type="button" class="fcard" data-film="' + f.id + '" data-cursor="Play"><span class="fcard__m">' +
        '<img src="assets/video/posters/' + f.id + '-sm.webp" alt="" width="400" height="500" loading="lazy">' +
        '<video muted loop playsinline preload="none" data-src="assets/video/previews/' + f.id + '.mp4" aria-hidden="true"></video>' +
        '<span class="fcard__dur">' + esc(f.duration) + '</span><span class="fcard__play">' + ICON("play") + '</span></span>' +
        '<span class="fcard__t">' + esc(f.title) + '</span><span class="fcard__k">' + esc(f.kind) + "</span></button>";
    }).join("");
    $$(".fcard", fg).forEach(function (c, i) {
      c.style.transitionDelay = (i % 4) * 90 + "ms";
      watch(c);
      var v = $("video", c), m = $(".fcard__m", c);
      if (FINE) {
        c.addEventListener("mouseenter", function () { attachPreview(v); });
        c.addEventListener("mouseleave", function () { detachPreview(v); m.style.setProperty("--rx", "0deg"); m.style.setProperty("--ry", "0deg"); });
        c.addEventListener("mousemove", function (e) {
          var r = m.getBoundingClientRect();
          m.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 12).toFixed(1) + "deg");
          m.style.setProperty("--rx", (((e.clientY - r.top) / r.height - 0.5) * -12).toFixed(1) + "deg");
        });
      } else if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) { if (es[0].isIntersecting) attachPreview(v); else detachPreview(v); }, { threshold: 0.7 }).observe(c);
      }
    });
  }
})();
