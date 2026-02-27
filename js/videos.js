/* ============================================================
   videos.js  —  Vidéos YouTube intégrées  (Chab'app)
   Dépend de : firebase-config.js, auth.js
   ============================================================ */

// ─── Vidéos par défaut (fallback si Firestore vide) ────────
var YT_DEFAULT_VIDEOS = [
  { id: "dQw4w9WgXcQ", title: "Le Rabbi de Loubavitch - Farbrenguen", channel: "JEM Français" },
  { id: "3JZ_D3ELwOQ", title: "Le Rabbi parle aux enfants", channel: "JEM Français" },
  { id: "ZbZSe6N_BXs", title: "Dollars du Rabbi - Moments uniques", channel: "JEM Français" },
  { id: "tgbNymZ7vqY", title: "Le sens de la prière", channel: "Torah-Box" },
  { id: "kJQP7kiw5Fk", title: "Étude du Tanya - Chapitre 1", channel: "Loubavitch.fr" },
  { id: "RgKAFK5djSk", title: "La force du Chabbat", channel: "Torah-Box" },
  { id: "09R8_2nJtjg", title: "Comprendre les Tehilim", channel: "Torah-Box" },
  { id: "CevxZvSJLk8", title: "Les Mitsvot au quotidien", channel: "Loubavitch.fr" },
  { id: "hT_nvWreIhg", title: "Machia'h : qui est-il ?", channel: "Torah-Box" },
  { id: "JGwWNGJdvx8", title: "L'importance de la Tsédaka", channel: "Torah-Box" },
  { id: "OPf0YbXqDm0", title: "Histoires 'hassidiques", channel: "JEM Français" },
  { id: "60ItHLz5WEA", title: "La Paracha de la semaine", channel: "Torah-Box" }
];

var _ytVideos    = [];
var _ytChannels  = [];
var _ytLoaded    = false;
var _ytIsAdmin   = false;
var _ytActiveChannel = "all";   // filtre chaîne

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

    // Si aucune vidéo en Firestore, utiliser les vidéos par défaut
    if (!_ytVideos.length) {
      _ytVideos = YT_DEFAULT_VIDEOS.map(function (v) {
        return { id: v.id, title: v.title, channel: v.channel };
      });
    }

    _ytLoaded = true;
    _ytRender();
  }).catch(function (err) {
    console.error("[Videos] Erreur chargement:", err);
    _ytVideos = YT_DEFAULT_VIDEOS.slice();
    _ytLoaded = true;
    _ytRender();
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

  // Filtres par chaîne
  if (_ytChannels.length) {
    html += '<div class="yt-channel-filters">';
    html += '<button class="yt-channel-filter' + (_ytActiveChannel === "all" ? ' active' : '') + '" onclick="ytFilterChannel(\'all\')">Toutes</button>';
    _ytChannels.forEach(function (c) {
      html += '<button class="yt-channel-filter' + (_ytActiveChannel === c.name ? ' active' : '') + '" onclick="ytFilterChannel(\'' + _ytEsc(c.name).replace(/'/g, "\\'") + '\')">' + _ytEsc(c.name) + '</button>';
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

// ─── Lire une vidéo ────────────────────────────────────────
function ytPlayVideo(index) {
  var v = _ytVideos[index];
  if (!v) return;

  var wrap      = document.getElementById("yt-player-wrap");
  var container = document.getElementById("yt-player-container");
  var title     = document.getElementById("yt-player-title");

  if (!wrap || !container) return;

  container.innerHTML = '<iframe src="https://www.youtube.com/embed/' + v.id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border-radius:12px;"></iframe>';
  if (title) title.textContent = v.title + (v.channel ? " · " + v.channel : "");
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

console.log("[Chab'app] Videos module chargé ✓");
