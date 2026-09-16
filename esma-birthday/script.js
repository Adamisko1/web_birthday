/* Edit texts here if you want */
const CONFIG = {
  name: "Esma",
  age: 20,
  candleCount: 5,
  toasts: {
    open: "Surprise unlocked",
    candle: "Whoosh… one less flame",
    wish: "Wish sealed. Happy birthday!",
    meow: "mrrp~",
    relight: "Candles are back — make another wish",
    finale: "Happy 20th, Esma!",
  },
  candleStatus: {
    many: "candles still glowing",
    one: "1 candle still glowing",
    done: "All out — wish granted!",
  },
};

const gate = document.getElementById("gate");
const openGift = document.getElementById("openGift");
const giftBox = openGift.querySelector(".gift-box");
const hero = document.getElementById("hero");
const cakeSection = document.getElementById("cakeSection");
const photosSection = document.getElementById("photosSection");
const letterSection = document.getElementById("letterSection");
const finale = document.getElementById("finale");
const candlesEl = document.getElementById("candles");
const candleStatus = document.getElementById("candleStatus");
const relight = document.getElementById("relight");
const cakeStage = document.getElementById("cakeStage");
const sparkles = document.getElementById("sparkles");
const toast = document.getElementById("toast");
const scrollCake = document.getElementById("scrollCake");
const playMeowBtn = document.getElementById("playMeow");
const confettiAgain = document.getElementById("confettiAgain");
const fx = document.getElementById("fx");
const pawField = document.getElementById("pawField");
const floatingCats = document.getElementById("floatingCats");

let litCount = CONFIG.candleCount;
let audioCtx = null;
let toastTimer;
let unlockedAfterCandles = false;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("is-on");
  }, 2200);
}

function wait(ms) {
  return new Promise(function (r) {
    setTimeout(r, ms);
  });
}

function spawnPaws() {
  for (var i = 0; i < 14; i++) {
    var paw = document.createElement("div");
    paw.className = "paw";
    paw.style.left = Math.random() * 100 + "%";
    paw.style.top = Math.random() * 100 + "%";
    paw.style.setProperty("--r", Math.random() * 60 - 30 + "deg");
    paw.style.setProperty("--d", Math.random() * 6 + "s");
    paw.innerHTML =
      '<span class="toe t1"></span><span class="toe t2"></span><span class="toe t3"></span><span class="pad"></span>';
    pawField.appendChild(paw);
  }
}

function buildCandles() {
  candlesEl.innerHTML = "";
  litCount = CONFIG.candleCount;
  cakeStage.classList.remove("is-wished");
  relight.classList.add("is-hidden");
  for (var i = 0; i < CONFIG.candleCount; i++) {
    var c = document.createElement("button");
    c.type = "button";
    c.className = "candle";
    c.setAttribute("aria-label", "candle " + (i + 1));
    c.innerHTML =
      '<span class="flame" aria-hidden="true"></span><span class="smoke" aria-hidden="true"></span>';
    (function (el) {
      el.addEventListener("click", function () {
        blowCandle(el);
      });
    })(c);
    candlesEl.appendChild(c);
  }
  updateCandleStatus();
}

function updateCandleStatus() {
  if (litCount === 0) candleStatus.textContent = CONFIG.candleStatus.done;
  else if (litCount === 1) candleStatus.textContent = CONFIG.candleStatus.one;
  else candleStatus.textContent = litCount + " " + CONFIG.candleStatus.many;
}

function blowCandle(el) {
  if (el.classList.contains("is-out")) return;
  el.classList.add("is-out");
  el.setAttribute("aria-disabled", "true");
  litCount -= 1;
  updateCandleStatus();
  playWhoosh();
  showToast(CONFIG.toasts.candle);
  burstAt(el);
  if (litCount === 0) onAllCandlesOut();
}

function unlockAfterCandles() {
  if (unlockedAfterCandles) return;
  unlockedAfterCandles = true;
  photosSection.classList.remove("is-hidden");
  letterSection.classList.remove("is-hidden");
  finale.classList.remove("is-hidden");
  spawnFloatingCats();
}

function onAllCandlesOut() {
  cakeStage.classList.add("is-wished");
  spawnSparks();
  celebrate(90);
  showToast(CONFIG.toasts.wish);
  relight.classList.remove("is-hidden");
  unlockAfterCandles();
  setTimeout(function () {
    photosSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 900);
}

function spawnSparks() {
  sparkles.innerHTML = "";
  for (var i = 0; i < 24; i++) {
    var s = document.createElement("span");
    s.className = "spark";
    s.style.left = 40 + Math.random() * 20 + "%";
    s.style.top = 20 + Math.random() * 20 + "%";
    var angle = Math.random() * Math.PI * 2;
    var dist = 40 + Math.random() * 120;
    s.style.setProperty("--sx", Math.cos(angle) * dist + "px");
    s.style.setProperty("--sy", Math.sin(angle) * dist + "px");
    s.style.animationDelay = Math.random() * 0.2 + "s";
    s.style.background = Math.random() > 0.5 ? "#ff6f96" : "#ffc857";
    sparkles.appendChild(s);
  }
}

relight.addEventListener("click", function () {
  buildCandles();
  showToast(CONFIG.toasts.relight);
});

openGift.addEventListener("click", async function () {
  giftBox.classList.add("is-open");
  playPop();
  showToast(CONFIG.toasts.open);
  await wait(650);
  gate.classList.add("is-hidden");
  hero.classList.remove("is-hidden");
  cakeSection.classList.remove("is-hidden");
  // photos + letter + finale stay locked until candles are out
  photosSection.classList.add("is-hidden");
  letterSection.classList.add("is-hidden");
  finale.classList.add("is-hidden");
  unlockedAfterCandles = false;
  celebrate(70);
  hero.scrollIntoView({ behavior: "smooth" });
});

scrollCake.addEventListener("click", function () {
  cakeSection.scrollIntoView({ behavior: "smooth", block: "center" });
});

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playMeowSound() {
  var ctx = ensureAudio();
  var now = ctx.currentTime;
  var duration = 0.55;

  // Soft bandpass so it feels more "voice-like", less buzzy
  var filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
  filter.frequency.exponentialRampToValueAtTime(700, now + duration);
  filter.Q.value = 4;

  var master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.22, now + 0.05);
  master.gain.setValueAtTime(0.18, now + 0.22);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // Main meow glide: up then gently down (classic "miau")
  var osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.14);
  osc.frequency.exponentialRampToValueAtTime(640, now + 0.32);
  osc.frequency.exponentialRampToValueAtTime(380, now + duration);

  // Quiet second partial for a little cat-voice warmth
  var osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(780, now);
  osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.14);
  osc2.frequency.exponentialRampToValueAtTime(960, now + 0.32);
  osc2.frequency.exponentialRampToValueAtTime(560, now + duration);

  var g2 = ctx.createGain();
  g2.gain.value = 0.28;

  osc.connect(filter);
  osc2.connect(g2);
  g2.connect(filter);
  filter.connect(master);
  master.connect(ctx.destination);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + duration + 0.02);
  osc2.stop(now + duration + 0.02);
}

function playWhoosh() {
  var ctx = ensureAudio();
  var now = ctx.currentTime;
  var bufferSize = ctx.sampleRate * 0.25;
  var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  var noise = ctx.createBufferSource();
  noise.buffer = buffer;
  var filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900;
  var gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
}

function playPop() {
  var ctx = ensureAudio();
  var now = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.14);
}

playMeowBtn.addEventListener("click", function () {
  playMeowSound();
  showToast(CONFIG.toasts.meow);
});

confettiAgain.addEventListener("click", function () {
  celebrate(140);
  playPop();
  showToast(CONFIG.toasts.finale);
});

var ctx2d = fx.getContext("2d");
var particles = [];
var raf = null;

function resizeFx() {
  fx.width = window.innerWidth * devicePixelRatio;
  fx.height = window.innerHeight * devicePixelRatio;
  ctx2d.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeFx);
resizeFx();

function celebrate(count) {
  count = count || 80;
  var colors = ["#ff6f96", "#ff9bb5", "#ffc857", "#fff", "#ff4f7a", "#ffd0dc"];
  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 40,
      w: 5 + Math.random() * 7,
      h: 8 + Math.random() * 10,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
      color: colors[(Math.random() * colors.length) | 0],
      life: 120 + ((Math.random() * 60) | 0),
    });
  }
  if (!raf) tick();
}

function burstAt(el) {
  var r = el.getBoundingClientRect();
  var cx = r.left + r.width / 2;
  var cy = r.top;
  var colors = ["#ffc857", "#ff8a3d", "#ffd0dc"];
  for (var i = 0; i < 10; i++) {
    var a = -Math.PI / 2 + (Math.random() - 0.5);
    particles.push({
      x: cx,
      y: cy,
      w: 3,
      h: 6,
      vx: Math.cos(a) * (1 + Math.random() * 2),
      vy: Math.sin(a) * (1 + Math.random() * 2) - 1,
      rot: 0,
      vr: 0.1,
      color: colors[i % colors.length],
      life: 40,
    });
  }
  if (!raf) tick();
}

function tick() {
  ctx2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter(function (p) {
    return p.life > 0;
  });
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    p.life -= 1;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.rot += p.vr;
    ctx2d.save();
    ctx2d.translate(p.x, p.y);
    ctx2d.rotate(p.rot);
    ctx2d.globalAlpha = Math.min(1, p.life / 30);
    ctx2d.fillStyle = p.color;
    ctx2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx2d.restore();
  }
  if (particles.length) raf = requestAnimationFrame(tick);
  else {
    raf = null;
    ctx2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function spawnFloatingCats() {
  floatingCats.innerHTML = "";
  var glyphs = ["\uD83D\uDC31", "\uD83D\uDE3A", "\uD83D\uDC3E", "\uD83D\uDC95", "\uD83C\uDF38"];
  for (var i = 0; i < 12; i++) {
    var el = document.createElement("span");
    el.className = "float-cat";
    el.textContent = glyphs[i % glyphs.length];
    el.style.left = Math.random() * 100 + "%";
    el.style.setProperty("--d", Math.random() * 6 + "s");
    el.style.fontSize = 1.2 + Math.random() + "rem";
    floatingCats.appendChild(el);
  }
}

spawnPaws();
buildCandles();