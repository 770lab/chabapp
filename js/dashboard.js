/* ============================================================
   dashboard.js  —  Dashboard admin (KOULAM)
   Stats utilisateurs, posts, activite
   Responsive : optimise desktop + mobile
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

      stats.recentUsers.push({
        name: d.displayName || "Sans nom",
        email: d.email || "",
        photo: d.photoURL || "",
        role: d.role || "perso",
        created: created
      });

      if (created >= weekStart) {
        var dayKey = new Date(created).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
        stats.usersByDay[dayKey] = (stats.usersByDay[dayKey] || 0) + 1;
      }
    });
    stats.recentUsers.sort(function(a, b) { return b.created - a.created; });
    stats.recentUsers = stats.recentUsers.slice(0, 15);
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

  // Container principal responsive
  h += '<div class="dash-wrap">';

  // Header
  h += '<div class="dash-header">';
  h += '<div class="dash-header-title">Dashboard</div>';
  h += '<div class="dash-header-sub">Vue d\'ensemble de Chab\'app</div>';
  h += '</div>';

  // Grille de cartes KPI
  h += '<div class="dash-kpi-grid">';
  h += _dashCard("Utilisateurs", s.totalUsers, "#3b82f6", "total", "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z");
  h += _dashCard("Nouveaux (24h)", s.todayUsers, "#10b981", "aujourd'hui", "M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z");
  h += _dashCard("Cette semaine", s.weekUsers, "#8b5cf6", "7 derniers jours", "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5");
  h += _dashCard("Publications", s.totalPosts, "#f59e0b", "total", "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.28 48.28 0 0 0 5.564-.29c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z");
  h += _dashCard("Comptes Pro", s.proUsers, "#06b6d4", "certifies", "M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.746 3.746 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z");
  h += _dashCard("Videos", s.totalVideos, "#ec4899", "total", "m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z");
  h += '</div>';

  // Zone 2 colonnes desktop : graphique + activite
  h += '<div class="dash-two-col">';

  // Graphique inscriptions
  h += '<div class="dash-card-section">';
  h += '<div class="dash-section-title">Inscriptions (7 jours)</div>';
  var maxDay = 1;
  Object.keys(s.usersByDay).forEach(function(d) { if (s.usersByDay[d] > maxDay) maxDay = s.usersByDay[d]; });
  var barDays = [];
  for (var i = 6; i >= 0; i--) {
    var dt = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    var label = dt.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
    barDays.push(label);
  }
  barDays.forEach(function(day) {
    var count = s.usersByDay[day] || 0;
    var pct = Math.max(3, (count / maxDay) * 100);
    h += '<div class="dash-bar-row">';
    h += '<div class="dash-bar-label">' + day + '</div>';
    h += '<div class="dash-bar-track">';
    h += '<div class="dash-bar-fill" style="width:' + pct + '%;"></div>';
    h += '</div>';
    h += '<div class="dash-bar-val">' + count + '</div>';
    h += '</div>';
  });
  h += '</div>';

  // Activite du jour
  h += '<div class="dash-card-section">';
  h += '<div class="dash-section-title">Activite du jour</div>';
  h += '<div class="dash-activity-grid">';
  h += '<div class="dash-activity-item">';
  h += '<div class="dash-activity-num" style="color:#f59e0b;">' + s.todayPosts + '</div>';
  h += '<div class="dash-activity-label">publication' + (s.todayPosts > 1 ? 's' : '') + '</div>';
  h += '</div>';
  h += '<div class="dash-activity-item">';
  h += '<div class="dash-activity-num" style="color:#10b981;">' + s.todayUsers + '</div>';
  h += '<div class="dash-activity-label">inscription' + (s.todayUsers > 1 ? 's' : '') + '</div>';
  h += '</div>';
  h += '</div>';

  // Taux de croissance
  var growthPct = s.totalUsers > s.weekUsers && (s.totalUsers - s.weekUsers) > 0
    ? ((s.weekUsers / (s.totalUsers - s.weekUsers)) * 100).toFixed(1) : "0.0";
  h += '<div style="margin-top:20px;padding:16px;background:rgba(16,185,129,.08);border-radius:10px;">';
  h += '<div style="font-size:13px;color:#6b7280;">Croissance hebdo</div>';
  h += '<div style="font-size:32px;font-weight:800;color:#10b981;">+' + growthPct + '%</div>';
  h += '</div>';
  h += '</div>';

  h += '</div>'; // fin dash-two-col

  // Table des derniers inscrits
  h += '<div class="dash-card-section dash-users-section">';
  h += '<div class="dash-section-title">Derniers inscrits</div>';

  if (s.recentUsers.length === 0) {
    h += '<div style="text-align:center;color:#9ca3af;padding:24px;">Aucun utilisateur</div>';
  } else {
    // Vue desktop : tableau
    h += '<table class="dash-table">';
    h += '<thead><tr>';
    h += '<th>Utilisateur</th><th>Email</th><th>Role</th><th>Date</th>';
    h += '</tr></thead><tbody>';
    s.recentUsers.forEach(function(u) {
      var dateStr = u.created ? new Date(u.created).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
      var roleTag = u.role === "pro"
        ? '<span class="dash-badge dash-badge-pro">PRO</span>'
        : '<span class="dash-badge dash-badge-perso">Perso</span>';
      var avatarHtml = u.photo
        ? '<img src="' + u.photo + '" class="dash-avatar" />'
        : '<div class="dash-avatar dash-avatar-placeholder">' + u.name.charAt(0).toUpperCase() + '</div>';
      h += '<tr>';
      h += '<td><div class="dash-user-cell">' + avatarHtml + '<span>' + u.name + '</span></div></td>';
      h += '<td class="dash-email-cell">' + u.email + '</td>';
      h += '<td>' + roleTag + '</td>';
      h += '<td class="dash-date-cell">' + dateStr + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table>';

    // Vue mobile : liste compacte
    h += '<div class="dash-mobile-users">';
    s.recentUsers.forEach(function(u) {
      var dateStr = u.created ? new Date(u.created).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
      var avatarHtml = u.photo
        ? '<img src="' + u.photo + '" class="dash-avatar" />'
        : '<div class="dash-avatar dash-avatar-placeholder">' + u.name.charAt(0).toUpperCase() + '</div>';
      h += '<div class="dash-mobile-user-row">';
      h += avatarHtml;
      h += '<div class="dash-mobile-user-info">';
      h += '<div class="dash-mobile-user-name">' + u.name;
      if (u.role === "pro") h += ' <span class="dash-badge dash-badge-pro">PRO</span>';
      h += '</div>';
      h += '<div class="dash-mobile-user-email">' + u.email + '</div>';
      h += '</div>';
      h += '<div class="dash-mobile-user-date">' + dateStr + '</div>';
      h += '</div>';
    });
    h += '</div>';
  }
  h += '</div>';

  h += '</div>'; // fin dash-wrap

  el.innerHTML = h;
}

function _dashCard(label, value, color, sub, iconPath) {
  var icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="' + color + '" class="dash-kpi-icon"><path stroke-linecap="round" stroke-linejoin="round" d="' + iconPath + '" /></svg>';
  return '<div class="dash-kpi-card">'
    + '<div class="dash-kpi-top">'
    + '<div>'
    + '<div class="dash-kpi-value" style="color:' + color + ';">' + value + '</div>'
    + '<div class="dash-kpi-label">' + label + '</div>'
    + '<div class="dash-kpi-sub">' + sub + '</div>'
    + '</div>'
    + '<div class="dash-kpi-icon-wrap" style="background:' + color + '12;">' + icon + '</div>'
    + '</div>'
    + '</div>';
}

console.log("[KOULAM] Dashboard module charge");
