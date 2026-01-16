// ==============================
// DiagnosisHistory.gs - 診断履歴管理
// ==============================

/**
 * 診断履歴シートのセットアップ
 */
function setupDiagnosisHistorySheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('diagnosis_history');
  
  if (!sheet) {
    sheet = ss.insertSheet('diagnosis_history');
    sheet.appendRow([
      'historyId', 'userId', 'diagnosisDate', 'resultType', 'resultName',
      'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8',
      'scores'
    ]);
  }
  
  Logger.log('diagnosis_history sheet ready');
}

/**
 * 診断回答を保存する
 * @param {string} userId - ユーザーID
 * @param {number} questionNum - 質問番号 (1-8)
 * @param {string} answer - 回答 (yes/no/unknown)
 */
function saveDiagnosisAnswer(userId, questionNum, answer) {
  try {
    // 一時データに回答を保存
    const state = getProfileUserState(userId);
    let answers = state.temp_data.diagnosis_answers || {};
    answers['q' + questionNum] = answer;
    saveTempData(userId, 'diagnosis_answers', answers);
    
    Logger.log(`Saved answer for user ${userId}: Q${questionNum} = ${answer}`);
  } catch (error) {
    Logger.log('Error in saveDiagnosisAnswer: ' + error);
  }
}

/**
 * 診断完了時に履歴を保存する
 * @param {string} userId - ユーザーID
 * @param {string} resultType - 診断結果タイプ (A-F)
 * @param {Object} scores - 各タイプのスコア
 */
function saveDiagnosisHistory(userId, resultType, scores) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('diagnosis_history');
    
    if (!sheet) {
      sheet = ss.insertSheet('diagnosis_history');
      sheet.appendRow([
        'historyId', 'userId', 'diagnosisDate', 'resultType', 'resultName',
        'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8',
        'scores'
      ]);
    }
    
    // 回答データを取得
    const state = getProfileUserState(userId);
    const answers = state.temp_data.diagnosis_answers || {};
    
    const resultName = ORIENTATION_TYPES[resultType] ? ORIENTATION_TYPES[resultType].name : resultType;
    
    sheet.appendRow([
      'dh_' + Date.now(),
      userId,
      new Date(),
      resultType,
      resultName,
      answers.q1 || '',
      answers.q2 || '',
      answers.q3 || '',
      answers.q4 || '',
      answers.q5 || '',
      answers.q6 || '',
      answers.q7 || '',
      answers.q8 || '',
      JSON.stringify(scores)
    ]);
    
    Logger.log('Diagnosis history saved for user ' + userId);
  } catch (error) {
    Logger.log('Error in saveDiagnosisHistory: ' + error);
  }
}

/**
 * ユーザーの診断履歴を取得する
 * @param {string} userId - ユーザーID
 * @returns {Array} 診断履歴一覧
 */
function getDiagnosisHistory(userId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('diagnosis_history');
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const history = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId) {
        const record = {};
        headers.forEach((h, j) => {
          record[h] = data[i][j];
        });
        
        // 日付をISO文字列に変換
        if (record.diagnosisDate instanceof Date) {
          record.diagnosisDate = record.diagnosisDate.toISOString();
        }
        
        // スコアをパース
        if (record.scores && typeof record.scores === 'string') {
          try {
            record.scores = JSON.parse(record.scores);
          } catch (e) {
            record.scores = {};
          }
        }
        
        // 回答をオブジェクトにまとめる
        record.answers = {
          q1: record.q1,
          q2: record.q2,
          q3: record.q3,
          q4: record.q4,
          q5: record.q5,
          q6: record.q6,
          q7: record.q7,
          q8: record.q8
        };
        
        history.push(record);
      }
    }
    
    // 日付の新しい順にソート
    history.sort((a, b) => new Date(b.diagnosisDate) - new Date(a.diagnosisDate));
    
    return history;
  } catch (error) {
    Logger.log('Error in getDiagnosisHistory: ' + error);
    return [];
  }
}

// 診断質問のテキスト（フロントエンド表示用）
const DIAGNOSIS_QUESTION_TEXTS = {
  q1: '将来、サッカーを仕事にしたい',
  q2: '強い相手と戦える環境に身を置きたい',
  q3: 'チームで成し遂げることの方が嬉しい',
  q4: 'サッカー以外の大学生活も充実させたい',
  q5: '運営を自分たちで考えるチームに興味がある',
  q6: '厳しい環境で自分を追い込みたい',
  q7: 'サッカーをしている時間そのものが好き',
  q8: '選手以外の形でもサッカーに関わりたい'
};

/**
 * 診断質問のテキスト情報を取得
 */
function getDiagnosisQuestionTexts() {
  return DIAGNOSIS_QUESTION_TEXTS;
}
