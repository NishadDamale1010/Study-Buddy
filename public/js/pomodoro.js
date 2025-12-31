let focusTime = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 15 * 60;

let time = focusTime;
let timer = null;
let isRunning = false;

const timerDisplay = document.getElementById("timer");
const modeDisplay = document.getElementById("mode");

const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

function updateDisplay() {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerDisplay.innerText =
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;

    timer = setInterval(() => {
        time--;
        updateDisplay();

        if (time <= 0) {
            clearInterval(timer);
            isRunning = false;
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    pauseTimer();
    time = focusTime;
    modeDisplay.innerText = "Focus Time";
    updateDisplay();
}

function setFocus() {
    pauseTimer();
    time = focusTime;
    modeDisplay.innerText = "Focus Time";
    updateDisplay();
}

function setShortBreak() {
    pauseTimer();
    time = shortBreak;
    modeDisplay.innerText = "Short Break";
    updateDisplay();
}

function setLongBreak() {
    pauseTimer();
    time = longBreak;
    modeDisplay.innerText = "Long Break";
    updateDisplay();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
