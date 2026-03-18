(function (global) {

  // ===== DEMO ACCOUNT =====
  const DEMO_ACCOUNT = {
    email: 'admin@demo.com',
    phone: '1234567891',
    password: '1234',
    name: 'Demo Admin'
  };

  // ===== CHECK HOSTING MODE =====
  function isGitHubPages() {
    return window.location.hostname.endsWith('github.io');
  }

  // ===== FAKE API DELAY (SIMULATES SERVER) =====
  function mockDelay(data, ok = true) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ok, data }), 300);
    });
  }

  // ===== LOGIN FUNCTION =====
  async function login(payload) {

    // accept phone OR email
    const identifier = (payload.identifier || '')
      .trim()
      .toLowerCase();

    const password = payload.password || '';

    // check identifier match
    const validIdentifier =
      identifier === DEMO_ACCOUNT.email ||
      identifier === DEMO_ACCOUNT.phone;

    // validate login
    if (validIdentifier && password === DEMO_ACCOUNT.password) {
      return mockDelay({
        success: true,
        user: {
          name: DEMO_ACCOUNT.name,
          email: DEMO_ACCOUNT.email,
          phone: DEMO_ACCOUNT.phone
        },
        mode: 'demo'
      });
    }

    // failed login
    return mockDelay(
      {
        success: false,
        message:
          'Demo login: use 1234567891 OR admin@demo.com and password 1234.'
      },
      false
    );
  }

  // ===== SIGNUP FUNCTION (DEMO ONLY) =====
  async function signup(payload) {
    const name = (payload.name || 'Demo User').trim();

    return mockDelay({
      success: true,
      user: {
        name,
        email: 'demo-user@example.com'
      },
      mode: 'demo',
      message: 'Demo account created locally. No real registration occurs.'
    });
  }

  // ===== API ROUTER =====
  async function post(path, payload) {

    if (isGitHubPages()) {
      if (path.includes('/login')) return login(payload);
      if (path.includes('/signup')) return signup(payload);
    }

    // fallback (local testing)
    if (path.includes('/login')) return login(payload);
    if (path.includes('/signup')) return signup(payload);

    return mockDelay(
      { success: false, message: 'Unsupported demo endpoint.' },
      false
    );
  }

  // ===== GLOBAL EXPORT =====
  global.DemoApi = { post, login, signup, isGitHubPages };

})(window);
