// ==============================
// DiagnosisTemplates.gs - 診断テンプレート管理
// ==============================

/**
 * 診断テンプレートシートのセットアップ
 */
function setupDiagnosisTemplatesSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // diagnosis_templates シート
  let templatesSheet = ss.getSheetByName('diagnosis_templates');
  if (!templatesSheet) {
    templatesSheet = ss.insertSheet('diagnosis_templates');
    templatesSheet.appendRow([
      'id', 'name', 'description', 'status', 'createdAt', 'updatedAt'
    ]);
  }
  
  // diagnosis_questions シート
  let questionsSheet = ss.getSheetByName('diagnosis_questions');
  if (!questionsSheet) {
    questionsSheet = ss.insertSheet('diagnosis_questions');
    questionsSheet.appendRow([
      'diagnosisId', 'questionId', 'order', 'type', 'text', 'options', 'scores', 'condition'
    ]);
  }
  
  // diagnosis_result_types シート
  let resultTypesSheet = ss.getSheetByName('diagnosis_result_types');
  if (!resultTypesSheet) {
    resultTypesSheet = ss.insertSheet('diagnosis_result_types');
    resultTypesSheet.appendRow([
      'diagnosisId', 'typeId', 'name', 'description', 'icon'
    ]);
  }
  
  Logger.log('Diagnosis templates sheets ready');
}

/**
 * 既存の志向性診断データをテンプレートとして移行する
 * GASコンソールから一度だけ実行してください
 */
function migrateExistingDiagnosisToTemplate() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // シートが無ければ作成
  setupDiagnosisTemplatesSheet();
  
  const diagnosisId = 'dt_orientation_main';
  const now = new Date().toISOString();
  
  // ===== 1. テンプレート本体を登録 =====
  const templatesSheet = ss.getSheetByName('diagnosis_templates');
  
  // 既存チェック
  const existingData = templatesSheet.getDataRange().getValues();
  let exists = false;
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][0] === diagnosisId) {
      exists = true;
      break;
    }
  }
  
  if (!exists) {
    templatesSheet.appendRow([
      diagnosisId,
      '志向性診断',
      '大学サッカー部志望者向けの志向性診断。全8問の質問に答えることで、6つのタイプの中から最も近いタイプを判定します。',
      'active',
      now,
      now
    ]);
    Logger.log('テンプレート登録完了: 志向性診断');
  } else {
    Logger.log('テンプレートは既に存在します');
  }
  
  // ===== 2. 結果タイプを登録 =====
  const ORIENTATION_TYPES_DATA = {
    A: { name: 'プロ志向型', description: '大学経由でプロを目指したい選手タイプ。高いレベルでの競争環境と、Jリーグへの輩出実績がある大学が向いています。', icon: '🎯' },
    B: { name: 'チャレンジ型', description: '自分がどこまで上を目指せるか挑戦したい選手タイプ。強豪校での切磋琢磨と、自分を高められる環境が向いています。', icon: '🔥' },
    C: { name: 'チーム成長型', description: 'チームと一緒に成長していきたい選手タイプ。一体感のあるチームで、みんなで目標に向かう環境が向いています。', icon: '📈' },
    D: { name: '経験重視型', description: '学生主体の活動でいろんな経験をしたい選手タイプ。自主性を重んじ、サッカー以外も充実できる環境が向いています。', icon: '🌟' },
    E: { name: 'エンジョイ型', description: '楽しく本気でサッカーをしたい選手タイプ。競技と大学生活のバランスが取れる環境が向いています。', icon: '⚽' },
    F: { name: 'サポート型', description: '選手以外の形でサッカーと関わりたいタイプ。マネージャーやスタッフとして活躍できる環境が向いています。', icon: '🤝' }
  };
  
  const resultTypesSheet = ss.getSheetByName('diagnosis_result_types');
  // 既存の結果タイプを削除（同じ診断IDのもの）
  const rtData = resultTypesSheet.getDataRange().getValues();
  for (let i = rtData.length - 1; i >= 1; i--) {
    if (rtData[i][0] === diagnosisId) {
      resultTypesSheet.deleteRow(i + 1);
    }
  }
  
  // 結果タイプを登録
  Object.entries(ORIENTATION_TYPES_DATA).forEach(([typeId, data]) => {
    resultTypesSheet.appendRow([
      diagnosisId,
      typeId,
      data.name,
      data.description,
      data.icon
    ]);
  });
  Logger.log('結果タイプ登録完了: 6タイプ');
  
  // ===== 3. 質問を登録 =====
  const DIAGNOSIS_QUESTIONS_DATA = [
    { id: 1, text: '将来、サッカーを仕事にしたい', scores: { yes: { A: 2.5, F: 2 }, no: { E: 1, D: 0.5 }, unknown: { B: 0.5, C: 0.5 } } },
    { id: 2, text: '強い相手と戦える環境に身を置きたい', scores: { yes: { B: 2, A: 1 }, no: { E: 1.5 }, unknown: { C: 1, D: 0.5 } } },
    { id: 3, text: 'チームで成し遂げることの方が嬉しい', scores: { yes: { C: 2.5, F: 1.5 }, no: { B: 0.5 }, unknown: { E: 0.5, A: 0.5 } } },
    { id: 4, text: 'サッカー以外の大学生活も充実させたい', scores: { yes: { D: 2.5, E: 0.5 }, no: { A: 1.5 }, unknown: { C: 0.5, B: 0.5 } } },
    { id: 5, text: '運営を自分たちで考えるチームに興味がある', scores: { yes: { D: 1.5, C: 1.5 }, no: { A: 0.5, B: 0.5 }, unknown: { E: 1 } } },
    { id: 6, text: '厳しい環境で自分を追い込みたい', scores: { yes: { B: 1.5, A: 1 }, no: { E: 2 }, unknown: { C: 1, D: 0.5 } } },
    { id: 7, text: 'サッカーをしている時間そのものが好き', scores: { yes: { E: 2.5, C: 0.5 }, no: { A: 0.5, B: 0.5 }, unknown: { D: 0.5, F: 0.5 } } },
    { id: 8, text: '選手以外の形でもサッカーに関わりたい', scores: { yes: { F: 4.5 }, no: { E: 0.5 }, unknown: { C: 0.5, D: 0.5 } } }
  ];
  
  const questionsSheet = ss.getSheetByName('diagnosis_questions');
  // 既存の質問を削除（同じ診断IDのもの）
  const qData = questionsSheet.getDataRange().getValues();
  for (let i = qData.length - 1; i >= 1; i--) {
    if (qData[i][0] === diagnosisId) {
      questionsSheet.deleteRow(i + 1);
    }
  }
  
  // 質問を登録
  DIAGNOSIS_QUESTIONS_DATA.forEach((q, index) => {
    // 選択肢はyes/no/unknownの3択
    const options = [
      { id: 'yes', text: 'はい' },
      { id: 'no', text: 'いいえ' },
      { id: 'unknown', text: 'わからない' }
    ];
    
    // スコアを選択肢ID -> タイプID -> スコア の形式に変換
    const scores = {};
    Object.entries(q.scores).forEach(([optionId, typeScores]) => {
      scores[optionId] = typeScores;
    });
    
    questionsSheet.appendRow([
      diagnosisId,
      'q_' + q.id,
      index + 1,
      'single',
      q.text,
      JSON.stringify(options),
      JSON.stringify(scores),
      JSON.stringify(null)
    ]);
  });
  
  Logger.log('質問登録完了: 8問');
  Logger.log('移行完了！管理画面で「志向性診断」を確認してください。');
}

/**
 * 診断テンプレート一覧を取得
 */
function getDiagnosisTemplates() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('diagnosis_templates');
  if (!sheet) return { templates: [] };
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { templates: [] };
  
  const headers = data[0];
  const templates = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // IDがない行はスキップ
    
    const template = {};
    headers.forEach((header, index) => {
      template[header] = row[index];
    });
    templates.push(template);
  }
  
  return { templates: templates };
}

/**
 * 診断テンプレート詳細を取得（質問・結果タイプ含む）
 * @param {string} id - 診断ID
 */
function getDiagnosisTemplate(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // テンプレート本体を取得
  const templatesSheet = ss.getSheetByName('diagnosis_templates');
  if (!templatesSheet) throw new Error('Diagnosis templates sheet not found');
  
  const templatesData = templatesSheet.getDataRange().getValues();
  const templateHeaders = templatesData[0];
  let template = null;
  
  for (let i = 1; i < templatesData.length; i++) {
    if (templatesData[i][0] === id) {
      template = {};
      templateHeaders.forEach((header, index) => {
        template[header] = templatesData[i][index];
      });
      break;
    }
  }
  
  if (!template) {
    throw new Error('Diagnosis template not found: ' + id);
  }
  
  // 質問を取得
  template.questions = getDiagnosisQuestions(id);
  
  // 結果タイプを取得
  template.resultTypes = getDiagnosisResultTypes(id);
  
  return template;
}

/**
 * 診断テンプレートを作成
 * @param {Object} data - テンプレートデータ
 */
function createDiagnosisTemplate(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('diagnosis_templates');
  
  if (!sheet) {
    setupDiagnosisTemplatesSheet();
    sheet = ss.getSheetByName('diagnosis_templates');
  }
  
  const id = 'dt_' + Date.now();
  const now = new Date().toISOString();
  
  sheet.appendRow([
    id,
    data.name || '',
    data.description || '',
    data.status || 'draft',
    now,
    now
  ]);
  
  // 質問がある場合は保存
  if (data.questions && data.questions.length > 0) {
    saveDiagnosisQuestions(id, data.questions);
  }
  
  // 結果タイプがある場合は保存
  if (data.resultTypes && data.resultTypes.length > 0) {
    saveDiagnosisResultTypes(id, data.resultTypes);
  }
  
  return { success: true, id: id };
}

/**
 * 診断テンプレートを更新
 * @param {string} id - 診断ID
 * @param {Object} data - 更新データ
 */
function updateDiagnosisTemplate(id, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('diagnosis_templates');
  if (!sheet) throw new Error('Diagnosis templates sheet not found');
  
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0];
  
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === id) {
      // 更新可能なフィールド
      const updateFields = ['name', 'description', 'status'];
      
      updateFields.forEach(field => {
        if (data[field] !== undefined) {
          const colIndex = headers.indexOf(field);
          if (colIndex >= 0) {
            sheet.getRange(i + 1, colIndex + 1).setValue(data[field]);
          }
        }
      });
      
      // updatedAtを更新
      const updatedAtCol = headers.indexOf('updatedAt');
      if (updatedAtCol >= 0) {
        sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date().toISOString());
      }
      
      // 質問がある場合は保存
      if (data.questions !== undefined) {
        saveDiagnosisQuestions(id, data.questions);
      }
      
      // 結果タイプがある場合は保存
      if (data.resultTypes !== undefined) {
        saveDiagnosisResultTypes(id, data.resultTypes);
      }
      
      return { success: true, id: id };
    }
  }
  
  throw new Error('Diagnosis template not found: ' + id);
}

/**
 * 診断テンプレートを削除
 * @param {string} id - 診断ID
 */
function deleteDiagnosisTemplate(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // テンプレート本体を削除
  const templatesSheet = ss.getSheetByName('diagnosis_templates');
  if (templatesSheet) {
    const data = templatesSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        templatesSheet.deleteRow(i + 1);
        break;
      }
    }
  }
  
  // 関連する質問を削除
  deleteDiagnosisQuestions(id);
  
  // 関連する結果タイプを削除
  deleteDiagnosisResultTypes(id);
  
  return { success: true };
}

// ==============================
// 診断質問管理
// ==============================

/**
 * 診断の質問一覧を取得
 * @param {string} diagnosisId - 診断ID
 */
function getDiagnosisQuestions(diagnosisId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('diagnosis_questions');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const questions = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === diagnosisId) {
      const question = {};
      headers.forEach((header, index) => {
        let value = data[i][index];
        // JSONフィールドをパース
        if ((header === 'options' || header === 'scores' || header === 'condition') && value) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = header === 'options' ? [] : {};
          }
        }
        question[header] = value;
      });
      questions.push(question);
    }
  }
  
  // order順にソート
  questions.sort((a, b) => a.order - b.order);
  
  return questions;
}

/**
 * 診断の質問を保存（一括更新）
 * @param {string} diagnosisId - 診断ID
 * @param {Array} questions - 質問配列
 */
function saveDiagnosisQuestions(diagnosisId, questions) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('diagnosis_questions');
  
  if (!sheet) {
    setupDiagnosisTemplatesSheet();
    sheet = ss.getSheetByName('diagnosis_questions');
  }
  
  // 既存の質問を削除
  deleteDiagnosisQuestions(diagnosisId);
  
  // 新しい質問を追加
  questions.forEach((q, index) => {
    sheet.appendRow([
      diagnosisId,
      q.questionId || 'q_' + Date.now() + '_' + index,
      q.order !== undefined ? q.order : index + 1,
      q.type || 'single',
      q.text || '',
      JSON.stringify(q.options || []),
      JSON.stringify(q.scores || {}),
      JSON.stringify(q.condition || null)
    ]);
  });
  
  return { success: true };
}

/**
 * 診断の質問を削除
 * @param {string} diagnosisId - 診断ID
 */
function deleteDiagnosisQuestions(diagnosisId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('diagnosis_questions');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  // 逆順で削除（行番号がずれないように）
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === diagnosisId) {
      sheet.deleteRow(i + 1);
    }
  }
}

// ==============================
// 診断結果タイプ管理
// ==============================

/**
 * 診断の結果タイプ一覧を取得
 * @param {string} diagnosisId - 診断ID
 */
function getDiagnosisResultTypes(diagnosisId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('diagnosis_result_types');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const resultTypes = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === diagnosisId) {
      const resultType = {};
      headers.forEach((header, index) => {
        resultType[header] = data[i][index];
      });
      resultTypes.push(resultType);
    }
  }
  
  return resultTypes;
}

/**
 * 診断の結果タイプを保存（一括更新）
 * @param {string} diagnosisId - 診断ID
 * @param {Array} resultTypes - 結果タイプ配列
 */
function saveDiagnosisResultTypes(diagnosisId, resultTypes) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('diagnosis_result_types');
  
  if (!sheet) {
    setupDiagnosisTemplatesSheet();
    sheet = ss.getSheetByName('diagnosis_result_types');
  }
  
  // 既存の結果タイプを削除
  deleteDiagnosisResultTypes(diagnosisId);
  
  // 新しい結果タイプを追加
  resultTypes.forEach((rt, index) => {
    sheet.appendRow([
      diagnosisId,
      rt.typeId || String.fromCharCode(65 + index), // A, B, C...
      rt.name || '',
      rt.description || '',
      rt.icon || ''
    ]);
  });
  
  return { success: true };
}

/**
 * 診断の結果タイプを削除
 * @param {string} diagnosisId - 診断ID
 */
function deleteDiagnosisResultTypes(diagnosisId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('diagnosis_result_types');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  // 逆順で削除（行番号がずれないように）
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === diagnosisId) {
      sheet.deleteRow(i + 1);
    }
  }
}
