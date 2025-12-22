// Global audio state
let backgroundAudio = null;
let isBirthdayMode = false;
let hasUserInteracted = false;
let currentWishIndex = 0;  // Tracks which video is unlocked
let totalWishes = 0;

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
  if (backgroundAudio) backgroundAudio.pause();
  backgroundAudio = new Audio(CONFIG.musicUrl);  // Uses your config.js music
  backgroundAudio.loop = true;
  backgroundAudio.volume = 0.5;
  backgroundAudio.muted = true;

  // Resume if user interacted, otherwise wait
  if (hasUserInteracted) {
    backgroundAudio.muted = false;  // Full volume after interaction
  }

  backgroundAudio.play().then(() => {
    console.log('✅ Birthday music started');
    const unmuteBtn = document.getElementById('unmuteBtn');
    if (unmuteBtn) unmuteBtn.style.display = 'block';
  }).catch(e => {
    console.log('🎵 Music ready - tap anywhere to unmute');
    // Hide error - unmute button handles it
  });
  
  isBirthdayMode = true;
  document.getElementById('countdown-screen').style.display = 'none';
  document.getElementById('birthday-screen').style.display = 'block';
  createBalloons();
  triggerBirthdayEffects();
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
      switchToBirthdayMode();
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
  totalWishes = CONFIG.wishes.length;

  CONFIG.wishes.forEach((wish, index) => {
    const card = document.createElement("div");
    card.className = "wish-card";
    card.dataset.index = index;

    // Video thumbnail
    const videoThumb = document.createElement("video");
    videoThumb.className = "wish-thumb video-thumb";
    videoThumb.src = wish.videoUrl;
    videoThumb.muted = true;
    videoThumb.loop = true;
    videoThumb.preload = "metadata";
    videoThumb.playsInline = true;
    videoThumb.dataset.index = index;

    // Lock overlay for locked videos
    const lockOverlay = document.createElement("div");
    lockOverlay.className = "lock-overlay";
    lockOverlay.innerHTML = index === 0 ? "👆 Tap to Start" : "🔒 Locked";

    // Blink effect for current video
    const blinkIndicator = document.createElement("div");
    blinkIndicator.className = "blink-indicator";
    blinkIndicator.textContent = "▶️";

    const name = document.createElement("div");
    name.className = "wish-name";
    name.textContent = wish.name;

    const msg = document.createElement("div");
    msg.className = "wish-message";
    msg.textContent = wish.message;

    card.appendChild(videoThumb);
    card.appendChild(lockOverlay);
    card.appendChild(blinkIndicator);
    card.appendChild(name);
    card.appendChild(msg);
    container.appendChild(card);

    // Initial state
    updateWishState(index);
  });

  // Auto-blink first video
  blinkCurrentWish();
}

function setupModal() {
  const modal = document.getElementById("video-modal");
  const modalVideo = document.getElementById("modal-video");
  const modalCaption = document.getElementById("modal-caption");
  const closeBtn = document.getElementById("modal-close");
  const container = document.getElementById("wishes-container");

  container.addEventListener("click", (e) => {
  const card = e.target.closest(".wish-card");
  if (!card || !card.classList.contains('active')) return;  // Only active card clickable

  const index = card.dataset.index;
  const wish = CONFIG.wishes[index];

  // Open modal...
  modalVideo.src = wish.videoUrl;
  modalVideo.play();

  // Listen for video end → unlock next
  const onVideoEnd = () => {
    modalVideo.removeEventListener('ended', onVideoEnd);
    unlockNextWish();
  };
  modalVideo.addEventListener('ended', onVideoEnd);
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

function unmuteMusic() {
  backgroundAudio = isBirthdayMode ? new Audio(CONFIG.musicUrl) : new Audio(CONFIG.welcomeUrl);  // Uses your config.js music
  backgroundAudio.loop = true;
  backgroundAudio.volume = 0.5;
  if (backgroundAudio) {
    backgroundAudio.muted = false;
    if (!backgroundAudio.muted) {
      document.getElementById('unmuteBtn').style.display = 'none';
      backgroundAudio.play().then(() => {
        console.log('✅ Birthday music started');
        const unmuteBtn = document.getElementById('unmuteBtn');
        if (unmuteBtn) unmuteBtn.style.display = 'block';
      }).catch(e => {
        console.log('🎵 Music ready - tap anywhere to unmute');
        // Hide error - unmute button handles it
      });
    }
  }
}


function updateWishState(index) {
  const card = document.querySelector(`[data-index="${index}"]`);
  const videoThumb = card.querySelector('.wish-thumb');
  const lockOverlay = card.querySelector('.lock-overlay');
  const blinkIndicator = card.querySelector('.blink-indicator');

  if (index < currentWishIndex) {
    // Unlocked (watched)
    card.classList.add('unlocked');
    lockOverlay.style.display = 'none';
    blinkIndicator.style.display = 'none';
    videoThumb.play().catch(() => {});
  } else if (index === currentWishIndex) {
    // Current (blinking)
    card.classList.add('active');
    lockOverlay.style.display = index === 0 ? 'block' : 'none';
    blinkIndicator.style.display = 'block';
    videoThumb.play().catch(() => {});
  } else {
    // Locked (future)
    card.classList.remove('active', 'unlocked');
    lockOverlay.style.display = 'block';
    blinkIndicator.style.display = 'none';
    videoThumb.pause();
    videoThumb.currentTime = 0;
    card.classList.add('locked');
  }
}

function blinkCurrentWish() {
  const currentCard = document.querySelector('.wish-card.active .blink-indicator');
  if (currentCard) {
    currentCard.style.animationPlayState = 'running';
  }
}

function unlockNextWish() {
  currentWishIndex++;
  if (currentWishIndex < totalWishes) {
    // Update all cards
    document.querySelectorAll('.wish-card').forEach((card, index) => {
      updateWishState(index);
    });
    blinkCurrentWish();
  }
}



function init() {
  document.title = CONFIG.pageTitle;
  document.getElementById("before-title").textContent = CONFIG.beforeTitle;
  document.getElementById("witty-text").textContent = CONFIG.wittyBeforeText;
  document.getElementById("birthday-title").textContent = CONFIG.pageTitle;


  createFloatingDecor();
  renderWishes();
  setupModal();

  const target = new Date(CONFIG.targetDate).getTime();
  const now = new Date().getTime();

  if (now < target) {
    showScreen("countdown-screen");
    renderCountdown(CONFIG.targetDate);
    initBackgroundMusic();
  } else {
    showScreen("birthday-screen");
    switchToBirthdayMode();
  }
}


document.addEventListener('click', () => hasUserInteracted = true, {once: true});
document.addEventListener('keydown', () => hasUserInteracted = true, {once: true});

// Init on page load
document.addEventListener('DOMContentLoaded', () => {
  init();
  // Your existing countdown/render logic here
  // In renderCountdown(): if time <= 0, call switchToBirthdayMode()
});
