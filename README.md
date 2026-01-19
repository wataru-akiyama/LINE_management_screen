# MOISH LINE公式アカウント管理画面

高校サッカー選手の進路支援サービス「MOISH」のLINE公式アカウント管理システムです。

## 📋 概要

LINE公式アカウントを通じて登録されたユーザーの管理、チャット対応、メッセージ配信を一元的に行う管理画面です。

## ✨ 主な機能

### ユーザー管理
- ユーザー一覧の表示・検索・フィルタリング
- ユーザー詳細情報の閲覧・編集
- タグ管理（システムタグ・カスタムタグ）
- プラン管理（FREE / BASIC）

### ユーザー分析
- 📊 **能力値チャート** - レーダーチャートで特性を可視化
- 🗓️ **活動ヒートマップ** - GitHubスタイルのアクティビティカレンダー
- 📅 **活動タイムライン** - 時系列でのアクション履歴
- 🔥 **エンゲージメントスコア** - 総合的な活動度評価
- 💡 **ネクストアクション** - システムによる推奨アクション
- 👥 **類似ユーザー表示** - 同じ属性・診断結果のユーザー

### チャット
- リアルタイムメッセージ履歴表示
- 管理画面からの返信送信
- 未読メッセージ通知

### 配信機能
- 一斉配信
- セグメント配信（条件指定）
- 予約配信
- ステップ配信（登録日起点）

### コンテンツ管理
- リッチメニュー管理
- 診断テンプレート管理
- アンケート管理
- オンボーディングフロー設定

## 🛠️ 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 19.x | UIフレームワーク |
| TypeScript | 5.x | 型安全な開発 |
| Vite | 7.x | ビルドツール |
| Tailwind CSS | 3.x | スタイリング |
| React Router | 7.x | ルーティング |
| Tanstack Query | 5.x | データフェッチング |
| Zustand | 5.x | 状態管理 |
| date-fns | 4.x | 日付操作 |

### バックエンド
| 技術 | 用途 |
|------|------|
| Google Apps Script | APIサーバー、Webhook受信 |
| Google スプレッドシート | データストア |
| LINE Messaging API | メッセージ送受信 |

## 📁 ディレクトリ構成

```
LINE_management_screen/
├── app/                    # フロントエンド（React + Vite）
│   ├── src/
│   │   ├── api/           # APIクライアント
│   │   ├── components/    # UIコンポーネント
│   │   │   ├── analytics/ # 分析コンポーネント
│   │   │   ├── chat/      # チャット関連
│   │   │   ├── common/    # 共通UI
│   │   │   ├── layout/    # レイアウト
│   │   │   └── onboarding/# オンボーディング
│   │   ├── mocks/         # モックデータ
│   │   ├── pages/         # ページコンポーネント
│   │   ├── store/         # 状態管理
│   │   └── types/         # 型定義
│   └── package.json
├── gas/                    # バックエンド（Google Apps Script）
│   ├── Code.gs            # メインAPI
│   ├── Users.gs           # ユーザー管理API
│   ├── RichMenus.gs       # リッチメニューAPI
│   ├── DiagnosisTemplates.gs  # 診断API
│   ├── Surveys.gs         # アンケートAPI
│   └── OnboardingFlow.gs  # オンボーディングAPI
└── docs/                   # ドキュメント
    └── MOISH_requirements.md  # 詳細仕様書
```

## 🚀 セットアップ

### フロントエンド

```bash
# 依存関係のインストール
cd app
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build
```

### 環境変数

`.env` ファイルを `app/` ディレクトリに作成:

```env
VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_API_KEY=your_api_key
```

### バックエンド（Google Apps Script）

1. [Google Apps Script](https://script.google.com) で新規プロジェクトを作成
2. `gas/` ディレクトリ内のファイルをコピー
3. スクリプトプロパティに以下を設定:
   - `SPREADSHEET_ID`: データ用スプレッドシートのID
   - `LINE_CHANNEL_ACCESS_TOKEN`: LINEチャネルアクセストークン
   - `API_KEY`: 認証用APIキー
4. Webアプリとしてデプロイ

## 📖 詳細ドキュメント

詳細な仕様については [docs/MOISH_requirements.md](./docs/MOISH_requirements.md) を参照してください。

## 📄 ライセンス

Private - All rights reserved
