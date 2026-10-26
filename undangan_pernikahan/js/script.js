(function () {
  'use strict';
  const WEDDING_DATE = new Date('2026-12-20T08:00:00');
  const params = new URLSearchParams(window.location.search);
  const guest = params.get('to');
  if (guest) {
    document.getElementById('guestName').textContent = guest;
  }

  const cover = document.getElementById('cover');
  const main = document.getElementById('mainContent');
  const musicBtn = document.getElementById('musicBtn');
  const bgMusic = document.getElementById('bgMusic');
  document.body.classList.add('locked');

  document.getElementById('openBtn').addEventListener('click', function () {
    cover.classList.add('hide');
    document.body.classList.remove('locked');
    main.classList.add('show');
    musicBtn.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'instant' });
    observeReveals();
    bgMusic.play().catch(function () { /* abaikan */ });
    musicBtn.classList.add('playing');
  });

  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    let diff = WEDDING_DATE - new Date();
    if (diff < 0) diff = 0;
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff / 36e5) % 24;
    const m = Math.floor(diff / 6e4) % 60;
    const s = Math.floor(diff / 1e3) % 60;
    document.getElementById('cd-days').textContent = pad(d);
    document.getElementById('cd-hours').textContent = pad(h);
    document.getElementById('cd-mins').textContent = pad(m);
    document.getElementById('cd-secs').textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  document.getElementById('saveDateBtn').addEventListener('click', function () {
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const start = fmt(WEDDING_DATE);
    const end = fmt(new Date(WEDDING_DATE.getTime() + 6 * 36e5));
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      'UID:undangan-nikah-' + Date.now() + '@local',
      'DTSTAMP:' + fmt(new Date()),
      'DTSTART:' + start, 'DTEND:' + end,
      'SUMMARY:Pernikahan Andi & Sari',
      'LOCATION:Gedung Serbaguna Graha Cinta\\, Surabaya',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'save-the-date.ics';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  let playing = true;
  musicBtn.addEventListener('click', function () {
    if (!bgMusic.getAttribute('src') && !bgMusic.querySelector('source').getAttribute('src')) {
      alert('Belum ada file musik. Pasang mp3 di <audio> pada index.html ya!');
      return;
    }
    if (playing) { bgMusic.pause(); musicBtn.classList.remove('playing'); }
    else { bgMusic.play().catch(function () {}); musicBtn.classList.add('playing'); }
    playing = !playing;
  });

  const form = document.getElementById('rsvpForm');
  const list = document.getElementById('wishesList');
  const KEY = 'wishes-undangan';

  function loadWishes() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function renderWishes() {
    const wishes = loadWishes();
    if (!wishes.length) {
      list.innerHTML = '<p class="text-muted text-center fst-italic">Belum ada ucapan. Jadilah yang pertama!</p>';
      return;
    }
    list.innerHTML = wishes.map(function (w) {
      const badge = w.attend === 'Hadir, Insya Allah'
        ? '<span class="wish-badge">Hadir</span>'
        : '<span class="wish-badge" style="background:#999">Berhalangan</span>';
      const safe = (s) => String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return '<div class="wish-item"><span class="wish-name">' + safe(w.name) + '</span>' + badge +
        (w.msg ? '<p>"' + safe(w.msg) + '"</p>' : '') + '</div>';
    }).join('');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const wishes = loadWishes();
    wishes.unshift({
      name: document.getElementById('rsvpName').value.trim(),
      attend: document.getElementById('rsvpAttend').value,
      count: document.getElementById('rsvpCount').value,
      msg: document.getElementById('rsvpMsg').value.trim()
    });
    localStorage.setItem(KEY, JSON.stringify(wishes));
    form.reset();
    renderWishes();
    alert('Terima kasih! Konfirmasi & ucapanmu tersimpan ❤');
  });
  renderWishes();

  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const text = document.getElementById(btn.dataset.copy).textContent.replace(/\s/g, '');
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Tersalin ✓';
        setTimeout(function () { btn.textContent = 'Salin'; }, 1500);
      }).catch(function () {
        alert('Nomor: ' + text);
      });
    });
  });

  let observer;
  function observeReveals() {
    if (observer) return;
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          observer.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('#cover .reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    document.querySelectorAll('main .reveal').forEach(function (el) {
      observer.observe(el);
    });
  }
  document.querySelectorAll('#cover .reveal').forEach(function (el) {
    el.classList.add('visible');
  });
})();
