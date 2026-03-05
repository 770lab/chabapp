/* ============================================================
   dashboard.js  —  Dashboard admin (Chab'app)
   Stats utilisateurs, posts, activite
   ============================================================ */

var _dashIsAdmin = false;

function _dashCheckAdmin() {
  if (!chabUser) { _dashIsAdmin = false; return Promise.resolve(); }
  return fbDb.collection("config").doc("admins").get().then(function(doc) {
    if (doc.exists) {
      _dashIsAdmin = (doc.data().uids || []).indexOf(chabUser.uid) !== -1;
    }
  }).catch(function() { _dashIsAdmin = false; });
}

function dashboardLoad() {
  var el = document.getElementById("dashboard-content");
  if (!el) return;

  _dashCheckAdmin().then(function() {
    if (!_dashIsAdmin) {
      el.innerHTML = '<div style="text-align:center;padding:48px 16px;color:#9ca3af;">Acces reserve aux admins.</div>';
      return;
    }
    el.innerHTML = '<div style="text-align:center;padding:48px;color:#9ca3af;">Chargement...</div>';
    _dashFetchAll(el);
  });
}

function _dashFetchAll(el) {
  var stats = {
    totalUsers: 0,
    proUsers: 0,
    todayUsers: 0,
    weekUsers: 0,
    totalPosts: 0,
    todayPosts: 0,
    totalVideos: 0,
    recentUsers: [],
    usersByDay: {}
  };

  var now = new Date();
  var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

  // Charger tous les utilisateurs
  var p1 = fbDb.collection("users").get().then(function(snap) {
    stats.totalUsers = snap.size;
    snap.forEach(function(doc) {
      var d = doc.data();
      if (d.role === "pro") stats.proUsers++;

      var created = 0;
      if (d.createdAt) {
        created = d.createdAt.toDate ? d.createdAt.toDate().getTime() : (d.createdAt.seconds ? d.createdAt.seconds * 1000 : 0);
      }
      if (created >= todayStart) stats.todayUsers++;
      if (created >= weekStart) stats.weekUsers++;

      // Utilisateurs recents (derniers 10)
      stats.recentUsers.push({
        name: d.displayName || "Sans nom",
        email: d.email || "",
        photo: d.photoURL || "",
        role: d.role || "perso",
        created: created
      });

      // Inscriptions par jour (7 derniers jours)
      if (created >= weekStart) {
        var dayKey = new Date(created).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
        stats.usersByDay[dayKey] = (stats.usersByDay[dayKey] || 0) + 1;
      }
    });
    stats.recentUsers.sort(function(a, b) { return b.created - a.created; });
    stats.recentUsers = stats.recentUsers.slice(0, 10);
  });

  // Charger les posts
  var p2 = fbDb.collection("posts").get().then(function(snap) {
    stats.totalPosts = snap.size;
    snap.forEach(function(doc) {
      var d = doc.data();
      var t = 0;
      if (d.createdAt) {
        t = d.createdAt.toDate ? d.createdAt.toDate().getTime() : (d.createdAt.seconds ? d.createdAt.seconds * 1000 : 0);
      }
      if (t >= todayStart) stats.todayPosts++;
    });
  });

  // Charger les videos
  var p3 = fbDb.collection("yt_videos").get().then(function(snap) {
    stats.totalVideos = snap.size;
  }).catch(function() {});

  Promise.all([p1, p2, p3]).then(function() {
    _dashRender(el, stats);
  }).catch(function(err) {
    el.innerHTML = '<div style="text-align:center;padding:48px;color:#ef4444;">Erreur : ' + err.message + '</div>';
  });
}

function _dashRender(el, s) {
  var h = '';

  // Cartes stats principales
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">';
  h += _dashCard("Utilisateurs", s.totalUsers, "#3b82f6", "total");
  h += _dashCard("Nouveaux (24h)", s.todayUsers, "#10b981", "aujourd'hui");
  h += _dashCard("Cette semaine", s.weekUsers, "#8b5cf6", "7 derniers jours");
  h += _dashCard("Publications", s.totalPosts, "#f59e0b", "total");
  h += _dashCard("Comptes Pro", s.proUsers, "#06b6d4", "certifies");
  h += _dashCard("Videos", s.totalVideos, "#ec4899", "total");
  h += '</div>';

  // Graphique inscriptions (barres simples)
  h += '<div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:20px;">';
  h += '<div style="font-weight:700;font-size:15px;margin-bottom:12px;">Inscriptions (7 jours)</div>';
  var maxDay = 1;
  var days = Object.keys(s.usersByDay);
  days.forEach(function(d) { if (s.usersByDay[d] > maxDay) maxDay = s.usersByDay[d]; });

  // Generer les 7 derniers jours
  var barDays = [];
  for (var i = 6; i >= 0; i--) {
    var dt = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    var label = dt.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
    barDays.push(label);
  }

  barDays.forEach(function(day) {
    var count = s.usersByDay[day] || 0;
    var pct = Math.max(2, (count / maxDay) * 100);
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">';
    h += '<div style="width:60px;font-size:11px;color:#6b7280;text-align:right;">' + day + '</div>';
    h += '<div style="flex:1;background:#e5e7eb;border-radius:4px;height:20px;overflow:hidden;">';
    h += '<div style="width:' + pct + '%;height:100%;background:#3b82f6;border-radius:4px;transition:width .3s;"></div>';
    h += '</div>';
    h += '<div style="width:24px;font-size:12px;font-weight:600;color:#374151;">' + count + '</div>';
    h += '</div>';
  });
  h += '</div>';

  // Derniers inscrits
  h += '<div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:20px;">';
  h += '<div style="font-weight:700;font-size:15px;margin-bottom:12px;">Derniers inscrits</div>';
  if (s.recentUsers.length === 0) {
    h += '<div style="text-align:center;color:#9ca3af;padding:16px;">Aucun utilisateur</div>';
  } else {
    s.recentUsers.forEach(function(u) {
      var avatarHtml = u.photo
        ? '<img src="' + u.photo + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" />'
        : '<div style="width:36px;height:36px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#6b7280;">' + (u.name.charAt(0).toUpperCase()) + '</div>';
      var dateStr = u.created ? new Date(u.created).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #e5e7eb;">';
      h += avatarHtml;
      h += '<div style="flex:1;min-width:0;">';
      h += '<div style="font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + u.name + '</div>';
      h += '<div style="font-size:11px;color:#9ca3af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + u.email + '</div>';
      h += '</div>';
      h += '<div style="text-align:right;">';
      h += '<div style="font-size:10px;color:#9ca3af;">' + dateStr + '</div>';
      if (u.role === "pro") h += '<div style="font-size:10px;color:#06b6d4;font-weight:600;">PRO</div>';
      h += '</div>';
      h += '</div>';
    });
  }
  h += '</div>';

  // Posts aujourd'hui
  h += '<div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:80px;">';
  h += '<div style="font-weight:700;font-size:15px;margin-bottom:8px;">Activite du jour</div>';
  h += '<div style="font-size:14px;color:#374151;">' + s.todayPosts + ' publication' + (s.todayPosts > 1 ? 's' : '') + ' aujourd\'hui</div>';
  h += '<div style="font-size:14px;color:#374151;">' + s.todayUsers + ' nouvel' + (s.todayUsers > 1 ? 'les' : '') + ' inscription' + (s.todayUsers > 1 ? 's' : '') + '</div>';
  h += '</div>';

  el.innerHTML = h;
}

function _dashCard(label, value, color, sub) {
  return '<div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.08);">'
    + '<div style="font-size:28px;font-weight:800;color:' + color + ';">' + value + '</div>'
    + '<div style="font-size:13px;font-weight:600;color:#374151;margin-top:2px;">' + label + '</div>'
    + '<div style="font-size:11px;color:#9ca3af;">' + sub + '</div>'
    + '</div>';
}

console.log("[Chab'app] Dashboard module charge");
