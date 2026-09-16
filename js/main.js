/* Aniruddha Das Photography — main.js (no libraries) */
(function () {
  "use strict";

  var S = window.SITE || { albums: [], films: [] };
  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isHome = body.classList.contains("page-home");
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var ICON = function (n) { return '<svg aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------------- Split titles into letters ---------------- */
  $$("[data-split]").forEach(function (el) {
    var text = el.textContent;
    el.setAttribute("aria-hidden", "true");
    var i = 0;
    el.innerHTML = text.split(" ").map(function (word) {
      return '<span style="display:inline-block;white-space:nowrap">' + word.split("").map(function (ch) {
        return '<span class="ch" style="--i:' + (i++) + '">' + esc(ch) + "</span>";
      }).join("") + "</span>";
    }).join(" ");
    if (!el.parentElement.getAttribute("aria-label")) el.parentElement.setAttribute("aria-label", text);
  });

  /* ---------------- Intro + page transitions ---------------- */
  var firstVisit = false;
  try { firstVisit = isHome && !sessionStorage.getItem("ad-intro"); sessionStorage.setItem("ad-intro", "1"); } catch (e) {}
  if (firstVisit && !reduceMotion) body.classList.add("is-intro");

  function ready() {
    requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add("is-ready"); }); });
  }
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 900); })]).then(ready);

  window.addEventListener("pageshow", function (e) {
    if (e.persisted) { body.classList.remove("is-leaving"); body.classList.add("is-ready"); }
  });

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto|tel|https?):/i.test(href)) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    // same page + hash: let the browser scroll
    if (url.pathname === location.pathname && url.search === location.search && url.hash) { closeMenu(); return; }
    e.preventDefault();
    closeMenu();
    var cur = $(".curtain");
    if (cur && !reduceMotion) { cur.classList.add("from-below"); cur.offsetWidth; cur.classList.remove("from-below"); }
    body.classList.add("is-leaving");
    setTimeout(function () { location.href = url.href; }, reduceMotion ? 0 : 560);
  });

  /* ---------------- Header behaviour ---------------- */
  var header = $(".site-header");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      var heroH = isHome ? window.innerHeight * 0.8 : 10;
      header.classList.toggle("is-solid", y > heroH);
      var hide = y > lastY && y > window.innerHeight * 1.1 && !body.classList.contains("menu-open");
      header.classList.toggle("is-hidden", hide);
    }
    lastY = y;
    if (fab) {
      fab.classList.toggle("show", y > window.innerHeight * 0.6);
      var c = contactEl && contactEl.getBoundingClientRect();
      fab.classList.toggle("away", !!c && c.top < window.innerHeight * 0.75 && c.bottom > 0);
    }
  }
  var fab = $(".fab-wa");
  var contactEl = $("#contact");
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { onScroll(); ticking = false; }); }
  }, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  var toggle = $(".menu-toggle");
  var menu = $("#mobile-menu");
  function closeMenu() {
    if (!body.classList.contains("menu-open")) return;
    body.classList.remove("menu-open", "no-scroll");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.setAttribute("aria-hidden", "true");
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = !body.classList.contains("menu-open");
      if (!open) return closeMenu();
      body.classList.add("menu-open", "no-scroll");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      menu.setAttribute("aria-hidden", "false");
    });
    $$("#mobile-menu a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    window.addEventListener("resize", function () { if (window.innerWidth > 960) closeMenu(); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        // clip-path hides elements from the observer, so image reveals are triggered via their parent
        $$(":scope > .reveal-img", en.target).forEach(function (c) { c.classList.add("in"); });
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }) : null;
  function observe(el) { if (io) io.observe(el); else el.classList.add("in"); }
  $$(".reveal").forEach(observe);
  var imgParents = [];
  $$(".reveal-img").forEach(function (el) { if (imgParents.indexOf(el.parentElement) < 0) imgParents.push(el.parentElement); });
  imgParents.forEach(observe);

  /* ---------------- Footer ---------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$("[data-top]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });
  });

  /* ---------------- Lightbox (shared) ---------------- */
  var lb = $("#lightbox");
  var lbStage = lb && $(".lb-stage", lb);
  var lbInfo = lb && $(".lb-info", lb);
  var lbBottom = lb && $(".lb-bottom", lb);
  var lbState = null;
  var lastFocus = null;

  function openLB(state) {
    lbState = state;
    lastFocus = document.activeElement;
    lb.classList.toggle("lightbox--film", state.type === "film");
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    body.classList.add("no-scroll");
    renderLB(0);
    setTimeout(function () { $(".lb-close", lb).focus({ preventScroll: true }); }, 50);
  }
  function closeLB() {
    if (!lbState) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    body.classList.remove("no-scroll");
    var v = $("video", lbStage);
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
    setTimeout(function () { if (!lb.classList.contains("open")) lbStage.innerHTML = ""; }, 500);
    lbState = null;
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  function renderLB(dir) {
    var st = lbState;
    if (st.type === "photo") {
      var n = st.items.length;
      var src = st.items[st.index];
      lbInfo.innerHTML = '<span class="lb-count"><b>' + String(st.index + 1).padStart(2, "0") + "</b> / " + String(n).padStart(2, "0") + "</span>";
      lbBottom.innerHTML = '<div class="lb-progress"><i style="width:' + ((st.index + 1) / n * 100) + '%"></i></div>';
      var img = $("img", lbStage);
      if (!img) {
        lbStage.innerHTML = '<button class="lb-nav lb-prev" type="button" aria-label="Previous photo">' + ICON("left") + '</button><img alt=""><button class="lb-nav lb-next" type="button" aria-label="Next photo">' + ICON("right") + "</button>";
        img = $("img", lbStage);
        $(".lb-prev", lbStage).addEventListener("click", function () { stepLB(-1); });
        $(".lb-next", lbStage).addEventListener("click", function () { stepLB(1); });
      }
      img.alt = st.alt + ", photo " + (st.index + 1) + " of " + n;
      if (dir && !reduceMotion) {
        img.className = dir > 0 ? "swap-l" : "swap-r";
        setTimeout(function () {
          img.className = dir > 0 ? "swap-r" : "swap-l";
          img.style.transition = "none";
          img.src = src;
          img.offsetWidth; // reflow
          img.style.transition = "";
          img.className = "";
        }, 220);
      } else {
        img.src = src;
      }
      // preload neighbours
      [1, -1].forEach(function (d) { var p = new Image(); p.src = st.items[(st.index + d + n) % n]; });
    } else {
      var f = st.film;
      lbInfo.innerHTML = '<span class="lb-title">' + esc(f.title) + "</span>";
      lbBottom.innerHTML = '<span class="lb-hint">' + esc(f.kind) + " &nbsp;/&nbsp; " + esc(f.duration) + (f.muted ? " &nbsp;/&nbsp; no sound" : "") + "</span>";
      lbStage.innerHTML = '<video controls playsinline autoplay preload="auto" poster="' + filmPoster(f) + '" src="' + filmSrc(f) + '"></video>';
      var v = $("video", lbStage);
      if (f.muted) v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); });
    }
  }
  function stepLB(d) {
    if (!lbState || lbState.type !== "photo") return;
    var n = lbState.items.length;
    lbState.index = (lbState.index + d + n) % n;
    renderLB(d);
  }
  if (lb) {
    $(".lb-close", lb).addEventListener("click", closeLB);
    lbStage.addEventListener("click", function (e) { if (e.target === lbStage) closeLB(); });
    document.addEventListener("keydown", function (e) {
      if (!lbState) { if (e.key === "Escape") closeMenu(); return; }
      if (e.key === "Escape") closeLB();
      else if (e.key === "ArrowRight") stepLB(1);
      else if (e.key === "ArrowLeft") stepLB(-1);
      else if (e.key === "Tab") {
        var f = $$("button, video[controls]", lb);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // swipe
    var sx = 0, sy = 0, st = 0;
    lbStage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); }, { passive: true });
    lbStage.addEventListener("touchend", function (e) {
      if (!lbState || lbState.type !== "photo") return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) && Date.now() - st < 700) stepLB(dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLB();
    }, { passive: true });
  }

  /* ---------------- Film helpers ---------------- */
  function filmSrc(f) { return f.src || "assets/video/films/" + f.id + ".mp4"; }
  function filmPoster(f) { return "assets/video/posters/" + f.id + ".webp"; }
  function filmById(id) { for (var i = 0; i < S.films.length; i++) if (S.films[i].id === id) return S.films[i]; }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-film]");
    if (!t) return;
    e.preventDefault();
    var f = filmById(t.getAttribute("data-film"));
    if (f) openLB({ type: "film", film: f });
  });

  /* Autoplay muted videos only while visible (saves battery on phones) */
  var vio = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting) {
        if (!v.getAttribute("src") && v.dataset.src) v.setAttribute("src", v.dataset.src);
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else if (!v.paused) v.pause();
    });
  }, { rootMargin: "120px" }) : null;
  function autoVideo(v) {
    v.muted = true; v.defaultMuted = true; v.setAttribute("muted", ""); v.playsInline = true;
    if (reduceMotion) { return; }
    if (vio) vio.observe(v); else { v.src = v.dataset.src; v.play().catch(function () {}); }
  }

  /* ---------------- HOME ---------------- */
  if (isHome) {
    // hero video
    var hv = $("#heroVideo");
    if (hv) {
      var mobile = window.matchMedia("(max-width: 720px) and (orientation: portrait)").matches;
      if (mobile) hv.poster = hv.dataset.posterMobile;
      hv.dataset.src = mobile ? hv.dataset.srcMobile : hv.dataset.srcDesktop;
      hv.preload = "auto";
      autoVideo(hv);
    }

    // albums
    var list = $("#albumList");
    if (list) {
      list.innerHTML = S.albums.map(function (a) {
        var p = "assets/img/" + a.slug + "/";
        return '<a class="album" href="gallery.html?album=' + a.slug + '">' +
          '<div class="album__stack">' +
          '<span class="sheet s1"><img src="' + p + a.stack[0] + '-sm.webp" alt="" loading="lazy" width="560" height="700"></span>' +
          '<span class="sheet s2"><img src="' + p + a.stack[1] + '-sm.webp" alt="" loading="lazy" width="560" height="700"></span>' +
          '<span class="sheet s3"><img src="' + p + a.cover + '-sm.webp" alt="' + esc(a.title) + ' album cover" loading="lazy" width="560" height="700"></span>' +
          '<span class="album__tab">' + ICON("diag") + "</span>" +
          "</div>" +
          '<h3 class="album__title">' + esc(a.title) + "</h3>" +
          '<span class="album__count">' + a.count + " photographs</span></a>";
      }).join("");

      // fan the stacks once when the row comes into view (nice on touch screens)
      if (io && !reduceMotion) {
        var fanIO = new IntersectionObserver(function (en) {
          if (en[0].isIntersecting) {
            list.classList.add("fan");
            setTimeout(function () { list.classList.remove("fan"); }, 1400);
            fanIO.disconnect();
          }
        }, { threshold: 0.45 });
        fanIO.observe(list);
      }

      // mobile swipe deck: counter, progress bar, arrows
      var cards = list.children;
      var nowEl = $("#albumNow");
      var bar = $("#albumBar");
      var btns = $$("#albumNav .albums-nav__btn");
      var total = cards.length;
      var current = -1;
      $("#albumNav .albums-nav__count").lastChild.nodeValue = " / " + String(total).padStart(2, "0");
      function currentIndex() {
        var max = list.scrollWidth - list.clientWidth;
        if (max <= 1) return 0;
        if (list.scrollLeft >= max - 2) return total - 1;
        var left = list.scrollLeft, best = 0, bd = 1e9;
        for (var i = 0; i < total; i++) {
          var d = Math.abs(cards[i].offsetLeft - list.offsetLeft - left - parseFloat(getComputedStyle(list).paddingLeft));
          if (d < bd) { bd = d; best = i; }
        }
        return best;
      }
      function syncDeck() {
        var max = list.scrollWidth - list.clientWidth;
        var p = max > 0 ? list.scrollLeft / max : 0;
        bar.style.transform = "translateX(" + (p * (total - 1) * 100) + "%)";
        var idx = currentIndex();
        if (idx !== current) {
          current = idx;
          nowEl.textContent = String(idx + 1).padStart(2, "0");
          for (var i = 0; i < total; i++) cards[i].classList.toggle("is-current", i === idx);
          btns[0].disabled = idx === 0;
          btns[1].disabled = idx === total - 1;
        }
      }
      bar.style.width = (100 / total) + "%";
      var deckTick = false;
      list.addEventListener("scroll", function () {
        if (!deckTick) { deckTick = true; requestAnimationFrame(function () { syncDeck(); deckTick = false; }); }
      }, { passive: true });
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          var target = Math.max(0, Math.min(total - 1, currentIndex() + (+b.dataset.dir)));
          var pad = parseFloat(getComputedStyle(list).paddingLeft);
          list.scrollTo({ left: cards[target].offsetLeft - list.offsetLeft - pad, behavior: reduceMotion ? "auto" : "smooth" });
        });
      });
      window.addEventListener("resize", syncDeck);
      syncDeck();
    }

    // moving film strip
    var track = $("#stripTrack");
    var strip = $("#strip");
    if (track) {
      var order = ["hero", "bridal-morning", "hills-and-waterfalls", "red-and-gold", "wedding-rituals", "into-the-woods", "the-twirl"];
      var one = order.map(function (id) {
        var f = filmById(id);
        return '<button class="frame" type="button" data-film="' + id + '" aria-label="Play ' + esc(f.title) + '">' +
          '<video muted playsinline loop preload="none" poster="assets/video/posters/' + id + '-sm.webp" data-src="assets/video/previews/' + id + '.mp4"></video>' +
          '<span class="frame__play">' + ICON("play") + "</span>" +
          '<span class="frame__label"><b>' + esc(f.title) + "</b><small>" + esc(f.kind) + "</small></span></button>";
      }).join("");
      track.innerHTML = one + one.replace(/<button class="frame"/g, '<button class="frame" tabindex="-1" aria-hidden="true"');
      // Play only the few previews nearest the centre of the screen; the rest show their poster.
      // Decoding many videos while the strip moves is what makes cheaper phones stutter.
      var stripVideos = $$("video", track);
      stripVideos.forEach(function (v) { v.muted = true; v.defaultMuted = true; v.playsInline = true; });
      var stripOn = false, stripTimer = null;
      function pickVideos() {
        var vw = window.innerWidth, vh = window.innerHeight;
        var max = vw < 721 ? 2 : vw < 1200 ? 3 : 4;
        var ranked = [];
        stripVideos.forEach(function (v) {
          var r = v.getBoundingClientRect();
          var visible = r.right > 0 && r.left < vw && r.bottom > 0 && r.top < vh;
          ranked.push({ v: v, d: visible ? Math.abs(r.left + r.width / 2 - vw / 2) : Infinity });
        });
        ranked.sort(function (a, b) { return a.d - b.d; });
        ranked.forEach(function (o, i) {
          var v = o.v;
          if (i < max && o.d !== Infinity) {
            if (!v.getAttribute("src")) v.setAttribute("src", v.dataset.src);
            if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
          } else if (!v.paused) v.pause();
        });
      }
      if (!reduceMotion) {
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (en) {
            stripOn = en[0].isIntersecting;
            clearInterval(stripTimer);
            if (stripOn) { pickVideos(); stripTimer = setInterval(pickVideos, 700); }
            else stripVideos.forEach(function (v) { if (!v.paused) v.pause(); });
          }).observe(strip);
        } else pickVideos();
      }
      // constant speed (px per second) whatever the screen size; only recalculated when the width really changes,
      // because changing the duration mid-animation makes the strip jump
      var lastW = 0;
      var setDur = function () {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        var speed = window.innerWidth < 721 ? 34 : 44;
        // whole-pixel frame widths keep the loop seam invisible
        var fw = window.innerWidth < 721 ? Math.round(window.innerWidth * 0.46) : Math.round(Math.min(270, Math.max(190, window.innerWidth * 0.19)));
        track.style.setProperty("--frame-w", fw + "px");
        track.style.setProperty("--dur", (track.scrollWidth / 2 / speed).toFixed(2) + "s");
      };
      setDur();
      window.addEventListener("resize", setDur);
      // don't animate while the strip is off screen (saves battery, no catch-up stutter)
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          track.style.animationPlayState = en[0].isIntersecting ? "" : "paused";
        }, { rootMargin: "100px 0px" }).observe(strip);
      }
      strip.addEventListener("focusin", function (e) { if (e.target.matches(":focus-visible")) strip.classList.add("is-paused"); });
      strip.addEventListener("focusout", function () { strip.classList.remove("is-paused"); });
    }

    // services light up as they scroll past
    var sio = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle("in", en.isIntersecting); });
    }, { rootMargin: "-18% 0px -22% 0px" }) : null;
    $$(".services li").forEach(function (li) { if (sio && !reduceMotion) sio.observe(li); else li.classList.add("in"); });

    // footer word drift
    var drift = $("[data-drift]");
    if (drift && !reduceMotion) {
      window.addEventListener("scroll", function () {
        var rem = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
        drift.style.transform = "translateX(" + (Math.min(rem / window.innerHeight, 1) * 8) + "%)";
      }, { passive: true });
    }
  }

  /* ---------------- GALLERY ---------------- */
  if (body.classList.contains("page-gallery")) {
    var params = new URLSearchParams(location.search);
    var slug = params.get("album") || "couples";
    var idx = 0;
    S.albums.forEach(function (a, i) { if (a.slug === slug) idx = i; });
    var album = S.albums[idx];
    var next = S.albums[(idx + 1) % S.albums.length];

    document.title = album.title + " | Aniruddha Das Photography, Guwahati";
    $("#crumbCurrent").textContent = album.title;
    var h1 = $("#albumTitle");
    h1.setAttribute("aria-label", album.title);
    var i = 0;
    $(".line", h1).innerHTML = album.title.split(" ").map(function (w) {
      return '<span style="display:inline-block;white-space:nowrap">' + w.split("").map(function (ch) {
        return '<span class="ch" style="--i:' + (i++) + '">' + esc(ch) + "</span>";
      }).join("") + "</span>";
    }).join(" ");
    $("#albumBlurb").textContent = album.blurb + " " + album.count + " photographs.";

    $("#albumChips").innerHTML = S.albums.map(function (a) {
      return '<a class="chip" href="gallery.html?album=' + a.slug + '"' + (a.slug === album.slug ? ' aria-current="page"' : "") + ">" + esc(a.title) + " <small>" + a.count + "</small></a>";
    }).join("");
    var cur = $('#albumChips [aria-current]');
    if (cur) cur.scrollIntoView({ inline: "center", block: "nearest" });
    window.scrollTo(0, 0);

    var base = "assets/img/" + album.slug + "/";
    var nums = [];
    for (var k = 1; k <= album.count; k++) nums.push(String(k).padStart(2, "0"));
    var gal = $("#gallery");
    gal.innerHTML = nums.map(function (n, j) {
      return '<button class="g-item" type="button" data-index="' + j + '" aria-label="Open photo ' + (j + 1) + '" style="transition-delay:' + ((j % 3) * 80) + 'ms">' +
        '<img src="' + base + n + '-sm.webp" srcset="' + base + n + "-sm.webp 560w, " + base + n + '.webp 1200w" sizes="(max-width: 960px) 50vw, 33vw" alt="' + esc(album.title) + " photograph " + (j + 1) + '" loading="' + (j < 6 ? "eager" : "lazy") + '" width="560" height="700" decoding="async"></button>';
    }).join("");
    $$(".g-item img", gal).forEach(function (img) {
      if (img.complete) img.classList.add("loaded");
      else { img.addEventListener("load", function () { img.classList.add("loaded"); }); img.addEventListener("error", function () { img.classList.add("loaded"); }); }
    });
    $$(".g-item", gal).forEach(observe);
    var full = nums.map(function (n) { return base + n + ".webp"; });
    gal.addEventListener("click", function (e) {
      var b = e.target.closest(".g-item");
      if (!b) return;
      openLB({ type: "photo", items: full, index: +b.dataset.index, alt: album.title });
    });

    var na = $("#nextAlbum");
    na.href = "gallery.html?album=" + next.slug;
    $("#nextTitle").textContent = next.title;
    $("#nextThumb").src = "assets/img/" + next.slug + "/" + next.cover + "-sm.webp";
  }

  /* ---------------- FILMS ---------------- */
  if (body.classList.contains("page-films")) {
    var card = function (f, big) {
      var portraitCls = big ? "" : " film-card--portrait";
      return '<button class="film-card reveal' + portraitCls + '" type="button" data-film="' + f.id + '" aria-label="Play ' + esc(f.title) + '">' +
        '<span class="film-card__media"><img src="' + filmPoster(f) + '" alt="" loading="lazy">' +
        (big ? "" : '<video muted playsinline loop preload="none" data-src="assets/video/previews/' + f.id + '.mp4"></video>') +
        '<span class="film-card__play">' + ICON("play") + "</span></span>" +
        '<span class="film-card__meta"><b>' + esc(f.title) + "</b><span>" + esc(f.kind) + " / " + f.duration + "</span></span></button>";
    };
    $("#filmsFeatured").innerHTML = S.films.filter(function (f) { return f.featured; }).map(function (f) { return card(f, true); }).join("");
    $("#filmsGrid").innerHTML = S.films.filter(function (f) { return !f.featured; }).map(function (f) { return card(f, false); }).join("");
    $$(".film-card").forEach(observe);
    // preview on hover (desktop) or when in view (touch)
    var canHover = window.matchMedia("(hover: hover)").matches;
    $$("#filmsGrid .film-card").forEach(function (c) {
      var v = $("video", c);
      v.muted = true;
      if (reduceMotion) return;
      if (canHover) {
        c.addEventListener("mouseenter", function () { if (!v.src) v.src = v.dataset.src; c.classList.add("is-previewing"); v.play().catch(function () {}); });
        c.addEventListener("mouseleave", function () { c.classList.remove("is-previewing"); v.pause(); });
      } else {
        c.classList.add("is-previewing");
        autoVideo(v);
      }
    });
  }
})();
