// ==============================
// ProfileData.gs - プロフィール収集用データ操作
// ==============================

/**
 * ユーザーの一時状態を取得
 */
function getProfileUserState(userId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('user_states');
    
    if (!sheet) {
      sheet = ss.insertSheet('user_states');
      sheet.appendRow(['userId', 'step', 'temp_data', 'updated_at']);
      return { step: '', temp_data: {} };
    }
    
    if (sheet.getLastRow() <= 1) {
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
    Logger.log('Error in getProfileUserState: ' + error);
    return { step: '', temp_data: {} };
  }
}

/**
 * ユーザーの一時状態を更新
 */
function updateProfileUserState(userId, step) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('user_states');
    
    if (!sheet) {
      sheet = ss.insertSheet('user_states');
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
    Logger.log('Error in updateProfileUserState: ' + error);
  }
}

/**
 * 一時データを保存
 */
function saveTempData(userId, key, value) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('user_states');
    
    if (!sheet) {
      sheet = ss.insertSheet('user_states');
      sheet.appendRow(['userId', 'step', 'temp_data', 'updated_at']);
    }
    
    const data = sheet.getDataRange().getValues();
    
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        let tempData = {};
        
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

/**
 * ユーザーの一時状態をクリア
 */
function clearProfileUserState(userId) {
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
    Logger.log('Error in clearProfileUserState: ' + error);
  }
}

/**
 * ユーザーデータを取得（プロフィール用）
 */
function getProfileUserData(userId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('users');
    
    if (!sheet || sheet.getLastRow() <= 1) {
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
    Logger.log('Error in getProfileUserData: ' + error);
    return {};
  }
}

/**
 * ユーザーデータを保存（プロフィール用）
 */
function saveProfileUserData(userId, key, value) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('users');
    
    // ヘッダーの定義（管理画面と互換性を保つ）
    const defaultHeaders = [
      'userId', 'name', 'grade', 'region', 'prefecture', 
      'teamName', 'plan', 'lineId', 'registeredAt', 'updatedAt',
      'universities', 'diagnosisType', 'diagnosisCompletedAt', 'customTags'
    ];
    
    if (!sheet) {
      sheet = ss.insertSheet('users');
      sheet.appendRow(defaultHeaders);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(defaultHeaders);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const colIndex = headers.indexOf(key);
    
    if (colIndex === -1) {
      Logger.log(`Column ${key} not found in users sheet`);
      return;
    }
    
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        sheet.getRange(i + 1, colIndex + 1).setValue(value);
        
        const updatedAtCol = headers.indexOf('updatedAt');
        if (updatedAtCol >= 0) {
          sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date());
        }
        found = true;
        break;
      }
    }
    
    if (!found) {
      // 新規ユーザー
      const newRow = new Array(headers.length).fill('');
      newRow[0] = userId;
      newRow[colIndex] = value;
      
      const registeredAtCol = headers.indexOf('registeredAt');
      if (registeredAtCol >= 0) {
        newRow[registeredAtCol] = new Date();
      }
      const updatedAtCol = headers.indexOf('updatedAt');
      if (updatedAtCol >= 0) {
        newRow[updatedAtCol] = new Date();
      }
      const universitiesCol = headers.indexOf('universities');
      if (universitiesCol >= 0) {
        newRow[universitiesCol] = '[]';
      }
      const customTagsCol = headers.indexOf('customTags');
      if (customTagsCol >= 0) {
        newRow[customTagsCol] = '[]';
      }
      
      sheet.appendRow(newRow);
    }
  } catch (error) {
    Logger.log('Error in saveProfileUserData: ' + error);
  }
}

/**
 * ユーザーデータをクリア
 */
function clearProfileUserData(userId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('users');
    
    if (!sheet || sheet.getLastRow() <= 1) return;
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        // userId以外をクリア
        const range = sheet.getRange(i + 1, 2, 1, data[0].length - 1);
        range.clearContent();
        break;
      }
    }
  } catch (error) {
    Logger.log('Error in clearProfileUserData: ' + error);
  }
}
