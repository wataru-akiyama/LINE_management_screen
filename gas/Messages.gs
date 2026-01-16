// ==============================
// Messages.gs - メッセージ管理API
// ==============================

/**
 * チャット履歴を取得する
 * @param {string} userId - LINE User ID
 * @param {Object} params - クエリパラメータ
 * @returns {Object} メッセージ一覧
 */
function getMessages(userId, params) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('messages');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // データが1行（ヘッダーのみ）の場合
  if (data.length <= 1) {
    return { messages: [], hasMore: false };
  }
  
  // メッセージをオブジェクトに変換
  let messages = data.slice(1)
    .map(row => {
      const msg = {};
      headers.forEach((h, i) => msg[h] = row[i]);
      
      // 日付をISO文字列に変換
      if (msg.sentAt instanceof Date) {
        msg.sentAt = msg.sentAt.toISOString();
      }
      
      return msg;
    })
    .filter(msg => msg.userId === userId)
    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
  
  const limit = parseInt(params.limit) || 50;
  const totalMessages = messages.length;
  
  // 最新のメッセージを取得（古い順に表示するため）
  if (messages.length > limit) {
    messages = messages.slice(-limit);
  }
  
  return {
    messages,
    hasMore: totalMessages > limit
  };
}

/**
 * メッセージを送信する
 * @param {string} userId - LINE User ID
 * @param {Object} messageData - メッセージデータ
 * @returns {Object} 送信結果
 */
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
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  
  if (responseCode !== 200) {
    Logger.log('LINE API Error: ' + response.getContentText());
    throw new Error('LINE API Error: ' + response.getContentText());
  }
  
  // メッセージをシートに保存
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('messages');
  const messageId = 'msg_' + Date.now();
  const now = new Date();
  
  sheet.appendRow([
    messageId,
    userId,
    'outgoing',
    messageData.messageType || 'text',
    messageData.content,
    '',  // mediaUrl
    now,
    'admin'  // sentBy
  ]);
  
  // 送信したメッセージオブジェクトを返す
  return {
    messageId: messageId,
    userId: userId,
    direction: 'outgoing',
    messageType: messageData.messageType || 'text',
    content: messageData.content,
    sentAt: now.toISOString(),
    sentBy: 'admin'
  };
}

/**
 * メッセージを既読にする（将来拡張用）
 * @param {string} userId - LINE User ID
 */
function markMessagesAsRead(userId) {
  // 現時点では実装しない
  // 将来的には未読管理のためのフラグを更新
  return { success: true };
}
