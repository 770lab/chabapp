// ─── ZMANIM MODULE ───
(function() {
  const ZMANIM_DEFS = [
    { key: 'alotHaShachar',      fr: 'Alot HaCha\'har',        he: 'עלות השחר',        section: 'matin',  icon: '🌑' },
    { key: 'misheyakir',         fr: 'Michéyakir',             he: 'משיכיר',           section: 'matin',  icon: '🌒' },
    { key: 'sunrise',            fr: 'Nets Ha\'Hama',          he: 'הנץ החמה',         section: 'matin',  icon: '🌅' },
    { key: 'sofZmanShmaMGA',     fr: 'Sof Zman Shma (MGA)',    he: 'סוף זמן שמע (מג״א)', section: 'matin', icon: '📖' },
    { key: 'sofZmanShma',        fr: 'Sof Zman Shma (GRA)',    he: 'סוף זמן שמע (גר״א)', section: 'matin', icon: '📖' },
    { key: 'sofZmanTfillaMGA',   fr: 'Sof Zman Tefila (MGA)',  he: 'סוף זמן תפילה (מג״א)', section: 'matin', icon: '🙏' },
    { key: 'sofZmanTfilla',      fr: 'Sof Zman Tefila (GRA)',  he: 'סוף זמן תפילה (גר״א)', section: 'matin', icon: '🙏' },
    { key: 'chatzot',            fr: '\'Hatzot HaYom',         he: 'חצות היום',        section: 'midi',   icon: '☀️' },
    { key: 'minchaGedola',       fr: 'Min\'ha Guedola',        he: 'מנחה גדולה',       section: 'apresmidi', icon: '🕑' },
    { key: 'minchaKetana',       fr: 'Min\'ha Ketana',         he: 'מנחה קטנה',        section: 'apresmidi', icon: '🕓' },
    { key: 'plagHaMincha',       fr: 'Plag HaMin\'ha',         he: 'פלג המנחה',        section: 'apresmidi', icon: '🌤' },
    { key: 'sunset',             fr: 'Chki\'a',                he: 'שקיעה',            section: 'soir',   icon: '🌇' },
    { key: 'tzeit7083deg',       fr: 'Tsèt HaKokhavim',       he: 'צאת הכוכבים',      section: 'soir',   icon: '⭐' },
  ];

  const SECTION_LABELS = {
    matin: 'Matin',
    midi: 'Mi-journée',
    apresmidi: 'Après-midi',
    soir: 'Soir'
  };

  function getShabbatCoords() {
    try {
      var saved = localStorage.getItem('shabbatLoc');
      if (saved) {
        var loc = JSON.parse(saved);
        return { lat: loc.lat, lng: loc.lng, city: loc.name || loc.city || 'Paris', tzid: loc.tzid || 'Europe/Paris' };
      }
    } catch(e) {}
    return { lat: 48.8566, lng: 2.3522, city: 'Paris', tzid: 'Europe/Paris' };
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function fmtTime(isoStr) {
    if (!isoStr) return '--:--';
    var d = new Date(isoStr);
    if (isNaN(d)) return '--:--';
    return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

  function timeToMinutes(isoStr) {
    if (!isoStr) return null;
    var d = new Date(isoStr);
    if (isNaN(d)) return null;
    return d.getHours() * 60 + d.getMinutes();
  }

  function nowMinutes() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function loadZmanim() {
    var coords = getShabbatCoords();
    var cityLabel = document.getElementById('zmanim-city-label');
    if (cityLabel) cityLabel.textContent = coords.city;

    var list = document.getElementById('zmanim-list');
    if (list) list.innerHTML = '<div style="color:rgba(255,255,255,0.4);font-size:13px;padding:12px 0;text-align:center;font-family:EB Garamond,serif;">Chargement des zmanim…</div>';

    var cacheKey = 'zmanim_' + coords.lat.toFixed(2) + '_' + coords.lng.toFixed(2) + '_' + todayStr();
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch(e) {}

    if (cached && cached.times) {
      renderZmanim(cached.times);
    } else {
      var url = 'https://www.hebcal.com/zmanim?cfg=json&latitude=' + coords.lat + '&longitude=' + coords.lng + '&tzid=' + encodeURIComponent(coords.tzid || 'Europe/Paris') + '&date=' + todayStr();
      fetch(url)
        .then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function(data) {
          if (data && data.times) {
            try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch(e) {}
            renderZmanim(data.times);
          } else {
            if (list) list.innerHTML = '<div style="color:rgba(255,255,255,0.4);font-size:13px;padding:12px 0;text-align:center;font-family:EB Garamond,serif;">Aucune donnée disponible</div>';
          }
        })
        .catch(function(err) {
          console.warn('Zmanim fetch error:', err);
          if (list) list.innerHTML = '<div style="color:rgba(255,255,255,0.4);font-size:13px;padding:12px 0;text-align:center;font-family:EB Garamond,serif;">Impossible de charger les zmanim</div>';
        });
    }
  }

  function renderZmanim(times) {
    var list = document.getElementById('zmanim-list');
    if (!list) return;

    var now = nowMinutes();
    var html = '';
    var lastSection = '';
    var nextZman = null;
    var sunriseMin = timeToMinutes(times.sunrise);
    var sunsetMin = timeToMinutes(times.sunset);

    // Progress bar
    if (sunriseMin != null && sunsetMin != null) {
      var progress = 0;
      if (now < sunriseMin) progress = 0;
      else if (now > sunsetMin) progress = 100;
      else progress = Math.round(((now - sunriseMin) / (sunsetMin - sunriseMin)) * 100);
      var bar = document.getElementById('zmanim-progress');
      if (bar) bar.style.width = progress + '%';
      var slbl = document.getElementById('zmanim-sunrise-label');
      var elbl = document.getElementById('zmanim-sunset-label');
      if (slbl) slbl.textContent = fmtTime(times.sunrise);
      if (elbl) elbl.textContent = fmtTime(times.sunset);
    }

    ZMANIM_DEFS.forEach(function(z) {
      var timeVal = times[z.key];
      if (!timeVal) return;

      var min = timeToMinutes(timeVal);
      var isPast = min != null && min < now;
      var isCurrent = false;

      if (!isPast && !nextZman) {
        nextZman = { name: z.fr, time: fmtTime(timeVal) };
        isCurrent = true;
      }

      if (z.section !== lastSection) {
        html += '<div class="zmanim-section-label">' + SECTION_LABELS[z.section] + '</div>';
        lastSection = z.section;
      }

      var cls = 'zmanim-item';
      if (isPast) cls += ' past';
      if (isCurrent) cls += ' current';

      html += '<div class="' + cls + '">';
      html += '<div class="zmanim-dot"></div>';
      html += '<div class="zmanim-label">';
      html += '<div class="zmanim-label-fr">' + z.fr + '</div>';
      html += '<div class="zmanim-label-he">' + z.he + '</div>';
      html += '</div>';
      html += '<div class="zmanim-time">' + fmtTime(timeVal) + '</div>';
      html += '</div>';
    });

    list.innerHTML = html;

    // Next zman badge
    var badge = document.getElementById('zmanim-next-badge');
    if (badge && nextZman) {
      document.getElementById('zmanim-next-name').textContent = nextZman.name;
      document.getElementById('zmanim-next-time').textContent = nextZman.time;
      badge.style.display = 'inline-flex';
    }
  }

  window.toggleZmanim = function() {
    var card = document.getElementById('zmanim-card');
    if (card) card.classList.toggle('open');
  };

  window.shareZmanim = function(e) {
    if (e) e.stopPropagation();
    var coords = getShabbatCoords();
    var today = new Date();
    var dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var lines = ['🕐 Zmanim du jour', '📍 ' + coords.city, '📅 ' + dateStr, '─────────────────'];

    var items = document.querySelectorAll('#zmanim-list .zmanim-item');
    items.forEach(function(item) {
      var label = item.querySelector('.zmanim-label-fr');
      var time = item.querySelector('.zmanim-time');
      if (label && time) {
        var isPast = item.classList.contains('past');
        var isCurrent = item.classList.contains('current');
        var prefix = isCurrent ? '▶ ' : (isPast ? '  ' : '  ');
        lines.push(prefix + label.textContent + '  ' + time.textContent);
      }
    });

    lines.push('', '🕎 Chab\'app - chabapp.com');
    var shareText = lines.join('\n');

    if (navigator.share) {
      navigator.share({ title: 'Zmanim - ' + coords.city, text: shareText }).catch(function(){});
    } else {
      navigator.clipboard.writeText(shareText).then(function() {
        var btn = e && e.currentTarget;
        if (btn) {
          var orig = btn.innerHTML;
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copié !';
          setTimeout(function() { btn.innerHTML = orig; }, 1500);
        }
      }).catch(function(){});
    }
  };

  // Load on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadZmanim);
  } else {
    loadZmanim();
  }

  // Refresh every minute for current zman highlighting
  setInterval(function() {
    try {
      var coords = getShabbatCoords();
      var cacheKey = 'zmanim_' + coords.lat.toFixed(2) + '_' + coords.lng.toFixed(2) + '_' + todayStr();
      var cached = JSON.parse(localStorage.getItem(cacheKey));
      if (cached && cached.times) renderZmanim(cached.times);
    } catch(e) {}
  }, 60000);

  // Listen for shabbat location changes
  window.addEventListener('shabbatLocChanged', loadZmanim);
})();
