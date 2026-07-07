# 社内共有アプリ 📋

スケジュール・タスク・業務連絡をみんなで共有するためのアプリです。
PC・スマホどちらのブラウザからでも使えます（PWA対応）。

---

## ✨ 機能

| タブ | できること |
|------|-----------|
| 🏠 **ホーム** | 日付を選んでコメントを入力するだけ。スケジュールと業務連絡に自動反映。 |
| 📅 **月間スケジュール** | 当月＋2ヶ月分を表示。カレンダー / リスト表示を切り替え可能。 |
| 📢 **業務連絡** | 入力者の名前と日時が自動で記録。新しい順に表示。 |

- **ログイン制**：名前・メール・パスワードで登録 → 入力時に名前が自動で付きます
- **既読機能**：コメントをタップ →「確認しました」を押すと、既読マーク＋名前が全員に表示されます
- **リアルタイム同期**：誰かが登録すると、全員の画面に即反映されます

---

## 🚀 使い始めるための準備（初回のみ・約15分）

このアプリを動かすには **Firebase（Google）の無料設定** が必要です。
以下の手順どおりに進めてください。

### ① Firebaseプロジェクトを作る

1. [https://console.firebase.google.com/](https://console.firebase.google.com/) にGoogleアカウントでログイン
2. 「プロジェクトを追加」→ 好きな名前（例：`shanai-app`）を入力して作成

### ② Webアプリを登録する

1. プロジェクト画面の「</>（ウェブ）」アイコンをクリック
2. アプリのニックネーム（例：社内共有）を入力して「登録」
3. 表示される `firebaseConfig` の値をコピー
4. **`firebase-config.js`** を開いて、コピーした値を貼り付ける

```js
export const firebaseConfig = {
  apiKey: "AIza...",            // ← 実際の値に置き換え
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234:web:abcd"
};
```

### ③ ログイン機能（Authentication）を有効化

1. 左メニュー「構築 > Authentication」→「始める」
2. 「ログイン方法」タブ →「メール / パスワード」を**有効**にして保存

### ④ データベース（Firestore）を作る

1. 左メニュー「構築 > Firestore Database」→「データベースの作成」
2. ロケーションは **asia-northeast1（東京）** を選択
3. 「本番環境モード」で開始
4. 作成後「ルール」タブを開き、**`firestore.rules` の中身を貼り付けて公開**

### ⑤ 料金プランを Blaze にアップグレード（無料枠あり）

1. 左下「アップグレード」→ **Blazeプラン** を選択
2. クレジットカードを登録
   - ※ **無料枠（5GB等）に収まれば請求は0円**です
   - ※ 画像・ファイル送信を使う場合に必要な設定です

---

## 💻 アプリの動かし方

### お試し（自分のPCで確認）

ターミナルでこのフォルダを開いて：

```bash
cd 社内共有アプリ
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開く

### 本番公開（全員で使う）

無料で公開できる **Firebase Hosting** がおすすめです：

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # 公開フォルダはこのフォルダを指定
firebase deploy
```

公開後に発行されるURL（例：`https://xxx.web.app`）を社員に共有すればOK。
スマホでURLを開き「ホーム画面に追加」すると、アプリのように使えます。

---

## 📁 ファイル構成

```
社内共有アプリ/
├── index.html          画面の構造
├── styles.css          デザイン
├── app.js              動作ロジック（Firebase連携）
├── firebase-config.js  ★ Firebaseの設定（要編集）
├── firestore.rules     データベースのセキュリティルール
├── manifest.json       PWA設定
├── sw.js               オフライン対応
├── icon-192.png        アイコン
├── icon-512.png        アイコン
└── README.md           このファイル
```

---

## 🔒 セキュリティについて

- 通信はすべて暗号化（SSL/TLS）
- ログインしたユーザーだけがデータを読み書きできます
- 業務連絡の本文・日付・入力者は、後から改ざんできない設定です
- データは東京リージョン（日本国内）に保存されます

---

## ❓ 困ったときは

- **ログインできない** → Authenticationで「メール/パスワード」が有効か確認
- **データが表示されない** → `firebase-config.js` の値とFirestoreルールを確認
- **「Missing or insufficient permissions」エラー** → Firestoreルールが正しく公開されているか確認

ご不明点があればいつでもサポートします。
