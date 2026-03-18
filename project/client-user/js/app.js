const API_BASE = 'http://localhost:5000/api';

const messageEl = document.getElementById('message');
const authCard = document.getElementById('auth-card');
const dashboardCard = document.getElementById('dashboard-card');
const walletBalance = document.getElementById('wallet-balance');
const historyOutput = document.getElementById('history-output');

const tokenKey = 'fidelity_user_token';

function setMessage(msg, isError = false) {
  messageEl.textContent = msg;
  messageEl.style.color = isError ? 'crimson' : 'green';
}

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function logout() {
  localStorage.removeItem(tokenKey);
  authCard.classList.remove('hidden');
  dashboardCard.classList.add('hidden');
}

async function api(path, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function loadProfileAndHistory() {
  const profile = await api('/user/profile');
  dashboardCard.querySelector('input[name="username"]').value = profile.username || '';
  dashboardCard.querySelector('input[name="phone"]').value = profile.phone || '';
  walletBalance.textContent = Number(profile.wallet_balance).toFixed(2);

  const history = await api('/user/transactions');
  historyOutput.textContent = JSON.stringify(history, null, 2);
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api('/auth/register', 'POST', Object.fromEntries(form.entries()));
    setMessage('Registration successful. Please login.');
    e.target.reset();
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const data = await api('/auth/login', 'POST', Object.fromEntries(form.entries()));
    setToken(data.token);
    authCard.classList.add('hidden');
    dashboardCard.classList.remove('hidden');
    setMessage('Login successful');
    await loadProfileAndHistory();
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api('/user/profile', 'PUT', Object.fromEntries(form.entries()));
    setMessage('Profile updated');
    await loadProfileAndHistory();
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('bank-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api('/user/bank', 'POST', Object.fromEntries(form.entries()));
    setMessage('Bank details updated');
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('upi-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api('/user/upi', 'POST', Object.fromEntries(form.entries()));
    setMessage('UPI details updated');
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api('/user/withdraw', 'POST', Object.fromEntries(form.entries()));
    setMessage('Withdraw request submitted');
    await loadProfileAndHistory();
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('refresh-history').addEventListener('click', async () => {
  try {
    await loadProfileAndHistory();
    setMessage('History refreshed');
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('logout-btn').addEventListener('click', logout);

(async function init() {
  const token = getToken();
  if (!token) return;

  try {
    authCard.classList.add('hidden');
    dashboardCard.classList.remove('hidden');
    await loadProfileAndHistory();
  } catch (error) {
    logout();
  }
})();
