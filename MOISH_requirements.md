# MOISH LINE公式アカウント管理画面 システム設計仕様書

**Version 1.0**  
**2025年1月14日**

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [システムアーキテクチャ](#2-システムアーキテクチャ)
3. [技術スタック](#3-技術スタック)
4. [データベース設計（スプレッドシート）](#4-データベース設計スプレッドシート)
5. [API設計（Google Apps Script）](#5-api設計google-apps-script)
6. [フロントエンド設計（React）](#6-フロントエンド設計react)
7. [画面設計](#7-画面設計)
8. [機能詳細仕様](#8-機能詳細仕様)
9. [セキュリティ設計](#9-セキュリティ設計)
10. [実装ロードマップ](#10-実装ロードマップ)
11. [運用・保守](#11-運用保守)

---

## 1. プロジェクト概要

### 1.1 背景・目的

MOISHは高校サッカー選手の進路支援を行うサービスであり、LINE公式アカウントを通じてユーザーとコミュニケーションを行っている。現在、LINE公式アカウントの標準管理画面ではユーザー管理機能が限定的であり、以下の課題がある。

- ユーザーのプロフィール情報を一元管理できない
- タグ付けの自動化ができない
- チャット履歴の検索・管理が困難
- アンケートデータとユーザー情報の紐付けができない
- 柔軟な条件でのメッセージ配信ができない

本プロジェクトでは、これらの課題を解決するため、独自の管理画面を開発する。

### 1.2 対象ユーザー

| ユーザー種別 | 説明 |
|-------------|------|
| 管理者（MOISHスタッフ） | ユーザー管理、メッセージ配信を行う |
| エンドユーザー（高校サッカー選手） | LINE経由でサービスを利用 |

### 1.3 主要機能一覧

| 機能カテゴリ | 機能名 | 概要 |
|-------------|--------|------|
| ユーザー管理 | ユーザー一覧表示 | 登録ユーザーの一覧表示、検索、フィルタリング |
| ユーザー管理 | ユーザー詳細表示 | 個別ユーザーのプロフィール、タグ、履歴表示 |
| ユーザー管理 | タグ管理 | ユーザーへのタグ付け、タグによる絞り込み |
| ユーザー管理 | プラン管理 | FREE/BASICプランの変更 |
| チャット | チャット履歴表示 | ユーザーとのメッセージ履歴表示 |
| チャット | メッセージ返信 | 管理画面からユーザーへの返信送信 |
| 配信 | 一斉配信 | 全ユーザーへのメッセージ配信 |
| 配信 | セグメント配信 | タグ・条件による絞り込み配信 |
| 配信 | 予約配信 | 指定日時でのメッセージ配信 |
| 配信 | ステップ配信 | 登録日からの経過日数に基づく自動配信 |
| アンケート | 回答紐付け | アンケート回答とユーザー情報の紐付け表示 |

---

## 2. システムアーキテクチャ

### 2.1 全体構成

本システムは、フロントエンド（React）、バックエンド（Google Apps Script）、データストア（Google スプレッドシート）、外部サービス（LINE Messaging API）で構成される。

#### システム構成図

```
┌─────────────────────────────────────────────────────────┐
│  React 管理画面（Vercel）                                │
│  - ユーザー管理UI                                        │
│  - チャットUI                                           │
│  - 配信管理UI                                           │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS (REST API)
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Google Apps Script（Web App）                           │
│  - API エンドポイント                                    │
│  - LINE Messaging API 連携                              │
│  - Webhook 受信                                         │
└─────────────────┬───────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌─────────────┐
│ Sheets │  │ LINE API │  │ GASトリガー │
│ (DB)   │  │ (配信)   │  │ (予約配信)  │
└────────┘  └──────────┘  └─────────────┘
```

### 2.2 データフロー

#### ユーザーからのメッセージ受信

```
LINE User → LINE Platform → Webhook → GAS → スプレッドシート保存
                                       ↓
                             React（ポーリングで取得）
```

#### 管理者からのメッセージ送信

```
React → GAS API → LINE Messaging API → LINE User
           ↓
    スプレッドシート保存（送信ログ）
```

---

## 3. 技術スタック

### 3.1 フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 18.x | UIフレームワーク |
| TypeScript | 5.x | 型安全な開発 |
| Vite | 5.x | ビルドツール |
| Tailwind CSS | 3.x | スタイリング |
| React Router | 6.x | ルーティング |
| Tanstack Query | 5.x | データフェッチング・キャッシュ |
| Zustand | 4.x | 状態管理 |
| date-fns | 3.x | 日付操作 |

### 3.2 バックエンド

| 技術 | 用途 |
|------|------|
| Google Apps Script | APIサーバー、Webhook受信 |
| Google スプレッドシート | データストア |
| LINE Messaging API | メッセージ送受信 |

### 3.3 インフラ・ホスティング

| サービス | 用途 | 費用 |
|---------|------|------|
| Vercel | フロントエンドホスティング | 無料（Hobbyプラン） |
| Google Apps Script | バックエンドホスティング | 無料 |
| Google スプレッドシート | データベース | 無料 |
| LINE Messaging API | メッセージ配信 | 月200通まで無料 |

---

## 4. データベース設計（スプレッドシート）

データはGoogle スプレッドシートで管理する。各シートの設計を以下に示す。

### 4.1 users シート

ユーザーの基本情報を管理するシート。LINE友達追加時に自動で行が追加される。

| カラム名 | 型 | 説明 | 例 |
|---------|-----|------|-----|
| userId | String | LINE User ID（主キー） | U7d782f128a899caa... |
| name | String | ユーザー名 | 秋山 航 |
| grade | String | 学年 | 高1 / 高2 / 高3 |
| region | String | 地域 | 関東 |
| prefecture | String | 都道府県 | 東京都 |
| teamName | String | チーム名 | テストチーム |
| plan | String | プラン | FREE / BASIC |
| lineId | String | LINE ID表示用 | line:U7d782f... |
| registeredAt | DateTime | 登録日時 | 2025/12/06 11:37:44 |
| updatedAt | DateTime | 更新日時 | 2025/12/06 12:21:05 |
| universities | String | 志望校（JSON配列） | ["筑波大学","早稲田大学"] |
| diagnosisType | String | 診断結果タイプ | リーダータイプ |
| diagnosisCompletedAt | DateTime | 診断完了日時 | 2025/12/06 13:00:00 |
| customTags | String | カスタムタグ（JSON配列） | ["要フォロー","体験参加済"] |

### 4.2 messages シート

チャットメッセージの履歴を管理するシート。Webhook受信時に自動保存される。

| カラム名 | 型 | 説明 | 例 |
|---------|-----|------|-----|
| messageId | String | メッセージID（主キー） | msg_12345 |
| userId | String | LINE User ID（外部キー） | U7d782f128a899caa... |
| direction | String | 送信方向 | incoming / outgoing |
| messageType | String | メッセージ種別 | text / image / sticker |
| content | String | メッセージ内容 | 進路について相談したいです |
| mediaUrl | String | メディアURL（画像等） | https://... |
| sentAt | DateTime | 送信日時 | 2025/12/06 11:40:00 |
| sentBy | String | 送信者（outgoingの場合） | admin@example.com |

### 4.3 surveys シート

アンケート回答を管理するシート。

| カラム名 | 型 | 説明 | 例 |
|---------|-----|------|-----|
| surveyId | String | アンケートID（主キー） | survey_001 |
| userId | String | LINE User ID（外部キー） | U7d782f128a899caa... |
| surveyType | String | アンケート種別 | 満足度調査 / 進路希望 |
| answers | String | 回答内容（JSON） | {"q1":"5","q2":"はい"} |
| submittedAt | DateTime | 回答日時 | 2025/12/06 14:00:00 |

### 4.4 delivery_logs シート

メッセージ配信の履歴を管理するシート。

| カラム名 | 型 | 説明 | 例 |
|---------|-----|------|-----|
| deliveryId | String | 配信ID（主キー） | del_20251206_001 |
| deliveryType | String | 配信タイプ | broadcast / segment / individual |
| targetFilter | String | 対象フィルタ条件（JSON） | {"grade":"高3"} |
| targetCount | Number | 配信対象者数 | 150 |
| messageContent | String | 配信内容（JSON） | {"type":"text",...} |
| status | String | 配信ステータス | pending / sent / failed |
| scheduledAt | DateTime | 予約日時 | 2025/12/07 10:00:00 |
| sentAt | DateTime | 実行日時 | 2025/12/07 10:00:05 |
| createdBy | String | 作成者 | admin@example.com |
| createdAt | DateTime | 作成日時 | 2025/12/06 15:00:00 |

### 4.5 step_delivery_config シート

ステップ配信の設定を管理するシート。

| カラム名 | 型 | 説明 | 例 |
|---------|-----|------|-----|
| stepId | String | ステップID（主キー） | step_001 |
| stepName | String | ステップ名 | 登録3日後フォロー |
| daysAfterRegistration | Number | 登録後日数 | 3 |
| targetFilter | String | 対象フィルタ（JSON） | {"plan":"FREE"} |
| messageContent | String | 配信内容（JSON） | {"type":"text",...} |
| isActive | Boolean | 有効/無効 | TRUE |
| createdAt | DateTime | 作成日時 | 2025/12/01 10:00:00 |

---

## 5. API設計（Google Apps Script）

Google Apps ScriptをWeb Appとしてデプロイし、REST APIを提供する。

### 5.1 認証方式

APIの認証には、リクエストヘッダーに含めるAPIキーを使用する。

```
Authorization: Bearer {API_KEY}
```

APIキーはGASのスクリプトプロパティに保存し、各リクエストで検証する。

### 5.2 共通レスポンス形式

#### 成功時

```json
{
  "success": true,
  "data": { ... }
}
```

#### エラー時

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

### 5.3 エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/users | ユーザー一覧取得 |
| GET | /api/users/:userId | ユーザー詳細取得 |
| PUT | /api/users/:userId | ユーザー情報更新 |
| GET | /api/users/:userId/messages | チャット履歴取得 |
| POST | /api/users/:userId/messages | メッセージ送信 |
| GET | /api/statistics | 統計情報取得 |
| POST | /api/delivery/broadcast | 一斉配信 |
| POST | /api/delivery/segment | セグメント配信 |
| POST | /api/delivery/schedule | 予約配信作成 |
| GET | /api/delivery/logs | 配信履歴取得 |
| GET | /api/step-delivery | ステップ配信設定一覧 |
| POST | /api/step-delivery | ステップ配信設定作成 |
| PUT | /api/step-delivery/:stepId | ステップ配信設定更新 |
| POST | /webhook | LINE Webhook受信 |

### 5.4 API詳細仕様

#### GET /api/users - ユーザー一覧取得

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| search | String | No | 名前・チーム名での検索 |
| grade | String | No | 学年フィルタ（高1/高2/高3） |
| region | String | No | 地域フィルタ |
| plan | String | No | プランフィルタ（FREE/BASIC） |
| page | Number | No | ページ番号（デフォルト: 1） |
| limit | Number | No | 取得件数（デフォルト: 50） |

**レスポンス例:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "U7d782f128a899caa...",
        "name": "秋山 航",
        "grade": "高1",
        "region": "関東",
        "prefecture": "東京都",
        "teamName": "テストチーム",
        "plan": "BASIC",
        "registeredAt": "2025-12-06T11:37:44Z",
        "hasUnreadMessages": true
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 50,
      "totalPages": 3
    }
  }
}
```

#### GET /api/users/:userId - ユーザー詳細取得

**パスパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| userId | String | Yes | LINE User ID |

**レスポンス例:**

```json
{
  "success": true,
  "data": {
    "userId": "U7d782f128a899caa...",
    "name": "秋山 航",
    "grade": "高1",
    "region": "関東",
    "prefecture": "東京都",
    "teamName": "テストチーム",
    "plan": "BASIC",
    "registeredAt": "2025-12-06T11:37:44Z",
    "updatedAt": "2025-12-06T12:21:05Z",
    "universities": ["筑波大学", "早稲田大学"],
    "diagnosis": {
      "type": "リーダータイプ",
      "completedAt": "2025-12-06T13:00:00Z"
    },
    "customTags": ["要フォロー"],
    "surveys": [...]
  }
}
```

#### PUT /api/users/:userId - ユーザー情報更新

**リクエストボディ:**

```json
{
  "name": "秋山 航（更新後）",
  "plan": "BASIC",
  "customTags": ["要フォロー", "体験参加済"],
  "universities": ["筑波大学", "早稲田大学", "順天堂大学"]
}
```

#### GET /api/users/:userId/messages - チャット履歴取得

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| limit | Number | No | 取得件数（デフォルト: 50） |
| before | DateTime | No | この日時より前のメッセージを取得 |

**レスポンス例:**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_001",
        "direction": "incoming",
        "messageType": "text",
        "content": "進路について相談したいです",
        "sentAt": "2025-12-06T11:40:00Z"
      },
      {
        "messageId": "msg_002",
        "direction": "outgoing",
        "messageType": "text",
        "content": "もちろんです！どんなことでお悩みですか？",
        "sentAt": "2025-12-06T11:45:00Z",
        "sentBy": "admin@example.com"
      }
    ],
    "hasMore": false
  }
}
```

#### POST /api/users/:userId/messages - メッセージ送信

**リクエストボディ（テキスト）:**

```json
{
  "messageType": "text",
  "content": "ご連絡ありがとうございます。"
}
```

**リクエストボディ（画像）:**

```json
{
  "messageType": "image",
  "originalContentUrl": "https://example.com/image.jpg",
  "previewImageUrl": "https://example.com/image_preview.jpg"
}
```

#### POST /api/delivery/segment - セグメント配信

**リクエストボディ:**

```json
{
  "filter": {
    "grade": "高3",
    "region": "関東",
    "plan": "BASIC"
  },
  "message": {
    "type": "text",
    "text": "高3のBASICプランの皆さんへお知らせです。"
  }
}
```

#### POST /webhook - LINE Webhook受信

LINE Platformからのイベントを受信し、処理する。

**処理するイベント:**

| イベントタイプ | 処理内容 |
|---------------|---------|
| follow | 新規ユーザーをusersシートに追加 |
| unfollow | ユーザーのステータスを「ブロック」に更新 |
| message | メッセージをmessagesシートに保存 |
| postback | ポストバックデータに応じた処理 |

---

## 6. フロントエンド設計（React）

### 6.1 ディレクトリ構成

```
src/
├── components/
│   ├── common/          # 共通コンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── TagBadge.tsx
│   │   └── PlanBadge.tsx
│   ├── layout/          # レイアウト
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── users/           # ユーザー管理
│   │   ├── UserList.tsx
│   │   ├── UserCard.tsx
│   │   ├── UserDetail.tsx
│   │   ├── UserFilters.tsx
│   │   └── UserEditModal.tsx
│   ├── chat/            # チャット
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   └── MessageInput.tsx
│   └── delivery/        # 配信
│       ├── DeliveryForm.tsx
│       ├── DeliveryHistory.tsx
│       ├── TargetSelector.tsx
│       └── StepDeliveryConfig.tsx
├── pages/               # ページ
│   ├── Dashboard.tsx
│   ├── Users.tsx
│   ├── Chat.tsx
│   ├── Delivery.tsx
│   └── Settings.tsx
├── hooks/               # カスタムフック
│   ├── useUsers.ts
│   ├── useMessages.ts
│   └── useDelivery.ts
├── api/                 # API クライアント
│   ├── client.ts
│   ├── users.ts
│   ├── messages.ts
│   └── delivery.ts
├── store/               # 状態管理
│   └── useStore.ts
├── types/               # 型定義
│   └── index.ts
└── utils/               # ユーティリティ
    └── helpers.ts
```

### 6.2 主要コンポーネント仕様

#### UserList.tsx

ユーザー一覧を表示するコンポーネント。

| Props | 型 | 説明 |
|-------|-----|------|
| users | User[] | 表示するユーザー配列 |
| isLoading | boolean | ローディング状態 |
| onUserClick | (userId: string) => void | ユーザークリック時のハンドラ |
| onPageChange | (page: number) => void | ページ変更時のハンドラ |

#### ChatWindow.tsx

チャット画面を表示するコンポーネント。

| Props | 型 | 説明 |
|-------|-----|------|
| userId | string | 対象ユーザーID |
| messages | Message[] | メッセージ配列 |
| onSendMessage | (content: string) => void | メッセージ送信ハンドラ |
| isLoading | boolean | ローディング状態 |

#### DeliveryForm.tsx

メッセージ配信フォームコンポーネント。

| Props | 型 | 説明 |
|-------|-----|------|
| deliveryType | DeliveryType | 配信タイプ（broadcast/segment） |
| onSubmit | (data: DeliveryData) => void | 送信ハンドラ |
| isSubmitting | boolean | 送信中状態 |

### 6.3 型定義

```typescript
// types/index.ts

export interface User {
  userId: string;
  name: string;
  grade: '高1' | '高2' | '高3';
  region: string;
  prefecture: string;
  teamName: string;
  plan: 'FREE' | 'BASIC';
  registeredAt: string;
  updatedAt: string;
  universities?: string[];
  diagnosis?: {
    type: string;
    completedAt: string;
  };
  customTags?: string[];
}

export interface Message {
  messageId: string;
  userId: string;
  direction: 'incoming' | 'outgoing';
  messageType: 'text' | 'image' | 'sticker';
  content: string;
  mediaUrl?: string;
  sentAt: string;
  sentBy?: string;
}

export interface DeliveryLog {
  deliveryId: string;
  deliveryType: 'broadcast' | 'segment' | 'individual';
  targetFilter?: Record<string, string>;
  targetCount: number;
  messageContent: object;
  status: 'pending' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface StepDeliveryConfig {
  stepId: string;
  stepName: string;
  daysAfterRegistration: number;
  targetFilter?: Record<string, string>;
  messageContent: object;
  isActive: boolean;
  createdAt: string;
}

export interface Survey {
  surveyId: string;
  userId: string;
  surveyType: string;
  answers: Record<string, string>;
  submittedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

### 6.4 APIクライアント実装

```typescript
// api/client.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// api/users.ts

import { apiClient } from './client';
import type { User, ApiResponse, Pagination } from '../types';

export interface GetUsersParams {
  search?: string;
  grade?: string;
  region?: string;
  plan?: string;
  page?: number;
  limit?: number;
}

export async function getUsers(params: GetUsersParams = {}) {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  
  return apiClient<ApiResponse<{ users: User[]; pagination: Pagination }>>(
    `/api/users?${query}`
  );
}

export async function getUser(userId: string) {
  return apiClient<ApiResponse<User>>(`/api/users/${userId}`);
}

export async function updateUser(userId: string, data: Partial<User>) {
  return apiClient<ApiResponse<User>>(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
```

---

## 7. 画面設計

### 7.1 画面一覧

| 画面名 | パス | 説明 |
|-------|------|------|
| ダッシュボード | / | 統計情報、最新アクティビティ表示 |
| ユーザー一覧 | /users | ユーザーの一覧表示・検索・フィルタリング |
| ユーザー詳細 | /users/:userId | 個別ユーザーの詳細情報表示 |
| チャット | /users/:userId/chat | ユーザーとのチャット画面 |
| 配信作成 | /delivery/new | 新規メッセージ配信の作成 |
| 配信履歴 | /delivery/history | 過去の配信履歴一覧 |
| ステップ配信設定 | /delivery/step | ステップ配信の設定管理 |
| 設定 | /settings | システム設定 |

### 7.2 ダッシュボード画面

ログイン後に最初に表示される画面。システム全体の状況を把握できる。

**表示要素:**

- 統計カード: 総ユーザー数、BASIC数、FREE数、高3数、診断完了数
- 最新メッセージ一覧: 直近の受信メッセージ（未読優先）
- 配信予定: 予約中の配信一覧
- 新規登録グラフ: 日別の新規登録推移

### 7.3 ユーザー一覧画面

**表示要素:**

- 検索バー: 名前、チーム名、LINE IDでの検索
- フィルターパネル: 学年、地域、プラン、チームでの絞り込み
- ユーザーカード: アバター、名前、チーム、タグバッジ、プランバッジ
- ページネーション: 50件ごとのページ切り替え
- ソート: 登録日順、更新日順、名前順

### 7.4 ユーザー詳細画面（モーダル）

**タブ構成:**

| タブ名 | 表示内容 |
|-------|---------|
| プロフィール | 基本情報、タグ、志望校、診断結果、メタ情報 |
| チャット履歴 | ユーザーとのメッセージ履歴、返信入力欄 |
| アンケート | 回答済みアンケートの一覧と回答内容 |

**プロフィールタブの編集機能:**

- 名前の変更
- プランの変更（FREE ↔ BASIC）
- カスタムタグの追加・削除
- 志望校の追加・削除

### 7.5 チャット画面

**レイアウト:**

```
┌─────────────────────────────────────────────┐
│ ← ユーザー名                        プラン │
│    チーム名 / 学年                          │
├─────────────────────────────────────────────┤
│                                             │
│   ┌─────────────────────┐                   │
│   │ ユーザーメッセージ  │  日時             │
│   └─────────────────────┘                   │
│                                             │
│                  ┌─────────────────────┐    │
│              日時│ 管理者メッセージ    │    │
│                  └─────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐ [送信] │
│ │ メッセージ入力欄                 │        │
│ └─────────────────────────────────┘        │
└─────────────────────────────────────────────┘
```

**機能:**

- メッセージ履歴の時系列表示（古い順）
- テキストメッセージの送信
- 画像の表示（受信した場合）
- 自動スクロール（新着メッセージ時）
- ポーリングによる新着確認（5秒間隔）

### 7.6 配信作成画面

**ステップ:**

1. 配信タイプ選択: 全体配信 / セグメント配信 / 予約配信
2. 対象選択: フィルター条件の設定（セグメント配信の場合）
3. メッセージ作成: テキスト入力、プレビュー表示
4. 日時設定: 予約配信の場合のみ
5. 確認・送信: 対象者数の表示、最終確認

---

## 8. 機能詳細仕様

### 8.1 ユーザー管理機能

#### 8.1.1 自動タグ付け

友達追加時に収集したプロフィール情報を基に、自動的にタグを設定する。

| タグ種別 | 設定タイミング | 値 |
|---------|---------------|-----|
| 学年タグ | プロフィール登録時 | 高1 / 高2 / 高3 |
| 地域タグ | プロフィール登録時 | 北海道 / 東北 / 関東 / ... |
| 都道府県タグ | プロフィール登録時 | 東京都 / 神奈川県 / ... |
| チームタグ | プロフィール登録時 | チーム名 |
| プランタグ | プラン変更時 | FREE / BASIC |
| 診断タグ | 診断完了時 | リーダータイプ / サポータータイプ / ... |

#### 8.1.2 プラン変更

管理画面からユーザーのプランを変更できる。

**変更時の処理フロー:**

1. 管理画面でプラン変更ボタンをクリック
2. 確認ダイアログを表示
3. GAS APIでスプレッドシートを更新
4. （オプション）ユーザーにプラン変更通知を送信

### 8.2 チャット機能

#### 8.2.1 メッセージ受信フロー

1. ユーザーがLINEでメッセージを送信
2. LINE PlatformがWebhookでGASにリクエスト
3. GASがメッセージ内容を解析
4. messagesシートに保存（direction: incoming）
5. 管理画面がポーリングで新着を取得・表示

#### 8.2.2 メッセージ送信フロー

1. 管理者がチャット画面でメッセージを入力・送信
2. React → GAS APIにリクエスト
3. GASがLINE Messaging API（pushMessage）を呼び出し
4. messagesシートに保存（direction: outgoing）
5. ユーザーのLINEにメッセージが届く

#### 8.2.3 Webhook実装（GAS）

```javascript
function doPost(e) {
  const json = JSON.parse(e.postData.contents);
  
  // 署名検証
  const signature = e.parameter['x-line-signature'];
  if (!verifySignature(e.postData.contents, signature)) {
    return ContentService.createTextOutput('Invalid signature');
  }
  
  // イベント処理
  const events = json.events;
  events.forEach(event => {
    switch (event.type) {
      case 'message':
        handleMessage(event);
        break;
      case 'follow':
        handleFollow(event);
        break;
      case 'unfollow':
        handleUnfollow(event);
        break;
    }
  });
  
  return ContentService.createTextOutput('OK');
}

function handleMessage(event) {
  const userId = event.source.userId;
  const message = event.message;
  const timestamp = new Date(event.timestamp);
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    .getSheetByName('messages');
  
  sheet.appendRow([
    `msg_${Date.now()}`,  // messageId
    userId,               // userId
    'incoming',           // direction
    message.type,         // messageType
    message.text || '',   // content
    '',                   // mediaUrl
    timestamp,            // sentAt
    ''                    // sentBy
  ]);
}
```

### 8.3 配信機能

#### 8.3.1 一斉配信（Broadcast）

全ユーザーにメッセージを配信する機能。LINE Messaging APIのbroadcast APIを使用。

**注意事項:**

- 月200通の無料枠を超えると従量課金
- broadcast APIはユーザー数に関わらず1リクエスト

**実装（GAS）:**

```javascript
function broadcastMessage(messageContent) {
  const url = 'https://api.line.me/v2/bot/message/broadcast';
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    },
    payload: JSON.stringify({
      messages: [messageContent]
    })
  };
  
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}
```

#### 8.3.2 セグメント配信

条件を指定してユーザーを絞り込み、対象者にのみ配信する機能。

**絞り込み条件:**

| 条件 | 演算子 | 例 |
|------|--------|-----|
| 学年 | equals | grade = '高3' |
| 地域 | equals | region = '関東' |
| 都道府県 | equals | prefecture = '東京都' |
| プラン | equals | plan = 'BASIC' |
| チーム | contains | teamName LIKE '%FC%' |
| 診断結果 | equals | diagnosisType = 'リーダータイプ' |
| カスタムタグ | contains | '要フォロー' IN customTags |

**実装（GAS）:**

```javascript
function segmentDelivery(filter, messageContent) {
  // ユーザーを絞り込み
  const users = getFilteredUsers(filter);
  const userIds = users.map(u => u.userId);
  
  // 500人ずつ分割して送信
  const chunks = chunkArray(userIds, 500);
  
  chunks.forEach(chunk => {
    multicastMessage(chunk, messageContent);
  });
  
  return { targetCount: userIds.length };
}

function multicastMessage(userIds, messageContent) {
  const url = 'https://api.line.me/v2/bot/message/multicast';
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    },
    payload: JSON.stringify({
      to: userIds,
      messages: [messageContent]
    })
  };
  
  UrlFetchApp.fetch(url, options);
}

function getFilteredUsers(filter) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    .getSheetByName('users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  return data.slice(1)
    .map(row => {
      const user = {};
      headers.forEach((h, i) => user[h] = row[i]);
      return user;
    })
    .filter(user => {
      if (filter.grade && user.grade !== filter.grade) return false;
      if (filter.region && user.region !== filter.region) return false;
      if (filter.plan && user.plan !== filter.plan) return false;
      return true;
    });
}
```

#### 8.3.3 予約配信

指定した日時にメッセージを配信する機能。

**実装方法:**

1. 配信情報をdelivery_logsシートに保存（status: pending）
2. GASの時間ベーストリガーを設定（毎分実行）
3. トリガー実行時、scheduledAtが現在時刻を過ぎたレコードを検索
4. 対象レコードの配信を実行
5. statusをsentに更新

**GASトリガー設定:**

```javascript
function setupScheduleTrigger() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'processScheduledDelivery') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // 毎分実行のトリガーを作成
  ScriptApp.newTrigger('processScheduledDelivery')
    .timeBased()
    .everyMinutes(1)
    .create();
}

function processScheduledDelivery() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    .getSheetByName('delivery_logs');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const now = new Date();
  
  data.slice(1).forEach((row, index) => {
    const delivery = {};
    headers.forEach((h, i) => delivery[h] = row[i]);
    
    if (delivery.status === 'pending' && 
        new Date(delivery.scheduledAt) <= now) {
      
      // 配信実行
      const messageContent = JSON.parse(delivery.messageContent);
      
      if (delivery.deliveryType === 'broadcast') {
        broadcastMessage(messageContent);
      } else if (delivery.deliveryType === 'segment') {
        const filter = JSON.parse(delivery.targetFilter);
        segmentDelivery(filter, messageContent);
      }
      
      // ステータス更新
      const statusCol = headers.indexOf('status') + 1;
      const sentAtCol = headers.indexOf('sentAt') + 1;
      sheet.getRange(index + 2, statusCol).setValue('sent');
      sheet.getRange(index + 2, sentAtCol).setValue(now);
    }
  });
}
```

#### 8.3.4 ステップ配信

ユーザーの登録日を起点に、設定した日数経過後に自動でメッセージを配信する機能。

**設定例:**

| ステップ名 | 経過日数 | 対象フィルタ | メッセージ内容 |
|-----------|---------|-------------|---------------|
| ウェルカム | 0日 | 全員 | 友だち追加ありがとうございます！ |
| 使い方ガイド | 1日 | 全員 | MOISHの使い方をご紹介します... |
| 診断促進 | 3日 | 診断未完了 | 性格診断を受けてみませんか？ |
| BASICプラン案内 | 7日 | FREEプラン | BASICプランの特典をご紹介... |

**実装方法:**

1. GASの日次トリガーを設定（毎日AM10:00など）
2. step_delivery_configシートから有効な設定を取得
3. 各ステップについて、対象ユーザーを抽出
4. （登録日 + 経過日数 = 今日）かつフィルタ条件に合致するユーザー
5. 対象ユーザーにメッセージを配信

**実装（GAS）:**

```javascript
function processStepDelivery() {
  const configSheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    .getSheetByName('step_delivery_config');
  const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    .getSheetByName('users');
  
  const configs = getSheetData(configSheet).filter(c => c.isActive);
  const users = getSheetData(usersSheet);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  configs.forEach(config => {
    const targetUsers = users.filter(user => {
      // 登録日 + 経過日数 = 今日
      const registeredDate = new Date(user.registeredAt);
      registeredDate.setHours(0, 0, 0, 0);
      const targetDate = new Date(registeredDate);
      targetDate.setDate(targetDate.getDate() + config.daysAfterRegistration);
      
      if (targetDate.getTime() !== today.getTime()) return false;
      
      // フィルタ条件チェック
      const filter = JSON.parse(config.targetFilter || '{}');
      if (filter.plan && user.plan !== filter.plan) return false;
      if (filter.diagnosisCompleted === false && user.diagnosisType) return false;
      
      return true;
    });
    
    if (targetUsers.length > 0) {
      const userIds = targetUsers.map(u => u.userId);
      const messageContent = JSON.parse(config.messageContent);
      
      // 500人ずつ分割して送信
      const chunks = chunkArray(userIds, 500);
      chunks.forEach(chunk => {
        multicastMessage(chunk, messageContent);
      });
    }
  });
}

function getSheetData(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
```

---

## 9. セキュリティ設計

### 9.1 認証・認可

#### 9.1.1 管理画面の認証

管理画面へのアクセスには認証を必須とする。以下のいずれかの方式を採用。

| 方式 | メリット | デメリット |
|------|---------|-----------|
| APIキー認証 | 実装が簡単 | キー漏洩リスク |
| Google OAuth | Googleアカウントで認証 | 実装がやや複雑 |
| Vercel認証 | Vercelの機能で簡単 | Vercel Proプラン必要 |

**推奨:** 初期段階ではAPIキー認証、将来的にGoogle OAuthに移行

#### 9.1.2 APIキー認証の実装

```javascript
// GAS側
function doPost(e) {
  const apiKey = e.parameter.apiKey || 
    (e.postData && JSON.parse(e.postData.contents).apiKey);
  
  const validApiKey = PropertiesService
    .getScriptProperties().getProperty('API_KEY');
  
  if (apiKey !== validApiKey) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Unauthorized' })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 認証OK、処理続行
}
```

### 9.2 CORS設定

GAS Web AppはデフォルトでCORS対応しているが、明示的にヘッダーを設定する。

```javascript
function doPost(e) {
  // ... 処理 ...
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 9.3 LINE Webhook検証

LINE PlatformからのWebhookリクエストは、署名を検証して正当性を確認する。

```javascript
function verifySignature(body, signature) {
  const channelSecret = PropertiesService
    .getScriptProperties().getProperty('LINE_CHANNEL_SECRET');
  
  const hash = Utilities.computeHmacSha256Signature(
    body, channelSecret
  );
  const expectedSignature = Utilities.base64Encode(hash);
  
  return signature === expectedSignature;
}
```

### 9.4 環境変数管理

**GAS側（スクリプトプロパティ）:**

| キー | 説明 |
|-----|------|
| LINE_CHANNEL_ACCESS_TOKEN | LINE Messaging APIのアクセストークン |
| LINE_CHANNEL_SECRET | LINE Messaging APIのチャネルシークレット |
| API_KEY | 管理画面との認証用APIキー |
| SPREADSHEET_ID | データ保存用スプレッドシートのID |

**React側（.env）:**

```
VITE_API_BASE_URL=https://script.google.com/macros/s/xxx/exec
VITE_API_KEY=your-api-key-here
```

---

## 10. 実装ロードマップ

### 10.1 フェーズ1: 基盤構築（1週目）

| タスク | 詳細 | 成果物 |
|-------|------|--------|
| GASプロジェクト作成 | Web Appとしてデプロイ | GASプロジェクト |
| スプレッドシート設計 | 各シートの作成、ヘッダー設定 | スプレッドシート |
| Reactプロジェクト作成 | Vite + TypeScript + Tailwind | Reactプロジェクト |
| Vercelデプロイ | GitHubリポジトリ連携 | 本番URL |
| APIクライアント実装 | GASとの通信基盤 | api/client.ts |

### 10.2 フェーズ2: ユーザー管理（2週目）

| タスク | 詳細 | 成果物 |
|-------|------|--------|
| ユーザー一覧API | GET /api/users | GAS関数 |
| ユーザー詳細API | GET /api/users/:userId | GAS関数 |
| ユーザー更新API | PUT /api/users/:userId | GAS関数 |
| ユーザー一覧画面 | 検索・フィルター機能付き | Reactコンポーネント |
| ユーザー詳細モーダル | タブ構成、編集機能 | Reactコンポーネント |

### 10.3 フェーズ3: チャット機能（3週目）

| タスク | 詳細 | 成果物 |
|-------|------|--------|
| Webhook実装 | メッセージ受信・保存 | GAS関数 |
| チャット履歴API | GET /api/users/:userId/messages | GAS関数 |
| メッセージ送信API | POST /api/users/:userId/messages | GAS関数 |
| チャット画面 | メッセージ表示・送信UI | Reactコンポーネント |
| ポーリング実装 | 新着メッセージ自動取得 | カスタムフック |

### 10.4 フェーズ4: 配信機能（4週目）

| タスク | 詳細 | 成果物 |
|-------|------|--------|
| 一斉配信API | POST /api/delivery/broadcast | GAS関数 |
| セグメント配信API | POST /api/delivery/segment | GAS関数 |
| 予約配信機能 | 時間トリガー設定 | GAS関数 + トリガー |
| 配信作成画面 | フォーム、プレビュー | Reactコンポーネント |
| 配信履歴画面 | 過去の配信一覧 | Reactコンポーネント |

### 10.5 フェーズ5: 拡張機能（5週目以降）

| タスク | 詳細 | 優先度 |
|-------|------|--------|
| ステップ配信 | 自動配信設定 | 高 |
| ダッシュボード | 統計・グラフ表示 | 中 |
| アンケート管理 | 回答表示・紐付け | 中 |
| Flex Message対応 | リッチなメッセージ作成 | 低 |
| 画像送信 | 管理画面からの画像送信 | 低 |

---

## 11. 運用・保守

### 11.1 監視項目

| 監視項目 | 方法 | アラート条件 |
|---------|------|-------------|
| GAS実行エラー | GASログ確認 | エラー発生時 |
| API応答時間 | GASログ | 5秒以上 |
| LINE API エラー | レスポンスコード確認 | 200以外 |
| スプレッドシート容量 | 手動確認 | 80%以上 |

### 11.2 バックアップ

スプレッドシートのデータは定期的にバックアップを取得する。

- **頻度:** 日次
- **方法:** GASトリガーでスプレッドシートをコピー
- **保持期間:** 30日間

**バックアップスクリプト:**

```javascript
function dailyBackup() {
  const sourceId = SPREADSHEET_ID;
  const source = SpreadsheetApp.openById(sourceId);
  const backupFolderId = 'YOUR_BACKUP_FOLDER_ID';
  
  const date = Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd');
  const backupName = `MOISH_backup_${date}`;
  
  const backup = source.copy(backupName);
  const backupFile = DriveApp.getFileById(backup.getId());
  const backupFolder = DriveApp.getFolderById(backupFolderId);
  
  backupFile.moveTo(backupFolder);
  
  // 30日以上前のバックアップを削除
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  
  const files = backupFolder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getDateCreated() < cutoffDate) {
      file.setTrashed(true);
    }
  }
}
```

### 11.3 制限事項

| 項目 | 制限値 | 対策 |
|------|--------|------|
| GAS実行時間 | 6分/回 | 処理を分割 |
| GASトリガー | 20個/プロジェクト | トリガーを整理 |
| スプレッドシート行数 | 1,000万セル | 古いデータをアーカイブ |
| LINE無料メッセージ | 200通/月 | 従量課金プランに変更 |
| multicast上限 | 500人/回 | 分割して実行 |

### 11.4 トラブルシューティング

#### メッセージが送信されない

1. LINE_CHANNEL_ACCESS_TOKENが正しいか確認
2. GASの実行ログでエラーを確認
3. LINE Developers Consoleでエラーログを確認

#### Webhookがされない

1. GASのデプロイURLが正しいか確認
2. LINE Developers ConsoleでWebhook URLを確認
3. GASの実行権限が「全員」になっているか確認

#### 管理画面からAPIに接続できない

1. VITE_API_BASE_URLが正しいか確認
2. API_KEYが一致しているか確認
3. ブラウザのコンソールでCORSエラーを確認

### 11.5 今後の拡張可能性

- Firebase/Supabaseへのデータストア移行（スケーラビリティ向上）
- リアルタイム通知の導入（Pusher/Firebase Cloud Messaging）
- 管理者権限の細分化（閲覧のみ/編集可能など）
- LINE LIFF連携（ユーザー側のWebアプリ）
- AIチャットボット連携（自動応答）

---

## 付録

### A. GAS完全コード

```javascript
// ==============================
// 設定
// ==============================

const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
const LINE_CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
const LINE_CHANNEL_SECRET = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_SECRET');
const API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY');

// ==============================
// エントリーポイント
// ==============================

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  // Webhook判定
  if (e.postData && e.postData.contents) {
    try {
      const json = JSON.parse(e.postData.contents);
      if (json.events) {
        return handleWebhook(e);
      }
    } catch (err) {
      // JSONパースエラーは通常のAPIリクエストとして処理
    }
  }
  
  return handleRequest(e, 'POST');
}

// ==============================
// API リクエスト処理
// ==============================

function handleRequest(e, method) {
  // 認証チェック
  const apiKey = e.parameter.apiKey;
  if (apiKey !== API_KEY) {
    return jsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: '認証エラー' } });
  }
  
  const path = e.parameter.path || '';
  const action = e.parameter.action || '';
  
  try {
    let result;
    
    switch (action) {
      case 'getUsers':
        result = getUsers(e.parameter);
        break;
      case 'getUser':
        result = getUser(e.parameter.userId);
        break;
      case 'updateUser':
        result = updateUser(e.parameter.userId, JSON.parse(e.parameter.data));
        break;
      case 'getMessages':
        result = getMessages(e.parameter.userId, e.parameter);
        break;
      case 'sendMessage':
        result = sendMessage(e.parameter.userId, JSON.parse(e.parameter.data));
        break;
      case 'getStatistics':
        result = getStatistics();
        break;
      case 'broadcast':
        result = broadcastMessage(JSON.parse(e.parameter.data));
        break;
      case 'segmentDelivery':
        result = segmentDelivery(
          JSON.parse(e.parameter.filter),
          JSON.parse(e.parameter.message)
        );
        break;
      default:
        result = { error: 'Unknown action' };
    }
    
    return jsonResponse({ success: true, data: result });
  } catch (error) {
    return jsonResponse({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: error.toString() } 
    });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==============================
// ユーザー管理
// ==============================

function getUsers(params) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let users = data.slice(1).map(row => {
    const user = {};
    headers.forEach((h, i) => user[h] = row[i]);
    return user;
  });
  
  // フィルタリング
  if (params.search) {
    const search = params.search.toLowerCase();
    users = users.filter(u => 
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.teamName && u.teamName.toLowerCase().includes(search))
    );
  }
  if (params.grade) users = users.filter(u => u.grade === params.grade);
  if (params.region) users = users.filter(u => u.region === params.region);
  if (params.plan) users = users.filter(u => u.plan === params.plan);
  
  // ページネーション
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 50;
  const total = users.length;
  const start = (page - 1) * limit;
  const paginatedUsers = users.slice(start, start + limit);
  
  return {
    users: paginatedUsers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

function getUser(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      const user = {};
      headers.forEach((h, j) => user[h] = data[i][j]);
      
      // JSON文字列をパース
      if (user.universities) user.universities = JSON.parse(user.universities);
      if (user.customTags) user.customTags = JSON.parse(user.customTags);
      
      return user;
    }
  }
  
  throw new Error('User not found');
}

function updateUser(userId, updateData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      Object.keys(updateData).forEach(key => {
        const colIndex = headers.indexOf(key);
        if (colIndex >= 0) {
          let value = updateData[key];
          if (Array.isArray(value)) value = JSON.stringify(value);
          sheet.getRange(i + 1, colIndex + 1).setValue(value);
        }
      });
      
      // 更新日時を更新
      const updatedAtCol = headers.indexOf('updatedAt');
      if (updatedAtCol >= 0) {
        sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date());
      }
      
      return { success: true };
    }
  }
  
  throw new Error('User not found');
}

// ==============================
// メッセージ管理
// ==============================

function getMessages(userId, params) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('messages');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let messages = data.slice(1)
    .map(row => {
      const msg = {};
      headers.forEach((h, i) => msg[h] = row[i]);
      return msg;
    })
    .filter(msg => msg.userId === userId)
    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
  
  const limit = parseInt(params.limit) || 50;
  messages = messages.slice(-limit);
  
  return {
    messages,
    hasMore: messages.length === limit
  };
}

function sendMessage(userId, messageData) {
  // LINE APIでメッセージ送信
  const url = 'https://api.line.me/v2/bot/message/push';
  
  const payload = {
    to: userId,
    messages: [{
      type: messageData.messageType || 'text',
      text: messageData.content
    }]
  };
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200) {
    throw new Error('LINE API Error: ' + response.getContentText());
  }
  
  // メッセージをシートに保存
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('messages');
  sheet.appendRow([
    `msg_${Date.now()}`,
    userId,
    'outgoing',
    messageData.messageType || 'text',
    messageData.content,
    '',
    new Date(),
    'admin'
  ]);
  
  return { success: true };
}

// ==============================
// Webhook処理
// ==============================

function handleWebhook(e) {
  const json = JSON.parse(e.postData.contents);
  
  json.events.forEach(event => {
    switch (event.type) {
      case 'message':
        saveIncomingMessage(event);
        break;
      case 'follow':
        // 新規ユーザー登録（既存処理を呼び出し）
        break;
      case 'unfollow':
        // ブロック処理
        break;
    }
  });
  
  return ContentService.createTextOutput('OK');
}

function saveIncomingMessage(event) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('messages');
  const message = event.message;
  
  sheet.appendRow([
    `msg_${Date.now()}`,
    event.source.userId,
    'incoming',
    message.type,
    message.text || '',
    '',
    new Date(event.timestamp),
    ''
  ]);
}

// ==============================
// 配信機能
// ==============================

function getStatistics() {
  const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const usersData = usersSheet.getDataRange().getValues();
  
  const users = usersData.slice(1);
  const planCol = usersData[0].indexOf('plan');
  const gradeCol = usersData[0].indexOf('grade');
  const diagnosisCol = usersData[0].indexOf('diagnosisType');
  
  return {
    totalUsers: users.length,
    basicUsers: users.filter(r => r[planCol] === 'BASIC').length,
    freeUsers: users.filter(r => r[planCol] === 'FREE').length,
    grade3Users: users.filter(r => r[gradeCol] === '高3').length,
    diagnosisCompleted: users.filter(r => r[diagnosisCol]).length
  };
}
```

---

**以上**
