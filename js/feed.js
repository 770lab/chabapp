/* ============================================================
   feed.js  —  Fil d'actualité communautaire  (Chab'app)
   Dépend de : firebase-config.js, auth.js
   ============================================================ */

// ─── État local ──────────────────────────────────────────────
var _feedPosts     = [];
var _feedListener  = null;   // Firestore onSnapshot unsubscribe
var _feedLastDoc   = null;   // pagination cursor
var _feedLoading   = false;
var _feedPageSize  = 15;
var _feedMediaFile = null;   // File en attente d'upload

// ─── Charger le feed (temps réel) ───────────────────────────
function feedLoad() {
  if (_feedListener) _feedListener(); // unsub précédent

  var el = document.getElementById("feed-list");
  if (el) el.innerHTML = '<div class="feed-loading">Chargement…</div>';

  _feedListener = postsCol
    .orderBy("createdAt", "desc")
    .limit(_feedPageSize)
    .onSnapshot(function (snap) {
      _feedPosts = [];
      _feedLastDoc = null;
      snap.forEach(function (doc) {
        _feedPosts.push(Object.assign({ id: doc.id }, doc.data()));
        _feedLastDoc = doc;
      });
      _renderFeed();
    }, function (err) {
      console.error("[Feed] onSnapshot error:", err);
    });
}

// ─── Charger plus (pagination) ──────────────────────────────
function feedLoadMore() {
  if (_feedLoading || !_feedLastDoc) return;
  _feedLoading = true;

  postsCol
    .orderBy("createdAt", "desc")
    .startAfter(_feedLastDoc)
    .limit(_feedPageSize)
    .get()
    .then(function (snap) {
      snap.forEach(function (doc) {
        _feedPosts.push(Object.assign({ id: doc.id }, doc.data()));
        _feedLastDoc = doc;
      });
      _feedLoading = false;
      _renderFeed();
    });
}

// ─── Publier un post ────────────────────────────────────────
function feedPublish() {
  if (!chabUser) return alert("Connectez-vous pour publier.");
  var input = document.getElementById("feed-compose-text");
  var text  = input ? input.value.trim() : "";
  if (!text && !_feedMediaFile) return;

  var btn = document.getElementById("feed-publish-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Publication…"; }

  var postData = {
    authorUid:   chabUser.uid,
    authorName:  chabUser.displayName || "Anonyme",
    authorPhoto: chabUser.photoURL || "",
    authorRole:  chabUser.role || "perso",
    text:        text,
    mediaURL:    "",
    mediaType:   "",   // "image" | "video" | ""
    likesCount:  0,
    likedBy:     [],
    commentsCount: 0,
    createdAt:   fbTimestamp()
  };

  var promise;
  if (_feedMediaFile) {
    var ext  = _feedMediaFile.name.split('.').pop();
    var path = "posts/" + fbId() + "." + ext;
    var type = _feedMediaFile.type.startsWith("video") ? "video" : "image";
    promise = fbUpload(_feedMediaFile, path).then(function (url) {
      postData.mediaURL  = url;
      postData.mediaType = type;
      return postsCol.add(postData);
    });
  } else {
    promise = postsCol.add(postData);
  }

  promise.then(function () {
    if (input) input.value = "";
    _feedMediaFile = null;
    _renderComposerPreview();
    if (btn) { btn.disabled = false; btn.textContent = "Publier"; }
  }).catch(function (err) {
    alert("Erreur : " + err.message);
    if (btn) { btn.disabled = false; btn.textContent = "Publier"; }
  });
}

// ─── Sélection média ────────────────────────────────────────
function feedSelectMedia() {
  var inp = document.createElement("input");
  inp.type = "file";
  inp.accept = "image/*,video/*";
  inp.onchange = function () {
    _feedMediaFile = inp.files[0] || null;
    _renderComposerPreview();
  };
  inp.click();
}

function feedClearMedia() {
  _feedMediaFile = null;
  _renderComposerPreview();
}

function _renderComposerPreview() {
  var el = document.getElementById("feed-media-preview");
  if (!el) return;
  if (!_feedMediaFile) { el.innerHTML = ""; return; }
  var url = URL.createObjectURL(_feedMediaFile);
  if (_feedMediaFile.type.startsWith("video")) {
    el.innerHTML = '<div class="feed-preview-wrap"><video src="' + url + '" class="feed-preview-thumb" muted></video><span class="feed-preview-remove" onclick="feedClearMedia()">✕</span></div>';
  } else {
    el.innerHTML = '<div class="feed-preview-wrap"><img src="' + url + '" class="feed-preview-thumb" /><span class="feed-preview-remove" onclick="feedClearMedia()">✕</span></div>';
  }
}

// ─── Like / Unlike ──────────────────────────────────────────
function feedToggleLike(postId) {
  if (!chabUser) return alert("Connectez-vous pour liker.");
  var ref = postsCol.doc(postId);

  ref.get().then(function (doc) {
    var data = doc.data();
    var likedBy = data.likedBy || [];
    var idx = likedBy.indexOf(chabUser.uid);
    if (idx === -1) {
      // Like
      ref.update({
        likedBy:    firebase.firestore.FieldValue.arrayUnion(chabUser.uid),
        likesCount: fbIncrement(1)
      });
    } else {
      // Unlike
      ref.update({
        likedBy:    firebase.firestore.FieldValue.arrayRemove(chabUser.uid),
        likesCount: fbIncrement(-1)
      });
    }
  });
}

// ─── Suivre / Ne plus suivre ─────────────────────────────────
function feedToggleFollow(authorUid) {
  if (!chabUser) return alert("Connectez-vous pour suivre.");
  if (authorUid === chabUser.uid) return;

  var ref = usersCol.doc(chabUser.uid);
  var following = chabUser.following || [];
  var idx = following.indexOf(authorUid);

  if (idx === -1) {
    // Suivre
    ref.update({
      following: firebase.firestore.FieldValue.arrayUnion(authorUid)
    });
    chabUser.following.push(authorUid);
  } else {
    // Ne plus suivre
    ref.update({
      following: firebase.firestore.FieldValue.arrayRemove(authorUid)
    });
    chabUser.following.splice(idx, 1);
  }
  _renderFeed();
}

// ─── Supprimer un post (auteur seulement) ───────────────────
function feedDeletePost(postId) {
  if (!confirm("Supprimer ce post ?")) return;
  postsCol.doc(postId).delete();
}

// ─── Commentaires ───────────────────────────────────────────
function feedToggleComments(postId) {
  var el = document.getElementById("comments-" + postId);
  if (!el) return;
  if (el.style.display === "block") {
    el.style.display = "none";
    return;
  }
  el.style.display = "block";
  _loadComments(postId);
}

function _loadComments(postId) {
  var list = document.getElementById("comments-list-" + postId);
  if (!list) return;
  list.innerHTML = '<div class="feed-loading-sm">Chargement…</div>';

  postsCol.doc(postId).collection("comments")
    .orderBy("createdAt", "asc")
    .limit(50)
    .get()
    .then(function (snap) {
      if (snap.empty) { list.innerHTML = '<div class="feed-no-comments">Aucun commentaire</div>'; return; }
      var html = "";
      snap.forEach(function (doc) {
        var c = doc.data();
        html += _renderComment(c);
      });
      list.innerHTML = html;
    });
}

function feedAddComment(postId) {
  if (!chabUser) return alert("Connectez-vous pour commenter.");
  var input = document.getElementById("comment-input-" + postId);
  var text  = input ? input.value.trim() : "";
  if (!text) return;

  postsCol.doc(postId).collection("comments").add({
    authorUid:   chabUser.uid,
    authorName:  chabUser.displayName || "Anonyme",
    authorPhoto: chabUser.photoURL || "",
    text:        text,
    createdAt:   fbTimestamp()
  }).then(function () {
    // Incrémenter le compteur
    postsCol.doc(postId).update({ commentsCount: fbIncrement(1) });
    input.value = "";
    _loadComments(postId);
  });
}

// ═══════════════════════════════════════════════════════════
//  Rendu
// ═══════════════════════════════════════════════════════════

function _renderFeed() {
  var el = document.getElementById("feed-list");
  if (!el) return;

  if (!_feedPosts.length) {
    el.innerHTML = '<div class="feed-empty">Aucune publication pour l\'instant.<br>Soyez le premier à partager ! ✨</div>';
    return;
  }

  var html = "";
  _feedPosts.forEach(function (post) {
    html += _renderPost(post);
  });

  // Bouton "charger plus"
  html += '<div class="feed-load-more"><button class="chab-btn chab-btn-outline" onclick="feedLoadMore()">Voir plus</button></div>';

  el.innerHTML = html;
}

function _renderPost(p) {
  var isOwner = chabUser && chabUser.uid === p.authorUid;
  var isLiked = chabUser && (p.likedBy || []).indexOf(chabUser.uid) !== -1;
  var isFollowing = chabUser && (chabUser.following || []).indexOf(p.authorUid) !== -1;
  var timeAgo = _timeAgo(p.createdAt);
  var roleBadge = p.authorRole === "pro" ? '<span class="feed-badge-pro">PRO</span>' : '';

  var html = '<div class="feed-post" id="post-' + p.id + '">';

  // Header
  html += '<div class="feed-post-header">';
  html += p.authorPhoto
    ? '<img src="' + p.authorPhoto + '" class="feed-post-avatar" />'
    : '<div class="feed-post-avatar feed-post-avatar-ph">' + (p.authorName || "?").charAt(0).toUpperCase() + '</div>';
  html += '<div class="feed-post-meta">';
  html += '<div class="feed-post-author">' + _escHtml(p.authorName) + ' ' + roleBadge + '</div>';
  html += '<div class="feed-post-time">' + timeAgo + '</div>';
  html += '</div>';
  if (isOwner) {
    html += '<div class="feed-post-menu" onclick="feedDeletePost(\'' + p.id + '\')" title="Supprimer">🗑</div>';
  } else if (chabUser) {
    html += '<button class="feed-follow-btn' + (isFollowing ? ' feed-following' : '') + '" onclick="feedToggleFollow(\'' + p.authorUid + '\')">';
    html += isFollowing ? '✓ Suivi' : '+ Suivre';
    html += '</button>';
  }
  html += '</div>';

  // Body
  if (p.text) {
    html += '<div class="feed-post-text">' + _linkify(_escHtml(p.text)) + '</div>';
  }
  if (p.mediaURL) {
    if (p.mediaType === "video") {
      html += '<video src="' + p.mediaURL + '" class="feed-post-media" controls preload="metadata"></video>';
    } else {
      html += '<img src="' + p.mediaURL + '" class="feed-post-media" loading="lazy" onclick="_feedZoomImage(this)" />';
    }
  }

  // Actions
  html += '<div class="feed-post-actions">';
  html += '<button class="feed-action-btn ' + (isLiked ? 'feed-liked' : '') + '" onclick="feedToggleLike(\'' + p.id + '\')">';
  html += (isLiked ? '❤️' : '🤍') + ' <span>' + (p.likesCount || 0) + '</span>';
  html += '</button>';
  html += '<button class="feed-action-btn" onclick="feedToggleComments(\'' + p.id + '\')">';
  html += '💬 <span>' + (p.commentsCount || 0) + '</span>';
  html += '</button>';
  html += '</div>';

  // Section commentaires (masquée par défaut)
  html += '<div class="feed-comments" id="comments-' + p.id + '" style="display:none;">';
  html += '<div id="comments-list-' + p.id + '"></div>';
  html += '<div class="feed-comment-compose">';
  html += '<input id="comment-input-' + p.id + '" type="text" placeholder="Écrire un commentaire…" class="chab-input chab-input-sm" onkeydown="if(event.key===\'Enter\')feedAddComment(\'' + p.id + '\')" />';
  html += '<button class="chab-btn chab-btn-sm" onclick="feedAddComment(\'' + p.id + '\')">↑</button>';
  html += '</div>';
  html += '</div>';

  html += '</div>'; // .feed-post
  return html;
}

function _renderComment(c) {
  var html = '<div class="feed-comment">';
  html += c.authorPhoto
    ? '<img src="' + c.authorPhoto + '" class="feed-comment-avatar" />'
    : '<div class="feed-comment-avatar feed-comment-avatar-ph">' + (c.authorName || "?").charAt(0).toUpperCase() + '</div>';
  html += '<div class="feed-comment-body">';
  html += '<span class="feed-comment-author">' + _escHtml(c.authorName) + '</span> ';
  html += '<span class="feed-comment-text">' + _escHtml(c.text) + '</span>';
  html += '<div class="feed-comment-time">' + _timeAgo(c.createdAt) + '</div>';
  html += '</div>';
  html += '</div>';
  return html;
}

// ─── Zoom image ─────────────────────────────────────────────
function _feedZoomImage(img) {
  var overlay = document.createElement("div");
  overlay.className = "feed-zoom-overlay";
  overlay.innerHTML = '<img src="' + img.src + '" />';
  overlay.onclick = function () { overlay.remove(); };
  document.body.appendChild(overlay);
}

// ─── Utilitaires ────────────────────────────────────────────
function _escHtml(s) {
  var d = document.createElement("div");
  d.textContent = s || "";
  return d.innerHTML;
}

function _linkify(text) {
  return text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

function _timeAgo(ts) {
  if (!ts) return "";
  var date = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
  var diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)   return "à l'instant";
  if (diff < 3600) return Math.floor(diff / 60) + " min";
  if (diff < 86400) return Math.floor(diff / 3600) + " h";
  if (diff < 604800) return Math.floor(diff / 86400) + " j";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── Integration avec switchTab ─────────────────────────────
// Appelez switchTab("feed") pour ouvrir le feed
// Appelez switchTab("auth") pour ouvrir l'auth
// Appelez switchTab("profile") pour ouvrir le profil

console.log("[Chab'app] Feed module chargé ✓");
