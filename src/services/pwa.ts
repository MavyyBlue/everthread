export function registerPwa() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL('sw.js', document.baseURI);
    navigator.serviceWorker
      .register(serviceWorkerUrl.href)
      .then(registration => registration.update())
      .catch(error => console.warn('Service worker registration failed', error));
  });
}
