// ==============================
// MOISH LINE管理画面 バックエンド
// Code.gs - メインエントリーポイント
// ==============================

// 設定（スクリプトプロパティから取得）
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
const LINE_CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
const LINE_CHANNEL_SECRET = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_SECRET');
const API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY');

// ==============================
// エントリーポイント
// ==============================

/**
 * GETリクエストのハンドラー
 */
function doGet(e) {
  // CORS対応
  return handleRequest(e, 'GET');
}

/**
 * POSTリクエストのハンドラー
 */
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
// APIリクエスト処理
// ==============================

/**
 * APIリクエストを処理する
 * @param {Object} e - イベントオブジェクト
 * @param {string} method - HTTPメソッド
 */
function handleRequest(e, method) {
  // CORS対応ヘッダー
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // 認証チェック
  const apiKey = e.parameter.apiKey;
  if (apiKey !== API_KEY) {
    return jsonResponse({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: '認証エラー' } 
    });
  }
  
  const action = e.parameter.action || '';
  
  try {
    let result;
    
    switch (action) {
      // ユーザー管理
      case 'getUsers':
        result = getUsers(e.parameter);
        break;
      case 'getUser':
        result = getUser(e.parameter.userId);
        break;
      case 'updateUser':
        result = updateUser(e.parameter.userId, JSON.parse(e.parameter.data || '{}'));
        break;
      case 'updateUserStatus':
        result = updateUser(e.parameter.userId, { status: e.parameter.status });
        break;
      case 'resetUnreadCount':
        result = resetUnreadCount(e.parameter.userId);
        break;
        
      // メッセージ管理
      case 'getMessages':
        result = getMessages(e.parameter.userId, e.parameter);
        break;
      case 'sendMessage':
        result = sendMessage(e.parameter.userId, JSON.parse(e.parameter.data || '{}'));
        break;
      case 'getUnreadCount':
        result = getTotalUnreadCount();
        break;
        
      // 統計
      case 'getStatistics':
        result = getStatistics();
        break;
        
      // 配信
      case 'broadcast':
        result = broadcastMessage(JSON.parse(e.parameter.data || '{}'));
        break;
      case 'segmentDelivery':
        result = segmentDelivery(
          JSON.parse(e.parameter.filter || '{}'),
          JSON.parse(e.parameter.message || '{}')
        );
        break;
      case 'scheduleDelivery':
        result = scheduleDelivery(
          JSON.parse(e.parameter.filter || 'null'),
          e.parameter.content,
          e.parameter.scheduledAt
        );
        break;
      case 'getDeliveryLogs':
        result = getDeliveryLogs(e.parameter);
        break;
        
      // ステップ配信設定
      case 'getStepDeliveryConfigs':
        result = getStepDeliveryConfigs();
        break;
      case 'updateStepDeliveryConfig':
        result = updateStepDeliveryConfig(e.parameter.stepId, JSON.parse(e.parameter.data || '{}'));
        break;
        
      // 診断履歴
      case 'getDiagnosisHistory':
        result = getDiagnosisHistory(e.parameter.userId);
        break;
      case 'getDiagnosisQuestionTexts':
        result = getDiagnosisQuestionTexts();
        break;
        
      // テンプレート管理
      case 'getTemplates':
        result = getTemplates(e.parameter);
        break;
      case 'createTemplate':
        result = createTemplate(JSON.parse(e.parameter.data || '{}'));
        break;
      case 'updateTemplate':
        result = updateTemplate(e.parameter.templateId, JSON.parse(e.parameter.data || '{}'));
        break;
      case 'deleteTemplate':
        result = deleteTemplate(e.parameter.templateId);
        break;
      case 'getTemplateCategories':
        result = getTemplateCategories();
        break;
        
      // メッセージ使用量
      case 'getMessageQuota':
        result = getMessageQuota();
        break;
        
      default:
        result = { error: 'Unknown action: ' + action };
    }
    
    return jsonResponse({ success: true, data: result });
  } catch (error) {
    Logger.log('API Error: ' + error.toString());
    return jsonResponse({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: error.toString() } 
    });
  }
}

/**
 * JSONレスポンスを生成する
 * @param {Object} data - レスポンスデータ
 * @returns {TextOutput} JSONレスポンス
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==============================
// 初期セットアップ
// ==============================

/**
 * スプレッドシートの初期セットアップを行う
 * 初回デプロイ時に手動で実行
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // usersシート
  let usersSheet = ss.getSheetByName('users');
  if (!usersSheet) {
    usersSheet = ss.insertSheet('users');
    usersSheet.getRange(1, 1, 1, 13).setValues([[
      'userId', 'name', 'grade', 'region', 'prefecture', 
      'teamName', 'plan', 'lineId', 'registeredAt', 'updatedAt',
      'universities', 'diagnosisType', 'diagnosisCompletedAt', 'customTags'
    ]]);
  }
  
  // messagesシート
  let messagesSheet = ss.getSheetByName('messages');
  if (!messagesSheet) {
    messagesSheet = ss.insertSheet('messages');
    messagesSheet.getRange(1, 1, 1, 8).setValues([[
      'messageId', 'userId', 'direction', 'messageType', 
      'content', 'mediaUrl', 'sentAt', 'sentBy'
    ]]);
  }
  
  // surveysシート
  let surveysSheet = ss.getSheetByName('surveys');
  if (!surveysSheet) {
    surveysSheet = ss.insertSheet('surveys');
    surveysSheet.getRange(1, 1, 1, 5).setValues([[
      'surveyId', 'userId', 'surveyType', 'answers', 'submittedAt'
    ]]);
  }
  
  // delivery_logsシート
  let deliveryLogsSheet = ss.getSheetByName('delivery_logs');
  if (!deliveryLogsSheet) {
    deliveryLogsSheet = ss.insertSheet('delivery_logs');
    deliveryLogsSheet.getRange(1, 1, 1, 10).setValues([[
      'deliveryId', 'deliveryType', 'targetFilter', 'targetCount',
      'messageContent', 'status', 'scheduledAt', 'sentAt', 'createdBy', 'createdAt'
    ]]);
  }
  
  // step_delivery_configシート
  let stepDeliverySheet = ss.getSheetByName('step_delivery_config');
  if (!stepDeliverySheet) {
    stepDeliverySheet = ss.insertSheet('step_delivery_config');
    stepDeliverySheet.getRange(1, 1, 1, 7).setValues([[
      'stepId', 'stepName', 'daysAfterRegistration', 'targetFilter',
      'messageContent', 'isActive', 'createdAt'
    ]]);
  }
  
  Logger.log('スプレッドシートのセットアップが完了しました');
}

// ==============================
// メッセージ使用量取得
// ==============================

/**
 * LINE Messaging APIからメッセージ使用量を取得
 * @return {Object} quota情報
 */
function getMessageQuota() {
  const headers = {
    'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
  };
  
  try {
    // メッセージ上限を取得
    const quotaResponse = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/quota', {
      method: 'get',
      headers: headers,
      muteHttpExceptions: true
    });
    const quotaData = JSON.parse(quotaResponse.getContentText());
    
    // 今月の使用量を取得
    const consumptionResponse = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/quota/consumption', {
      method: 'get',
      headers: headers,
      muteHttpExceptions: true
    });
    const consumptionData = JSON.parse(consumptionResponse.getContentText());
    
    // 上限種別を判定
    let quotaType = 'limited'; // limited or unlimited
    let limit = 0;
    
    if (quotaData.type === 'limited') {
      limit = quotaData.value || 0;
    } else {
      quotaType = 'unlimited';
      limit = -1; // 無制限
    }
    
    const used = consumptionData.totalUsage || 0;
    const remaining = quotaType === 'unlimited' ? -1 : Math.max(0, limit - used);
    
    return {
      quotaType: quotaType,
      limit: limit,
      used: used,
      remaining: remaining,
      percentage: quotaType === 'unlimited' ? 0 : (limit > 0 ? Math.round((used / limit) * 100) : 0)
    };
  } catch (error) {
    Logger.log('getMessageQuota error: ' + error.toString());
    return {
      quotaType: 'unknown',
      limit: 0,
      used: 0,
      remaining: 0,
      percentage: 0,
      error: error.toString()
    };
  }
}
