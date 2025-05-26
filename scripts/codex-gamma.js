document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const resultOutput = document.getElementById('resultOutput');
    const commandInput = document.getElementById('commandInput');

    // Desplazamientos fijos para el cifrado César en Gamma
    const CAESAR_SHIFT_1 = 2;
    const CAESAR_SHIFT_2 = 7;

    // Prefijo y Sufijo para mensajes cifrados UPEA Gamma (USO INTERNO)
    // No se muestran al usuario directamente
    const ENCRYPTED_PREFIX_GAMMA = '[UPEA-G-ENC]';
    const ENCRYPTED_SUFFIX_GAMMA = '[/UPEA-G-ENC]';

    // --- Funciones Auxiliares ---

    // Función auxiliar para el Cifrado César
    // Funciona para letras (mayúsculas y minúsculas)
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

    // Función auxiliar para codificar a Hexadecimal
    function toHex(str) {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            // Convierte el charCode a hex y asegura 2 dígitos con padStart
            hex += str.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return hex.toUpperCase(); // Para uniformidad, todo en mayúsculas
    }

    // Función auxiliar para decodificar de Hexadecimal
    function fromHex(hex) {
        let str = '';
        // Asegúrate de que la longitud sea par antes de procesar
        if (hex.length % 2 !== 0) {
            console.error("Error: La cadena hexadecimal tiene una longitud impar.");
            return ''; // O manejar el error de otra manera
        }
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }

    // --- Cifrado General UPEA Gamma ---
    function encryptUPEAGamma(text) {
        // 1. Aplicar César con desplazamiento 2
        let intermediateText = '';
        for (let i = 0; i < text.length; i++) {
            intermediateText += caesarShift(text[i], CAESAR_SHIFT_1, true);
        }

        // 2. Aplicar César con desplazamiento 7 sobre el resultado anterior
        let secondCaesarResult = '';
        for (let i = 0; i < intermediateText.length; i++) {
            secondCaesarResult += caesarShift(intermediateText[i], CAESAR_SHIFT_2, true);
        }
        
        // 3. Codificar a Hexadecimal
        let hexEncoded = toHex(secondCaesarResult);

        // Devolvemos el texto codificado con los prefijos y sufijos internos.
        // La lógica de comandos se encargará de recortarlos para la visualización del usuario.
        return `${ENCRYPTED_PREFIX_GAMMA}${hexEncoded}${ENCRYPTED_SUFFIX_GAMMA}`;
    }

    // --- Descifrado General UPEA Gamma ---
    function decryptUPEAGamma(fullEncryptedText) {
        // La función ahora espera el texto con los prefijos internos.
        // El manejador de comandos los añadirá antes de llamar a esta función si no están presentes.
        
        // 1. Verificar y remover el prefijo y sufijo
        if (!fullEncryptedText.startsWith(ENCRYPTED_PREFIX_GAMMA) || !fullEncryptedText.endsWith(ENCRYPTED_SUFFIX_GAMMA)) {
            // Este error solo debería ocurrir si el texto se pasa incorrectamente a la función
            // o si el usuario manipula el código.
            return ' [UPEA_SYS] ERROR: Formato de mensaje cifrado Gamma inválido o no reconocido.';
        }
        let innerText = fullEncryptedText.substring(ENCRYPTED_PREFIX_GAMMA.length, fullEncryptedText.length - ENCRYPTED_SUFFIX_GAMMA.length);

        // 2. Decodificar de Hexadecimal
        let hexDecoded;
        try {
            hexDecoded = fromHex(innerText);
            // Comprobación adicional por si fromHex devuelve vacío por error.
            if (hexDecoded === '' && innerText !== '') { // Si innerText no está vacío, pero hexDecoded sí, hubo un error de parsing.
                 return ' [UPEA_SYS] ERROR DE DESCIFRADO: Datos Hexadecimales corruptos o inválidos.';
            }
        } catch (e) {
            return ' [UPEA_SYS] ERROR DE DESCIFRADO: Datos Hexadecimales corruptos o inválidos.';
        }

        // 3. Revertir César con desplazamiento 7 (descifrar)
        let firstCaesarDecrypted = '';
        for (let i = 0; i < hexDecoded.length; i++) {
            firstCaesarDecrypted += caesarShift(hexDecoded[i], CAESAR_SHIFT_2, false);
        }

        // 4. Revertir César con desplazamiento 2 (descifrar)
        let finalDecryptedText = '';
        for (let i = 0; i < firstCaesarDecrypted.length; i++) {
            finalDecryptedText += caesarShift(firstCaesarDecrypted[i], CAESAR_SHIFT_1, false);
        }
        
        return finalDecryptedText;
    }


    // --- MANEJO DE COMANDOS EN EL INPUT ---
    commandInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const command = commandInput.value.trim().toUpperCase();
            let message = messageInput.value; // El mensaje tal como lo introduce el usuario

            commandInput.value = ''; // Limpiar el input de comando

            if (!message) {
                resultOutput.value = " [UPEA_SYS] ERROR: No hay mensaje en la Consola de Entrada para procesar.";
                return;
            }

            // Deshabilitar la entrada de mensaje y comandos durante el proceso
            messageInput.disabled = true;
            commandInput.disabled = true;

            // Simular el envío del comando a UPEA_SERVER
            resultOutput.value = ` [UPEA_SYS] Enviando comando '${command}' a UPEA_SERVER...`;
            await new Promise(resolve => setTimeout(resolve, 500));

            switch (command) {
                case 'ENCRYPT':
                    resultOutput.value = ""; // Limpiar el resultado anterior
                    await window.showLoadingScreen('CIFRADO GAMMA');
                    // encryptUPEAGamma devuelve el texto CON prefijos
                    const encryptedMessageWithPrefix = encryptUPEAGamma(message);
                    // Pero para mostrarlo al usuario, RECORTAMOS los prefijos
                    resultOutput.value = encryptedMessageWithPrefix.substring(
                        ENCRYPTED_PREFIX_GAMMA.length,
                        encryptedMessageWithPrefix.length - ENCRYPTED_SUFFIX_GAMMA.length
                    );
                    break;
                case 'DECRYPT':
                    resultOutput.value = ""; // Limpiar el resultado anterior
                    await window.showLoadingScreen('DESCIFRADO GAMMA');
                    // Para descifrar, el usuario pega el código puro.
                    // Nosotros AÑADIMOS los prefijos internamente ANTES de llamar a la función de descifrado.
                    const messageForDecryption = `${ENCRYPTED_PREFIX_GAMMA}${message}${ENCRYPTED_SUFFIX_GAMMA}`;
                    const decryptedMessage = decryptUPEAGamma(messageForDecryption);
                    resultOutput.value = decryptedMessage;
                    break;
                default:
                    resultOutput.value = ` [UPEA_SYS] ERROR: Comando desconocido '${command}'. Use 'ENCRYPT' o 'DECRYPT'.`;
                    break;
            }
            
            // Habilitar de nuevo la entrada de mensaje y comandos
            messageInput.disabled = false;
            commandInput.disabled = false;
            commandInput.focus(); // Devuelve el foco al input de comando
        }
    });

    commandInput.focus(); // Enfocar el input de comando al cargar la página
});
