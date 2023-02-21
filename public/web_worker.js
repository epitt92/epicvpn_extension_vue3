var intervalID = null;

async function get_ip(url = 'http://ip.web-hosting.com/') {
  const timeout = 3000;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      method: 'GET',
      'Cache-Control': 'no-cache',
      timeout: 2000,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    return null;
  }
}
async function check_network() {
  let ip = await get_ip();
  if (ip !== null) {
    clearInterval(intervalID);
    postMessage(['connected']);
  }
}
onmessage = async (e) => {
  if (e.data[0] == 'get_ip') {
    try {
      console.log('Started:', new Date());
      await get_ip('https://www.google.com');
      let ip = await get_ip();
      console.log('Started:', new Date());
      console.log('ip', ip);
      if (ip === null) {
        postMessage(['not_connected']);
        // intervalID = setInterval(check_network, 1000);
      } else {
        postMessage(['connected']);
      }
    } catch (error) {
      postMessage(['not_connected']);
      //   intervalID = setInterval(check_network, 1000);
    }
  }
};
