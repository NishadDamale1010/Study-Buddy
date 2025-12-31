let focusTime = 25 * 60;   // seconds
let breakTime = 5 * 60;

let time = focusTime;
let timer = null;
let isFocus = true;

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
    if (timer) return;

    timer = setInterval(() => {
        time--;

        if (time <= 0) {
            clearInterval(timer);
            timer = null;

            isFocus = !isFocus;
            time = isFocus ? focusTime : breakTime;
            modeDisplay.innerText = isFocus ? "Focus Time" : "Break Time";

            updateDisplay();
        }

        updateDisplay();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    timer = null;
}

function resetTimer() {
    clearInterval(timer);
    timer = null;
    isFocus = true;
    time = focusTime;
    modeDisplay.innerText = "Focus Time";
    updateDisplay();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
