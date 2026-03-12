// push.js — FCM Push + Admin notification sender
// Enregistrement du Service Worker, permission push via FCM, stockage token Firestore + Apps Script
// Panel admin pour envoyer des notifications a tous les utilisateurs

var KOULAM_VAPID_KEY = 'BNGqqm2LcUBSBui_fcmX9_SLMmcVH7gMtldqlbuW6KBow7Q3uzb5ER3YTANOTH0h9WlYukjsTsGZbzGjOh1YE_w';
var KOULAM_BO_API_URL = 'https://script.google.com/macros/s/AKfycbzdftvc5apXhrG596oR5H_OcveeH1GfJoQLlRwsLd-wnWPIMC4Ihzjq3Jjy4ss51OlE/exec';
var _pushFcmToken = null;
var _pushIsAdmin = false;

// ─── Init: enregistrer le SW et obtenir le token FCM ────────
function pushInit() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[Push] Non supporte sur ce navigateur');
    return;
  }
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
    .then(function(reg) {
      reg.update();
      console.log('[Push] SW enregistre');
      if (Notification.permission === 'granted') {
        _getFcmToken(reg);
      } else if (Notification.permission !== 'denied') {
        // Demander la permission automatiquement
        Notification.requestPermission().then(function(perm) {
          if (perm === 'granted') _getFcmToken(reg);
        });
      }
    })
    .catch(function(err) { console.log('[Push] SW erreur:', err); });
}

function pushRequestPermission() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Les notifications push ne sont pas supportees par ce navigateur.');
    return;
  }
  Notification.requestPermission().then(function(perm) {
    if (perm === 'granted') {
      navigator.serviceWorker.ready.then(function(reg) {
        _getFcmToken(reg);
      });
    }
  });
}

function _getFcmToken(reg) {
  console.log('[Push] _getFcmToken called, firebase:', typeof firebase, 'messaging:', typeof firebase !== 'undefined' && typeof firebase.messaging);
  if (typeof firebase === 'undefined' || !firebase.messaging) {
    console.log('[Push] Firebase Messaging non charge');
    return;
  }
  try {
    var fbMessaging = firebase.messaging();
    console.log('[Push] Getting token with VAPID:', KOULAM_VAPID_KEY.substring(0, 20) + '...');
    fbMessaging.getToken({
      vapidKey: KOULAM_VAPID_KEY,
      serviceWorkerRegistration: reg
    }).then(function(token) {
      if (token) {
        console.log('[Push] FCM Token OK:', token.substring(0, 30) + '...');
        _pushFcmToken = token;
        _saveFcmToken(token);
        _updatePushUI(true);
      } else {
        console.log('[Push] Pas de token FCM (null)');
      }
    }).catch(function(err) {
      console.log('[Push] Erreur FCM getToken:', err.message || err);
    });
  } catch(e) {
    console.log('[Push] Exception getToken:', e.message);
  }
}

function _saveFcmToken(token) {
  if (!chabUser || !token) return;

  // 1. Sauvegarder dans Firestore
  usersCol.doc(chabUser.uid).update({
    fcmToken: token,
    fcmUpdated: fbTimestamp()
  }).catch(function(err) { console.log('[Push] Save Firestore err:', err); });

  // 2. Sauvegarder via Apps Script (sheet Koulam_FCM)
  var userName = (chabUser.displayName || chabUser.email || chabUser.uid);
  fetch(KOULAM_BO_API_URL + '?action=saveKoulamFcmToken&user=' + encodeURIComponent(userName) + '&token=' + encodeURIComponent(token))
    .then(function(r) { return r.json(); })
    .then(function(resp) { console.log('[Push] Apps Script save:', resp.message || resp.error); })
    .catch(function(err) { console.log('[Push] Apps Script save err:', err); });
}

function _updatePushUI(enabled) {
  var btn = document.getElementById('push-enable-btn');
  if (btn) {
    if (enabled || Notification.permission === 'granted') {
      btn.textContent = 'Notifications activees';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    }
  }
}


// ═══════════════════════════════════════════════════════════
//  Admin: Envoyer des notifications a tous
// ═══════════════════════════════════════════════════════════

function _pushCheckAdmin() {
  if (!chabUser) { _pushIsAdmin = false; return Promise.resolve(); }
  return fbDb.collection("config").doc("admins").get().then(function(doc) {
    if (doc.exists) {
      _pushIsAdmin = (doc.data().uids || []).indexOf(chabUser.uid) !== -1;
    }
  }).catch(function() { _pushIsAdmin = false; });
}

// Envoyer une notification in-app (Firestore) a tous les utilisateurs
// + push FCM via Apps Script
function pushSendToAll() {
  var title = document.getElementById('push-admin-title').value.trim();
  var body = document.getElementById('push-admin-body').value.trim();
  if (!title || !body) { alert('Remplissez le titre et le message.'); return; }

  var btn = document.getElementById('push-admin-send');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours...';

  // Recuperer tous les utilisateurs
  usersCol.get().then(function(snap) {
    // Construire la liste des docs a creer + tokens FCM
    var docs = [];
    var fcmTokens = [];
    snap.forEach(function(doc) {
      if (doc.id === chabUser.uid) return;
      docs.push({
        toUid: doc.id,
        fromUid: chabUser.uid,
        fromName: 'Chab\'app',
        fromPhoto: '',
        type: 'broadcast',
        postId: '',
        text: body.substring(0, 200),
        title: title,
        read: false,
        createdAt: fbTimestamp()
      });
      var d = doc.data();
      if (d.fcmToken) fcmTokens.push(d.fcmToken);
    });

    // Ecrire en batches de 499 max (limite Firestore = 500)
    var batches = [];
    for (var i = 0; i < docs.length; i += 499) {
      var batch = fbDb.batch();
      var chunk = docs.slice(i, i + 499);
      chunk.forEach(function(notifData) {
        batch.set(notifsCol.doc(), notifData);
      });
      batches.push(batch.commit());
    }

    return Promise.all(batches).then(function() {
      // Envoyer les push FCM via Apps Script
      if (fcmTokens.length > 0) {
        _pushSendFcmViaAppsScript(title, body, fcmTokens);
      }
      return docs.length;
    });
  }).then(function(count) {
    btn.disabled = false;
    btn.textContent = 'Envoyer la notification';
    document.getElementById('push-admin-title').value = '';
    document.getElementById('push-admin-body').value = '';
    alert('Notification envoyee a ' + count + ' utilisateurs !');
    _pushLoadHistory();
  }).catch(function(err) {
    btn.disabled = false;
    btn.textContent = 'Envoyer la notification';
    alert('Erreur: ' + err.message);
    console.error('[Push] pushSendToAll error:', err);
  });
}

// Envoyer les push FCM via Apps Script (fire-and-forget)
function _pushSendFcmViaAppsScript(title, body, tokens) {
  fetch(KOULAM_BO_API_URL + '?action=sendKoulamPush&title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body) + '&tokens=' + encodeURIComponent(JSON.stringify(tokens)))
    .then(function(r) { return r.json(); })
    .then(function(resp) { console.log('[Push] FCM via Apps Script:', resp.message || resp.error || resp); })
    .catch(function(err) { console.log('[Push] FCM Apps Script err:', err); });
}

// Rendre le panel admin notifications
function pushRenderAdmin(container) {
  if (!_pushIsAdmin) return;
  container.innerHTML =
    '<div style="padding:16px;">' +
    '<div style="font-size:18px;font-weight:800;margin-bottom:4px;">Envoyer une notification</div>' +
    '<div style="font-size:12px;color:var(--gray-3);margin-bottom:16px;">Envoyer a tous les utilisateurs de Chab\'app</div>' +

    '<div style="margin-bottom:12px;">' +
    '<label style="font-size:12px;font-weight:600;color:var(--gray-2);display:block;margin-bottom:4px;">Titre</label>' +
    '<input id="push-admin-title" type="text" placeholder="Ex: Chabbat Chalom !" style="width:100%;padding:10px 12px;border:1.5px solid var(--gray-5);border-radius:10px;font-size:14px;box-sizing:border-box;font-family:var(--font);">' +
    '</div>' +

    '<div style="margin-bottom:16px;">' +
    '<label style="font-size:12px;font-weight:600;color:var(--gray-2);display:block;margin-bottom:4px;">Message</label>' +
    '<textarea id="push-admin-body" rows="3" placeholder="Ex: N\'oubliez pas d\'allumer les bougies..." style="width:100%;padding:10px 12px;border:1.5px solid var(--gray-5);border-radius:10px;font-size:14px;box-sizing:border-box;font-family:var(--font);resize:vertical;"></textarea>' +
    '</div>' +

    '<button id="push-admin-send" onclick="pushSendToAll()" style="width:100%;padding:12px;border:none;border-radius:10px;background:var(--black);color:var(--white);font-size:14px;font-weight:700;cursor:pointer;">Envoyer la notification</button>' +

    '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--gray-6);">' +
    '<div style="font-size:14px;font-weight:700;margin-bottom:8px;">Historique</div>' +
    '<div id="push-admin-history" style="font-size:13px;color:var(--gray-3);">Chargement...</div>' +
    '</div>' +

    '</div>';

  // Charger l'historique des broadcasts
  _pushLoadHistory();
}

function _pushLoadHistory() {
  var el = document.getElementById('push-admin-history');
  if (!el) return;
  notifsCol
    .where('type', '==', 'broadcast')
    .where('fromUid', '==', chabUser.uid)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get()
    .then(function(snap) {
      if (snap.empty) { el.innerHTML = '<div style="color:var(--gray-4);">Aucune notification envoyee.</div>'; return; }
      var seen = {};
      var html = '';
      snap.forEach(function(doc) {
        var d = doc.data();
        var key = (d.title || '') + '|' + (d.text || '');
        if (seen[key]) return;
        seen[key] = true;
        var time = d.createdAt ? _timeAgo(d.createdAt) : '';
        html += '<div style="padding:8px 0;border-bottom:1px solid var(--gray-6);">' +
          '<div style="font-weight:600;">' + _escHtml(d.title || '') + '</div>' +
          '<div style="color:var(--gray-3);font-size:12px;">' + _escHtml(d.text || '') + '</div>' +
          '<div style="color:var(--gray-4);font-size:11px;margin-top:2px;">' + time + '</div>' +
          '</div>';
      });
      el.innerHTML = html;
    })
    .catch(function(err) {
      console.error('[Push] History load error:', err);
      el.innerHTML = '<div style="color:var(--gray-4);">Erreur chargement historique.</div>';
    });
}
