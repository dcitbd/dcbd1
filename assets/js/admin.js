/**
 * DREAM CART BD - Admin & Worker Management Console
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  const isLoginPage = window.location.pathname.endsWith('login.html');

  if ((!user || (user.Account_Type !== 'admin' && user.Account_Type !== 'worker')) && !isLoginPage) {
    window.location.href = window.location.pathname.includes('/admin/') ? '../login.html' : 'admin/login.html';
    return;
  }

  if (user && (user.Account_Type === 'admin' || user.Account_Type === 'worker') && isLoginPage) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Captcha Generator for Admin Login
  const captchaBox = document.getElementById('admin-captcha-display');
  const captchaInput = document.getElementById('admin-captcha-input');
  let currentCaptcha = '';

  function generateCaptcha() {
    if (!captchaBox) return;
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    currentCaptcha = '';
    for (let i = 0; i < 5; i++) {
      currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    captchaBox.textContent = currentCaptcha;
  }

  if (captchaBox) {
    generateCaptcha();
    captchaBox.addEventListener('click', generateCaptcha);
  }

  // Admin Login Submission
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const workerType = adminLoginForm.workerType.value;
      const username = adminLoginForm.username.value.trim();
      const password = adminLoginForm.password.value.trim();
      const userCaptcha = (captchaInput ? captchaInput.value.trim().toUpperCase() : '');

      if (captchaBox && userCaptcha !== currentCaptcha) {
        showToast('ক্যাপচা কোড মেলেনি! পুনরায় চেষ্টা করুন।', 'danger');
        generateCaptcha();
        return;
      }

      const db = await loadDatabase();
      const admin = db.users && db.users.admin;

      if (admin && (admin.User_Name === username || admin.Mobile === username) && admin.Password === password) {
        admin.Account_Type = 'admin';
        setCurrentUser(admin);
        showToast('অ্যাডমিন প্যানেলে স্বাগতম!', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 800);
      } else {
        showToast('ভুল ইউজারনেম অথবা পাসওয়ার্ড!', 'danger');
        generateCaptcha();
      }
    });
  }

  // Export Table Helpers (CSV, Print)
  window.exportTableToCSV = function(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    let csv = [];
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      const cols = row.querySelectorAll('td, th');
      let rowData = [];
      cols.forEach(col => rowData.push('"' + col.innerText.replace(/"/g, '""') + '"'));
      csv.push(rowData.join(','));
    });

    const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.download = filename || 'export.csv';
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  };

  window.printTable = function() {
    window.print();
  };
});
