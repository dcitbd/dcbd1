/**
 * DREAM CART BD - Customer Portal Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html');

  if (!user && !isLoginPage) {
    window.location.href = 'login.html';
    return;
  }

  if (user && isLoginPage) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Populate User Profile Header
  if (user) {
    document.querySelectorAll('.user-display-name').forEach(el => el.textContent = user.Name || 'Customer');
    document.querySelectorAll('.user-display-mobile').forEach(el => el.textContent = user.Mobile || '');
    document.querySelectorAll('.user-display-email').forEach(el => el.textContent = user.Mail || '');
  }

  // Handle Login Form
  const loginForm = document.getElementById('customer-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value.trim();
      
      const db = await loadDatabase();
      const customer = db.users && db.users.customer;
      
      if (customer && (customer.User_ID === username || customer.Mobile === username) && customer.Password === password) {
        customer.Account_Type = 'customer';
        setCurrentUser(customer);
        showToast('লগইন সফল হয়েছে! স্বাগতম।', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 800);
      } else {
        showToast('ভুল ইউজারনেম অথবা পাসওয়ার্ড!', 'danger');
      }
    });
  }

  // Handle Logout
  const logoutBtns = document.querySelectorAll('.logout-btn');
  logoutBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    setCurrentUser(null);
    window.location.href = 'login.html';
  }));
});
