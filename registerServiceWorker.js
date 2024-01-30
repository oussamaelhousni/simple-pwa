// this this main thread
// here we just register the service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("serviceWorker.js");
}
