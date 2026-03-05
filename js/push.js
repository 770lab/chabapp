// push.js — Web Push + Admin notification sender
// Enregistrement du Service Worker, permission push, stockage subscription Firestore
// Panel admin pour envoyer des notifications a tous les utilisateurs

var VAPID_PUBLIC_KEY = 'BAQNk40Rg1rp1qN7OGEQAzK1RR_9UJW9_HpP5CYNCrkZxMVOSsyYfuliK7lJVruTLGYNW6XbFRaOzAUL-rFqjNg';
var _pushSubscription = null;
var _pushIsAdmin = false;

// ─── Init: enregistrer le SW et s'abonner au push ────────
function pushInit() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[Push] Non supporte sur ce navigateur');
    return;
  }
  navigator.serviceWorker.register('sw.js')
    .then(function(reg) {
      console.log('[Push] SW enregistre');
      return reg.pushManager.getSubscription().then(function(sub) {
        if (sub) {
          _pushSubscription = sub;
          _savePushSubscription(sub);
        }
        return reg;
      });
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
        var key = _urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key
        });
      }).then(function(sub) {
        _pushSubscription = sub;
        _savePushSubscription(sub);
        _updatePushUI(true);
        console.log('[Push] Abonne!');
      }).catch(function(err) {
        console.log('[Push] Erreur subscribe:', err);
      });
    }
  });
}

function _savePushSubscription(sub) {
  if (!chabUser || !sub) return;
  var data = sub.toJSON();
  usersCol.doc(chabUser.uid).update({
    pushSubscription: data,
    pushUpdated: fbTimestamp()
  }).catch(function(err) { console.log('[Push] Save sub err:', err); });
}

function _urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  var raw = atob(base64);
  var arr = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
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
function pushSendToAll() {
  var title = document.getElementById('push-admin-title').value.trim();
  var body = document.getElementById('push-admin-body').value.trim();
  if (!title || !body) { alert('Remplissez le titre et le message.'); return; }

  var btn = document.getElementById('push-admin-send');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours...';

  // Recuperer tous les utilisateurs
  usersCol.get().then(function(snap) {
    var batch = fbDb.batch();
    var count = 0;
    snap.forEach(function(doc) {
      if (doc.id === chabUser.uid) return;
      var ref = notifsCol.doc();
      batch.set(ref, {
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
      count++;
    });
    return batch.commit().then(function() { return count; });
  }).then(function(count) {
    btn.disabled = false;
    btn.textContent = 'Envoyer la notification';
    document.getElementById('push-admin-title').value = '';
    document.getElementById('push-admin-body').value = '';
    alert('Notification envoyee a ' + count + ' utilisateurs !');
  }).catch(function(err) {
    btn.disabled = false;
    btn.textContent = 'Envoyer la notification';
    alert('Erreur: ' + err.message);
  });
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
    .catch(function() { el.innerHTML = '<div style="color:var(--gray-4);">Erreur chargement.</div>'; });
}
