/**
 * Dream Cart BD - Orders, Tracking, and Incomplete Orders Module
 */

function handleCreateOrder(orderData) {
  const sheet = getSheet(CONFIG.SHEETS.ORDERS);
  const orderId = orderData.OrderID || 'DCBD-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

  const row = [
    now,
    orderId,
    orderData.Account_type || 'Customer',
    orderData.Customer_Name || '',
    orderData.Phone || '',
    orderData.Address || '',
    orderData.Products || '',
    orderData.Color || '',
    orderData.Size || '',
    orderData.Quantity || 1,
    orderData.Total_Amount || 0,
    orderData.Payment_method || 'Cash On Delivery (COD)',
    orderData.Transaction_ID || '',
    orderData.Payment_Status || 'Not Paid',
    orderData.Order_Status || 'Pending',
    orderData.Reseller_Commission || 0,
    orderData.Commission_Status || 'Pending'
  ];

  sheet.appendRow(row);

  orderData.OrderID = orderId;
  orderData.Date = now;
  orderData.Order_Status = orderData.Order_Status || 'Pending';

  try {
    sendOrderNotificationEmail(orderData);
  } catch (err) {
    Logger.log('Failed to send notification email: ' + err.toString());
  }

  return {
    status: 'success',
    message: 'Order placed successfully',
    orderId: orderId,
    order: orderData
  };
}

function handleIncompleteOrder(incData) {
  const sheet = getSheet(CONFIG.SHEETS.INCOMPLETE_ORDERS);
  const orderId = incData.OrderID || 'DCBD-INC-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

  const row = [
    now,
    orderId,
    incData.Account_type || 'Customer',
    incData.Customer_Name || '',
    incData.Phone || '',
    incData.Address || 'Not specified',
    incData.Products || '',
    incData.Total_Amount || 0,
    'Incomplete'
  ];

  sheet.appendRow(row);
  return { status: 'success', orderId: orderId };
}

function trackOrderById(orderId) {
  const sheet = getSheet(CONFIG.SHEETS.ORDERS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: 'not_found' };

  const headers = data[0];
  const orderIdIdx = headers.indexOf('OrderID');

  for (let i = 1; i < data.length; i++) {
    if (data[i][orderIdIdx] == orderId) {
      const order = {};
      for (let j = 0; j < headers.length; j++) {
        order[headers[j]] = data[i][j];
      }
      return { status: 'success', order: order };
    }
  }
  return { status: 'not_found', message: 'Order ID not found.' };
}
