// ==============================
// Delivery.gs - 配信機能API
// ==============================

/**
 * 統計情報を取得する
 * @returns {Object} 統計情報
 */
function getStatistics() {
  const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const usersData = usersSheet.getDataRange().getValues();
  
  if (usersData.length <= 1) {
    return {
      totalUsers: 0,
      basicUsers: 0,
      freeUsers: 0,
      grade3Users: 0,
      diagnosisCompleted: 0
    };
  }
  
  const headers = usersData[0];
  const users = usersData.slice(1);
  const planCol = headers.indexOf('plan');
  const gradeCol = headers.indexOf('grade');
  const diagnosisCol = headers.indexOf('diagnosisType');
  
  return {
    totalUsers: users.length,
    basicUsers: planCol >= 0 ? users.filter(r => r[planCol] === 'BASIC').length : 0,
    freeUsers: planCol >= 0 ? users.filter(r => r[planCol] === 'FREE').length : 0,
    grade3Users: gradeCol >= 0 ? users.filter(r => r[gradeCol] === '高3').length : 0,
    diagnosisCompleted: diagnosisCol >= 0 ? users.filter(r => r[diagnosisCol]).length : 0
  };
}

/**
 * 配信履歴を取得する
 * @param {Object} params - クエリパラメータ
 * @returns {Array} 配信履歴一覧
 */
function getDeliveryLogs(params) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('delivery_logs');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  if (data.length <= 1) {
    return [];
  }
  
  const logs = data.slice(1).map(row => {
    const log = {};
    headers.forEach((h, i) => {
      log[h] = row[i];
    });
    
    // 日付をISO文字列に変換
    if (log.scheduledAt instanceof Date) {
      log.scheduledAt = log.scheduledAt.toISOString();
    }
    if (log.sentAt instanceof Date) {
      log.sentAt = log.sentAt.toISOString();
    }
    if (log.createdAt instanceof Date) {
      log.createdAt = log.createdAt.toISOString();
    }
    
    // JSONフィールドをパース
    try {
      if (log.targetFilter && typeof log.targetFilter === 'string') {
        log.targetFilter = JSON.parse(log.targetFilter);
      }
      if (log.messageContent && typeof log.messageContent === 'string') {
        log.messageContent = JSON.parse(log.messageContent);
      }
    } catch (e) {
      // パース失敗時はそのまま
    }
    
    return log;
  }).filter(l => l.deliveryId);
  
  // 新しい順にソート
  logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const limit = parseInt(params.limit) || 50;
  return logs.slice(0, limit);
}

/**
 * 一斉配信を実行する
 * @param {Object} messageData - メッセージデータ
 * @returns {Object} 配信結果
 */
function broadcastMessage(messageData) {
  const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const usersData = usersSheet.getDataRange().getValues();
  const headers = usersData[0];
  const userIdCol = headers.indexOf('userId');
  
  if (userIdCol < 0 || usersData.length <= 1) {
    return { success: false, targetCount: 0, error: 'No users found' };
  }
  
  const userIds = usersData.slice(1)
    .map(row => row[userIdCol])
    .filter(id => id);
  
  // LINE Messaging APIでブロードキャスト
  const url = 'https://api.line.me/v2/bot/message/broadcast';
  
  const payload = {
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
  
  // 配信ログを保存
  const logsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('delivery_logs');
  const now = new Date();
  
  logsSheet.appendRow([
    'del_' + Date.now(),
    'broadcast',
    '{}',
    userIds.length,
    JSON.stringify({ type: 'text', text: messageData.content }),
    responseCode === 200 ? 'sent' : 'failed',
    '',  // scheduledAt
    now,  // sentAt
    'admin',  // createdBy
    now  // createdAt
  ]);
  
  if (responseCode !== 200) {
    Logger.log('Broadcast Error: ' + response.getContentText());
    return { success: false, targetCount: userIds.length, error: response.getContentText() };
  }
  
  return { success: true, targetCount: userIds.length };
}

/**
 * セグメント配信を実行する
 * @param {Object} filter - フィルター条件
 * @param {Object} messageData - メッセージデータ
 * @returns {Object} 配信結果
 */
function segmentDelivery(filter, messageData) {
  const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const usersData = usersSheet.getDataRange().getValues();
  const headers = usersData[0];
  
  // フィルタリング
  let targetUsers = usersData.slice(1);
  
  if (filter.grade) {
    const gradeCol = headers.indexOf('grade');
    if (gradeCol >= 0) {
      targetUsers = targetUsers.filter(row => row[gradeCol] === filter.grade);
    }
  }
  if (filter.region) {
    const regionCol = headers.indexOf('region');
    if (regionCol >= 0) {
      targetUsers = targetUsers.filter(row => row[regionCol] === filter.region);
    }
  }
  if (filter.plan) {
    const planCol = headers.indexOf('plan');
    if (planCol >= 0) {
      targetUsers = targetUsers.filter(row => row[planCol] === filter.plan);
    }
  }
  
  const userIdCol = headers.indexOf('userId');
  const userIds = targetUsers.map(row => row[userIdCol]).filter(id => id);
  
  if (userIds.length === 0) {
    return { success: false, targetCount: 0, error: 'No matching users' };
  }
  
  // マルチキャスト送信（最大500人まで）
  const url = 'https://api.line.me/v2/bot/message/multicast';
  
  const payload = {
    to: userIds.slice(0, 500),
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
  
  // 配信ログを保存
  const logsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('delivery_logs');
  const now = new Date();
  
  logsSheet.appendRow([
    'del_' + Date.now(),
    'segment',
    JSON.stringify(filter),
    userIds.length,
    JSON.stringify({ type: 'text', text: messageData.content }),
    responseCode === 200 ? 'sent' : 'failed',
    '',  // scheduledAt
    now,  // sentAt
    'admin',
    now
  ]);
  
  if (responseCode !== 200) {
    Logger.log('Segment Delivery Error: ' + response.getContentText());
    return { success: false, targetCount: userIds.length, error: response.getContentText() };
  }
  
  return { success: true, targetCount: userIds.length };
}

/**
 * 予約配信を作成する
 * @param {Object|null} filter - フィルター条件
 * @param {string} content - メッセージ内容
 * @param {string} scheduledAt - 配信予定日時（ISO形式）
 * @returns {Object} 作成結果
 */
function scheduleDelivery(filter, content, scheduledAt) {
  const logsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('delivery_logs');
  const deliveryId = 'del_' + Date.now();
  const now = new Date();
  
  // 対象者数を計算
  let targetCount = 0;
  const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const usersData = usersSheet.getDataRange().getValues();
  
  if (filter && Object.keys(filter).length > 0) {
    const headers = usersData[0];
    let targetUsers = usersData.slice(1);
    
    if (filter.grade) {
      const gradeCol = headers.indexOf('grade');
      targetUsers = targetUsers.filter(row => row[gradeCol] === filter.grade);
    }
    if (filter.region) {
      const regionCol = headers.indexOf('region');
      targetUsers = targetUsers.filter(row => row[regionCol] === filter.region);
    }
    if (filter.plan) {
      const planCol = headers.indexOf('plan');
      targetUsers = targetUsers.filter(row => row[planCol] === filter.plan);
    }
    
    targetCount = targetUsers.length;
  } else {
    targetCount = usersData.length - 1;  // ヘッダー行を除く
  }
  
  // 配信ログを保存（pending状態）
  logsSheet.appendRow([
    deliveryId,
    filter ? 'segment' : 'broadcast',
    JSON.stringify(filter || {}),
    targetCount,
    JSON.stringify({ type: 'text', text: content }),
    'pending',
    new Date(scheduledAt),
    '',  // sentAt (まだ送信されていない)
    'admin',
    now
  ]);
  
  return {
    success: true,
    deliveryId: deliveryId,
    targetCount: targetCount,
    scheduledAt: scheduledAt
  };
}

/**
 * 予約配信を実行する（時間トリガーから呼び出し）
 */
function executePendingDeliveries() {
  const logsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('delivery_logs');
  const data = logsSheet.getDataRange().getValues();
  const headers = data[0];
  
  const statusCol = headers.indexOf('status');
  const scheduledAtCol = headers.indexOf('scheduledAt');
  const sentAtCol = headers.indexOf('sentAt');
  const filterCol = headers.indexOf('targetFilter');
  const contentCol = headers.indexOf('messageContent');
  const typeCol = headers.indexOf('deliveryType');
  
  const now = new Date();
  
  for (let i = 1; i < data.length; i++) {
    const status = data[i][statusCol];
    const scheduledAt = data[i][scheduledAtCol];
    
    if (status === 'pending' && scheduledAt && new Date(scheduledAt) <= now) {
      try {
        const filter = JSON.parse(data[i][filterCol] || '{}');
        const messageContent = JSON.parse(data[i][contentCol] || '{}');
        const deliveryType = data[i][typeCol];
        
        let result;
        if (deliveryType === 'broadcast' || Object.keys(filter).length === 0) {
          result = broadcastMessage({ content: messageContent.text });
        } else {
          result = segmentDelivery(filter, { content: messageContent.text });
        }
        
        // ステータスを更新
        logsSheet.getRange(i + 1, statusCol + 1).setValue(result.success ? 'sent' : 'failed');
        logsSheet.getRange(i + 1, sentAtCol + 1).setValue(new Date());
        
      } catch (error) {
        Logger.log('Scheduled delivery error: ' + error.toString());
        logsSheet.getRange(i + 1, statusCol + 1).setValue('failed');
      }
    }
  }
}
