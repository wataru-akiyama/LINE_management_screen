// ==============================
// RichMenus.gs - リッチメニュー管理
// ==============================

/**
 * リッチメニュー一覧を取得
 */
function getRichMenus() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('richmenus');
  if (!sheet) return { menus: [] };
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { menus: [] };
  
  const headers = data[0];
  const menus = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // IDがない行はスキップ
    
    const menu = {};
    headers.forEach((header, index) => {
      let value = row[index];
      // JSONフィールドをパース
      if (header === 'areas' && value) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = [];
        }
      }
      menu[header] = value;
    });
    menus.push(menu);
  }
  
  return { menus: menus };
}

/**
 * リッチメニュー詳細を取得
 * @param {string} id - メニューID
 */
function getRichMenu(id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('richmenus');
  if (!sheet) throw new Error('Rich menu sheet not found');
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const menu = {};
      headers.forEach((header, index) => {
        let value = data[i][index];
        if (header === 'areas' && value) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = [];
          }
        }
        menu[header] = value;
      });
      return menu;
    }
  }
  
  throw new Error('Rich menu not found: ' + id);
}

/**
 * リッチメニューを作成
 * @param {Object} data - メニューデータ
 */
function createRichMenu(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('richmenus');
  if (!sheet) throw new Error('Rich menu sheet not found');
  
  const id = 'rm_' + Date.now();
  const now = new Date().toISOString();
  
  // areasをJSON文字列に変換
  const areasJson = data.areas ? JSON.stringify(data.areas) : '[]';
  
  sheet.appendRow([
    id,
    data.name || '',
    '', // lineRichMenuId - LINE APIで作成後に設定
    data.imageFileId || '',
    data.layout || 'A',
    areasJson,
    data.chatBarText || 'メニュー',
    'draft',
    now,
    now
  ]);
  
  return { success: true, id: id };
}

/**
 * リッチメニュー画像をアップロード（スプレッドシートにBase64保存）
 * @param {string} menuId - メニューID
 * @param {Object} data - { imageBase64: string, mimeType: string, fileName: string }
 */
function uploadRichMenuImage(menuId, data) {
  if (!data.imageBase64 || !data.mimeType) {
    throw new Error('imageBase64 and mimeType are required');
  }
  
  // 画像IDを生成
  const imageId = 'img_' + Date.now();
  
  // richmenu_imagesシートに画像データを保存
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let imageSheet = ss.getSheetByName('richmenu_images');
  
  // シートがなければ作成
  if (!imageSheet) {
    imageSheet = ss.insertSheet('richmenu_images');
    imageSheet.getRange(1, 1, 1, 4).setValues([['imageId', 'mimeType', 'imageBase64', 'createdAt']]);
  }
  
  // 画像データを保存
  imageSheet.appendRow([
    imageId,
    data.mimeType,
    data.imageBase64,
    new Date().toISOString()
  ]);
  
  // メニューのimageFileIdを更新
  if (menuId) {
    updateRichMenu(menuId, { imageFileId: imageId });
  }
  
  return { 
    success: true, 
    fileId: imageId,
    // Data URLを返す（プレビュー用）
    url: 'data:' + data.mimeType + ';base64,' + data.imageBase64
  };
}

/**
 * リッチメニュー画像を取得
 * @param {string} imageId - 画像ID
 */
function getRichMenuImage(imageId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const imageSheet = ss.getSheetByName('richmenu_images');
  
  if (!imageSheet) {
    throw new Error('Image sheet not found');
  }
  
  const data = imageSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === imageId) {
      const mimeType = data[i][1];
      const imageBase64 = data[i][2];
      return {
        imageId: imageId,
        url: 'data:' + mimeType + ';base64,' + imageBase64
      };
    }
  }
  
  throw new Error('Image not found: ' + imageId);
}

/**
 * リッチメニューを更新
 * @param {string} id - メニューID
 * @param {Object} data - 更新データ
 */
function updateRichMenu(id, data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('richmenus');
  if (!sheet) throw new Error('Rich menu sheet not found');
  
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0];
  
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === id) {
      // 更新可能なフィールド
      const updateFields = ['name', 'imageFileId', 'layout', 'areas', 'chatBarText', 'status', 'lineRichMenuId'];
      
      updateFields.forEach(field => {
        if (data[field] !== undefined) {
          const colIndex = headers.indexOf(field);
          if (colIndex >= 0) {
            let value = data[field];
            if (field === 'areas') {
              value = JSON.stringify(value);
            }
            sheet.getRange(i + 1, colIndex + 1).setValue(value);
          }
        }
      });
      
      // updatedAtを更新
      const updatedAtCol = headers.indexOf('updatedAt');
      if (updatedAtCol >= 0) {
        sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date().toISOString());
      }
      
      return { success: true, id: id };
    }
  }
  
  throw new Error('Rich menu not found: ' + id);
}

/**
 * リッチメニューを削除
 * @param {string} id - メニューID
 */
function deleteRichMenu(id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('richmenus');
  if (!sheet) throw new Error('Rich menu sheet not found');
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      // LINE APIからも削除（lineRichMenuIdがある場合）
      const lineRichMenuId = data[i][2];
      if (lineRichMenuId) {
        try {
          deleteLineRichMenu(lineRichMenuId);
        } catch (e) {
          Logger.log('Failed to delete LINE rich menu: ' + e);
        }
      }
      
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  
  throw new Error('Rich menu not found: ' + id);
}

/**
 * LINE APIでリッチメニューを作成し、画像をアップロード
 * @param {string} id - ローカルメニューID
 */
function publishRichMenu(id) {
  const menu = getRichMenu(id);
  
  // リッチメニュー定義を作成
  const richMenuObject = {
    size: { width: 2500, height: 1686 },
    selected: true, // デフォルトで開くように設定
    name: menu.name,
    chatBarText: menu.chatBarText || 'メニュー',
    areas: convertAreasForLineApi(menu.areas, menu.layout)
  };
  
  // LINE APIでリッチメニュー作成
  const lineRichMenuId = createLineRichMenu(richMenuObject);
  
  // 画像をアップロード
  if (menu.imageFileId) {
    uploadRichMenuImageToLine(lineRichMenuId, menu.imageFileId);
  }
  
  // 自動的にデフォルト設定はしない（プラン設定に従うため）
  // setDefaultRichMenu(lineRichMenuId);
  
  // lineRichMenuIdを保存し、statusをactiveに
  updateRichMenu(id, { 
    lineRichMenuId: lineRichMenuId,
    status: 'active'
  });
  
  return { success: true, lineRichMenuId: lineRichMenuId };
}

/**
 * リッチメニューを非公開（LINE上から削除）
 * @param {string} id - ローカルメニューID
 */
function unpublishRichMenu(id) {
  const menu = getRichMenu(id);
  
  if (!menu.lineRichMenuId) {
    return { success: true }; // 既にIDがなければ成功とみなす
  }
  
  try {
    // デフォルトリッチメニューを解除
    unsetDefaultRichMenu();
    
    // LINE APIでリッチメニュー削除
    deleteLineRichMenu(menu.lineRichMenuId);
  } catch (e) {
    Logger.log('Error unpublishing rich menu: ' + e.toString());
    // エラーでも続行（既に削除されている場合など）
  }
  
  // lineRichMenuIdをクリアし、statusをdraftに
  updateRichMenu(id, { 
    lineRichMenuId: '',
    status: 'draft'
  });
  
  return { success: true };
}

/**
 * デフォルトリッチメニューを解除
 */
function unsetDefaultRichMenu() {
  const url = 'https://api.line.me/v2/bot/user/all/richmenu';
  
  const options = {
    method: 'delete',
    headers: {
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  
  // 404は設定されていない場合なので無視してOK
  if (statusCode !== 200 && statusCode !== 404) {
    throw new Error('Failed to unset default rich menu: ' + response.getContentText());
  }
  
  Logger.log('Default rich menu unset');
}

/**
 * デフォルトリッチメニューを設定（全員に反映）
 */
function setDefaultRichMenu(lineRichMenuId) {
  const url = `https://api.line.me/v2/bot/user/all/richmenu/${lineRichMenuId}`;
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  
  if (statusCode !== 200) {
    throw new Error('Failed to set default rich menu: ' + response.getContentText());
  }
  
  Logger.log('Default rich menu set to: ' + lineRichMenuId);
}

/**
 * エリア設定をLINE API形式に変換
 */
function convertAreasForLineApi(areas, layout) {
  if (!areas || !Array.isArray(areas)) return [];
  
  return areas.map(area => ({
    bounds: {
      x: area.x || 0,
      y: area.y || 0,
      width: area.width || 0,
      height: area.height || 0
    },
    action: convertActionForLineApi(area.action)
  }));
}

/**
 * アクション設定をLINE API形式に変換
 */
function convertActionForLineApi(action) {
  if (!action) return { type: 'message', text: '' };
  
  switch (action.type) {
    case 'uri':
      return { type: 'uri', label: action.label || '', uri: action.uri || '' };
    case 'message':
      return { type: 'message', label: action.label || '', text: action.text || '' };
    case 'postback':
      return { type: 'postback', label: action.label || '', data: action.data || '' };
    default:
      return { type: 'message', text: '' };
  }
}

/**
 * LINE APIでリッチメニューを作成
 */
function createLineRichMenu(richMenu) {
  const url = 'https://api.line.me/v2/bot/richmenu';
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify(richMenu),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();
  
  if (statusCode !== 200) {
    throw new Error('LINE API error: ' + statusCode + ' - ' + responseText);
  }
  
  const result = JSON.parse(responseText);
  return result.richMenuId;
}

/**
 * LINE APIにリッチメニュー画像をアップロード（スプレッドシートから取得）
 */
function uploadRichMenuImageToLine(richMenuId, imageId) {
  const url = `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`;
  
  // スプレッドシートから画像データを取得
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const imageSheet = ss.getSheetByName('richmenu_images');
  
  if (!imageSheet) {
    throw new Error('Image sheet not found');
  }
  
  const data = imageSheet.getDataRange().getValues();
  let imageBase64 = null;
  let mimeType = null;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === imageId) {
      mimeType = data[i][1];
      imageBase64 = data[i][2];
      break;
    }
  }
  
  if (!imageBase64) {
    throw new Error('Image not found: ' + imageId);
  }
  
  // Base64をデコードしてBlobを作成
  const decoded = Utilities.base64Decode(imageBase64);
  const imageBlob = Utilities.newBlob(decoded, mimeType, 'richmenu.png');
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': mimeType,
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: imageBlob.getBytes(),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  
  if (statusCode !== 200) {
    throw new Error('Image upload failed: ' + response.getContentText());
  }
  
  Logger.log('Image uploaded successfully');
}

/**
 * LINE APIでリッチメニューを削除
 */
function deleteLineRichMenu(richMenuId) {
  const url = `https://api.line.me/v2/bot/richmenu/${richMenuId}`;
  
  const options = {
    method: 'delete',
    headers: {
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  
  if (statusCode !== 200) {
    Logger.log('Delete failed: ' + response.getContentText());
  }
}

// ==============================
// プラン別メニュー設定
// ==============================

/**
 * プラン別メニュー設定を取得
 */
function getRichMenuPlanMappings() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('richmenu_plans');
  if (!sheet) return { mappings: [] };
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { mappings: [] };
  
  const mappings = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      mappings.push({
        plan: data[i][0],
        richMenuId: data[i][1] || ''
      });
    }
  }
  
  return { mappings: mappings };
}

/**
 * プラン別メニュー設定を更新
 * @param {string} plan - プラン名
 * @param {string} richMenuId - メニューID
 */
function updateRichMenuPlanMapping(plan, richMenuId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('richmenu_plans');
  if (!sheet) throw new Error('Rich menu plans sheet not found');
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === plan) {
      sheet.getRange(i + 1, 2).setValue(richMenuId);
      return { success: true };
    }
  }
  
  // 新しいプランを追加
  sheet.appendRow([plan, richMenuId]);
  return { success: true };
}

/**
 * ユーザーにリッチメニューを適用
 * @param {string} userId - LINE User ID
 * @param {string} richMenuId - ローカルメニューID
 */
function linkRichMenuToUser(userId, richMenuId) {
  // メニューのlineRichMenuIdを取得
  const menu = getRichMenu(richMenuId);
  if (!menu.lineRichMenuId) {
    throw new Error('Menu is not published yet');
  }
  
  const url = `https://api.line.me/v2/bot/user/${userId}/richmenu/${menu.lineRichMenuId}`;
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  
  if (statusCode !== 200) {
    throw new Error('Link failed: ' + response.getContentText());
  }
  
  return { success: true };
}

/**
 * ユーザーのプランに応じたリッチメニューを適用
 * @param {string} userId - LINE User ID
 * @param {string} plan - プラン名
 */
function applyRichMenuByPlan(userId, plan) {
  // フリープランはリンク解除（デフォルトメニューを表示）
  if (!plan || plan === 'フリープラン') {
    return unlinkRichMenuFromUser(userId);
  }

  const mappings = getRichMenuPlanMappings().mappings;
  const mapping = mappings.find(m => m.plan === plan);
  
  if (!mapping || !mapping.richMenuId) {
    // マッピングがない場合もリンク解除
    return unlinkRichMenuFromUser(userId);
  }
  
  return linkRichMenuToUser(userId, mapping.richMenuId);
}

/**
 * ユーザーからリッチメニューのリンクを解除
 * @param {string} userId - LINE User ID
 */
function unlinkRichMenuFromUser(userId) {
  const url = `https://api.line.me/v2/bot/user/${userId}/richmenu`;
  
  const options = {
    method: 'delete',
    headers: {
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  
  // 404は設定されていない場合なので成功とみなす
  if (statusCode !== 200 && statusCode !== 404) {
    throw new Error('Unlink failed: ' + response.getContentText());
  }
  
  return { success: true };
}

/**
 * 全ユーザーに現在のプラン設定に基づいてリッチメニューを適用
 * フリープラン（または指定なし）はデフォルトメニューを適用（リンク解除）
 */
function applyRichMenusToAllUsers() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. プラン設定を取得
  const mappings = getRichMenuPlanMappings().mappings;
  const planMap = {};
  mappings.forEach(m => {
    planMap[m.plan] = m.richMenuId;
  });
  
  // 2. 「フリープラン」に設定されているメニューをデフォルトリッチメニューとして設定
  if (planMap['フリープラン']) {
    const menu = getRichMenu(planMap['フリープラン']);
    if (menu && menu.lineRichMenuId) {
      setDefaultRichMenu(menu.lineRichMenuId);
    }
  }
  
  // 3. 全ユーザーを取得して適用
  const usersSheet = ss.getSheetByName('users');
  if (!usersSheet) return { success: false, message: 'Users sheet not found' };
  
  const users = usersSheet.getDataRange().getValues();
  // ヘッダー行を除外
  const headers = users[0];
  const planIndex = headers.indexOf('plan');
  
  if (planIndex < 0) return { success: false, message: 'Plan column not found' };
  
  for (let i = 1; i < users.length; i++) {
    const userId = users[i][0];
    const plan = users[i][planIndex] || 'フリープラン'; // デフォルトはフリープラン
    
    try {
      if (plan === 'フリープラン') {
        // フリープランはリンク解除（デフォルトメニューが表示される）
        unlinkRichMenuFromUser(userId);
      } else if (planMap[plan]) {
        // マッピングがあるプランは個別にリンク
        const richMenuId = planMap[plan];
        // activeなメニューか確認
        const menu = getRichMenu(richMenuId);
        if (menu && menu.lineRichMenuId) {
          linkRichMenuToUser(userId, richMenuId);
        } else {
          // メニューが無効ならリンク解除
          unlinkRichMenuFromUser(userId);
        }
      } else {
        // その他（マッピングなし）はリンク解除
        unlinkRichMenuFromUser(userId);
      }
    } catch (e) {
      Logger.log(`Failed to apply menu for user ${userId}: ${e.toString()}`);
    }
  }
  
  return { success: true };
}
