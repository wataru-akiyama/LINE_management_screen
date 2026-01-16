// ==============================
// RichMenuSetup.gs
// リッチメニュー管理用ツール群
// ==============================

// ==============================
// 設定（ここを環境に合わせて編集）
// ==============================

// 画像ファイルのID（Google Drive）
// → freemenu.png / basicmenu.png のファイルIDに書き換えてください
// https://drive.google.com/file/d/1-D78oLcoelAIs1wFuYTK7fBiejZ9nVye/view?usp=drive_link
// https://drive.google.com/file/d/14XAAHvRO-fia643GW97vNB1c92zEiTL_/view?usp=drive_link
const DRIVE_FILE_IDS = {
  FREE_MENU_IMAGE:  '1-D78oLcoelAIs1wFuYTK7fBiejZ9nVye',
  BASIC_MENU_IMAGE: '14XAAHvRO-fia643GW97vNB1c92zEiTL_'
};

// WebサイトのベースURL
const SITE_BASE_URL = 'https://playmaker-moish.com';

// 本番で使うリッチメニューID（setupAllRichMenus実行後にログから設定）
const FREE_RICHMENU_ID  = 'richmenu-bf3770d5f691b080bcad85423cce5b97';  // setupAllRichMenus実行後に設定
const BASIC_RICHMENU_ID = 'richmenu-ec6a86af9f8c3c7623d82aaf287f9e7a';  // setupAllRichMenus実行後に設定

// Channel Access Token
//const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('CHANNEL_ACCESS_TOKEN');

// ==============================
// 既存リッチメニュー一覧を取得
// ==============================

function listRichMenus() {
  const url = 'https://api.line.me/v2/bot/richmenu/list';

  const options = {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (statusCode !== 200) {
    Logger.log(`リッチメニュー一覧取得失敗 (${statusCode}): ${responseText}`);
    return;
  }

  const result = JSON.parse(responseText);
  Logger.log('既存のリッチメニュー一覧:');
  Logger.log(JSON.stringify(result, null, 2));
}

// ==============================
// 新規リッチメニュー作成（FREE & BASIC）
// ==============================

/**
 * リッチメニュー全体をセットアップ（Free & Basic）
 * 使用方法：
 * 1. freemenu.png / basicmenu.png を Google Drive にアップロード
 * 2. 上の DRIVE_FILE_IDS を設定
 * 3. この関数を手動実行して richMenuId を取得
 * 4. FREE_RICHMENU_ID / BASIC_RICHMENU_ID に設定
 */
function setupAllRichMenus() {
  Logger.log('=== リッチメニューセットアップ開始 ===');

  try {
    // 1. Freeプラン用リッチメニュー作成
    Logger.log('Freeプラン用リッチメニューを作成中...');
    const freeMenuId = createFreeRichMenu();
    Logger.log('✅ Free Rich Menu ID: ' + freeMenuId);

    // 2. Basicプラン用リッチメニュー作成
    Logger.log('Basicプラン用リッチメニューを作成中...');
    const basicMenuId = createBasicRichMenu();
    Logger.log('✅ Basic Rich Menu ID: ' + basicMenuId);

    Logger.log('');
    Logger.log('=== セットアップ完了 ===');
    Logger.log('以下のIDをこのファイルの上部に設定してください：');
    Logger.log('');
    Logger.log('const FREE_RICHMENU_ID  = \'' + freeMenuId  + '\';');
    Logger.log('const BASIC_RICHMENU_ID = \'' + basicMenuId + '\';');
    Logger.log('');
    Logger.log('設定後、Webアプリを再デプロイしてください！');

  } catch (error) {
    Logger.log('❌ エラーが発生しました: ' + error);
    throw error;
  }
}

/**
 * Freeプラン用リッチメニューを作成
 * レイアウト：
 * ┌─────────┬─────────┐
 * │ ロゴ    │ 機能説明 │
 * ├───┬───┬─┴─────────┤
 * │マイ│検索│プラン変更│
 * └───┴───┴──────────┘
 */
function createFreeRichMenu() {
  const richMenu = {
    size: {
      width: 2500,
      height: 1686
    },
    selected: false,
    name: 'MOISH Free Plan Menu',
    chatBarText: 'メニュー/開閉',
    areas: [
      // 上段左: ロゴエリア → サイトトップへ
      {
        bounds: { x: 0, y: 0, width: 1250, height: 843 },
        action: {
          type: 'uri',
          label: 'トップページ',
          uri: SITE_BASE_URL
        }
      },
      // 上段右: 機能説明
      {
        bounds: { x: 1250, y: 0, width: 1250, height: 843 },
        action: {
          type: 'message',
          label: '機能説明',
          text: '機能説明'
        }
      },
      // 下段左: マイページ
      {
        bounds: { x: 0, y: 843, width: 833, height: 843 },
        action: {
          type: 'uri',
          label: 'マイページ',
          uri: SITE_BASE_URL + '/mypage'
        }
      },
      // 下段中央: 大学検索
      {
        bounds: { x: 833, y: 843, width: 834, height: 843 },
        action: {
          type: 'uri',
          label: '大学検索',
          uri: SITE_BASE_URL + '/universities'
        }
      },
      // 下段右: プラン変更
      {
        bounds: { x: 1667, y: 843, width: 833, height: 843 },
        action: {
          type: 'uri',
          label: 'プラン変更',
          uri: SITE_BASE_URL + '/plans'
        }
      }
    ]
  };

  const richMenuId = createRichMenuObject(richMenu);
  uploadRichMenuImage(richMenuId, DRIVE_FILE_IDS.FREE_MENU_IMAGE);
  return richMenuId;
}

/**
 * Basicプラン用リッチメニューを作成
 * レイアウト：
 * ┌─────────┬─────────┐
 * │ ロゴ    │ 機能説明 │
 * ├───┬───┬─┴─────────┤
 * │マイ│検索│進路相談  │
 * └───┴───┴──────────┘
 */
function createBasicRichMenu() {
  const richMenu = {
    size: {
      width: 2500,
      height: 1686
    },
    selected: false,
    name: 'MOISH Basic Plan Menu',
    chatBarText: 'メニュー/開閉',
    areas: [
      // 上段左: ロゴエリア → サイトトップへ
      {
        bounds: { x: 0, y: 0, width: 1250, height: 843 },
        action: {
          type: 'uri',
          label: 'トップページ',
          uri: SITE_BASE_URL
        }
      },
      // 上段右: 機能説明
      {
        bounds: { x: 1250, y: 0, width: 1250, height: 843 },
        action: {
          type: 'message',
          label: '機能説明',
          text: '機能説明'
        }
      },
      // 下段左: マイページ
      {
        bounds: { x: 0, y: 843, width: 833, height: 843 },
        action: {
          type: 'uri',
          label: 'マイページ',
          uri: SITE_BASE_URL + '/mypage'
        }
      },
      // 下段中央: 大学検索
      {
        bounds: { x: 833, y: 843, width: 834, height: 843 },
        action: {
          type: 'uri',
          label: '大学検索',
          uri: SITE_BASE_URL + '/universities'
        }
      },
      // 下段右: 進路相談（Basicプランのみ）
      {
        bounds: { x: 1667, y: 843, width: 833, height: 843 },
        action: {
          type: 'message',
          label: '進路相談',
          text: '進路相談したいです'
        }
      }
    ]
  };

  const richMenuId = createRichMenuObject(richMenu);
  uploadRichMenuImage(richMenuId, DRIVE_FILE_IDS.BASIC_MENU_IMAGE);
  return richMenuId;
}

/**
 * リッチメニューオブジェクトを作成
 * @param {object} richMenu - リッチメニュー定義
 * @return {string} richMenuId
 */
function createRichMenuObject(richMenu) {
  const url = 'https://api.line.me/v2/bot/richmenu';

  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify(richMenu),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (statusCode !== 200) {
    throw new Error(`リッチメニュー作成失敗 (${statusCode}): ${responseText}`);
  }

  const result = JSON.parse(responseText);
  return result.richMenuId;
}

/**
 * リッチメニューに画像をアップロード
 * @param {string} richMenuId - リッチメニューID
 * @param {string} driveFileId - Google DriveファイルID
 */
function uploadRichMenuImage(richMenuId, driveFileId) {
  const url = `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`;

  const file = DriveApp.getFileById(driveFileId);
  const imageBlob = file.getBlob();
  const mimeType = imageBlob.getContentType();

  if (mimeType !== 'image/png' && mimeType !== 'image/jpeg') {
    throw new Error('画像はPNGまたはJPEG形式である必要があります: ' + mimeType);
  }

  const options = {
    method: 'post',
    headers: {
      'Content-Type': mimeType,
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
    },
    payload: imageBlob.getBytes(),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();

  if (statusCode !== 200) {
    const responseText = response.getContentText();
    throw new Error(`画像アップロード失敗 (${statusCode}): ${responseText}`);
  }

  Logger.log(`✅ 画像アップロード成功: ${richMenuId}`);
}

// ==============================
// 削除系ユーティリティ
// ==============================

/**
 * リッチメニューを削除
 * @param {string} richMenuId - 削除するリッチメニューID
 */
function deleteRichMenu(richMenuId) {
  const url = `https://api.line.me/v2/bot/richmenu/${richMenuId}`;

  const options = {
    method: 'delete',
    headers: {
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();

  if (statusCode === 200) {
    Logger.log(`✅ リッチメニュー削除成功: ${richMenuId}`);
  } else {
    Logger.log(`❌ リッチメニュー削除失敗 (${statusCode}): ${response.getContentText()}`);
  }
}

/**
 * 古いリッチメニューを削除（必要に応じて実行）
 */
function cleanOldRichMenus() {
  // 古いIDがある場合はここに追加して実行
  // 例：
  deleteRichMenu('richmenu-b5ac55eaa4959a3c6e689c3f6a3cacae');
  deleteRichMenu('richmenu-a92eaaf768faf02e94248e69eed54289');
  
  Logger.log('削除するリッチメニューIDを指定してください');
}