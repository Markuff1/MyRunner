import axios from 'axios';

const CLIENT_ID = 166653;
const CLIENT_SECRET = '5c4e051b43d3711ddaaed3f80cb7a342be9641e7';
const REDIRECT_URI = 'http://localhost:5173/dashboard';

export function getAuthUrl() {
  return `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=activity:read_all`;
}

export async function exchangeToken(code) {
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('code', code);
  params.append('grant_type', 'authorization_code');

  const res = await axios.post('https://www.strava.com/oauth/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  // Save tokens locally
  localStorage.setItem('access_token', res.data.access_token);
  return res.data.access_token;
}

export async function fetchActivities(accessToken) {
  const res = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      per_page: 100, // Fetch up to 100 activities
      page: 1
    }
  });

  return res.data;
}

export function getStoredToken() {
  return localStorage.getItem('access_token');
}

// Fetches real pace data stream (velocity_smooth) for an activity
export async function fetchPaceStream(activityId, accessToken) {
  const res = await axios.get(`https://www.strava.com/api/v3/activities/${activityId}/streams`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    params: {
      keys: 'velocity_smooth',
      key_by_type: true
    }
  });

  return res.data.velocity_smooth?.data || [];
}

