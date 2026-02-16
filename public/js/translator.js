document.addEventListener('DOMContentLoaded', () => {
    const startStopBtn = document.getElementById('start-stop-btn');
    const recognizedTextEl = document.getElementById('recognized-text');
    const signImageContainer = document.getElementById('sign-image-container');
    const textInput = document.getElementById('text-input');
    const translateBtn = document.getElementById('translate-btn');
    const languageSelect = document.getElementById('language-select');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        startStopBtn.disabled = true;
        languageSelect.disabled = true;
        recognizedTextEl.textContent = "Your browser does not support the Web Speech API. Please try Chrome or a supported browser.";
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let isRecognizing = false;

    // Set recognition language based on dropdown
    recognition.lang = languageSelect.value;
    languageSelect.addEventListener('change', () => {
        recognition.lang = languageSelect.value;
    });

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        recognizedTextEl.textContent = 'Recognized Text: ' + transcript;
        displaySignLanguage(transcript);
    };

    recognition.onerror = (event) => {
        recognizedTextEl.textContent = 'Error occurred in recognition: ' + event.error;
    };

    recognition.onend = () => {
        isRecognizing = false;
        startStopBtn.textContent = 'Start Listening';
    };

    startStopBtn.addEventListener('click', () => {
        if (isRecognizing) {
            recognition.stop();
        } else {
            recognition.start();
            isRecognizing = true;
            startStopBtn.textContent = 'Stop Listening';
            recognizedTextEl.textContent = 'Listening...';
            signImageContainer.innerHTML = '';
        }
    });

    translateBtn.addEventListener('click', () => {
        const text = textInput.value;
        if (text) {
            displaySignLanguage(text);
        }
    });

    function getSignLanguageConfig() {
        const lang = languageSelect.value;
        if (lang === 'ar-EG') {
            return {
                path: 'assets/Egyptian_Alphabet/',
                isRTL: true,
                charMap: {
                    'ا': 'Alif', 'أ': 'Alif', 'إ': 'Alif', 'آ': 'Alif',
                    'ب': 'Ba', 'ت': 'Ta', 'ث': 'Tha', 'ج': 'Jim',
                    'ح': 'Ha', 'خ': 'Kha', 'د': 'Dal', 'ذ': 'Dhal',
                    'ر': 'Ra', 'ز': 'Zay', 'س': 'Sin', 'ش': 'Shin',
                    'ص': 'Sad', 'ض': 'Dad', 'ط': 'Tah', 'ظ': 'Zah',
                    'ع': 'Ayn', 'غ': 'Ghayn', 'ف': 'Fa', 'ق': 'Qaf',
                    'ك': 'Kaf', 'ل': 'Lam', 'م': 'Mim', 'ن': 'Nun',
                    'ه': 'Heh', 'و': 'Waw', 'ي': 'Ya', 'ة': 'Taa_Marbuta',
                    'ء': 'Ya_Hamza',
                    'لا': 'Laa',
                    'ال': 'Al'
                }
            };
        }
        // Default to ASL
        return {
            path: 'assets/English alphabet/',
            isRTL: false,
            charMap: {}
        };
    }

    function displaySignLanguage(text) {
        const config = getSignLanguageConfig();
        signImageContainer.innerHTML = '';
        signImageContainer.style.direction = config.isRTL ? 'rtl' : 'ltr';

        let sanitizedText = text;
        if (config.path.includes('English')) {
            sanitizedText = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
        }

        let i = 0;
        while (i < sanitizedText.length) {
            let char = sanitizedText[i];
            let nextChar = sanitizedText[i+1];
            let imageName = char;

            if (config.path.includes('Egyptian')) {
                // Check for two-letter combinations like 'ال' and 'لا'
                if (i + 1 < sanitizedText.length) {
                    let twoLetterCombo = char + nextChar;
                    if (config.charMap[twoLetterCombo]) {
                        imageName = config.charMap[twoLetterCombo];
                        i++; // Skip the next character
                        char = twoLetterCombo;
                    } else if (config.charMap[char]) {
                        imageName = config.charMap[char];
                    }
                } else if (config.charMap[char]) {
                    imageName = config.charMap[char];
                }
            }


            const img = document.createElement('img');
            if (config.path.includes('Egyptian')) {
                img.src = `${config.path}${imageName}.png`;
            } else {
                img.src = `${config.path}Sign_language_${imageName}.svg`;
            }

            img.alt = `Sign for ${char}`;
            img.classList.add('sign-image');
            img.onerror = () => {
                img.alt = `Image not found for ${char}`;
                // You could display a placeholder image or text here
            };
            signImageContainer.appendChild(img);
            i++;
        }
    }
});