/**
 * Dream Cart BD - Administrative Actions, Finance, & Logs
 */

function handleAdminAction(payload) {
  const subAction = payload.subAction;
  const sheetName = payload.sheetName;
  const sheet = getSheet(sheetName);

  if (subAction === 'addRow') {
    const headers = sheet.getDataRange().getValues()[0];
    const row = [];
    for (let i = 0; i < headers.length; i++) {
      row.push(payload.data[headers[i]] || '');
    }
    sheet.appendRow(row);
    logAdminActivity(payload.adminUser || 'Admin', 'Add Row', `Added record to ${sheetName}`);
    return { status: 'success', message: 'Record added successfully.' };
  }

  if (subAction === 'updateStatus') {
    const idCol = payload.idColumn;
    const idVal = payload.idValue;
    const targetCol = payload.targetColumn;
    const newVal = payload.newValue;

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.indexOf(idCol);
    const targetIdx = headers.indexOf(targetCol);

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idIdx]) === String(idVal)) {
        sheet.getRange(i + 1, targetIdx + 1).setValue(newVal);
        logAdminActivity(payload.adminUser || 'Admin', 'Update Status', `Updated ${idVal} in ${sheetName} to ${newVal}`);
        return { status: 'success', message: 'Status updated.' };
      }
    }
    return { status: 'error', message: 'Item not found.' };
  }

  return { status: 'error', message: 'Unsupported subAction' };
}

function handleResellerPaymentRequest(data) {
  const sheet = getSheet(CONFIG.SHEETS.PAYMENTS);
  const reqId = 'PAY-REQ-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toLocaleDateString('en-US');
  const amount = parseFloat(data.Amount) || 0;
  const netAmount = amount * 0.97; // minus 3%

  const row = [
    reqId,
    data.Reseller_ID || '',
    data.Reseller_Name || '',
    data.Payment_Method || '',
    data.Account_Details || '',
    amount,
    netAmount,
    'Pending',
    now,
    ''
  ];

  sheet.appendRow(row);
  return { status: 'success', requestId: reqId, netAmount: netAmount };
}

function handleAddViewer(data) {
  const sheet = getSheet(CONFIG.SHEETS.VIEWERS);
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
  const row = [
    now,
    data.ip || 'Unknown',
    data.address || 'Bangladesh',
    data.name || 'Guest Visitor',
    data.phone || 'N/A',
    data.device || 'Desktop / Mobile',
    data.activity || 'Browsing Website'
  ];
  sheet.appendRow(row);
  return { status: 'success' };
}

function logAdminActivity(user, action, details) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.WORKER_LOGS);
    const logId = 'LOG-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    sheet.appendRow([logId, now, user, user, 'Admin', action, details, '127.0.0.1']);
  } catch (e) {}
}
