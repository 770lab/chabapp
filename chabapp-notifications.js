// ============================================
// chabapp-notifications.js
// À inclure dans ton index.html
// ============================================

// 1. ENREGISTREMENT DU SERVICE WORKER (obligatoire pour PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/chabapp/sw.js', {
        scope: '/chabapp/'
      });
      console.log('✅ Service Worker enregistré:', registration.scope);
    } catch (error) {
      console.error('❌ Service Worker erreur:', error);
    }
  });
}

// 2. GESTION DU BOUTON "INSTALLER L'APP"
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Affiche ton bouton d'installation custom
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.style.display = 'block';
    installBtn.addEventListener('click', async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(outcome === 'accepted' ? '✅ App installée' : '❌ Installation refusée');
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  }
});

// Masquer le bouton si déjà installé
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const installBtn = document.getElementById('install-btn');
  if (installBtn) installBtn.style.display = 'none';
  console.log('✅ PWA installée avec succès');
});

// 3. BANDEAU iOS (Safari ne supporte pas beforeinstallprompt)
function showIOSInstallBanner() {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

  if (isIOS && !isStandalone) {
    const banner = document.getElementById('ios-install-banner');
    if (banner) banner.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', showIOSInstallBanner);
