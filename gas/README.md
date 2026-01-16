# GASバックエンド セットアップ手順書

このドキュメントでは、MOISH LINE管理画面のGoogle Apps Script (GAS) バックエンドをセットアップする手順を説明します。

---

## 必要なもの

- Googleアカウント
- LINE Developers Console のアカウント
- LINE公式アカウント（既存または新規作成）

---

## 1. スプレッドシートの作成

1. [Google スプレッドシート](https://sheets.google.com) で新規スプレッドシートを作成
2. スプレッドシートの名前を「MOISH_DB」などに変更
3. URLからスプレッドシートIDをコピー（`https://docs.google.com/spreadsheets/d/【ここがID】/edit`）

---

## 2. GASプロジェクトの作成

### 方法A: スプレッドシートから作成（推奨）

1. 作成したスプレッドシートを開く
2. メニューから「拡張機能」→「Apps Script」を選択
3. GASエディタが開く

### 方法B: clasp でローカルからデプロイ

```bash
# claspをインストール
npm install -g @google/clasp

# Googleアカウントにログイン
clasp login

# 新規GASプロジェクトを作成
cd gas
clasp create --title "MOISH Backend" --type webapp

# コードをプッシュ
clasp push
```

---

## 3. コードのコピー

`gas/` フォルダ内の以下のファイルの内容をGASエディタにコピー：

- `Code.gs` - メインエントリーポイント
- `Users.gs` - ユーザー管理API
- `Messages.gs` - メッセージ管理API
- `Delivery.gs` - 配信機能API
- `Webhook.gs` - LINE Webhook処理
- `StepDelivery.gs` - ステップ配信設定

> **注意**: GASでは各ファイルを新規ファイルとして追加します（「+」ボタン → 「スクリプト」）

---

## 4. スクリプトプロパティの設定

1. GASエディタで「プロジェクトの設定」（歯車アイコン）をクリック
2. 「スクリプト プロパティ」セクションで以下を追加:

| プロパティ名 | 値 | 説明 |
|-------------|-----|------|
| `SPREADSHEET_ID` | スプレッドシートのID | 手順1でコピーしたID |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging APIのトークン | 手順6で取得 |
| `LINE_CHANNEL_SECRET` | LINEチャネルシークレット | 手順6で取得 |
| `API_KEY` | 任意の文字列（例: `moish-api-2025-secure-key`） | フロントエンド認証用 |

---

## 5. 初期セットアップの実行

1. GASエディタで `setupSpreadsheet` 関数を選択
2. 「実行」ボタンをクリック
3. 初回実行時は権限の承認が必要 → 「権限を確認」→ アカウント選択 → 「許可」
4. スプレッドシートに5つのシートが自動作成されることを確認

---

## 6. LINE Developers Console の設定

1. [LINE Developers Console](https://developers.line.biz/) にアクセス
2. プロバイダーを選択（または新規作成）
3. Messaging API チャネルを選択（または新規作成）

### チャネル設定

- **チャネルアクセストークン**: 「Messaging API設定」→「チャネルアクセストークン（長期）」を発行
- **チャネルシークレット**: 「チャネル基本設定」から取得

### Webhook設定

1. 「Messaging API設定」→「Webhook URL」に以下を設定:
   ```
   https://script.google.com/macros/s/【デプロイID】/exec
   ```
2. 「Webhookの利用」をオンに設定
3. 「応答メッセージ」をオフに設定（管理画面から返信するため）

---

## 7. Webアプリとしてデプロイ

1. GASエディタで「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で「ウェブアプリ」を選択
3. 設定:
   - **説明**: 「MOISH Backend v1.0」など
   - **次のユーザーとして実行**: 「自分」
   - **アクセスできるユーザー**: 「全員」
4. 「デプロイ」をクリック
5. 表示される**ウェブアプリURL**をコピー

---

## 8. フロントエンドの接続

1. フロントエンドの `.env` ファイルを作成:

```bash
cd app
cp .env.example .env
```

2. `.env` を編集:

```
VITE_API_BASE_URL=https://script.google.com/macros/s/【デプロイID】/exec
VITE_API_KEY=moish-api-2025-secure-key
```

3. 開発サーバーを再起動:

```bash
npm run dev
```

---

## 9. トリガーの設定（オプション）

予約配信とステップ配信を自動実行するためのトリガーを設定します。

1. GASエディタで `setupScheduledDeliveryTrigger` を実行 → 5分ごとに予約配信をチェック
2. `setupStepDeliveryTrigger` を実行 → 毎日9時にステップ配信を実行

---

## トラブルシューティング

### 「認証エラー」が表示される

- `.env` の `VITE_API_KEY` がGASの `API_KEY` プロパティと一致しているか確認
- デプロイ後にURLが変わっていないか確認

### メッセージが送信されない

- LINE チャネルアクセストークンが正しく設定されているか確認
- LINEユーザーがチャネルをブロックしていないか確認

### スプレッドシートにデータが保存されない

- スプレッドシートIDが正しいか確認
- GASに適切な権限があるか確認（初回実行時に承認が必要）

---

## 動作確認

1. フロントエンド（http://localhost:5173/）にアクセス
2. ダッシュボードに統計情報が表示されれば成功
3. LINE公式アカウントにメッセージを送信し、チャット履歴に表示されれば完了

---

## 次のステップ

1. 本番環境へのフロントエンドデプロイ（Vercel推奨）
2. テストユーザーでの動作確認
3. 本番運用開始
