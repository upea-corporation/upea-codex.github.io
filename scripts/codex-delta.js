document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const resultOutput = document.getElementById('resultOutput');
    const commandInput = document.getElementById('commandInput');

    const ENCRYPTED_PREFIX_DELTA = '[UPEA-DELTA-ENC]';
    const ENCRYPTED_SUFFIX_DELTA = '[/UPEA-DELTA-ENC]';

    // Definimos los alfabetos para las conversiones y el cifrado César
    const LETTER_ALPHABET = 'abcdefghijklmnñopqrstuvwxyzáéíóúç';
    const NUMBER_ALPHABET = '0123456789';
    const CAESAR_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const CAESAR_SHIFT = 4;
    
    // Combinación única para el guion
    const DASH_CODE = 'Z9';

    // --- FUNCIONES DE CODIFICACIÓN ---

    // Paso 1: Convertir Letras a Números Pares/Impares y Números a Letras
    function transformInput(text) {
        let transformed = '';
        for (const char of text) {
            if (char === '-') {
                transformed += DASH_CODE;
                continue;
            }
            
            const letterIndex = LETTER_ALPHABET.indexOf(char.toLowerCase());
            const numberIndex = NUMBER_ALPHABET.indexOf(char);

            if (letterIndex !== -1) {
                // Si es una letra, convertir a número par/impar
                const isUpperCase = (char !== char.toLowerCase());
                const codedNumber = isUpperCase ? (letterIndex * 2 + 1) : (letterIndex * 2);
                transformed += codedNumber.toString().padStart(2, '0');
            } else if (numberIndex !== -1) {
                // Si es un número, convertir a dos letras
                const firstLetterIndex = Math.floor(numberIndex / LETTER_ALPHABET.length);
                const secondLetterIndex = numberIndex % LETTER_ALPHABET.length;
                const firstLetter = LETTER_ALPHABET[firstLetterIndex].toUpperCase();
                const secondLetter = LETTER_ALPHABET[secondLetterIndex].toUpperCase();
                transformed += `${firstLetter}${secondLetter}`;
            } else {
                // Mantener otros caracteres
                transformed += char;
            }
        }
        return transformed;
    }

    // Paso 2: Aplicar Cifrado César
    function caesarCipher(text, shift) {
        let result = '';
        for (const char of text) {
            const upperChar = char.toUpperCase();
            const index = CAESAR_ALPHABET.indexOf(upperChar);
            if (index !== -1) {
                const newIndex = (index + shift + CAESAR_ALPHABET.length) % CAESAR_ALPHABET.length;
                result += CAESAR_ALPHABET[newIndex];
            } else {
                result += char; // Mantener caracteres no incluidos en el alfabeto
            }
        }
        return result;
    }

    // --- FUNCIONES DE DECODIFICACIÓN ---

    // Paso 2 (Inverso): Revertir Cifrado César
    function caesarDecipher(text, shift) {
        return caesarCipher(text, -shift);
    }

    // Paso 1 (Inverso): Revertir la transformación y el caso
    function reverseTransform(transformedText) {
        let originalText = '';
        let i = 0;
        while (i < transformedText.length) {
            const char1 = transformedText[i];
            const char2 = transformedText[i + 1];

            // Patrón 0: Manejar el guion
            if (char1 === 'Z' && char2 === '9') {
                originalText += '-';
                i += 2;
            }
            // Patrón 1: Dos números (ej. '00', '02') -> Letra
            else if (NUMBER_ALPHABET.includes(char1) && NUMBER_ALPHABET.includes(char2)) {
                const codedNumber = parseInt(`${char1}${char2}`, 10);
                const letterIndex = Math.floor(codedNumber / 2);
                const isUpperCase = (codedNumber % 2 !== 0);

                if (letterIndex < LETTER_ALPHABET.length) {
                    let letter = LETTER_ALPHABET[letterIndex];
                    originalText += isUpperCase ? letter.toUpperCase() : letter;
                } else {
                    originalText += ''; // Carácter de error
                }
                i += 2;
            } 
            // Patrón 2: Dos letras (ej. 'AA', 'AB') -> Número
            else if (CAESAR_ALPHABET.includes(char1) && CAESAR_ALPHABET.includes(char2)) {
                const firstIndex = LETTER_ALPHABET.indexOf(char1.toLowerCase());
                const secondIndex = LETTER_ALPHABET.indexOf(char2.toLowerCase());
                if (firstIndex !== -1 && secondIndex !== -1) {
                    const numberValue = firstIndex * LETTER_ALPHABET.length + secondIndex;
                    if (numberValue < NUMBER_ALPHABET.length) {
                         originalText += NUMBER_ALPHABET[numberValue];
                    } else {
                        originalText += ''; // Carácter de error
                    }
                } else {
                    originalText += ''; // Carácter de error
                }
                i += 2;
            }
            // Otros caracteres
            else {
                originalText += transformedText[i];
                i += 1;
            }
        }
        return originalText;
    }

    // --- FUNCIÓN PRINCIPAL DE CIFRADO Y DESCIFRADO ---
    function encryptUPADelta(text) {
        try {
            const transformed = transformInput(text);
            const ciphered = caesarCipher(transformed, CAESAR_SHIFT);
            return `${ENCRYPTED_PREFIX_DELTA}${ciphered}${ENCRYPTED_SUFFIX_DELTA}`;
        } catch (e) {
            console.error(e);
            return `[UPEA_SYS] ERROR: No se pudo cifrar el mensaje. Verifique el contenido.`;
        }
    }

    function decryptUPADelta(text) {
        if (!text.startsWith(ENCRYPTED_PREFIX_DELTA) || !text.endsWith(ENCRYPTED_SUFFIX_DELTA)) {
            return `[UPEA_SYS] ERROR: Formato de mensaje cifrado Delta inválido o no reconocido.`;
        }
        const innerText = text.substring(ENCRYPTED_PREFIX_DELTA.length, text.length - ENCRYPTED_SUFFIX_DELTA.length);

        try {
            const deciphered = caesarDecipher(innerText, CAESAR_SHIFT);
            const decryptedText = reverseTransform(deciphered);
            return decryptedText;
        } catch (e) {
            console.error(e);
            return `[UPEA_SYS] ERROR: No se pudo descifrar el mensaje. Datos corruptos.`;
        }
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

            // Deshabilitar los campos para evitar múltiples comandos a la vez
            messageInput.disabled = true;
            commandInput.disabled = true;

            // Iniciar la animación de carga inmediatamente en la caja de resultados
            let loadingDots = '';
            let dotCount = 0;
            const loadingInterval = setInterval(() => {
                dotCount = (dotCount + 1) % 4; // Ciclo de 0 a 3
                loadingDots = '.'.repeat(dotCount);
                resultOutput.value = ` [UPEA_SYS] Protocolo Delta en proceso${loadingDots}`;
            }, 500); // Actualiza cada 0.5 segundos

            // Usar setTimeout para ejecutar el proceso después del tiempo de espera aleatorio
            const randomDelay = Math.floor(Math.random() * (15000 - 1000 + 1)) + 1000;
            setTimeout(() => {
                // Detener la animación de carga
                clearInterval(loadingInterval);
                
                // Procesar el comando
                switch (command) {
                    case 'ENCRYPT':
                        const encryptedMessageWithPrefix = encryptUPEA(message);
                        resultOutput.value = encryptedMessageWithPrefix.substring(ENCRYPTED_PREFIX.length, encryptedMessageWithPrefix.length - ENCRYPTED_SUFFIX.length);
                        break;
                    case 'DECRYPT':
                        const messageForDecryption = `${ENCRYPTED_PREFIX}${message}${ENCRYPTED_SUFFIX}`;
                        const decryptedMessage = decryptUPEA(messageForDecryption);
                        resultOutput.value = decryptedMessage;
                        break;
                    default:
                        resultOutput.value = ` [UPEA_SYS] ERROR: Comando desconocido '${command}'. Use 'ENCRYPT' o 'DECRYPT'.`;
                        break;
                }
                
                // Habilitar los campos y devolver el foco al input
                messageInput.disabled = false;
                commandInput.disabled = false;
                commandInput.focus();
            }, randomDelay); 
        }
    });

    commandInput.focus();
});