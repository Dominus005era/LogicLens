// LogicLens Pseudo-3D Canvas Conference Renderer (canvas-roundtable.js)

class CanvasRoundTable {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.activeSpeakerId = null;
    this.headlineText = "";
    this.topicText = "School & College Uniform Mandate";
    this.animFrameId = null;
    this.time = 0;

    // Person Positions around centered oval table
    this.personas = {
      person_a: { name: 'Person A', archetype: 'Economic', x: 0.22, y: 0.32, color: '#4F46E5', gestureOffset: 0, pointsSpoken: [] },
      person_b: { name: 'Person B', archetype: 'Social', x: 0.78, y: 0.32, color: '#E11D48', gestureOffset: 1, pointsSpoken: [] },
      person_c: { name: 'Person C', archetype: 'Empirical Data', x: 0.25, y: 0.72, color: '#059669', gestureOffset: 2, pointsSpoken: [] },
      person_d: { name: 'Person D', archetype: 'Ethics', x: 0.75, y: 0.72, color: '#D97706', gestureOffset: 3, pointsSpoken: [] }
    };

    this.initResizing();
    this.startAnimationLoop();
  }

  initResizing() {
    const resize = () => {
      const parent = this.canvas.parentElement;
      if (parent) {
        this.width = parent.clientWidth || 800;
        this.height = Math.min(520, Math.max(380, window.innerHeight * 0.55));
        this.canvas.width = this.width;
        this.canvas.height = this.height;
      }
    };
    window.addEventListener('resize', resize);
    resize();
  }

  setTopic(topic) {
    this.topicText = topic;
  }

  setActiveSpeaker(speakerId, headline) {
    this.activeSpeakerId = speakerId;
    this.headlineText = headline || "";
  }

  startAnimationLoop() {
    const loop = () => {
      this.time += 0.05;
      this.drawScene();
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  drawScene() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, w, h);

    // 1. Room Wall & Window Backdrop
    const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    wallGrad.addColorStop(0, isDark ? '#0A0E17' : '#E2E8F0');
    wallGrad.addColorStop(1, isDark ? '#0F1524' : '#F1F5F9');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, h * 0.5);

    // Glass Window Partition & Cityline Reflection
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(w * 0.15, h * 0.05, w * 0.7, h * 0.28);
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.15, h * 0.05, w * 0.7, h * 0.28);

    // Presentation TV Screen mounted on wall
    ctx.fillStyle = isDark ? '#05070A' : '#1E293B';
    ctx.fillRect(w * 0.3, h * 0.08, w * 0.4, h * 0.2);
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.3, h * 0.08, w * 0.4, h * 0.2);

    // TV Screen Text
    ctx.fillStyle = '#60A5FA';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LIVE ROUND-TABLE DEBATE SCREEN', w * 0.5, h * 0.13);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`"${this.truncate(this.topicText, 45)}"`, w * 0.5, h * 0.21);

    // 2. Floor Planks
    const floorGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
    floorGrad.addColorStop(0, isDark ? '#0B0F1A' : '#E2E8F0');
    floorGrad.addColorStop(1, isDark ? '#07090E' : '#CBD5E1');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h * 0.5, w, h * 0.5);

    // Indoor Potted Plants (Left & Right Surroundings)
    this.drawPlant(ctx, w * 0.08, h * 0.48);
    this.drawPlant(ctx, w * 0.92, h * 0.48);

    // 3. Polished Mahogany Round Table (Isometric Ellipse)
    const tableX = w * 0.5;
    const tableY = h * 0.52;
    const rx = w * 0.33;
    const ry = h * 0.22;

    // Table Shadow
    ctx.beginPath();
    ctx.ellipse(tableX, tableY + 15, rx + 10, ry + 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.12)';
    ctx.fill();

    // Table Surface
    const tableGrad = ctx.createRadialGradient(tableX, tableY, 10, tableX, tableY, rx);
    tableGrad.addColorStop(0, isDark ? '#2D1B14' : '#6B3E26');
    tableGrad.addColorStop(0.8, isDark ? '#1C100B' : '#4A2B1A');
    tableGrad.addColorStop(1, isDark ? '#0F0906' : '#331C10');

    ctx.beginPath();
    ctx.ellipse(tableX, tableY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = tableGrad;
    ctx.fill();
    ctx.strokeStyle = isDark ? '#523223' : '#8B5A3C';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Specular Reflection Ring on Table Surface
    ctx.beginPath();
    ctx.ellipse(tableX, tableY - 10, rx * 0.7, ry * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.12)';
    ctx.fill();

    // Table Accessories (Laptops & Coffee Cups)
    this.drawCup(ctx, tableX - 60, tableY - 15);
    this.drawCup(ctx, tableX + 60, tableY - 15);

    // 4. Render 4 Seated Persona Figures
    Object.keys(this.personas).forEach(key => {
      const p = this.personas[key];
      const px = w * p.x;
      const py = h * p.y;
      const isSpeaking = this.activeSpeakerId === key;
      this.drawPersonFigure(ctx, px, py, p, isSpeaking);
    });

    // 5. Active Floating Speech Bubble Overlay Card
    if (this.activeSpeakerId && this.personas[this.activeSpeakerId] && this.headlineText) {
      const activeP = this.personas[this.activeSpeakerId];
      const bubbleX = w * activeP.x;
      const bubbleY = h * activeP.y - 75;
      this.drawSpeechBubble(ctx, bubbleX, bubbleY, this.headlineText, activeP.color);
    }
  }

  // Draw Realistic Humanoid Executive Figure with Animated Gestures
  drawPersonFigure(ctx, x, y, persona, isSpeaking) {
    const color = persona.color;

    ctx.save();

    // Active Speaking Pulse Glow
    if (isSpeaking) {
      const pulseSize = 38 + Math.sin(this.time * 5) * 4;
      ctx.beginPath();
      ctx.arc(x, y - 35, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Chair Back
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x - 20, y - 55, 40, 45);

    // Torso / Suit Jacket
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 18, y - 10);
    ctx.lineTo(x - 14, y - 40);
    ctx.lineTo(x + 14, y - 40);
    ctx.lineTo(x + 18, y - 10);
    ctx.closePath();
    ctx.fill();

    // Shirt Collar V-Neck
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 40);
    ctx.lineTo(x, y - 28);
    ctx.lineTo(x + 6, y - 40);
    ctx.closePath();
    ctx.fill();

    // Head
    const headTilt = isSpeaking ? Math.sin(this.time * 4) * 2 : 0;
    ctx.fillStyle = '#F3D2B8';
    ctx.beginPath();
    ctx.arc(x + headTilt, y - 48, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hair Outline
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(x + headTilt, y - 52, 12, Math.PI, Math.PI * 2);
    ctx.fill();

    // Gesturing Hands (Animated when speaking)
    const handWave = isSpeaking ? Math.sin(this.time * 6 + persona.gestureOffset) * 8 : 0;
    ctx.fillStyle = '#F3D2B8';
    ctx.beginPath();
    ctx.arc(x - 15 + handWave, y - 22, 4, 0, Math.PI * 2); // Left hand
    ctx.arc(x + 15 - handWave, y - 20 + handWave * 0.5, 4, 0, Math.PI * 2); // Right hand
    ctx.fill();

    // Name Label Tag
    ctx.fillStyle = isSpeaking ? color : 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(x - 45, y + 2, 90, 18);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 45, y + 2, 90, 18);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(persona.name, x, y + 15);

    ctx.restore();
  }

  // Floating Speech Card Canvas Render
  drawSpeechBubble(ctx, x, y, text, accentColor) {
    ctx.save();

    const maxW = 220;
    const padding = 10;
    ctx.font = 'bold 11px sans-serif';
    
    const lines = this.wrapText(ctx, text, maxW - padding * 2);
    const bubbleH = lines.length * 15 + padding * 2;
    const bubbleW = maxW;
    const bx = x - bubbleW / 2;
    const by = y - bubbleH;

    // Speech Box Background
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(bx, by, bubbleW, bubbleH, 8);
    ctx.fill();
    ctx.stroke();

    // Pointer Tail
    ctx.beginPath();
    ctx.moveTo(x - 6, by + bubbleH);
    ctx.lineTo(x, by + bubbleH + 7);
    ctx.lineTo(x + 6, by + bubbleH);
    ctx.fillStyle = '#0F172A';
    ctx.fill();

    // Text Lines
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'center';
    lines.forEach((line, i) => {
      ctx.fillText(line, x, by + padding + 12 + i * 15);
    });

    ctx.restore();
  }

  drawPlant(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#78350F';
    ctx.fillRect(x - 12, y, 24, 25); // Pot
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(x - 10, y - 10, 12, 0, Math.PI * 2);
    ctx.arc(x + 10, y - 15, 14, 0, Math.PI * 2);
    ctx.arc(x, y - 25, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCup(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  truncate(str, n) {
    return (str.length > n) ? str.substr(0, n-1) + '...' : str;
  }
}

window.CanvasRoundTable = CanvasRoundTable;
