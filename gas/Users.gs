// ==============================
// Users.gs - ユーザー管理API
// ==============================

/**
 * ユーザー一覧を取得する
 * @param {Object} params - クエリパラメータ
 * @returns {Object} ユーザー一覧とページネーション情報
 */
function getUsers(params) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // データが1行（ヘッダーのみ）の場合
  if (data.length <= 1) {
    return {
      users: [],
      pagination: { total: 0, page: 1, limit: 50, totalPages: 0 }
    };
  }
  
  // ユーザーデータをオブジェクトに変換
  let users = data.slice(1).map(row => {
    const user = {};
    headers.forEach((h, i) => {
      user[h] = row[i];
    });
    
    // 日付をISO文字列に変換
    if (user.registeredAt instanceof Date) {
      user.registeredAt = user.registeredAt.toISOString();
    }
    if (user.updatedAt instanceof Date) {
      user.updatedAt = user.updatedAt.toISOString();
    }
    if (user.diagnosisCompletedAt instanceof Date) {
      user.diagnosisCompletedAt = user.diagnosisCompletedAt.toISOString();
    }
    
    // JSONフィールドをパース
    try {
      if (user.universities && typeof user.universities === 'string') {
        user.universities = JSON.parse(user.universities);
      }
    } catch (e) {
      user.universities = [];
    }
    try {
      if (user.customTags && typeof user.customTags === 'string') {
        user.customTags = JSON.parse(user.customTags);
      }
    } catch (e) {
      user.customTags = [];
    }
    // 配列でない場合は空配列に
    if (!Array.isArray(user.universities)) user.universities = [];
    if (!Array.isArray(user.customTags)) user.customTags = [];
    
    // 診断情報をオブジェクトにまとめる
    if (user.diagnosisType) {
      user.diagnosis = {
        type: user.diagnosisType,
        completedAt: user.diagnosisCompletedAt
      };
    }
    
    // 未読カウント
    const unreadCount = parseInt(user.unreadCount) || 0;
    user.unreadCount = unreadCount;
    user.hasUnreadMessages = unreadCount > 0;
    
    return user;
  }).filter(u => u.userId); // userIdがあるもののみ
  
  // フィルタリング
  if (params.search) {
    const search = String(params.search).toLowerCase().trim();
    Logger.log('Search query: ' + search);
    users = users.filter(u => {
      const name = String(u.name || '').toLowerCase();
      const teamName = String(u.teamName || '').toLowerCase();
      const lineId = String(u.lineId || '').toLowerCase();
      return name.includes(search) || teamName.includes(search) || lineId.includes(search);
    });
    Logger.log('Filtered users count: ' + users.length);
  }
  if (params.grade) {
    users = users.filter(u => u.grade === params.grade);
  }
  if (params.region) {
    users = users.filter(u => u.region === params.region);
  }
  if (params.plan) {
    users = users.filter(u => u.plan === params.plan);
  }
  if (params.status) {
    users = users.filter(u => (u.status || 'unread') === params.status);
  }
  
  // ソート（登録日の新しい順）
  users.sort((a, b) => {
    const dateA = new Date(a.registeredAt || 0);
    const dateB = new Date(b.registeredAt || 0);
    return dateB - dateA;
  });
  
  // ページネーション
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 50;
  const total = users.length;
  const start = (page - 1) * limit;
  const paginatedUsers = users.slice(start, start + limit);
  
  return {
    users: paginatedUsers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * ユーザー詳細を取得する
 * @param {string} userId - LINE User ID
 * @returns {Object} ユーザー情報
 */
function getUser(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      const user = {};
      headers.forEach((h, j) => user[h] = data[i][j]);
      
      // 日付をISO文字列に変換
      if (user.registeredAt instanceof Date) {
        user.registeredAt = user.registeredAt.toISOString();
      }
      if (user.updatedAt instanceof Date) {
        user.updatedAt = user.updatedAt.toISOString();
      }
      
      // JSON文字列をパース
      try {
        if (user.universities && typeof user.universities === 'string') {
          user.universities = JSON.parse(user.universities);
        } else {
          user.universities = [];
        }
        if (user.customTags && typeof user.customTags === 'string') {
          user.customTags = JSON.parse(user.customTags);
        } else {
          user.customTags = [];
        }
      } catch (e) {
        user.universities = [];
        user.customTags = [];
      }
      
      // 診断情報をオブジェクトにまとめる
      if (user.diagnosisType) {
        user.diagnosis = {
          type: user.diagnosisType,
          completedAt: user.diagnosisCompletedAt instanceof Date 
            ? user.diagnosisCompletedAt.toISOString() 
            : user.diagnosisCompletedAt
        };
      }
      
      return user;
    }
  }
  
  throw new Error('User not found: ' + userId);
}

/**
 * ユーザー情報を更新する
 * @param {string} userId - LINE User ID
 * @param {Object} updateData - 更新データ
 * @returns {Object} 更新結果
 */
function updateUser(userId, updateData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      Object.keys(updateData).forEach(key => {
        const colIndex = headers.indexOf(key);
        if (colIndex >= 0) {
          let value = updateData[key];
          // 配列はJSON文字列に変換
          if (Array.isArray(value)) {
            value = JSON.stringify(value);
          }
          sheet.getRange(i + 1, colIndex + 1).setValue(value);
        }
      });
      
      // 更新日時を更新
      const updatedAtCol = headers.indexOf('updatedAt');
      if (updatedAtCol >= 0) {
        sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date());
      }
      
      // プランが変更された場合、リッチメニューを適用
      if (updateData.plan) {
        try {
          // RichMenus.gs の関数を呼び出し
          // ※applyRichMenuByPlanが定義されていることを前提とする
          if (typeof applyRichMenuByPlan === 'function') {
            applyRichMenuByPlan(userId, updateData.plan);
            Logger.log(`Applied rich menu for user ${userId} (Plan: ${updateData.plan})`);
          }
        } catch (e) {
          Logger.log(`Failed to apply rich menu on plan update: ${e.toString()}`);
          // リッチメニュー適用失敗はエラーとして返さず、ログ出力のみに留める
        }
      }
      
      return { success: true, userId: userId };
    }
  }
  
  throw new Error('User not found: ' + userId);
}

// ==============================
// 未読カウント管理
// ==============================

/**
 * 未読カウントを1増やす
 * @param {string} userId - LINE User ID
 */
function incrementUnreadCount(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // unreadCount列がなければ作成
  let unreadCountCol = headers.indexOf('unreadCount');
  if (unreadCountCol < 0) {
    unreadCountCol = headers.length;
    sheet.getRange(1, unreadCountCol + 1).setValue('unreadCount');
  }
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      const currentCount = parseInt(data[i][unreadCountCol]) || 0;
      sheet.getRange(i + 1, unreadCountCol + 1).setValue(currentCount + 1);
      
      // updatedAt も更新
      const updatedAtCol = headers.indexOf('updatedAt');
      if (updatedAtCol >= 0) {
        sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date());
      }
      
      Logger.log('Incremented unread count for user ' + userId + ': ' + (currentCount + 1));
      return;
    }
  }
}

/**
 * 未読カウントをリセット（既読にする）
 * @param {string} userId - LINE User ID
 */
function resetUnreadCount(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  if (!sheet) return { success: false };
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let unreadCountCol = headers.indexOf('unreadCount');
  if (unreadCountCol < 0) return { success: false };
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      sheet.getRange(i + 1, unreadCountCol + 1).setValue(0);
      Logger.log('Reset unread count for user ' + userId);
      return { success: true };
    }
  
  return { success: false };
  }
}

/**
 * 未読メッセージ総数を取得
 */
function getTotalUnreadCount() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('users');
  if (!sheet) return { count: 0 };
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const unreadCountCol = headers.indexOf('unreadCount');
  if (unreadCountCol < 0) return { count: 0 };
  
  let total = 0;
  for (let i = 1; i < data.length; i++) {
    const count = parseInt(data[i][unreadCountCol]) || 0;
    total += count;
  }
  
  return { count: total };
}
