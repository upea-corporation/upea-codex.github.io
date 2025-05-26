document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const resultOutput = document.getElementById('resultOutput');
    const commandInput = document.getElementById('commandInput');

    // Prefijo y Sufijo para mensajes cifrados UPEA Beta
    const ENCRYPTED_PREFIX_BETA = '[UPEA-BETA-ENC]';
    const ENCRYPTED_SUFFIX_BETA = '[/UPEA-BETA-ENC]';

    // Función auxiliar para codificar a Hexadecimal
    function toHex(str) {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            hex += str.charCodeAt(i).toString(16);
        }
        return hex;
    }

    // Función auxiliar para decodificar de Hexadecimal
    function fromHex(hex) {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }

    // Función principal de cifrado UPEA Híbrido Beta (Base64 -> Hex)
    function encryptUPEABeta(text) {
        // Paso 1: Codificar a Base64
        // 'btoa' solo funciona con strings que contengan caracteres ASCII Latinos (0-255).
        // Para Unicode (UTF-8), se requiere un paso intermedio.
        // Aquí asumimos ASCII para simplificar, si necesitas Unicode, la conversión es más compleja.
        let base64Encoded = btoa(text);

        // Paso 2: Codificar la cadena Base64 resultante a Hexadecimal
        let hexEncoded = toHex(base64Encoded);

        // Añadir el prefijo y sufijo para identificar el mensaje como cifrado por UPEA Beta
        return `${ENCRYPTED_PREFIX_BETA}${hexEncoded}${ENCRYPTED_SUFFIX_BETA}`;
    }

    // Función principal de descifrado UPEA Híbrido Beta (Hex -> Base64)
    function decryptUPEABeta(text) {
        // Primero, verificar si el mensaje tiene el formato de cifrado UPEA Beta
        if (!text.startsWith(ENCRYPTED_PREFIX_BETA) || !text.endsWith(ENCRYPTED_SUFFIX_BETA)) {
            return ' [UPEA_SYS] ERROR: Formato de mensaje cifrado Beta inválido o no reconocido.';
        }

        // Remover el prefijo y sufijo para obtener el texto cifrado real
        let innerText = text.substring(ENCRYPTED_PREFIX_BETA.length, text.length - ENCRYPTED_SUFFIX_BETA.length);
        
        // Paso 1: Decodificar de Hexadecimal a la cadena Base64 original
        let base64Decoded = fromHex(innerText);

        // Paso 2: Decodificar de Base64 a texto plano
        // 'atob' solo funciona con strings que contengan caracteres ASCII Latinos (0-255).
        let decryptedText = '';
        try {
            decryptedText = atob(base64Decoded);
        } catch (e) {
            return ' [UPEA_SYS] ERROR DE DESCIFRADO: Datos Base64 corruptos o inválidos.';
        }
        
        return decryptedText;
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

            // Simular el envío del comando a UPEA_SERVER
            resultOutput.value = ` [UPEA_SYS] Enviando comando '${command}' a UPEA_SERVER...`;
            await new Promise(resolve => setTimeout(resolve, 500));

            switch (command) {
                case 'ENCRYPT':
                    resultOutput.value = ""; // Limpia el resultado anterior
                    await window.showLoadingScreen('CIFRADO BETA');
                    const encryptedMessageWithPrefix = encryptUPEABeta(message);
                    // Mostrar el resultado sin prefijos al usuario
                    resultOutput.value = encryptedMessageWithPrefix.substring(ENCRYPTED_PREFIX_BETA.length, encryptedMessageWithPrefix.length - ENCRYPTED_SUFFIX_BETA.length);
                    break;
                case 'DECRYPT':
                    resultOutput.value = ""; // Limpia el resultado anterior
                    await window.showLoadingScreen('DESCIFRADO BETA');
                    // Añadimos los prefijos internamente para que la función de descifrado los espere
                    const messageForDecryption = `${ENCRYPTED_PREFIX_BETA}${message}${ENCRYPTED_SUFFIX_BETA}`;
                    const decryptedMessage = decryptUPEABeta(messageForDecryption);
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
