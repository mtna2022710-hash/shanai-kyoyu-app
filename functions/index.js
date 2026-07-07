// ============================================================
//  社内共有アプリ  プッシュ通知送信（Cloud Functions）
//  entries の新規作成・コメント追加を検知して全端末へ送信
// ============================================================
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

const REGION = "asia-northeast1";

// 登録済みの全端末（本人以外）へプッシュ送信
async function sendToAll(excludeUid, title, body, tag) {
  const snap = await getFirestore().collection("fcmTokens").get();
  const tokens = snap.docs
    .filter((d) => d.data().uid !== excludeUid)
    .map((d) => d.id);
  if (tokens.length === 0) return;

  const res = await getMessaging().sendEachForMulticast({
    tokens,
    data: { title, body, tag },
    webpush: { headers: { Urgency: "high", TTL: "86400" } },
  });

  // 無効になったトークンを掃除
  const deletions = [];
  res.responses.forEach((r, i) => {
    const code = r.error && r.error.code;
    if (!r.success && (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-argument")) {
      deletions.push(getFirestore().collection("fcmTokens").doc(tokens[i]).delete());
    }
  });
  await Promise.all(deletions);
}

// 新規タスク登録 → 通知
exports.onEntryCreated = onDocumentCreated(
  { document: "entries/{id}", region: REGION },
  async (event) => {
    const d = event.data.data();
    if (!d) return;
    await sendToAll(d.authorUid, "新しい業務連絡", `${d.authorName}さん：${d.comment}`, event.params.id);
  }
);

// コメント追加 → 通知
exports.onEntryUpdated = onDocumentUpdated(
  { document: "entries/{id}", region: REGION },
  async (event) => {
    const before = event.data.before.data() || {};
    const after = event.data.after.data() || {};
    const b = before.comments || [];
    const a = after.comments || [];
    if (a.length > b.length) {
      const c = a[a.length - 1];
      await sendToAll(c.uid, "💬 コメントが届きました", `${c.name}さん：${c.text}（${after.comment}）`, `${event.params.id}-c${a.length}`);
    }
  }
);
