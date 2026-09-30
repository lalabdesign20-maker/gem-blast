/* =========================================================
   GEM BLAST
   VERSIONE COMPLETA
========================================================= */

const SIZE = 8;


/* =========================================================
   ELEMENTI HTML
========================================================= */

const boardEl = document.getElementById("board");
const piecesEl = document.getElementById("pieces");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const comboEl = document.getElementById("combo");

const menuBestEl = document.getElementById("menuBest");
const menuLevelEl = document.getElementById("menuLevel");
const menuCoinsEl = document.getElementById("menuCoins");
const menuXpEl = document.getElementById("menuXp");
const menuXpFillEl = document.getElementById("menuXpFill");

const gameLevelEl = document.getElementById("gameLevel");
const gameCoinsEl = document.getElementById("gameCoins");

const gameXpFillEl = document.getElementById("gameXpFill");
const gameXpTextEl = document.getElementById("gameXpText");

const messageEl = document.getElementById("message");

const menuEl = document.getElementById("menu");
const howToEl = document.getElementById("howTo");
const missionsEl = document.getElementById("missions");
const statsEl = document.getElementById("stats");
const gameEl = document.getElementById("game");

const pauseOverlay = document.getElementById("pauseOverlay");
const gameOverEl = document.getElementById("gameOver");

const finalScoreEl = document.getElementById("finalScore");
const finalComboEl = document.getElementById("finalCombo");
const finalXpEl = document.getElementById("finalXp");
const finalCoinsEl = document.getElementById("finalCoins");
const newRecordEl = document.getElementById("newRecord");

const missionsListEl = document.getElementById("missionsList");

const statBestEl = document.getElementById("statBest");
const statGamesEl = document.getElementById("statGames");
const statLinesEl = document.getElementById("statLines");
const statComboEl = document.getElementById("statCombo");
const statBlocksEl = document.getElementById("statBlocks");
const statLevelEl = document.getElementById("statLevel");

const gameMissionTextEl =
  document.getElementById("gameMissionText");

const particlesEl =
  document.getElementById("particles");

const toastContainer =
  document.getElementById("toastContainer");

const playButton =
  document.getElementById("playButton");

const missionsButton =
  document.getElementById("missionsButton");

const statsButton =
  document.getElementById("statsButton");

const howButton =
  document.getElementById("howButton");

const backButton =
  document.getElementById("backButton");

const howClose =
  document.getElementById("howClose");

const missionsClose =
  document.getElementById("missionsClose");

const statsClose =
  document.getElementById("statsClose");

const restartButton =
  document.getElementById("restartButton");

const menuButton =
  document.getElementById("menuButton");

const gameOverMenu =
  document.getElementById("gameOverMenu");

const pauseButton =
  document.getElementById("pauseButton");

const resumeButton =
  document.getElementById("resumeButton");

const pauseMenuButton =
  document.getElementById("pauseMenuButton");

const soundButtonMenu =
  document.getElementById("soundButtonMenu");

const soundButtonGame =
  document.getElementById("soundButtonGame");


/* =========================================================
   DATI DI GIOCO
========================================================= */

let board = [];

let pieces = [];

let score = 0;

let combo = 0;

let gameRunning = false;

let paused = false;

let dragging = null;

let ghost = null;

let dragPointerId = null;

let messageTimer = null;

let audioContext = null;


/* =========================================================
   SALVATAGGIO
========================================================= */

const SAVE_KEY = "gemBlastUltimateSave";


const defaultSave = {

  best: 0,

  coins: 0,

  xp: 0,

  level: 1,

  games: 0,

  lines: 0,

  blocks: 0,

  maxCombo: 0,

  sound: true,

  missions: {

    lines: 0,

    blocks: 0,

    score: 0

  },

  claimed: {

    lines: false,

    blocks: false,

    score: false

  }

};


let save = loadSave();


function loadSave() {

  try {

    const stored =
      localStorage.getItem(SAVE_KEY);

    if (!stored) {

      return JSON.parse(
        JSON.stringify(defaultSave)
      );

    }

    const parsed = JSON.parse(stored);

    return {

      ...JSON.parse(
        JSON.stringify(defaultSave)
      ),

      ...parsed,

      missions: {
        ...defaultSave.missions,
        ...(parsed.missions || {})
      },

      claimed: {
        ...defaultSave.claimed,
        ...(parsed.claimed || {})
      }

    };

  } catch (error) {

    return JSON.parse(
      JSON.stringify(defaultSave)
    );

  }

}


function saveGame() {

  try {

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(save)
    );

  } catch (error) {

    /* Salvataggio non disponibile */
  }

}


/* =========================================================
   COLORI E FORME
========================================================= */

const colors = [

  "purple",
  "blue",
  "pink",
  "green",
  "yellow",
  "orange",
  "red"

];


const SHAPES = [

  [[1]],

  [[1,1]],

  [[1],[1]],

  [[1,1,1]],

  [[1],[1],[1]],

  [[1,1],[1,1]],

  [[1,1,1],[0,1,0]],

  [[1,0],[1,1]],

  [[0,1],[1,1]],

  [[1,1],[1,0]],

  [[1,1],[0,1]],

  [[1,1,1],[1,0,0]],

  [[1,1,1],[0,0,1]],

  [[1,1],[1,1],[1,1]],

  [[1,1,1],[1,1,1]]

];


/* =========================================================
   SCHERMATE
========================================================= */

function showScreen(screen) {

  menuEl.classList.remove("active");

  howToEl.classList.remove("active");

  missionsEl.classList.remove("active");

  statsEl.classList.remove("active");

  gameEl.classList.remove("active");

  screen.classList.add("active");

}


function closeOverlays() {

  pauseOverlay.classList.remove("active");

  gameOverEl.classList.remove("active");

}


/* =========================================================
   LIVELLI / XP
========================================================= */

function xpNeededForNextLevel() {

  return 100 + (save.level - 1) * 50;

}


function addXP(amount) {

  if (amount <= 0) return;

  save.xp += amount;

  let leveledUp = false;

  while (
    save.xp >= xpNeededForNextLevel()
  ) {

    save.xp -= xpNeededForNextLevel();

    save.level++;

    leveledUp = true;

    save.coins += 25;

  }

  if (leveledUp) {

    showToast(
      `⭐ LIVELLO ${save.level}! +25 🪙`
    );

    playSound(820, .2);

    vibrate(60);

  }

  updateAllUI();

  saveGame();

}


function getXpProgress() {

  const needed =
    xpNeededForNextLevel();

  return Math.min(
    100,
    (save.xp / needed) * 100
  );

}


/* =========================================================
   UI GENERALE
========================================================= */

function updateAllUI() {

  menuBestEl.textContent =
    save.best;

  menuLevelEl.textContent =
    save.level;

  menuCoinsEl.textContent =
    save.coins;

  menuXpEl.textContent =
    save.xp;

  menuXpFillEl.style.width =
    getXpProgress() + "%";

  bestEl.textContent =
    save.best;

  gameLevelEl.textContent =
    save.level;

  gameCoinsEl.textContent =
    save.coins;

  gameXpFillEl.style.width =
    getXpProgress() + "%";

  gameXpTextEl.textContent =
    `${save.xp} / ${xpNeededForNextLevel()} XP`;

  statBestEl.textContent =
    save.best;

  statGamesEl.textContent =
    save.games;

  statLinesEl.textContent =
    save.lines;

  statComboEl.textContent =
    save.maxCombo;

  statBlocksEl.textContent =
    save.blocks;

  statLevelEl.textContent =
    save.level;

  updateSoundButtons();

  updateMissionList();

  updateGameMission();

  updateScore();

}


function updateScore() {

  scoreEl.textContent =
    score;

  bestEl.textContent =
    save.best;

  comboEl.textContent =
    combo;

  gameCoinsEl.textContent =
    save.coins;

}


/* =========================================================
   MENU
========================================================= */

function startGame() {

  closeOverlays();

  gameRunning = true;

  paused = false;

  score = 0;

  combo = 0;

  board =
    createEmptyBoard();

  save.games++;

  saveGame();

  updateAllUI();

  showScreen(gameEl);

  generatePieces();

  renderBoard();

  renderPieces();

  showMessage(
    "Buona fortuna! 💎",
    1000
  );

}


function returnToMenu() {

  gameRunning = false;

  paused = false;

  dragging = null;

  dragPointerId = null;

  removeGhost();

  clearPreview();

  closeOverlays();

  showScreen(menuEl);

  updateAllUI();

}


/* =========================================================
   BOARD
========================================================= */

function createEmptyBoard() {

  return Array.from(
    { length: SIZE },
    () => Array(SIZE).fill(null)
  );

}


/* =========================================================
   PEZZI
========================================================= */

function generatePieces() {

  pieces = [];

  for (let i = 0; i < 3; i++) {

    pieces.push(
      createRandomPiece()
    );

  }

}


function createRandomPiece() {

  const original =
    SHAPES[
      Math.floor(
        Math.random() * SHAPES.length
      )
    ];

  const shape =
    original.map(row => [...row]);

  const color =
    colors[
      Math.floor(
        Math.random() * colors.length
      )
    ];

  let special = null;

  const chance =
    Math.random();

  if (chance < .06) {

    special = "bomb";

  } else if (chance < .11) {

    special = "gem";

  }

  return {

    shape,

    color,

    special

  };

}


/* =========================================================
   RENDER BOARD
========================================================= */

function renderBoard() {

  boardEl.innerHTML = "";

  for (
    let y = 0;
    y < SIZE;
    y++
  ) {

    for (
      let x = 0;
      x < SIZE;
      x++
    ) {

      const cell =
        document.createElement("div");

      cell.className = "cell";

      const value =
        board[y][x];

      if (value) {

        cell.classList.add(
          "filled",
          `block-${value.color}`
        );

        if (
          value.special === "bomb" ||
          value.special === "gem"
        ) {

          cell.textContent =
            value.special === "bomb"
              ? "💣"
              : "💎";

          cell.style.fontSize =
            "clamp(14px,4vw,24px)";

        }

      }

      boardEl.appendChild(cell);

    }

  }

}


/* =========================================================
   RENDER PEZZI
========================================================= */

function renderPieces() {

  piecesEl.innerHTML = "";

  pieces.forEach(
    (piece, index) => {

      if (!piece) return;

      const container =
        document.createElement("div");

      container.className =
        "piece";

      const rows =
        piece.shape.length;

      const cols =
        piece.shape[0].length;

      const grid =
        document.createElement("div");

      grid.className =
        "miniGrid";

      grid.style.gridTemplateColumns =
        `repeat(${cols},20px)`;

      grid.style.gridTemplateRows =
        `repeat(${rows},20px)`;

      piece.shape.forEach(
        (row, y) => {

          row.forEach(
            (value, x) => {

              const block =
                document.createElement("div");

              if (value) {

                block.className =
                  `miniBlock block-${piece.color}`;

                if (
                  piece.special &&
                  x === 0 &&
                  y === 0
                ) {

                  block.textContent =
                    piece.special === "bomb"
                      ? "💣"
                      : "💎";

                }

              } else {

                block.style.visibility =
                  "hidden";

              }

              grid.appendChild(block);

            }
          );

        }
      );

      container.appendChild(grid);

      container.addEventListener(
        "pointerdown",
        event => {

          startDrag(
            event,
            index,
            container
          );

        }
      );

      piecesEl.appendChild(
        container
      );

    }
  );

}


/* =========================================================
   DRAG
========================================================= */

function startDrag(
  event,
  index,
  element
) {

  if (!gameRunning || paused)
    return;

  const piece =
    pieces[index];

  if (!piece)
    return;

  event.preventDefault();

  dragging = {

    index,

    piece,

    element,

    pointerId:
      event.pointerId,

    grabX: 0,

    grabY: 0

  };

  dragPointerId =
    event.pointerId;

  element.classList.add(
    "selected"
  );

  try {

    element.setPointerCapture(
      event.pointerId
    );

  } catch (error) {}

  createGhost(piece);

  calculateGrabOffset(
    event.clientX,
    event.clientY,
    element
  );

  updateDrag(
    event.clientX,
    event.clientY
  );

  element.addEventListener(
    "pointermove",
    handlePointerMove
  );

  element.addEventListener(
    "pointerup",
    handlePointerUp
  );

  element.addEventListener(
    "pointercancel",
    handlePointerUp
  );

}


function calculateGrabOffset(
  clientX,
  clientY,
  element
) {

  if (!dragging)
    return;

  const rect =
    element.getBoundingClientRect();

  const piece =
    dragging.piece;

  const cols =
    piece.shape[0].length;

  const rows =
    piece.shape.length;

  const cellWidth =
    rect.width / cols;

  const cellHeight =
    rect.height / rows;

  let localX =
    clientX - rect.left;

  let localY =
    clientY - rect.top;

  localX =
    Math.max(
      0,
      Math.min(
        rect.width - .01,
        localX
      )
    );

  localY =
    Math.max(
      0,
      Math.min(
        rect.height - .01,
        localY
      )
    );

  let cellX =
    Math.floor(
      localX / cellWidth
    );

  let cellY =
    Math.floor(
      localY / cellHeight
    );

  if (
    !piece.shape[cellY] ||
    !piece.shape[cellY][cellX]
  ) {

    const filled = [];

    for (
      let y = 0;
      y < rows;
      y++
    ) {

      for (
        let x = 0;
        x < cols;
        x++
      ) {

        if (
          piece.shape[y][x]
        ) {

          const dx =
            x -
            localX / cellWidth;

          const dy =
            y -
            localY / cellHeight;

          filled.push({

            x,

            y,

            distance:
              dx * dx +
              dy * dy

          });

        }

      }

    }

    filled.sort(
      (a,b) =>
        a.distance -
        b.distance
    );

    if (filled.length) {

      cellX =
        filled[0].x;

      cellY =
        filled[0].y;

    }

  }

  dragging.grabX =
    cellX;

  dragging.grabY =
    cellY;

}


function handlePointerMove(event) {

  if (!dragging)
    return;

  if (
    event.pointerId !==
    dragPointerId
  )
    return;

  event.preventDefault();

  updateDrag(
    event.clientX,
    event.clientY
  );

}


function updateDrag(
  clientX,
  clientY
) {

  if (!dragging)
    return;

  moveGhost(
    clientX,
    clientY
  );

  const position =
    getDropPosition(
      clientX,
      clientY
    );

  renderPreview(
    position.x,
    position.y,
    dragging.piece
  );

}


function getDropPosition(
  clientX,
  clientY
) {

  const rect =
    boardEl.getBoundingClientRect();

  const cellWidth =
    rect.width / SIZE;

  const cellHeight =
    rect.height / SIZE;

  const fingerX =
    Math.floor(
      (clientX - rect.left) /
      cellWidth
    );

  const fingerY =
    Math.floor(
      (clientY - rect.top) /
      cellHeight
    );

  return {

    x:
      fingerX -
      dragging.grabX,

    y:
      fingerY -
      dragging.grabY

  };

}


/* =========================================================
   PREVIEW
========================================================= */

function renderPreview(
  startX,
  startY,
  piece
) {

  clearPreview();

  const valid =
    canPlace(
      piece,
      startX,
      startY
    );

  const cells =
    boardEl.querySelectorAll(
      ".cell"
    );

  piece.shape.forEach(
    (row, y) => {

      row.forEach(
        (value, x) => {

          if (!value)
            return;

          const boardX =
            startX + x;

          const boardY =
            startY + y;

          if (
            boardX < 0 ||
            boardX >= SIZE ||
            boardY < 0 ||
            boardY >= SIZE
          )
            return;

          const index =
            boardY * SIZE +
            boardX;

          cells[index].classList.add(
            valid
              ? "preview"
              : "previewBad"
          );

        }
      );

    }
  );

}


function clearPreview() {

  boardEl
    .querySelectorAll(".cell")
    .forEach(cell => {

      cell.classList.remove(
        "preview",
        "previewBad"
      );

    });

}


/* =========================================================
   POSIZIONAMENTO
========================================================= */

function canPlace(
  piece,
  startX,
  startY
) {

  if (
    !piece ||
    !piece.shape ||
    !Array.isArray(
      piece.shape
    )
  )
    return false;

  for (
    let y = 0;
    y < piece.shape.length;
    y++
  ) {

    for (
      let x = 0;
      x < piece.shape[y].length;
      x++
    ) {

      if (
        !piece.shape[y][x]
      )
        continue;

      const boardX =
        startX + x;

      const boardY =
        startY + y;

      if (
        boardX < 0 ||
        boardX >= SIZE ||
        boardY < 0 ||
        boardY >= SIZE
      )
        return false;

      if (
        board[boardY][boardX]
      )
        return false;

    }

  }

  return true;

}


function placePiece(
  piece,
  startX,
  startY
) {

  let placed = 0;

  piece.shape.forEach(
    (row, y) => {

      row.forEach(
        (value, x) => {

          if (!value)
            return;

          const boardX =
            startX + x;

          const boardY =
            startY + y;

          board[boardY][boardX] = {

            color:
              piece.color,

            special:
              piece.special &&
              x === 0 &&
              y === 0
                ? piece.special
                : null

          };

          placed++;

        }
      );

    }
  );

  save.blocks += placed;

  save.missions.blocks += placed;

  addScore(
    placed * 5
  );

  addXP(
    placed * 2
  );

  playSound(
    260 + placed * 20,
    .07
  );

  vibrate(12);

  renderBoard();

  const cleared =
    clearCompletedLines();

  if (!cleared) {

    combo = 0;

    updateScore();

  }

}


/* =========================================================
   POINTER UP
========================================================= */

function handlePointerUp(
  event
) {

  if (!dragging)
    return;

  if (
    event.pointerId !==
    dragPointerId
  )
    return;

  event.preventDefault();

  const position =
    getDropPosition(
      event.clientX,
      event.clientY
    );

  const piece =
    dragging.piece;

  const element =
    dragging.element;

  const index =
    dragging.index;

  element.classList.remove(
    "selected"
  );

  try {

    element.releasePointerCapture(
      event.pointerId
    );

  } catch (error) {}

  element.removeEventListener(
    "pointermove",
    handlePointerMove
  );

  element.removeEventListener(
    "pointerup",
    handlePointerUp
  );

  element.removeEventListener(
    "pointercancel",
    handlePointerUp
  );

  removeGhost();

  clearPreview();

  if (
    canPlace(
      piece,
      position.x,
      position.y
    )
  ) {

    placePiece(
      piece,
      position.x,
      position.y
    );

    pieces[index] =
      null;

    renderPieces();

    if (
      pieces.every(
        item => item === null
      )
    ) {

      generatePieces();

      renderPieces();

    }

    checkGameOver();

  } else {

    showMessage(
      "Qui non entra! 😅",
      800
    );

  }

  dragging = null;

  dragPointerId = null;

}


/* =========================================================
   LINEE
========================================================= */

function clearCompletedLines() {

  const rowsToClear = [];

  const colsToClear = [];


  /* RIGHE */

  for (
    let y = 0;
    y < SIZE;
    y++
  ) {

    let complete = true;

    for (
      let x = 0;
      x < SIZE;
      x++
    ) {

      if (!board[y][x]) {

        complete = false;

        break;

      }

    }

    if (complete)
      rowsToClear.push(y);

  }


  /* COLONNE */

  for (
    let x = 0;
    x < SIZE;
    x++
  ) {

    let complete = true;

    for (
      let y = 0;
      y < SIZE;
      y++
    ) {

      if (!board[y][x]) {

        complete = false;

        break;

      }

    }

    if (complete)
      colsToClear.push(x);

  }


  if (
    rowsToClear.length === 0 &&
    colsToClear.length === 0
  ) {

    return false;

  }


  combo++;

  if (
    combo >
    save.maxCombo
  ) {

    save.maxCombo =
      combo;

  }


  const total =
    rowsToClear.length +
    colsToClear.length;


  const multiplier =
    Math.max(
      1,
      combo
    );


  const gained =
    total *
    100 *
    multiplier;


  addScore(gained);

  addXP(
    total * 15
  );


  save.lines += total;

  save.missions.lines +=
    total;


  /* MISSIONE SCORE */

  save.missions.score =
    Math.max(
      save.missions.score,
      score
    );


  /* SPECIALI */

  const specialCells = [];


  for (
    let y = 0;
    y < SIZE;
    y++
  ) {

    for (
      let x = 0;
      x < SIZE;
      x++
    ) {

      const value =
        board[y][x];

      if (
        value &&
        value.special &&
        (
          rowsToClear.includes(y) ||
          colsToClear.includes(x)
        )
      ) {

        specialCells.push({

          x,

          y,

          special:
            value.special,

          color:
            value.color

        });

      }

    }

  }


  /* CANCELLA RIGHE */

  for (
    const y of rowsToClear
  ) {

    for (
      let x = 0;
      x < SIZE;
      x++
    ) {

      board[y][x] =
        null;

    }

  }


  /* CANCELLA COLONNE */

  for (
    const x of colsToClear
  ) {

    for (
      let y = 0;
      y < SIZE;
      y++
    ) {

      board[y][x] =
        null;

    }

  }


  /* ATTIVA SPECIALI */

  for (
    const special
    of specialCells
  ) {

    if (
      special.special ===
      "bomb"
    ) {

      activateBomb(
        special.x,
        special.y
      );

    }

    if (
      special.special ===
      "gem"
    ) {

      activateGem(
        special.x,
        special.y,
        special.color
      );

    }

  }


  renderBoard();

  createParticles();

  playSound(
    500 +
      combo * 70,
    .16
  );

  vibrate(
    Math.min(
      100,
      20 +
        combo * 12
    )
  );


  if (
    combo >= 2
  ) {

    showMessage(
      `🔥 COMBO x${combo}! +${gained}`,
      1200
    );

  } else {

    showMessage(
      total === 1
        ? `✨ LINEA! +${gained}`
        : `✨ ${total} LINEE! +${gained}`,
      1000
    );

  }


  updateAllUI();

  saveGame();

  return true;

}


/* =========================================================
   BOMBA
========================================================= */

function activateBomb(
  centerX,
  centerY
) {

  let destroyed = 0;

  for (
    let y =
      centerY - 1;
    y <=
      centerY + 1;
    y++
  ) {

    for (
      let x =
        centerX - 1;
      x <=
        centerX + 1;
      x++
    ) {

      if (
        x >= 0 &&
        x < SIZE &&
        y >= 0 &&
        y < SIZE
      ) {

        if (
          board[y][x]
        ) {

          board[y][x] =
            null;

          destroyed++;

        }

      }

    }

  }

  addScore(
    destroyed * 10
  );

  addXP(
    destroyed
  );

  createExplosionParticles(
    centerX,
    centerY
  );

  playSound(
    110,
    .22
  );

  vibrate(45);

}


/* =========================================================
   GEMMA SPECIALE
========================================================= */

function activateGem(
  centerX,
  centerY,
  color
) {

  let destroyed = 0;

  for (
    let y = 0;
    y < SIZE;
    y++
  ) {

    for (
      let x = 0;
      x < SIZE;
      x++
    ) {

      if (
        board[y][x] &&
        board[y][x].color ===
          color
      ) {

        board[y][x] =
          null;

        destroyed++;

      }

    }

  }

  addScore(
    destroyed * 15
  );

  addXP(
    destroyed * 2
  );

  createExplosionParticles(
    centerX,
    centerY
  );

  playSound(
    760,
    .2
  );

  vibrate(50);

}


/* =========================================================
   GAME OVER
========================================================= */

function checkGameOver() {

  const availablePieces =
    pieces.filter(
      piece =>
        piece !== null &&
        typeof piece ===
          "object" &&
        Array.isArray(
          piece.shape
        )
    );


  if (
    availablePieces.length === 0
  ) {

    generatePieces();

    renderPieces();

    return;

  }


  for (
    const piece
    of availablePieces
  ) {

    if (
      !piece ||
      !piece.shape
    )
      continue;


    for (
      let y = 0;
      y < SIZE;
      y++
    ) {

      for (
        let x = 0;
        x < SIZE;
        x++
      ) {

        if (
          canPlace(
            piece,
            x,
            y
          )
        ) {

          return;

        }

      }

    }

  }


  gameRunning = false;

  paused = false;

  finalScoreEl.textContent =
    score;

  finalComboEl.textContent =
    save.maxCombo;

  finalXpEl.textContent =
    save.xp;

  finalCoinsEl.textContent =
    save.coins;


  const isRecord =
    score > save.best;


  if (isRecord) {

    save.best =
      score;

    newRecordEl.style.display =
      "block";

    playSound(
      950,
      .35
    );

  } else {

    newRecordEl.style.display =
      "none";

    playSound(
      90,
      .4
    );

  }


  saveGame();

  updateAllUI();

  gameOverEl.classList.add(
    "active"
  );

  vibrate(100);

}


/* =========================================================
   GHOST
========================================================= */

function createGhost(
  piece
) {

  removeGhost();

  ghost =
    document.createElement(
      "div"
    );

  ghost.className =
    "dragGhost";

  const grid =
    document.createElement(
      "div"
    );

  grid.className =
    "ghostGrid";

  const rows =
    piece.shape.length;

  const cols =
    piece.shape[0].length;

  grid.style.gridTemplateColumns =
    `repeat(${cols},36px)`;

  grid.style.gridTemplateRows =
    `repeat(${rows},36px)`;


  piece.shape.forEach(
    (row, y) => {

      row.forEach(
        (value, x) => {

          const block =
            document.createElement(
              "div"
            );

          if (value) {

            block.className =
              `ghostBlock block-${piece.color}`;

            if (
              piece.special &&
              x === 0 &&
              y === 0
            ) {

              block.textContent =
                piece.special ===
                "bomb"
                  ? "💣"
                  : "💎";

              block.style.fontSize =
                "20px";

            }

          } else {

            block.style.visibility =
              "hidden";

          }

          grid.appendChild(
            block
          );

        }
      );

    }
  );


  ghost.appendChild(
    grid
  );

  document.body.appendChild(
    ghost
  );

}


function moveGhost(
  clientX,
  clientY
) {

  if (
    !ghost ||
    !dragging
  )
    return;

  const cellSize =
    40;

  const offsetX =
    dragging.grabX *
    cellSize;

  const offsetY =
    dragging.grabY *
    cellSize;

  ghost.style.left =
    (
      clientX -
      offsetX -
      18
    ) + "px";

  ghost.style.top =
    (
      clientY -
      offsetY -
      18
    ) + "px";

}


function removeGhost() {

  if (ghost) {

    ghost.remove();

    ghost = null;

  }

}


/* =========================================================
   PUNTEGGIO
========================================================= */

function addScore(
  amount
) {

  if (amount <= 0)
    return;

  score += amount;

  save.missions.score =
    Math.max(
      save.missions.score,
      score
    );

  if (
    score >
    save.best
  ) {

    save.best =
      score;

  }

  updateScore();

  updateMissionList();

  saveGame();

}


/* =========================================================
   MISSIONI
========================================================= */

function getMissionData() {

  return [

    {

      id: "lines",

      title:
        "💥 Distruttore",

      description:
        "Completa 10 linee",

      target: 10,

      value:
        save.missions.lines,

      reward: 50,

      type: "lines"

    },

    {

      id: "blocks",

      title:
        "🧩 Costruttore",

      description:
        "Posiziona 100 blocchi",

      target: 100,

      value:
        save.missions.blocks,

      reward: 75,

      type: "blocks"

    },

    {

      id: "score",

      title:
        "🏆 Cacciatore di punti",

      description:
        "Raggiungi 5000 punti",

      target: 5000,

      value:
        save.missions.score,

      reward: 100,

      type: "score"

    }

  ];

}


function updateMissionList() {

  const missions =
    getMissionData();

  missionsListEl.innerHTML = "";

  missions.forEach(
    mission => {

      const completed =
        mission.value >=
        mission.target;

      const claimed =
        save.claimed[
          mission.type
        ];


      const wrapper =
        document.createElement(
          "div"
        );

      wrapper.className =
        "mission" +
        (
          completed
            ? " completed"
            : ""
        );


      const progress =
        Math.min(
          100,
          (
            mission.value /
            mission.target
          ) * 100
        );


      wrapper.innerHTML = `

        <div class="missionTop">

          <div class="missionTitle">
            ${mission.title}
          </div>

          <div class="missionReward">
            🪙 ${mission.reward}
          </div>

        </div>

        <div class="missionDescription">
          ${mission.description}
        </div>

        <div class="missionBar">

          <div
            style="width:${progress}%"
          ></div>

        </div>

        <div class="missionBottom">

          <span>
            ${Math.min(
              mission.value,
              mission.target
            )}
            /
            ${mission.target}
          </span>

          ${
            completed
              ? claimed
                ? "RICOMPENSA RITIRATA ✓"
                : ""
              : ""
          }

        </div>

      `;


      if (
        completed &&
        !claimed
      ) {

        const button =
          document.createElement(
            "button"
          );

        button.className =
          "claimButton";

        button.textContent =
          `RITIRA +${mission.reward} 🪙`;

        button.addEventListener(
          "click",
          () => {

            save.coins +=
              mission.reward;

            save.claimed[
              mission.type
            ] = true;

            saveGame();

            updateAllUI();

            showToast(
              `🎁 +${mission.reward} monete!`
            );

            playSound(
              700,
              .18
            );

          }
        );

        wrapper.appendChild(
          button
        );

      }


      missionsListEl.appendChild(
        wrapper
      );

    }
  );

}


function updateGameMission() {

  const missions =
    getMissionData();

  const active =
    missions.find(
      mission =>
        save.claimed[
          mission.type
        ] === false
    );


  if (!active) {

    gameMissionTextEl.textContent =
      "🎁 Tutte le missioni completate!";

    return;

  }


  gameMissionTextEl.textContent =
    `${active.description}: ${Math.min(
      active.value,
      active.target
    )}/${active.target}`;

}


/* =========================================================
   STATISTICHE
========================================================= */

function updateStats() {

  updateAllUI();

}


/* =========================================================
   AUDIO
========================================================= */

function getAudioContext() {

  if (!save.sound)
    return null;

  if (!audioContext) {

    const AudioCtx =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioCtx)
      return null;

    audioContext =
      new AudioCtx();

  }


  if (
    audioContext.state ===
    "suspended"
  ) {

    audioContext.resume();

  }


  return audioContext;

}


function playSound(
  frequency,
  duration
) {

  if (!save.sound)
    return;

  const ctx =
    getAudioContext();

  if (!ctx)
    return;


  const oscillator =
    ctx.createOscillator();

  const gain =
    ctx.createGain();


  oscillator.type =
    "sine";

  oscillator.frequency.value =
    frequency;


  gain.gain.setValueAtTime(
    .0001,
    ctx.currentTime
  );


  gain.gain.exponentialRampToValueAtTime(
    .1,
    ctx.currentTime + .01
  );


  gain.gain.exponentialRampToValueAtTime(
    .0001,
    ctx.currentTime + duration
  );


  oscillator.connect(
    gain
  );

  gain.connect(
    ctx.destination
  );


  oscillator.start();

  oscillator.stop(
    ctx.currentTime +
    duration
  );

}


function toggleSound() {

  save.sound =
    !save.sound;

  saveGame();

  updateSoundButtons();

  if (save.sound) {

    getAudioContext();

    playSound(
      600,
      .1
    );

  }

}


function updateSoundButtons() {

  const icon =
    save.sound
      ? "🔊"
      : "🔇";

  soundButtonMenu.textContent =
    icon;

  soundButtonGame.textContent =
    save.sound
      ? "🔊 AUDIO"
      : "🔇 AUDIO";

}


/* =========================================================
   VIBRAZIONE
========================================================= */

function vibrate(
  duration = 20
) {

  if (
    navigator.vibrate
  ) {

    navigator.vibrate(
      duration
    );

  }

}


/* =========================================================
   MESSAGGI
========================================================= */

function showMessage(
  text,
  duration = 1000
) {

  clearTimeout(
    messageTimer
  );

  messageEl.textContent =
    text;

  messageEl.classList.add(
    "show"
  );

  messageTimer =
    setTimeout(
      () => {

        messageEl.classList.remove(
          "show"
        );

      },
      duration
    );

}


function showToast(
  text
) {

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    "toast";

  toast.textContent =
    text;

  toastContainer.appendChild(
    toast
  );

  requestAnimationFrame(
    () => {

      toast.classList.add(
        "show"
      );

    }
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );

      setTimeout(
        () => toast.remove(),
        250
      );

    },
    1800
  );

}


/* =========================================================
   PARTICELLE
========================================================= */

function createParticles() {

  for (
    let i = 0;
    i < 28;
    i++
  ) {

    const particle =
      document.createElement(
        "div"
      );

    particle.className =
      "particle";

    particle.style.left =
      `${40 + Math.random() * 20}%`;

    particle.style.top =
      `${38 + Math.random() * 24}%`;

    particle.style.setProperty(
      "--dx",
      `${(Math.random()-.5)*220}px`
    );

    particle.style.setProperty(
      "--dy",
      `${(Math.random()-.5)*220}px`
    );

    particlesEl.appendChild(
      particle
    );

    setTimeout(
      () => particle.remove(),
      700
    );

  }

}


function createExplosionParticles(
  x,
  y
) {

  const rect =
    boardEl.getBoundingClientRect();

  const cellWidth =
    rect.width / SIZE;

  const cellHeight =
    rect.height / SIZE;

  const centerX =
    rect.left +
    x * cellWidth +
    cellWidth / 2;

  const centerY =
    rect.top +
    y * cellHeight +
    cellHeight / 2;


  for (
    let i = 0;
    i < 35;
    i++
  ) {

    const particle =
      document.createElement(
        "div"
      );

    particle.className =
      "particle";

    particle.style.left =
      `${centerX}px`;

    particle.style.top =
      `${centerY}px`;

    particle.style.setProperty(
      "--dx",
      `${(Math.random()-.5)*260}px`
    );

    particle.style.setProperty(
      "--dy",
      `${(Math.random()-.5)*260}px`
    );

    particlesEl.appendChild(
      particle
    );

    setTimeout(
      () => particle.remove(),
      700
    );

  }

}


/* =========================================================
   PAUSA
========================================================= */

function pauseGame() {

  if (!gameRunning)
    return;

  paused = true;

  pauseOverlay.classList.add(
    "active"
  );

}


function resumeGame() {

  paused = false;

  pauseOverlay.classList.remove(
    "active"
  );

}


/* =========================================================
   EVENTI MENU
========================================================= */

playButton.addEventListener(
  "click",
  () => {

    getAudioContext();

    vibrate(15);

    startGame();

  }
);


missionsButton.addEventListener(
  "click",
  () => {

    updateMissionList();

    showScreen(
      missionsEl
    );

  }
);


statsButton.addEventListener(
  "click",
  () => {

    updateStats();

    showScreen(
      statsEl
    );

  }
);


howButton.addEventListener(
  "click",
  () => {

    showScreen(
      howToEl
    );

  }
);


backButton.addEventListener(
  "click",
  () => {

    showScreen(
      menuEl
    );

  }
);


howClose.addEventListener(
  "click",
  () => {

    showScreen(
      menuEl
    );

  }
);


missionsClose.addEventListener(
  "click",
  () => {

    showScreen(
      menuEl
    );

  }
);


statsClose.addEventListener(
  "click",
  () => {

    showScreen(
      menuEl
    );

  }
);


/* =========================================================
   EVENTI GAME
========================================================= */

menuButton.addEventListener(
  "click",
  () => {

    returnToMenu();

  }
);


pauseButton.addEventListener(
  "click",
  () => {

    pauseGame();

  }
);


resumeButton.addEventListener(
  "click",
  () => {

    resumeGame();

  }
);


pauseMenuButton.addEventListener(
  "click",
  () => {

    returnToMenu();

  }
);


restartButton.addEventListener(
  "click",
  () => {

    vibrate(15);

    startGame();

  }
);


gameOverMenu.addEventListener(
  "click",
  () => {

    returnToMenu();

  }
);


soundButtonMenu.addEventListener(
  "click",
  () => {

    toggleSound();

  }
);


soundButtonGame.addEventListener(
  "click",
  () => {

    toggleSound();

  }
);


/* =========================================================
   TOUCH MOBILE
========================================================= */

document.addEventListener(
  "touchmove",
  event => {

    if (dragging) {

      event.preventDefault();

    }

  },
  {
    passive: false
  }
);


/* =========================================================
   AVVIO
========================================================= */

updateAllUI();

showScreen(
  menuEl
);