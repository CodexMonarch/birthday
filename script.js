// --- Web Audio Synthesizer (Zero External Dependencies) ---
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.isPlayingMusic = false;
    this.musicTimeout = null;
    this.currentNoteIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a single synthesized note
  playTone(freq, duration = 0.3, type = 'sine', gainVal = 0.2) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Balloon Pop Sound FX
  playPop() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Candle Blow Sound FX
  playBlow() {
    this.init();
    // Noise buffer for air whoosh
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // Cheer / Celebration Chime
  playCheerChime() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.5, 'triangle', 0.25);
      }, idx * 120);
    });
  }

  // Synthesized "Happy Birthday" Melody
  playBirthdayMelody(onEndCallback) {
    this.init();
    this.isPlayingMusic = true;

    // Note frequencies in Hz
    const N = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
      G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
      G5: 783.99, A5: 880.00, Bb4: 466.16
    };

    // Melody: [Note, duration in beats]
    const song = [
      [N.G4, 0.75], [N.G4, 0.25], [N.A4, 1], [N.G4, 1], [N.C5, 1], [N.B4, 2],
      [N.G4, 0.75], [N.G4, 0.25], [N.A4, 1], [N.G4, 1], [N.D5, 1], [N.C5, 2],
      [N.G4, 0.75], [N.G4, 0.25], [N.G5, 1], [N.E5, 1], [N.C5, 1], [N.B4, 1], [N.A4, 1],
      [N.F5, 0.75], [N.F5, 0.25], [N.E5, 1], [N.C5, 1], [N.D5, 1], [N.C5, 2.5]
    ];

    const tempo = 150; // BPM
    const beatDuration = 60 / tempo;

    let totalDelay = 0;
    this.songTimeouts = [];

    song.forEach(([freq, beats], index) => {
      const delay = totalDelay;
      const duration = beats * beatDuration;
      
      const t = setTimeout(() => {
        if (!this.isPlayingMusic) return;
        this.playTone(freq, duration * 0.9, 'triangle', 0.28);
      }, delay * 1000);

      this.songTimeouts.push(t);
      totalDelay += duration;
    });

    const endTimeout = setTimeout(() => {
      this.isPlayingMusic = false;
      if (onEndCallback) onEndCallback();
    }, totalDelay * 1000);

    this.songTimeouts.push(endTimeout);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.songTimeouts) {
      this.songTimeouts.forEach(t => clearTimeout(t));
      this.songTimeouts = [];
    }
  }
}

// Instantiate Audio
const audio = new SoundEffects();

// --- Confetti Blaster Helper ---
function fireConfettiBurst(x = 0.5, y = 0.5) {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x, y },
      colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#10b981', '#ffffff']
    });
  }
}

function fireGrandFireworks() {
  if (typeof confetti !== 'function') return;

  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1200 };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 40 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 } }));
  }, 250);
}

// --- Floating Background Balloons Spawner ---
function initBackgroundBalloons() {
  const sky = document.getElementById('balloon-sky');
  if (!sky) return;

  const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#f59e0b', '#10b981'];

  for (let i = 0; i < 15; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'sky-balloon';
    const size = Math.floor(Math.random() * 35) + 35;
    balloon.style.width = `${size}px`;
    balloon.style.height = `${size * 1.25}px`;
    balloon.style.left = `${Math.random() * 95}%`;
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.animationDuration = `${Math.random() * 10 + 12}s`;
    balloon.style.animationDelay = `${Math.random() * 10}s`;

    sky.appendChild(balloon);
  }
}

// --- Surprise Unboxing Screen ---
function initSurpriseModal() {
  const modal = document.getElementById('surprise-modal');
  const openBtn = document.getElementById('open-gift-btn');
  const giftBox = document.getElementById('gift-box');
  const replayBtn = document.getElementById('replay-surprise-btn');

  function openGift() {
    audio.playCheerChime();
    giftBox.classList.add('opened');
    fireGrandFireworks();

    setTimeout(() => {
      modal.classList.add('hidden');
      // Automatically kick off celebratory birthday tune
      toggleMusic(true);
    }, 1100);
  }

  if (openBtn) openBtn.addEventListener('click', openGift);
  if (giftBox) giftBox.addEventListener('click', openGift);

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      giftBox.classList.remove('opened');
      modal.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// --- Music & Party Mode Controls ---
function toggleMusic(forcePlay = null) {
  const musicBtn = document.getElementById('music-btn');
  const textSpan = musicBtn.querySelector('.btn-text');

  const shouldPlay = forcePlay !== null ? forcePlay : !audio.isPlayingMusic;

  if (shouldPlay) {
    audio.playBirthdayMelody(() => {
      textSpan.textContent = 'Play Song';
      musicBtn.classList.remove('active');
    });
    textSpan.textContent = 'Pause Song';
    musicBtn.classList.add('active');
  } else {
    audio.stopMusic();
    textSpan.textContent = 'Play Song';
    musicBtn.classList.remove('active');
  }
}

function initActionToolbar() {
  const musicBtn = document.getElementById('music-btn');
  const confettiBtn = document.getElementById('confetti-btn');
  const partyModeBtn = document.getElementById('party-mode-btn');

  if (musicBtn) {
    musicBtn.addEventListener('click', () => toggleMusic());
  }

  if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
      audio.playTone(880, 0.15, 'sine');
      fireGrandFireworks();
    });
  }

  if (partyModeBtn) {
    partyModeBtn.addEventListener('click', () => {
      document.body.classList.toggle('party-mode');
      partyModeBtn.classList.toggle('active');
      fireConfettiBurst();
    });
  }
}

// --- Cake & Candle Interaction ---
function initCakeInteraction() {
  const blowBtn = document.getElementById('blow-candles-btn');
  const cutBtn = document.getElementById('cut-cake-btn');
  const cakeStatus = document.getElementById('cake-status');
  const cakeSlice = document.getElementById('cake-slice');
  const flames = document.querySelectorAll('.flame');
  const smokes = document.querySelectorAll('.smoke');

  let candlesBlown = false;

  blowBtn.addEventListener('click', () => {
    audio.playBlow();
    flames.forEach(f => f.classList.add('extinguished'));
    smokes.forEach(s => s.classList.add('active'));

    candlesBlown = true;
    blowBtn.disabled = true;
    blowBtn.textContent = '💨 Candles Extinguished!';
    cutBtn.disabled = false;
    cakeStatus.textContent = 'Wishes made! Now cut the cake, Ankit! 🎂✨';

    fireConfettiBurst(0.5, 0.4);
  });

  cutBtn.addEventListener('click', () => {
    audio.playCheerChime();
    cakeSlice.classList.add('served');
    cutBtn.disabled = true;
    cutBtn.textContent = '🍰 Cake Served!';
    cakeStatus.innerHTML = '🎉 Happy Birthday Ankit! The first slice is yours! Enjoy the treat! 😋';

    fireGrandFireworks();
  });
}

// --- Balloon Popping Mini-Game ---
const balloonMessages = [
  "🔥 Ankit's swag has no match!",
  "☕ Always down for late-night chai & gossip!",
  "🍕 Never says no to a biryani & pizza treat!",
  "💪 The most loyal & dependable brother!",
  "🧠 Brain of a genius, heart of gold!",
  "👑 Legend in the making, keep shining Ankit!"
];

const balloonColors = [
  '#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#f59e0b'
];

function initBalloonGame() {
  const grid = document.getElementById('balloon-grid');
  const popCountElem = document.getElementById('pop-count');
  const msgBanner = document.getElementById('game-message-banner');
  const resetBtn = document.getElementById('reset-game-btn');

  let poppedCount = 0;

  function renderBalloons() {
    grid.innerHTML = '';
    poppedCount = 0;
    popCountElem.textContent = '0';
    msgBanner.textContent = 'Click any balloon to pop it!';

    balloonMessages.forEach((msg, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'game-balloon-wrapper';

      const balloon = document.createElement('div');
      balloon.className = 'game-balloon';
      balloon.style.backgroundColor = balloonColors[idx % balloonColors.length];
      balloon.style.borderBottomColor = balloonColors[idx % balloonColors.length];

      const string = document.createElement('div');
      string.className = 'balloon-string';

      wrapper.appendChild(balloon);
      wrapper.appendChild(string);

      wrapper.addEventListener('click', () => {
        if (wrapper.classList.contains('popped')) return;

        wrapper.classList.add('popped');
        audio.playPop();
        poppedCount++;
        popCountElem.textContent = poppedCount;
        msgBanner.textContent = msg;

        // Fire mini burst at balloon position
        const rect = wrapper.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        fireConfettiBurst(x, y);

        if (poppedCount === balloonMessages.length) {
          msgBanner.innerHTML = '🏆 <strong>ALL POPPED! Ankit is officially 100% AWESOME!</strong> 🥳';
          fireGrandFireworks();
        }
      });

      grid.appendChild(wrapper);
    });
  }

  resetBtn.addEventListener('click', () => {
    renderBalloons();
  });

  renderBalloons();
}

// --- Polaroid Real Photo Upload ---
function initPhotoUpload() {
  const fileInput = document.getElementById('photo-upload');
  const polaroidGrid = document.getElementById('polaroid-grid');

  if (!fileInput || !polaroidGrid) return;

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const cards = polaroidGrid.querySelectorAll('.polaroid-card');

    files.forEach((file, index) => {
      if (index >= cards.length) return; // Fill available slots

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgWrapper = cards[index].querySelector('.polaroid-img-wrapper');
        imgWrapper.innerHTML = `<img src="${event.target.result}" alt="Ankit memory">`;
      };
      reader.readAsDataURL(file);
    });

    fireConfettiBurst();
  });
}

// --- Interactive Wish Board ---
function initWishesBoard() {
  const form = document.getElementById('wish-form');
  const wishesWall = document.getElementById('wishes-wall');
  const authorInput = document.getElementById('wish-author');
  const emojiSelect = document.getElementById('wish-emoji');
  const textInput = document.getElementById('wish-text');

  // Load saved custom wishes from localStorage
  const savedWishes = JSON.parse(localStorage.getItem('ankit_birthday_wishes') || '[]');
  savedWishes.forEach(w => prependWishCard(w.author, w.emoji, w.text, w.time, false));

  function prependWishCard(author, emoji, text, time, persist = true) {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
      <div class="wish-header">
        <span class="wish-author">${escapeHtml(author)}</span>
        <span class="wish-badge">${emoji}</span>
      </div>
      <p class="wish-msg">${escapeHtml(text)}</p>
      <span class="wish-time">${time}</span>
    `;

    wishesWall.insertBefore(card, wishesWall.firstChild);

    if (persist) {
      savedWishes.unshift({ author, emoji, text, time });
      localStorage.setItem('ankit_birthday_wishes', JSON.stringify(savedWishes));
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = authorInput.value.trim();
      const emoji = emojiSelect.value;
      const text = textInput.value.trim();

      if (!author || !text) return;

      audio.playTone(659.25, 0.2, 'sine');
      prependWishCard(author, emoji, text, 'Just now', true);
      fireConfettiBurst();

      form.reset();
    });
  }
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundBalloons();
  initSurpriseModal();
  initActionToolbar();
  initCakeInteraction();
  initBalloonGame();
  initPhotoUpload();
  initWishesBoard();
});
