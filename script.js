/**
 * Aqtobe-Server Terminal JS
 * Настроено для: https://k21291123.github.io/terminal.github.io/
 */

// --- 1. АУДИО КОНТЕКСТ (БЕЗОПАСНЫЙ) ---
let audioCtx;
const VOL_KEYS = 0.04;    // Тихий звук клавиш
const VOL_MONITOR = 0.002; // Едва заметный гул

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Звук нажатия клавиши
function playKeySound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(150 + Math.random() * 40, audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(VOL_KEYS, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Эффект гула старого монитора
function startMonitorHum() {
    initAudio();
    
    // Высокочастотный писк
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.frequency.value = 10000;
    g.gain.value = VOL_MONITOR;
    osc.connect(g).connect(audioCtx.destination);
    osc.start();

    // Белый шум (статика)
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const ng = audioCtx.createGain();
    ng.gain.value = VOL_MONITOR * 0.5;
    src.connect(ng).connect(audioCtx.destination);
    src.start();
}

// --- 2. ЛОГИКА ТЕРМИНАЛА ---
const output = document.getElementById('output');
const input = document.getElementById('command-input');

function handleCommand(cmd) {
    const cleanCmd = cmd.toLowerCase().trim();
    
    // Создаем строку с тем, что ввел пользователь
    const historyLine = document.createElement('div');
    historyLine.innerHTML = `<span class="prompt">guest@aktobe-server:~$</span> <span class="user-cmd">${cmd}</span>`;
    output.appendChild(historyLine);

    const response = document.createElement('div');
    response.style.marginBottom = "10px";

    switch (cleanCmd) {
        case 'help':
            response.innerHTML = `
                <span style="color: #50fa7b">ДОСТУПНЫЕ КОМАНДЫ:</span><br>
                - <b style="color: #8be9fd">help</b>: список команд<br>
                - <b style="color: #8be9fd">clear</b>: очистить терминал<br>
                - <b style="color: #8be9fd">neofetch</b>: информация о системе<br>
                - <b style="color: #8be9fd">whoami</b>: о пользователе<br>
                - <b style="color: #8be9fd">status</b>: состояние сервера
            `;
            break;

        case 'neofetch':
            response.innerHTML = `
                <pre style="color: #bd93f9; margin: 5px 0; line-height: 1.2;">
   .,-:;//;:-.      <span style="color: #ff79c6">kirill@aqtobe-server</span>
  . -H########M- .   <span style="color: #f8f8f2">--------------------</span>
 ^###########M ^     <span style="color: #8be9fd">OS</span>: Debian 13 (Trixie)
                     <span style="color: #8be9fd">Kernel</span>: Linux 6.x
                     <span style="color: #8be9fd">WM</span>: AwesomeWM
                     <span style="color: #8be9fd">RAM</span>: 8GB Phys / 8GB Swap
                     <span style="color: #8be9fd">City</span>: Aqtobe, KZ
                </pre>`;
            break;

        case 'whoami':
            response.textContent = "User: Kirill | Occupation: Student & Web Developer in Aqtobe.";
            break;

        case 'status':
            response.innerHTML = "System: <span style="color: #50fa7b">ONLINE</span><br>Audio: <span style="color: #50fa7b">READY</span>";
            break;

        case 'clear':
            output.innerHTML = '';
            return;

        case '':
            return;

        default:
            response.innerHTML = `<span style="color: #ff5555">Ошибка:</span> команда "${cmd}" не найдена. Введите <b>help</b>.`;
    }

    output.appendChild(response);
    
    // Авто-прокрутка вниз
    window.scrollTo(0, document.body.scrollHeight);
}

// --- 3. ОБРАБОТЧИКИ СОБЫТИЙ ---

// Нажатия клавиш
window.addEventListener('keydown', (e) => {
    // Инициализируем звук при первом нажатии, если еще не сделано
    if (!audioCtx) initAudio();
    
    playKeySound();

    // Авто-фокус на ввод при печати
    if (document.activeElement !== input) {
        input.focus();
    }

    if (e.key === 'Enter') {
        handleCommand(input.value);
        input.value = '';
    }
});

// Клик по любому месту экрана возвращает фокус и запускает фон
document.addEventListener('click', () => {
    if (input) input.focus();
    if (!audioCtx || audioCtx.state === 'suspended') {
        startMonitorHum();
    }
}, { once: false });

// Стартовое приветствие
window.onload = () => {
    handleCommand('neofetch');
};
