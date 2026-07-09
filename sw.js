// シンプルなサービスワーカー（PWAインストール対応）
// 方式：ネットワーク優先（オンライン時は常に最新を取得、オフライン時のみキャッシュ）
const CACHE = "shanai-app-v5";
const ASSETS = [
  "./",
  "./index.html",
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
  // FirebaseのAPI通信は常にネットワークへ
  if (e.request.url.includes("firebase") || e.request.url.includes("googleapis") || e.request.url.includes("gstatic")) {
    return;
  }
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

// ---- サーバーからのプッシュ受信（アプリが閉じていてもOSが起動してくれる）----
self.addEventListener("push", (e) => {
  let payload = {};
  try { payload = e.data.json(); } catch (err) {}
  const d = payload.data || {};
  const title = d.title || "Olinks";
  const body = d.body || "";
  e.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body,
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: d.tag || undefined,
    });
    // アイコンバッジを+1（アプリを開くと正確な数に再計算されます）
    try {
      const c = await caches.open("badge-count");
      const res = await c.match("./badge");
      let count = res ? parseInt(await res.text(), 10) || 0 : 0;
      count++;
      await c.put("./badge", new Response(String(count)));
      if (self.navigator && self.navigator.setAppBadge) await self.navigator.setAppBadge(count);
    } catch (err) {}
  })());
});

// 通知をタップしたらアプリを開く／前面にする
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      return clients.openWindow("./");
    })
  );
});
