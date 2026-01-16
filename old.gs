// ==============================
// 共通設定
// ==============================
const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('CHANNEL_ACCESS_TOKEN');
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

// モイッシュサイトURL
const MOISH_SITE_URL = 'https://playmaker-moish.com/';
// モイッシュロゴ画像URL
const MOISH_LOGO_URL = 'https://playmaker-moish.com/assets/images/logo.png';

// ブランドカラー
const BRAND_COLOR = '#3da564';
const BRAND_COLOR_DARK = '#2d8a4e';

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

// ==============================
// 志向性診断 設定
// ==============================

// 志向性タイプ定義
const ORIENTATION_TYPES = {
  A: { name: 'プロ志向型', description: '大学経由でプロを目指したい選手タイプ。高いレベルでの競争環境と、Jリーグへの輩出実績がある大学が向いています。', icon: '🎯', color: '#FF5722' },
  B: { name: 'チャレンジ型', description: '自分がどこまで上を目指せるか挑戦したい選手タイプ。強豪校での切磋琢磨と、自分を高められる環境が向いています。', icon: '🔥', color: '#E91E63' },
  C: { name: 'チーム成長型', description: 'チームと一緒に成長していきたい選手タイプ。一体感のあるチームで、みんなで目標に向かう環境が向いています。', icon: '📈', color: '#4CAF50' },
  D: { name: '経験重視型', description: '学生主体の活動でいろんな経験をしたい選手タイプ。自主性を重んじ、サッカー以外も充実できる環境が向いています。', icon: '🌟', color: '#2196F3' },
  E: { name: 'エンジョイ型', description: '楽しく本気でサッカーをしたい選手タイプ。競技と大学生活のバランスが取れる環境が向いています。', icon: '⚽', color: '#FFC107' },
  F: { name: 'サポート型', description: '選手以外の形でサッカーと関わりたいタイプ。マネージャーやスタッフとして活躍できる環境が向いています。', icon: '🤝', color: '#9C27B0' }
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
  { id: 8, text: '選手以外の形（マネージャー・スタッフ等）でもサッカーに関わりたい', scores: { yes: { F: 4.5 }, no: { E: 0.5 }, unknown: { C: 0.5, D: 0.5 } } }
];

// 志向性タイプ別おすすめ大学（地域情報付き）
const RECOMMENDED_UNIVERSITIES = {
  A: [
    { name: '明治大学', region: '関東', league: '関東1部', feature: 'Jリーグ内定多数', imageUrl: 'https://placehold.jp/300x200.png?text=明治大学' },
    { name: '流通経済大学', region: '関東', league: '関東1部', feature: 'プロ輩出実績豊富', imageUrl: 'https://placehold.jp/300x200.png?text=流通経済大学' },
    { name: '筑波大学', region: '関東', league: '関東1部', feature: '日本代表多数輩出', imageUrl: 'https://placehold.jp/300x200.png?text=筑波大学' },
    { name: '関西学院大学', region: '関西', league: '関西1部', feature: 'プロ内定実績あり', imageUrl: 'https://placehold.jp/300x200.png?text=関西学院大学' },
    { name: '福岡大学', region: '九州・沖縄', league: '九州1部', feature: '九州の名門', imageUrl: 'https://placehold.jp/300x200.png?text=福岡大学' }
  ],
  B: [
    { name: '早稲田大学', region: '関東', league: '関東1部', feature: '文武両道の名門', imageUrl: 'https://placehold.jp/300x200.png?text=早稲田大学' },
    { name: '慶應義塾大学', region: '関東', league: '関東1部', feature: '伝統ある強豪', imageUrl: 'https://placehold.jp/300x200.png?text=慶應義塾大学' },
    { name: '法政大学', region: '関東', league: '関東1部', feature: '技術指導に定評', imageUrl: 'https://placehold.jp/300x200.png?text=法政大学' },
    { name: '同志社大学', region: '関西', league: '関西1部', feature: '関西の名門', imageUrl: 'https://placehold.jp/300x200.png?text=同志社大学' },
    { name: '新潟医療福祉大学', region: '北信越', league: '北信越1部', feature: '北信越の強豪', imageUrl: 'https://placehold.jp/300x200.png?text=新潟医療福祉大学' }
  ],
  C: [
    { name: '順天堂大学', region: '関東', league: '関東1部', feature: 'チームワーク重視', imageUrl: 'https://placehold.jp/300x200.png?text=順天堂大学' },
    { name: '国士舘大学', region: '関東', league: '関東1部', feature: '一体感のあるチーム', imageUrl: 'https://placehold.jp/300x200.png?text=国士舘大学' },
    { name: '駒澤大学', region: '関東', league: '関東1部', feature: '堅守速攻スタイル', imageUrl: 'https://placehold.jp/300x200.png?text=駒澤大学' },
    { name: '大阪体育大学', region: '関西', league: '関西1部', feature: 'チーム一丸', imageUrl: 'https://placehold.jp/300x200.png?text=大阪体育大学' },
    { name: '仙台大学', region: '東北', league: '東北1部', feature: '東北の強豪', imageUrl: 'https://placehold.jp/300x200.png?text=仙台大学' }
  ],
  D: [
    { name: '東京学芸大学', region: '関東', league: '関東2部', feature: '学生主体の運営', imageUrl: 'https://placehold.jp/300x200.png?text=東京学芸大学' },
    { name: '成蹊大学', region: '関東', league: '関東2部', feature: '自主性を重視', imageUrl: 'https://placehold.jp/300x200.png?text=成蹊大学' },
    { name: '横浜国立大学', region: '関東', league: '神奈川県1部', feature: '文武両道環境', imageUrl: 'https://placehold.jp/300x200.png?text=横浜国立大学' },
    { name: '京都大学', region: '関西', league: '関西2部', feature: '学生自治の伝統', imageUrl: 'https://placehold.jp/300x200.png?text=京都大学' },
    { name: '名古屋大学', region: '東海', league: '東海2部', feature: '文武両道', imageUrl: 'https://placehold.jp/300x200.png?text=名古屋大学' }
  ],
  E: [
    { name: '青山学院大学', region: '関東', league: '関東2部', feature: 'キャンパスライフ充実', imageUrl: 'https://placehold.jp/300x200.png?text=青山学院大学' },
    { name: '立教大学', region: '関東', league: '関東2部', feature: '楽しくも本気', imageUrl: 'https://placehold.jp/300x200.png?text=立教大学' },
    { name: '中央大学', region: '関東', league: '関東1部', feature: 'バランス重視', imageUrl: 'https://placehold.jp/300x200.png?text=中央大学' },
    { name: '立命館大学', region: '関西', league: '関西1部', feature: '充実の環境', imageUrl: 'https://placehold.jp/300x200.png?text=立命館大学' },
    { name: '西南学院大学', region: '九州・沖縄', league: '九州2部', feature: '九州の人気校', imageUrl: 'https://placehold.jp/300x200.png?text=西南学院大学' }
  ],
  F: [
    { name: '日本体育大学', region: '関東', league: '関東1部', feature: 'マネジメント教育充実', imageUrl: 'https://placehold.jp/300x200.png?text=日本体育大学' },
    { name: '東海大学', region: '関東', league: '関東1部', feature: 'スタッフ育成実績', imageUrl: 'https://placehold.jp/300x200.png?text=東海大学' },
    { name: '専修大学', region: '関東', league: '関東1部', feature: '多様な関わり方', imageUrl: 'https://placehold.jp/300x200.png?text=専修大学' },
    { name: '関西大学', region: '関西', league: '関西1部', feature: 'スタッフ体制充実', imageUrl: 'https://placehold.jp/300x200.png?text=関西大学' },
    { name: '中京大学', region: '東海', league: '東海1部', feature: 'スポーツ科学', imageUrl: 'https://placehold.jp/300x200.png?text=中京大学' }
  ]
};


// ==============================
// Webhook受信
// ==============================
function doGet(e) {
  return ContentService.createTextOutput('OK(GET)').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const events = JSON.parse(e.postData.contents).events;
    
    events.forEach(event => {
      handleEvent(event);
    });
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// ==============================
// イベント処理
// ==============================
function handleEvent(event) {
  const userId = event.source.userId;
  const replyToken = event.replyToken;
  
  if (!userId) return;
  
  try {
    // 友だち追加
    if (event.type === 'follow') {
      handleFollowEvent(userId, replyToken);
      return;
    }
    
    // テキストメッセージ
    if (event.type === 'message' && event.message.type === 'text') {
      handleTextMessage(userId, event.message.text, replyToken);
      return;
    }
    
    // ポストバック（ボタンタップ）
    if (event.type === 'postback') {
      handlePostback(userId, event.postback.data, replyToken);
      return;
    }
  } catch (error) {
    Logger.log('Error in handleEvent: ' + error);
  }
}


// ==============================
// 友だち追加イベント処理
// ==============================
function handleFollowEvent(userId, replyToken) {
  try {
    const existingUser = getUserData(userId);
    
    if (isUserRegistered(existingUser)) {
      // 既存ユーザー（登録済み）
      const plan = existingUser.plan || 'FREE';
      if (FREE_RICHMENU_ID || BASIC_RICHMENU_ID) {
        const richMenuId = (plan === 'BASIC') ? BASIC_RICHMENU_ID : FREE_RICHMENU_ID;
        if (richMenuId) linkRichMenuToUser(userId, richMenuId);
      }
      
      const welcomeBackMessage = {
        type: 'text',
        text: `おかえりなさい、${existingUser.name}さん！\nまたお会いできて嬉しいです😊\n\nいつでも「診断する」と送ると、志向性診断ができます。`
      };
      replyMessage(replyToken, welcomeBackMessage);
      return;
    }
    
    // 新規ユーザー
    initializeDiagnosisScores(userId);
    
    const welcomeMessage = {
      type: 'text',
      text: '友だち追加ありがとうございます⚽️\n\n簡単な質問に答えるだけで、\nあなたの進路の考え方を整理できます。'
    };
    
    const startQuestionMessage = createDiagnosisStartQuestion();
    
    replyMultipleMessages(replyToken, [welcomeMessage, startQuestionMessage]);
    updateUserState(userId, 'waiting_diagnosis_start');
    
  } catch (error) {
    Logger.log('Error in handleFollowEvent: ' + error);
  }
}


// ==============================
// テキストメッセージ処理
// ==============================
function handleTextMessage(userId, text, replyToken) {
  const state = getUserState(userId);
  const userData = getUserData(userId);
  
  try {
    // ========== 診断開始コマンド（いつでも） ==========
    if (text === '診断する' || text === '診断' || text === 'しんだん') {
      startDiagnosis(userId, replyToken);
      return;
    }
    
    // ========== テストコマンド ==========
    if (TEST_MODE) {
      const handled = handleTestCommands(userId, text, replyToken, state, userData);
      if (handled) return;
    }
    
    // ========== プラン切り替え・確認コマンド ==========
    if (text.startsWith('プラン:')) {
      handlePlanChange(userId, text, replyToken);
      return;
    }
    
    if (text === 'プラン確認') {
      const plan = userData.plan || 'FREE';
      const planLabel = (plan === 'BASIC') ? 'ベーシック' : 'フリー';
      replyMessage(replyToken, `現在のプランは【${planLabel}】です。`);
      return;
    }
    
    if (text === '機能説明') {
      const message = {
        type: 'text',
        text: '【MOISHの機能】\n\n' +
              '⚽️ 進路志向性診断\n簡単な質問で、あなたに合った進路の方向性を診断します。\n\n' +
              '🔍 大学検索\n全国約700校の大学情報を検索できます。\n\n' +
              '💬 進路相談\n専門スタッフに進路に関する相談ができます。\n\n' +
              '「診断する」と送ると、いつでも診断できます。'
      };
      replyMessage(replyToken, message);
      return;
    }
    
    // ========== 名前入力 ==========
    if (state.step === 'waiting_name') {
      saveUserData(userId, 'name', text);
      
      replyMultipleMessages(replyToken, [
        { type: 'text', text: `${text}さん、ありがとうございます！` },
        createAttributeQuestionMessage()
      ]);
      
      updateUserState(userId, 'waiting_attribute');
      return;
    }
    
    // ========== チーム名入力（登録完了） ==========
    if (state.step === 'waiting_team_name') {
      handleTeamNameInput(userId, text, replyToken);
      return;
    }
    
    // ========== 進路相談 ==========
    if (text === '進路相談' && (state.step === '' || state.step === 'waiting_diagnosis_start')) {
      replyMessage(replyToken, '進路相談を承ります。\n現在悩んでいること、知りたいことなど、具体的な相談内容をメッセージで送信してください。');
      updateUserState(userId, 'waiting_consultation');
      return;
    }
    
    if (state.step === 'waiting_consultation') {
      saveConsultation(userId, userData, text);
      replyMessage(replyToken, 'ご相談ありがとうございます。\n内容を確認し、後日ご連絡いたします。');
      clearUserState(userId);
      return;
    }
    
  } catch (error) {
    Logger.log('Error in handleTextMessage: ' + error);
  }
}


// ==============================
// ポストバック処理
// ==============================
function handlePostback(userId, data, replyToken) {
  try {
    const [key, value] = data.split('=');
    const state = getUserState(userId);
    
    // ========== 診断開始の問いかけ ==========
    if (state.step === 'waiting_diagnosis_start' && key === 'start_diagnosis') {
      if (value === 'yes') {
        // 診断開始
        initializeDiagnosisScores(userId);
        
        replyMultipleMessages(replyToken, [
          { type: 'text', text: 'それでは、全8問の志向性診断を始めます。\n直感で選んでください💡' },
          createDiagnosisQuestion(1)
        ]);
        updateUserState(userId, 'diagnosis_q1');
        return;
        
      } else if (value === 'no') {
        // スキップ → プロフィール登録へ
        saveTempData(userId, 'diagnosis_result', { type: 'Skipped' });
        
        replyMultipleMessages(replyToken, [
          { type: 'text', text: '承知しました。\nあなたに合った情報をお届けするために、簡単なプロフィール登録にご協力ください。\n\nあと5問・約1分です。' },
          createNameQuestionMessage()
        ]);
        updateUserState(userId, 'waiting_name');
        return;
      }
    }
    
    // ========== 診断 回答処理 ==========
    // 診断質問のpostback dataは "yes", "no", "unknown" のみ（=を含まない）
    // そのため key に回答が入っている
    if (state.step.startsWith('diagnosis_q')) {
      handleDiagnosisAnswer(userId, state, key, replyToken);
      return;
    }
    
    // ========== 立場選択 ==========
    if (key === 'attribute') {
      saveUserData(userId, 'attribute', value);
      replyMessage(replyToken, createRegionQuestionMessage());
      updateUserState(userId, 'waiting_region');
      return;
    }
    
    // ========== 地域選択 ==========
    if (key === 'region') {
      saveUserData(userId, 'region', value);
      replyMessage(replyToken, createPrefectureQuestionMessage(value));
      updateUserState(userId, 'waiting_prefecture');
      return;
    }
    
    // ========== 都道府県選択 ==========
    if (key === 'prefecture') {
      saveUserData(userId, 'prefecture', value);
      replyMessage(replyToken, createTeamNameQuestionMessage());
      updateUserState(userId, 'waiting_team_name');
      return;
    }
    
  } catch (error) {
    Logger.log('Error in handlePostback: ' + error);
  }
}


// ==============================
// 診断関連処理
// ==============================

/**
 * 診断を開始する（いつでも呼び出し可能）
 */
function startDiagnosis(userId, replyToken) {
  initializeDiagnosisScores(userId);
  
  replyMultipleMessages(replyToken, [
    { type: 'text', text: '志向性診断を始めます⚽️\n全8問・約1分で完了します。\n\n直感で選んでください💡' },
    createDiagnosisQuestion(1)
  ]);
  updateUserState(userId, 'diagnosis_q1');
}

/**
 * 診断スコアを初期化
 */
function initializeDiagnosisScores(userId) {
  const initialScores = {};
  Object.keys(ORIENTATION_TYPES).forEach(type => {
    initialScores[type] = 0;
  });
  saveTempData(userId, 'diagnosis_scores', initialScores);
}

/**
 * 診断回答を処理
 */
function handleDiagnosisAnswer(userId, state, answerKey, replyToken) {
  const qNum = parseInt(state.step.replace('diagnosis_q', ''));
  const qIndex = qNum - 1;
  
  if (qIndex >= DIAGNOSIS_QUESTIONS.length || qIndex < 0) {
    return;
  }
  
  const question = DIAGNOSIS_QUESTIONS[qIndex];
  
  // answerKeyの検証
  if (!['yes', 'no', 'unknown'].includes(answerKey)) {
    return;
  }
  
  // スコア計算
  const tempState = getUserState(userId);
  let scores = tempState.temp_data.diagnosis_scores || {};
  
  // スコアが空の場合は初期化
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
    // 次の質問へ
    replyMessage(replyToken, createDiagnosisQuestion(nextQNum));
    updateUserState(userId, `diagnosis_q${nextQNum}`);
  } else {
    // 診断完了 → 分岐処理
    handleDiagnosisComplete(userId, scores, replyToken);
  }
}

/**
 * 診断完了後の分岐処理
 */
function handleDiagnosisComplete(userId, scores, replyToken) {
  const resultType = getDiagnosisResult(scores);
  const userData = getUserData(userId);
  
  // 診断結果を保存
  saveTempData(userId, 'diagnosis_result', { type: resultType, scores: scores });
  
  if (isUserRegistered(userData)) {
    // ========== 登録済ユーザー → 即カルーセル表示 ==========
    const resultText = createDiagnosisResultTextForRegistered(resultType);
    const carousel = createUniversityCarouselMessage(resultType, userData.region);
    
    const messages = [resultText];
    if (carousel) {
      messages.push(carousel);
    }
    
    replyMultipleMessages(replyToken, messages);
    clearUserState(userId);
    
  } else {
    // ========== 未登録ユーザー → テキスト結果 → プロフィール登録 ==========
    const messages = [
      createDiagnosisResultTextForUnregistered(resultType),
      createRegistrationPromptMessage()
    ];
    
    replyMultipleMessages(replyToken, messages);
    updateUserState(userId, 'waiting_name');
  }
}

/**
 * 診断結果を判定
 */
function getDiagnosisResult(scores) {
  let maxScore = -1;
  let resultType = null;
  
  for (const type in scores) {
    if (scores[type] > maxScore) {
      maxScore = scores[type];
      resultType = type;
    }
  }
  
  if (resultType) {
    const tiedTypes = Object.keys(scores).filter(type => scores[type] === maxScore);
    return tiedTypes.sort()[0];
  }
  
  return 'A';
}

/**
 * ユーザーが登録済みかどうか判定
 */
function isUserRegistered(userData) {
  return userData && userData.name && userData.region;
}


// ==============================
// チーム名入力後の処理（登録完了）
// ==============================
function handleTeamNameInput(userId, text, replyToken) {
  saveUserData(userId, 'team_name', text);
  saveUserData(userId, 'plan', 'FREE');
  
  if (FREE_RICHMENU_ID) {
    linkRichMenuToUser(userId, FREE_RICHMENU_ID);
  }
  
  const userData = getUserData(userId);
  const tempState = getUserState(userId);
  const diagnosisResult = tempState.temp_data.diagnosis_result;
  
  const userDidDiagnosis = diagnosisResult && diagnosisResult.type && diagnosisResult.type !== 'Skipped';
  
  // メッセージを5件以内に収める
  const messages = [];
  
  if (userDidDiagnosis) {
    // 診断した場合：結果 + カルーセル + 登録確認 + サイト遷移（4〜5件）
    
    // 1. 登録完了 + 診断結果案内（1件にまとめる）
    messages.push({
      type: 'text',
      text: `🔓 情報の整理が完了しました！\n\nあなたの診断結果【${ORIENTATION_TYPES[diagnosisResult.type].name}】と\nお住まいの地域をもとに、\n参考になりやすい大学を表示します。`
    });
    
    // 2. カルーセル
    const carousel = createUniversityCarouselMessage(diagnosisResult.type, userData.region);
    if (carousel) {
      messages.push(carousel);
    }
    
    // 3. 登録内容確認 + 次のアクション（1件にまとめる）
    const completeText = `${userData.name}さん、ご協力ありがとうございました！\n\n` +
      `【登録内容】\n` +
      `氏名：${userData.name}\n` +
      `立場：${userData.attribute}\n` +
      `地域：${userData.region}\n` +
      `都道府県：${userData.prefecture}\n` +
      `チーム名：${userData.team_name}\n\n` +
      `これからあなたに合った情報をお届けします😊\n\n` +
      `💡 いつでも「診断する」と送ると再診断できます。`;
    messages.push({ type: 'text', text: completeText });
    
    // 4. サイト遷移
    messages.push(createSiteNavigationMessage());
    
  } else {
    // 診断スキップした場合：登録確認 + サイト遷移（3件）
    
    // 1. 登録完了
    messages.push({
      type: 'text',
      text: '🔓 情報の整理が完了しました！'
    });
    
    // 2. 登録内容確認
    const completeText = `${userData.name}さん、ご協力ありがとうございました！\n\n` +
      `【登録内容】\n` +
      `氏名：${userData.name}\n` +
      `立場：${userData.attribute}\n` +
      `地域：${userData.region}\n` +
      `都道府県：${userData.prefecture}\n` +
      `チーム名：${userData.team_name}\n\n` +
      `これからあなたに合った情報をお届けします😊\n\n` +
      `💡「診断する」と送ると、志向性診断ができます。`;
    messages.push({ type: 'text', text: completeText });
    
    // 3. サイト遷移
    messages.push(createSiteNavigationMessage());
  }
  
  // replyを使用（無料で制限なし）
  replyMultipleMessages(replyToken, messages);
  
  clearUserState(userId);
}


// ==============================
// メッセージ作成関数
// ==============================

/**
 * 診断開始の問いかけ
 */
function createDiagnosisStartQuestion() {
  return {
    type: 'flex',
    altText: '志向性診断を始めますか？',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⚽️ 進路志向性診断',
            weight: 'bold',
            size: 'xl',
            color: '#000000'
          },
          {
            type: 'text',
            text: '8つの質問に答えるだけで、あなたに合った進路の方向性がわかります。\n\n所要時間：約1分',
            size: 'sm',
            color: '#666666',
            margin: 'lg',
            wrap: true
          },
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '診断を始める',
              data: 'start_diagnosis=yes',
              displayText: '診断を始めます'
            },
            style: 'primary',
            color: BRAND_COLOR,
            margin: 'xl',
            height: 'sm'
          },
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '今回はスキップする',
              data: 'start_diagnosis=no',
              displayText: 'スキップします'
            },
            style: 'secondary',
            margin: 'md',
            height: 'sm'
          }
        ]
      }
    }
  };
}

/**
 * 診断質問
 */
function createDiagnosisQuestion(qNum) {
  const qIndex = qNum - 1;
  const questionData = DIAGNOSIS_QUESTIONS[qIndex];
  
  const answerLabels = {
    'yes': 'そう思う',
    'no': 'そうは思わない',
    'unknown': 'わからない'
  };
  
  const buttons = Object.keys(questionData.scores).map(key => ({
    type: 'button',
    action: {
      type: 'postback',
      label: answerLabels[key],
      data: key,
      displayText: answerLabels[key]
    },
    style: 'primary',
    color: BRAND_COLOR,
    margin: 'md',
    height: 'sm'
  }));
  
  return {
    type: 'flex',
    altText: `Q${qNum}/${DIAGNOSIS_QUESTIONS.length}`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `Q${qNum} / ${DIAGNOSIS_QUESTIONS.length}`,
            size: 'xs',
            color: '#999999'
          },
          {
            type: 'text',
            text: questionData.text,
            weight: 'bold',
            size: 'lg',
            margin: 'md',
            color: '#000000',
            wrap: true
          },
          {
            type: 'separator',
            margin: 'xl'
          },
          ...buttons
        ]
      }
    }
  };
}

/**
 * 診断結果（未登録ユーザー向け・テキスト版）
 */
function createDiagnosisResultTextForUnregistered(resultType) {
  const typeData = ORIENTATION_TYPES[resultType];
  const universities = RECOMMENDED_UNIVERSITIES[resultType];
  
  // 大学リストをテキストで作成（5校）
  const uniList = universities.slice(0, 5).map(uni => 
    `・${uni.name}（${uni.region}）`
  ).join('\n');
  
  const text = `🎉 診断結果が出ました！\n\n` +
    `あなたは\n【${typeData.icon} ${typeData.name}】です。\n\n` +
    `${typeData.description}\n\n` +
    `このタイプの選手には、たとえば\n${uniList}\nなどが進路の選択肢になります。`;
  
  return { type: 'text', text: text };
}

/**
 * 登録への導線メッセージ
 */
function createRegistrationPromptMessage() {
  return {
    type: 'flex',
    altText: 'プロフィール登録',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'この診断結果をもとに、\nあなたの地域や立場を加味して\n参考になりやすい大学を整理します。',
            size: 'sm',
            color: '#333333',
            wrap: true
          },
          {
            type: 'text',
            text: 'あと5問・約1分です。',
            size: 'sm',
            color: BRAND_COLOR,
            margin: 'lg',
            weight: 'bold'
          },
          {
            type: 'separator',
            margin: 'xl'
          },
          {
            type: 'text',
            text: 'STEP 1/5',
            size: 'xs',
            color: '#999999',
            margin: 'lg'
          },
          {
            type: 'text',
            text: 'お名前を入力してください',
            weight: 'bold',
            size: 'md',
            margin: 'sm',
            color: '#000000'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            backgroundColor: '#F5F5F5',
            cornerRadius: 'md',
            paddingAll: 'md',
            contents: [
              { type: 'text', text: '✅ 入力例', size: 'xs', color: '#999999' },
              { type: 'text', text: '山田太郎', size: 'md', color: '#000000', margin: 'xs' }
            ]
          }
        ]
      }
    }
  };
}

/**
 * 診断結果（登録済ユーザー向け・短縮版）
 */
function createDiagnosisResultTextForRegistered(resultType) {
  const typeData = ORIENTATION_TYPES[resultType];
  
  const text = `🎯 診断結果\n\n` +
    `あなたは【${typeData.icon} ${typeData.name}】です。\n\n` +
    `${typeData.description}\n\n` +
    `あなたの地域を考慮して、\n参考になりやすい大学を表示します。`;
  
  return { type: 'text', text: text };
}

/**
 * 大学カルーセル（地域考慮あり）
 */
function createUniversityCarouselMessage(type, userRegion) {
  let universities = [...RECOMMENDED_UNIVERSITIES[type]];
  
  // 地域が指定されている場合、その地域の大学を優先
  if (userRegion) {
    universities.sort((a, b) => {
      const aMatch = a.region === userRegion ? 0 : 1;
      const bMatch = b.region === userRegion ? 0 : 1;
      return aMatch - bMatch;
    });
  }
  
  // 上位3校を表示
  const topUniversities = universities.slice(0, 3);
  
  if (topUniversities.length === 0) return null;
  
  const carouselContents = topUniversities.map(uni => ({
    type: 'bubble',
    hero: {
      type: 'image',
      url: uni.imageUrl,
      size: 'full',
      aspectRatio: '20:13',
      aspectMode: 'cover'
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: uni.name,
          weight: 'bold',
          size: 'xl',
          wrap: true
        },
        {
          type: 'box',
          layout: 'horizontal',
          margin: 'md',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: BRAND_COLOR,
              paddingAll: 'xs',
              cornerRadius: 'sm',
              contents: [
                {
                  type: 'text',
                  text: uni.region,
                  size: 'sm',
                  color: '#ffffff',
                  align: 'center'
                }
              ]
            },
            {
              type: 'text',
              text: uni.league,
              size: 'sm',
              color: '#666666',
              margin: 'sm'
            }
          ]
        },
        {
          type: 'text',
          text: uni.feature,
          size: 'sm',
          color: '#999999',
          margin: 'md',
          wrap: true
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: '詳細を見る',
            uri: MOISH_SITE_URL + 'university?name=' + encodeURIComponent(uni.name)
          },
          style: 'primary',
          color: BRAND_COLOR
        }
      ]
    }
  }));
  
  return {
    type: 'flex',
    altText: 'おすすめ大学',
    contents: {
      type: 'carousel',
      contents: carouselContents
    }
  };
}

/**
 * 名前入力依頼
 */
function createNameQuestionMessage() {
  return {
    type: 'flex',
    altText: 'お名前',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'STEP 1/5', size: 'xs', color: '#999999' },
          { type: 'text', text: 'お名前', weight: 'bold', size: 'xl', margin: 'md', color: '#000000' },
          { type: 'separator', margin: 'lg' },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '①', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                  { type: 'text', text: '下のメッセージ入力欄をタップ', size: 'sm', color: '#666666', margin: 'sm', wrap: true, flex: 5 }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '②', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                  { type: 'text', text: 'お名前を入力', size: 'sm', color: '#666666', margin: 'sm', flex: 5 }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '③', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                  { type: 'text', text: '送信ボタンを押す', size: 'sm', color: '#666666', margin: 'sm', flex: 5 }
                ]
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            backgroundColor: '#F5F5F5',
            cornerRadius: 'md',
            paddingAll: 'md',
            contents: [
              { type: 'text', text: '✅ 入力例', size: 'xs', color: '#999999' },
              { type: 'text', text: '山田太郎', size: 'md', color: '#000000', margin: 'xs' }
            ]
          }
        ]
      }
    }
  };
}

/**
 * 立場選択
 */
function createAttributeQuestionMessage() {
  return {
    type: 'flex',
    altText: '立場を選択',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'STEP 2/5', size: 'xs', color: '#999999' },
          { type: 'text', text: '立場', weight: 'bold', size: 'xl', margin: 'md', color: '#000000' },
          { type: 'text', text: 'あなたの立場を選択してください', size: 'sm', color: '#999999', margin: 'md', wrap: true },
          { type: 'separator', margin: 'xl' },
          { type: 'button', action: { type: 'postback', label: '高1', data: 'attribute=高1', displayText: '高1' }, style: 'primary', color: BRAND_COLOR, margin: 'md', height: 'sm' },
          { type: 'button', action: { type: 'postback', label: '高2', data: 'attribute=高2', displayText: '高2' }, style: 'primary', color: BRAND_COLOR, margin: 'md', height: 'sm' },
          { type: 'button', action: { type: 'postback', label: '高3', data: 'attribute=高3', displayText: '高3' }, style: 'primary', color: BRAND_COLOR, margin: 'md', height: 'sm' },
          { type: 'button', action: { type: 'postback', label: '保護者', data: 'attribute=保護者', displayText: '保護者' }, style: 'primary', color: BRAND_COLOR, margin: 'md', height: 'sm' },
          { type: 'button', action: { type: 'postback', label: '指導者', data: 'attribute=指導者', displayText: '指導者' }, style: 'primary', color: BRAND_COLOR, margin: 'md', height: 'sm' }
        ]
      }
    }
  };
}

/**
 * 地域選択
 */
function createRegionQuestionMessage() {
  const regions = ['北海道', '東北', '関東', '北信越', '東海', '関西', '中国', '四国', '九州・沖縄'];
  const buttons = regions.map(region => ({
    type: 'button',
    action: { type: 'postback', label: region, data: `region=${region}`, displayText: region },
    style: 'primary',
    color: BRAND_COLOR,
    margin: 'md',
    height: 'sm'
  }));
  
  return {
    type: 'flex',
    altText: '地域を選択',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'STEP 3/5', size: 'xs', color: '#999999' },
          { type: 'text', text: '所属チームの地域', weight: 'bold', size: 'xl', margin: 'md', color: '#000000' },
          { type: 'text', text: '地域を選択してください', size: 'sm', color: '#999999', margin: 'md', wrap: true },
          { type: 'separator', margin: 'xl' },
          ...buttons
        ]
      }
    }
  };
}

/**
 * 都道府県選択
 */
function createPrefectureQuestionMessage(region) {
  const prefectures = REGION_PREFECTURES[region] || [];
  const buttons = prefectures.map(pref => ({
    type: 'button',
    action: { type: 'postback', label: pref, data: `prefecture=${pref}`, displayText: pref },
    style: 'primary',
    color: BRAND_COLOR,
    margin: 'md',
    height: 'sm'
  }));
  
  return {
    type: 'flex',
    altText: '都道府県を選択',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'STEP 4/5', size: 'xs', color: '#999999' },
          { type: 'text', text: '所属チームの都道府県', weight: 'bold', size: 'xl', margin: 'md', color: '#000000' },
          { type: 'text', text: '都道府県を選択してください', size: 'sm', color: '#999999', margin: 'md', wrap: true },
          { type: 'separator', margin: 'xl' },
          ...buttons
        ]
      }
    }
  };
}

/**
 * チーム名入力依頼
 */
function createTeamNameQuestionMessage() {
  return {
    type: 'flex',
    altText: '所属チーム名',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'STEP 5/5（最後です！）', size: 'xs', color: '#999999' },
          { type: 'text', text: '所属チーム名', weight: 'bold', size: 'xl', margin: 'md', color: '#000000' },
          { type: 'separator', margin: 'lg' },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '①', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                  { type: 'text', text: '下のメッセージ入力欄をタップ', size: 'sm', color: '#666666', margin: 'sm', wrap: true, flex: 5 }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '②', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                  { type: 'text', text: '所属チーム名を入力', size: 'sm', color: '#666666', margin: 'sm', flex: 5 }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '③', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                  { type: 'text', text: '送信ボタンを押す', size: 'sm', color: '#666666', margin: 'sm', flex: 5 }
                ]
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            backgroundColor: '#F5F5F5',
            cornerRadius: 'md',
            paddingAll: 'md',
            contents: [
              { type: 'text', text: '✅ 入力例', size: 'xs', color: '#999999' },
              { type: 'text', text: '◯◯高校サッカー部', size: 'md', color: '#000000', margin: 'xs' }
            ]
          }
        ]
      }
    }
  };
}

/**
 * サイト遷移メッセージ
 */
function createSiteNavigationMessage() {
  return {
    type: 'flex',
    altText: 'MOISHサイトへ',
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: MOISH_LOGO_URL,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
        backgroundColor: BRAND_COLOR
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'さあ、始めましょう！', weight: 'bold', size: 'xl', color: '#000000' },
          { type: 'text', text: '全国の大学情報の検索など、あなたにぴったりの進路を見つけることができます。', size: 'sm', color: '#666666', margin: 'md', wrap: true },
          {
            type: 'button',
            action: { type: 'uri', label: 'MOISHサイトへ', uri: MOISH_SITE_URL },
            style: 'primary',
            color: BRAND_COLOR,
            margin: 'xl',
            height: 'sm'
          }
        ]
      }
    }
  };
}


// ==============================
// テストコマンド処理
// ==============================
function handleTestCommands(userId, text, replyToken, state, userData) {
  if (text === '追加' || text === 'ついか' || text === 'リセット') {
    clearUserData(userId);
    clearUserState(userId);
    initializeDiagnosisScores(userId);
    
    const welcomeMessage = {
      type: 'text',
      text: 'リセットしました。\n\n友だち追加ありがとうございます⚽️\n\n簡単な質問に答えるだけで、\nあなたの進路の考え方を整理できます。'
    };
    const startQuestionMessage = createDiagnosisStartQuestion();
    
    replyMultipleMessages(replyToken, [welcomeMessage, startQuestionMessage]);
    updateUserState(userId, 'waiting_diagnosis_start');
    return true;
  }
  
  if (text === '状態確認' || text === '確認' || text === 'じょうたい') {
    const plan = userData.plan || 'FREE';
    const planLabel = (plan === 'BASIC') ? 'ベーシック' : 'フリー';
    const diagnosisResult = state.temp_data.diagnosis_result ? state.temp_data.diagnosis_result.type : '未実施';
    const isRegistered = isUserRegistered(userData) ? '登録済' : '未登録';
    
    let infoText = '【現在の登録状態】\n\n';
    infoText += `ステータス: ${isRegistered}\n`;
    infoText += `氏名: ${userData.name || '未登録'}\n`;
    infoText += `立場: ${userData.attribute || '未登録'}\n`;
    infoText += `地域: ${userData.region || '未登録'}\n`;
    infoText += `都道府県: ${userData.prefecture || '未登録'}\n`;
    infoText += `チーム名: ${userData.team_name || '未登録'}\n`;
    infoText += `プラン: ${planLabel}\n\n`;
    infoText += `診断結果: ${diagnosisResult}\n`;
    infoText += `進行状況: ${state.step || '未開始'}\n\n`;
    infoText += '「追加」でリセット\n「診断する」で診断開始';
    
    replyMessage(replyToken, infoText);
    return true;
  }
  
  if (text === '削除' || text === 'さくじょ') {
    clearUserData(userId);
    clearUserState(userId);
    replyMessage(replyToken, '登録情報を削除しました。\n「追加」と送信すると再登録できます。');
    return true;
  }
  
  if (text === 'ヘルプ' || text === 'help' || text === 'テスト') {
    const helpText = '【テストコマンド】\n\n' +
      '「追加」→ 最初から開始\n' +
      '「状態確認」→ 現在の登録情報\n' +
      '「削除」→ 登録情報を削除\n' +
      '「診断する」→ 診断を開始\n\n' +
      '「プラン:ベーシック」→ プラン変更\n' +
      '「プラン:フリー」→ プラン変更\n' +
      '「プラン確認」→ プラン確認\n\n' +
      '「機能説明」→ 機能の説明\n' +
      '「進路相談」→ 相談開始\n\n' +
      '※本番環境ではテストコマンド無効';
    
    replyMessage(replyToken, helpText);
    return true;
  }
  
  return false;
}

/**
 * プラン変更処理
 */
function handlePlanChange(userId, text, replyToken) {
  const parts = text.split(':');
  if (parts.length === 2) {
    const newPlan = parts[1].toUpperCase().trim();
    if (newPlan === 'ベーシック' || newPlan === 'BASIC') {
      saveUserData(userId, 'plan', 'BASIC');
      if (BASIC_RICHMENU_ID) linkRichMenuToUser(userId, BASIC_RICHMENU_ID);
      replyMessage(replyToken, 'プランを【ベーシック】に変更しました。');
    } else if (newPlan === 'フリー' || newPlan === 'FREE') {
      saveUserData(userId, 'plan', 'FREE');
      if (FREE_RICHMENU_ID) linkRichMenuToUser(userId, FREE_RICHMENU_ID);
      replyMessage(replyToken, 'プランを【フリー】に変更しました。');
    }
  }
}


// ==============================
// リッチメニュー紐づけ
// ==============================
function linkRichMenuToUser(userId, richMenuId) {
  if (!richMenuId) return;
  
  try {
    const url = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;
    
    const options = {
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
      },
      muteHttpExceptions: true
    };
    
    const res = UrlFetchApp.fetch(url, options);
    Logger.log('linkRichMenuToUser status:', res.getResponseCode());
  } catch (e) {
    Logger.log('linkRichMenuToUser error:', e);
  }
}


// ==============================
// メッセージ送信
// ==============================
function pushMessage(userId, message) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: userId,
    messages: [message]
  };
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() !== 200) {
      Logger.log('Push message error: ' + response.getContentText());
    }
  } catch (error) {
    Logger.log('Error in pushMessage: ' + error);
  }
}

function replyMessage(replyToken, messageOrText) {
  try {
    const message = typeof messageOrText === 'string'
      ? { type: 'text', text: messageOrText }
      : messageOrText;
    
    const url = 'https://api.line.me/v2/bot/message/reply';
    const payload = {
      replyToken,
      messages: [message]
    };
    
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const res = UrlFetchApp.fetch(url, options);
    Logger.log('LINE reply status:', res.getResponseCode());
  } catch (error) {
    Logger.log('LINE reply error:', error);
  }
}

function pushMultipleMessages(userId, messages) {
  if (!messages || messages.length === 0) return;
  
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: userId,
    messages: messages.slice(0, 5)
  };
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() !== 200) {
      Logger.log('Push message error: ' + response.getContentText());
    }
  } catch (error) {
    Logger.log('Error in pushMultipleMessages: ' + error);
  }
}

function replyMultipleMessages(replyToken, messages) {
  if (!replyToken || !messages || messages.length === 0) {
    Logger.log('No replyToken or messages provided');
    return;
  }
  
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
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    Logger.log('Reply multiple messages:', response.getResponseCode());
  } catch (error) {
    Logger.log('Error in replyMultipleMessages:', error);
  }
}


// ==============================
// スプレッドシート操作
// ==============================

function saveConsultation(userId, userData, text) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('consultations');
    
    if (!sheet) {
      sheet = ss.insertSheet('consultations');
      sheet.appendRow(['userId', 'name', 'attribute', 'team_name', 'consultation_content', 'created_at']);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['userId', 'name', 'attribute', 'team_name', 'consultation_content', 'created_at']);
    }
    
    sheet.appendRow([
      userId,
      userData.name || '',
      userData.attribute || '',
      userData.team_name || '',
      text,
      new Date()
    ]);
  } catch (error) {
    Logger.log('Error in saveConsultation: ' + error);
  }
}

function getUserState(userId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('user_states');
    
    if (!sheet) {
      sheet = ss.insertSheet('user_states');
      sheet.appendRow(['userId', 'step', 'temp_data', 'updated_at']);
      return { step: '', temp_data: {} };
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['userId', 'step', 'temp_data', 'updated_at']);
      return { step: '', temp_data: {} };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        let tempData = {};
        const rawTempData = data[i][2];
        
        if (rawTempData && typeof rawTempData === 'string' && rawTempData.trim() !== '') {
          try {
            tempData = JSON.parse(rawTempData);
          } catch (parseError) {
            Logger.log('JSON parse error in getUserState: ' + parseError + ', rawData: ' + rawTempData);
            tempData = {};
          }
        }
        
        return {
          step: data[i][1] || '',
          temp_data: tempData
        };
      }
    }
    
    return { step: '', temp_data: {} };
  } catch (error) {
    Logger.log('Error in getUserState: ' + error);
    return { step: '', temp_data: {} };
  }
}

function updateUserState(userId, step) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('user_states');
    
    if (!sheet) {
      sheet = ss.insertSheet('user_states');
      sheet.appendRow(['userId', 'step', 'temp_data', 'updated_at']);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['userId', 'step', 'temp_data', 'updated_at']);
    }
    
    const data = sheet.getDataRange().getValues();
    
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        sheet.getRange(i + 1, 2).setValue(step);
        sheet.getRange(i + 1, 4).setValue(new Date());
        found = true;
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([userId, step, '', new Date()]);
    }
  } catch (error) {
    Logger.log('Error in updateUserState: ' + error);
  }
}

function saveTempData(userId, key, value) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('user_states');
    
    if (!sheet) {
      sheet = ss.insertSheet('user_states');
      sheet.appendRow(['userId', 'step', 'temp_data', 'updated_at']);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['userId', 'step', 'temp_data', 'updated_at']);
    }
    
    const data = sheet.getDataRange().getValues();
    
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        let tempData = {};
        
        // temp_dataのパース（エラーハンドリング強化）
        const rawTempData = data[i][2];
        if (rawTempData && typeof rawTempData === 'string' && rawTempData.trim() !== '') {
          try {
            tempData = JSON.parse(rawTempData);
          } catch (parseError) {
            tempData = {};
          }
        }
        
        tempData[key] = value;
        const newTempDataStr = JSON.stringify(tempData);
        
        sheet.getRange(i + 1, 3).setValue(newTempDataStr);
        sheet.getRange(i + 1, 4).setValue(new Date());
        found = true;
        break;
      }
    }
    
    if (!found) {
      const newTempData = JSON.stringify({ [key]: value });
      sheet.appendRow([userId, '', newTempData, new Date()]);
    }
  } catch (error) {
    Logger.log('Error in saveTempData: ' + error);
  }
}

function saveUserData(userId, key, value) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('users');
    
    if (!sheet) {
      sheet = ss.insertSheet('users');
      sheet.appendRow(['userId', 'name', 'attribute', 'region', 'prefecture', 'team_name', 'plan', 'created_at', 'updated_at']);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['userId', 'name', 'attribute', 'region', 'prefecture', 'team_name', 'plan', 'created_at', 'updated_at']);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const colIndex = headers.indexOf(key);
    
    if (colIndex === -1) {
      Logger.log(`Column ${key} not found`);
      return;
    }
    
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        sheet.getRange(i + 1, colIndex + 1).setValue(value);
        sheet.getRange(i + 1, headers.indexOf('updated_at') + 1).setValue(new Date());
        found = true;
        break;
      }
    }
    
    if (!found) {
      const newRow = new Array(headers.length).fill('');
      newRow[0] = userId;
      newRow[colIndex] = value;
      newRow[headers.indexOf('created_at')] = new Date();
      newRow[headers.indexOf('updated_at')] = new Date();
      sheet.appendRow(newRow);
    }
  } catch (error) {
    Logger.log('Error in saveUserData: ' + error);
  }
}

function getUserData(userId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('users');
    
    if (!sheet || sheet.getLastRow() === 0) {
      return {};
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        const userData = {};
        headers.forEach((header, index) => {
          userData[header] = data[i][index];
        });
        return userData;
      }
    }
    
    return {};
  } catch (error) {
    Logger.log('Error in getUserData: ' + error);
    return {};
  }
}

function clearUserState(userId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('user_states');
    
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        sheet.getRange(i + 1, 2).setValue('');
        sheet.getRange(i + 1, 3).setValue('');
        sheet.getRange(i + 1, 4).setValue(new Date());
        break;
      }
    }
  } catch (error) {
    Logger.log('Error in clearUserState: ' + error);
  }
}

function clearUserData(userId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('users');
    
    if (!sheet || sheet.getLastRow() === 0) return;
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        const range = sheet.getRange(i + 1, 2, 1, data[0].length - 1);
        range.clearContent();
        break;
      }
    }
  } catch (error) {
    Logger.log('Error in clearUserData: ' + error);
  }
}