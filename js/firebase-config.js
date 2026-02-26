/* ============================================================
   firebase-config.js  —  Chab'app Firebase initialisation
   Repo : github.com/770lab/chabapp
   ============================================================

   1. Inclure le SDK Firebase avant ce fichier :
      <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
      <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
      <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
      <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js"></script>

   2. Charger ce fichier, puis auth.js, puis feed.js :
      <script src="firebase-config.js"></script>
      <script src="auth.js"></script>
      <script src="feed.js"></script>
   ============================================================ */

// ─── Firebase config  ────────────────────────────────────────
// ⚠️  Remplacer par les valeurs de VOTRE projet Firebase
var FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBRVG8tGej-3EGI2AXH1Gmpa10GTVA22tk",
  authDomain:        "chabapp-5fc3b.firebaseapp.com",
  projectId:         "chabapp-5fc3b",
  storageBucket:     "chabapp-5fc3b.firebasestorage.app",
  messagingSenderId: "587299342390",
  appId:             "1:587299342390:web:278a1c63936d6a14e7b097",
  measurementId:     "G-X59DDH09CV"
};

// ─── Init  ───────────────────────────────────────────────────
var fbApp  = firebase.initializeApp(FIREBASE_CONFIG);
var fbAuth = firebase.auth();
var fbDb   = firebase.firestore();
var fbStore = firebase.storage();

// Persistence Firestore (offline)
fbDb.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
  console.warn("[FB] Persistence:", err.code);
});

// ─── Collections refs (réutilisés dans auth.js & feed.js) ───
var usersCol   = fbDb.collection("users");
var postsCol   = fbDb.collection("posts");

// ─── Helpers partagés ────────────────────────────────────────

/** Timestamp serveur Firestore */
function fbTimestamp() {
  return firebase.firestore.FieldValue.serverTimestamp();
}

/** Increment / decrement Firestore */
function fbIncrement(n) {
  return firebase.firestore.FieldValue.increment(n || 1);
}

/** Génère un ID unique (fallback si pas de crypto) */
function fbId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

/** Upload un fichier vers Storage et renvoie l'URL de téléchargement
 *  @param {File} file
 *  @param {string} path  ex : "posts/abc123/photo.jpg"
 *  @returns {Promise<string>} downloadURL
 */
function fbUpload(file, path) {
  var ref = fbStore.ref(path);
  var metadata = { contentType: file.type || "application/octet-stream" };
  return ref.put(file, metadata).then(function (snap) {
    return snap.ref.getDownloadURL();
  });
}

/** Retourne l'utilisateur connecté ou null */
function fbCurrentUser() {
  return fbAuth.currentUser;
}

console.log("[Chab'app] Firebase initialisé ✓");
