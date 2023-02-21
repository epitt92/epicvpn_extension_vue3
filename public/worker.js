const baseUrl = 'https://epicvpn.net';
const consoleLogEnabled = true;
const initialStore = {};
let store = { ...initialStore };
let tempData = null;

// SYNC BETWEEN SITE AND EXTENSION START
let oldSiteAuth = 'false';
let popupOpened = false;

let intervalID = null;

// Get the ip address of the client
async function get_ip(url = 'http://ip.web-hosting.com/') {
  const timeout = 3000;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      method: 'GET',
      'Cache-Control': 'no-cache',
      timeout: 1000,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    return null;
  }
}

// Check the network connection
async function check_network() {
  let ip = await get_ip();
  if (ip !== null) {
    clearInterval(intervalID);
    store.isNetworkError = false;
    init();
  }
}

const handleCheckNetwork = async () => {
  let ip = await get_ip();
  console.log('ip', ip);
  if (ip === null) {
    store.isNetworkError = true;
    console.log('offline');
    if (intervalID !== null) clearInterval(intervalID);
    intervalID = setInterval(check_network, 3000);
  } else {
    store.isNetworkError = false;
  }
  popupOpened &&
    chrome.runtime.sendMessage({
      type: 'bgStoreUpdated',
      storeBG: store,
    });
};

const init = () => {
  chrome.storage.local.get(null, async (obj) => {
    disconnectProxy(false);
    store.server = obj.server;
    store.user = obj.user;
    store.subscription = obj.subscription;
    store.connected = !!obj.proxyConnected && !!obj.proxyAutoConnect;
    store.autoConnect = obj.proxyAutoConnect;
    store.isWebRtc = obj.isWebRtc;

    store.currency = obj.currency;
    store.currencySymbol = obj.currencySymbol;
    store.monthlyPrice = obj.monthlyPrice;
    store.selectedProduct = obj.selectedProduct;
    store.products = obj.products;

    store.paidServers = obj.paidServers;
    store.freeServers = obj.freeServers;

    if (obj.epic_user_auth) {
      store.overlayLoader = true;
    }
    await handleCheckNetwork();
    if (store.isNetworkError) return;
    console.log('initial store from bg', store);
    console.log('chrome storage', obj);
    if (obj.epic_user_auth) {
      obj.epic_user_auth && checkAuthAndGetData();
    }
  });
};

init();

const authCheckWithCookies = ({ deviceIdCookie, tokenCookie, epicSessionCookie }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Cookie', `${tokenCookie.name}=${tokenCookie.value}; ${epicSessionCookie.name}=${epicSessionCookie.value}; ${deviceIdCookie.name}=${deviceIdCookie.value}`);
      const { data } = await get(`${baseUrl}/api/auth/v1/auth-check`, {});
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

const getUserAuthCookies = ({ userId }) => {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({ domain: 'epicvpn.net' }, function (cookies) {
      const result = cookies.filter((el) => el.name === `device_id_${userId}` || el.name === 'XSRF-TOKEN' || el.name === 'epic_session');
      const deviceIdCookie = result.filter((el) => !['XSRF-TOKEN', 'epic_session'].includes(el.name))[0];
      const tokenCookie = result.filter((el) => ['XSRF-TOKEN'].includes(el.name))[0];
      const epicSessionCookie = result.filter((el) => ['epic_session'].includes(el.name))[0];
      const epicUserAuth = result.filter((el) => ['epic_user_auth'].includes(el.name))[0];
      console.log('getUserAuthCookies', { epicUserAuth, deviceIdCookie, tokenCookie, epicSessionCookie });
      resolve({ epicUserAuth, deviceIdCookie, tokenCookie, epicSessionCookie });
    });
  });
};

const onAuthRequiredHandler = (details) => {
  console.log('onauth triggered');
  if (tempData && tempData.vpn_name && tempData.vpn_password) {
    return authCredentials(tempData.vpn_name.trim(), tempData.vpn_password.trim());
  }
  return {};
};

const addOnAuthRequiredListener = () => {
  chrome.webRequest.onAuthRequired.addListener(onAuthRequiredHandler, { urls: ['<all_urls>'] }, ['blocking']);
};

const removeOnAuthRequiredListener = () => {
  chrome.webRequest.onAuthRequired.removeListener(onAuthRequiredHandler);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, value: storeObjValue, key: storeObjKey } = message;
  if (type === 'checkNetwork') {
    handleCheckNetwork();
    sendResponse();
  } else if (type === 'setProxy') {
    console.log('setProxy from BG', message.domain, message.port, message.vpn_name, message.vpn_password);
    setProxy(message.domain, message.port, message.vpn_name, message.vpn_password).then((isConnected) => {
      // Show Notification
      const opts = {
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: 'EpicVPN',
        message: `Connected to ${store.server && store.server.city} proxy successfully.`,
      };
      store.connected = isConnected;
      isConnected && showNotification('connect-vpn', opts, 2000);
      sendResponse({ isConnected });
    });
  } else if (type == 'disconnectProxy') {
    disconnectProxy();
    const opts = {
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: 'EpicVPN',
      message: `Disconnected from ${store.server && store.server.city} proxy successfully.`,
    };
    store.connected = false;
    showNotification('disconnect-vpn', opts, 2000);
    sendResponse();
  } else if (type === 'deleteCookies') {
    chrome.cookies.getAll({ url: baseUrl }, function (cookies) {
      let cookieSize = cookies.length;
      for (let i = 0; i < cookieSize; i++) {
        if (cookies[i].name.indexOf('remember_web') !== -1) {
          chrome.cookies.remove({ url: baseUrl, name: cookies[i].name });
        }
      }
    });
    chrome.cookies.remove({ url: baseUrl, name: 'XSRF-TOKEN' }, function (deleted_cookie) {
      consoleLogEnabled && console.log('cookies', deleted_cookie);
    });
    chrome.cookies.remove({ url: baseUrl, name: 'epic_session' }, function (deleted_cookie) {
      consoleLogEnabled && console.log(deleted_cookie);
    });
    chrome.cookies.set({ url: baseUrl, name: 'epic_user_auth', value: 'false' });
    chrome.storage.local.set({ epic_user_auth: false });
    clearStorage();
  } else if (type === 'request') {
    const { url, method, params } = message;

    consoleLogEnabled && console.log('background request run', url, params);

    if (String(method).toLocaleLowerCase() === 'get') {
      get(url, params)
        .then((response) => sendResponse(response))
        .catch((error) => sendResponse(error));
    } else if (String(method).toLocaleLowerCase() === 'post') {
      post(url, params)
        .then((response) => sendResponse(response))
        .catch((error) => sendResponse(error));
    }
  } else if (type === 'initWS') {
    initWS({ userId: message.userId })
      .then((e) => sendResponse(e))
      .catch((e) => sendResponse(e));
  } else if (type === 'updateBGStore') {
    store[storeObjKey] = storeObjValue;
    storeObjKey === 'autoConnect' && chrome.storage.local.set({ proxyAutoConnect: storeObjValue });
    sendResponse(store);
  } else if (type === 'getBGStore') {
    sendResponse(store);
  } else if (type === 'resetBGStore') {
    store = initialStore;
    sendResponse(store);
  }

  return true;
});

let proxyError = false;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    popupOpened = true;
    consoleLogEnabled && console.log('popup opened');
    // chrome.storage.local.get(null, async ({ epic_user_auth, ...rest }) => {
    //     console.log('popup opened', epic_user_auth, rest);
    //     epic_user_auth && checkAuthAndGetData();
    // });
    port.onDisconnect.addListener(() => {
      popupOpened = false;
      consoleLogEnabled && console.log('popup has been closed');
    });
  }
});

chrome.runtime.onInstalled.addListener(function (reason) {
  console.log('installed');

  chrome.cookies.get({ url: baseUrl, name: 'epic_user_auth' }, function (cookie) {
    if (cookie) {
      oldSiteAuth = cookie.value == 'true';
    }
  });
});

function modifyHeaderUserAgent({ action }) {
  const RULE = {
    id: 1,
    condition: {
      urlFilter: 'epicvpn*^ext=true|',
      resourceTypes: ['xmlhttprequest'],
    },
    action: {
      type: 'modifyHeaders',
      requestHeaders: [{ header: 'User-Agent', operation: 'set', value: `EpicVPNExtension/1.0 ${navigator.userAgent.split(' ').slice(1).join(' ')}` }],
    },
  };

  if (action === 'add') {
    return chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE.id],
      addRules: [RULE],
    });
  } else if (action === 'remove') {
    return chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
    });
  }
}

chrome.cookies.onChanged.addListener(async function (changeInfo) {
  if (changeInfo.cookie.domain == 'epicvpn.net' && changeInfo.cookie.name == 'epic_user_auth') {
    if (changeInfo.cookie.value == 'false' && oldSiteAuth == 'true') {
      clearStorage();
      disconnectProxy();
      oldSiteAuth = 'false';
      popupOpened && chrome.runtime.sendMessage({ type: 'loggedOut' });
      chrome.storage.local.set({ epic_user_auth: false });
      consoleLogEnabled && console.log('logged out');
    } else if (changeInfo.cookie.value == 'true' && oldSiteAuth !== changeInfo.cookie.value) {
      oldSiteAuth = 'true';
      chrome.storage.local.set({ epic_user_auth: true });
      checkAuthAndGetData();
    }
  }
});

// Show Notification
function showNotification(title, options, expireTime) {
  chrome.notifications.create(title, options, function (notificationId) {
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, expireTime);
  });
}

async function checkAuthAndGetData() {
  try {
    const { data: authData, error: isError } = await get(`${baseUrl}/api/auth/v1/auth-check`, null);
    if (!isError) {
      if (authData && authData.auth && authData.user && authData.user.activated) {
        chrome.storage.local.get(null, async ({ server, proxyAddress, proxyPort, proxyAutoConnect, proxyConnected, epic_user_auth }) => {
          const userObj = { ...authData.user };

          delete userObj.api_token;
          delete userObj.vpn_name;
          delete userObj.vpn_password;
          store.user = userObj;
          initWS({ userId: store.user.id });
          await getStaticDataFromServer();

          if (server && proxyAutoConnect && proxyConnected) {
            setProxy(server.domain, 8089, authData.user.vpn_name, authData.user.vpn_password).then((isConnected) => {
              store = { ...store, connected: isConnected, connecting: false, connectionStarted: Date.now() };
            });
            console.log('Connect to proxy', new Date().getTime());
          }

          store.overlayLoader = false;
          popupOpened && chrome.runtime.sendMessage({ type: 'loggedIn', storeBG: store });
          consoleLogEnabled && console.log('logged in');
        });
      } else {
        store.connected && disconnectProxy(true);
        clearStorage();
        popupOpened && chrome.runtime.sendMessage({ type: 'loggedOut' });
        consoleLogEnabled && console.log('logged out');
        store.overlayLoader = false;
        popupOpened && chrome.runtime.sendMessage({ type: 'bgStoreUpdated', storeBG: { overlayLoader: false } });
        console.log('bg store', store);
      }
    } else {
      console.log('Network Error');
    }
  } catch (error) {
    console.log(error);
  }
}
// SYNC BETWEEN SITE AND EXTENTION END
async function getStaticDataFromServer() {
  try {
    console.log('Request api run--');
    const { data: subData } = await get(`${baseUrl}/api/account/v1/subscriptions/current`, null);
    const { data: referralData } = await get(`${baseUrl}/api/account/v1/referral-program/view`, null);
    console.log('Subscription api is requested: api/account/v1/subscriptions/current');
    console.log('ReferralData api is requested: api/account/v1/referral-program/view');

    store.referralProgram = referralData;
    store.subscription = subData;

    let obj = await chrome.storage.local.get(null);

    const isHidden = store.user.subscription_id && store.subscription && ['active', 'paused', 'canceled'].includes(store.subscription.status);
    if (isHidden) {
      console.log('Visible data');
      const userInfo = {
        subscription_id: store.user.subscription_id,
      };
      chrome.storage.local.set({ user: userInfo });
      chrome.storage.local.set({ subscription: { status: subData.status } });
      chrome.storage.local.remove(['currency', 'currencySymbol', 'monthlyPrice', 'selectedProduct', 'products', 'planCreatedAt']);
    } else {
      const userInfo = {
        traffic_limit: store.user.traffic_limit,
        monthly_all_used_traffic: store.user.monthly_all_used_traffic,
        monthly_free_used_traffic: store.user.monthly_free_used_traffic,
      };
      chrome.storage.local.remove(['subscription']);
      chrome.storage.local.set({ user: userInfo });
      let planCreatedAt = obj.planCreatedAt ? obj.planCreatedAt : 0;
      let planPeriod = new Date().getTime() - planCreatedAt;
      console.log('Planperiod:', planPeriod, planCreatedAt);
      if (planPeriod > 5 * 24 * 3600 * 1000) {
        const {
          data: { currency, currencySymbol },
        } = await get(`${baseUrl}/api/get-current-lang`, null);
        const { data: plans } = await get(`${baseUrl}/api/account/v1/products`, { service_id: 1, currency: currency });

        console.log('Api request for plans', obj, plans);
        store.currency = currency;
        store.currencySymbol = currencySymbol;

        store.monthlyPrice = plans.find((d) => d.plan.interval == 'month' && d.plan.interval_count == 1).plan.amount / 100;
        store.selectedProduct = plans.find((d) => d.as_most_selected);
        store.products = plans.sort((a, b) => a.sort - b.sort);

        chrome.storage.local.set({
          currency: store.currency,
          currencySymbol: store.currencySymbol,
          monthlyPrice: store.monthlyPrice,
          selectedProduct: store.selectedProduct,
          products: Object.values(store.products),
          planCreatedAt: new Date().getTime(),
        });
      }
    }

    let serverCreatedAt = obj.serversCreatedAt ? obj.serversCreatedAt : 0;
    let serversPeriod = new Date().getTime() - serverCreatedAt;
    if (serversPeriod > 2 * 60 * 1000) {
      const {
        data: { free, paid },
      } = await get(`${baseUrl}/api/account/v1/servers`);

      store.paidServers = paid;
      store.freeServers = free;
      chrome.storage.local.set({
        paidServers: paid,
        freeServers: free,
        serversCreatedAt: new Date().getTime(),
      });
    }
    popupOpened &&
      chrome.runtime.sendMessage({
        type: 'bgStoreUpdated',
        storeBG: store,
      });
  } catch (err) {
    console.log(err);
  }
}
// Clear chrome storage
function clearStorage() {
  chrome.storage.local.clear();
  store = { ...initialStore };
}

// PROXY FUNCTIONS START
async function setProxy(proxyAddress, proxyPort, vpn_name, vpn_password) {
  tempData = { vpn_name, vpn_password };

  let res = await get_ip('http://' + proxyAddress + ':' + proxyPort);
  console.log('Ping domain:', res);
  if (res === null) {
    return false;
  }
  removeOnAuthRequiredListener();
  chrome.proxy.settings.set({ value: config(proxyAddress, proxyPort), scope: 'regular' }, async (details) => {
    chrome.storage.local.set({ proxyConnected: true });
    await handleCheckNetwork();
    await handleCheckNetwork();
    console.log('SET PR0XY', { proxyAddress, proxyPort, vpn_name, vpn_password });
    await get_ip('https://www.google.com');
  });
  addOnAuthRequiredListener();

  return true;
}

function disconnectProxy(updateChromeStorage = true) {
  chrome.proxy.settings.set({
    value: {
      mode: 'direct',
    },
    scope: 'regular',
  });
  console.log('Disconnect--', updateChromeStorage);
  updateChromeStorage && chrome.storage.local.set({ proxyConnected: false });
}

function config(proxyAddress, port) {
  return {
    mode: 'pac_script',
    pacScript: {
      data: `function FindProxyForURL(url, host) {
                return 'PROXY ${proxyAddress}:${port}';
            }`,
    },
  };
}

function credentialsToHeader(details, proxyUsername, proxyPassword) {
  for (let header in details.requestHeaders) {
    if (header.name == 'Authorization') {
      return {};
    }
  }

  details.requestHeaders.push({
    name: 'Authorization',
    value: 'Basic ' + btoa(proxyUsername + ':' + proxyPassword),
  });

  return { requestHeaders: details.requestHeaders };
}

function authCredentials(proxyUsername, proxyPassword) {
  return {
    authCredentials: {
      username: proxyUsername,
      password: proxyPassword,
    },
  };
}
// PROXY FUNCTIONS END

// FETCH FUNTION START
const request = async ({ url, params = {}, method = 'GET', headers }) => {
  try {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();

    if (rules.findIndex((el) => el.id === 1) < 0) {
      await modifyHeaderUserAgent({ action: 'add' });
    }

    let options = {
      method,
      headers: headers || new Headers({ 'content-type': 'application/json' }),
    };

    if ('GET' === method) {
      url += '?' + new URLSearchParams({ ...params, ext: true }).toString();
    } else if ('POST' === method) {
      url += '?' + new URLSearchParams({ ext: true }).toString();
      options.body = JSON.stringify(params);
    }

    const response = await fetch(url, options);

    const result = await response.json();

    if (!response.ok || response.status !== 200 || (result && result.error)) {
      throw new Error(`Error! status: ${response.status}`, {
        cause: result,
      });
    }

    return result;
  } catch (response) {
    if (response.cause) {
      const { error } = response.cause;
      // console.log(`FROM SERVICE WORKER ERROR IN: ${url}`, response.cause);
      error &&
        popupOpened &&
        chrome.runtime.sendMessage({
          type: 'requestError',
          response: response.cause,
          url,
        });
      return response.cause;
    } else {
      return { error: true, url, details: response };
    }
  }
};

const get = (url, params, headers) => request({ url, params, method: 'GET', headers });
const post = (url, params, headers) => request({ url, params, method: 'POST', headers });
// FETCH FUNTION END

// WEB SOCKETS START
let wsPingInterval;
let wsInitializationPromis;

function wsIsOpened(ws) {
  return ws.readyState === ws.OPEN;
}

function initWS({ userId }) {
  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket('wss://socket.epicvpn.net/app/epic?protocol=7&client=js&version=4.4.0&flash=false');

      ws.onopen = () => {
        store.wsConnected = true;
        console.log('WS connection has been opened successfully', store);
        popupOpened &&
          chrome.runtime.sendMessage({
            type: 'bgStoreUpdated',
            storeBG: store,
          });
      };

      const wsOnClose = (event) => {
        consoleLogEnabled && console.log('WS connection has been closed successfully.');
        resolve({ wsConnected: false, event });
        clearInterval(wsPingInterval);

        popupOpened &&
          chrome.runtime.sendMessage({
            type: 'wsClosed',
            event,
          });
      };

      ws.addEventListener('error', (event) => wsOnClose(event));
      ws.addEventListener('close', (event) => wsOnClose(event));

      ws.onmessage = (event) => {
        consoleLogEnabled && console.log('WS onmessage', event.data);

        if (event.data) {
          const response = JSON.parse(event.data);
          if (response.event === 'pusher:connection_established') {
            const data = JSON.parse(response.data);
            const { socket_id } = data;
            const authRequestBody = { socket_id, channel_name: `presence-system_events.${userId}` };
            setTimeout(
              () =>
                authorizeAndSubscribeWS({ ws, userId, authRequestBody })
                  .then((e) => resolve(e))
                  .catch((e) => reject({ wsConnected: false, error: true })),
              300
            );
          } else if (response.channel === `presence-system_events.${userId}` && response.data) {
            const dataJSON = JSON.parse(response.data);
            popupOpened &&
              chrome.runtime.sendMessage({
                type: 'wsDataUpdated',
                data: dataJSON,
              });
            chrome.storage.local.remove(['planCreatedAt', 'serverCreatedAt']);
            const { action, model, data } = dataJSON;
            if (model === 'User' && action === 'updated') {
              const result = { ...data };
              delete result.api_token;
              delete result.vpn_name;
              delete result.vpn_password;
              store.user = result;
              getStaticDataFromServer();
            } else if (model === 'Subscription' && action === 'updated') {
              getStaticDataFromServer();
            }
            resolve({ wsConnected: true });
          } else {
            resolve({ wsConnected: true });
          }
        } else {
          resolve({ wsConnected: true });
        }
      };
    } catch (error) {
      resolve({ wsConnected: false, error: true });
    }
  });
}

function authorizeAndSubscribeWS({ ws, userId, authRequestBody }) {
  return new Promise(async (resolve, reject) => {
    try {
      let options = {
        method: 'POST',
        headers: new Headers({ 'content-type': 'application/json' }),
        body: JSON.stringify(authRequestBody),
      };

      const response = await fetch(`${baseUrl}/broadcasting/auth`, options);
      const { auth, channel_data } = await response.json();
      if (!wsIsOpened(ws)) return;

      const obj = {
        event: 'pusher:subscribe',
        data: {
          auth,
          channel: `presence-system_events.${userId}`,
          channel_data,
        },
      };

      if (!wsIsOpened(ws)) return;

      ws.send(JSON.stringify(obj));
      wsPingInterval = setInterval(() => ws.send(JSON.stringify({ event: 'pusher:ping', data: {} })), 20000);
      resolve({ wsConnected: true });
    } catch (error) {
      resolve({ wsConnected: false, error: true });
    }
  });
}

// WEB SOCKETS END
