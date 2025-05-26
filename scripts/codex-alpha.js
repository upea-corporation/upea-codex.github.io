document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const resultOutput = document.getElementById('resultOutput');
    const commandInput = document.getElementById('commandInput');

    // CLAVE FIJA PARA EL CIFRADO CÉSAR
    const FIXED_CAESAR_KEY = 6;

    // TOKEN DE CENSURA
    const CENSOR_TOKEN = '[CENSOR]';
    const CENSOR_PERCENTAGE = 0.25; // 25% de la frase a censurar
    const CENSOR_CHAR = '*'; // Carácter para la censura

    // Prefijo y Sufijo para mensajes cifrados UPEA Alpha (USO INTERNO)
    const ENCRYPTED_PREFIX = '[UPEA-ALPHA-ENC]';
    const ENCRYPTED_SUFFIX = '[/UPEA-ALPHA-ENC]';

    // Mapeo para vocales (cifrado)
    const vowelMapEncrypt = {
        'A': '11', 'E': '13', 'I': '15', 'O': '17', 'U': '19',
        'a': '11', 'e': '13', 'i': '15', 'o': '17', 'u': '19'
    };

    // Mapeo inverso para vocales (descifrado)
    const vowelMapDecrypt = {
        '11': 'a', '13': 'e', '15': 'i', '17': 'o', '19': 'u'
    };

    // Mapeo para números (cifrado)
    const numberMapEncrypt = {
        '0': 'N1', '1': 'N3', '2': 'N5', '3': 'N7', '4': 'N9',
        '5': 'N11', '6': 'N13', '7': 'N15', '8': 'N17', '9': 'N19'
    };

    // Mapeo inverso para números (descifrado)
    const numberMapDecrypt = {
        'N1': '0', 'N3': '1', 'N5': '2', 'N7': '3', 'N9': '4',
        'N11': '5', 'N13': '6', 'N15': '7', 'N17': '8', 'N19': '9'
    };

    // Función auxiliar para el Cifrado César (solo para consonantes)
    function caesarShift(char, key, encrypt) {
        const charCode = char.charCodeAt(0);
        let base = 0;

        if (charCode >= 65 && charCode <= 90) { // Mayúsculas A-Z
            base = 65;
        } else if (charCode >= 97 && charCode <= 122) { // Minúsculas a-z
            base = 97;
        } else {
            return char; // No es una letra, retorna sin cambios
        }

        const shifted = (charCode - base + (encrypt ? key : -key) + 26) % 26;
        return String.fromCharCode(shifted + base);
    }

    // Función principal de cifrado UPEA Híbrido
    function encryptUPEA(text) {
        let result = '';
        let i = 0;
        while (i < text.length) {
            if (text.substring(i, i + CENSOR_TOKEN.length) === CENSOR_TOKEN) {
                result += CENSOR_TOKEN;
                i += CENSOR_TOKEN.length;
                continue;
            }
            const char = text[i];
            if (vowelMapEncrypt[char]) {
                result += vowelMapEncrypt[char];
            } else if (numberMapEncrypt[char]) {
                result += numberMapEncrypt[char];
            } else if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(char)) {
                result += caesarShift(char, FIXED_CAESAR_KEY, true);
            } else {
                result += char;
            }
            i++;
        }
        // Retorna el texto CON los prefijos internos
        return `${ENCRYPTED_PREFIX}${result}${ENCRYPTED_SUFFIX}`;
    }

    // Función principal de descifrado UPEA Híbrido
    function decryptUPEA(text) {
        // Esta función SIEMPRE espera el texto con los prefijos
        if (!text.startsWith(ENCRYPTED_PREFIX) || !text.endsWith(ENCRYPTED_SUFFIX)) {
            // Este error solo debería ocurrir si se llama internamente con un formato incorrecto
            // o si el usuario manipula el código.
            return ' [UPEA_SYS] ERROR INTERNO: Intento de descifrado sin formato de prefijo. Contacte a soporte.';
        }

        let innerText = text.substring(ENCRYPTED_PREFIX.length, text.length - ENCRYPTED_SUFFIX.length);
        
        let result = '';
        let i = 0;
        let containsCensorToken = false;

        while (i < innerText.length) {
            if (innerText.substring(i, i + CENSOR_TOKEN.length) === CENSOR_TOKEN) {
                containsCensorToken = true;
                i += CENSOR_TOKEN.length;
                continue;
            }
            let char = innerText[i];
            if (i + 1 < innerText.length && !isNaN(parseInt(char)) && !isNaN(parseInt(innerText[i+1]))) {
                const twoDigitNum = char + innerText[i+1];
                if (vowelMapDecrypt[twoDigitNum]) {
                    result += vowelMapDecrypt[twoDigitNum];
                    i += 2;
                    continue;
                }
            }
            if (char === 'N' && i + 1 < innerText.length) {
                let foundMatch = false;
                if (i + 2 < innerText.length && !isNaN(parseInt(innerText[i+1])) && !isNaN(parseInt(innerText[i+2]))) {
                    const threeCharNum = innerText.substring(i, i + 3);
                    if (numberMapDecrypt[threeCharNum]) {
                        result += numberMapDecrypt[threeCharNum];
                        i += 3;
                        foundMatch = true;
                    }
                }
                if (!foundMatch && !isNaN(parseInt(innerText[i+1]))) {
                    const twoCharNum = innerText.substring(i, i + 2);
                    if (numberMapDecrypt[twoCharNum]) {
                        result += numberMapDecrypt[twoCharNum];
                        i += 2;
                        foundMatch = true;
                    }
                }
                if (foundMatch) {
                    continue;
                }
            }
            result += caesarShift(char, FIXED_CAESAR_KEY, false);
            i++;
        }

        if (containsCensorToken) {
            const numCharsToCensor = Math.floor(result.length * CENSOR_PERCENTAGE);
            const actualCensorLength = Math.min(numCharsToCensor, result.length);
            const censoredPart = CENSOR_CHAR.repeat(actualCensorLength);
            result = result.substring(0, result.length - actualCensorLength) + censoredPart;
        }

        return result;
    }


    // --- MANEJO DE COMANDOS EN EL INPUT ---
    commandInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const command = commandInput.value.trim().toUpperCase();
            let message = messageInput.value; // El mensaje tal como lo introduce el usuario

            commandInput.value = '';

            if (!message) {
                resultOutput.value = " [UPEA_SYS] ERROR: No hay mensaje en la Consola de Entrada para procesar.";
                return;
            }

            messageInput.disabled = true;
            commandInput.disabled = true;

            switch (command) {
                case 'ENCRYPT':
                    resultOutput.value = "";
                    await window.showLoadingScreen('CIFRADO');
                    const encryptedMessageWithPrefix = encryptUPEA(message);
                    // Para mostrar el resultado sin prefijos al usuario
                    resultOutput.value = encryptedMessageWithPrefix.substring(ENCRYPTED_PREFIX.length, encryptedMessageWithPrefix.length - ENCRYPTED_SUFFIX.length);
                    break;
                case 'DECRYPT':
                    resultOutput.value = "";
                    await window.showLoadingScreen('DESCIFRADO');
                    // Asume que el usuario introduce el texto cifrado sin prefijos.
                    // Los añadimos internamente para que la función decryptUPEA pueda procesarlo.
                    const messageForDecryption = `${ENCRYPTED_PREFIX}${message}${ENCRYPTED_SUFFIX}`;
                    const decryptedMessage = decryptUPEA(messageForDecryption);
                    resultOutput.value = decryptedMessage;
                    break;
                default:
                    resultOutput.value = ` [UPEA_SYS] ERROR: Comando desconocido '${command}'. Use 'ENCRYPT' o 'DECRYPT'.`;
                    break;
            }
            
            messageInput.disabled = false;
            commandInput.disabled = false;
            commandInput.focus();
        }
    });

    commandInput.focus();
});
