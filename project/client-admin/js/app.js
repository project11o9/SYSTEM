const API_BASE = 'http://localhost:5000/api';
const tokenKey = 'fidelity_admin_token';

const messageEl = document.getElementById('message');
const loginCard = document.getElementById('login-card');
const dashboard = document.getElementById('admin-dashboard');

function setMessage(msg, isError = false) {
  messageEl.textContent = msg;
  messageEl.style.color = isError ? '#ff8f8f' : '#6dffa3';
}

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function logout() {
  localStorage.removeItem(tokenKey);
  dashboard.classList.add('hidden');
  loginCard.classList.remove('hidden');
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

async function refreshData(search = '') {
  const users = await api(`/admin/users?search=${encodeURIComponent(search)}`);
  const withdrawals = await api('/admin/withdrawals');
  const bank = await api('/admin/bank-details');
  const upi = await api('/admin/upi-details');
  const deposits = await api('/admin/deposits');

  document.getElementById('users-output').textContent = JSON.stringify(users, null, 2);
  document.getElementById('withdraw-output').textContent = JSON.stringify(withdrawals, null, 2);
  document.getElementById('bank-output').textContent = JSON.stringify(bank, null, 2);
  document.getElementById('upi-output').textContent = JSON.stringify(upi, null, 2);
  document.getElementById('deposits-output').textContent = JSON.stringify(deposits, null, 2);
}

document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const data = await api('/admin/login', 'POST', Object.fromEntries(form.entries()));
    setToken(data.token);
    loginCard.classList.add('hidden');
    dashboard.classList.remove('hidden');
    setMessage('Admin logged in');
    await refreshData();
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('inject-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api(`/admin/user/${form.user_id}/inject`, 'POST', { amount: Number(form.amount) });
    setMessage('Wallet injected');
    await refreshData();
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('status-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api(`/admin/user/${form.user_id}/status`, 'PATCH', { status: form.status });
    setMessage('User status updated');
    await refreshData();
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('approve-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { withdraw_id: withdrawId } = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api(`/admin/withdraw/${withdrawId}/approve`, 'POST');
    setMessage('Withdraw approved');
    await refreshData();
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('reject-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { withdraw_id: withdrawId } = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api(`/admin/withdraw/${withdrawId}/reject`, 'POST');
    setMessage('Withdraw rejected');
    await refreshData();
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('search-btn').addEventListener('click', async () => {
  try {
    await refreshData(document.getElementById('search-user').value);
    setMessage('Search completed');
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('refresh-admin-data').addEventListener('click', async () => {
  try {
    await refreshData();
    setMessage('Data refreshed');
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('admin-logout').addEventListener('click', logout);

(async function init() {
  if (!getToken()) return;
  try {
    loginCard.classList.add('hidden');
    dashboard.classList.remove('hidden');
    await refreshData();
  } catch (error) {
    logout();
  }
})();
