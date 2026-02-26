/* ============================================================
   auth.js  —  Authentification & Profil  (Chab'app)
   Dépend de : firebase-config.js
   ============================================================ */

// ─── État local ──────────────────────────────────────────────
var chabUser = null;           // { uid, email, displayName, photoURL, role, ... }
var AUTH_ROLES = { PERSO: "perso", PRO: "pro" };

// ─── Écoute de l'état d'auth ─────────────────────────────────
fbAuth.onAuthStateChanged(function (firebaseUser) {
  if (firebaseUser) {
    _loadUserProfile(firebaseUser);
  } else {
    chabUser = null;
    _onLogout();
  }
});

// ─── Inscription email/mdp ──────────────────────────────────
function authSignup() {
  var email = document.getElementById("auth-email").value.trim();
  var pass  = document.getElementById("auth-pass").value;
  var name  = document.getElementById("auth-name").value.trim();
  var role  = document.querySelector('input[name="auth-role"]:checked');
  if (!email || !pass) return _authError("Email et mot de passe requis.");
  if (pass.length < 6)  return _authError("Mot de passe : 6 caractères min.");
  if (!role)             return _authError("Choisissez un rôle.");
  _authLoading(true);

  fbAuth.createUserWithEmailAndPassword(email, pass)
    .then(function (cred) {
      return cred.user.updateProfile({ displayName: name || email.split("@")[0] })
        .then(function () {
          return _createUserDoc(cred.user, role.value, name);
        });
    })
    .then(function () { _authLoading(false); })
    .catch(function (err) { _authLoading(false); _authError(_friendlyError(err)); });
}

// ─── Connexion email/mdp ────────────────────────────────────
function authLogin() {
  var email = document.getElementById("auth-email").value.trim();
  var pass  = document.getElementById("auth-pass").value;
  if (!email || !pass) return _authError("Remplissez tous les champs.");
  _authLoading(true);

  fbAuth.signInWithEmailAndPassword(email, pass)
    .then(function () { _authLoading(false); })
    .catch(function (err) { _authLoading(false); _authError(_friendlyError(err)); });
}

// ─── Connexion Google ───────────────────────────────────────
function authGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();
  _authLoading(true);
  fbAuth.signInWithPopup(provider)
    .then(function (result) {
      if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) {
        return _createUserDoc(result.user, AUTH_ROLES.PERSO);
      }
    })
    .then(function () { _authLoading(false); })
    .catch(function (err) { _authLoading(false); _authError(_friendlyError(err)); });
}

// ─── Connexion Apple ────────────────────────────────────────
function authApple() {
  var provider = new firebase.auth.OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  _authLoading(true);
  fbAuth.signInWithPopup(provider)
    .then(function (result) {
      if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) {
        return _createUserDoc(result.user, AUTH_ROLES.PERSO);
      }
    })
    .then(function () { _authLoading(false); })
    .catch(function (err) { _authLoading(false); _authError(_friendlyError(err)); });
}

// ─── Mot de passe oublié ────────────────────────────────────
function authResetPassword() {
  var email = document.getElementById("auth-email").value.trim();
  if (!email) return _authError("Entrez votre email d'abord.");
  fbAuth.sendPasswordResetEmail(email)
    .then(function () { _authError("📩 Email de réinitialisation envoyé !"); })
    .catch(function (err) { _authError(_friendlyError(err)); });
}

// ─── Déconnexion ────────────────────────────────────────────
function authLogout() {
  fbAuth.signOut();
}

// ─── Profil : changer le rôle ───────────────────────────────
function profileSwitchRole(newRole) {
  if (!chabUser) return;
  usersCol.doc(chabUser.uid).update({ role: newRole })
    .then(function () {
      chabUser.role = newRole;
      _renderProfile();
    });
}

// ─── Profil : changer le nom ────────────────────────────────
function profileUpdateName() {
  var input = document.getElementById("profile-name-input");
  if (!input || !chabUser) return;
  var name = input.value.trim();
  if (!name) return;
  var user = fbAuth.currentUser;
  user.updateProfile({ displayName: name }).then(function () {
    return usersCol.doc(chabUser.uid).update({ displayName: name });
  }).then(function () {
    chabUser.displayName = name;
    _renderProfile();
  });
}

// ─── Profil : changer la photo ──────────────────────────────
function profileChangePhoto() {
  var input = document.createElement("input");
  input.type = "file"; input.accept = "image/*";
  input.onchange = function () {
    var file = input.files[0];
    if (!file || !chabUser) return;
    var path = "avatars/" + chabUser.uid + "/" + file.name;
    fbUpload(file, path).then(function (url) {
      return fbAuth.currentUser.updateProfile({ photoURL: url }).then(function () {
        return usersCol.doc(chabUser.uid).update({ photoURL: url });
      }).then(function () {
        chabUser.photoURL = url;
        _renderProfile();
      });
    });
  };
  input.click();
}

// ─── Profil : supprimer le compte ───────────────────────────
function profileDeleteAccount() {
  if (!confirm("Supprimer votre compte ? Cette action est irréversible.")) return;
  var uid = chabUser.uid;
  usersCol.doc(uid).delete()
    .then(function () { return fbAuth.currentUser.delete(); })
    .catch(function (err) { alert("Erreur : " + err.message); });
}

// ═══════════════════════════════════════════════════════════
//  Fonctions internes
// ═══════════════════════════════════════════════════════════

function _createUserDoc(firebaseUser, role, name) {
  return usersCol.doc(firebaseUser.uid).set({
    uid:         firebaseUser.uid,
    email:       firebaseUser.email || "",
    displayName: name || firebaseUser.displayName || "",
    photoURL:    firebaseUser.photoURL || "",
    role:        role || AUTH_ROLES.PERSO,
    createdAt:   fbTimestamp()
  }, { merge: true });
}

function _loadUserProfile(firebaseUser) {
  usersCol.doc(firebaseUser.uid).get().then(function (doc) {
    if (doc.exists) {
      chabUser = doc.data();
    } else {
      // Premier login social → créer le doc
      chabUser = {
        uid:         firebaseUser.uid,
        email:       firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        photoURL:    firebaseUser.photoURL || "",
        role:        AUTH_ROLES.PERSO
      };
      _createUserDoc(firebaseUser, AUTH_ROLES.PERSO);
    }
    _onLogin();
  });
}

function _onLogin() {
  // Cacher le panel auth, montrer le menu
  var authPanel = document.getElementById("panel-auth");
  if (authPanel) authPanel.style.display = "none";
  var homeEl2 = document.getElementById("home");
  if (homeEl2) homeEl2.classList.remove("auth-open");
  // Actualiser le profil si visible
  _renderProfile();
  // Mettre à jour les boutons nav
  _updateAuthNav(true);
  // Montrer le compositeur de posts
  var composer = document.getElementById("feed-composer");
  if (composer) composer.style.display = "";
  // Charger le feed
  if (typeof feedLoad === "function") feedLoad();
}

function _onLogout() {
  _updateAuthNav(false);
  var profilePanel = document.getElementById("panel-profile");
  if (profilePanel) profilePanel.style.display = "none";
  var composer = document.getElementById("feed-composer");
  if (composer) composer.style.display = "none";
}

function _updateAuthNav(loggedIn) {
  // Bouton profil dans la nav
  var navProfile = document.getElementById("nav-profile-btn");
  if (navProfile) navProfile.style.display = loggedIn ? "" : "none";
  // Bouton login dans la nav  
  var navLogin = document.getElementById("nav-login-btn");
  if (navLogin) navLogin.style.display = loggedIn ? "none" : "";
}

// ─── Render le panel auth (login / inscription) ─────────────
var _authMode = "login"; // "login" | "signup"

function authSwitchMode(mode) {
  _authMode = mode;
  _renderAuth();
}

function showAuthPanel() {
  var homeEl = document.getElementById("home");
  if (homeEl) homeEl.classList.add("auth-open");
  switchTab("auth");
}

function _renderAuth() {
  var el = document.getElementById("auth-form-area");
  if (!el) return;

  var isSignup = _authMode === "signup";
  var html = '';

  if (isSignup) {
    html += '<input id="auth-name" type="text" placeholder="Votre nom" class="chab-input" />';
  }
  html += '<input id="auth-email" type="email" placeholder="Email" class="chab-input" autocomplete="email" />';
  html += '<input id="auth-pass" type="password" placeholder="Mot de passe" class="chab-input" autocomplete="' + (isSignup ? 'new-password' : 'current-password') + '" />';

  if (isSignup) {
    html += '<div class="auth-roles">';
    html += '  <label class="auth-role-label"><input type="radio" name="auth-role" value="perso" checked /> <span>👤 Personnel</span></label>';
    html += '  <label class="auth-role-label"><input type="radio" name="auth-role" value="pro" /> <span>🏢 Professionnel</span></label>';
    html += '</div>';
  }

  html += '<button class="chab-btn chab-btn-primary chab-btn-insta" onclick="' + (isSignup ? 'authSignup()' : 'authLogin()') + '">';
  html += isSignup ? "Créer mon compte" : "Se connecter";
  html += '</button>';

  if (!isSignup) {
    html += '<div class="auth-forgot" onclick="authResetPassword()">Mot de passe oublié ?</div>';
  }

  html += '<div class="auth-separator"><span>ou</span></div>';

  html += '<button class="chab-btn chab-btn-social" onclick="authGoogle()">';
  html += '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.01 24.01 0 000 21.56l7.98-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  html += ' Google</button>';

  html += '<button class="chab-btn chab-btn-social chab-btn-apple" onclick="authApple()">';
  html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>';
  html += ' Apple</button>';

  html += '<div class="auth-toggle">';
  if (isSignup) {
    html += 'Déjà un compte ? <span onclick="authSwitchMode(\'login\')">Se connecter</span>';
  } else {
    html += 'Pas encore de compte ? <span onclick="authSwitchMode(\'signup\')">Créer un compte</span>';
  }
  html += '</div>';

  html += '<div id="auth-error" class="auth-error" style="display:none;"></div>';

  el.innerHTML = html;
}

function _renderProfile() {
  var el = document.getElementById("profile-content");
  if (!el || !chabUser) return;

  var avatar = chabUser.photoURL
    ? '<img src="' + chabUser.photoURL + '" class="profile-avatar" onclick="profileChangePhoto()" />'
    : '<div class="profile-avatar profile-avatar-placeholder" onclick="profileChangePhoto()">' + (chabUser.displayName || "?").charAt(0).toUpperCase() + '</div>';

  var roleLabel = chabUser.role === AUTH_ROLES.PRO ? "🏢 Professionnel" : "👤 Personnel";
  var switchRole = chabUser.role === AUTH_ROLES.PRO ? AUTH_ROLES.PERSO : AUTH_ROLES.PRO;
  var switchLabel = chabUser.role === AUTH_ROLES.PRO ? "Passer en Personnel" : "Passer en Professionnel";

  var html = '';
  html += '<div class="profile-header">';
  html += avatar;
  html += '<div class="profile-info">';
  html += '<div class="profile-name">' + (chabUser.displayName || "Sans nom") + '</div>';
  html += '<div class="profile-email">' + (chabUser.email || "") + '</div>';
  html += '<div class="profile-role-badge">' + roleLabel + '</div>';
  html += '</div>';
  html += '</div>';

  // Modifier le nom
  html += '<div class="profile-section">';
  html += '<div class="profile-section-title">Modifier le nom</div>';
  html += '<div style="display:flex;gap:8px;">';
  html += '<input id="profile-name-input" type="text" class="chab-input" value="' + (chabUser.displayName || '') + '" style="flex:1" />';
  html += '<button class="chab-btn chab-btn-sm" onclick="profileUpdateName()">OK</button>';
  html += '</div>';
  html += '</div>';

  // Changer de rôle
  html += '<div class="profile-section">';
  html += '<button class="chab-btn chab-btn-outline" onclick="profileSwitchRole(\'' + switchRole + '\')">' + switchLabel + '</button>';
  html += '</div>';

  // Déconnexion
  html += '<div class="profile-section">';
  html += '<button class="chab-btn chab-btn-outline" onclick="authLogout()">Se déconnecter</button>';
  html += '</div>';

  // Supprimer le compte
  html += '<div class="profile-section" style="margin-top:32px;">';
  html += '<button class="chab-btn chab-btn-danger" onclick="profileDeleteAccount()">Supprimer mon compte</button>';
  html += '</div>';

  el.innerHTML = html;
}

// ─── Utilitaires UI ──────────────────────────────────────────
function _authError(msg) {
  var el = document.getElementById("auth-error");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(function () { el.style.display = "none"; }, 5000);
}

function _authLoading(on) {
  var btns = document.querySelectorAll("#panel-auth .chab-btn");
  btns.forEach(function (b) { b.disabled = on; b.style.opacity = on ? "0.5" : "1"; });
}

function _friendlyError(err) {
  var map = {
    "auth/email-already-in-use":  "Cet email est déjà utilisé.",
    "auth/invalid-email":         "Email invalide.",
    "auth/weak-password":         "Mot de passe trop faible (6 car. min.).",
    "auth/user-not-found":        "Aucun compte avec cet email.",
    "auth/wrong-password":        "Mot de passe incorrect.",
    "auth/too-many-requests":     "Trop de tentatives. Réessayez plus tard.",
    "auth/popup-closed-by-user":  "Connexion annulée.",
    "auth/popup-blocked":         "Popup bloquée par le navigateur."
  };
  return map[err.code] || err.message;
}

// ─── Init : rendre le panel auth ─────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  _renderAuth();
});

console.log("[Chab'app] Auth module chargé ✓");
