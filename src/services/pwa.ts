export function registerPwa() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    // Resolve from the actual document URL so Everthread works from a
    // repository subpath (GitHub Pages) as well as a domain root.
    const serviceWorkerUrl = new URL('sw.js', document.baseURI);
    navigator.serviceWorker
      .register(serviceWorkerUrl.href)
      .catch(error => console.warn('Service worker registration failed', error));
  });
}
