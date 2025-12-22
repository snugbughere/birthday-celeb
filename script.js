// Global audio state
let backgroundAudio = null;
let isBirthdayMode = false;

// 1. Autoplay ambient music on load
function initBackgroundMusic() {
  backgroundAudio = new Audio('assets/welcome_music.mp3');
  backgroundAudio.loop = true;
  backgroundAudio.volume = 0.3;
  backgroundAudio.muted = true;  // Start muted (policy-compliant)
  backgroundAudio.play().catch(e => console.log('Started muted'));
}

// 3. Birthday mode switch (music + balloons)
function switchToBirthdayMode() {
  if (backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio = new Audio('assets/music/birthday-song.mp3');
    backgroundAudio.loop = true;
    backgroundAudio.volume = 0.5;
    backgroundAudio.muted = true;  // Start muted
    backgroundAudio.play().catch(e => console.log('Birthday music started muted'));
  }
  isBirthdayMode = true;
  document.getElementById('countdownScreen').style.display = 'none';
  document.getElementById('birthdayScreen').style.display = 'block';
  createBalloons();
}

function getRemainingTime(target) {
  const now = new Date().getTime();
  const distance = target - now;

  if (distance <= 0) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    total: distance,
    days,
    hours,
    minutes,
    seconds
  };
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

function showScreen(idToShow) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((s) => s.classList.add("hidden"));
  document.getElementById(idToShow).classList.remove("hidden");
}

function renderCountdown(targetDate) {
  const target = new Date(targetDate).getTime();

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  function update() {
    const t = getRemainingTime(target);

    if (t.total <= 0) {
      clearInterval(intervalId);
      showScreen("birthday-screen");
      triggerBirthdayEffects();
      return;
    }

    daysEl.textContent = pad(t.days);
    hoursEl.textContent = pad(t.hours);
    minutesEl.textContent = pad(t.minutes);
    secondsEl.textContent = pad(t.seconds);
  }

  update();
  const intervalId = setInterval(update, 1000);
}

function renderWishes() {
  const container = document.getElementById("wishes-container");
  container.innerHTML = "";

  CONFIG.wishes.forEach((wish, index) => {
    const card = document.createElement("div");
    card.className = "wish-card";
    card.dataset.index = index;

    const img = document.createElement("img");
    img.className = "wish-thumb";
    img.src = wish.thumbnail;
    img.alt = wish.name;

    const name = document.createElement("div");
    name.className = "wish-name";
    name.textContent = wish.name;

    const msg = document.createElement("div");
    msg.className = "wish-message";
    msg.textContent = wish.message;

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(msg);
    container.appendChild(card);
  });
}

function setupModal() {
  const modal = document.getElementById("video-modal");
  const modalVideo = document.getElementById("modal-video");
  const modalCaption = document.getElementById("modal-caption");
  const closeBtn = document.getElementById("modal-close");
  const container = document.getElementById("wishes-container");

  container.addEventListener("click", (e) => {
    const card = e.target.closest(".wish-card");
    if (!card) return;

    const index = card.dataset.index;
    const wish = CONFIG.wishes[index];

    modalVideo.src = wish.videoUrl;
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});

    modalCaption.textContent = `${wish.name} — ${wish.message}`;
    modal.classList.remove("hidden");
  });

  function closeModal() {
    modal.classList.add("hidden");
    modalVideo.pause();
    modalVideo.src = "";
  }

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function setupMusic() {
  const audio = document.getElementById("birthday-audio");
  const btn = document.getElementById("play-music-btn");

  let isPlaying = false;

  btn.addEventListener("click", async () => {
    try {
      if (!isPlaying) {
        await audio.play();
        isPlaying = true;
        btn.textContent = "Pause Birthday Music ⏸️";
      } else {
        audio.pause();
        isPlaying = false;
        btn.textContent = "Play Birthday Music 🎵";
      }
    } catch (err) {
      console.error("Audio play failed", err);
    }
  });
}

/* Fancy background + confetti */

function createFloatingDecor() {
  const app = document.getElementById("app");
  const decorContainer = document.createElement("div");
  decorContainer.id = "floating-decor";
  app.appendChild(decorContainer);

  for (let i = 0; i < 18; i++) {
    const dot = document.createElement("div");
    dot.className = "floating-dot";
    dot.style.left = Math.random() * 100 + "vw";
    dot.style.animationDelay = Math.random() * 8 + "s";
    dot.style.animationDuration = 12 + Math.random() * 10 + "s";
    decorContainer.appendChild(dot);
  }
}

function triggerBirthdayEffects() {
  fireConfetti();
}

function fireConfetti() {
  const app = document.getElementById("app");
  const confettiContainer = document.createElement("div");
  confettiContainer.id = "confetti-container";
  app.appendChild(confettiContainer);

  const colors = ["#f97316", "#ec4899", "#22c55e", "#38bdf8", "#eab308"];

  for (let i = 0; i < 160; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 2 + "s";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(piece);
  }

  setTimeout(() => {
    confettiContainer.remove();
  }, 100);
}

function createBalloons() {
  const container = document.getElementById('balloonsContainer');
  if (!container) return;
  
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
  
  setInterval(() => {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.left = Math.random() * 100 + '%';
    balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.animationDuration = (6 + Math.random() * 4) + 's';
    balloon.style.width = (30 + Math.random() * 30) + 'px';
    balloon.style.height = (40 + Math.random() * 20) + 'px';
    container.appendChild(balloon);
    
    setTimeout(() => balloon.remove(), 12000);
  }, 100);  // New balloon every 0.8s
}

// 4. Video play pauses background music
function playVideoWish(videoSrc) {
  const videoPlayer = document.getElementById('wishVideo');
  videoPlayer.src = videoSrc;
  document.getElementById('videoModal').style.display = 'flex';
  
  if (backgroundAudio && !backgroundAudio.paused) {
    backgroundAudio.pause();
  }
  
  videoPlayer.onended = videoPlayer.onpause = () => {
    if (backgroundAudio && !backgroundAudio.paused === false) {
      backgroundAudio.play().catch(e => {});
    }
  };
}


function init() {
  document.title = CONFIG.pageTitle;
  document.getElementById("before-title").textContent = CONFIG.beforeTitle;
  document.getElementById("witty-text").textContent = CONFIG.wittyBeforeText;
  document.getElementById("birthday-title").textContent = CONFIG.pageTitle;

  const audio = document.getElementById("birthday-audio");
  audio.src = CONFIG.musicUrl;

  createFloatingDecor();
  renderWishes();
  setupModal();
  setupMusic();

  const target = new Date(CONFIG.targetDate).getTime();
  const now = new Date().getTime();

  if (now < target) {
    showScreen("countdown-screen");
    renderCountdown(CONFIG.targetDate);
  } else {
    showScreen("birthday-screen");
    triggerBirthdayEffects();
  }
  initBackgroundMusic();
}

// Init on page load
document.addEventListener('DOMContentLoaded', () => {
  init();
  // Your existing countdown/render logic here
  // In renderCountdown(): if time <= 0, call switchToBirthdayMode()
});
