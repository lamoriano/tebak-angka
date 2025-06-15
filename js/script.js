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

  for (let i = 0; i < index; i++) {
    if (players[i] && players[i].secret === secret) {
      alert("Angka tidak boleh sama dengan pemain lain!");
      return;
    }
  }

  players[index] = { name, secret, active: true };

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
  updatePlayerList();
}

function generateNumberButtons() {
  const container = document.getElementById("numberButtons");
  container.innerHTML = "";

  //const cols = Math.min(maxNumber, 10);
  for (let i = 1; i <= maxNumber; i++) {
    //const colClass = `col-${Math.floor(12 / Math.min(cols, 12))}`;
    const col = document.createElement("div");
    col.className = `col-3 col-sm-2 col-md-2 col-lg-1`;
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary number-button w-100";
    btn.textContent = i;
    btn.onclick = () => selectNumber(i, btn);
    col.appendChild(btn);
    container.appendChild(col);
  }
}

function updateTurnDisplay() {
  document.getElementById(
    "turnDisplay"
  ).textContent = `Giliran: ${players[currentPlayerIndex].name}`;
}

function switchToNextActivePlayer() {
  do {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  } while (!players[currentPlayerIndex].active);
}

function updatePlayerList() {
  const listDiv = document.getElementById("playerList");
  listDiv.innerHTML = "<strong>Pemain:</strong> ";
  players.forEach((p, idx) => {
    const span = document.createElement("span");
    span.textContent = p.name;
    if (!p.active) {
      span.classList.add("strike");
    }
    if (idx !== players.length - 1) {
      span.textContent += ", ";
    }
    listDiv.appendChild(span);
  });
}

function selectNumber(num, btn) {
  if (gameOver || btn.classList.contains("disabled")) return;

  const current = players[currentPlayerIndex];

  // Pemain menekan angka rahasianya sendiri → kalah
  if (num === current.secret) {
    gameOver = true;
    btn.classList.add("correct-guess", "disabled");

    setTimeout(() => {
      showGameOver(
        `<strong>${current.name}</strong> KALAH!<br>Kamu menebak angka RAHASIAMU SENDIRI: <strong>${num}</strong>`
      );
    }, 500);
    return;
  }

  let found = false;

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (i !== currentPlayerIndex && p.active && p.secret === num) {
      found = true;
      p.active = false;
      updatePlayerList();

      btn.classList.add("correct-guess", "disabled");
      setTimeout(() => {
        if (isGameOver()) {
          const winner = getActivePlayers()[0];
          showWinnerAnimation(winner.name);
          showGameOver(`<strong>${winner.name}</strong> MENANG!`);
          gameOver = true;
        } else {
          alert(
            `${current.name} menebak angka ${p.name}: ${num} → ${p.name} kalah`
          );
          switchToNextActivePlayer();
          updateTurnDisplay();
        }
      }, 500);
      break;
    }
  }

  if (!found) {
    btn.classList.add("wrong-guess", "disabled");
    setTimeout(() => {
      alert(`${current.name} menebak ${num} → Bukan angka rahasia.`);
      switchToNextActivePlayer();
      updateTurnDisplay();
    }, 500);
  }
}

function isGameOver() {
  return getActivePlayers().length === 1;
}

function getActivePlayers() {
  return players.filter((p) => p.active);
}

function disableAllButtons() {
  const buttons = document.querySelectorAll(".number-button");
  buttons.forEach((btn) => btn.classList.add("disabled"));
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
    document.getElementById("rangeSelect").value = "20";
    document.getElementById("gameOverOverlay").classList.remove("show");
    document.getElementById("winnerPopupContainer").innerHTML = "";
    document.getElementById("playerList").innerHTML = "";
    
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
  popup.innerHTML = `
      🎉 ${winnerName} MENANG!
      <button class="close-btn" onclick="this.parentElement.remove()">×</button>
    `;
  document.getElementById("winnerPopupContainer").appendChild(popup);
}

function showGameOver(message) {
  const overlay = document.getElementById("gameOverOverlay");
  const msgBox = document.getElementById("gameOverMessage");
  msgBox.innerHTML =
    message + `<button class="close-btn" onclick="hideGameOver()">×</button>`;
  overlay.classList.add("show");
}

function hideGameOver() {
  const overlay = document.getElementById("gameOverOverlay");
  overlay.classList.remove("show");
}

window.onload = () =>
  (document.getElementById("step-player-count").style.display = "block");
