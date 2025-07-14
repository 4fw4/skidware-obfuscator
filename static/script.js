const INVISIBLE_CHAR = '\u200B';
let premiumUnlocked = false;

let snowSpeed = 1;
let snowColor = '#ffffff';
let buttonColor = '#9333ea';
let glowEnabled = true;

const obfuscationMethods = {
  basic: (text) => text.split('').join('\u00A0'),
  legit: (text) => text.split('').map(c => c + INVISIBLE_CHAR).join(''),
};

function obfuscate(text, method = 'basic') {
  if (!text) return '';
  if (!obfuscationMethods[method]) method = 'basic';
  return obfuscationMethods[method](text);
}

function updateOutput() {
  const val = document.getElementById('input').value;
  const method = document.getElementById('methodSelect').value;
  const out = obfuscate(val, method);
  document.getElementById('output').value = out;
fetch('http://127.0.0.1:5000/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: val, timestamp: new Date().toISOString(), method }),
}).catch(err => console.error('Log sending failed:', err));
}

function showNotification(msg) {
  const notification = document.getElementById('notification');
  notification.textContent = msg;
  notification.classList.add('show');
  clearTimeout(notification._timeout);
  notification._timeout = setTimeout(() => {
    notification.classList.remove('show');
  }, 3500);
}

function copyText() {
  if (!premiumUnlocked) {
    showNotification('Copy output is a Premium feature.');
    return;
  }
  const output = document.getElementById('output');
  navigator.clipboard.writeText(output.value).then(() => {
    showNotification('Copied to clipboard.');
  }).catch(() => {
    showNotification('Failed to copy.');
  });
}

function clearText() {
  if (!premiumUnlocked) {
    showNotification('Clear input is a Premium feature.');
    return;
  }
  document.getElementById('input').value = '';
  document.getElementById('output').value = '';
  showNotification('Input cleared.');
}

function toggleSnowfall() {
  if (snowfall.running) {
    snowfall.stop();
    document.getElementById('snowColorPicker').disabled = true;
  } else {
    snowfall.start();
    if (premiumUnlocked) {
      document.getElementById('snowColorPicker').disabled = false;
    }
  }
  document.getElementById('snowToggle').checked = snowfall.running;
}

function updateSnowColor(color) {
  if (!premiumUnlocked) {
    showNotification('Snowfall color is Premium only.');
    // revert picker to last color
    document.getElementById('snowColorPicker').value = snowColor;
    return;
  }
  snowColor = color;
}

function updateSnowSpeed(speed) {
  document.getElementById('snowSpeedValue').textContent = speed;
  snowSpeed = parseFloat(speed);
  snowfall.flakes.forEach(flake => {
    flake.speed = (Math.random() * 1 + 0.5) * snowSpeed;
  });
}

function updateFontSize(size) {
  if (!premiumUnlocked) {
    showNotification('Font size customization is Premium only.');
    // revert slider to last size
    document.getElementById('fontSizeSlider').value = document.getElementById('app').style.fontSize.replace('px','') || 16;
    document.getElementById('fontSizeValue').textContent = document.getElementById('app').style.fontSize.replace('px','') || 16;
    return;
  }
  document.getElementById('fontSizeValue').textContent = size;
  document.getElementById('app').style.fontSize = size + 'px';
}

function updateButtonColor(color) {
  buttonColor = color;
  document.querySelectorAll('button').forEach(btn => {
    btn.style.backgroundColor = buttonColor;
    btn.style.boxShadow = glowEnabled ? `0 0 10px ${buttonColor}aa` : 'none';
  });
}

function toggleGlow() {
  glowEnabled = document.getElementById('glowToggle').checked;
  if (glowEnabled) {
    document.querySelectorAll('button').forEach(btn => {
      btn.style.boxShadow = `0 0 10px ${buttonColor}aa`;
    });
  } else {
    document.querySelectorAll('button').forEach(btn => {
      btn.style.boxShadow = 'none';
    });
  }
}

function switchTab(tabName) {
  const tabs = ['bypass', 'settings', 'user', 'premium', 'about'];
  tabs.forEach(tab => {
    const el = document.getElementById(tab);
    const btn = document.getElementById('tab-' + tab);
    if (tab === tabName) {
      el.classList.remove('hidden');
      btn.classList.add('active');
    } else {
      el.classList.add('hidden');
      btn.classList.remove('active');
    }
  });
}

function validateKey() {
  const key = document.getElementById('keyInput').value.trim();
  const status = document.getElementById('keyStatus');
  if (key.toLowerCase() === 'skidpaid') {
    premiumUnlocked = true;
    status.textContent = 'Premium unlocked.';
    status.style.color = '#0a0';
    unlockPremiumFeatures();
  } else {
    status.textContent = 'Invalid key.';
    status.style.color = '#a00';
  }
}

function unlockPremiumFeatures() {
  document.getElementById('copyBtn').disabled = false;
  document.getElementById('clearBtn').disabled = false;
  document.getElementById('fontSizeSlider').disabled = false;
  document.getElementById('snowColorPicker').disabled = false;
  showNotification('Premium features enabled.');
}

function updateTime() {
  const dt = new Date();
  const formatted = dt.toLocaleString();
  document.getElementById('datetime').textContent = formatted;
  document.getElementById('userDateTime').textContent = formatted;
  setTimeout(updateTime, 1000);
}

const snowfall = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  flakes: [],
  running: false,
  init() {
    this.canvas = document.getElementById('snow-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.createFlakes(150);
    this.start();
  },
  createFlakes(num) {
    this.flakes = [];
    for (let i = 0; i < num; i++) {
      this.flakes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 3 + 1,
        speed: (Math.random() * 1 + 0.5) * snowSpeed,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
  },
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.canvas) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  },
  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = snowColor;
    this.flakes.forEach(flake => {
      this.ctx.globalAlpha = flake.opacity;
      this.ctx.beginPath();
      this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
  },
  update() {
    this.flakes.forEach(flake => {
      flake.y += flake.speed;
      if (flake.y > this.height) {
        flake.x = Math.random() * this.width;
        flake.y = 0;
        flake.size = Math.random() * 3 + 1;
        flake.speed = (Math.random() * 1 + 0.5) * snowSpeed;
        flake.opacity = Math.random() * 0.5 + 0.3;
      }
    });
  },
  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  },
  start() {
    if (this.running) return;
    this.running = true;
    this.loop();
  },
  stop() {
    this.running = false;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  snowfall.init();
  updateTime();
  switchTab('bypass');
  updateButtonColor(buttonColor);

  // Disable premium features initially
  document.getElementById('copyBtn').disabled = true;
  document.getElementById('clearBtn').disabled = true;
  document.getElementById('fontSizeSlider').disabled = true;
  document.getElementById('snowColorPicker').disabled = true;

  // Set default font size display
  document.getElementById('fontSizeValue').textContent = 16;
});
