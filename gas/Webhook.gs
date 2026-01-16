// ==============================
// Webhook.gs - LINE Webhook処理（プロフィール収集統合版）
// ==============================

/**
 * LINE Webhookイベントを処理する
 * @param {Object} e - イベントオブジェクト
 * @returns {TextOutput} レスポンス
 */
function handleWebhook(e) {
  try {
    const json = JSON.parse(e.postData.contents);
    
    json.events.forEach(event => {
      const userId = event.source.userId;
      const replyToken = event.replyToken;
      
      if (!userId) return;
      
      Logger.log('Webhook event: ' + event.type);
      
      switch (event.type) {
        case 'message':
          handleMessageEvent(event, userId, replyToken);
          break;
        case 'follow':
          // 友だち追加 → プロフィール収集開始
          handleFollowEventWithProfile(userId, replyToken);
          break;
        case 'unfollow':
          handleUnfollowEvent(event);
          break;
        case 'postback':
          handlePostbackEventWithProfile(event, userId, replyToken);
          break;
        default:
          Logger.log('Unknown event type: ' + event.type);
      }
    });
    
    return ContentService.createTextOutput('OK');
  } catch (error) {
    Logger.log('Webhook error: ' + error.toString());
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}

/**
 * メッセージイベントを処理する
 * @param {Object} event - LINEイベント
 * @param {string} userId - ユーザーID
 * @param {string} replyToken - リプライトークン
 */
function handleMessageEvent(event, userId, replyToken) {
  const message = event.message;
  
  // テキストメッセージの場合
  if (message.type === 'text') {
    // プロフィール収集フローを優先処理
    const handled = handleProfileTextMessage(userId, message.text, replyToken);
    if (handled) return;
  }
  
  // メッセージをスプレッドシートに保存
  saveIncomingMessage(event);
}

/**
 * ポストバックイベントを処理する（プロフィール収集統合）
 * @param {Object} event - LINEイベント
 * @param {string} userId - ユーザーID
 * @param {string} replyToken - リプライトークン
 */
function handlePostbackEventWithProfile(event, userId, replyToken) {
  const data = event.postback.data;
  Logger.log('Postback data: ' + data);
  
  // プロフィール収集フローを優先処理
  const handled = handleProfilePostback(userId, data, replyToken);
  if (handled) return;
  
  // それ以外のポストバック（管理画面からの操作など）
  const params = {};
  data.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    params[key] = decodeURIComponent(value || '');
  });
  
  switch (params.action) {
    case 'select_grade':
      updateUserField(userId, 'grade', params.value);
      break;
    case 'select_region':
      updateUserField(userId, 'region', params.value);
      break;
    case 'select_plan':
      updateUserField(userId, 'plan', params.value);
      break;
    default:
      Logger.log('Unhandled postback: ' + data);
  }
}

/**
 * 受信メッセージを保存する
 * @param {Object} event - LINEイベント
 */
function saveIncomingMessage(event) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('messages');
  if (!sheet) return;
  
  const message = event.message;
  
  let content = '';
  let mediaUrl = '';
  
  switch (message.type) {
    case 'text':
      content = message.text || '';
      break;
    case 'image':
      content = '[画像]';
      break;
    case 'sticker':
      content = '[スタンプ]';
      break;
    case 'video':
      content = '[動画]';
      break;
    case 'audio':
      content = '[音声]';
      break;
    case 'location':
      content = '[位置情報] ' + (message.address || '');
      break;
    default:
      content = '[' + message.type + ']';
  }
  
  sheet.appendRow([
    'msg_' + Date.now(),
    event.source.userId,
    'incoming',
    message.type,
    content,
    mediaUrl,
    new Date(event.timestamp),
    ''
  ]);
  
  // 未読カウントを増やす
  incrementUnreadCount(event.source.userId);
  
  Logger.log('Message saved: ' + content);
}

/**
 * アンフォローイベントを処理する
 * @param {Object} event - LINEイベント
 */
function handleUnfollowEvent(event) {
  const userId = event.source.userId;
  Logger.log('User unfollowed: ' + userId);
}

/**
 * ユーザーの特定フィールドを更新する
 * @param {string} userId - LINE User ID
 * @param {string} field - フィールド名
 * @param {any} value - 値
 */
function updateUserField(userId, field, value) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const fieldCol = headers.indexOf(field);
  
  if (fieldCol < 0) {
    Logger.log('Unknown field: ' + field);
    return;
  }
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      sheet.getRange(i + 1, fieldCol + 1).setValue(value);
      
      const updatedAtCol = headers.indexOf('updatedAt');
      if (updatedAtCol >= 0) {
        sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date());
      }
      
      Logger.log('Updated ' + field + ' for user ' + userId);
      return;
    }
  }
  
  Logger.log('User not found: ' + userId);
}
