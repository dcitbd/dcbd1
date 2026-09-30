/**
 * Dream Cart BD - Authentication & Multi-Role User Management
 */

function handleUserLogin(accountType, username, password) {
  let sheetName = CONFIG.SHEETS.CUSTOMERS;
  if (accountType === 'reseller') sheetName = CONFIG.SHEETS.RESELLERS;
  else if (accountType === 'wholesaler') sheetName = CONFIG.SHEETS.WHOLESALERS;
  else if (accountType === 'admin' || accountType === 'worker') sheetName = CONFIG.SHEETS.ADMIN_WORKER;

  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: 'error', message: 'No users registered.' };

  const headers = data[0];
  const userIdx = headers.indexOf('User_ID') !== -1 ? headers.indexOf('User_ID') : headers.indexOf('User_Name');
  const passIdx = headers.indexOf('Password');

  for (let i = 1; i < data.length; i++) {
    const rowUser = String(data[i][userIdx]).trim();
    const rowPass = String(data[i][passIdx]).trim();
    const mobileIdx = headers.indexOf('Mobile');
    const rowMobile = mobileIdx !== -1 ? String(data[i][mobileIdx]).trim() : '';

    if ((rowUser === String(username).trim() || rowMobile === String(username).trim()) && rowPass === String(password).trim()) {
      const user = {};
      for (let j = 0; j < headers.length; j++) {
        if (headers[j] !== 'Password') {
          user[headers[j]] = data[i][j];
        }
      }
      user.Account_Type = accountType;
      return { status: 'success', user: user };
    }
  }

  return { status: 'error', message: 'Invalid credentials. Please verify your username and password.' };
}

function handleUserRegister(accountType, userData) {
  let sheetName = CONFIG.SHEETS.CUSTOMERS;
  if (accountType === 'reseller') sheetName = CONFIG.SHEETS.RESELLERS;
  else if (accountType === 'wholesaler') sheetName = CONFIG.SHEETS.WHOLESALERS;

  const sheet = getSheet(sheetName);
  const headers = sheet.getDataRange().getValues()[0];

  const newRow = [];
  for (let i = 0; i < headers.length; i++) {
    const col = headers[i];
    newRow.push(userData[col] || '');
  }

  sheet.appendRow(newRow);
  return { status: 'success', message: 'Registration submitted successfully. Welcome to Dream Cart BD!' };
}

function handleUpdateProfile(accountType, userId, updatedData) {
  let sheetName = CONFIG.SHEETS.CUSTOMERS;
  if (accountType === 'reseller') sheetName = CONFIG.SHEETS.RESELLERS;
  else if (accountType === 'wholesaler') sheetName = CONFIG.SHEETS.WHOLESALERS;
  else if (accountType === 'admin') sheetName = CONFIG.SHEETS.ADMIN_WORKER;

  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdx = headers.indexOf('USER_ID') !== -1 ? headers.indexOf('USER_ID') : headers.indexOf('User_ID');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][userIdx]).trim() === String(userId).trim()) {
      for (const key in updatedData) {
        const colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          sheet.getRange(i + 1, colIdx + 1).setValue(updatedData[key]);
        }
      }
      return { status: 'success', message: 'Profile updated successfully.' };
    }
  }
  return { status: 'error', message: 'User record not found.' };
}
