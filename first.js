"use strict";

/* =========================================================
   MINI GAMES HUB
   BUILT BY ANAND
   50 GAMES × 20 LEVELS
========================================================= */

const TOTAL_LEVELS = 20;

const STORAGE = {
    name: "anand_player_name",
    scores: "anand_game_scores",
    feedback: "anand_feedback",
    streak: "anand_streak",
    lastVisit: "anand_last_visit",
    music: "anand_music"
};

let playerName = "";
let currentGame = null;
let currentLevel = 1;
let currentScore = 0;
let currentCleanup = null;
let levelLocked = false;
let introTimer = null;
let toastTimer = null;
let selectedCategory = "all";
let selectedRating = 0;

let musicEnabled =
    localStorage.getItem(STORAGE.music) !== "off";


/* =========================================================
   HELPERS
========================================================= */

const $ = id => document.getElementById(id);

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    const a = [...array];

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function todayKey() {
    const d = new Date();

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
}


/* =========================================================
   STORAGE
========================================================= */

function getScores() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE.scores) || "[]"
        );
    } catch {
        return [];
    }
}

function saveScore(game, score, won) {
    if (!game)
        return;

    const scores = getScores();

    scores.unshift({
        playerName: playerName || "Player",
        gameId: game.id,
        gameName: game.name,
        score,
        won,
        date: new Date().toLocaleString()
    });

    localStorage.setItem(
        STORAGE.scores,
        JSON.stringify(scores.slice(0, 100))
    );
}

function getFeedback() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE.feedback) || "[]"
        );
    } catch {
        return [];
    }
}

function saveFeedback(rating, text) {
    const feedback = getFeedback();

    feedback.unshift({
        playerName: playerName || "Player",
        rating,
        text,
        gameId: currentGame ? currentGame.id : null,
        gameName: currentGame ? currentGame.name : "Game Hub",
        date: new Date().toLocaleString()
    });

    localStorage.setItem(
        STORAGE.feedback,
        JSON.stringify(feedback.slice(0, 100))
    );
}


/* =========================================================
   STREAK
========================================================= */

function updateStreak() {
    const today = todayKey();

    const previous =
        localStorage.getItem(STORAGE.lastVisit);

    let streak =
        Number(
            localStorage.getItem(STORAGE.streak) || 0
        );

    if (!previous) {
        streak = 1;
    } else if (previous === today) {
        streak = Math.max(streak, 1);
    } else {
        const oldDate =
            new Date(previous + "T00:00:00");

        const newDate =
            new Date(today + "T00:00:00");

        const difference =
            Math.round(
                (newDate - oldDate) / 86400000
            );

        if (difference === 1)
            streak++;
        else if (difference > 1)
            streak = 1;
        else
            streak = Math.max(streak, 1);
    }

    localStorage.setItem(
        STORAGE.streak,
        streak
    );

    localStorage.setItem(
        STORAGE.lastVisit,
        today
    );

    return streak;
}


/* =========================================================
   HOME STATS
========================================================= */

function renderHomeStats() {
    const scores = getScores();

    const played = scores.length;

    const wins =
        scores.filter(x => x.won).length;

    const best =
        scores.length
            ? Math.max(
                ...scores.map(
                    x => Number(x.score) || 0
                )
            )
            : 0;

    const streak =
        Number(
            localStorage.getItem(STORAGE.streak) || 0
        );

    if ($("totalGamesStat"))
        $("totalGamesStat").textContent = played;

    if ($("winsStat"))
        $("winsStat").textContent = wins;

    if ($("bestScoreStat"))
        $("bestScoreStat").textContent = best;

    if ($("streakStat"))
        $("streakStat").textContent = streak;

    if ($("headerStreak"))
        $("headerStreak").textContent = streak;

    if ($("streakNumber"))
        $("streakNumber").textContent = streak;
}


/* =========================================================
   TOAST
========================================================= */

function showToast(icon, message) {
    clearTimeout(toastTimer);

    if (!$("toast"))
        return;

    $("toastIcon").textContent = icon;
    $("toastMessage").textContent = message;

    $("toast").classList.add("show");

    toastTimer = setTimeout(() => {
        $("toast").classList.remove("show");
    }, 2200);
}


/* =========================================================
   BACKGROUND
========================================================= */

const canvas = $("backgroundCanvas");

let ctx = null;

if (canvas)
    ctx = canvas.getContext("2d");

let particles = [];

function resizeCanvas() {
    if (!canvas)
        return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticles() {
    if (!canvas)
        return;

    particles = [];

    const count =
        Math.min(
            70,
            Math.floor(window.innerWidth / 18)
        );

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.3,
            speed: Math.random() * 0.25 + 0.05
        });
    }
}

function animateBackground() {
    if (!canvas || !ctx)
        return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    for (const p of particles) {
        p.y -= p.speed;

        if (p.y < -5)
            p.y = canvas.height + 5;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.r,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(117,103,255,.35)";

        ctx.fill();
    }

    requestAnimationFrame(
        animateBackground
    );
}

window.addEventListener(
    "resize",
    () => {
        resizeCanvas();
        createParticles();
    }
);

resizeCanvas();
createParticles();
animateBackground();


/* =========================================================
   50 GAME REGISTRY
========================================================= */

const gameNames = [

    ["Guess The Number","🔢","brain","Find the hidden number."],
    ["Rock Paper Scissors","✊","classic","Beat the computer."],
    ["Click Challenge","🖱️","speed","Click as fast as possible."],
    ["Reaction Test","⚡","speed","React at the right moment."],
    ["Memory Cards","🃏","brain","Find matching pairs."],
    ["Tic Tac Toe","⭕","classic","Defeat the computer."],
    ["Math Challenge","➗","brain","Solve increasingly difficult equations."],
    ["Quick Tap","👆","speed","Hit the target before it moves."],
    ["Color Match","🎨","brain","Choose the correct color."],
    ["Number Memory","🧠","brain","Remember the number."],
    ["Odd Or Even","🔵","brain","Identify odd and even."],
    ["Higher Lower","⬆️","brain","Predict the next number."],
    ["Word Scramble","🔤","brain","Unscramble the word."],
    ["Typing Speed","⌨️","speed","Type the sentence correctly."],
    ["Sequence Memory","🔢","brain","Remember the sequence."],
    ["Target Shooter","🎯","speed","Hit the target."],
    ["Catch The Box","📦","speed","Catch the moving box."],
    ["Avoid The Blocks","🚧","arcade","Dodge falling obstacles."],
    ["Snake","🐍","arcade","Eat and grow."],
    ["2048","🔲","brain","Combine numbers."],
    ["Whack A Mole","🔨","speed","Hit the mole."],
    ["Hangman","💀","brain","Guess the hidden word."],
    ["Trivia","❓","brain","Answer general questions."],
    ["True Or False","✅","brain","Decide what is true."],
    ["Capital Quiz","🌎","brain","Name the capital."],
    ["Flag Quiz","🏳️","brain","Identify the country."],
    ["Emoji Guess","😀","brain","Decode the emoji."],
    ["Anagram","🔠","brain","Solve the scrambled letters."],
    ["Quick Math","⚡","speed","Solve calculations."],
    ["Multiplication Rush","✖️","speed","Master multiplication."],
    ["Prime Checker","🔢","brain","Find prime numbers."],
    ["Pattern Puzzle","🧩","brain","Find the missing pattern."],
    ["Lights Out","💡","brain","Turn all lights off."],
    ["Maze","🌀","brain","Find the exit."],
    ["Dots","🔴","speed","Click dots in order."],
    ["Four In A Row","🟡","classic","Connect four."],
    ["Memory Match","🧠","brain","Match hidden symbols."],
    ["Simon Says","🔴","classic","Repeat the sequence."],
    ["Reaction Color","🌈","speed","React to the correct color."],
    ["Fast Fingers","⌨️","speed","Press the requested key."],
    ["Bomb Avoider","💣","arcade","Find safe squares."],
    ["Space Dodge","🚀","arcade","Dodge incoming meteors."],
    ["Meteor Rush","☄️","arcade","Destroy incoming meteors."],
    ["Color Memory","🌈","brain","Remember colors."],
    ["Word Memory","📚","brain","Remember words."],
    ["Mystery Box","🎁","classic","Choose the lucky box."],
    ["Lucky Wheel","🎡","classic","Spin your luck."],
    ["Turbo Car","🏎️","arcade","Drive through hills and obstacles."],
    ["Bike Rush","🏍️","arcade","Ride across dangerous hills."]
];

const games =
    gameNames.map((g, index) => ({
        id: index + 1,
        name: g[0],
        icon: g[1],
        category: g[2],
        description: g[3]
    }));


/* =========================================================
   GAME CARDS
========================================================= */

function cardHTML(game) {
    return `
        <div
            class="game-card"
            data-id="${game.id}"
        >
            <div class="game-card-icon">
                ${game.icon}
            </div>

            <h3>
                ${escapeHTML(game.name)}
            </h3>

            <p>
                ${escapeHTML(game.description)}
            </p>

            <div class="play-label">
                PLAY NOW →
            </div>
        </div>
    `;
}

function renderGames() {
    if (!$("gamesGrid"))
        return;

    const search =
        ($("gameSearch")?.value || "")
            .toLowerCase()
            .trim();

    const filtered =
        games.filter(game => {

            const categoryMatch =
                selectedCategory === "all" ||
                game.category === selectedCategory;

            const searchMatch =
                !search ||
                game.name.toLowerCase().includes(search) ||
                game.description.toLowerCase().includes(search);

            return categoryMatch && searchMatch;
        });

    $("gamesGrid").innerHTML =
        filtered.map(cardHTML).join("");

    document
        .querySelectorAll("#gamesGrid .game-card")
        .forEach(card => {
            card.onclick = () => {
                startGame(
                    Number(card.dataset.id)
                );
            };
        });
}

function renderFeatured() {
    if (!$("featuredGame"))
        return;

    const selected = [
        games[48],
        games[49],
        games[0],
        games[4]
    ];

    $("featuredGame").innerHTML =
        selected.map(cardHTML).join("");

    document
        .querySelectorAll(
            "#featuredGame .game-card"
        )
        .forEach(card => {
            card.onclick = () => {
                startGame(
                    Number(card.dataset.id)
                );
            };
        });
}


/* =========================================================
   CLEANUP
========================================================= */

function cleanupCurrentGame() {

    clearInterval(introTimer);
    introTimer = null;

    if (typeof currentCleanup === "function") {
        try {
            currentCleanup();
        } catch (e) {
            console.warn(
                "Game cleanup:",
                e
            );
        }
    }

    currentCleanup = null;

    cleanupGameOnly();

    if ($("levelTransition"))
        $("levelTransition")
            .classList.remove("show");

    if ($("gameIntro"))
        $("gameIntro")
            .classList.remove(
                "active",
                "hide"
            );

    levelLocked = false;
}

function cleanupGameOnly() {

    if ($("gameContent"))
        $("gameContent").innerHTML = "";

    const stage =
        $("gameStage");

    if (stage) {

        stage.className =
            "game-stage";

        if (
            currentGame &&
            currentGame.name === "Turbo Car"
        ) {
            stage.classList.add(
                "theme-car"
            );
        } else if (
            currentGame &&
            currentGame.name === "Bike Rush"
        ) {
            stage.classList.add(
                "theme-bike"
            );
        } else {
            stage.classList.add(
                "theme-arcade"
            );
        }
    }

    document.body.classList.remove(
        "car-game",
        "bike-game",
        "racing-game"
    );

    document
        .querySelectorAll(
            ".game-runtime-element"
        )
        .forEach(e => e.remove());
}


/* =========================================================
   START GAME
========================================================= */

function startGame(id) {

    const game =
        games.find(
            g => g.id === Number(id)
        );

    if (!game)
        return;

    cleanupCurrentGame();

    currentGame = game;
    currentLevel = 1;
    currentScore = 0;
    levelLocked = false;

    $("gameTitle").textContent =
        game.name;

    $("gameIcon").textContent =
        game.icon;

    $("gameDescription").textContent =
        game.description;

    setGameBackground();

    $("homePage").style.display =
        "none";

    $("gamePage").style.display =
        "block";

    updateHUD();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    playGameIntro(game);
}


/* =========================================================
   GAME BACKGROUND
========================================================= */

function setGameBackground() {

    const stage =
        $("gameStage");

    if (!stage)
        return;

    stage.className =
        "game-stage";

    if (
        currentGame &&
        currentGame.name === "Turbo Car"
    ) {
        stage.classList.add(
            "theme-car"
        );
    }

    else if (
        currentGame &&
        currentGame.name === "Bike Rush"
    ) {
        stage.classList.add(
            "theme-bike"
        );
    }

    else {
        stage.classList.add(
            "theme-arcade"
        );
    }
}


/* =========================================================
   INTRO
========================================================= */

function playGameIntro(game) {

    clearInterval(introTimer);

    cleanupGameOnly();

    $("introIcon").textContent =
        game.icon;

    $("introTitle").textContent =
        game.name;

    $("introDescription").textContent =
        game.description;

    $("introLevel").textContent =
        `LEVEL ${currentLevel} / ${TOTAL_LEVELS}`;

    const intro =
        $("gameIntro");

    intro.classList.remove(
        "hide"
    );

    intro.classList.add(
        "active"
    );

    let count = 3;

    $("introCountdown").textContent =
        count;

    introTimer =
        setInterval(() => {

            count--;

            const counter =
                $("introCountdown");

            counter.style.animation =
                "none";

            void counter.offsetWidth;

            counter.style.animation =
                "countPop .7s cubic-bezier(.2,1.5,.4,1)";

            if (count > 0) {

                counter.textContent =
                    count;

            } else {

                counter.textContent =
                    "GO!";

                clearInterval(
                    introTimer
                );

                setTimeout(() => {

                    intro.classList.add(
                        "hide"
                    );

                    setTimeout(() => {

                        intro.classList.remove(
                            "active",
                            "hide"
                        );

                        launchActualGame();

                    }, 350);

                }, 400);
            }

        }, 700);
}


/* =========================================================
   LAUNCH
========================================================= */

function launchActualGame() {

    cleanupGameOnly();

    setGameBackground();

    if (!currentGame)
        return;

    let cleanup;

    switch (currentGame.id) {

        case 1:
            cleanup = playGuessNumber();
            break;

        case 2:
            cleanup = playRPS();
            break;

        case 3:
        case 8:
        case 16:
        case 17:
        case 21:
        case 34:
        case 36:
        case 39:
        case 40:
        case 41:
            cleanup = playTargetGame();
            break;

        case 4:
        case 37:
            cleanup = playReaction();
            break;

        case 5:
        case 38:
        case 45:
            cleanup = playMemory();
            break;

        case 6:
            cleanup = playTicTacToe();
            break;

        case 7:
        case 29:
        case 30:
            cleanup = playMathGame();
            break;

        case 9:
        case 26:
        case 44:
            cleanup = playColorGame();
            break;

        case 10:
        case 15:
        case 46:
            cleanup = playMemoryNumber();
            break;

        case 11:
            cleanup = playOddEven();
            break;

        case 12:
            cleanup = playHigherLower();
            break;

        case 13:
        case 28:
        case 47:
            cleanup = playWordScramble();
            break;

        case 14:
            cleanup = playTyping();
            break;

        case 18:
        case 42:
        case 43:
        case 48:
            cleanup = playGenericChoice();
            break;

        case 19:
            cleanup = playSnake();
            break;

        case 20:
            cleanup = play2048();
            break;

        case 22:
            cleanup = playHangman();
            break;

        case 23:
            cleanup = playTrivia();
            break;

        case 24:
            cleanup = playTrueFalse();
            break;

        case 25:
            cleanup = playCapital();
            break;

        case 27:
            cleanup = playEmoji();
            break;

        case 31:
            cleanup = playPrime();
            break;

        case 32:
        case 33:
            cleanup = playPattern();
            break;

        case 35:
            cleanup = playMaze();
            break;

        case 49:
            cleanup = playCar();
            break;

        case 50:
            cleanup = playBike();
            break;

        default:
            cleanup = playGenericChoice();
    }

    currentCleanup =
        cleanup || (() => {});
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    if ($("currentLevel"))
        $("currentLevel").textContent =
            currentLevel;

    if ($("liveScore"))
        $("liveScore").textContent =
            currentScore;

    if ($("levelProgress"))
        $("levelProgress").style.width =
            `${(currentLevel / TOTAL_LEVELS) * 100}%`;
}


/* =========================================================
   LEVEL COMPLETION SCREEN
========================================================= */

function createLevelCompletionScreen() {

    let screen =
        $("customLevelComplete");

    if (screen)
        return screen;

    screen =
        document.createElement("div");

    screen.id =
        "customLevelComplete";

    screen.className =
        "level-complete-screen";

    screen.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10000;
        display:none;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(3,7,18,.92);
        backdrop-filter:blur(12px);
    `;

    screen.innerHTML = `
        <div
            style="
                width:min(520px,100%);
                padding:35px 25px;
                border-radius:24px;
                text-align:center;
                background:rgba(15,23,42,.98);
                border:1px solid rgba(117,103,255,.45);
                box-shadow:0 20px 80px rgba(0,0,0,.45);
            "
        >
            <div
                id="levelCompleteIcon"
                style="
                    font-size:60px;
                    margin-bottom:10px;
                "
            >
                🎉
            </div>

            <h2
                id="levelCompleteTitle"
                style="margin-bottom:10px;"
            >
                LEVEL COMPLETE
            </h2>

            <p
                id="levelCompleteMessage"
                style="margin-bottom:10px;"
            >
                Level 1 Complete
            </p>

            <p
                id="levelCompleteScore"
                style="margin-bottom:25px;"
            >
                Score: 100
            </p>

            <button
                id="startNextLevelButton"
                class="primary-btn"
            >
                START LEVEL 2 →
            </button>
        </div>
    `;

    document.body.appendChild(screen);

    $("startNextLevelButton").onclick =
        startNextLevel;

    return screen;
}

function showLevelComplete(completedLevel) {

    const screen =
        createLevelCompletionScreen();

    $("levelCompleteIcon").textContent =
        "🎉";

    $("levelCompleteTitle").textContent =
        "LEVEL COMPLETE";

    $("levelCompleteMessage").textContent =
        `Level ${completedLevel} Complete`;

    $("levelCompleteScore").textContent =
        `Score: ${currentScore}`;

    const button =
        $("startNextLevelButton");

    button.textContent =
        `START LEVEL ${completedLevel + 1} →`;

    button.style.display =
        "inline-flex";

    screen.style.display =
        "flex";
}

function hideLevelCompleteScreen() {

    const screen =
        $("customLevelComplete");

    if (screen)
        screen.style.display =
            "none";
}

function startNextLevel() {

    if (!currentGame)
        return;

    hideLevelCompleteScreen();

    if (
        currentLevel >= TOTAL_LEVELS
    )
        return;

    currentLevel++;

    levelLocked = false;

    updateHUD();

    playGameIntro(currentGame);
}


/* =========================================================
   NEXT LEVEL
========================================================= */

function nextLevel(points = 100) {

    if (levelLocked)
        return;

    levelLocked = true;

    currentScore += points;

    updateHUD();

    const completedLevel =
        currentLevel;

    if (
        completedLevel >=
        TOTAL_LEVELS
    ) {

        finishGame();

        return;
    }

    cleanupGameOnly();

    if ($("levelTransition"))
        $("levelTransition")
            .classList.remove("show");

    showLevelComplete(
        completedLevel
    );
}


/* =========================================================
   FINISH
========================================================= */

function finishGame() {

    cleanupGameOnly();

    saveScore(
        currentGame,
        currentScore,
        true
    );

    $("resultScore").textContent =
        currentScore;

    $("resultTitle").textContent =
        "YOU DID IT!";

    $("resultMessage").textContent =
        `${currentGame.name} completed in 20 levels.`;

    $("resultIcon").textContent =
        "🏆";

    $("resultOverlay")
        .classList.add("show");

    renderHomeStats();

    levelLocked = true;
}


/* =========================================================
   GENERIC BOARD
========================================================= */

function board(title, text) {

    $("gameContent").innerHTML = `
        <div class="game-board">

            <h2>
                ${escapeHTML(title)}
            </h2>

            <p>
                ${escapeHTML(text)}
            </p>

            <div id="gameInner"></div>

        </div>
    `;

    return $("gameInner");
}


/* =========================================================
   LEVEL DATA
========================================================= */


/* ---------- GUESS NUMBER ---------- */

const guessLevels = [
    [1,10,7],
    [1,15,12],
    [1,20,5],
    [1,25,19],
    [1,30,23],
    [1,35,14],
    [1,40,31],
    [1,45,8],
    [1,50,42],
    [1,55,27],
    [1,60,53],
    [1,65,16],
    [1,70,64],
    [1,75,38],
    [1,80,71],
    [1,85,29],
    [1,90,83],
    [1,95,46],
    [1,100,91],
    [1,150,117]
];


/* ---------- MATH ---------- */

const mathLevels = [
    ["7 + 5",12],
    ["18 - 7",11],
    ["9 + 14",23],
    ["25 - 13",12],
    ["8 × 4",32],
    ["37 + 28",65],
    ["72 - 35",37],
    ["9 × 7",63],
    ["84 ÷ 7",12],
    ["56 + 39",95],
    ["125 - 47",78],
    ["13 × 8",104],
    ["144 ÷ 12",12],
    ["67 + 89",156],
    ["150 - 76",74],
    ["17 × 9",153],
    ["225 ÷ 15",15],
    ["148 + 237",385],
    ["500 - 287",213],
    ["24 × 16",384]
];


/* ---------- WORDS ---------- */

const wordLevels = [
    "code",
    "html",
    "java",
    "array",
    "class",
    "object",
    "string",
    "browser",
    "website",
    "function",
    "variable",
    "computer",
    "internet",
    "developer",
    "database",
    "algorithm",
    "javascript",
    "programming",
    "technology",
    "application"
];


/* ---------- TYPING ---------- */

const typingLevels = [
    "code every single day",
    "practice makes progress",
    "build learn repeat",
    "never stop learning",
    "welcome to the game hub",
    "javascript is powerful",
    "keep improving yourself",
    "think like a programmer",
    "coding is a creative skill",
    "developers solve problems",
    "learn something new today",
    "consistency beats motivation",
    "write clean readable code",
    "debug before you give up",
    "practice makes you faster",
    "build projects to learn",
    "great software takes practice",
    "turn ideas into products",
    "keep coding keep growing",
    "welcome to the final level"
];


/* ---------- PATTERNS ---------- */

const patternLevels = [
    ["2, 4, 6, 8, ?",10],
    ["5, 10, 15, 20, ?",25],
    ["3, 6, 9, 12, ?",15],
    ["10, 20, 30, 40, ?",50],
    ["1, 3, 5, 7, ?",9],
    ["2, 5, 8, 11, ?",14],
    ["4, 8, 12, 16, ?",20],
    ["10, 15, 20, 25, ?",30],
    ["1, 4, 7, 10, ?",13],
    ["3, 6, 12, 24, ?",48],
    ["2, 4, 8, 16, ?",32],
    ["5, 10, 20, 40, ?",80],
    ["1, 2, 4, 8, ?",16],
    ["100, 90, 80, 70, ?",60],
    ["50, 45, 40, 35, ?",30],
    ["81, 72, 63, 54, ?",45],
    ["2, 6, 18, 54, ?",162],
    ["3, 9, 27, 81, ?",243],
    ["1, 4, 16, 64, ?",256],
    ["2, 8, 32, 128, ?",512]
];


/* ---------- HIGHER LOWER ---------- */

const higherLowerLevels = [
    [12,25],
    [40,18],
    [23,31],
    [45,22],
    [17,29],
    [35,12],
    [28,44],
    [50,21],
    [19,37],
    [42,30],
    [15,48],
    [33,14],
    [26,39],
    [47,11],
    [20,34],
    [38,16],
    [29,49],
    [13,27],
    [41,24],
    [18,36]
];


/* ---------- ODD EVEN ---------- */

const oddEvenLevels = [
    7,12,25,38,41,
    56,63,74,81,92,
    15,28,33,46,57,
    68,71,84,95,102
];


/* ---------- TRIVIA ---------- */

const triviaLevels = [
    ["What is the capital of France?","paris"],
    ["How many days are in a week?","7"],
    ["Which planet is known as the Red Planet?","mars"],
    ["What is 5 × 5?","25"],
    ["Which language is used for web page structure?","html"],
    ["What is the largest ocean?","pacific"],
    ["How many sides does a triangle have?","3"],
    ["Which animal is known as the king of the jungle?","lion"],
    ["What color do you get by mixing red and white?","pink"],
    ["What is the boiling point of water in Celsius?","100"],
    ["Which planet is closest to the Sun?","mercury"],
    ["How many months are in a year?","12"],
    ["What is 100 ÷ 10?","10"],
    ["Which gas do humans need to breathe?","oxygen"],
    ["What is the opposite of hot?","cold"],
    ["How many letters are in the English alphabet?","26"],
    ["Which continent is India in?","asia"],
    ["What is 9 × 9?","81"],
    ["Which device is used to type on a computer?","keyboard"],
    ["What is the final level number?","20"]
];


/* ---------- CAPITALS ---------- */

const capitalLevels = [
    ["India","New Delhi"],
    ["France","Paris"],
    ["Japan","Tokyo"],
    ["Germany","Berlin"],
    ["Italy","Rome"],
    ["Australia","Canberra"],
    ["Canada","Ottawa"],
    ["Brazil","Brasilia"],
    ["China","Beijing"],
    ["Russia","Moscow"],
    ["Spain","Madrid"],
    ["Portugal","Lisbon"],
    ["Nepal","Kathmandu"],
    ["Thailand","Bangkok"],
    ["South Korea","Seoul"],
    ["Egypt","Cairo"],
    ["Greece","Athens"],
    ["Mexico","Mexico City"],
    ["Norway","Oslo"],
    ["Sweden","Stockholm"]
];


/* ---------- TRUE FALSE ---------- */

const trueFalseLevels = [
    ["The Earth revolves around the Sun.",true],
    ["Water freezes at 0°C.",true],
    ["JavaScript is a programming language.",true],
    ["HTML is a database.",false],
    ["A triangle has three sides.",true],
    ["The Sun is a planet.",false],
    ["CSS is used for styling web pages.",true],
    ["There are 12 months in a year.",true],
    ["5 × 5 equals 30.",false],
    ["The Pacific is an ocean.",true],
    ["A square has four sides.",true],
    ["Python is a programming language.",true],
    ["Mars is closer to the Sun than Mercury.",false],
    ["The keyboard is an input device.",true],
    ["The Moon is a star.",false],
    ["100 ÷ 10 equals 10.",true],
    ["A week has seven days.",true],
    ["Java and JavaScript are the same language.",false],
    ["The Internet connects computers globally.",true],
    ["20 levels exist in this game.",true]
];


/* ---------- EMOJI ---------- */

const emojiLevels = [
    ["🍎","apple"],
    ["🚗","car"],
    ["🐶","dog"],
    ["🌧️","rain"],
    ["🔥","fire"],
    ["⭐","star"],
    ["🌙","moon"],
    ["☀️","sun"],
    ["🍕","pizza"],
    ["⚽","football"],
    ["🚀","rocket"],
    ["🐍","snake"],
    ["💻","computer"],
    ["📱","phone"],
    ["🎵","music"],
    ["❤️","heart"],
    ["🎯","target"],
    ["🏠","house"],
    ["🌳","tree"],
    ["🎮","game"]
];


/* =========================================================
   GAME 1
========================================================= */

function playGuessNumber() {

    const data =
        guessLevels[currentLevel - 1];

    const root =
        board(
            "GUESS THE NUMBER",
            `Find the number between ${data[0]} and ${data[1]}`
        );

    root.innerHTML = `
        <input
            id="answerInput"
            class="game-input"
            type="number"
            placeholder="Enter number..."
            autofocus
        >

        <p id="hint"></p>
    `;

    const input =
        $("answerInput");

    const hint =
        $("hint");

    function check() {

        const value =
            Number(input.value);

        if (!input.value)
            return;

        if (value === data[2]) {

            input.classList.add(
                "correct"
            );

            hint.textContent =
                "✓ Correct!";

            setTimeout(
                () => nextLevel(100),
                350
            );

        } else {

            input.classList.remove(
                "wrong"
            );

            void input.offsetWidth;

            input.classList.add(
                "wrong"
            );

            hint.textContent =
                value < data[2]
                    ? "↑ Higher!"
                    : "↓ Lower!";
        }
    }

    input.addEventListener(
        "keydown",
        e => {
            if (e.key === "Enter")
                check();
        }
    );

    input.focus();

    return () => {};
}


/* =========================================================
   GAME 2
========================================================= */

function playRPS() {

    const root =
        board(
            "ROCK PAPER SCISSORS",
            `Level ${currentLevel}: beat the computer.`
        );

    const moves = [
        "✊",
        "✋",
        "✌️"
    ];

    root.innerHTML = `
        <div class="game-options">
            ${moves.map(
                (x, i) => `
                    <button
                        class="game-option"
                        data-move="${i}"
                    >
                        ${x}
                    </button>
                `
            ).join("")}
        </div>

        <p id="rpsResult"></p>
    `;

    const result =
        $("rpsResult");

    root.querySelectorAll(
        ".game-option"
    ).forEach(button => {

        button.onclick = () => {

            const player =
                Number(
                    button.dataset.move
                );

            const computer =
                (currentLevel + player) % 3;

            if (player === computer) {

                result.textContent =
                    "DRAW — try again";

                return;
            }

            const win =
                (player === 0 && computer === 2) ||
                (player === 1 && computer === 0) ||
                (player === 2 && computer === 1);

            if (win) {

                button.classList.add(
                    "correct"
                );

                result.textContent =
                    "✓ YOU WIN!";

                setTimeout(
                    () => nextLevel(110),
                    350
                );

            } else {

                button.classList.add(
                    "wrong"
                );

                result.textContent =
                    "✗ COMPUTER WINS";
            }
        };
    });

    return () => {};
}


/* =========================================================
   MATH
========================================================= */

function playMathGame() {

    const data =
        mathLevels[currentLevel - 1];

    const root =
        board(
            "MATH CHALLENGE",
            "Solve the equation."
        );

    root.innerHTML = `
        <div
            style="
                font-family:Orbitron;
                font-size:35px;
                margin-bottom:20px
            "
        >
            ${data[0]} = ?
        </div>

        <input
            id="answerInput"
            class="game-input"
            type="number"
            placeholder="Answer..."
            autofocus
        >
    `;

    const input =
        $("answerInput");

    function check() {

        if (
            Number(input.value) ===
            data[1]
        ) {

            input.classList.add(
                "correct"
            );

            setTimeout(
                () => nextLevel(
                    100 + currentLevel * 5
                ),
                350
            );

        } else {

            input.classList.remove(
                "wrong"
            );

            void input.offsetWidth;

            input.classList.add(
                "wrong"
            );
        }
    }

    input.addEventListener(
        "keydown",
        e => {
            if (e.key === "Enter")
                check();
        }
    );

    input.focus();

    return () => {};
}


/* =========================================================
   ODD EVEN
========================================================= */

function playOddEven() {

    const number =
        oddEvenLevels[
            currentLevel - 1
        ];

    const correct =
        number % 2 === 0
            ? "EVEN"
            : "ODD";

    const root =
        board(
            "ODD OR EVEN",
            "Choose correctly."
        );

    root.innerHTML = `
        <div
            style="
                font-family:Orbitron;
                font-size:45px;
                margin-bottom:20px
            "
        >
            ${number}
        </div>

        <div class="game-options">

            <button
                class="game-option"
                data-value="ODD"
            >
                ODD
            </button>

            <button
                class="game-option"
                data-value="EVEN"
            >
                EVEN
            </button>

        </div>
    `;

    root.querySelectorAll(
        ".game-option"
    ).forEach(button => {

        button.onclick = () => {

            if (
                button.dataset.value ===
                correct
            ) {

                button.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(100),
                    300
                );

            } else {

                button.classList.add(
                    "wrong"
                );
            }
        };
    });

    return () => {};
}


/* =========================================================
   HIGHER LOWER
========================================================= */

function playHigherLower() {

    const data =
        higherLowerLevels[
            currentLevel - 1
        ];

    const first = data[0];
    const second = data[1];

    const correct =
        second > first
            ? "higher"
            : "lower";

    const root =
        board(
            "HIGHER OR LOWER",
            `Will ${second} be higher or lower than ${first}?`
        );

    root.innerHTML = `
        <div class="game-options">

            <button
                id="higher"
                class="game-option"
            >
                ⬆ HIGHER
            </button>

            <button
                id="lower"
                class="game-option"
            >
                ⬇ LOWER
            </button>

        </div>
    `;

    function answer(choice) {

        const button =
            $(choice);

        if (choice === correct) {

            button.classList.add(
                "correct"
            );

            setTimeout(
                () => nextLevel(100),
                350
            );

        } else {

            button.classList.add(
                "wrong"
            );
        }
    }

    $("higher").onclick =
        () => answer("higher");

    $("lower").onclick =
        () => answer("lower");

    return () => {};
}


/* =========================================================
   WORD SCRAMBLE
========================================================= */

function playWordScramble() {

    const word =
        wordLevels[
            currentLevel - 1
        ];

    const scrambled =
        shuffle(
            word.split("")
        ).join("");

    const root =
        board(
            "WORD SCRAMBLE",
            `Unscramble the word. Level ${currentLevel}`
        );

    root.innerHTML = `
        <div
            style="
                font-family:Orbitron;
                font-size:32px;
                margin-bottom:20px;
                letter-spacing:6px
            "
        >
            ${scrambled.toUpperCase()}
        </div>

        <input
            id="answerInput"
            class="game-input"
            placeholder="Your answer..."
            autofocus
        >

        <p id="scrambleHint"></p>
    `;

    const input =
        $("answerInput");

    input.addEventListener(
        "keydown",
        e => {

            if (e.key !== "Enter")
                return;

            const answer =
                input.value
                    .trim()
                    .toLowerCase();

            if (answer === word) {

                input.classList.add(
                    "correct"
                );

                $("scrambleHint")
                    .textContent =
                    "✓ CORRECT!";

                setTimeout(
                    () => nextLevel(120),
                    350
                );

            } else {

                input.classList.remove(
                    "wrong"
                );

                void input.offsetWidth;

                input.classList.add(
                    "wrong"
                );

                $("scrambleHint")
                    .textContent =
                    "✕ TRY AGAIN";
            }
        }
    );

    input.focus();

    return () => {};
}


/* =========================================================
   TYPING
========================================================= */

function playTyping() {

    const text =
        typingLevels[
            currentLevel - 1
        ];

    const root =
        board(
            "TYPING SPEED",
            "Type the sentence exactly."
        );

    root.innerHTML = `
        <div
            style="
                font-size:22px;
                margin-bottom:20px;
                line-height:1.6
            "
        >
            ${escapeHTML(text)}
        </div>

        <input
            id="answerInput"
            class="game-input"
            placeholder="Type here..."
            autofocus
        >
    `;

    const input =
        $("answerInput");

    input.addEventListener(
        "keydown",
        e => {

            if (e.key !== "Enter")
                return;

            if (input.value === text) {

                input.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(
                        120 + currentLevel * 5
                    ),
                    350
                );

            } else {

                input.classList.remove(
                    "wrong"
                );

                void input.offsetWidth;

                input.classList.add(
                    "wrong"
                );
            }
        }
    );

    input.focus();

    return () => {};
}


/* =========================================================
   PATTERN
========================================================= */

function playPattern() {

    const data =
        patternLevels[
            currentLevel - 1
        ];

    const root =
        board(
            "PATTERN PUZZLE",
            "Find the missing number."
        );

    root.innerHTML = `
        <div
            style="
                font-family:Orbitron;
                font-size:28px;
                margin-bottom:25px
            "
        >
            ${data[0]}
        </div>

        <input
            id="answerInput"
            class="game-input"
            type="number"
            placeholder="Answer..."
            autofocus
        >
    `;

    const input =
        $("answerInput");

    input.addEventListener(
        "keydown",
        e => {

            if (e.key !== "Enter")
                return;

            if (
                Number(input.value) ===
                data[1]
            ) {

                input.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(130),
                    350
                );

            } else {

                input.classList.add(
                    "wrong"
                );
            }
        }
    );

    input.focus();

    return () => {};
}


/* =========================================================
   COLOR
========================================================= */

function playColorGame() {

    const colors = [
        ["RED","#ff4d6d"],
        ["BLUE","#4d9fff"],
        ["GREEN","#45e38c"],
        ["YELLOW","#ffd45c"]
    ];

    const answer =
        colors[
            (currentLevel - 1) %
            colors.length
        ];

    const root =
        board(
            "COLOR MATCH",
            "Choose the requested color."
        );

    root.innerHTML = `
        <h2 style="color:${answer[1]}">
            ${answer[0]}
        </h2>

        <div class="game-options">

            ${shuffle(colors)
                .map(c => `
                    <button
                        class="game-option"
                        data-color="${c[0]}"
                        style="
                            background:${c[1]};
                            color:#07101a
                        "
                    >
                        ${c[0]}
                    </button>
                `)
                .join("")}

        </div>
    `;

    root.querySelectorAll(
        ".game-option"
    ).forEach(button => {

        button.onclick = () => {

            if (
                button.dataset.color ===
                answer[0]
            ) {

                button.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(100),
                    300
                );

            } else {

                button.classList.add(
                    "wrong"
                );
            }
        };
    });

    return () => {};
}


/* =========================================================
   MEMORY NUMBER
========================================================= */

function playMemoryNumber() {

    const baseNumbers = [
        "4821",
        "7354",
        "2916",
        "8642",
        "5137",
        "9284",
        "3469",
        "6715",
        "2048",
        "5931",
        "8176",
        "4529",
        "9362",
        "1785",
        "6248",
        "3907",
        "7513",
        "2864",
        "9185",
        "4372"
    ];

    const digits =
        baseNumbers[
            currentLevel - 1
        ];

    const root =
        board(
            "NUMBER MEMORY",
            "Memorize the number."
        );

    root.innerHTML = `
        <div
            id="memoryNumber"
            style="
                font-family:Orbitron;
                font-size:50px;
                color:#4de5ff
            "
        >
            ${digits}
        </div>

        <p>
            Memorize it...
        </p>
    `;

    const timer =
        setTimeout(() => {

            root.innerHTML = `
                <input
                    id="answerInput"
                    class="game-input"
                    type="number"
                    placeholder="Enter number..."
                    autofocus
                >
            `;

            const input =
                $("answerInput");

            input.focus();

            input.addEventListener(
                "keydown",
                e => {

                    if (e.key !== "Enter")
                        return;

                    if (
                        input.value ===
                        digits
                    ) {

                        input.classList.add(
                            "correct"
                        );

                        setTimeout(
                            () => nextLevel(
                                120 + currentLevel * 5
                            ),
                            350
                        );

                    } else {

                        input.classList.add(
                            "wrong"
                        );
                    }
                }
            );

        }, Math.max(
            700,
            1800 - currentLevel * 45
        ));

    return () => {
        clearTimeout(timer);
    };
}


/* =========================================================
   REACTION
========================================================= */

function playReaction() {

    const root =
        board(
            "REACTION TEST",
            "Wait for GREEN, then click."
        );

    root.innerHTML = `
        <button
            id="reactionTarget"
            class="primary-btn"
            style="
                width:100%;
                height:150px;
                font-size:25px
            "
        >
            WAIT...
        </button>
    `;

    const button =
        $("reactionTarget");

    let ready = false;

    const delay =
        Math.max(
            500,
            2400 - currentLevel * 80
        );

    const timer =
        setTimeout(() => {

            ready = true;

            button.textContent =
                "CLICK NOW!";

            button.style.background =
                "#23b978";

        }, delay);

    button.onclick = () => {

        if (!ready) {

            clearTimeout(timer);

            button.classList.add(
                "wrong"
            );

            button.textContent =
                "TOO EARLY";

            setTimeout(
                () => launchActualGame(),
                600
            );

            return;
        }

        button.classList.add(
            "correct"
        );

        setTimeout(
            () => nextLevel(
                120 + currentLevel * 5
            ),
            300
        );
    };

    return () => {
        clearTimeout(timer);
        button.onclick = null;
    };
}


/* =========================================================
   MEMORY CARDS
========================================================= */

function playMemory() {

    const pairCount =
        Math.min(
            2 + Math.floor(
                (currentLevel - 1) / 5
            ),
            6
        );

    const symbols = [
        "🍎","🚀","⭐","🔥","🐶","🌙"
    ];

    const chosen =
        symbols.slice(
            0,
            pairCount
        );

    const cards =
        shuffle(
            chosen.flatMap(
                x => [x,x]
            )
        );

    const root =
        board(
            "MEMORY CARDS",
            `Find ${pairCount} matching pairs.`
        );

    root.innerHTML = `
        <div
            id="memoryGrid"
            class="game-options"
        >
            ${cards.map(
                (x,i) => `
                    <button
                        class="game-option memory"
                        data-value="${x}"
                    >
                        ❓
                    </button>
                `
            ).join("")}
        </div>
    `;

    const allCards =
        root.querySelectorAll(
            ".memory"
        );

    let opened = [];
    let matched = 0;

    allCards.forEach(card => {

        card.onclick = () => {

            if (
                card.classList.contains(
                    "correct"
                ) ||
                opened.includes(card) ||
                opened.length >= 2
            )
                return;

            card.textContent =
                card.dataset.value;

            opened.push(card);

            if (opened.length === 2) {

                const [a,b] =
                    opened;

                if (
                    a.dataset.value ===
                    b.dataset.value
                ) {

                    a.classList.add(
                        "correct"
                    );

                    b.classList.add(
                        "correct"
                    );

                    matched++;

                    opened = [];

                    if (
                        matched ===
                        pairCount
                    ) {

                        setTimeout(
                            () => nextLevel(
                                140 + currentLevel * 5
                            ),
                            400
                        );
                    }

                } else {

                    setTimeout(() => {

                        a.textContent =
                            "❓";

                        b.textContent =
                            "❓";

                        opened = [];

                    }, 500);
                }
            }
        };
    });

    return () => {};
}


/* =========================================================
   TARGET GAMES
========================================================= */

function playTargetGame() {

    const root =
        board(
            currentGame.name,
            `Hit the target — Level ${currentLevel}`
        );

    root.innerHTML = `
        <div
            id="targetArea"
            style="
                position:relative;
                height:280px;
                width:100%;
                overflow:hidden;
            "
        >
            <button
                id="movingTarget"
                style="
                    position:absolute;
                    border:0;
                    border-radius:50%;
                    width:${45 - Math.min(currentLevel,15)}px;
                    height:${45 - Math.min(currentLevel,15)}px;
                    cursor:pointer;
                    font-size:18px;
                "
            >
                🎯
            </button>
        </div>

        <p>
            Target ${currentLevel} / 20
        </p>
    `;

    const area =
        $("targetArea");

    const target =
        $("movingTarget");

    const size =
        Math.max(
            25,
            50 - currentLevel
        );

    target.style.width =
        `${size}px`;

    target.style.height =
        `${size}px`;

    target.style.left =
        `${randomInt(5,85)}%`;

    target.style.top =
        `${randomInt(5,75)}%`;

    target.onclick = () => {

        target.classList.add(
            "correct"
        );

        setTimeout(
            () => nextLevel(
                100 + currentLevel * 5
            ),
            250
        );
    };

    let movement;

    if (
        currentGame.id === 3 ||
        currentGame.id === 8
    ) {

        movement =
            setInterval(() => {

                target.style.left =
                    `${randomInt(5,85)}%`;

                target.style.top =
                    `${randomInt(5,75)}%`;

            },
            Math.max(
                350,
                1100 - currentLevel * 35
            )
        );
    }

    return () => {
        clearInterval(movement);
    };
}


/* =========================================================
   GENERIC CHOICE GAMES
========================================================= */

function playGenericChoice() {

    const questions = [

        ["What comes next? 2, 4, 6, ?",["8","9","10"],"8"],

        ["Which is larger?",["25","18","12"],"25"],

        ["What is 10 + 5?",["15","14","16"],"15"],

        ["What is 20 - 7?",["13","12","14"],"13"],

        ["What is 6 × 4?",["24","20","28"],"24"],

        ["What is 81 ÷ 9?",["9","8","7"],"9"],

        ["Which is a programming language?",["Java","HTML","CSS"],"Java"],

        ["Which is an input device?",["Keyboard","Monitor","Speaker"],"Keyboard"],

        ["Which number is prime?",["17","21","27"],"17"],

        ["Which one is a fruit?",["Apple","Carrot","Potato"],"Apple"],

        ["How many sides does a square have?",["4","5","6"],"4"],

        ["Which planet is red?",["Mars","Venus","Earth"],"Mars"],

        ["What is 12 × 3?",["36","32","39"],"36"],

        ["Which is larger?",["99","89","79"],"99"],

        ["What comes after 49?",["50","51","48"],"50"],

        ["Which is a web styling language?",["CSS","SQL","Java"],"CSS"],

        ["What is 144 ÷ 12?",["12","14","10"],"12"],

        ["Which is a database?",["MongoDB","HTML","CSS"],"MongoDB"],

        ["What is 15 + 25?",["40","35","45"],"40"],

        ["Final challenge: 20 × 20?",["400","200","420"],"400"]
    ];

    const data =
        questions[
            currentLevel - 1
        ];

    const root =
        board(
            currentGame.name,
            currentGame.description
        );

    root.innerHTML = `
        <h2>
            ${escapeHTML(data[0])}
        </h2>

        <div class="game-options">

            ${shuffle(data[1])
                .map(
                    option => `
                        <button
                            class="game-option"
                            data-answer="${escapeHTML(option)}"
                        >
                            ${escapeHTML(option)}
                        </button>
                    `
                )
                .join("")}

        </div>
    `;

    root.querySelectorAll(
        ".game-option"
    ).forEach(button => {

        button.onclick = () => {

            if (
                button.dataset.answer ===
                data[2]
            ) {

                button.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(
                        100 + currentLevel * 5
                    ),
                    300
                );

            } else {

                button.classList.add(
                    "wrong"
                );
            }
        };
    });

    return () => {};
}


/* =========================================================
   TRIVIA
========================================================= */

function playTrivia() {

    const data =
        triviaLevels[
            currentLevel - 1
        ];

    const root =
        board(
            "TRIVIA",
            data[0]
        );

    root.innerHTML = `
        <input
            id="answerInput"
            class="game-input"
            placeholder="Answer..."
            autofocus
        >
    `;

    const input =
        $("answerInput");

    input.addEventListener(
        "keydown",
        e => {

            if (e.key !== "Enter")
                return;

            if (
                input.value
                    .trim()
                    .toLowerCase() ===
                data[1].toLowerCase()
            ) {

                input.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(130),
                    350
                );

            } else {

                input.classList.add(
                    "wrong"
                );
            }
        }
    );

    input.focus();

    return () => {};
}


/* =========================================================
   TRUE FALSE
========================================================= */

function playTrueFalse() {

    const data =
        trueFalseLevels[
            currentLevel - 1
        ];

    const root =
        board(
            "TRUE OR FALSE",
            data[0]
        );

    root.innerHTML = `
        <div class="game-options">

            <button
                class="game-option"
                data-value="true"
            >
                TRUE
            </button>

            <button
                class="game-option"
                data-value="false"
            >
                FALSE
            </button>

        </div>
    `;

    root.querySelectorAll(
        ".game-option"
    ).forEach(button => {

        button.onclick = () => {

            if (
                button.dataset.value ===
                String(data[1])
            ) {

                button.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(110),
                    300
                );

            } else {

                button.classList.add(
                    "wrong"
                );
            }
        };
    });

    return () => {};
}


/* =========================================================
   CAPITAL QUIZ
========================================================= */

function playCapital() {

    const data =
        capitalLevels[
            currentLevel - 1
        ];

    const root =
        board(
            "CAPITAL QUIZ",
            `What is the capital of ${data[0]}?`
        );

    root.innerHTML = `
        <input
            id="answerInput"
            class="game-input"
            placeholder="Capital..."
            autofocus
        >
    `;

    const input =
        $("answerInput");

    input.addEventListener(
        "keydown",
        e => {

            if (e.key !== "Enter")
                return;

            if (
                input.value
                    .trim()
                    .toLowerCase() ===
                data[1].toLowerCase()
            ) {

                input.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(120),
                    350
                );

            } else {

                input.classList.add(
                    "wrong"
                );
            }
        }
    );

    input.focus();

    return () => {};
}


/* =========================================================
   EMOJI
========================================================= */

function playEmoji() {

    const data =
        emojiLevels[
            currentLevel - 1
        ];

    const root =
        board(
            "EMOJI GUESS",
            "What does this emoji represent?"
        );

    root.innerHTML = `
        <div
            style="
                font-size:70px;
                margin:20px
            "
        >
            ${data[0]}
        </div>

        <input
            id="answerInput"
            class="game-input"
            placeholder="Your answer..."
            autofocus
        >
    `;

    const input =
        $("answerInput");

    input.addEventListener(
        "keydown",
        e => {

            if (e.key !== "Enter")
                return;

            if (
                input.value
                    .trim()
                    .toLowerCase() ===
                data[1]
            ) {

                input.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(120),
                    350
                );

            } else {

                input.classList.add(
                    "wrong"
                );
            }
        }
    );

    input.focus();

    return () => {};
}


/* =========================================================
   PRIME CHECKER
========================================================= */

function playPrime() {

    const numbers = [
        2,4,7,9,11,
        15,17,21,23,27,
        29,33,37,39,41,
        43,49,53,57,59
    ];

    const number =
        numbers[
            currentLevel - 1
        ];

    const isPrime =
        n => {

            if (n < 2)
                return false;

            for (
                let i = 2;
                i * i <= n;
                i++
            ) {
                if (n % i === 0)
                    return false;
            }

            return true;
        };

    const correct =
        isPrime(number)
            ? "YES"
            : "NO";

    const root =
        board(
            "PRIME CHECKER",
            `Is ${number} a prime number?`
        );

    root.innerHTML = `
        <div class="game-options">

            <button
                class="game-option"
                data-answer="YES"
            >
                YES
            </button>

            <button
                class="game-option"
                data-answer="NO"
            >
                NO
            </button>

        </div>
    `;

    root.querySelectorAll(
        ".game-option"
    ).forEach(button => {

        button.onclick = () => {

            if (
                button.dataset.answer ===
                correct
            ) {

                button.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(130),
                    300
                );

            } else {

                button.classList.add(
                    "wrong"
                );
            }
        };
    });

    return () => {};
}


/* =========================================================
   HANGMAN
========================================================= */

function playHangman() {

    const words = [
        "apple",
        "train",
        "house",
        "river",
        "computer",
        "planet",
        "school",
        "rocket",
        "browser",
        "keyboard",
        "internet",
        "developer",
        "program",
        "database",
        "function",
        "variable",
        "algorithm",
        "javascript",
        "technology",
        "application"
    ];

    const word =
        words[
            currentLevel - 1
        ];

    const root =
        board(
            "HANGMAN",
            "Guess the hidden word."
        );

    root.innerHTML = `
        <div
            id="hangmanWord"
            style="
                font-size:32px;
                letter-spacing:8px;
                margin:20px
            "
        >
            ${"_ ".repeat(word.length)}
        </div>

        <input
            id="answerInput"
            class="game-input"
            maxlength="1"
            placeholder="Letter"
            autofocus
        >

        <p id="hangmanGuesses">
            0 / 6 wrong
        </p>
    `;

    const input =
        $("answerInput");

    const display =
        $("hangmanWord");

    const used = new Set();

    let wrong = 0;

    function render() {

        display.textContent =
            word
                .split("")
                .map(
                    c =>
                        used.has(c)
                            ? c
                            : "_"
                )
                .join(" ");

        $("hangmanGuesses")
            .textContent =
            `${wrong} / 6 wrong`;

        if (
            word
                .split("")
                .every(
                    c => used.has(c)
                )
        ) {

            setTimeout(
                () => nextLevel(140),
                400
            );
        }

        if (wrong >= 6) {

            setTimeout(
                () => launchActualGame(),
                700
            );
        }
    }

    input.addEventListener(
        "keydown",
        e => {

            if (e.key !== "Enter")
                return;

            const letter =
                input.value
                    .toLowerCase()
                    .trim();

            input.value = "";

            if (
                !letter ||
                used.has(letter)
            )
                return;

            used.add(letter);

            if (!word.includes(letter))
                wrong++;

            render();
        }
    );

    input.focus();

    return () => {};
}


/* =========================================================
   SNAKE
========================================================= */

function playSnake() {

    const root =
        board(
            "SNAKE",
            `Eat ${3 + Math.floor(currentLevel / 4)} food items.`
        );

    const target =
        3 +
        Math.floor(currentLevel / 4);

    root.innerHTML = `
        <div
            id="snakeArea"
            style="
                position:relative;
                width:min(90vw,420px);
                height:300px;
                margin:auto;
                border:2px solid currentColor;
                overflow:hidden;
            "
        >
            <button
                id="snakeFood"
                style="
                    position:absolute;
                    border:0;
                    background:none;
                    font-size:28px;
                "
            >
                🍎
            </button>

            <div
                id="snakePlayer"
                style="
                    position:absolute;
                    left:45%;
                    top:45%;
                    font-size:28px;
                "
            >
                🐍
            </div>
        </div>

        <p id="snakeScore">
            0 / ${target}
        </p>
    `;

    const area =
        $("snakeArea");

    const food =
        $("snakeFood");

    const player =
        $("snakePlayer");

    let score = 0;

    function moveFood() {

        food.style.left =
            `${randomInt(5,85)}%`;

        food.style.top =
            `${randomInt(5,80)}%`;
    }

    moveFood();

    const handler =
        e => {

            const step = 5;

            let left =
                parseFloat(
                    player.style.left || "45"
                );

            let top =
                parseFloat(
                    player.style.top || "45"
                );

            if (
                e.key === "ArrowLeft"
            )
                left -= step;

            if (
                e.key === "ArrowRight"
            )
                left += step;

            if (
                e.key === "ArrowUp"
            )
                top -= step;

            if (
                e.key === "ArrowDown"
            )
                top += step;

            left =
                Math.max(
                    0,
                    Math.min(90,left)
                );

            top =
                Math.max(
                    0,
                    Math.min(85,top)
                );

            player.style.left =
                `${left}%`;

            player.style.top =
                `${top}%`;

            const p =
                player.getBoundingClientRect();

            const f =
                food.getBoundingClientRect();

            if (
                p.left < f.right &&
                p.right > f.left &&
                p.top < f.bottom &&
                p.bottom > f.top
            ) {

                score++;

                $("snakeScore")
                    .textContent =
                    `${score} / ${target}`;

                if (score >= target) {

                    setTimeout(
                        () => nextLevel(
                            150 + currentLevel * 5
                        ),
                        250
                    );

                } else {

                    moveFood();
                }
            }
        };

    window.addEventListener(
        "keydown",
        handler
    );

    return () => {
        window.removeEventListener(
            "keydown",
            handler
        );
    };
}


/* =========================================================
   2048 MINI
========================================================= */

function play2048() {

    const root =
        board(
            "2048",
            `Reach ${Math.min(64, 4 + currentLevel * 3)}`
        );

    let value = 2;

    const target =
        Math.min(
            64,
            4 + currentLevel * 3
        );

    root.innerHTML = `
        <div
            style="
                font-family:Orbitron;
                font-size:50px;
                margin:20px
            "
            id="tileValue"
        >
            2
        </div>

        <div class="game-options">

            <button
                class="game-option"
                data-dir="up"
            >
                ↑
            </button>

            <button
                class="game-option"
                data-dir="down"
            >
                ↓
            </button>

            <button
                class="game-option"
                data-dir="left"
            >
                ←
            </button>

            <button
                class="game-option"
                data-dir="right"
            >
                →
            </button>

        </div>
    `;

    root.querySelectorAll(
        ".game-option"
    ).forEach(button => {

        button.onclick = () => {

            value *= 2;

            $("tileValue")
                .textContent =
                value;

            if (value >= target) {

                button.classList.add(
                    "correct"
                );

                setTimeout(
                    () => nextLevel(
                        150 + currentLevel * 5
                    ),
                    300
                );
            }
        };
    });

    return () => {};
}


/* =========================================================
   TIC TAC TOE
========================================================= */

function playTicTacToe() {

    const root =
        board(
            "TIC TAC TOE",
            "Get three in a row."
        );

    root.innerHTML = `
        <div
            id="ttt"
            class="game-options"
            style="
                grid-template-columns:repeat(3,1fr)
            "
        >
            ${Array(9)
                .fill(0)
                .map(
                    (_,i) => `
                        <button
                            class="game-option"
                            data-cell="${i}"
                            style="
                                height:70px;
                                font-size:25px
                            "
                        ></button>
                    `
                )
                .join("")}
        </div>

        <p id="tttStatus"></p>
    `;

    const cells =
        root.querySelectorAll(
            "[data-cell]"
        );

    const state =
        Array(9).fill("");

    let over = false;

    const wins = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];

    function winner(mark) {

        return wins.some(
            combo =>
                combo.every(
                    i =>
                        state[i] === mark
                )
        );
    }

    cells.forEach(cell => {

        cell.onclick = () => {

            if (over)
                return;

            const index =
                Number(
                    cell.dataset.cell
                );

            if (state[index])
                return;

            state[index] = "X";
            cell.textContent = "X";

            if (winner("X")) {

                over = true;

                setTimeout(
                    () => nextLevel(180),
                    350
                );

                return;
            }

            const empty =
                state
                    .map(
                        (v,i) =>
                            v ? null : i
                    )
                    .filter(
                        x => x !== null
                    );

            if (!empty.length)
                return;

            const ai =
                empty[
                    (currentLevel - 1) %
                    empty.length
                ];

            state[ai] = "O";
            cells[ai].textContent = "O";

            if (winner("O")) {

                over = true;

                $("tttStatus")
                    .textContent =
                    "Computer wins — retry.";

                setTimeout(
                    () => launchActualGame(),
                    700
                );
            }
        };
    });

    return () => {};
}


/* =========================================================
   MAZE
========================================================= */

function playMaze() {

    const size =
        Math.min(
            5 + Math.floor(
                currentLevel / 4
            ),
            9
        );

    const root =
        board(
            "MAZE",
            `Reach the exit. Grid: ${size} × ${size}`
        );

    root.innerHTML = `
        <div
            id="maze"
            style="
                display:grid;
                grid-template-columns:repeat(${size},1fr);
                gap:3px;
                max-width:420px;
                margin:auto;
            "
        >
            ${Array(size * size)
                .fill(0)
                .map(
                    (_,i) => `
                        <button
                            class="maze-cell"
                            data-index="${i}"
                            style="
                                height:35px;
                            "
                        >
                            ${i === 0 ? "🟢" : ""}
                            ${i === size*size-1 ? "🏁" : ""}
                        </button>
                    `
                )
                .join("")}
        </div>

        <p>
            Use the buttons to reach the finish.
        </p>

        <div class="game-options">

            <button
                id="mazeUp"
                class="game-option"
            >
                ↑
            </button>

            <button
                id="mazeDown"
                class="game-option"
            >
                ↓
            </button>

            <button
                id="mazeLeft"
                class="game-option"
            >
                ←
            </button>

            <button
                id="mazeRight"
                class="game-option"
            >
                →
            </button>

        </div>
    `;

    const cells =
        root.querySelectorAll(
            ".maze-cell"
        );

    let pos = 0;

    function render() {

        cells.forEach(
            c => {
                c.textContent = "";
            }
        );

        cells[pos].textContent =
            "🟢";

        cells[
            size * size - 1
        ].textContent =
            "🏁";
    }

    function move(direction) {

        const row =
            Math.floor(pos / size);

        const col =
            pos % size;

        if (
            direction === "up" &&
            row > 0
        )
            pos -= size;

        if (
            direction === "down" &&
            row < size - 1
        )
            pos += size;

        if (
            direction === "left" &&
            col > 0
        )
            pos--;

        if (
            direction === "right" &&
            col < size - 1
        )
            pos++;

        render();

        if (
            pos ===
            size * size - 1
        ) {

            setTimeout(
                () => nextLevel(
                    160 + currentLevel * 5
                ),
                250
            );
        }
    }

    $("mazeUp").onclick =
        () => move("up");

    $("mazeDown").onclick =
        () => move("down");

    $("mazeLeft").onclick =
        () => move("left");

    $("mazeRight").onclick =
        () => move("right");

    return () => {};
}


/* =========================================================
   CAR
========================================================= */

function playCar() {

    const root =
        $("gameContent");

    root.innerHTML = `
        <div class="race-board">

            <div class="race-road"></div>

            <div
                id="playerCar"
                class="player-car"
            >
                🏎️
            </div>

            <div
                id="raceObstacle"
                class="obstacle"
            >
                🚧
            </div>

            <div class="racing-controls">

                <button id="raceLeft">
                    ◀
                </button>

                <button id="raceRight">
                    ▶
                </button>

            </div>

            <div class="racing-help">
                ← → / A D / MOBILE
            </div>

        </div>
    `;

    const player =
        $("playerCar");

    const obstacle =
        $("raceObstacle");

    const raceBoard =
        root.querySelector(
            ".race-board"
        );

    let x = 50;

    let obstacleY = -70;

    let alive = true;

    let animation;

    const speed =
        2 +
        currentLevel * 0.18;

    const lanePattern = [
        25,40,60,75,
        32,68,48,78,
        28,55,72,42,
        65,35,75,50,
        30,70,45,60
    ];

    function moveLeft() {

        x =
            Math.max(
                18,
                x - 6
            );

        player.style.left =
            `${x}%`;
    }

    function moveRight() {

        x =
            Math.min(
                82,
                x + 6
            );

        player.style.left =
            `${x}%`;
    }

    const keys =
        e => {

            if (
                e.key === "ArrowLeft" ||
                e.key.toLowerCase() === "a"
            )
                moveLeft();

            if (
                e.key === "ArrowRight" ||
                e.key.toLowerCase() === "d"
            )
                moveRight();
        };

    window.addEventListener(
        "keydown",
        keys
    );

    $("raceLeft").onpointerdown =
        moveLeft;

    $("raceRight").onpointerdown =
        moveRight;

    obstacle.style.left =
        `${lanePattern[currentLevel - 1]}%`;

    function loop() {

        if (!alive)
            return;

        obstacleY += speed;

        obstacle.style.top =
            `${obstacleY}px`;

        if (
            obstacleY >
            raceBoard.clientHeight
        ) {

            obstacleY = -80;

            obstacle.style.left =
                `${lanePattern[currentLevel - 1]}%`;
        }

        const p =
            player.getBoundingClientRect();

        const o =
            obstacle.getBoundingClientRect();

        if (
            p.left < o.right &&
            p.right > o.left &&
            p.top < o.bottom &&
            p.bottom > o.top
        ) {

            alive = false;

            obstacle.textContent =
                "💥";

            setTimeout(
                () => launchActualGame(),
                650
            );

            return;
        }

        if (
            obstacleY >
            raceBoard.clientHeight * 0.65
        ) {

            alive = false;

            nextLevel(
                220 + currentLevel * 10
            );

            return;
        }

        animation =
            requestAnimationFrame(
                loop
            );
    }

    animation =
        requestAnimationFrame(
            loop
        );

    return () => {

        alive = false;

        cancelAnimationFrame(
            animation
        );

        window.removeEventListener(
            "keydown",
            keys
        );
    };
}


/* =========================================================
   BIKE
========================================================= */

function playBike() {

    const root =
        $("gameContent");

    root.innerHTML = `
        <div class="race-board">

            <div
                class="race-road"
                style="
                    transform:skewY(-5deg)
                "
            ></div>

            <div
                id="playerBike"
                class="player-bike"
            >
                🏍️
            </div>

            <div
                id="bikeObstacle"
                class="obstacle"
            >
                🪨
            </div>

            <div class="racing-controls">

                <button id="bikeLeft">
                    ◀
                </button>

                <button id="bikeRight">
                    ▶
                </button>

            </div>

            <div class="racing-help">
                ← → / A D / MOBILE
            </div>

        </div>
    `;

    const player =
        $("playerBike");

    const obstacle =
        $("bikeObstacle");

    const raceBoard =
        root.querySelector(
            ".race-board"
        );

    let x = 50;

    let y = -80;

    let alive = true;

    let animation;

    const speed =
        2.2 +
        currentLevel * 0.2;

    const positions = [
        28,62,45,75,
        35,70,25,55,
        78,42,65,30,
        58,22,72,48,
        33,68,40,76
    ];

    function left() {

        x =
            Math.max(
                18,
                x - 6
            );

        player.style.left =
            `${x}%`;
    }

    function right() {

        x =
            Math.min(
                82,
                x + 6
            );

        player.style.left =
            `${x}%`;
    }

    const keys =
        e => {

            if (
                e.key === "ArrowLeft" ||
                e.key.toLowerCase() === "a"
            )
                left();

            if (
                e.key === "ArrowRight" ||
                e.key.toLowerCase() === "d"
            )
                right();
        };

    window.addEventListener(
        "keydown",
        keys
    );

    $("bikeLeft").onpointerdown =
        left;

    $("bikeRight").onpointerdown =
        right;

    obstacle.style.left =
        `${positions[currentLevel - 1]}%`;

    function loop() {

        if (!alive)
            return;

        y += speed;

        obstacle.style.top =
            `${y}px`;

        if (
            y >
            raceBoard.clientHeight
        ) {

            y = -90;

            obstacle.style.left =
                `${positions[currentLevel - 1]}%`;
        }

        const p =
            player.getBoundingClientRect();

        const o =
            obstacle.getBoundingClientRect();

        if (
            p.left < o.right &&
            p.right > o.left &&
            p.top < o.bottom &&
            p.bottom > o.top
        ) {

            alive = false;

            obstacle.textContent =
                "💥";

            setTimeout(
                () => launchActualGame(),
                650
            );

            return;
        }

        if (
            y >
            raceBoard.clientHeight * 0.65
        ) {

            alive = false;

            nextLevel(
                230 + currentLevel * 10
            );

            return;
        }

        animation =
            requestAnimationFrame(
                loop
            );
    }

    animation =
        requestAnimationFrame(
            loop
        );

    return () => {

        alive = false;

        cancelAnimationFrame(
            animation
        );

        window.removeEventListener(
            "keydown",
            keys
        );
    };
}


/* =========================================================
   NAVIGATION
========================================================= */

function showHome() {

    cleanupCurrentGame();

    hideLevelCompleteScreen();

    if ($("gamePage"))
        $("gamePage").style.display =
            "none";

    if ($("homePage"))
        $("homePage").style.display =
            "block";

    if ($("resultOverlay"))
        $("resultOverlay")
            .classList.remove("show");

    renderHomeStats();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   MENU
========================================================= */

function openMenu() {

    $("sideMenu")
        ?.classList.add("open");

    $("menuOverlay")
        ?.classList.add("show");
}

function closeMenu() {

    $("sideMenu")
        ?.classList.remove("open");

    $("menuOverlay")
        ?.classList.remove("show");
}

$("menuButton")?.addEventListener(
    "click",
    openMenu
);

$("closeMenu")?.addEventListener(
    "click",
    closeMenu
);

$("menuOverlay")?.addEventListener(
    "click",
    closeMenu
);

$("menuHome")?.addEventListener(
    "click",
    () => {

        closeMenu();
        showHome();
    }
);

$("menuGames")?.addEventListener(
    "click",
    () => {

        closeMenu();
        showHome();

        setTimeout(() => {

            $("allGamesSection")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        }, 100);
    }
);


/* =========================================================
   SCOREBOARD
========================================================= */

function createScoreboard() {

    let overlay =
        $("scoreboardOverlay");

    if (overlay)
        return overlay;

    overlay =
        document.createElement("div");

    overlay.id =
        "scoreboardOverlay";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10001;
        display:none;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(3,7,18,.94);
        backdrop-filter:blur(12px);
    `;

    overlay.innerHTML = `
        <div
            style="
                width:min(950px,100%);
                max-height:90vh;
                overflow:auto;
                padding:30px 22px;
                border-radius:24px;
                background:rgba(15,23,42,.99);
                border:1px solid rgba(117,103,255,.45);
                box-shadow:0 20px 80px rgba(0,0,0,.5);
            "
        >
            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:15px;
                    margin-bottom:20px;
                "
            >
                <h2 style="margin:0;">
                    🏆 SCOREBOARD
                </h2>

                <button
                    id="closeScoreboard"
                    class="game-option"
                    style="padding:10px 16px;"
                >
                    ✕
                </button>
            </div>

            <div id="scoreboardContent"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    $("closeScoreboard").onclick =
        closeScoreboard;

    overlay.addEventListener(
        "click",
        e => {
            if (e.target === overlay)
                closeScoreboard();
        }
    );

    return overlay;
}

function renderScoreboard() {

    const scores =
        getScores();

    const content =
        $("scoreboardContent");

    if (!content)
        return;

    if (!scores.length) {

        content.innerHTML = `
            <div
                style="
                    text-align:center;
                    padding:35px 10px;
                "
            >
                <div style="font-size:45px;">
                    🎮
                </div>

                <p>
                    No completed games yet.
                </p>
            </div>
        `;

        return;
    }

    content.innerHTML = `
        <div
            style="
                overflow-x:auto;
            "
        >
            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                    min-width:650px;
                "
            >
                <thead>
                    <tr>
                        <th
                            style="
                                text-align:left;
                                padding:12px;
                            "
                        >
                            Game
                        </th>

                        <th
                            style="
                                text-align:left;
                                padding:12px;
                            "
                        >
                            Score
                        </th>

                        <th
                            style="
                                text-align:left;
                                padding:12px;
                            "
                        >
                            Date
                        </th>

                        <th
                            style="
                                text-align:left;
                                padding:12px;
                            "
                        >
                            Player
                        </th>
                    </tr>
                </thead>

                <tbody>
                    ${scores.map(score => `
                        <tr>
                            <td
                                style="
                                    padding:12px;
                                    border-top:1px solid rgba(255,255,255,.08);
                                "
                            >
                                ${escapeHTML(
                                    score.gameName || "Unknown Game"
                                )}
                            </td>

                            <td
                                style="
                                    padding:12px;
                                    border-top:1px solid rgba(255,255,255,.08);
                                    font-weight:700;
                                "
                            >
                                ${Number(score.score) || 0}
                            </td>

                            <td
                                style="
                                    padding:12px;
                                    border-top:1px solid rgba(255,255,255,.08);
                                "
                            >
                                ${escapeHTML(
                                    score.date || ""
                                )}
                            </td>

                            <td
                                style="
                                    padding:12px;
                                    border-top:1px solid rgba(255,255,255,.08);
                                "
                            >
                                ${escapeHTML(
                                    score.playerName || "Player"
                                )}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function openScoreboard() {

    closeMenu();

    const overlay =
        createScoreboard();

    renderScoreboard();

    overlay.style.display =
        "flex";
}

function closeScoreboard() {

    const overlay =
        $("scoreboardOverlay");

    if (overlay)
        overlay.style.display =
            "none";
}

$("menuScores")?.addEventListener(
    "click",
    openScoreboard
);


/* =========================================================
   FEEDBACK HISTORY
========================================================= */

function createFeedbackHistory() {

    const modal =
        $("feedbackModal");

    if (!modal)
        return null;

    let history =
        $("feedbackHistory");

    if (history)
        return history;

    history =
        document.createElement("div");

    history.id =
        "feedbackHistory";

    history.style.cssText = `
        margin-top:25px;
        padding-top:20px;
        border-top:1px solid rgba(255,255,255,.12);
        max-height:320px;
        overflow:auto;
    `;

    modal.appendChild(history);

    return history;
}

function renderFeedbackHistory() {

    const history =
        createFeedbackHistory();

    if (!history)
        return;

    const feedback =
        getFeedback();

    if (!feedback.length) {

        history.innerHTML = `
            <h3>
                FEEDBACK HISTORY
            </h3>

            <p>
                No feedback submitted yet.
            </p>
        `;

        return;
    }

    history.innerHTML = `
        <h3>
            FEEDBACK HISTORY
        </h3>

        ${feedback.map(item => `
            <div
                style="
                    padding:15px 0;
                    border-bottom:1px solid rgba(255,255,255,.08);
                "
            >
                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                        flex-wrap:wrap;
                    "
                >
                    <strong>
                        ${escapeHTML(
                            item.playerName || "Player"
                        )}
                    </strong>

                    <span>
                        ${"⭐".repeat(
                            Math.max(
                                0,
                                Math.min(
                                    5,
                                    Number(item.rating) || 0
                                )
                            )
                        )}
                    </span>
                </div>

                <p
                    style="
                        margin:8px 0;
                    "
                >
                    ${escapeHTML(
                        item.text || "No written feedback."
                    )}
                </p>

                <small>
                    ${escapeHTML(
                        item.gameName || "Game Hub"
                    )}
                    ${item.gameId
                        ? ` • Game ID: ${escapeHTML(item.gameId)}`
                        : ""}
                    <br>
                    ${escapeHTML(
                        item.date || ""
                    )}
                </small>
            </div>
        `).join("")}
    `;
}


/* =========================================================
   MENU FEEDBACK
========================================================= */

$("menuFeedback")?.addEventListener(
    "click",
    () => {

        closeMenu();

        renderFeedbackHistory();

        $("feedbackModal")
            ?.classList.add("show");
    }
);

$("logoutButton")?.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            STORAGE.name
        );

        location.reload();
    }
);


/* =========================================================
   LOGIN
========================================================= */

function enterHub() {

    const value =
        $("playerName")
            .value
            .trim();

    if (!value) {

        showToast(
            "⚠️",
            "Please enter your name."
        );

        $("playerName").focus();

        return;
    }

    playerName = value;

    localStorage.setItem(
        STORAGE.name,
        playerName
    );

    if ($("headerName"))
        $("headerName").textContent =
            playerName;

    if ($("welcomeName"))
        $("welcomeName").textContent =
            playerName;

    $("loginScreen").style.display =
        "none";

    $("mainApp").style.display =
        "block";

    renderGames();
    renderFeatured();

    const streak =
        updateStreak();

    renderHomeStats();

    setTimeout(
        () => showStreak(streak),
        500
    );
}

$("enterHub")?.addEventListener(
    "click",
    enterHub
);

$("playerName")?.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter")
            enterHub();
    }
);


/* =========================================================
   STREAK POPUP
========================================================= */

function showStreak(streak) {

    if (!$("streakOverlay"))
        return;

    $("streakPopupNumber")
        .textContent =
        streak;

    if ($("headerStreak"))
        $("headerStreak").textContent =
            streak;

    if ($("streakNumber"))
        $("streakNumber").textContent =
            streak;

    $("streakOverlay")
        .classList.add("show");
}

$("streakOverlay")?.addEventListener(
    "click",
    () => {

        $("streakOverlay")
            .classList.remove("show");
    }
);


/* =========================================================
   SEARCH
========================================================= */

$("gameSearch")?.addEventListener(
    "input",
    renderGames
);


/* =========================================================
   CATEGORIES
========================================================= */

/*
   Your HTML uses .category-tab.
   The old JS was looking for .category,
   so category filtering could fail.
*/

document
    .querySelectorAll(
        ".category-tab"
    )
    .forEach(button => {

        button.onclick = () => {

            document
                .querySelectorAll(
                    ".category-tab"
                )
                .forEach(
                    b =>
                        b.classList.remove(
                            "active"
                        )
                );

            button.classList.add(
                "active"
            );

            selectedCategory =
                button.dataset.category;

            renderGames();
        };
    });


/* =========================================================
   HOME BUTTONS
========================================================= */

$("heroGamesButton")?.addEventListener(
    "click",
    () => {

        $("allGamesSection")
            ?.scrollIntoView({
                behavior: "smooth"
            });
    }
);

$("viewAllGamesButton")?.addEventListener(
    "click",
    () => {

        $("allGamesSection")
            ?.scrollIntoView({
                behavior: "smooth"
            });
    }
);

$("heroPlayButton")?.addEventListener(
    "click",
    () => {

        startGame(
            randomInt(1,50)
        );
    }
);


/* =========================================================
   GAME BACK
========================================================= */

$("gameBackButton")?.addEventListener(
    "click",
    showHome
);

$("gameHomeButton")?.addEventListener(
    "click",
    showHome
);


/* =========================================================
   RESULT BUTTONS
========================================================= */

$("resultHomeButton")?.addEventListener(
    "click",
    showHome
);

$("playAgainButton")?.addEventListener(
    "click",
    () => {

        $("resultOverlay")
            ?.classList.remove("show");

        if (currentGame)
            startGame(
                currentGame.id
            );
    }
);


/* =========================================================
   FEEDBACK
========================================================= */

document
    .querySelectorAll(
        "#rating button"
    )
    .forEach(button => {

        button.onclick = () => {

            selectedRating =
                Number(
                    button.dataset.rating
                );

            document
                .querySelectorAll(
                    "#rating button"
                )
                .forEach(b => {

                    b.classList.toggle(
                        "selected",
                        Number(
                            b.dataset.rating
                        ) <= selectedRating
                    );
                });
        };
    });

$("closeFeedback")?.addEventListener(
    "click",
    () => {

        $("feedbackModal")
            ?.classList.remove("show");
    }
);

$("submitFeedback")?.addEventListener(
    "click",
    () => {

        const text =
            $("feedbackText")
                .value
                .trim();

        if (!selectedRating) {

            showToast(
                "⭐",
                "Please select a rating."
            );

            return;
        }

        saveFeedback(
            selectedRating,
            text
        );

        $("feedbackText").value =
            "";

        selectedRating = 0;

        document
            .querySelectorAll(
                "#rating button"
            )
            .forEach(
                b =>
                    b.classList.remove(
                        "selected"
                    )
            );

        renderFeedbackHistory();

        showToast(
            "✓",
            "Thanks for your feedback!"
        );

        $("feedbackModal")
            ?.classList.remove("show");
    });


/* =========================================================
   MUSIC
========================================================= */

$("musicButton")?.addEventListener(
    "click",
    () => {

        musicEnabled =
            !musicEnabled;

        localStorage.setItem(
            STORAGE.music,
            musicEnabled
                ? "on"
                : "off"
        );

        showToast(
            musicEnabled
                ? "🎵"
                : "🔇",
            musicEnabled
                ? "Music ON"
                : "Music OFF"
        );
    }
);


/* =========================================================
   INITIAL LOGIN STATE
========================================================= */

const savedName =
    localStorage.getItem(
        STORAGE.name
    );

if (savedName) {

    playerName =
        savedName;

    if ($("playerName"))
        $("playerName").value =
            savedName;
}


/* =========================================================
   INITIAL RENDER
========================================================= */

if (savedName) {

    renderGames();
    renderFeatured();

    if ($("headerName"))
        $("headerName").textContent =
            savedName;

    if ($("welcomeName"))
        $("welcomeName").textContent =
            savedName;

    /*
       FIX:
       Previously the saved-login path did not call
       updateStreak(), so refreshing/reopening the website
       could leave the streak display unchanged.
    */
    const initialStreak =
        updateStreak();

    renderHomeStats();

    setTimeout(
        () => showStreak(initialStreak),
        500
    );
}