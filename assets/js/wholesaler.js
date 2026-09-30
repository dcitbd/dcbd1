/**
 * DREAM CART BD - Wholesaler Portal Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html');

  if ((!user || user.Account_Type !== 'wholesaler') && !isLoginPage) {
    window.location.href = 'login.html';
    return;
  }

  if (user && user.Account_Type === 'wholesaler' && isLoginPage) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Wholesaler Login
  const loginForm = document.getElementById('wholesaler-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value.trim();

      const db = await loadDatabase();
      const ws = db.users && db.users.wholesaler;

      if (ws && (ws.User_ID === username || ws.Mobile === username) && ws.Password === password) {
        ws.Account_Type = 'wholesaler';
        setCurrentUser(ws);
        showToast('হোলসেলার লগইন সফল হয়েছে!', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 800);
      } else {
        showToast('ভুল হোলসেলার লগইন তথ্য!', 'danger');
      }
    });
  }
});
