document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const resultOutput = document.getElementById('resultOutput');
    const commandInput = document.getElementById('commandInput');

    const ENCRYPTED_PREFIX_EPSILON = '[UPEA-EPSILON-ENC]';
    const ENCRYPTED_SUFFIX_EPSILON = '[/UPEA-EPSILON-ENC]';

    // --- FUNCIONES DE CODIFICACIÓN ---

    // 1. Texto a Binario
    function textToBinary(text) {
        let binaryString = '';
        for (let i = 0; i < text.length; i++) {
            binaryString += text.charCodeAt(i).toString(2).padStart(8, '0');
        }
        return binaryString;
    }

    // 2. Binario a Hexadecimal
    function binaryToHex(binary) {
        let hexString = '';
        for (let i = 0; i < binary.length; i += 4) {
            const nibble = binary.substr(i, 4);
            const decimalValue = parseInt(nibble, 2);
            hexString += decimalValue.toString(16).toUpperCase();
        }
        return hexString;
    }

    // 3. Hexadecimal a Base64
    function hexToBase64(hex) {
        let binaryString = '';
        for (let i = 0; i < hex.length; i += 2) {
            const byte = parseInt(hex.substr(i, 2), 16);
            binaryString += String.fromCharCode(byte);
        }
        return btoa(binaryString);
    }

    // 4. Base64 a URL Encoding
    function base64ToUrlEncoded(base64) {
        return encodeURIComponent(base64);
    }

    // --- FUNCIONES DE DECODIFICACIÓN ---

    // 4. URL Encoding a Base64
    function urlEncodedToBase64(urlEncoded) {
        return decodeURIComponent(urlEncoded);
    }

    // 3. Base64 a Hexadecimal
    function base64ToHex(base64) {
        let binaryString = atob(base64);
        let hexString = '';
        for (let i = 0; i < binaryString.length; i++) {
            const hex = binaryString.charCodeAt(i).toString(16).padStart(2, '0');
            hexString += hex;
        }
        return hexString;
    }

    // 2. Hexadecimal a Binario
    function hexToBinary(hex) {
        let binaryString = '';
        for (let i = 0; i < hex.length; i++) {
            const binary = parseInt(hex[i], 16).toString(2).padStart(4, '0');
            binaryString += binary;
        }
        return binaryString;
    }

    // 1. Binario a Texto
    function binaryToText(binary) {
        let text = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substr(i, 8);
            const charCode = parseInt(byte, 2);
            text += String.fromCharCode(charCode);
        }
        return text;
    }

    // --- FUNCIÓN PRINCIPAL DE CIFRADO ---
    function encryptUPEAEpsilon(text) {
        // Cadena de codificación: Texto -> Binario -> Hex -> Base64 -> URL
        const binaryResult = textToBinary(text);
        const hexResult = binaryToHex(binaryResult);
        const base64Result = hexToBase64(hexResult);
        const urlEncodedResult = base64ToUrlEncoded(base64Result);
        
        return `${ENCRYPTED_PREFIX_EPSILON}${urlEncodedResult}${ENCRYPTED_SUFFIX_EPSILON}`;
    }

    // --- FUNCIÓN PRINCIPAL DE DESCIFRADO ---
    function decryptUPEAEpsilon(text) {
        if (!text.startsWith(ENCRYPTED_PREFIX_EPSILON) || !text.endsWith(ENCRYPTED_SUFFIX_EPSILON)) {
            return ' [UPEA_SYS] ERROR: Formato de mensaje cifrado EPSILON inválido o no reconocido.';
        }

        const innerText = text.substring(ENCRYPTED_PREFIX_EPSILON.length, text.length - ENCRYPTED_SUFFIX_EPSILON.length);
        
        // Cadena de decodificación: URL -> Base64 -> Hex -> Binario -> Texto
        try {
            const base64Decoded = urlEncodedToBase64(innerText);
            const hexDecoded = base64ToHex(base64Decoded);
            const binaryDecoded = hexToBinary(hexDecoded);
            const decryptedText = binaryToText(binaryDecoded);
            
            return decryptedText;
        } catch (e) {
            return ' [UPEA_SYS] ERROR: No se pudo descifrar el mensaje. Datos corruptos.';
        }
    }


    // --- MANEJO DE COMANDOS EN EL INPUT ---
    commandInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const command = commandInput.value.trim().toUpperCase();
            let message = messageInput.value;

            commandInput.value = '';

            if (!message) {
                resultOutput.value = " [UPEA_SYS] ERROR: No hay mensaje en la Consola de Entrada para procesar.";
                return;
            }

            messageInput.disabled = true;
            commandInput.disabled = true;

            resultOutput.value = ` [UPEA_SYS] Enviando comando '${command}' a UPEA_SERVER...`;
            await new Promise(resolve => setTimeout(resolve, 500));

            switch (command) {
                case 'ENCRYPT':
                    resultOutput.value = "";
                    await window.showLoadingScreen('CIFRADO EPSILON');
                    const encryptedMessageWithPrefix = encryptUPEAEpsilon(message);
                    resultOutput.value = encryptedMessageWithPrefix.substring(ENCRYPTED_PREFIX_EPSILON.length, encryptedMessageWithPrefix.length - ENCRYPTED_SUFFIX_EPSILON.length);
                    break;
                case 'DECRYPT':
                    resultOutput.value = "";
                    await window.showLoadingScreen('DESCIFRADO EPSILON');
                    const messageForDecryption = `${ENCRYPTED_PREFIX_EPSILON}${message}${ENCRYPTED_SUFFIX_EPSILON}`;
                    const decryptedMessage = decryptUPEAEpsilon(messageForDecryption);
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
