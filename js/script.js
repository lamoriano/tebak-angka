let totalPlayers = 0;
let maxNumber = 20;
let players = [];
let currentPlayerIndex = 0;
let gameOver = false;

function setPlayerCount(count) {
totalPlayers = count;
maxNumber = parseInt(document.getElementById("rangeSelect").value);

if (!maxNumber || maxNumber < 1) {
    alert("Pilih rentang angka!");
    return;
}

document.getElementById("step-player-count").style.display = "none";
showPlayerForm(0);
}

function showPlayerForm(index) {
const container = document.getElementById("step-input-forms");
container.innerHTML = `
    <div class="card p-4 mx-auto" style="max-width: 400px;">
    <h4>Pemain ${index + 1}</h4>
    <input type="text" class="form-control mb-3" id="name-${index}" placeholder="Nama Pemain">
    <input type="number" class="form-control mb-3" id="secret-${index}" min="1" :max="maxNumber" placeholder="Angka Rahasia (1-${maxNumber})">
    <button class="btn btn-success w-100" onclick="submitPlayer(${index})">Lanjut</button>
    </div>
`;
document.getElementById("step-input-forms").style.display = "block";
}

function submitPlayer(index) {
const name = document.getElementById(`name-${index}`).value.trim();
const secret = parseInt(document.getElementById(`secret-${index}`).value);

if (!name) {
    alert("Masukkan nama pemain!");
    return;
}

if (isNaN(secret) || secret < 1 || secret > maxNumber) {
    alert(`Masukkan angka antara 1 - ${maxNumber}`);
    return;
}

// Validasi duplikat
for (let i = 0; i < index; i++) {
    if (players[i] && players[i].secret === secret) {
    alert("Angka tidak boleh sama dengan pemain lain!");
    return;
    }
}

players[index] = { name, secret };

if (index < totalPlayers - 1) {
    showPlayerForm(index + 1);
} else {
    startGame();
}
}

function startGame() {
document.getElementById("step-input-forms").style.display = "none";
document.getElementById("game-area").style.display = "block";

generateNumberButtons();
updateTurnDisplay();
}

function generateNumberButtons() {
const container = document.getElementById("numberButtons");
container.innerHTML = ""; // Bersihkan sebelum generate ulang

for (let i = 1; i <= maxNumber; i++) {
    const col = document.createElement("div");
    // col-6: 2 kolom per baris di mobile, col-md-2: 5 kolom per baris di desktop (karena 12/5=2.4, pakai col-md-2)
    col.className = "col-3 col-md-2";
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary number-button w-100";
    btn.textContent = i;
    btn.onclick = () => selectNumber(i, btn);
    col.appendChild(btn);
    container.appendChild(col);
}
}

function updateTurnDisplay() {
document.getElementById("turnDisplay").textContent =
    `Giliran: ${players[currentPlayerIndex].name}`;
}

function switchPlayer() {
currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
updateTurnDisplay();
}

function selectNumber(num, btn) {
if (gameOver || btn.classList.contains("disabled")) return;

const current = players[currentPlayerIndex];

// Pemain menekan angka rahasianya sendiri → kalah
if (num === current.secret) {
    gameOver = true;
    btn.classList.add("correct-guess", "disabled");

    setTimeout(() => {
    showGameOver(`<strong>${current.name}</strong> KALAH!<br>Kamu menebak angka RAHASIAMU SENDIRI: <strong>${num}</strong>`);
    }, 500);
    return;
}

let found = false;

players.forEach((p, idx) => {
    if (idx !== currentPlayerIndex && p.secret === num) {
    found = true;
    gameOver = true;

    btn.classList.add("correct-guess", "disabled");
    setTimeout(() => {
        showWinnerAnimation(current.name, num);
        showGameOver(`<strong>${current.name}</strong> MENANG!<br>Angka rahasianya <strong>${p.name}</strong> adalah: <strong>${num}</strong>`);
    }, 500);
    }
});

if (!found) {
    btn.classList.add("wrong-guess", "disabled");
    setTimeout(() => {
    alert(`${current.name} menebak ${num} → Bukan angka rahasia.`);
    switchPlayer();
    }, 500);
}
}

function disableAllButtons() {
const buttons = document.querySelectorAll(".number-button");
buttons.forEach(btn => btn.classList.add("disabled"));
}

function resetGame() {
if (confirm("Apakah Anda yakin ingin mereset? Semua data akan hilang.")) {
    totalPlayers = 0;
    maxNumber = 20;
    players = [];
    currentPlayerIndex = 0;
    gameOver = false;

    document.getElementById("game-area").style.display = "none";
    document.getElementById("step-input-forms").style.display = "none";
    document.getElementById("step-player-count").style.display = "block";
    document.getElementById("result").classList.remove("show");
    document.getElementById("result").innerHTML = "";
    document.getElementById("rangeSelect").value = "20";
    document.getElementById("gameOverOverlay").classList.remove("show");
}
}

function newGame() {
if (confirm("Mulai permainan baru?")) {
    resetGame();
}
}

function showWinnerAnimation(winnerName) {
const popup = document.createElement("div");
popup.className = "winner-popup";
popup.textContent = `🎉 ${winnerName} MENANG!`;
document.body.appendChild(popup);

setTimeout(() => popup.remove(), 5000);
}

function showGameOver(message) {
const overlay = document.getElementById("gameOverOverlay");
const msgBox = document.getElementById("gameOverMessage");
msgBox.innerHTML = message + `<br><button class="btn close-btn" onclick="hideGameOver()">× close</button>`;
overlay.classList.add("show");
}

function hideGameOver() {
const overlay = document.getElementById("gameOverOverlay");
overlay.classList.remove("show");
}

// Tampilkan step pertama
window.onload = () => document.getElementById("step-player-count").style.display = "block";