/**
 * Dream Cart BD - Google Apps Script Configuration & Master Handler
 * Spreadsheet ID: 1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8
 * Deployed URL: https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec
 * Notification Recipient: jainal.dcitbd@gmail.com
 */

const CONFIG = {
  SPREADSHEET_ID: '1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8',
  NOTIFICATION_EMAIL: 'jainal.dcitbd@gmail.com',
  SHOP_NAME: 'Dream Cart BD',
  SHEETS: {
    PRODUCTS: 'Products',
    CATEGORIES: 'Categories',
    BRANDS: 'Brands',
    ORDERS: 'Orders',
    INCOMPLETE_ORDERS: 'Incomplete_Orders',
    VIEWERS: 'Viewers',
    CUSTOMERS: 'Customers',
    RESELLERS: 'Resellers',
    WHOLESALERS: 'Wholesalers',
    BUYING: 'Buying',
    COSTS: 'Costs',
    INVEST: 'Invest',
    OTHERS_MARKET: 'Others_Market',
    BANNERS: 'Banners',
    REVIEWS: 'Reviews',
    PAYMENTS: 'Payments',
    LANDING_PAGES: 'Landing-Pages',
    WORKER_LOGS: 'Worker-Logs',
    ADMIN_WORKER: 'Admin/Worker',
    SETTINGS: 'Settings'
  }
};

function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function sendJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = e.parameter.action || 'getAll';
    switch (action) {
      case 'getProducts':
        return sendJsonResponse({ status: 'success', data: fetchProductsData() });
      case 'getCategories':
        return sendJsonResponse({ status: 'success', data: fetchCategoriesData() });
      case 'getBrands':
        return sendJsonResponse({ status: 'success', data: fetchBrandsData() });
      case 'getBanners':
        return sendJsonResponse({ status: 'success', data: fetchBannersData() });
      case 'getSettings':
        return sendJsonResponse({ status: 'success', data: fetchSettingsData() });
      case 'getReviews':
        return sendJsonResponse({ status: 'success', data: fetchReviewsData() });
      case 'trackOrder':
        return sendJsonResponse(trackOrderById(e.parameter.orderId));
      case 'getAll':
      default:
        return sendJsonResponse({
          status: 'success',
          products: fetchProductsData(),
          categories: fetchCategoriesData(),
          brands: fetchBrandsData(),
          banners: fetchBannersData(),
          settings: fetchSettingsData(),
          reviews: fetchReviewsData()
        });
    }
  } catch (err) {
    return sendJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    switch (action) {
      case 'createOrder':
        return sendJsonResponse(handleCreateOrder(postData.data));
      case 'createIncompleteOrder':
        return sendJsonResponse(handleIncompleteOrder(postData.data));
      case 'login':
        return sendJsonResponse(handleUserLogin(postData.accountType, postData.username, postData.password));
      case 'register':
        return sendJsonResponse(handleUserRegister(postData.accountType, postData.data));
      case 'updateProfile':
        return sendJsonResponse(handleUpdateProfile(postData.accountType, postData.userId, postData.data));
      case 'requestResellerPayment':
        return sendJsonResponse(handleResellerPaymentRequest(postData.data));
      case 'addViewer':
        return sendJsonResponse(handleAddViewer(postData.data));
      case 'adminUpdate':
        return sendJsonResponse(handleAdminAction(postData));
      default:
        return sendJsonResponse({ status: 'error', message: 'Invalid action: ' + action });
    }
  } catch (err) {
    return sendJsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Sends a notification email with a responsive HTML table template to jainal.dcitbd@gmail.com
 */
function sendOrderNotificationEmail(order) {
  const subject = `🔔 [New Order Alert] ${CONFIG.SHOP_NAME} - Order #${order.OrderID}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 25px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 24px; letter-spacing: 1px;">${CONFIG.SHOP_NAME}</h2>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">New Order Notification & Confirmation Details</p>
      </div>
      <div style="padding: 25px;">
        <p style="font-size: 15px; color: #333333;">A new order has been placed on <strong>${CONFIG.SHOP_NAME}</strong>. Below is the full summary:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left; width: 35%;">Order ID</th>
            <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #1e3c72;">${order.OrderID}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Date & Time</th>
            <td style="padding: 10px; border: 1px solid #dee2e6;">${order.Date}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Customer Name</th>
            <td style="padding: 10px; border: 1px solid #dee2e6;">${order.Customer_Name}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Phone Number</th>
            <td style="padding: 10px; border: 1px solid #dee2e6;"><a href="tel:${order.Phone}" style="color: #2a5298; text-decoration: none;">${order.Phone}</a></td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Delivery Address</th>
            <td style="padding: 10px; border: 1px solid #dee2e6;">${order.Address}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Ordered Products</th>
            <td style="padding: 10px; border: 1px solid #dee2e6;">${order.Products} (Qty: ${order.Quantity || 1}, Color: ${order.Color || 'N/A'}, Size: ${order.Size || 'N/A'})</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Payment Method</th>
            <td style="padding: 10px; border: 1px solid #dee2e6;">${order.Payment_method}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Total Payable Amount</th>
            <td style="padding: 10px; border: 1px solid #dee2e6; font-size: 16px; font-weight: bold; color: #28a745;">৳${order.Total_Amount}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Order Status</th>
            <td style="padding: 10px; border: 1px solid #dee2e6;"><span style="background: #e3f2fd; color: #0d47a1; padding: 3px 8px; border-radius: 4px; font-weight: 600;">${order.Order_Status}</span></td>
          </tr>
        </table>
        
        <div style="margin-top: 25px; text-align: center;">
          <a href="https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit#gid=0" style="background-color: #1e3c72; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Open Google Sheet Dashboard</a>
        </div>
      </div>
      <div style="background-color: #f1f3f5; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef;">
        Dream Cart BD E-Commerce System • Developed by Jainal Abedin (Dream Career IT BD)
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}
