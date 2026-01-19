// ==============================
// Surveys.gs - アンケート機能
// ==============================

/**
 * アンケート関連シートのセットアップ
 */
function setupSurveysSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // surveys シート（アンケートマスタ）
  let surveysSheet = ss.getSheetByName('surveys');
  if (!surveysSheet) {
    surveysSheet = ss.insertSheet('surveys');
    surveysSheet.appendRow([
      'id', 'title', 'description', 'status', 'createdAt', 'updatedAt'
    ]);
  }
  
  // survey_questions シート
  let questionsSheet = ss.getSheetByName('survey_questions');
  if (!questionsSheet) {
    questionsSheet = ss.insertSheet('survey_questions');
    questionsSheet.appendRow([
      'surveyId', 'questionId', 'order', 'type', 'text', 'options', 'required'
    ]);
  }
  
  // survey_responses シート
  let responsesSheet = ss.getSheetByName('survey_responses');
  if (!responsesSheet) {
    responsesSheet = ss.insertSheet('survey_responses');
    responsesSheet.appendRow([
      'responseId', 'surveyId', 'userId', 'answers', 'submittedAt'
    ]);
  }
  
  Logger.log('Surveys sheets ready');
}

/**
 * アンケート一覧を取得
 */
function getSurveys() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('surveys');
  
  if (!sheet) {
    return { surveys: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const surveys = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      surveys.push({
        id: row[0],
        title: row[1],
        description: row[2],
        status: row[3],
        createdAt: row[4],
        updatedAt: row[5]
      });
    }
  }
  
  return { surveys: surveys };
}

/**
 * アンケート詳細を取得（質問含む）
 */
function getSurvey(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('surveys');
  
  if (!sheet) return null;
  
  const data = sheet.getDataRange().getValues();
  let survey = null;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      survey = {
        id: data[i][0],
        title: data[i][1],
        description: data[i][2],
        status: data[i][3],
        createdAt: data[i][4],
        updatedAt: data[i][5]
      };
      break;
    }
  }
  
  if (!survey) return null;
  
  // 質問を取得
  survey.questions = getSurveyQuestions(id);
  
  return survey;
}

/**
 * アンケートの質問を取得
 */
function getSurveyQuestions(surveyId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('survey_questions');
  
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const questions = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === surveyId) {
      questions.push({
        surveyId: data[i][0],
        questionId: data[i][1],
        order: data[i][2],
        type: data[i][3],
        text: data[i][4],
        options: JSON.parse(data[i][5] || '[]'),
        required: data[i][6] === true || data[i][6] === 'true'
      });
    }
  }
  
  // orderでソート
  questions.sort((a, b) => a.order - b.order);
  
  return questions;
}

/**
 * アンケートを作成
 */
function createSurvey(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // シートがなければ作成
  setupSurveysSheet();
  
  const sheet = ss.getSheetByName('surveys');
  const id = 'survey_' + new Date().getTime();
  const now = new Date().toISOString();
  
  sheet.appendRow([
    id,
    data.title || '',
    data.description || '',
    data.status || 'draft',
    now,
    now
  ]);
  
  // 質問を保存
  if (data.questions && data.questions.length > 0) {
    saveSurveyQuestions(id, data.questions);
  }
  
  return { id: id };
}

/**
 * アンケートを更新
 */
function updateSurvey(id, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('surveys');
  
  if (!sheet) {
    return { success: false, error: 'Sheet not found' };
  }
  
  const rows = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { success: false, error: 'Survey not found' };
  }
  
  const now = new Date().toISOString();
  
  // 更新
  sheet.getRange(rowIndex, 2).setValue(data.title || '');
  sheet.getRange(rowIndex, 3).setValue(data.description || '');
  sheet.getRange(rowIndex, 4).setValue(data.status || 'draft');
  sheet.getRange(rowIndex, 6).setValue(now);
  
  // 質問を保存
  if (data.questions) {
    saveSurveyQuestions(id, data.questions);
  }
  
  return { id: id };
}

/**
 * アンケートの質問を保存（既存削除→新規追加）
 */
function saveSurveyQuestions(surveyId, questions) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('survey_questions');
  
  if (!sheet) {
    setupSurveysSheet();
    sheet = ss.getSheetByName('survey_questions');
  }
  
  // 既存の質問を削除
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === surveyId) {
      sheet.deleteRow(i + 1);
    }
  }
  
  // 新しい質問を追加
  questions.forEach((q, index) => {
    sheet.appendRow([
      surveyId,
      q.questionId || 'q_' + new Date().getTime() + '_' + (index + 1),
      index + 1,
      q.type || 'single',
      q.text || '',
      JSON.stringify(q.options || []),
      q.required ? 'true' : 'false'
    ]);
  });
}

/**
 * アンケートを削除
 */
function deleteSurvey(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('surveys');
  
  if (!sheet) {
    return { success: false, error: 'Sheet not found' };
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      
      // 関連する質問も削除
      deleteSurveyQuestions(id);
      // 関連する回答も削除
      deleteSurveyResponses(id);
      
      return { success: true };
    }
  }
  
  return { success: false, error: 'Survey not found' };
}

/**
 * アンケートの質問を削除
 */
function deleteSurveyQuestions(surveyId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('survey_questions');
  
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === surveyId) {
      sheet.deleteRow(i + 1);
    }
  }
}

/**
 * アンケートの回答を削除
 */
function deleteSurveyResponses(surveyId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('survey_responses');
  
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === surveyId) {
      sheet.deleteRow(i + 1);
    }
  }
}

/**
 * アンケートの回答一覧を取得
 */
function getSurveyResponses(surveyId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('survey_responses');
  
  if (!sheet) {
    return { responses: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  const responses = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === surveyId) {
      responses.push({
        responseId: data[i][0],
        surveyId: data[i][1],
        userId: data[i][2],
        answers: JSON.parse(data[i][3] || '{}'),
        submittedAt: data[i][4]
      });
    }
  }
  
  return { responses: responses };
}

/**
 * アンケートの集計結果を取得
 */
function getSurveyStats(surveyId) {
  const survey = getSurvey(surveyId);
  if (!survey) {
    return { error: 'Survey not found' };
  }
  
  const { responses } = getSurveyResponses(surveyId);
  
  const stats = {
    surveyId: surveyId,
    totalResponses: responses.length,
    questions: []
  };
  
  // 各質問の集計
  survey.questions.forEach(question => {
    const questionStats = {
      questionId: question.questionId,
      text: question.text,
      type: question.type,
      totalAnswers: 0,
      breakdown: {}
    };
    
    // 回答を集計
    responses.forEach(response => {
      const answer = response.answers[question.questionId];
      if (answer !== undefined && answer !== null) {
        questionStats.totalAnswers++;
        
        if (question.type === 'single' || question.type === 'scale' || question.type === 'nps') {
          const key = String(answer);
          questionStats.breakdown[key] = (questionStats.breakdown[key] || 0) + 1;
        } else if (question.type === 'multiple') {
          // 複数選択の場合
          const arr = Array.isArray(answer) ? answer : [answer];
          arr.forEach(a => {
            const key = String(a);
            questionStats.breakdown[key] = (questionStats.breakdown[key] || 0) + 1;
          });
        }
        // テキストは集計しない（回答一覧で確認）
      }
    });
    
    stats.questions.push(questionStats);
  });
  
  return stats;
}

/**
 * アンケート回答を保存（LINEからの回答用）
 */
function saveSurveyResponse(surveyId, userId, answers) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('survey_responses');
  
  if (!sheet) {
    setupSurveysSheet();
    sheet = ss.getSheetByName('survey_responses');
  }
  
  const responseId = 'resp_' + new Date().getTime();
  const now = new Date().toISOString();
  
  sheet.appendRow([
    responseId,
    surveyId,
    userId,
    JSON.stringify(answers),
    now
  ]);
  
  return { responseId: responseId };
}
