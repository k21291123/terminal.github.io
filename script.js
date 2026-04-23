/**
 * Aqtobe-Server Dashboard: Final Edition
 * Настроен под твой HTML (id="command-input" и id="output")
 */

// --- 1. АУДИО СИСТЕМА (БЕЗОПАСНАЯ) ---
if (typeof audioCtx === 'undefined') {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

const VOL_KEYS = 0.04;    
const VOL_MONITOR = 0.002;

function playKeySound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(150 + Math.random() * 50, audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(VOL_KEYS, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

function startMonitorHum() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    // Писк монитора
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.frequency.value = 10000;
    g.gain.value = VOL_MONITOR;
    osc.connect(g).connect(audioCtx.destination);
    osc.start();

    // Белый шум
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

// --- 2. ЛОГИКА ТЕРМИНАЛА (ПОД ТВОЙ HTML) ---
const output = document.getElementById('output');
const input = document.getElementById('command-input');

function handleCommand(cmd) {
    const line = document.createElement('div');
    line.style.margin = "5px 0";
    const cleanCmd = cmd.toLowerCase().trim();

    // Добавляем саму введенную команду в историю вывода
    const historyLine = document.createElement('div');
    historyLine.innerHTML = `<span class="prompt">guest@aktobe-server:~$</span> <span>${cmd}</span>`;
    output.appendChild(historyLine);

    switch (cleanCmd) {
        case 'help':
            line.innerHTML = `
                <span style="color: #50fa7b">ДОСТУПНЫЕ КОМАНДЫ:</span><br>
                - <b style="color: #8be9fd">help</b>: список команд<br>
                - <b style="color: #8be9fd">clear</b>: очистить экран<br>
                - <b style="color: #8be9fd">neofetch</b>: инфо о системе<br>
                - <b style="color: #8be9fd">status</b>: проверка сервера<br>
                - <b style="color: #8be9fd">whoami</b>: инфо о пользователе
            `;
            break;

        case 'neofetch':
            line.innerHTML = `
                <pre style="color: #bd93f9; margin: 10px 0; line-height: 1.2; font-family: 'VT323', monospace;">
   .,-:;//;:-.      <span style="color: #ff79c6">kirill@aqtobe-server</span>
  . -H########M- .   <span style="color: #f8f8f2">--------------------</span>
 ^###########M ^     <span style="color: #8be9fd">OS</span>: Debian 13 (Trixie)
                     <span style="color: #8be9fd">Kernel</span>: Linux 6.x
                     <span style="color: #8be9fd">WM</span>: AwesomeWM
                     <span style="color: #8be9fd">RAM</span>: 8GB Phys / 8GB Swap
                     <span style="color: #8be9fd">City</span>: Aqtobe, KZ
                </pre>`;
            break;

        case 'status':
            line.innerHTML = 'System: <span style="color: #50fa7b">Active</span><br>Audio: <span style="color: #50fa7b">Connected (Наушники)</span>';
            break;

        case 'whoami':
            line.textContent = 'User: Kirill | Occupation: Student & JS Developer';
            break;

        case 'clear':
            output.innerHTML = '';
            return;

        case '':
            return;

        default:
            line.innerHTML = `<span style="color: #ff5555">Ошибка:</span> команда "${cmd}" не найдена.`;
    }

    output.appendChild(line);
    // Авто-скролл вниз
    window.scrollTo(0, document.body.scrollHeight);
}

// --- 3. ОБРАБОТКА СОБЫТИЙ ---

// Фокус и Enter
window.addEventListener('keydown', (e) => {
    playKeySound();

    if (input) {
        if (document.activeElement !== input) {
            input.focus();
        }

        if (e.key === 'Enter') {
            handleCommand(input.value);
            input.value = '';
        }
    }
});

// Запуск звука монитора по первому клику
window.addEventListener('click', () => {
    startMonitorHum();
}, { once: true });