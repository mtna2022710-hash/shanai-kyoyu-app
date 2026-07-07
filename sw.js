// シンプルなサービスワーカー（PWAインストール対応）
// 方式：ネットワーク優先（オンライン時は常に最新を取得、オフライン時のみキャッシュ）
const CACHE = "shanai-app-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./firebase-config.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Firebase等の通信はそのままネットワークへ
  if (e.request.url.includes("firebase") || e.request.url.includes("googleapis") || e.request.url.includes("gstatic")) {
    return;
  }
  // ネットワーク優先：最新を取得し、取れた場合はキャッシュも更新。失敗時のみキャッシュ。
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
