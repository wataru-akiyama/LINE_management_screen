// ==============================
// OnboardingFlow.gs - 友達追加フロー設定管理
// ==============================

/**
 * フロー設定シートのセットアップ
 */
function setupOnboardingFlowSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // onboarding_flow_settings シート
  let sheet = ss.getSheetByName('onboarding_flow_settings');
  if (!sheet) {
    sheet = ss.insertSheet('onboarding_flow_settings');
    sheet.appendRow([
      'key', 'value', 'updatedAt'
    ]);
    
    // デフォルト設定
    const now = new Date().toISOString();
    sheet.appendRow(['diagnosisEnabled', 'true', now]);
    sheet.appendRow(['diagnosisTemplateId', '', now]);
    sheet.appendRow(['profileFields', JSON.stringify(['name', 'grade', 'region', 'prefecture', 'teamName']), now]);
    sheet.appendRow(['applyRichMenu', 'true', now]);
    sheet.appendRow(['completionMessage', 'ありがとうございます！', now]);
  }
  
  Logger.log('Onboarding flow settings sheet ready');
}

/**
 * フロー設定を取得
 */
function getOnboardingFlowSettings() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('onboarding_flow_settings');
  
  if (!sheet) {
    // デフォルト設定を返す
    return {
      diagnosisEnabled: true,
      diagnosisTemplateId: '',
      profileFields: ['name', 'grade', 'region', 'prefecture', 'teamName'],
      applyRichMenu: true,
      completionMessage: 'ありがとうございます！'
    };
  }
  
  const data = sheet.getDataRange().getValues();
  const settings = {};
  
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    let value = data[i][1];
    
    // JSON parse for arrays
    if (key === 'profileFields') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        value = ['name', 'grade', 'region', 'prefecture', 'teamName'];
      }
    }
    
    // Boolean conversion
    if (key === 'diagnosisEnabled' || key === 'applyRichMenu') {
      value = value === 'true' || value === true;
    }
    
    settings[key] = value;
  }
  
  return settings;
}

/**
 * フロー設定を更新
 */
function updateOnboardingFlowSettings(newSettings) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('onboarding_flow_settings');
  
  if (!sheet) {
    setupOnboardingFlowSheet();
    sheet = ss.getSheetByName('onboarding_flow_settings');
  }
  
  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  
  Object.keys(newSettings).forEach(key => {
    let value = newSettings[key];
    
    // Array to JSON string
    if (Array.isArray(value)) {
      value = JSON.stringify(value);
    }
    
    // Boolean to string
    if (typeof value === 'boolean') {
      value = value ? 'true' : 'false';
    }
    
    // Find and update or append
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        sheet.getRange(i + 1, 3).setValue(now);
        found = true;
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([key, value, now]);
    }
  });
  
  return { success: true };
}

/**
 * プロフィール収集フィールドの定義
 */
function getProfileFieldDefinitions() {
  return [
    { id: 'name', label: 'お名前', type: 'text', required: true },
    { id: 'grade', label: '学年', type: 'select', required: true, options: ['高1', '高2', '高3', '保護者', '指導者'] },
    { id: 'region', label: '地域', type: 'region', required: true },
    { id: 'prefecture', label: '都道府県', type: 'prefecture', required: true },
    { id: 'teamName', label: 'チーム名', type: 'text', required: false }
  ];
}

/**
 * 利用可能な診断テンプレート一覧を取得
 */
function getAvailableDiagnosisTemplates() {
  try {
    const result = getDiagnosisTemplates();
    // activeなテンプレートのみ返す
    const activeTemplates = (result.templates || []).filter(t => t.status === 'active');
    return { templates: activeTemplates };
  } catch (e) {
    Logger.log('Error getting diagnosis templates: ' + e);
    return { templates: [] };
  }
}

// ==============================
// 動的フロー実行
// ==============================

/**
 * 設定に基づいてオンボーディングフローを開始
 */
function startOnboardingFlow(userId, replyToken) {
  const settings = getOnboardingFlowSettings();
  
  // 既存ユーザーチェック
  const existingUser = getProfileUserData(userId);
  if (existingUser && existingUser.name && existingUser.region) {
    const welcomeBackMessage = {
      type: 'text',
      text: `おかえりなさい、${existingUser.name}さん！\nまたお会いできて嬉しいです😊`
    };
    replyLineMessage(replyToken, [welcomeBackMessage]);
    return;
  }
  
  // 新規ユーザー
  const welcomeMessage = {
    type: 'text',
    text: '友だち追加ありがとうございます⚽️\n\n簡単な質問に答えるだけで、\nあなたの進路の考え方を整理できます。'
  };
  
  if (settings.diagnosisEnabled && settings.diagnosisTemplateId) {
    // 診断テンプレートを使用したフロー
    initializeDynamicDiagnosis(userId, settings.diagnosisTemplateId);
    const startMessage = createDynamicDiagnosisStartQuestion(settings.diagnosisTemplateId);
    replyLineMessage(replyToken, [welcomeMessage, startMessage]);
    updateProfileUserState(userId, 'waiting_diagnosis_start');
    saveTempData(userId, 'onboarding_template_id', settings.diagnosisTemplateId);
  } else if (settings.diagnosisEnabled) {
    // 従来のハードコード診断を使用
    initializeDiagnosisScores(userId);
    const startMessage = createDiagnosisStartQuestion();
    replyLineMessage(replyToken, [welcomeMessage, startMessage]);
    updateProfileUserState(userId, 'waiting_diagnosis_start');
  } else {
    // 診断なし、プロフィール収集のみ
    replyLineMessage(replyToken, [
      welcomeMessage,
      { type: 'text', text: 'あなたに合った情報をお届けするために、簡単なプロフィール登録にご協力ください。' },
      createNameQuestionMessage()
    ]);
    updateProfileUserState(userId, 'waiting_name');
  }
}

/**
 * 動的診断の初期化
 */
function initializeDynamicDiagnosis(userId, templateId) {
  const template = getDiagnosisTemplate(templateId);
  if (!template || !template.resultTypes) {
    Logger.log('Template not found: ' + templateId);
    return;
  }
  
  // 結果タイプごとのスコアを0で初期化
  const scores = {};
  template.resultTypes.forEach(rt => {
    scores[rt.typeId] = 0;
  });
  
  saveTempData(userId, 'dynamic_diagnosis_scores', scores);
  saveTempData(userId, 'dynamic_diagnosis_current_q', 0);
}

/**
 * 動的診断の開始質問を作成
 */
function createDynamicDiagnosisStartQuestion(templateId) {
  const template = getDiagnosisTemplate(templateId);
  const questionCount = template && template.questions ? template.questions.length : 8;
  
  return {
    type: 'template',
    altText: '志向性診断を始めますか？',
    template: {
      type: 'confirm',
      text: `全${questionCount}問・約1分で完了します。\n診断を始めますか？`,
      actions: [
        { type: 'postback', label: 'はい', data: 'start_diagnosis=yes' },
        { type: 'postback', label: 'スキップ', data: 'start_diagnosis=no' }
      ]
    }
  };
}
