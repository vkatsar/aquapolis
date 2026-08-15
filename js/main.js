/* ═══════════════════════════════════════════
   AQUAPOLIS ATHENS — scrollytelling engine
   A water slide (SVG path) snakes down the story,
   drawn by scroll; a rider tube travels along it.
   ═══════════════════════════════════════════ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

  /* ── Preloader ── */
  window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('preloader').classList.add('done'), 500);
  });
  setTimeout(() => document.getElementById('preloader').classList.add('done'), 3000);

  /* ── Navbar state ── */
  const nav = document.getElementById('nav');
  const onNavScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onNavScroll();
  window.addEventListener('scroll', onNavScroll, { passive: true });

  /* ── Mobile menu ── */
  const burger = document.getElementById('burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.querySelectorAll('#navLinks a').forEach(a =>
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    })
  );

  /* ── Hero video crossfade rotation ── */
  const heroVideos = document.querySelectorAll('[data-hero-video]');
  if (heroVideos.length > 1 && !reduceMotion) {
    let current = 0;
    setInterval(() => {
      const next = (current + 1) % heroVideos.length;
      heroVideos[next].currentTime = 0;
      heroVideos[next].play().catch(() => {});
      heroVideos[next].classList.add('is-active');
      heroVideos[current].classList.remove('is-active');
      current = next;
    }, 9000);
  }

  /* ── Floating bubbles (hero) ── */
  const bubbles = document.getElementById('bubbles');
  if (bubbles && !reduceMotion) {
    for (let i = 0; i < 18; i++) {
      const b = document.createElement('span');
      b.className = 'bubble';
      const size = 8 + Math.random() * 26;
      b.style.width = b.style.height = size + 'px';
      b.style.left = Math.random() * 100 + '%';
      b.style.animationDuration = 7 + Math.random() * 9 + 's';
      b.style.animationDelay = Math.random() * 10 + 's';
      b.style.setProperty('--sway', (Math.random() * 120 - 60) + 'px');
      bubbles.appendChild(b);
    }
  }

  /* ── Scroll reveal ── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Animated counters ── */
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const animateCount = el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    let start = null;
    const tick = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1600, 1);
      el.textContent = Math.round(easeOutCubic(p) * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); countObserver.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  /* ── 3D tilt ── */
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + x * 7 + 'deg) rotateX(' + -y * 7 + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ── Lightbox ── */
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxContent.innerHTML = ''; }, 400);
  };
  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.lightbox;
      const src = item.dataset.src;
      lightboxContent.innerHTML = type === 'video'
        ? '<video src="' + src + '" controls autoplay playsinline></video>'
        : '<img src="' + src + '" alt="">';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  /* ═══════════════════════════════════════════
     THE SLIDE PATH — built to fit the story,
     redrawn on resize, animated on scroll
     ═══════════════════════════════════════════ */
  const story = document.getElementById('story');
  const svg = document.getElementById('slideSvg');
  const NS = 'http://www.w3.org/2000/svg';
  let tubeOutline, tube, tubeShine, rider, riderG, droplets = [], splashEnd, pathLength = 0, endPoint = null;

  function el(name, attrs, parent) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(n);
    return n;
  }

  function buildSlidePath() {
    svg.innerHTML = '';
    const W = story.clientWidth;
    const H = story.scrollHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.style.height = H + 'px';

    /* gradient for the tube */
    const defs = el('defs', {});
    const grad = el('linearGradient', { id: 'tubeGrad', x1: 0, y1: 0, x2: 0, y2: H, gradientUnits: 'userSpaceOnUse' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#3fd9f2' }, grad);
    el('stop', { offset: '45%', 'stop-color': '#12b3d6' }, grad);
    el('stop', { offset: '80%', 'stop-color': '#0a66a8' }, grad);
    el('stop', { offset: '100%', 'stop-color': '#3fd9f2' }, grad);

    /* anchors: start top-center, swing to alternating sides at each chapter */
    const chapters = story.querySelectorAll('.chapter');
    const narrow = W < 700;
    const edge = narrow ? 0.1 : 0.115;
    const pts = [[W * 0.5, 0]];
    let side = 1;
    chapters.forEach(ch => {
      const y = ch.offsetTop + ch.offsetHeight * 0.5;
      pts.push([side > 0 ? W * (1 - edge) : W * edge, y]);
      side *= -1;
    });
    endPoint = [W * 0.5, H - 150];
    pts.push(endPoint);

    let d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const dy = (y1 - y0) * 0.5;
      d += ' C' + x0 + ' ' + (y0 + dy) + ' ' + x1 + ' ' + (y1 - dy) + ' ' + x1 + ' ' + y1;
    }

    const stroke = narrow ? 16 : 26;
    tubeOutline = el('path', { d, fill: 'none', stroke: 'rgba(5,42,78,.18)', 'stroke-width': stroke + 9, 'stroke-linecap': 'round' });
    tube = el('path', { d, fill: 'none', stroke: 'url(#tubeGrad)', 'stroke-width': stroke, 'stroke-linecap': 'round' });
    tubeShine = el('path', { d, fill: 'none', stroke: 'rgba(255,255,255,.4)', 'stroke-width': Math.max(5, stroke * 0.3), 'stroke-linecap': 'round' });

    pathLength = tube.getTotalLength();
    [tubeOutline, tube, tubeShine].forEach(p => {
      p.style.strokeDasharray = pathLength;
      p.style.strokeDashoffset = reduceMotion ? 0 : pathLength;
    });

    /* trailing droplets */
    droplets = [];
    for (let i = 0; i < 4; i++) {
      droplets.push(el('circle', { r: 6 - i, fill: 'rgba(255,255,255,.8)', opacity: 0 }));
    }

    /* the rider: an inner tube */
    riderG = el('g', { opacity: 0 });
    el('circle', { r: stroke * 0.85, fill: 'none', stroke: '#ff5e5b', 'stroke-width': stroke * 0.55 }, riderG);
    el('circle', { r: stroke * 0.38, fill: '#3fd9f2' }, riderG);
    el('circle', { cx: -stroke * 0.42, cy: -stroke * 0.42, r: stroke * 0.16, fill: 'rgba(255,255,255,.85)' }, riderG);
    rider = riderG;

    /* terminal splash pool */
    splashEnd = el('g', { opacity: 0, transform: 'translate(' + endPoint[0] + ' ' + endPoint[1] + ')' });
    el('ellipse', { cx: 0, cy: 26, rx: 120, ry: 26, fill: 'rgba(18,179,214,.45)' }, splashEnd);
    el('ellipse', { cx: 0, cy: 26, rx: 78, ry: 16, fill: 'rgba(63,217,242,.65)' }, splashEnd);
    [[-70, -34], [-38, -62], [0, -74], [38, -62], [70, -34]].forEach(([x, y], i) => {
      el('path', { d: 'M0 10 Q' + x * 0.5 + ' ' + y * 0.6 + ' ' + x + ' ' + y, fill: 'none', stroke: '#3fd9f2', 'stroke-width': 6 - i % 2 * 2, 'stroke-linecap': 'round' }, splashEnd);
      el('circle', { cx: x, cy: y, r: 7 - i % 2 * 2, fill: '#12b3d6' }, splashEnd);
    });
  }

  /* ── scene elements ── */
  const altMeter = document.getElementById('altMeter');
  const altValue = document.getElementById('altValue');
  const altFill = document.getElementById('altFill');
  const altMarker = document.getElementById('altMarker');
  const towerEl = document.getElementById('tower');
  const platforms = towerEl ? towerEl.querySelectorAll('.platform') : [];
  const sceneClimb = document.querySelector('[data-scene="climb"]');
  const sceneDrop = document.querySelector('[data-scene="drop"]');
  const sceneSplash = document.querySelector('[data-scene="splash"]');
  const sceneWave = document.querySelector('[data-scene="wave"]');
  const speedoNum = document.getElementById('speedoNum');
  const dropCallout = document.getElementById('dropCallout');
  const dropHint = document.getElementById('dropHint');
  const dropBlob = document.querySelector('.drop-blob');
  const dropBadge = document.getElementById('dropBadge');
  const speedLines = document.querySelector('.speed-lines');
  const burstG = document.getElementById('burstG');
  const waveLayers = document.querySelectorAll('.wave-layer');

  const TOP_ALT = 22, MAX_SPEED = 45;
  let lastCallout = '';
  const progressBar = document.getElementById('scrollProgressBar');
  const chapterNav = document.getElementById('chapterNav');
  const chapterNavLinks = chapterNav ? Array.from(chapterNav.querySelectorAll('a')) : [];
  const navMenuLinks = Array.from(document.querySelectorAll('#navLinks a:not(.btn)'));
  const chapterEls = chapterNavLinks.map(a => document.getElementById(a.dataset.ch));

  function update() {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    const storyTop = story.offsetTop;
    const storyH = story.scrollHeight;

    /* overall story progress → path draw + rider + altitude HUD */
    const sp = clamp((scrollY + vh * 0.6 - storyTop) / storyH, 0, 1);

    if (pathLength && !reduceMotion) {
      const offset = pathLength * (1 - sp);
      tubeOutline.style.strokeDashoffset = offset;
      tube.style.strokeDashoffset = offset;
      tubeShine.style.strokeDashoffset = offset;

      const showRider = sp > 0.004 && sp < 0.998;
      rider.setAttribute('opacity', showRider ? 1 : 0);
      if (showRider) {
        const len = pathLength * sp;
        const pt = tube.getPointAtLength(len);
        const ahead = tube.getPointAtLength(Math.min(len + 2, pathLength));
        const angle = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI;
        rider.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ') rotate(' + angle + ')');
        droplets.forEach((dp, i) => {
          const dl = len - (i + 1) * 46;
          if (dl > 0) {
            const p2 = tube.getPointAtLength(dl);
            dp.setAttribute('cx', p2.x);
            dp.setAttribute('cy', p2.y);
            dp.setAttribute('opacity', 0.75 - i * 0.16);
          } else dp.setAttribute('opacity', 0);
        });
      } else {
        droplets.forEach(dp => dp.setAttribute('opacity', 0));
      }

      /* terminal splash */
      if (splashEnd) {
        const spl = clamp((sp - 0.9) / 0.06, 0, 1);
        splashEnd.setAttribute('opacity', spl);
        splashEnd.setAttribute('transform', 'translate(' + endPoint[0] + ' ' + endPoint[1] + ') scale(' + (0.6 + easeOutBack(spl) * 0.4) + ')');
      }
    }

    /* top water progress bar */
    if (progressBar) {
      const docP = clamp(scrollY / (document.documentElement.scrollHeight - vh), 0, 1);
      progressBar.style.width = docP * 100 + '%';
    }

    /* chapter dots + nav menu active states */
    const mid = scrollY + vh * 0.5;
    let activeCh = -1;
    chapterEls.forEach((el, i) => {
      if (!el) return;
      const top = el.getBoundingClientRect().top + scrollY;
      if (mid >= top) activeCh = i;
    });
    chapterNavLinks.forEach((a, i) => a.classList.toggle('active', i === activeCh));
    navMenuLinks.forEach(a => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      const top = target.getBoundingClientRect().top + scrollY;
      const bottom = top + target.offsetHeight;
      a.classList.toggle('active', mid >= top && mid < bottom);
    });

    /* altitude HUD */
    const inStory = scrollY + vh * 0.5 > storyTop && scrollY + vh * 0.5 < storyTop + storyH;
    altMeter.classList.toggle('on', inStory);
    if (chapterNav) chapterNav.classList.toggle('on', inStory);
    if (inStory) {
      const alt = Math.round(TOP_ALT * (1 - sp));
      altValue.textContent = alt + 'μ';
      altFill.style.height = sp * 100 + '%';
      altMarker.style.top = sp * 100 + '%';
    }

    /* CH01 — climb: platforms light up bottom-to-top */
    if (sceneClimb) {
      const r = sceneClimb.getBoundingClientRect();
      const p = clamp((vh * 0.92 - r.top) / (r.height * 0.95), 0, 1);
      const lit = Math.floor(p * (platforms.length + 1));
      platforms.forEach((pl, i) => {
        /* platforms are listed top-first; light from the bottom */
        pl.classList.toggle('active', platforms.length - i <= lit);
      });
      towerEl.classList.toggle('topped', p > 0.82);
    }

    /* CH02 — the drop (pinned): speed builds with scroll */
    if (sceneDrop) {
      const r = sceneDrop.getBoundingClientRect();
      const total = sceneDrop.offsetHeight - vh;
      const p = clamp(-r.top / total, 0, 1);
      const speed = Math.round(MAX_SPEED * easeOutCubic(p));
      speedoNum.textContent = speed;
      dropBadge.textContent = Math.round(TOP_ALT * (1 - p)) + 'μ';
      const callout = p < 0.25 ? 'Κρατήσου σφιχτά…' : p < 0.65 ? 'Πάμεεεεε! 🙌' : p < 0.92 ? 'Στροφή δεξιάαα! 🌀' : 'SPLASH! 💦';
      if (callout !== lastCallout) { dropCallout.textContent = callout; lastCallout = callout; }
      dropHint.style.opacity = p > 0.9 ? 0 : 0.75;
      if (dropBlob && !reduceMotion) {
        dropBlob.style.transform = 'rotate(' + (p * 14 - 7) + 'deg) scale(' + (1 + p * 0.12) + ')';
      }
      if (speedLines) {
        speedLines.style.opacity = clamp(Math.sin(Math.PI * p) * 1.4, 0, 1);
      }
    }

    /* CH04 — splash burst grows in */
    if (burstG && sceneSplash) {
      const r = sceneSplash.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height * 0.8), 0, 1);
      burstG.style.opacity = clamp(p * 2, 0, 1) * (reduceMotion ? 1 : 1);
      const s = reduceMotion ? 1 : 0.4 + easeOutBack(p) * 0.6;
      burstG.style.transform = 'scale(' + s + ') rotate(' + p * 18 + 'deg)';
    }

    /* CH05 — wave layers drift at different speeds */
    if (sceneWave && waveLayers.length && !reduceMotion) {
      const r = sceneWave.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      const speeds = [140, -190, 240];
      waveLayers.forEach((w, i) => {
        w.style.transform = 'translateX(' + (p - 0.5) * speeds[i] + 'px)';
      });
    }
  }

  /* rAF-gated scroll loop */
  let ticking = false;
  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });

  /* build (and rebuild when layout shifts) */
  let rebuildTimer = null;
  function rebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => { buildSlidePath(); update(); }, 120);
  }
  buildSlidePath();
  update();
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild);
  if ('ResizeObserver' in window) {
    let lastH = story.scrollHeight;
    new ResizeObserver(() => {
      if (Math.abs(story.scrollHeight - lastH) > 4) { lastH = story.scrollHeight; rebuild(); }
    }).observe(story);
  }

  /* reduced motion: show everything in its final state */
  if (reduceMotion) {
    platforms.forEach(pl => pl.classList.add('active'));
    if (towerEl) towerEl.classList.add('topped');
    if (speedoNum) speedoNum.textContent = MAX_SPEED;
    if (burstG) { burstG.style.opacity = 1; burstG.style.transform = 'scale(1)'; }
    if (splashEnd) splashEnd.setAttribute('opacity', 1);
  }
})();
