/* ============================================================
   simha.js  —  Panel Sim'ha — Humour juif  (KOULAM)
   Comediens juifs francophones avec lecteur YouTube integre
   ============================================================ */

var SIMHA_COMEDIANS = [
  {
    name: 'Samuel Bambi',
    avatar: 'SB',
    color: '#e74c3c',
    videos: [
      { id: 'xKBSTO1gPOY', title: 'Samuel Bambi - Spectacle complet' },
      { id: 'yOAAHrXmm0g', title: 'Samuel Bambi - La communaute' },
      { id: 'J_h_v6IVQDU', title: 'Samuel Bambi - Les mariages juifs' },
      { id: 'L3UDm8Q4kYw', title: 'Samuel Bambi - Chabat en famille' },
      { id: 'rZ0buWwpX4U', title: 'Samuel Bambi - Le meilleur de Bambi' }
    ]
  },
  {
    name: 'David Azria',
    avatar: 'DA',
    color: '#3498db',
    videos: [
      { id: 'p0i_kJyET9g', title: 'David Azria - Spectacle complet' },
      { id: '7DPnOSKCaVY', title: 'David Azria - Les Sefar' },
      { id: 'qdJZcMFBkwQ', title: 'David Azria - La famille juive' },
      { id: 'GTflbhxWnj0', title: 'David Azria - Le meilleur de Azria' },
      { id: 'Fw2AQ0SQago', title: 'David Azria - Humour casher' }
    ]
  },
  {
    name: 'Yohann Levy',
    avatar: 'YL',
    color: '#2ecc71',
    videos: [
      { id: 'OU1a7RIWeHc', title: 'Yohann Levy - One man show' },
      { id: 'XrZXbqliQtM', title: 'Yohann Levy - Les fetes juives' },
      { id: 'S3qm0p5tDig', title: 'Yohann Levy - Sketch compilation' }
    ]
  },
  {
    name: 'Gad Elmaleh',
    avatar: 'GE',
    color: '#9b59b6',
    videos: [
      { id: 'I6VjNmyv_i4', title: 'Gad Elmaleh - La vie juive' },
      { id: 'YfucpGCb1hE', title: 'Gad Elmaleh - Papa est en haut' },
      { id: '3sQiDeJvVCE', title: 'Gad Elmaleh - Le mariage' },
      { id: 'xQREnatKHdI', title: 'Gad Elmaleh - L\'elu' }
    ]
  },
  {
    name: 'Elie Kakou',
    avatar: 'EK',
    color: '#e67e22',
    videos: [
      { id: 'f7_ho_Y5bU8', title: 'Elie Kakou - Olympia 1994 Spectacle integral' },
      { id: 'CnfKV2GGDWE', title: 'Elie Kakou - Mme Sarfati a l\'Olympia' },
      { id: 'FzzpSQ3JXfc', title: 'Elie Kakou - Fortunee Sarfati: apres j\'t\'explique' },
      { id: '8d5QYWx4eSw', title: 'Elie Kakou - Le Kibboutz' },
      { id: 'rFuBPH9biek', title: 'Elie Kakou - Pub Lessive' }
    ]
  },
  {
    name: 'Popeck',
    avatar: 'PO',
    color: '#1abc9c',
    videos: [
      { id: 'VR9L4VZ5BMA', title: 'Popeck - Les calecons molletonnes' },
      { id: 'fQvz9tR8xOk', title: 'Popeck - Best of sketches' },
      { id: '6FTg5K2Qxh4', title: 'Popeck - On n\'est pas des sauvages' }
    ]
  }
];

var _simhaActiveComedian = 'all';
var _simhaLoaded = false;

function simhaLoad() {
  _simhaLoaded = true;
  _simhaRender();
}

function _simhaRender() {
  var grid = document.getElementById('simha-grid');
  var filtersEl = document.getElementById('simha-filters');
  if (!grid) return;

  // Filtres humoristes
  var fhtml = '<button class="yt-channel-filter' + (_simhaActiveComedian === 'all' ? ' active' : '') + '" onclick="simhaFilter(\'all\')">Tous</button>';
  SIMHA_COMEDIANS.forEach(function(c) {
    var safeName = c.name.replace(/'/g, "\\'");
    fhtml += '<button class="yt-channel-filter' + (_simhaActiveComedian === c.name ? ' active' : '') + '" onclick="simhaFilter(\'' + safeName + '\')">';
    fhtml += '<span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:' + c.color + ';color:#fff;font-size:10px;font-weight:800;line-height:22px;text-align:center;margin-right:6px;vertical-align:middle;">' + c.avatar + '</span>';
    fhtml += c.name.split(' ')[0];
    fhtml += '</button>';
  });
  if (filtersEl) filtersEl.innerHTML = fhtml;

  // Collecter les videos
  var videos = [];
  SIMHA_COMEDIANS.forEach(function(c) {
    if (_simhaActiveComedian !== 'all' && _simhaActiveComedian !== c.name) return;
    c.videos.forEach(function(v) {
      videos.push({ id: v.id, title: v.title, comedian: c.name, color: c.color, avatar: c.avatar });
    });
  });

  if (!videos.length) {
    grid.innerHTML = '<div class="feed-empty">Aucune video pour cet humoriste.</div>';
    return;
  }

  var html = '<div class="yt-grid-inner">';
  videos.forEach(function(v, i) {
    var thumb = 'https://img.youtube.com/vi/' + v.id + '/mqdefault.jpg';
    html += '<div class="yt-card" onclick="simhaPlay(\'' + v.id + '\', \'' + v.title.replace(/'/g, "\\'") + '\')">';
    html += '<div class="yt-thumb-wrap">';
    html += '<img class="yt-thumb" src="' + thumb + '" alt="' + v.title.replace(/"/g, '&quot;') + '" loading="lazy" />';
    html += '<div class="yt-play-icon"><svg width="40" height="40" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg></div>';
    html += '</div>';
    html += '<div class="yt-card-info">';
    html += '<div class="yt-card-title">' + v.title + '</div>';
    html += '<div class="yt-card-channel">' + v.comedian + '</div>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';
  grid.innerHTML = html;
}

function simhaFilter(name) {
  _simhaActiveComedian = name;
  _simhaRender();
}

function simhaPlay(videoId, title) {
  var wrap = document.getElementById('simha-player-wrap');
  var container = document.getElementById('simha-player-container');
  var titleEl = document.getElementById('simha-player-title');
  if (!wrap || !container) return;

  container.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border-radius:12px;"></iframe>';
  if (titleEl) titleEl.textContent = title;
  wrap.style.display = '';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function simhaClosePlayer() {
  var wrap = document.getElementById('simha-player-wrap');
  var container = document.getElementById('simha-player-container');
  if (container) container.innerHTML = '';
  if (wrap) wrap.style.display = 'none';
}

// Toggle Spotify / Apple Music
function simhaMusicToggle(artist, platform) {
  var spotify = document.getElementById(artist + '-spotify');
  var apple = document.getElementById(artist + '-apple');
  var spotifyBtn = document.getElementById(artist + '-spotify-btn');
  var appleBtn = document.getElementById(artist + '-apple-btn');
  if (!spotify || !apple || !spotifyBtn || !appleBtn) return;
  var inactiveStyle = 'flex:1;padding:8px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;';
  if (platform === 'spotify') {
    spotify.style.display = 'block';
    apple.style.display = 'none';
    spotifyBtn.setAttribute('style', inactiveStyle + 'border:1.5px solid #1DB954;background:#1DB954;color:#fff;');
    appleBtn.setAttribute('style', inactiveStyle + 'border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;');
  } else {
    spotify.style.display = 'none';
    apple.style.display = 'block';
    appleBtn.setAttribute('style', inactiveStyle + 'border:1.5px solid #fc3c44;background:#fc3c44;color:#fff;');
    spotifyBtn.setAttribute('style', inactiveStyle + 'border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;');
  }
}

console.log("[KOULAM] Simha module charge");
