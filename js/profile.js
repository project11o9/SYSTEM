document.addEventListener('DOMContentLoaded', () => {
  const isAuthed = localStorage.getItem('demoAuthenticated') === 'true';
  if (!isAuthed) {
    window.location.replace('index.html');
    return;
  }

  const profileEmail = document.getElementById('profileEmail');
  if (profileEmail) {
    const username = localStorage.getItem('demoDisplayName') || 'Demo User';
    profileEmail.textContent = `Signed in as ${username} (demo)`;
  }

  const backBtn = document.getElementById('backToDashboard');
  if (backBtn) {
    backBtn.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = 'dashboard.html';
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem('demoAuthenticated');
      localStorage.removeItem('demoDisplayName');
      window.location.href = 'index.html';
    });
  }
});
