/* ============================================================
   videos.js  —  Vidéos YouTube intégrées  (KOULAM)
   Dépend de : firebase-config.js, auth.js
   ============================================================ */

// ─── Vidéos par défaut (fallback si Firestore vide) ────────
var YT_DEFAULT_VIDEOS = [
  // JEM Francais
  { id: "iHUjCKdS63E", title: "How to Bring More Blessing Into Your Life", channel: "JEM" },
  { id: "swOXU9s-joc", title: "Rebbe, You're AMAZING!", channel: "JEM" },
  { id: "gD1kOqonLOk", title: "What the Rebbe Told Him After 19 Years", channel: "JEM" },
  // Torah-Box
  { id: "LxBD5FpAIMU", title: "Écouter la Méguila sur internet ???", channel: "Torah-Box" },
  { id: "OGlZy9l4QS8", title: "Ali, le cruel passeur des Juifs iraniens", channel: "Torah-Box" },
  { id: "vZyIxfD3Mwg", title: "Toulal - Le Film", channel: "Torah-Box" },
  // Chabad.org
  { id: "XVHUSab2ggo", title: "Pourquoi célébrer son anniversaire juif ?", channel: "Chabad.org" },
  { id: "CIKUnz3e5f8", title: "Êtes-vous un Joshnik ?", channel: "Chabad.org" },
  { id: "O4VPLKUb03E", title: "Comment la science m'a fait croire en Dieu", channel: "Chabad.org" },
  // Rav Touitou
  { id: "ufcZYwwiT80", title: "Peut-on garder du hametz à la maison pendant Pessah ?", channel: "Rav Touitou" },
  { id: "3ZYFMDjcxaI", title: "Face au danger, la Torah nous apprend à rester vigilants", channel: "Rav Touitou" },
  { id: "4dNfwHVhQxo", title: "Vayakel Pekoude", channel: "Rav Touitou" },
  // Project Likkutei Sichos
  { id: "FJ1diI9EWL8", title: "Vol 27 - Beit Nissan - Francais", channel: "Likkutei Sichos" },
  { id: "6WJspTxdlX0", title: "Chelek 27, Vayikra 3 - Rabbi Moshe Gourarie", channel: "Likkutei Sichos" },
  { id: "iNsS9-WurlE", title: "Chelek 31, Vayakhel 1 - Mrs. Rivky Slonim", channel: "Likkutei Sichos" },
  // MyJLI
  { id: "aCJQh9zn694", title: "The Most Difficult Rule in Judaism", channel: "MyJLI" },
  { id: "Nsgr1puuFOI", title: "6 raisons juives de croire en Dieu", channel: "MyJLI" },
  { id: "KfLaJy7a_Cg", title: "Qu'est-ce qui distingue le judaïsme des autres religions ?", channel: "MyJLI" }
];

var _ytVideos    = [];
var _ytChannels  = [];
var _ytLoaded    = false;
var _ytIsAdmin   = false;
var _ytActiveChannel = "all";   // filtre chaîne

// ─── Profils de chaînes YouTube ──────────────────────────
var YT_PROFILES = [
  {
    name: "JEM Francais",
    handle: "@jem_francais",
    url: "https://youtube.com/@jem_francais",
    avatar: "assets/yt-jem.jpg",
    banner: "",
    description: "Contenu du Rabbi de Loubavitch en francais",
    channelFilter: "JEM",
    channelId: "UCqxhJ0eBEcK-OVydaAxo6aw"
  },
  {
    name: "Torah-Box",
    handle: "@torahbox",
    url: "https://youtube.com/@torahbox",
    avatar: "assets/yt-torahbox.jpg",
    banner: "",
    description: "L'association de diffusion du Judaisme aux francophones",
    channelFilter: "Torah-Box",
    channelId: "UCNgEEqkr9UeSqxJAHxe6-KA"
  },
  {
    name: "Chabad.org",
    handle: "@chabadorg",
    url: "https://youtube.com/@chabadorg",
    avatar: "assets/yt-chabadorg.jpg",
    banner: "",
    description: "Le mouvement Loubavitch dans le monde",
    channelFilter: "Chabad.org",
    channelId: "UCc0y_E87EUnOW2m2mGJU9Gg"
  },
  {
    name: "Rav Touitou",
    handle: "@ravtouitou",
    url: "https://youtube.com/@ravtouitou",
    avatar: "assets/yt-ravtouitou.jpg",
    banner: "",
    description: "Cours de Torah en francais - torathaim.net",
    channelFilter: "Rav Touitou",
    channelId: "UCgKxJNdzZ2Z4hXVeOMaPfAQ"
  },
  {
    name: "Project Likkutei Sichos",
    handle: "@ProjectLikkuteiSichos",
    url: "https://youtube.com/@ProjectLikkuteiSichos",
    avatar: "assets/yt-likkuteisichos.jpg",
    banner: "",
    description: "Etude approfondie des Likkutei Sichos du Rabbi",
    channelFilter: "Likkutei Sichos",
    channelId: "UC8X3Vt5Cq6rwldlhfAj3KsQ"
  },
  {
    name: "MyJLI",
    handle: "@MyJLI",
    url: "https://youtube.com/@MyJLI",
    avatar: "assets/yt-myjli.jpg",
    banner: "",
    description: "Jewish Learning Institute - Cours et conferences",
    channelFilter: "MyJLI",
    channelId: "UCESz8P8IVAdOV-vcfavS1qA"
  }
];

// ─── Charger les vidéos depuis l'API YouTube Data v3 ──────
function _ytFetchRSS() {
  var apiKey = 'AIzaSyAe_jEp71kN1N3yrdzyk6Ya3EWgLX4ZSZ8';
  if (!apiKey) {
    console.warn("[Videos] Pas de cle API Google");
    return Promise.resolve([]);
  }

  var fetches = YT_PROFILES.map(function(p) {
    var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=" +
      p.channelId + "&maxResults=15&order=date&type=video&key=" + apiKey;
    return fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var videos = [];
        if (data.items) {
          data.items.forEach(function(item) {
            if (item.id && item.id.videoId && item.snippet) {
              videos.push({
                id: item.id.videoId,
                title: item.snippet.title,
                channel: p.channelFilter
              });
            }
          });
        }
        return videos;
      })
      .catch(function() { return []; });
  });

  return Promise.all(fetches).then(function(results) {
    var all = [];
    results.forEach(function(vids) { all = all.concat(vids); });
    return all;
  });
}

// ─── Extraire l'ID YouTube d'une URL ───────────────────────
function _ytExtractId(url) {
  if (!url) return "";
  // Déjà un ID (11 chars, pas d'espace)
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  var match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : "";
}

// ─── Vérifier si l'utilisateur est admin ───────────────────
function _ytCheckAdmin() {
  if (!chabUser) { _ytIsAdmin = false; return Promise.resolve(); }
  return fbDb.collection("config").doc("admins").get().then(function (doc) {
    if (doc.exists) {
      var data = doc.data();
      _ytIsAdmin = (data.uids || []).indexOf(chabUser.uid) !== -1;
    } else {
      // Premier utilisateur = admin automatique
      fbDb.collection("config").doc("admins").set({ uids: [chabUser.uid] });
      _ytIsAdmin = true;
    }
  }).catch(function () { _ytIsAdmin = false; });
}

// ─── Charger les vidéos et chaînes depuis Firestore ────────
function ytLoadVideos() {
  var grid = document.getElementById("yt-grid");
  if (!grid) return;
  grid.innerHTML = '<div class="feed-loading">Chargement des vidéos…</div>';

  _ytCheckAdmin().then(function () {
    return Promise.all([
      ytVideosCol.orderBy("createdAt", "desc").get(),
      ytChannelsCol.orderBy("name").get()
    ]);
  }).then(function (results) {
    var vSnap = results[0];
    var cSnap = results[1];

    // Chaînes
    _ytChannels = [];
    cSnap.forEach(function (doc) {
      _ytChannels.push(Object.assign({ docId: doc.id }, doc.data()));
    });

    // Vidéos
    _ytVideos = [];
    vSnap.forEach(function (doc) {
      _ytVideos.push(Object.assign({ docId: doc.id }, doc.data()));
    });

    // Charger les vidéos depuis les flux RSS YouTube
    _ytFetchRSS().then(function(rssVideos) {
      if (rssVideos.length) {
        // Ajouter les vidéos RSS (sans doublons avec Firestore)
        var existingIds = {};
        _ytVideos.forEach(function(v) { existingIds[v.id] = true; });
        rssVideos.forEach(function(v) {
          if (!existingIds[v.id]) _ytVideos.push(v);
        });
      }
      if (!_ytVideos.length) {
        _ytVideos = YT_DEFAULT_VIDEOS.map(function (v) {
          return { id: v.id, title: v.title, channel: v.channel };
        });
      }
      _ytLoaded = true;
      _ytRender();
    });
  }).catch(function (err) {
    console.error("[Videos] Erreur chargement:", err);
    _ytFetchRSS().then(function(rssVideos) {
      _ytVideos = rssVideos.length ? rssVideos : YT_DEFAULT_VIDEOS.slice();
      _ytLoaded = true;
      _ytRender();
    });
  });
}

// ─── Rendu complet ─────────────────────────────────────────
function _ytRender() {
  var grid = document.getElementById("yt-grid");
  if (!grid) return;

  var html = "";

  // Barre admin si admin
  if (_ytIsAdmin) {
    html += '<div class="yt-admin-bar">';
    html += '<button class="yt-admin-btn" onclick="ytShowAddVideo()">+ Ajouter une vidéo</button>';
    html += '<button class="yt-admin-btn yt-admin-btn-channel" onclick="ytShowAddChannel()">+ Nouvelle chaîne</button>';
    html += '</div>';
  }

  // Profils de chaînes
  if (YT_PROFILES.length) {
    html += '<div class="yt-profiles-section">';
    html += '<div class="yt-profiles-title">Chaines recommandees</div>';
    html += '<div class="yt-profiles-scroll">';
    YT_PROFILES.forEach(function (p, idx) {
      html += '<div class="yt-profile-card" onclick="ytOpenProfile(' + idx + ')">';
      html += '<img class="yt-profile-avatar" src="' + _ytEsc(p.avatar) + '" alt="' + _ytEsc(p.name) + '" />';
      html += '<div class="yt-profile-name">' + _ytEsc(p.name) + '</div>';
      html += '<div class="yt-profile-handle">' + _ytEsc(p.handle) + '</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';
  }

  // Filtres par chaîne (depuis YT_PROFILES + Firestore)
  var filterNames = [];
  YT_PROFILES.forEach(function(p) { if (filterNames.indexOf(p.channelFilter) === -1) filterNames.push(p.channelFilter); });
  _ytChannels.forEach(function(c) { if (filterNames.indexOf(c.name) === -1) filterNames.push(c.name); });
  if (filterNames.length) {
    html += '<div class="yt-channel-filters">';
    html += '<button class="yt-channel-filter' + (_ytActiveChannel === "all" ? ' active' : '') + '" onclick="ytFilterChannel(\'all\')">Toutes</button>';
    filterNames.forEach(function (name) {
      html += '<button class="yt-channel-filter' + (_ytActiveChannel === name ? ' active' : '') + '" onclick="ytFilterChannel(\'' + _ytEsc(name).replace(/'/g, "\\'") + '\')">' + _ytEsc(name) + '</button>';
    });
    html += '</div>';
  }

  // Grille de vidéos
  var filtered = _ytActiveChannel === "all"
    ? _ytVideos
    : _ytVideos.filter(function (v) { return v.channel === _ytActiveChannel; });

  if (!filtered.length) {
    html += '<div class="feed-empty">Aucune vidéo pour l\'instant.</div>';
  } else {
    html += '<div class="yt-grid-inner">';
    filtered.forEach(function (v, i) {
      var realIndex = _ytVideos.indexOf(v);
      var thumb = "https://img.youtube.com/vi/" + v.id + "/mqdefault.jpg";
      html += '<div class="yt-card" onclick="ytPlayVideo(' + realIndex + ')">';
      html += '<div class="yt-thumb-wrap">';
      html += '<img class="yt-thumb" src="' + thumb + '" alt="' + _ytEsc(v.title) + '" loading="lazy" />';
      html += '<div class="yt-play-icon"><svg width="40" height="40" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg></div>';
      html += '</div>';
      html += '<div class="yt-card-info">';
      html += '<div class="yt-card-title">' + _ytEsc(v.title) + '</div>';
      html += '<div class="yt-card-channel">' + _ytEsc(v.channel) + '</div>';
      if (_ytIsAdmin && v.docId) {
        html += '<div class="yt-card-delete" onclick="event.stopPropagation();ytDeleteVideo(\'' + v.docId + '\')">🗑</div>';
      }
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  grid.innerHTML = html;
}

// ─── Filtrer par chaîne ────────────────────────────────────
function ytFilterChannel(name) {
  _ytActiveChannel = name;
  _ytRender();
}

// ─── Reels-style player state ───────────────────────────────
var _ytReelsObserver = null;
var _ytActiveSlideIdx = -1;

// ─── Lire une vidéo (mode Reels) ────────────────────────────
function ytPlayVideo(index) {
  var v = _ytVideos[index];
  if (!v) return;

  var wrap = document.getElementById("yt-player-wrap");
  var feed = document.getElementById("yt-reels-feed");
  if (!wrap || !feed) return;

  // Ordonner : vidéo cliquée en premier, puis les autres dans l'ordre
  var ordered = [index];
  for (var i = 0; i < _ytVideos.length; i++) {
    if (i !== index) ordered.push(i);
  }

  // Construire les slides
  var html = '';
  for (var s = 0; s < ordered.length; s++) {
    var vi = ordered[s];
    var vid = _ytVideos[vi];
    var thumb = "https://img.youtube.com/vi/" + vid.id + "/mqdefault.jpg";
    html += '<div class="yt-reel-slide" data-video-idx="' + vi + '" data-slide="' + s + '">';
    if (s === 0) {
      // Premier slide : iframe direct avec autoplay
      html += '<div class="yt-reel-iframe-wrap">';
      html += '<iframe src="https://www.youtube.com/embed/' + vid.id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autopictureinpicture" allowfullscreen autopictureinpicture></iframe>';
      html += '</div>';
    } else {
      // Autres slides : thumbnail avec bouton play
      html += '<div class="yt-reel-thumb-wrap" onclick="_ytActivateSlide(this.parentNode)">';
      html += '<img src="' + thumb + '" alt="" loading="lazy" />';
      html += '<div class="yt-reel-play-btn"><svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div>';
      html += '</div>';
    }
    html += '<div class="yt-reel-info">';
    html += '<div class="yt-reel-title">' + _ytEsc(vid.title) + '</div>';
    if (vid.channel) html += '<div class="yt-reel-channel">' + _ytEsc(vid.channel) + '</div>';
    html += '</div>';
    html += '</div>';
  }
  html += '<div class="yt-reel-hint">Swipe vers le haut pour la suite</div>';
  feed.innerHTML = html;
  feed.scrollTop = 0;
  _ytActiveSlideIdx = 0;

  // IntersectionObserver pour détecter le slide visible
  if (_ytReelsObserver) _ytReelsObserver.disconnect();
  _ytReelsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var slide = entry.target;
      var slideIdx = parseInt(slide.getAttribute('data-slide'));
      if (slideIdx === _ytActiveSlideIdx) return;

      // Désactiver l'ancien slide (iframe → thumbnail)
      var oldSlide = feed.querySelector('.yt-reel-slide[data-slide="' + _ytActiveSlideIdx + '"]');
      if (oldSlide) _ytDeactivateSlide(oldSlide);

      // Activer le nouveau slide (thumbnail → iframe)
      _ytActivateSlide(slide);
      _ytActiveSlideIdx = slideIdx;
    });
  }, { root: feed, threshold: 0.6 });

  var slides = feed.querySelectorAll('.yt-reel-slide');
  for (var j = 0; j < slides.length; j++) {
    _ytReelsObserver.observe(slides[j]);
  }

  // Bloquer le scroll du body
  document.body.style.overflow = "hidden";
  wrap.style.display = "";
}

// Activer un slide : remplacer thumbnail par iframe
function _ytActivateSlide(slide) {
  if (!slide) return;
  var vi = parseInt(slide.getAttribute('data-video-idx'));
  var vid = _ytVideos[vi];
  if (!vid) return;
  var thumbWrap = slide.querySelector('.yt-reel-thumb-wrap');
  if (!thumbWrap) return; // déjà un iframe
  var iframeWrap = document.createElement('div');
  iframeWrap.className = 'yt-reel-iframe-wrap';
  iframeWrap.innerHTML = '<iframe src="https://www.youtube.com/embed/' + vid.id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autopictureinpicture" allowfullscreen autopictureinpicture></iframe>';
  slide.replaceChild(iframeWrap, thumbWrap);
}

// Désactiver un slide : remplacer iframe par thumbnail
function _ytDeactivateSlide(slide) {
  if (!slide) return;
  var vi = parseInt(slide.getAttribute('data-video-idx'));
  var vid = _ytVideos[vi];
  if (!vid) return;
  var iframeWrap = slide.querySelector('.yt-reel-iframe-wrap');
  if (!iframeWrap) return; // déjà une thumbnail
  var thumb = "https://img.youtube.com/vi/" + vid.id + "/mqdefault.jpg";
  var thumbWrap = document.createElement('div');
  thumbWrap.className = 'yt-reel-thumb-wrap';
  thumbWrap.setAttribute('onclick', '_ytActivateSlide(this.parentNode)');
  thumbWrap.innerHTML = '<img src="' + thumb + '" alt="" /><div class="yt-reel-play-btn"><svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div>';
  slide.replaceChild(thumbWrap, iframeWrap);
}

// ─── Fermer le lecteur ─────────────────────────────────────
function ytClosePlayer() {
  var wrap = document.getElementById("yt-player-wrap");
  var feed = document.getElementById("yt-reels-feed");
  if (_ytReelsObserver) { _ytReelsObserver.disconnect(); _ytReelsObserver = null; }
  _ytActiveSlideIdx = -1;
  if (feed) feed.innerHTML = "";
  if (wrap) wrap.style.display = "none";
  document.body.style.overflow = "";
}

// ─── PiP automatique quand l'utilisateur quitte l'app ────
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState !== 'hidden') return;
  // Verifier qu'une video est en cours dans le lecteur Reels
  var wrap = document.getElementById('yt-player-wrap');
  if (!wrap || wrap.style.display === 'none') return;
  // Trouver le slide actif avec un iframe
  var feed = document.getElementById('yt-reels-feed');
  if (!feed) return;
  var activeSlide = feed.querySelector('.yt-reel-slide[data-slide="' + _ytActiveSlideIdx + '"]');
  if (!activeSlide) return;
  var iframe = activeSlide.querySelector('iframe');
  if (!iframe) return;
  // Tenter le PiP sur la video dans l'iframe (fonctionne si same-origin ou si le navigateur le supporte)
  try {
    // Methode 1: Document PiP API (Chrome 116+)
    if (window.documentPictureInPicture && window.documentPictureInPicture.requestWindow) {
      // Pas supporte de maniere fiable sur mobile, skip
    }
    // Methode 2: Video element PiP (necessite un element video, pas un iframe)
    // Pour YouTube embeds, le navigateur gere le PiP nativement si l'utilisateur l'a active
    // On peut forcer via l'attribut allow sur l'iframe
    if (iframe && !iframe.getAttribute('allow').includes('picture-in-picture')) {
      iframe.setAttribute('allow', iframe.getAttribute('allow') + '; picture-in-picture');
    }
  } catch(e) {}
});

// ─── Page profil in-app ──────────────────────────────────
var _ytProfileOpen = false;

function ytOpenProfile(idx) {
  var p = YT_PROFILES[idx];
  if (!p) return;

  _ytProfileOpen = true;
  var grid = document.getElementById("yt-grid");
  if (!grid) return;

  // Filtrer les videos de cette chaine
  var channelVideos = _ytVideos.filter(function (v) { return v.channel === p.channelFilter; });

  var html = '';

  // Header profil
  html += '<div class="ytp-header">';
  html += '<div class="ytp-banner"></div>';
  html += '<div class="ytp-info">';
  html += '<img class="ytp-avatar" src="' + _ytEsc(p.avatar) + '" alt="' + _ytEsc(p.name) + '" />';
  html += '<div class="ytp-meta">';
  html += '<div class="ytp-name">' + _ytEsc(p.name) + '</div>';
  html += '<div class="ytp-handle">' + _ytEsc(p.handle) + '</div>';
  if (p.description) {
    html += '<div class="ytp-desc">' + _ytEsc(p.description) + '</div>';
  }
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // Compteur de videos
  html += '<div class="ytp-video-count">' + channelVideos.length + ' video' + (channelVideos.length > 1 ? 's' : '') + '</div>';

  // Grille des videos de la chaine
  if (!channelVideos.length) {
    html += '<div class="feed-empty">Aucune video de cette chaine.</div>';
  } else {
    html += '<div class="yt-grid-inner">';
    channelVideos.forEach(function (v) {
      var realIndex = _ytVideos.indexOf(v);
      var thumb = "https://img.youtube.com/vi/" + v.id + "/mqdefault.jpg";
      html += '<div class="yt-card" onclick="ytPlayVideo(' + realIndex + ')">';
      html += '<div class="yt-thumb-wrap">';
      html += '<img class="yt-thumb" src="' + thumb + '" alt="' + _ytEsc(v.title) + '" loading="lazy" />';
      html += '<div class="yt-play-icon"><svg width="40" height="40" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg></div>';
      html += '</div>';
      html += '<div class="yt-card-info">';
      html += '<div class="yt-card-title">' + _ytEsc(v.title) + '</div>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  grid.innerHTML = html;

  // Mettre a jour le titre du top bar
  var titleEl = document.querySelector('#panel-sub-videos .panel-title span');
  if (titleEl) {
    titleEl.innerHTML = _ytEsc(p.name);
  }

  // Scroll en haut
  grid.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ytCloseProfile() {
  _ytProfileOpen = false;
  // Restaurer le titre du top bar
  var titleEl = document.querySelector('#panel-sub-videos .panel-title span');
  if (titleEl) {
    titleEl.innerHTML = 'Jew<span style="color:#ff0033;">Tube</span>';
  }
  _ytRender();
}

// ═══════════════════════════════════════════════════════════
//  ADMIN : Ajouter une vidéo
// ═══════════════════════════════════════════════════════════

function ytShowAddVideo() {
  if (!_ytIsAdmin) return;

  // Construire les options de chaînes
  var channelOptions = '<option value="">— Choisir une chaîne —</option>';
  _ytChannels.forEach(function (c) {
    channelOptions += '<option value="' + _ytEsc(c.name) + '">' + _ytEsc(c.name) + '</option>';
  });
  channelOptions += '<option value="__new__">+ Nouvelle chaîne…</option>';

  var html = '<div class="yt-admin-modal-overlay" onclick="ytCloseAdminModal()">';
  html += '<div class="yt-admin-modal" onclick="event.stopPropagation()">';
  html += '<div class="yt-admin-modal-title">Ajouter une vidéo</div>';
  html += '<input id="yt-add-url" type="text" class="yt-admin-input" placeholder="Lien YouTube ou ID de la vidéo" />';
  html += '<input id="yt-add-title" type="text" class="yt-admin-input" placeholder="Titre de la vidéo" />';
  html += '<select id="yt-add-channel" class="yt-admin-input" onchange="if(this.value===\'__new__\')ytShowAddChannel()">' + channelOptions + '</select>';
  html += '<div class="yt-admin-modal-actions">';
  html += '<button class="yt-admin-cancel" onclick="ytCloseAdminModal()">Annuler</button>';
  html += '<button class="yt-admin-save" onclick="ytSaveVideo()">Ajouter</button>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  var el = document.createElement("div");
  el.id = "yt-admin-modal-root";
  el.innerHTML = html;
  document.body.appendChild(el);
}

function ytSaveVideo() {
  var urlInput     = document.getElementById("yt-add-url");
  var titleInput   = document.getElementById("yt-add-title");
  var channelInput = document.getElementById("yt-add-channel");

  var videoId = _ytExtractId(urlInput ? urlInput.value : "");
  var title   = titleInput ? titleInput.value.trim() : "";
  var channel = channelInput ? channelInput.value : "";

  if (!videoId) return alert("Lien YouTube invalide.");
  if (!title) return alert("Veuillez entrer un titre.");
  if (!channel || channel === "__new__") return alert("Veuillez choisir une chaîne.");

  ytVideosCol.add({
    id:        videoId,
    title:     title,
    channel:   channel,
    addedBy:   chabUser.uid,
    createdAt: fbTimestamp()
  }).then(function () {
    ytCloseAdminModal();
    _ytLoaded = false;
    ytLoadVideos();
  }).catch(function (err) {
    alert("Erreur : " + err.message);
  });
}

// ═══════════════════════════════════════════════════════════
//  ADMIN : Ajouter une chaîne
// ═══════════════════════════════════════════════════════════

function ytShowAddChannel() {
  if (!_ytIsAdmin) return;

  var html = '<div class="yt-admin-modal-overlay" onclick="ytCloseAdminModal()">';
  html += '<div class="yt-admin-modal" onclick="event.stopPropagation()">';
  html += '<div class="yt-admin-modal-title">Nouvelle chaîne</div>';
  html += '<input id="yt-channel-name" type="text" class="yt-admin-input" placeholder="Nom de la chaîne (ex: JEM Français)" />';
  html += '<input id="yt-channel-url" type="text" class="yt-admin-input" placeholder="URL YouTube de la chaîne (optionnel)" />';
  html += '<div class="yt-admin-modal-actions">';
  html += '<button class="yt-admin-cancel" onclick="ytCloseAdminModal()">Annuler</button>';
  html += '<button class="yt-admin-save" onclick="ytSaveChannel()">Créer</button>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // Fermer un éventuel modal existant
  ytCloseAdminModal();

  var el = document.createElement("div");
  el.id = "yt-admin-modal-root";
  el.innerHTML = html;
  document.body.appendChild(el);
}

function ytSaveChannel() {
  var nameInput = document.getElementById("yt-channel-name");
  var urlInput  = document.getElementById("yt-channel-url");

  var name = nameInput ? nameInput.value.trim() : "";
  var url  = urlInput ? urlInput.value.trim() : "";

  if (!name) return alert("Veuillez entrer un nom de chaîne.");

  ytChannelsCol.add({
    name:      name,
    url:       url,
    addedBy:   chabUser.uid,
    createdAt: fbTimestamp()
  }).then(function () {
    ytCloseAdminModal();
    _ytLoaded = false;
    ytLoadVideos();
  }).catch(function (err) {
    alert("Erreur : " + err.message);
  });
}

// ═══════════════════════════════════════════════════════════
//  ADMIN : Supprimer une vidéo
// ═══════════════════════════════════════════════════════════

function ytDeleteVideo(docId) {
  if (!_ytIsAdmin) return;
  if (!confirm("Supprimer cette vidéo ?")) return;

  ytVideosCol.doc(docId).delete().then(function () {
    _ytLoaded = false;
    ytLoadVideos();
  });
}

// ─── Fermer le modal admin ─────────────────────────────────
function ytCloseAdminModal() {
  var el = document.getElementById("yt-admin-modal-root");
  if (el) el.remove();
}

// ─── Utilitaire ────────────────────────────────────────────
function _ytEsc(s) {
  var d = document.createElement("div");
  d.textContent = s || "";
  return d.innerHTML;
}

console.log("[KOULAM] Videos module chargé");
