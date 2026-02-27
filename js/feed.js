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
var _mentionQuery  = "";     // texte après @ pour recherche
var _mentionStart  = -1;     // position du @ dans le textarea
var _mentionUsers  = [];     // cache des utilisateurs pour @mention
var _mentionedUsers = [];    // { uid, displayName } sélectionnés dans la composition en cours

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
  if (!_feedMediaFile) return;

  var input = document.getElementById("feed-compose-text");
  var text  = input ? input.value.trim() : "";

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

  var ext  = _feedMediaFile.name.split('.').pop();
  var path = "posts/" + fbId() + "." + ext;
  var type = _feedMediaFile.type.startsWith("video") ? "video" : "image";

  var _mentionSnapshot = _mentionedUsers.slice(); // copie avant le reset du close
  fbUpload(_feedMediaFile, path).then(function (url) {
    postData.mediaURL  = url;
    postData.mediaType = type;
    return postsCol.add(postData);
  }).then(function (postRef) {
    // Notifier les utilisateurs mentionnés (seulement si la mention est encore dans le texte)
    var postId = postRef ? postRef.id : "";
    _mentionSnapshot.forEach(function (u) {
      if (text.indexOf("@" + u.displayName) !== -1) {
        _sendNotif(u.uid, "mention", postId, text);
      }
    });
    feedCloseComposer();
    if (btn) { btn.disabled = false; btn.textContent = "Publier"; }
  }).catch(function (err) {
    alert("Erreur : " + err.message);
    if (btn) { btn.disabled = false; btn.textContent = "Publier"; }
  });
}

// ─── Sélection média (ouvre le picker puis le panneau) ──────
function feedSelectMedia() {
  if (!chabUser) return alert("Connectez-vous pour publier.");
  var inp = document.createElement("input");
  inp.type = "file";
  inp.accept = "image/*,video/*";
  inp.onchange = function () {
    if (!inp.files[0]) return;
    _feedMediaFile = inp.files[0];
    _openComposerPanel();
  };
  inp.click();
}

// ─── Panneau de composition ────────────────────────────────
function _openComposerPanel() {
  _renderComposerPreview();
  var overlay = document.getElementById("feed-compose-overlay");
  var panel   = document.getElementById("feed-compose-panel");
  var input   = document.getElementById("feed-compose-text");
  if (overlay) overlay.style.display = "";
  if (panel)   panel.style.display   = "flex";
  if (input)   { input.value = ""; input.focus(); }
  // Activer la détection des @mentions
  if (input) {
    input.addEventListener("input", _onCaptionInput);
    input.addEventListener("keydown", _onCaptionKeydown);
  }
}

function feedCloseComposer() {
  _feedMediaFile = null;
  var overlay = document.getElementById("feed-compose-overlay");
  var panel   = document.getElementById("feed-compose-panel");
  var input   = document.getElementById("feed-compose-text");
  var preview = document.getElementById("feed-media-preview");
  var suggestions = document.getElementById("feed-mention-suggestions");
  if (overlay)     overlay.style.display     = "none";
  if (panel)       panel.style.display       = "none";
  if (input)       input.value               = "";
  if (preview)     preview.innerHTML         = "";
  if (suggestions) suggestions.style.display = "none";
  _mentionStart = -1;
  _mentionQuery = "";
  _mentionedUsers = [];
  // Retirer les listeners
  if (input) {
    input.removeEventListener("input", _onCaptionInput);
    input.removeEventListener("keydown", _onCaptionKeydown);
  }
}

function _renderComposerPreview() {
  var el = document.getElementById("feed-media-preview");
  if (!el) return;
  if (!_feedMediaFile) { el.innerHTML = ""; return; }
  var url = URL.createObjectURL(_feedMediaFile);
  if (_feedMediaFile.type.startsWith("video")) {
    el.innerHTML = '<video src="' + url + '" muted controls preload="metadata"></video>';
  } else {
    el.innerHTML = '<img src="' + url + '" />';
  }
}

// ─── @Mentions ─────────────────────────────────────────────
function _onCaptionInput(e) {
  var input = e.target;
  var val   = input.value;
  var pos   = input.selectionStart;

  // Chercher le @ le plus récent avant le curseur
  var lastAt = val.lastIndexOf("@", pos - 1);
  if (lastAt === -1 || (lastAt > 0 && val[lastAt - 1] !== " " && val[lastAt - 1] !== "\n")) {
    _hideMentionSuggestions();
    return;
  }

  var query = val.substring(lastAt + 1, pos);
  // S'il y a un espace dans la query, on n'est plus en mode mention
  if (query.indexOf(" ") !== -1) {
    _hideMentionSuggestions();
    return;
  }

  _mentionStart = lastAt;
  _mentionQuery = query.toLowerCase();
  _searchMentionUsers(_mentionQuery);
}

function _onCaptionKeydown(e) {
  // Fermer les suggestions sur Escape
  if (e.key === "Escape") {
    _hideMentionSuggestions();
  }
}

function _searchMentionUsers(query) {
  if (query.length < 1) {
    _hideMentionSuggestions();
    return;
  }

  // Chercher dans Firestore les utilisateurs dont le nom contient la query
  usersCol.orderBy("displayName").limit(50).get().then(function (snap) {
    _mentionUsers = [];
    snap.forEach(function (doc) {
      var u = Object.assign({ uid: doc.id }, doc.data());
      if (u.uid === chabUser.uid) return; // pas soi-même
      var name = (u.displayName || "").toLowerCase();
      if (name.indexOf(query) !== -1) {
        _mentionUsers.push(u);
      }
    });
    _renderMentionSuggestions();
  });
}

function _renderMentionSuggestions() {
  var el = document.getElementById("feed-mention-suggestions");
  if (!el) return;

  if (!_mentionUsers.length) {
    el.style.display = "none";
    return;
  }

  var html = "";
  _mentionUsers.slice(0, 5).forEach(function (u, i) {
    var avatar = u.photoURL
      ? '<img src="' + u.photoURL + '" class="feed-mention-avatar" />'
      : '<div class="feed-mention-avatar feed-mention-avatar-ph">' + (u.displayName || "?").charAt(0).toUpperCase() + '</div>';
    html += '<div class="feed-mention-item" onclick="_selectMention(' + i + ')">';
    html += avatar;
    html += '<span class="feed-mention-name">' + _escHtml(u.displayName || "Sans nom") + '</span>';
    html += '</div>';
  });

  el.innerHTML = html;
  el.style.display = "";
}

function _selectMention(index) {
  var user  = _mentionUsers[index];
  if (!user) return;
  var input = document.getElementById("feed-compose-text");
  if (!input) return;

  var val   = input.value;
  var pos   = input.selectionStart;
  var before = val.substring(0, _mentionStart);
  var after  = val.substring(pos);
  var mention = "@" + user.displayName + " ";

  input.value = before + mention + after;
  var newPos = before.length + mention.length;
  input.setSelectionRange(newPos, newPos);
  input.focus();

  // Tracker l'UID pour la notification à la publication
  if (!_mentionedUsers.some(function(u) { return u.uid === user.uid; })) {
    _mentionedUsers.push({ uid: user.uid, displayName: user.displayName });
  }
  _hideMentionSuggestions();
}

function _hideMentionSuggestions() {
  var el = document.getElementById("feed-mention-suggestions");
  if (el) el.style.display = "none";
  _mentionStart = -1;
  _mentionQuery = "";
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
      // Notification au propriétaire du post
      if (data.authorUid !== chabUser.uid) {
        _sendNotif(data.authorUid, "like", postId, "");
      }
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
    _sendNotif(authorUid, "follow", "", "");
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
    // Notification au propriétaire du post
    postsCol.doc(postId).get().then(function (doc) {
      if (doc.exists) {
        var postData = doc.data();
        if (postData.authorUid !== chabUser.uid) {
          _sendNotif(postData.authorUid, "comment", postId, text);
        }
      }
    });
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
  var _casherSvg = '<svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 0l2.47 3.33L17.1 2.2l.44 4.1 4.1.44-1.13 3.63L23.84 11l-3.33 2.47 1.13 3.63-4.1.44-.44 4.1-3.63-1.13L11 23.84l-2.47-3.33-3.63 1.13-.44-4.1-4.1-.44 1.13-3.63L-1.84 11l3.33-2.47L.36 4.9l4.1-.44.44-4.1 3.63 1.13L11 0z" fill="#0095f6"/><path d="M9.5 13.38l-2.12-2.12a.75.75 0 10-1.06 1.06l2.65 2.65a.75.75 0 001.06 0l5.15-5.15a.75.75 0 10-1.06-1.06L9.5 13.38z" fill="#fff"/></svg>';
  var roleBadge = p.authorRole === "pro" ? '<span class="casher-badge casher-badge-sm">' + _casherSvg + '</span>' : '';

  var html = '<div class="feed-post" id="post-' + p.id + '">';

  // Vérifier si l'auteur a publié dans les 24h (story ring)
  var _now24 = Date.now();
  var _hasStory = _feedPosts && _feedPosts.some(function(fp) {
    if (fp.authorUid !== p.authorUid) return false;
    var t = fp.createdAt ? (fp.createdAt.toDate ? fp.createdAt.toDate().getTime() : (fp.createdAt.seconds ? fp.createdAt.seconds * 1000 : 0)) : 0;
    return (_now24 - t) < 86400000;
  });

  var avatarHtml = p.authorPhoto
    ? '<img src="' + p.authorPhoto + '" class="feed-post-avatar" />'
    : '<div class="feed-post-avatar feed-post-avatar-ph">' + (p.authorName || "?").charAt(0).toUpperCase() + '</div>';

  // Header
  html += '<div class="feed-post-header">';
  html += _hasStory ? '<div class="feed-post-avatar-story-ring">' + avatarHtml + '</div>' : avatarHtml;
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
  text = text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  text = text.replace(/@([\w\s]+?)(?=\s@|\s|$)/g, '<span class="feed-mention-tag">@$1</span>');
  return text;
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

// ═══════════════════════════════════════════════════════════
//  Notifications
// ═══════════════════════════════════════════════════════════

var _notifListener = null;
var _notifUnread   = 0;

function _sendNotif(toUid, type, postId, text) {
  if (!chabUser || toUid === chabUser.uid) return;
  notifsCol.add({
    toUid:     toUid,
    fromUid:   chabUser.uid,
    fromName:  chabUser.displayName || "Quelqu'un",
    fromPhoto: chabUser.photoURL || "",
    type:      type,
    postId:    postId || "",
    text:      (text || "").substring(0, 100),
    read:      false,
    createdAt: fbTimestamp()
  });
}

function notifListen() {
  if (_notifListener) _notifListener();
  if (!chabUser) return;

  _notifListener = notifsCol
    .where("toUid", "==", chabUser.uid)
    .orderBy("createdAt", "desc")
    .limit(30)
    .onSnapshot(function (snap) {
      _notifUnread = 0;
      snap.forEach(function (doc) {
        var d = doc.data();
        if (!d.read) _notifUnread++;
      });
      _updateNotifBadge();
    });
}

function _updateNotifBadge() {
  var badge = document.getElementById("notif-badge");
  if (badge) {
    if (_notifUnread > 0) {
      badge.textContent = _notifUnread > 9 ? "9+" : _notifUnread;
      badge.style.display = "";
    } else {
      badge.style.display = "none";
    }
  }
}

function notifLoad() {
  var el = document.getElementById("notifs-list");
  if (!el || !chabUser) return;
  el.innerHTML = '<div class="feed-loading">Chargement…</div>';

  notifsCol
    .where("toUid", "==", chabUser.uid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get()
    .then(function (snap) {
      if (snap.empty) {
        el.innerHTML = '<div class="feed-empty">Aucune notification pour l\'instant.</div>';
        return;
      }
      var html = "";
      var batch = fbDb.batch();
      snap.forEach(function (doc) {
        var n = Object.assign({ id: doc.id }, doc.data());
        html += _renderNotif(n);
        if (!n.read) {
          batch.update(notifsCol.doc(doc.id), { read: true });
        }
      });
      el.innerHTML = html;
      batch.commit().then(function () {
        _notifUnread = 0;
        _updateNotifBadge();
      });
    });
}

function _renderNotif(n) {
  var avatar = n.fromPhoto
    ? '<img src="' + n.fromPhoto + '" class="notif-avatar" />'
    : '<div class="notif-avatar notif-avatar-ph">' + (n.fromName || "?").charAt(0).toUpperCase() + '</div>';

  var msg = "";
  if (n.type === "follow")  msg = '<b>' + _escHtml(n.fromName) + '</b> vous suit';
  if (n.type === "like")    msg = '<b>' + _escHtml(n.fromName) + '</b> a aimé votre publication';
  if (n.type === "comment") msg = '<b>' + _escHtml(n.fromName) + '</b> a commenté : "' + _escHtml(n.text) + '"';
  if (n.type === "mention") msg = '<b>' + _escHtml(n.fromName) + '</b> vous a mentionné dans une publication';

  var cls = n.read ? "notif-item" : "notif-item notif-unread";
  var time = _timeAgo(n.createdAt);

  var html = '<div class="' + cls + '">';
  html += avatar;
  html += '<div class="notif-body">';
  html += '<div class="notif-msg">' + msg + '</div>';
  html += '<div class="notif-time">' + time + '</div>';
  html += '</div>';
  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════════════════════
//  Liste des abonnements (following)
// ═══════════════════════════════════════════════════════════

function followingLoad() {
  var el = document.getElementById("following-list");
  if (!el || !chabUser) return;

  var following = chabUser.following || [];
  if (!following.length) {
    el.innerHTML = '<div class="feed-empty">Vous ne suivez personne pour l\'instant.</div>';
    return;
  }

  el.innerHTML = '<div class="feed-loading">Chargement…</div>';

  var promises = following.map(function (uid) {
    return usersCol.doc(uid).get();
  });

  Promise.all(promises).then(function (docs) {
    var html = "";
    docs.forEach(function (doc) {
      if (!doc.exists) return;
      var u = doc.data();
      var avatar = u.photoURL
        ? '<img src="' + u.photoURL + '" class="following-avatar" />'
        : '<div class="following-avatar following-avatar-ph">' + (u.displayName || "?").charAt(0).toUpperCase() + '</div>';
      var roleBadge = u.role === "pro" ? ' <span class="feed-badge-pro">PRO</span>' : '';

      html += '<div class="following-item">';
      html += avatar;
      html += '<div class="following-info">';
      html += '<div class="following-name">' + _escHtml(u.displayName || "Sans nom") + roleBadge + '</div>';
      html += '<div class="following-email">' + _escHtml(u.email || "") + '</div>';
      html += '</div>';
      html += '<button class="feed-follow-btn feed-following" onclick="feedToggleFollow(\'' + u.uid + '\');followingLoad();">✓ Suivi</button>';
      html += '</div>';
    });
    if (!html) html = '<div class="feed-empty">Aucun utilisateur trouvé.</div>';
    el.innerHTML = html;
  });
}

console.log("[Chab'app] Feed module chargé ✓");
