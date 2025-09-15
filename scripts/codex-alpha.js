document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const resultOutput = document.getElementById('resultOutput');
    const commandInput = document.getElementById('commandInput');

    const ENCRYPTED_PREFIX_ALPHA = '[UPEA-ALPHA-ENC]';
    const ENCRYPTED_SUFFIX_ALPHA = '[/UPEA-ALPHA-ENC]';

    const FIXED_CAESAR_KEY = 6;

    // Alfabetos para el cifrado César
    const CONSONANTS_LOWER = 'bcdfghjklmnpqrstvwxyz';
    const CONSONANTS_UPPER = 'BCDFGHJKLMNPQRSTVWXYZ';
    const CAESAR_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    // Mapeo para vocales (cifrado)
    const vowelMapEncrypt = {
        'A': 'V1', 'E': 'V2', 'I': 'V3', 'O': 'V4', 'U': 'V5',
        'a': 'v1', 'e': 'v2', 'i': 'v3', 'o': 'v4', 'u': 'v5'
    };

    // Mapeo para números (cifrado)
    const numberMapEncrypt = {
        '0': 'N1', '1': 'N2', '2': 'N3', '3': 'N4', '4': 'N5',
        '5': 'N6', '6': 'N7', '7': 'N8', '8': 'N9', '9': 'N10'
    };

    // Mapeo para caracteres especiales (cifrado)
    const specialCharMapEncrypt = {
        'á': 'S1', 'é': 'S2', 'í': 'S3', 'ó': 'S4', 'ú': 'S5',
        'Á': 'S6', 'É': 'S7', 'Í': 'S8', 'Ó': 'S9', 'Ú': 'S10',
        'ñ': 'S11', 'Ñ': 'S12',
        'ç': 'S13', 'Ç': 'S14',
        '-': 'S15',
        '¡': 'S16', '!': 'S17',
        '¿': 'S18', '?': 'S19'
    };

    // --- MAPAS INVERSOS Y CONSOLIDADOS PARA EL DESCIFRADO ---
    const decryptionMaps = {
        'v1': 'a', 'v2': 'e', 'v3': 'i', 'v4': 'o', 'v5': 'u',
        'V1': 'A', 'V2': 'E', 'V3': 'I', 'V4': 'O', 'V5': 'U',
        'N1': '0', 'N2': '1', 'N3': '2', 'N4': '3', 'N5': '4',
        'N6': '5', 'N7': '6', 'N8': '7', 'N9': '8', 'N10': '9',
        'S1': 'á', 'S2': 'é', 'S3': 'í', 'S4': 'ó', 'S5': 'ú',
        'S6': 'Á', 'S7': 'É', 'S8': 'Í', 'S9': 'Ó', 'S10': 'Ú',
        'S11': 'ñ', 'S12': 'Ñ',
        'S13': 'ç', 'S14': 'Ç',
        'S15': '-',
        'S16': '¡', 'S17': '!',
        'S18': '¿', 'S19': '?'
    };

    // Función auxiliar para el Cifrado César (solo para consonantes)
    function caesarShiftConsonant(char, key, encrypt) {
        const isUpper = CONSONANTS_UPPER.includes(char);
        const alphabet = isUpper ? CONSONANTS_UPPER : CONSONANTS_LOWER;
        
        const charIndex = alphabet.indexOf(char);
        if (charIndex === -1) {
            return char;
        }

        const shiftDirection = encrypt ? 1 : -1;
        const newIndex = (charIndex + shiftDirection * key + alphabet.length) % alphabet.length;
        return alphabet[newIndex];
    }

    // Función auxiliar para el segundo Cifrado César (para la cadena transformada)
    function caesarShiftFinal(char, key, encrypt) {
        const charIndex = CAESAR_ALPHABET.indexOf(char);
        if (charIndex === -1) {
            return char;
        }
        const shiftDirection = encrypt ? 1 : -1;
        const newIndex = (charIndex + shiftDirection * key + CAESAR_ALPHABET.length) % CAESAR_ALPHABET.length;
        return CAESAR_ALPHABET[newIndex];
    }

    // --- FUNCIÓN PRINCIPAL DE CIFRADO ---
    function encryptUPEAAlpha(text) {
        let firstLayerResult = '';
        for (const char of text) {
            if (char === ' ') {
                firstLayerResult += ' ';
            } else if (vowelMapEncrypt[char]) {
                firstLayerResult += vowelMapEncrypt[char];
            } else if (numberMapEncrypt[char]) {
                firstLayerResult += numberMapEncrypt[char];
            } else if (specialCharMapEncrypt[char]) {
                firstLayerResult += specialCharMapEncrypt[char];
            } else {
                firstLayerResult += caesarShiftConsonant(char, FIXED_CAESAR_KEY, true);
            }
        }
        
        // Aplicar la segunda capa de cifrado César
        let finalResult = '';
        for (const char of firstLayerResult) {
            finalResult += caesarShiftFinal(char, FIXED_CAESAR_KEY, true);
        }

        return `${ENCRYPTED_PREFIX_ALPHA}${finalResult}${ENCRYPTED_SUFFIX_ALPHA}`;
    }

    // --- FUNCIÓN PRINCIPAL DE DESCIFRADO ---
    function decryptUPEAAlpha(text) {
        if (!text.startsWith(ENCRYPTED_PREFIX_ALPHA) || !text.endsWith(ENCRYPTED_SUFFIX_ALPHA)) {
            return `[UPEA_SYS] ERROR: Formato de mensaje cifrado Alpha inválido o no reconocido.`;
        }

        let innerText = text.substring(ENCRYPTED_PREFIX_ALPHA.length, text.length - ENCRYPTED_SUFFIX_ALPHA.length);

        // Deshacer la segunda capa de cifrado César
        let secondLayerResult = '';
        for (const char of innerText) {
            secondLayerResult += caesarShiftFinal(char, FIXED_CAESAR_KEY, false);
        }

        // Deshacer la primera capa de codificación
        let finalResult = '';
        let i = 0;
        const decryptionKeys = Object.keys(decryptionMaps).sort((a, b) => b.length - a.length);

        while (i < secondLayerResult.length) {
            let foundMatch = false;
            if (secondLayerResult[i] === ' ') {
                finalResult += ' ';
                i++;
                foundMatch = true;
            } else {
                for (const key of decryptionKeys) {
                    if (secondLayerResult.substring(i, i + key.length) === key) {
                        finalResult += decryptionMaps[key];
                        i += key.length;
                        foundMatch = true;
                        break;
                    }
                }
            }
            if (!foundMatch) {
                finalResult += caesarShiftConsonant(secondLayerResult[i], FIXED_CAESAR_KEY, false);
                i++;
            }
        }
        
        return finalResult;
    }

// --- MANEJO DE COMANDOS EN EL INPUT ---
    commandInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const command = commandInput.value.trim().toUpperCase();
            const message = messageInput.value;

            commandInput.value = '';

            if (!message) {
                resultOutput.value = " [UPEA_SYS] ERROR: No hay mensaje en la Consola de Entrada para procesar.";
                return;
            }

            messageInput.disabled = true;
            commandInput.disabled = true;

            let loadingDots = '';
            let dotCount = 0;
            const loadingInterval = setInterval(() => {
                dotCount = (dotCount + 1) % 4;
                loadingDots = '.'.repeat(dotCount);
                resultOutput.value = ` [UPEA_SYS] Protocolo Alpha en proceso${loadingDots}`;
            }, 500);

            const randomDelay = Math.floor(Math.random() * (15000 - 1000 + 1)) + 1000;
            setTimeout(() => {
                clearInterval(loadingInterval);
                
                switch (command) {
                    case 'ENCRYPT':
                        const encryptedMessageWithPrefix = encryptUPEAAlpha(message);
                        resultOutput.value = encryptedMessageWithPrefix.substring(ENCRYPTED_PREFIX_ALPHA.length, encryptedMessageWithPrefix.length - ENCRYPTED_SUFFIX_ALPHA.length);
                        break;
                    case 'DECRYPT':
                        const messageForDecryption = `${ENCRYPTED_PREFIX_ALPHA}${message}${ENCRYPTED_SUFFIX_ALPHA}`;
                        const decryptedMessage = decryptUPEAAlpha(messageForDecryption);
                        resultOutput.value = decryptedMessage;
                        break;
                    default:
                        resultOutput.value = ` [UPEA_SYS] ERROR: Comando desconocido '${command}'. Use 'ENCRYPT' o 'DECRYPT'.`;
                        break;
                }
                
                messageInput.disabled = false;
                commandInput.disabled = false;
                commandInput.focus();
            }, randomDelay); 
        }
    });

    commandInput.focus();
});