document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  if (!signupForm || !nameInput || !emailInput || !passwordInput || !confirmPasswordInput) return;

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (passwordInput.value !== confirmPasswordInput.value) {
      alert('Passwords do not match');
      return;
    }

    const { ok, data } = await window.DemoApi.post('/api/auth/signup', {
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value
    });

    if (ok && data.success) {
      localStorage.setItem('demoAuthenticated', 'true');
      localStorage.setItem('demoDisplayName', data.user?.name || 'Demo User');
      alert(data.message || 'Demo signup complete');
      window.location.href = 'dashboard.html';
    } else {
      alert(data.message || 'Demo signup failed');
    }

    signupForm.reset();
  });
});
