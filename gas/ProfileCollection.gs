// ==============================
// ProfileCollection.gs - プロフィール収集・診断機能
// ==============================

// MOISHサイトURL
const MOISH_SITE_URL = 'https://playmaker-moish.com/';
const MOISH_LOGO_URL = 'https://playmaker-moish.com/assets/images/logo.png';
const BRAND_COLOR = '#3da564';

// テストモード（本番環境では false にする）
const TEST_MODE = true;

// 地域と都道府県のマッピング
const REGION_PREFECTURES = {
  '北海道': ['北海道'],
  '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '山梨県'],
  '北信越': ['新潟県', '富山県', '石川県', '福井県', '長野県'],
  '東海': ['岐阜県', '静岡県', '愛知県', '三重県'],
  '関西': ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州・沖縄': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
};

// 志向性タイプ定義
const ORIENTATION_TYPES = {
  A: { name: 'プロ志向型', description: '大学経由でプロを目指したい選手タイプ。高いレベルでの競争環境と、Jリーグへの輩出実績がある大学が向いています。', icon: '🎯' },
  B: { name: 'チャレンジ型', description: '自分がどこまで上を目指せるか挑戦したい選手タイプ。強豪校での切磋琢磨と、自分を高められる環境が向いています。', icon: '🔥' },
  C: { name: 'チーム成長型', description: 'チームと一緒に成長していきたい選手タイプ。一体感のあるチームで、みんなで目標に向かう環境が向いています。', icon: '📈' },
  D: { name: '経験重視型', description: '学生主体の活動でいろんな経験をしたい選手タイプ。自主性を重んじ、サッカー以外も充実できる環境が向いています。', icon: '🌟' },
  E: { name: 'エンジョイ型', description: '楽しく本気でサッカーをしたい選手タイプ。競技と大学生活のバランスが取れる環境が向いています。', icon: '⚽' },
  F: { name: 'サポート型', description: '選手以外の形でサッカーと関わりたいタイプ。マネージャーやスタッフとして活躍できる環境が向いています。', icon: '🤝' }
};

// 診断質問と配点ロジック
const DIAGNOSIS_QUESTIONS = [
  { id: 1, text: '将来、サッカーを仕事にしたい', scores: { yes: { A: 2.5, F: 2 }, no: { E: 1, D: 0.5 }, unknown: { B: 0.5, C: 0.5 } } },
  { id: 2, text: '強い相手と戦える環境に身を置きたい', scores: { yes: { B: 2, A: 1 }, no: { E: 1.5 }, unknown: { C: 1, D: 0.5 } } },
  { id: 3, text: 'チームで成し遂げることの方が嬉しい', scores: { yes: { C: 2.5, F: 1.5 }, no: { B: 0.5 }, unknown: { E: 0.5, A: 0.5 } } },
  { id: 4, text: 'サッカー以外の大学生活も充実させたい', scores: { yes: { D: 2.5, E: 0.5 }, no: { A: 1.5 }, unknown: { C: 0.5, B: 0.5 } } },
  { id: 5, text: '運営を自分たちで考えるチームに興味がある', scores: { yes: { D: 1.5, C: 1.5 }, no: { A: 0.5, B: 0.5 }, unknown: { E: 1 } } },
  { id: 6, text: '厳しい環境で自分を追い込みたい', scores: { yes: { B: 1.5, A: 1 }, no: { E: 2 }, unknown: { C: 1, D: 0.5 } } },
  { id: 7, text: 'サッカーをしている時間そのものが好き', scores: { yes: { E: 2.5, C: 0.5 }, no: { A: 0.5, B: 0.5 }, unknown: { D: 0.5, F: 0.5 } } },
  { id: 8, text: '選手以外の形でもサッカーに関わりたい', scores: { yes: { F: 4.5 }, no: { E: 0.5 }, unknown: { C: 0.5, D: 0.5 } } }
];

// ==============================
// 友だち追加イベント処理
// ==============================
function handleFollowEventWithProfile(userId, replyToken) {
  try {
    const existingUser = getProfileUserData(userId);
    
    if (existingUser && existingUser.name && existingUser.region) {
      // 既存ユーザー（登録済み）
      const welcomeBackMessage = {
        type: 'text',
        text: `おかえりなさい、${existingUser.name}さん！\nまたお会いできて嬉しいです😊\n\nいつでも「診断する」と送ると、志向性診断ができます。`
      };
      replyLineMessage(replyToken, [welcomeBackMessage]);
      return;
    }
    
    // 新規ユーザー → 診断スタート
    initializeDiagnosisScores(userId);
    
    const welcomeMessage = {
      type: 'text',
      text: '友だち追加ありがとうございます⚽️\n\n簡単な質問に答えるだけで、\nあなたの進路の考え方を整理できます。'
    };
    
    const startQuestionMessage = createDiagnosisStartQuestion();
    
    replyLineMessage(replyToken, [welcomeMessage, startQuestionMessage]);
    updateProfileUserState(userId, 'waiting_diagnosis_start');
    
  } catch (error) {
    Logger.log('Error in handleFollowEventWithProfile: ' + error);
  }
}

// ==============================
// テキストメッセージ処理
// ==============================
function handleProfileTextMessage(userId, text, replyToken) {
  const state = getProfileUserState(userId);
  const userData = getProfileUserData(userId);
  
  try {
    // 診断開始コマンド
    if (text === '診断する' || text === '診断' || text === 'しんだん') {
      startDiagnosis(userId, replyToken);
      return true;
    }
    
    // テストコマンド
    if (TEST_MODE) {
      if (handleTestCommands(userId, text, replyToken, state, userData)) {
        return true;
      }
    }
    
    // 名前入力
    if (state.step === 'waiting_name') {
      saveProfileUserData(userId, 'name', text);
      
      replyLineMessage(replyToken, [
        { type: 'text', text: `${text}さん、ありがとうございます！` },
        createGradeQuestionMessage()
      ]);
      
      updateProfileUserState(userId, 'waiting_grade');
      return true;
    }
    
    // チーム名入力（登録完了）
    if (state.step === 'waiting_team_name') {
      handleTeamNameInput(userId, text, replyToken, userData, state);
      return true;
    }
    
    return false;  // 処理されなかった
  } catch (error) {
    Logger.log('Error in handleProfileTextMessage: ' + error);
    return false;
  }
}

// ==============================
// ポストバック処理
// ==============================
function handleProfilePostback(userId, data, replyToken) {
  try {
    const [key, value] = data.split('=');
    const state = getProfileUserState(userId);
    
    // 診断開始の問いかけ
    if (state.step === 'waiting_diagnosis_start' && key === 'start_diagnosis') {
      if (value === 'yes') {
        initializeDiagnosisScores(userId);
        replyLineMessage(replyToken, [
          { type: 'text', text: 'それでは、全8問の志向性診断を始めます。\n直感で選んでください💡' },
          createDiagnosisQuestion(1)
        ]);
        updateProfileUserState(userId, 'diagnosis_q1');
        return true;
      } else if (value === 'no') {
        saveTempData(userId, 'diagnosis_result', { type: 'Skipped' });
        replyLineMessage(replyToken, [
          { type: 'text', text: '承知しました。\nあなたに合った情報をお届けするために、簡単なプロフィール登録にご協力ください。\n\nあと5問・約1分です。' },
          createNameQuestionMessage()
        ]);
        updateProfileUserState(userId, 'waiting_name');
        return true;
      }
    }
    
    // 診断回答処理
    if (state.step.startsWith('diagnosis_q')) {
      handleDiagnosisAnswer(userId, state, key, replyToken);
      return true;
    }
    
    // 学年選択
    if (key === 'grade') {
      saveProfileUserData(userId, 'grade', value);
      replyLineMessage(replyToken, [createRegionQuestionMessage()]);
      updateProfileUserState(userId, 'waiting_region');
      return true;
    }
    
    // 地域選択
    if (key === 'region') {
      saveProfileUserData(userId, 'region', value);
      replyLineMessage(replyToken, [createPrefectureQuestionMessage(value)]);
      updateProfileUserState(userId, 'waiting_prefecture');
      return true;
    }
    
    // 都道府県選択
    if (key === 'prefecture') {
      saveProfileUserData(userId, 'prefecture', value);
      replyLineMessage(replyToken, [createTeamNameQuestionMessage()]);
      updateProfileUserState(userId, 'waiting_team_name');
      return true;
    }
    
    return false;
  } catch (error) {
    Logger.log('Error in handleProfilePostback: ' + error);
    return false;
  }
}

// ==============================
// 診断関連処理
// ==============================
function startDiagnosis(userId, replyToken) {
  initializeDiagnosisScores(userId);
  replyLineMessage(replyToken, [
    { type: 'text', text: '志向性診断を始めます⚽️\n全8問・約1分で完了します。\n\n直感で選んでください💡' },
    createDiagnosisQuestion(1)
  ]);
  updateProfileUserState(userId, 'diagnosis_q1');
}

function initializeDiagnosisScores(userId) {
  const initialScores = {};
  Object.keys(ORIENTATION_TYPES).forEach(type => {
    initialScores[type] = 0;
  });
  saveTempData(userId, 'diagnosis_scores', initialScores);
}

function handleDiagnosisAnswer(userId, state, answerKey, replyToken) {
  const qNum = parseInt(state.step.replace('diagnosis_q', ''));
  const qIndex = qNum - 1;
  
  if (qIndex >= DIAGNOSIS_QUESTIONS.length || qIndex < 0) return;
  
  const question = DIAGNOSIS_QUESTIONS[qIndex];
  if (!['yes', 'no', 'unknown'].includes(answerKey)) return;
  
  // 回答を保存
  saveDiagnosisAnswer(userId, qNum, answerKey);
  
  let scores = state.temp_data.diagnosis_scores || {};
  if (Object.keys(scores).length === 0) {
    Object.keys(ORIENTATION_TYPES).forEach(type => {
      scores[type] = 0;
    });
  }
  
  const pointsToAdd = question.scores[answerKey] || {};
  for (const type in pointsToAdd) {
    scores[type] = (scores[type] || 0) + pointsToAdd[type];
  }
  saveTempData(userId, 'diagnosis_scores', scores);
  
  const nextQNum = qNum + 1;
  
  if (nextQNum <= DIAGNOSIS_QUESTIONS.length) {
    replyLineMessage(replyToken, [createDiagnosisQuestion(nextQNum)]);
    updateProfileUserState(userId, `diagnosis_q${nextQNum}`);
  } else {
    handleDiagnosisComplete(userId, scores, replyToken);
  }
}

function handleDiagnosisComplete(userId, scores, replyToken) {
  const resultType = getDiagnosisResult(scores);
  const userData = getProfileUserData(userId);
  
  saveTempData(userId, 'diagnosis_result', { type: resultType, scores: scores });
  
  // 診断結果をユーザーデータに保存
  saveProfileUserData(userId, 'diagnosisType', ORIENTATION_TYPES[resultType].name);
  saveProfileUserData(userId, 'diagnosisCompletedAt', new Date().toISOString());
  
  // 診断履歴を保存（回答詳細付き）
  saveDiagnosisHistory(userId, resultType, scores);
  
  if (userData && userData.name && userData.region) {
    // 登録済ユーザー
    const typeData = ORIENTATION_TYPES[resultType];
    const resultText = {
      type: 'text',
      text: `🎯 診断結果\n\nあなたは【${typeData.icon} ${typeData.name}】です。\n\n${typeData.description}`
    };
    replyLineMessage(replyToken, [resultText]);
    clearProfileUserState(userId);
  } else {
    // 未登録ユーザー → プロフィール登録へ
    const typeData = ORIENTATION_TYPES[resultType];
    const resultText = {
      type: 'text',
      text: `🎉 診断結果が出ました！\n\nあなたは\n【${typeData.icon} ${typeData.name}】です。\n\n${typeData.description}`
    };
    
    replyLineMessage(replyToken, [
      resultText,
      createRegistrationPromptMessage()
    ]);
    updateProfileUserState(userId, 'waiting_name');
  }
}

function getDiagnosisResult(scores) {
  let maxScore = -1;
  let resultType = 'A';
  
  for (const type in scores) {
    if (scores[type] > maxScore) {
      maxScore = scores[type];
      resultType = type;
    }
  }
  
  return resultType;
}

// ==============================
// チーム名入力後の処理（登録完了）
// ==============================
function handleTeamNameInput(userId, text, replyToken, userData, state) {
  saveProfileUserData(userId, 'teamName', text);
  saveProfileUserData(userId, 'plan', 'FREE');
  
  const updatedUser = getProfileUserData(userId);
  const diagnosisResult = state.temp_data.diagnosis_result;
  const userDidDiagnosis = diagnosisResult && diagnosisResult.type && diagnosisResult.type !== 'Skipped';
  
  const messages = [];
  
  if (userDidDiagnosis) {
    messages.push({
      type: 'text',
      text: `🔓 登録が完了しました！\n\nあなたの診断結果【${ORIENTATION_TYPES[diagnosisResult.type].name}】と\nお住まいの地域をもとに、情報をお届けします。`
    });
  } else {
    messages.push({
      type: 'text',
      text: '🔓 登録が完了しました！'
    });
  }
  
  const completeText = `${updatedUser.name}さん、ありがとうございました！\n\n` +
    `【登録内容】\n` +
    `氏名：${updatedUser.name}\n` +
    `学年：${updatedUser.grade}\n` +
    `地域：${updatedUser.region}\n` +
    `都道府県：${updatedUser.prefecture}\n` +
    `チーム名：${updatedUser.teamName}\n\n` +
    `💡 いつでも「診断する」と送ると再診断できます。`;
  messages.push({ type: 'text', text: completeText });
  
  replyLineMessage(replyToken, messages);
  clearProfileUserState(userId);
}

// ==============================
// LINE送信ヘルパー
// ==============================
function replyLineMessage(replyToken, messages) {
  if (!replyToken || !messages || messages.length === 0) return;
  
  try {
    const url = 'https://api.line.me/v2/bot/message/reply';
    const payload = {
      replyToken: replyToken,
      messages: messages.slice(0, 5)
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
    Logger.log('Reply status:', response.getResponseCode());
  } catch (error) {
    Logger.log('Error in replyLineMessage:', error);
  }
}

// ==============================
// テストコマンド
// ==============================
function handleTestCommands(userId, text, replyToken, state, userData) {
  if (text === '追加' || text === 'ついか' || text === 'リセット') {
    clearProfileUserData(userId);
    clearProfileUserState(userId);
    initializeDiagnosisScores(userId);
    
    const welcomeMessage = {
      type: 'text',
      text: 'リセットしました。\n\n友だち追加ありがとうございます⚽️\n\n簡単な質問に答えるだけで、\nあなたの進路の考え方を整理できます。'
    };
    const startQuestionMessage = createDiagnosisStartQuestion();
    
    replyLineMessage(replyToken, [welcomeMessage, startQuestionMessage]);
    updateProfileUserState(userId, 'waiting_diagnosis_start');
    return true;
  }
  
  if (text === '状態確認' || text === '確認') {
    const diagnosisResult = state.temp_data.diagnosis_result ? state.temp_data.diagnosis_result.type : '未実施';
    const isRegistered = (userData && userData.name && userData.region) ? '登録済' : '未登録';
    
    let infoText = '【現在の登録状態】\n\n';
    infoText += `ステータス: ${isRegistered}\n`;
    infoText += `氏名: ${userData.name || '未登録'}\n`;
    infoText += `学年: ${userData.grade || '未登録'}\n`;
    infoText += `地域: ${userData.region || '未登録'}\n`;
    infoText += `チーム名: ${userData.teamName || '未登録'}\n\n`;
    infoText += `診断結果: ${diagnosisResult}\n`;
    infoText += `進行状況: ${state.step || '未開始'}\n\n`;
    infoText += '「追加」でリセット\n「診断する」で診断開始';
    
    replyLineMessage(replyToken, [{ type: 'text', text: infoText }]);
    return true;
  }
  
  return false;
}
