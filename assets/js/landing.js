/**
 * DREAM CART BD - Landing Page Interactive Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Countdown Timer
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-mins');
  const secsEl = document.getElementById('count-secs');

  let remaining = 24 * 3600; // 24 hours special flash sale
  function updateCountdown() {
    if (!hoursEl) return;
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    hoursEl.textContent = String(h).padStart(2, '0');
    minsEl.textContent = String(m).padStart(2, '0');
    secsEl.textContent = String(s).padStart(2, '0');
    if (remaining > 0) remaining--;
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // Landing Page Order Form
  const landingOrderForm = document.getElementById('landing-order-form');
  if (landingOrderForm) {
    landingOrderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const customerName = landingOrderForm.customerName.value.trim();
      const phone = landingOrderForm.phone.value.trim();
      const address = landingOrderForm.address.value.trim();
      const paymentMethod = landingOrderForm.paymentMethod.value;

      const orderData = {
        OrderID: 'DCBD-' + Math.floor(100000 + Math.random() * 900000),
        Date: new Date().toLocaleString('en-US'),
        Account_type: 'Customer',
        Customer_Name: customerName,
        Phone: phone,
        Address: address,
        Products: 'Smart Stainless Steel Multifunctional Ring for Couple',
        Quantity: 1,
        Total_Amount: 194,
        Payment_method: paymentMethod,
        Payment_Status: 'Not Paid',
        Order_Status: 'Pending',
        Reseller_Commission: 0
      };

      // Show Confirmation Card Popup
      const modal = document.getElementById('landing-confirm-modal');
      if (modal) {
        document.getElementById('modal-order-id').textContent = orderData.OrderID;
        document.getElementById('modal-cust-name').textContent = orderData.Customer_Name;
        document.getElementById('modal-phone').textContent = orderData.Phone;
        document.getElementById('modal-amount').textContent = `৳${orderData.Total_Amount}`;
        modal.style.display = 'flex';
      } else {
        showToast(`অর্ডার সফল হয়েছে! আপনার অর্ডার আইডি: ${orderData.OrderID}`, 'success');
      }
    });
  }
});
