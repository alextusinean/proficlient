const nodeFetch = require('node-fetch');
const fetchCookie = require('fetch-cookie');

const OAUTH2_BASE_URL = 'https://auth.profi.lobyco.net/oauth2';
const GAMES_BASE_URL = 'https://api.profi.lobyco.net/game/mobile-app/v1/games';
const LOGIN_FORM_URL = 'https://idp.profi.lobyco.net/api/web/v1/session';
const REDIRECT_URI = 'https://mobile-app/auth-redirect';
const CLIENT_ID = 'mobile-app';

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE67 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~';
function getRandom(alphabet, length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return result;
};

async function doAccount(username, password) {
  const fetch = fetchCookie(nodeFetch);
  let response = await fetch(`${OAUTH2_BASE_URL}/auth?${new URLSearchParams({
    response_type: 'code',
    scope: 'checkin offline_access openid',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state: getRandom(BASE62, 14),
    nonce: getRandom(BASE67, 32),
    audience: 'https://api.profi.lobyco.net/promotion'
  })}`); // cookie

  response = await fetch(`${LOGIN_FORM_URL}?${new URLSearchParams({ login_challenge: new URLSearchParams(response.url.split('?')[1]).get('login_challenge') })}`, {
    method: 'POST',
    body: JSON.stringify({ username, password, rememberMe: false }),
    headers: { 'Content-Type': 'application/json' }
  });

  response = await fetch((await response.json()).redirectTo, { redirect: 'manual' }); // cookie
  response = await fetch(response.headers.get('location'), { redirect: 'manual' });
  response = await fetch(response.headers.get('location'), { redirect: 'manual' });

  response = await fetch(`${OAUTH2_BASE_URL}/token`, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: new URLSearchParams(response.headers.get('location').split('?')[1]).get('code'),
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
    })
  });

  const Authorization = `Bearer ${(await response.json()).access_token}`;

  // uncomment below for getting available rewards
  // response = await fetch(`https://api.profi.lobyco.net/integration-product-price/mobile-app/v1/coupons?campaignTypes=game`, { headers: { Authorization } });
  // console.log(await response.json());

  // return;

  response = await fetch(`${GAMES_BASE_URL}/current`, { headers: { Authorization } });
  if (response.status == 204) return console.log('no game available');

  response = await fetch(`${GAMES_BASE_URL}/${(await response.json()).gameId}/start`, { method: 'POST', headers: { Authorization } });
  const searchParameters = new URLSearchParams((await response.json()).gameUrl.split('?')[1]);
  console.log(`win: ${searchParameters.get('win')}`);

  await fetch(searchParameters.get('redirectUrl'), { method: 'POST' });

  // endpoint for checking in store
  // POST /payment/mobile-app/v1/checkin {"qrCode":"143421434"}
}

(async () => {
  const usernameGroups = require('./usernames.json');
  for (const usernameGroup of usernameGroups) {
    let password;
    for (const username of usernameGroup) {
      if (!password) {
        password = username;
        continue;
      }

      console.log(`now doing ${username}...`);
      await doAccount(username, password);
      console.log();
    }
  }
})();
