document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isAuthed = localStorage.getItem('demoAuthenticated') === 'true';

  const authPages = new Set(['index.html', 'login.html', 'signup.html']);
  const protectedPages = new Set(['dashboard.html', 'profile.html', 'wallet.html', 'spin.html', 'review.html']);

  if (isAuthed && authPages.has(currentPage)) {
    window.location.replace('dashboard.html');
    return;
  }

  if (!isAuthed && protectedPages.has(currentPage)) {
    window.location.replace('index.html');
    return;
  }

  const profileBtn = document.getElementById('profileBtn');
  if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'profile.html';
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('demoAuthenticated');
      localStorage.removeItem('demoDisplayName');
      window.location.href = 'index.html';
    });
  }

  const walletBtn = document.getElementById('walletBtn');
  if (walletBtn) walletBtn.onclick = () => (location.href = 'wallet.html');

  const spinWheel = document.getElementById('spinWheel');
  if (spinWheel) spinWheel.onclick = () => (location.href = 'spin.html');
});
