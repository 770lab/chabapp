/* ============================================================
   videos.js  —  Vidéos YouTube intégrées  (Chab'app)
   ============================================================ */

// ─── Liste des vidéos (facilement modifiable) ──────────────
// Chaque vidéo : { id: "ID_YOUTUBE", title: "Titre", channel: "Chaîne" }
var YT_VIDEOS = [
  { id: "dQw4w9WgXcQ", title: "Introduction à la Torah", channel: "Torah-Box" },
  { id: "3JZ_D3ELwOQ", title: "Les 13 principes de foi", channel: "Rav Touitou" },
  { id: "ZbZSe6N_BXs", title: "La Paracha de la semaine", channel: "Torah-Box" },
  { id: "tgbNymZ7vqY", title: "Le sens de la prière", channel: "Rav Benchetrit" },
  { id: "kJQP7kiw5Fk", title: "Étude du Tanya - Chapitre 1", channel: "Loubavitch.fr" },
  { id: "RgKAFK5djSk", title: "La force du Chabbat", channel: "Torah-Box" },
  { id: "09R8_2nJtjg", title: "Comprendre les Tehilim", channel: "Rav Touitou" },
  { id: "CevxZvSJLk8", title: "Les Mitsvot au quotidien", channel: "Loubavitch.fr" },
  { id: "hT_nvWreIhg", title: "Machia'h : qui est-il ?", channel: "Rav Benchetrit" },
  { id: "JGwWNGJdvx8", title: "L'importance de la Tsédaka", channel: "Torah-Box" },
  { id: "OPf0YbXqDm0", title: "Le Rabbi de Loubavitch", channel: "Loubavitch.fr" },
  { id: "60ItHLz5WEA", title: "Histoires 'hassidiques", channel: "Rav Touitou" }
];

var _ytLoaded = false;

// ─── Charger et afficher les vignettes ─────────────────────
function ytLoadVideos() {
  if (_ytLoaded) return;
  _ytLoaded = true;

  var grid = document.getElementById("yt-grid");
  if (!grid) return;

  var html = "";
  YT_VIDEOS.forEach(function (v, i) {
    var thumb = "https://img.youtube.com/vi/" + v.id + "/mqdefault.jpg";
    html += '<div class="yt-card" onclick="ytPlayVideo(' + i + ')">';
    html += '<div class="yt-thumb-wrap">';
    html += '<img class="yt-thumb" src="' + thumb + '" alt="' + _ytEsc(v.title) + '" loading="lazy" />';
    html += '<div class="yt-play-icon"><svg width="40" height="40" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg></div>';
    html += '</div>';
    html += '<div class="yt-card-info">';
    html += '<div class="yt-card-title">' + _ytEsc(v.title) + '</div>';
    html += '<div class="yt-card-channel">' + _ytEsc(v.channel) + '</div>';
    html += '</div>';
    html += '</div>';
  });

  grid.innerHTML = html;
}

// ─── Lire une vidéo (iframe YouTube) ───────────────────────
function ytPlayVideo(index) {
  var v = YT_VIDEOS[index];
  if (!v) return;

  var wrap      = document.getElementById("yt-player-wrap");
  var container = document.getElementById("yt-player-container");
  var title     = document.getElementById("yt-player-title");

  if (!wrap || !container) return;

  container.innerHTML = '<iframe src="https://www.youtube.com/embed/' + v.id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border-radius:12px;"></iframe>';
  if (title) title.textContent = v.title;
  wrap.style.display = "";
  wrap.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Fermer le lecteur ─────────────────────────────────────
function ytClosePlayer() {
  var wrap      = document.getElementById("yt-player-wrap");
  var container = document.getElementById("yt-player-container");
  if (container) container.innerHTML = "";
  if (wrap) wrap.style.display = "none";
}

// ─── Utilitaire ────────────────────────────────────────────
function _ytEsc(s) {
  var d = document.createElement("div");
  d.textContent = s || "";
  return d.innerHTML;
}

console.log("[Chab'app] Videos module chargé ✓");
