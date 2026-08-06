import axios from 'axios';

if (process.argv.length < 4) {
  console.log('Usage: node scripts/cleanup-accounts.mjs <username> <password> [userId]');
  process.exit(1);
}

const [,, username, password, userIdArg] = process.argv;
const API_BASE_URL = 'https://aura-backend-production-2834.up.railway.app';
const client = axios.create({ baseURL: API_BASE_URL });

async function login(username, password) {
  try {
    const res = await client.post('/api/auth/login/', { username, password });
    const token = res.data.access || res.data.token || res.data.key;
    if (!token) throw new Error('No token returned by login');
    return token;
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
    return null;
  }
}

async function tryGetUser(token) {
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const candidates = ['/api/auth/user/', '/api/users/me/', '/api/users/lookup/'];
  for (const path of candidates) {
    try {
      const res = await client.get(path, auth);
      if (res?.data) return res.data;
    } catch (e) {
      // ignore
    }
  }
  return null;
}

async function tryDelete(token, userId) {
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const endpoints = [];

  // common patterns
  endpoints.push('/api/auth/user/');
  if (userId) {
    endpoints.push(`/api/users/${userId}/`);
    endpoints.push(`/api/auth/users/${userId}/`);
    endpoints.push(`/api/user/${userId}/`);
  }
  endpoints.push('/api/users/me/');
  endpoints.push('/api/user/');

  for (const ep of endpoints) {
    try {
      const res = await client.delete(ep, auth);
      console.log(`DELETE ${ep} ->`, res.status, res.data || 'OK');
      if (res.status === 204 || res.status === 200) return { success: true, endpoint: ep };
    } catch (e) {
      const status = e.response?.status;
      // show 404/403 info but continue
      console.log(`DELETE ${ep} ->`, status || 'ERR', e.response?.data || e.message);
    }
  }
  return { success: false };
}

(async () => {
  console.log('Attempting login for', username);
  const token = await login(username, password);
  if (!token) return process.exitCode = 2;

  let userInfo = null;
  if (userIdArg) {
    userInfo = { id: userIdArg };
  } else {
    console.log('Fetching user info to determine id...');
    userInfo = await tryGetUser(token);
  }

  const userId = userInfo?.id || userInfo?.pk || userIdArg;
  console.log('Resolved user id:', userId || 'unknown');

  console.log('Trying deletion endpoints (this will permanently delete the account if an endpoint allows it).');
  const result = await tryDelete(token, userId);
  if (result.success) {
    console.log('Account deletion succeeded via', result.endpoint);
  } else {
    console.log('Account deletion did not succeed. Please remove the account manually or provide an admin token.');
  }
})();
