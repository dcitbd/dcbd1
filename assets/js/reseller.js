/**
 * DREAM CART BD - Reseller Portal Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html');

  if ((!user || user.Account_Type !== 'reseller') && !isLoginPage) {
    window.location.href = 'login.html';
    return;
  }

  if (user && user.Account_Type === 'reseller' && isLoginPage) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Reseller Login Form
  const loginForm = document.getElementById('reseller-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value.trim();

      const db = await loadDatabase();
      const reseller = db.users && db.users.reseller;

      if (reseller && (reseller.User_ID === username || reseller.Mobile === username) && reseller.Password === password) {
        reseller.Account_Type = 'reseller';
        setCurrentUser(reseller);
        showToast('রিসেলার লগইন সফল হয়েছে!', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 800);
      } else {
        showToast('অকার্যকর রিসেলার ক্রেডেনশিয়াল!', 'danger');
      }
    });
  }

  // Payment Request Form with 3% Deduction Calculation
  const payAmountInput = document.getElementById('reseller-req-amount');
  const payNetDisplay = document.getElementById('reseller-net-amount');
  if (payAmountInput && payNetDisplay) {
    payAmountInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      const net = val * 0.97;
      payNetDisplay.textContent = `৳${net.toFixed(2)} (৩% সার্ভিস চার্জ কর্তনের পর)`;
    });
  }
});
