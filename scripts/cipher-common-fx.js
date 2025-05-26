// Funciones y variables comunes para los efectos de los cifradores (ej: pantalla de carga)

const loadingScreen = document.getElementById('loadingScreen');
const loadingText = document.getElementById('loadingText');

// Función para el efecto de escritura en la pantalla de carga (solo para un mensaje)
function typeWriterEffect(text, element, delay = 50) {
    element.textContent = ''; // Limpia el texto actual
    let i = 0;
    return new Promise(resolve => {
        // Clear previous interval if any
        if (element.typingInterval) {
            clearInterval(element.typingInterval);
        }
        element.typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(element.typingInterval);
                delete element.typingInterval; // Clean up the reference
                resolve();
            }
        }, delay);
    });
}

// Función para mostrar la pantalla de carga de terminal
async function showLoadingScreen(processType) { // Recibe el tipo de proceso (ENCRYPT/DECRYPT)
    loadingScreen.classList.remove('hidden'); // Muestra la pantalla de carga
    loadingScreen.classList.add('fade-in'); // Añade efecto de fade-in
    
    // Genera un retardo aleatorio entre 3 y 15 segundos
    const randomDelay = Math.floor(Math.random() * (15000 - 3000 + 1)) + 3000;
    
    // Mensaje dinámico basado en el tipo de proceso
    const message = `[UPEA_SYSTEM] INICIANDO PROCESO DE ${processType}...\n[UPEA_SYSTEM] TIEMPO ESTIMADO: ${Math.ceil(randomDelay / 1000)} SEGUNDOS...\n[UPEA_SYSTEM] POR FAVOR, ESPERE...`;
    
    await typeWriterEffect(message, loadingText, 30); // Velocidad de escritura un poco más rápida
    
    return new Promise(resolve => {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out'); // Añade efecto de fade-out
            loadingScreen.addEventListener('animationend', () => {
                loadingScreen.classList.add('hidden'); // Oculta después de la animación
                loadingScreen.classList.remove('fade-out'); // Limpia la clase
                loadingText.textContent = ""; // Limpiar el texto para la próxima vez
            }, { once: true });
            resolve(); // Resuelve la promesa para continuar
        }, randomDelay);
    });
}

// Hace que showLoadingScreen sea accesible globalmente
window.showLoadingScreen = showLoadingScreen;
