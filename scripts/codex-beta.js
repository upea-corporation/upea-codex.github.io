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
                resultOutput.value = ` [UPEA_SYS] Protocolo Beta en proceso${loadingDots}`;
            }, 500); // Actualiza cada 0.5 segundos

            // Usar setTimeout para ejecutar el proceso después del tiempo de espera aleatorio
            const randomDelay = Math.floor(Math.random() * (15000 - 1000 + 1)) + 1000;
            setTimeout(() => {
                // Detener la animación de carga
                clearInterval(loadingInterval);
                
                // Procesar el comando
                switch (command) {
                    case 'ENCRYPT':
                        const encryptedMessageWithPrefix = encryptUPEABeta(message);
                        resultOutput.value = encryptedMessageWithPrefix.substring(ENCRYPTED_PREFIX_BETA.length, encryptedMessageWithPrefix.length - ENCRYPTED_SUFFIX_BETA.length);
                        break;
                    case 'DECRYPT':
                        const messageForDecryption = `${ENCRYPTED_PREFIX_BETA}${message}${ENCRYPTED_SUFFIX_BETA}`;
                        const decryptedMessage = decryptUPEABeta(messageForDecryption);
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
