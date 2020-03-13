import 'src/common/browser';
import { inject, getUniqId, sendMessage } from './utils';
import initialize from './content';

(function main() {
  // Ignore XML, etc.
  if (document.documentElement.tagName.toLowerCase() !== 'html') return;

  // Avoid running repeatedly due to new `document.documentElement`
  if (window.VM) return;
  window.VM = 1;

  browser.__isContent = true;

  function initBridge() {
    const contentId = getUniqId();
    const webId = getUniqId();
    const args = [
      JSON.stringify(webId),
      JSON.stringify(contentId),
      JSON.stringify(Object.getOwnPropertyNames(window)),
    ];
    inject(`(${window.VM_initializeWeb.toString()}())(${args.join(',')})`);
    initialize(contentId, webId);
  }
  initBridge();

  // For installation
  function checkJS() {
    if (!document.querySelector('title')) {
      // plain text
      sendMessage({
        cmd: 'ConfirmInstall',
        data: {
          code: document.body.textContent,
          url: location.href,
          from: document.referrer,
        },
      })
      .then(() => {
        if (history.length > 1) history.go(-1);
        else sendMessage({ cmd: 'TabClose' });
      });
    }
  }
  if (/\.user\.js$/.test(location.pathname)) {
    if (document.readyState === 'complete') checkJS();
    else window.addEventListener('load', checkJS, false);
  }
}());
