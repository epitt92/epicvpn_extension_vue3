const app = document.getElementById('app');
// chrome.tabs.onCreated.addListener( (tabInfo) => {
//   console.log("Tab iss created", tabInfo)
// })

const hrefs = ['https://epicvpn.net/', 'http://epicvpn.net/', 'https://epicvpn.com/', 'http://epicvpn.com/'];
const domainHref = window.location.href;
hrefs.forEach((href) => domainHref.includes(href) && app && app.classList.add('ext-installed'));

// chrome.storage.local.get(null, (obj) => {

//     console.log("connected!!!!!", obj)
//     if(obj.connected){
//         chrome.runtime.sendMessage(
//             {
//                 type: 'request',
//                 url: `https://epicvpn.net/api/account/v1/connections/check`,
//                 method: 'get',
//                 params: { token: obj.token, vpn_name:obj.vpnName, vpn_password: obj.vpnPassword },
//             },
//             async (response) => {
//                 if (!response.error) {
//                     chrome.runtime.sendMessage({ type: 'setProxy', domain: obj.domain, port: obj.port,  vpn_name:obj.vpnName, vpn_password: obj.vpnPassword }, () => {

//                         console.log("connected")
//                     });
//                 } else {
//                     console.log("vpn disconnected")
//                 }
//             }
//         );
//     }
// });