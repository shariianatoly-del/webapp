document.addEventListener('DOMContentLoaded', function () {

    // --- DOM Elements ---
    const app = document.getElementById('app');
    const cardItem = document.getElementById('cardItem');
    const cardFocusElement = document.getElementById('cardFocusElement');

    // Card Display Elements
    const cardNumberDisplay = document.getElementById('cardNumberDisplay');
    const cardNameText = document.getElementById('cardNameText');
    const cardMonthDisplay = document.getElementById('cardMonthDisplay');
    const cardYearDisplay = document.getElementById('cardYearDisplay');
    const cvvDisplay = document.getElementById('cvvDisplay');
    const cardTypeFront = document.getElementById('cardTypeFront');
    const cardTypeBack = document.getElementById('cardTypeBack');
    const cardBgFront = document.getElementById('cardBgFront');
    const cardBgBack = document.getElementById('cardBgBack');

    // Form Input Elements
    const cardNumberInput = document.getElementById('cardNumber');
    const cardNameInput = document.getElementById('cardName');
    const cardMonthSelect = document.getElementById('cardMonth');
    const cardYearSelect = document.getElementById('cardYear');
    const cardCvvInput = document.getElementById('cardCvv');
    const submitBtn = document.getElementById('submitBtn');

    // --- Data & State ---
    const state = {
        currentCardBackground: Math.floor(Math.random() * 25 + 1),
        cardName: "",
        cardNumber: "",
        cardMonth: "",
        cardYear: "",
        cardCvv: "",
        minCardYear: new Date().getFullYear(),
        amexCardMask: "#### ###### #####",
        otherCardMask: "#### #### #### ####",
        isCardFlipped: false,
        isInputFocused: false,
        focusedElement: null
    };

    // --- Initialization ---
    function init() {
        populateYearSelect();
        setupEventListeners();
        updateCardBackground(); // Set initial background
    }

    function populateYearSelect() {
        const currentYear = state.minCardYear;
        for (let i = 0; i < 12; i++) {
            const option = document.createElement('option');
            option.value = currentYear + i;
            option.textContent = currentYear + i;
            cardYearSelect.appendChild(option);
        }
    }

    function updateCardBackground() {
        const bgUrl = `https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${state.currentCardBackground}.jpeg`;
        cardBgFront.src = bgUrl;
        cardBgBack.src = bgUrl;
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        cardNumberInput.addEventListener('input', handleCardNumberInput);
        cardNumberInput.addEventListener('focus', (e) => focusInput(e, cardNumberDisplay));
        cardNumberInput.addEventListener('blur', blurInput);

        cardNameInput.addEventListener('input', handleCardNameInput);
        cardNameInput.addEventListener('focus', (e) => focusInput(e, cardNameDisplay));
        cardNameInput.addEventListener('blur', blurInput);

        cardMonthSelect.addEventListener('change', handleCardMonthChange);
        cardMonthSelect.addEventListener('focus', (e) => focusInput(e, cardDateDisplay));
        cardMonthSelect.addEventListener('blur', blurInput);

        cardYearSelect.addEventListener('change', handleCardYearChange);
        cardYearSelect.addEventListener('focus', (e) => focusInput(e, cardDateDisplay));
        cardYearSelect.addEventListener('blur', blurInput);

        // Watch for month change when year changes
        cardYearSelect.addEventListener('change', () => {
            if (state.cardMonth && state.cardMonth < getMinCardMonth()) {
                state.cardMonth = "";
                cardMonthSelect.value = "";
                cardMonthDisplay.textContent = "MM";
            }
        });

        cardCvvInput.addEventListener('input', handleCardCvvInput);
        cardCvvInput.addEventListener('focus', flipCard);
        cardCvvInput.addEventListener('blur', unflipCard);

        submitBtn.addEventListener('click', handleSubmit);
    }

    // --- Handlers ---
    function handleCardNumberInput(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        let formattedValue = '';

        // Basic formatting (can be improved for AMEX mask)
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }

        // Limit length
        formattedValue = formattedValue.substring(0, 19);
        e.target.value = formattedValue;
        state.cardNumber = formattedValue;

        updateCardNumberDisplay(value);
        updateCardType(value);
    }

    function updateCardNumberDisplay(numberStr) {
        const displaySpans = cardNumberDisplay.querySelectorAll('span');
        const cardType = getCardType(numberStr);
        let mask;

        if (cardType === 'amex') {
            mask = state.amexCardMask;
        } else {
            mask = state.otherCardMask;
        }

        const maskParts = mask.split(' ');
        let numberIndex = 0;

        for (let i = 0; i < displaySpans.length; i++) {
            let part = '';
            const maskPart = maskParts[i] || '****'; // Fallback if mask is shorter

            for (let j = 0; j < maskPart.length; j++) {
                if (numberIndex < numberStr.length && maskPart[j] !== ' ') {
                    // Show actual number for first 4 and last 4 digits, * for the rest in the middle
                    if (
                        (i === 0 && j < 4) || // First 4
                        (i === displaySpans.length - 1 && j >= maskPart.length - 4) || // Last 4
                        numberIndex >= numberStr.length - 4
                    ) {
                         if(numberIndex < numberStr.length) {
                             part += numberStr[numberIndex];
                             numberIndex++;
                         } else {
                             part += '*';
                         }
                    } else if (numberIndex < numberStr.length) {
                        part += '*';
                        numberIndex++;
                    } else {
                        part += maskPart[j];
                    }
                } else {
                    part += maskPart[j];
                }
            }
            displaySpans[i].textContent = part;
        }
    }


    function getCardType(number) {
        let re = new RegExp("^4");
        if (number.match(re) != null) return "visa";

        re = new RegExp("^(34|37)");
        if (number.match(re) != null) return "amex";

        re = new RegExp("^5[1-5]");
        if (number.match(re) != null) return "mastercard";

        re = new RegExp("^6011");
        if (number.match(re) != null) return "discover";

        re = new RegExp('^9792');
        if (number.match(re) != null) return 'troy';

        return "visa"; // default type
    }

    function updateCardType(number) {
        const type = getCardType(number);
        if (type) {
            const typeImgUrl = `https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${type}.png`;
            cardTypeFront.src = typeImgUrl;
            cardTypeFront.style.display = 'block';
            cardTypeBack.src = typeImgUrl;
            cardTypeBack.style.display = 'block';
        } else {
            cardTypeFront.style.display = 'none';
            cardTypeBack.style.display = 'none';
        }
    }

    function handleCardNameInput(e) {
        const value = e.target.value;
        state.cardName = value;
        cardNameText.textContent = value ? value.toUpperCase() : 'Full Name';
    }

    function handleCardMonthChange(e) {
        state.cardMonth = e.target.value;
        cardMonthDisplay.textContent = e.target.value || 'MM';
    }

    function getMinCardMonth() {
         if (state.cardYear === state.minCardYear.toString()) {
             return (new Date().getMonth() + 1).toString().padStart(2, '0');
         }
         return "01";
     }

    function handleCardYearChange(e) {
        state.cardYear = e.target.value;
        const yearLastTwo = e.target.value.slice(2);
        cardYearDisplay.textContent = yearLastTwo || 'YY';
    }

    function handleCardCvvInput(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 4); // Max 4 digits
        e.target.value = value;
        state.cardCvv = value;

        // Update CVV display on card
        cvvDisplay.innerHTML = '*'.repeat(value.length) || '***';
    }

    function flipCard() {
        state.isCardFlipped = true;
        cardItem.classList.add('-active');
    }

    function unflipCard() {
        // Add a small delay to allow for blur transition if needed
        setTimeout(() => {
            state.isCardFlipped = false;
            if (document.activeElement !== cardCvvInput) {
                 cardItem.classList.remove('-active');
            }
        }, 100);
    }

    function focusInput(e, targetElement) {
        state.isInputFocused = true;
        state.focusedElement = targetElement;

        // Update focus element position and size
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const appRect = app.getBoundingClientRect();

            cardFocusElement.style.width = `${rect.width}px`;
            cardFocusElement.style.height = `${rect.height}px`;
            cardFocusElement.style.transform = `translateX(${rect.left - appRect.left}px) translateY(${rect.top - appRect.top}px)`;
            cardFocusElement.classList.add('-active');
        }
    }

    function blurInput() {
        state.isInputFocused = false;
        state.focusedElement = null;
        // Delay hiding the focus element to allow for transitions
        setTimeout(() => {
            if (!state.isInputFocused) {
                cardFocusElement.classList.remove('-active');
            }
        }, 300);
    }

    function handleSubmit(e) {
        e.preventDefault();
        console.log("Form submitted with data:", state);
        alert("Форма отправлена! (Проверьте консоль)");
        // Здесь можно добавить логику отправки данных, например, через fetch или Telegram Web App
    }

    // --- Start the app ---
    init();

});