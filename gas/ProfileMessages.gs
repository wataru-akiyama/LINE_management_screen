// ==============================
// ProfileMessages.gs - プロフィール収集用メッセージ作成
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
          { type: 'text', text: '⚽️ 進路志向性診断', weight: 'bold', size: 'xl', color: '#000000' },
          { type: 'text', text: '8つの質問に答えるだけで、あなたに合った進路の方向性がわかります。\n\n所要時間：約1分', size: 'sm', color: '#666666', margin: 'lg', wrap: true },
          {
            type: 'button',
            action: { type: 'postback', label: '診断を始める', data: 'start_diagnosis=yes', displayText: '診断を始めます' },
            style: 'primary', color: BRAND_COLOR, margin: 'xl', height: 'sm'
          },
          {
            type: 'button',
            action: { type: 'postback', label: '今回はスキップする', data: 'start_diagnosis=no', displayText: 'スキップします' },
            style: 'secondary', margin: 'md', height: 'sm'
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
  
  const answerLabels = { 'yes': 'そう思う', 'no': 'そうは思わない', 'unknown': 'わからない' };
  
  const buttons = Object.keys(questionData.scores).map(key => ({
    type: 'button',
    action: { type: 'postback', label: answerLabels[key], data: key, displayText: answerLabels[key] },
    style: 'primary', color: BRAND_COLOR, margin: 'md', height: 'sm'
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
          { type: 'text', text: `Q${qNum} / ${DIAGNOSIS_QUESTIONS.length}`, size: 'xs', color: '#999999' },
          { type: 'text', text: questionData.text, weight: 'bold', size: 'lg', margin: 'md', color: '#000000', wrap: true },
          { type: 'separator', margin: 'xl' },
          ...buttons
        ]
      }
    }
  };
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
          { type: 'text', text: 'この診断結果をもとに、\nあなたの地域や立場を加味して\n参考になりやすい大学を整理します。', size: 'sm', color: '#333333', wrap: true },
          { type: 'text', text: 'あと5問・約1分です。', size: 'sm', color: BRAND_COLOR, margin: 'lg', weight: 'bold' },
          { type: 'separator', margin: 'xl' },
          { type: 'text', text: 'STEP 1/5', size: 'xs', color: '#999999', margin: 'lg' },
          { type: 'text', text: 'お名前を入力してください', weight: 'bold', size: 'md', margin: 'sm', color: '#000000' },
          {
            type: 'box', layout: 'vertical', margin: 'lg', backgroundColor: '#F5F5F5', cornerRadius: 'md', paddingAll: 'md',
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
            type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm',
            contents: [
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: '①', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                { type: 'text', text: '下のメッセージ入力欄をタップ', size: 'sm', color: '#666666', margin: 'sm', wrap: true, flex: 5 }
              ]},
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: '②', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                { type: 'text', text: 'お名前を入力', size: 'sm', color: '#666666', margin: 'sm', flex: 5 }
              ]},
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: '③', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                { type: 'text', text: '送信ボタンを押す', size: 'sm', color: '#666666', margin: 'sm', flex: 5 }
              ]}
            ]
          },
          {
            type: 'box', layout: 'vertical', margin: 'lg', backgroundColor: '#F5F5F5', cornerRadius: 'md', paddingAll: 'md',
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
 * 学年選択
 */
function createGradeQuestionMessage() {
  const grades = ['高1', '高2', '高3', '保護者', '指導者'];
  const buttons = grades.map(grade => ({
    type: 'button',
    action: { type: 'postback', label: grade, data: `grade=${grade}`, displayText: grade },
    style: 'primary', color: BRAND_COLOR, margin: 'md', height: 'sm'
  }));
  
  return {
    type: 'flex',
    altText: '学年を選択',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'STEP 2/5', size: 'xs', color: '#999999' },
          { type: 'text', text: '学年・立場', weight: 'bold', size: 'xl', margin: 'md', color: '#000000' },
          { type: 'text', text: 'あなたの学年または立場を選択してください', size: 'sm', color: '#999999', margin: 'md', wrap: true },
          { type: 'separator', margin: 'xl' },
          ...buttons
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
    style: 'primary', color: BRAND_COLOR, margin: 'md', height: 'sm'
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
    style: 'primary', color: BRAND_COLOR, margin: 'md', height: 'sm'
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
            type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm',
            contents: [
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: '①', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                { type: 'text', text: '下のメッセージ入力欄をタップ', size: 'sm', color: '#666666', margin: 'sm', wrap: true, flex: 5 }
              ]},
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: '②', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                { type: 'text', text: '所属チーム名を入力', size: 'sm', color: '#666666', margin: 'sm', flex: 5 }
              ]},
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: '③', size: 'sm', color: BRAND_COLOR, flex: 0, weight: 'bold' },
                { type: 'text', text: '送信ボタンを押す', size: 'sm', color: '#666666', margin: 'sm', flex: 5 }
              ]}
            ]
          },
          {
            type: 'box', layout: 'vertical', margin: 'lg', backgroundColor: '#F5F5F5', cornerRadius: 'md', paddingAll: 'md',
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
