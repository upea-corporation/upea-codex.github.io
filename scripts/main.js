// scripts/main.js

document.addEventListener('DOMContentLoaded', () => {
    const terminalOutput = document.getElementById('terminalOutput');
    const terminalInput = document.getElementById('terminalInput');
    const terminalContainer = document.querySelector('.terminal-container'); // Obtener el contenedor principal
    const body = document.body; // Referencia al body para cambiar el fondo

    // Mensaje inicial de la terminal (incluyendo el copyright)
    const initialMessageContent = `UPEA Codex - Sistema de Cifrado Cuántico
Versión 1.0.3 (Build 250524)
(c) 2025 UPEA Corp. Todos los derechos reservados.

Escribe 'help' para ver los comandos disponibles.
`;

    let charIndex = 0;
    let typingSpeed = 30;
    let terminalLocked = false; // Nueva variable para controlar el estado de bloqueo general

    function typeWriterEffect(message, callback) {
        if (charIndex < message.length) {
            terminalOutput.textContent += message.charAt(charIndex);
            charIndex++;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            setTimeout(() => typeWriterEffect(message, callback), typingSpeed);
        } else if (callback) {
            callback();
        }
    }

    function addLineToTerminal(text) {
        if (terminalLocked) return; // No añadir líneas si el sistema está comprometido
        terminalOutput.textContent += "\n" + text;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    // --- FUNCIONES PARA EL EFECTO DE COMPROMISO ---
    function lockTerminal() {
        terminalLocked = true; // Establecer el estado de bloqueo
        terminalInput.disabled = true;
        terminalInput.style.pointerEvents = 'none'; // Deshabilita clics
        terminalInput.style.opacity = '0'; // Oculta el input para que no interfiera
        terminalContainer.classList.add('system-locked'); // Para difuminar el contenido
    }

    function triggerCompromisedEffect() {
        lockTerminal(); // Bloquear la terminal inmediatamente

        body.classList.add('system-compromised'); // Activar efecto de fondo
        terminalContainer.classList.add('compromised-border'); // Activar efecto de borde

        // Crear y añadir el mensaje glitcheado "S.C.P."
        const glitchMessage = document.createElement('div');
        glitchMessage.classList.add('glitch-text');
        glitchMessage.textContent = 'S.C.P.';
        document.body.appendChild(glitchMessage);

        // Opcional: Reiniciar el efecto Matrix de fondo a uno más "rojo" o "distorsionado"
        // Esto requeriría modificar background-effect.js para tener una función de cambio de color/modo
        // Por ahora, solo el body.system-compromised lo afecta.
    }
    // --- FIN FUNCIONES DE COMPROMISO ---


    const commands = {
        'help': () => {
            addLineToTerminal("Comandos disponibles:");
            addLineToTerminal("  help                   - Muestra esta ayuda.");
            addLineToTerminal("  list                   - Muestra los protocolos de cifrado disponibles.");
            addLineToTerminal("  clear                  - Limpia la consola.");
            addLineToTerminal("  access [protocolo]     - Accede a un protocolo de cifrado específico.");
            addLineToTerminal("  exit  "); // Descripción actualizada
            addLineToTerminal("\n");
        },
        'list': () => {
            addLineToTerminal("Protocolos de Cifrado UPEA Codex:");
            addLineToTerminal("  ALPHA      (Cifrado de Entidades EAZ)");
            addLineToTerminal("  BETA       (Protocolo de Interceptación)");
            addLineToTerminal("  GAMMA      (Secuencia de Datos Anómalos)");
            addLineToTerminal("\n");
        },
        'clear': () => {
            terminalOutput.textContent = initialMessageContent.trim() + '\n';
            charIndex = initialMessageContent.length;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        },
        'access': (args) => {
            const protocol = args[0] ? args[0].toLowerCase() : '';
            let targetUrl = '';

            switch (protocol) {
                case 'alfa':
                case 'alpha':
                    targetUrl = 'codex/protocolo_alpha.html';
                    break;
                case 'beta':
                    targetUrl = 'codex/protocolo_beta.html';
                    break;
                case 'gamma':
                    targetUrl = 'codex/protocolo_gamma.html';
                    break;
                default:
                    addLineToTerminal(`Error: Protocolo '${protocol}' no reconocido. Use 'list' para ver los disponibles.
                        `);
                    return;
            }

            if (targetUrl) {
                addLineToTerminal(`Accediendo a ${protocol.toUpperCase()}...`);
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 1000);
            }
        },
        'exit': () => {
            addLineToTerminal('¡ADVERTENCIA DE SEGURIDAD! Sistema comprometido. Desconexión forzosa.');

            // Retardo antes de activar el efecto visual de compromiso
            setTimeout(() => {
                triggerCompromisedEffect();

                // Nuevo retardo para la redirección después de que el glitch se vea
                setTimeout(() => {
                    window.location.href = 'https://scp-wiki.wikidot.com/'; // Redirige a la web oficial de SCP
                }, 1000); // 1 segundos adicionales para ver el efecto S.C.P.
            }, 500); // Dar tiempo a que el mensaje de advertencia se lea antes del glitch
        }
    };

    // Deshabilitar la entrada de la terminal al inicio
    terminalInput.disabled = true;
    terminalInput.style.pointerEvents = 'none'; // También deshabilita clics para mayor seguridad visual
    terminalInput.style.opacity = '0.5'; // Visualmente indica que está deshabilitado

    terminalInput.addEventListener('keydown', (event) => {
        // Si el sistema está bloqueado (por el comando exit), ignorar todos los eventos de teclado
        if (terminalLocked) {
            event.preventDefault();
            return;
        }

        if (event.key === 'Enter') {
            const input = terminalInput.value.trim();
            addLineToTerminal(`upea@codex:~$ ${input}`);
            terminalInput.value = '';

            if (input === '') {
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                return;
            }

            const parts = input.split(' ');
            const command = parts[0].toLowerCase();
            const args = parts.slice(1);

            if (commands[command]) {
                commands[command](args);
            } else {
                addLineToTerminal(`Comando '${command}' no encontrado. Escriba 'help' para asistencia.`);
            }
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    });

    // Iniciar el efecto de escritura al cargar la página
    typeWriterEffect(initialMessageContent, () => {
        // Habilitar la entrada de la terminal una vez que el mensaje ha terminado
        terminalInput.disabled = false;
        terminalInput.style.pointerEvents = 'auto'; // Habilitar clics
        terminalInput.style.opacity = '1'; // Volver a la opacidad normal
        terminalInput.focus(); // Enfocar el input después del mensaje de bienvenida
    });
});
