document.addEventListener('DOMContentLoaded', () => {

  // ===== GET FORM ELEMENTS =====
  const loginForm = document.getElementById('loginForm');
  const identifierInput = document.getElementById('identifier'); // phone or email
  const passwordInput = document.getElementById('password');

  if (!loginForm || !identifierInput || !passwordInput) {
    console.warn('Login form elements not found');
    return;
  }

  // ===== HELPERS =====
  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isPhone(value) {
    return /^[0-9]{10,15}$/.test(value);
  }

  function showError(message) {
    alert(message); // later you can replace with toast UI
  }

  // ===== FORM SUBMIT =====
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value.trim();

    // ---- BASIC VALIDATION ----
    if (!identifier || !password) {
      showError('Please enter email/phone and password.');
      return;
    }

    if (!isEmail(identifier) && !isPhone(identifier)) {
      showError('Enter a valid email or phone number.');
      return;
    }

    try {
      // ===== API CALL =====
      const { ok, data } = await window.DemoApi.post(
        '/api/auth/login',
        {
          identifier: identifier,
          password: password
        }
      );

      // ===== SUCCESS =====
      if (ok && data.success) {
        localStorage.setItem('demoAuthenticated', 'true');
        localStorage.setItem(
          'demoDisplayName',
          data.user?.name || 'Demo User'
        );

        // optional: store login identifier
        localStorage.setItem('demoUserLogin', identifier);

        // redirect
        window.location.href = 'dashboard.html';
      } else {
        showError(data?.message || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      showError('Server error. Please try again.');
    }

    loginForm.reset();
  });

});
