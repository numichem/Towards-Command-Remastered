/* At The Gate — offline service worker. Shell cache-first; chapters network-first so updates appear when online. */
const CACHE="atg-cache-v2";
const SHELL=["./","./index.html","./manifest.webmanifest"];
self.addEventListener("install",e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{}))); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET") return;
  const url=new URL(req.url);
  if(url.pathname.includes("/chapters/")){
    e.respondWith(fetch(req).then(res=>{ const c=res.clone(); caches.open(CACHE).then(ch=>ch.put(req,c)).catch(()=>{}); return res; }).catch(()=>caches.match(req)));
  } else {
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{ const c=res.clone(); caches.open(CACHE).then(ch=>ch.put(req,c)).catch(()=>{}); return res; }).catch(()=>caches.match("./index.html"))));
  }
});
