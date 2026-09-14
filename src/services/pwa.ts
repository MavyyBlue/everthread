export function registerPwa() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL('sw.js', document.baseURI);
    const hadController=Boolean(navigator.serviceWorker.controller);
    let refreshing=false;

    if(hadController){
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(refreshing)return;
        refreshing=true;
        window.location.reload();
      },{once:true});
    }

    navigator.serviceWorker
      .register(serviceWorkerUrl.href,{updateViaCache:'none'})
      .then(registration => registration.update())
      .catch(error => console.warn('Service worker registration failed', error));
  });
}
