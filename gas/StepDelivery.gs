// ==============================
// StepDelivery.gs - ステップ配信設定API
// ==============================

/**
 * ステップ配信設定一覧を取得する
 * @returns {Array} ステップ配信設定一覧
 */
function getStepDeliveryConfigs() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('step_delivery_config');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  if (data.length <= 1) {
    return [];
  }
  
  const configs = data.slice(1).map(row => {
    const config = {};
    headers.forEach((h, i) => {
      config[h] = row[i];
    });
    
    // 日付をISO文字列に変換
    if (config.createdAt instanceof Date) {
      config.createdAt = config.createdAt.toISOString();
    }
    
    // JSONフィールドをパース
    try {
      if (config.targetFilter && typeof config.targetFilter === 'string') {
        config.targetFilter = JSON.parse(config.targetFilter);
      }
      if (config.messageContent && typeof config.messageContent === 'string') {
        config.messageContent = JSON.parse(config.messageContent);
      }
    } catch (e) {
      // パース失敗時はそのまま
    }
    
    // isActiveをboolean型に変換
    config.isActive = config.isActive === true || config.isActive === 'TRUE' || config.isActive === 1;
    
    return config;
  }).filter(c => c.stepId);
  
  // daysAfterRegistrationでソート
  configs.sort((a, b) => (a.daysAfterRegistration || 0) - (b.daysAfterRegistration || 0));
  
  return configs;
}

/**
 * ステップ配信設定を更新する
 * @param {string} stepId - ステップID
 * @param {Object} updateData - 更新データ
 * @returns {Object} 更新結果
 */
function updateStepDeliveryConfig(stepId, updateData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('step_delivery_config');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === stepId) {
      Object.keys(updateData).forEach(key => {
        const colIndex = headers.indexOf(key);
        if (colIndex >= 0) {
          let value = updateData[key];
          // オブジェクトや配列はJSON文字列に変換
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          sheet.getRange(i + 1, colIndex + 1).setValue(value);
        }
      });
      
      return { success: true, stepId: stepId };
    }
  }
  
  throw new Error('Step config not found: ' + stepId);
}

/**
 * ステップ配信設定を作成する
 * @param {Object} configData - 設定データ
 * @returns {Object} 作成結果
 */
function createStepDeliveryConfig(configData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('step_delivery_config');
  const stepId = 'step_' + Date.now();
  const now = new Date();
  
  sheet.appendRow([
    stepId,
    configData.stepName || '',
    configData.daysAfterRegistration || 0,
    JSON.stringify(configData.targetFilter || {}),
    JSON.stringify(configData.messageContent || {}),
    configData.isActive !== false,  // デフォルトはtrue
    now
  ]);
  
  return { success: true, stepId: stepId };
}

/**
 * ステップ配信を実行する（日次トリガーから呼び出し）
 * 登録後N日目のユーザーに対してメッセージを送信
 */
function executeStepDeliveries() {
  const configs = getStepDeliveryConfigs().filter(c => c.isActive);
  
  if (configs.length === 0) {
    Logger.log('No active step delivery configs');
    return;
  }
  
  const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const usersData = usersSheet.getDataRange().getValues();
  const headers = usersData[0];
  
  const userIdCol = headers.indexOf('userId');
  const registeredAtCol = headers.indexOf('registeredAt');
  const planCol = headers.indexOf('plan');
  const gradeCol = headers.indexOf('grade');
  const regionCol = headers.indexOf('region');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  configs.forEach(config => {
    const targetDays = config.daysAfterRegistration;
    
    // 対象ユーザーを抽出
    const targetUsers = usersData.slice(1).filter(row => {
      const registeredAt = row[registeredAtCol];
      if (!registeredAt) return false;
      
      const regDate = new Date(registeredAt);
      regDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - regDate) / (1000 * 60 * 60 * 24));
      if (daysDiff !== targetDays) return false;
      
      // フィルター条件をチェック
      if (config.targetFilter) {
        if (config.targetFilter.plan && row[planCol] !== config.targetFilter.plan) return false;
        if (config.targetFilter.grade && row[gradeCol] !== config.targetFilter.grade) return false;
        if (config.targetFilter.region && row[regionCol] !== config.targetFilter.region) return false;
      }
      
      return true;
    });
    
    if (targetUsers.length === 0) {
      Logger.log('No users for step: ' + config.stepName);
      return;
    }
    
    // メッセージを送信
    const userIds = targetUsers.map(row => row[userIdCol]);
    
    try {
      const url = 'https://api.line.me/v2/bot/message/multicast';
      const content = config.messageContent.text || config.messageContent;
      
      const payload = {
        to: userIds.slice(0, 500),
        messages: [{
          type: 'text',
          text: content
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
      Logger.log('Step delivery sent: ' + config.stepName + ' to ' + userIds.length + ' users');
      
    } catch (error) {
      Logger.log('Step delivery error: ' + error.toString());
    }
  });
}

/**
 * ステップ配信の日次トリガーをセットアップする
 * 初回デプロイ時に手動で実行
 */
function setupStepDeliveryTrigger() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'executeStepDeliveries') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // 毎日午前9時にステップ配信を実行
  ScriptApp.newTrigger('executeStepDeliveries')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();
  
  Logger.log('Step delivery trigger created');
}

/**
 * 予約配信の時間トリガーをセットアップする
 * 初回デプロイ時に手動で実行
 */
function setupScheduledDeliveryTrigger() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'executePendingDeliveries') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // 5分ごとに予約配信をチェック
  ScriptApp.newTrigger('executePendingDeliveries')
    .timeBased()
    .everyMinutes(5)
    .create();
  
  Logger.log('Scheduled delivery trigger created');
}
