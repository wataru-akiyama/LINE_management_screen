// ==============================
// Templates.gs - テンプレート管理API
// ==============================

/**
 * テンプレートシートのセットアップ
 */
function setupTemplatesSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('templates');
  
  if (!sheet) {
    sheet = ss.insertSheet('templates');
    sheet.appendRow([
      'templateId', 'name', 'content', 'category', 'createdAt', 'updatedAt'
    ]);
  }
  
  Logger.log('templates sheet ready');
}

/**
 * テンプレート一覧を取得
 * @param {Object} params - クエリパラメータ
 * @returns {Array} テンプレート一覧
 */
function getTemplates(params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('templates');
  
  if (!sheet) {
    setupTemplatesSheet();
    sheet = ss.getSheetByName('templates');
  }
  
  if (sheet.getLastRow() <= 1) {
    return { templates: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let templates = data.slice(1).map(row => {
    const template = {};
    headers.forEach((h, i) => {
      template[h] = row[i];
    });
    
    // 日付をISO文字列に変換
    if (template.createdAt instanceof Date) {
      template.createdAt = template.createdAt.toISOString();
    }
    if (template.updatedAt instanceof Date) {
      template.updatedAt = template.updatedAt.toISOString();
    }
    
    return template;
  }).filter(t => t.templateId);
  
  // カテゴリでフィルター
  if (params && params.category) {
    templates = templates.filter(t => t.category === params.category);
  }
  
  // 作成日の新しい順にソート
  templates.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });
  
  return { templates };
}

/**
 * テンプレートを作成
 * @param {Object} data - テンプレートデータ
 * @returns {Object} 作成結果
 */
function createTemplate(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('templates');
  
  if (!sheet) {
    setupTemplatesSheet();
    sheet = ss.getSheetByName('templates');
  }
  
  const templateId = 'tpl_' + Date.now();
  const now = new Date();
  
  sheet.appendRow([
    templateId,
    data.name || '',
    data.content || '',
    data.category || '未分類',
    now,
    now
  ]);
  
  return {
    success: true,
    templateId: templateId,
    template: {
      templateId,
      name: data.name,
      content: data.content,
      category: data.category || '未分類',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  };
}

/**
 * テンプレートを更新
 * @param {string} templateId - テンプレートID
 * @param {Object} data - 更新データ
 * @returns {Object} 更新結果
 */
function updateTemplate(templateId, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('templates');
  
  if (!sheet) {
    throw new Error('Templates sheet not found');
  }
  
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0];
  
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === templateId) {
      // 更新
      if (data.name !== undefined) {
        const nameCol = headers.indexOf('name');
        if (nameCol >= 0) sheet.getRange(i + 1, nameCol + 1).setValue(data.name);
      }
      if (data.content !== undefined) {
        const contentCol = headers.indexOf('content');
        if (contentCol >= 0) sheet.getRange(i + 1, contentCol + 1).setValue(data.content);
      }
      if (data.category !== undefined) {
        const categoryCol = headers.indexOf('category');
        if (categoryCol >= 0) sheet.getRange(i + 1, categoryCol + 1).setValue(data.category);
      }
      
      // 更新日時
      const updatedAtCol = headers.indexOf('updatedAt');
      if (updatedAtCol >= 0) sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date());
      
      return { success: true, templateId: templateId };
    }
  }
  
  throw new Error('Template not found: ' + templateId);
}

/**
 * テンプレートを削除
 * @param {string} templateId - テンプレートID
 * @returns {Object} 削除結果
 */
function deleteTemplate(templateId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('templates');
  
  if (!sheet) {
    throw new Error('Templates sheet not found');
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === templateId) {
      sheet.deleteRow(i + 1);
      return { success: true, templateId: templateId };
    }
  }
  
  throw new Error('Template not found: ' + templateId);
}

/**
 * カテゴリ一覧を取得
 * @returns {Array} カテゴリ一覧
 */
function getTemplateCategories() {
  const result = getTemplates({});
  const categories = [...new Set(result.templates.map(t => t.category).filter(c => c))];
  return { categories };
}
