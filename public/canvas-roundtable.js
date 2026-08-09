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

    // Audio TTS State
    this.audioEnabled = true;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.isDebateEnded = false;

    // Persona Layout Specifications (Positioned with generous wall clearance for center presentation screen)
    this.personas = {
      person_a: { name: 'Person A (Economic)', archetype: 'Economic', x: 0.17, y: 0.42, color: '#4F46E5', voicePitch: 1.0, voiceRate: 0.95, gestureOffset: 0 },
      person_b: { name: 'Person B (Social)', archetype: 'Social', x: 0.83, y: 0.42, color: '#E11D48', voicePitch: 1.25, voiceRate: 0.95, gestureOffset: 1.5 },
      person_c: { name: 'Person C (Empirical)', archetype: 'Empirical Data', x: 0.20, y: 0.78, color: '#059669', voicePitch: 0.85, voiceRate: 0.95, gestureOffset: 3.0 },
      person_d: { name: 'Person D (Ethics)', archetype: 'Ethics', x: 0.80, y: 0.78, color: '#D97706', voicePitch: 1.1, voiceRate: 0.9, gestureOffset: 4.5 }
    };

    this.initResizing();
    this.startAnimationLoop();
  }

  initResizing() {
    const resize = () => {
      const parent = this.canvas.parentElement;
      if (parent) {
        this.width = parent.clientWidth || 980;
        this.height = Math.min(660, Math.max(500, window.innerHeight * 0.70));
        this.canvas.width = this.width;
        this.canvas.height = this.height;
      }
    };
    window.addEventListener('resize', resize);
    resize();
  }

  setTopic(topic) {
    this.topicText = topic;
    this.isDebateEnded = false;
  }

  updatePersonas(personaList) {
    if (!personaList || !Array.isArray(personaList)) return;
    personaList.forEach(p => {
      if (this.personas[p.id]) {
        this.personas[p.id].name = p.name || this.personas[p.id].name;
      }
    });
  }

  setDebateEnded(ended) {
    this.isDebateEnded = ended;
    if (ended) {
      this.activeSpeakerId = null;
      this.headlineText = "";
      this.stopSpeech();
    }
  }

  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    if (!this.audioEnabled) {
      // Mute audio output only - DO NOT stop turn progression!
      if (this.synth && this.synth.speaking) {
        this.synth.cancel();
      }
      // Trigger reading fallback timer for current turn if speech was playing
      if (this.currentSpokenText && !this.speechFallbackTimer) {
        const fallbackMs = Math.max(5500, Math.min(10000, this.currentSpokenText.length * 65));
        this.speechFallbackTimer = setTimeout(() => {
          if (!this.isStopped && this.currentSpeechEndCallback) {
            this.currentSpeechEndCallback();
          }
        }, fallbackMs);
      }
    } else {
      // Direct User Gesture Audio Unlock & Immediate Turn Voice Resume
      if (this.speechFallbackTimer) {
        clearTimeout(this.speechFallbackTimer);
        this.speechFallbackTimer = null;
      }
      if (this.synth) {
        this.synth.cancel();
        this.synth.resume();
      }
      if (this.currentActiveSpeakerId && this.currentSpokenText) {
        this.setActiveSpeaker(
          this.currentActiveSpeakerId,
          this.headlineText,
          this.currentSpokenText,
          this.currentSpeechEndCallback
        );
      }
    }
    return this.audioEnabled;
  }

  stopSpeech() {
    this.isStopped = true;
    this.isPaused = false;
    if (this.speechFallbackTimer) {
      clearTimeout(this.speechFallbackTimer);
      this.speechFallbackTimer = null;
    }
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  pauseSpeech() {
    this.isPaused = true;
    if (this.speechFallbackTimer) {
      clearTimeout(this.speechFallbackTimer);
      this.speechFallbackTimer = null;
    }
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resumeSpeech() {
    this.isPaused = false;
    this.isStopped = false;
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  setActiveSpeaker(speakerId, headline, spokenText, onSpeechEndCallback) {
    this.isStopped = false;
    this.activeSpeakerId = speakerId;
    this.headlineText = headline || "";

    // Save active turn speech parameters for audio toggle re-triggering
    this.currentActiveSpeakerId = speakerId;
    this.currentSpokenText = spokenText;
    this.currentSpeechEndCallback = onSpeechEndCallback;

    // Clear any previous speech completion timers
    if (this.speechFallbackTimer) {
      clearTimeout(this.speechFallbackTimer);
      this.speechFallbackTimer = null;
    }

    if (speakerId && spokenText && this.audioEnabled && this.synth) {
      if (this.synth.speaking) {
        this.synth.cancel();
      }
      this.isStopped = false;

      const persona = this.personas[speakerId];
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.pitch = persona ? persona.voicePitch : 1.0;
      utterance.rate = persona ? persona.voiceRate : 0.95;

      let callbackTriggered = false;
      const handleSpeechEnd = () => {
        if (this.isStopped || callbackTriggered) return;
        callbackTriggered = true;
        // Natural 1.2-second human breathing pause before passing the turn
        setTimeout(() => {
          if (!this.isStopped && onSpeechEndCallback) onSpeechEndCallback();
        }, 1200);
      };

      utterance.onend = handleSpeechEnd;
      utterance.onerror = handleSpeechEnd;

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } else {
      // Audio Muted (Voice OFF) or Unsupported: Silent Reading Fallback Timer (Turns continue advancing to conclusion!)
      if (this.synth && this.synth.speaking) {
        this.synth.cancel();
      }
      const fallbackMs = Math.max(5500, Math.min(10000, (spokenText ? spokenText.length : 100) * 65));
      this.speechFallbackTimer = setTimeout(() => {
        if (!this.isStopped && onSpeechEndCallback) onSpeechEndCallback();
      }, fallbackMs);
    }
  }

  startAnimationLoop() {
    const loop = () => {
      this.time += 0.025; // Slower time step for smooth, natural gestures
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

    // 1. Room Wall Backdrop
    const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
    wallGrad.addColorStop(0, isDark ? '#0A0E17' : '#E2E8F0');
    wallGrad.addColorStop(1, isDark ? '#111827' : '#F1F5F9');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, h * 0.45);

    // 2. Center Presentation TV Screen (Placed in Middle Wall Space Between Person A & B with Zero Overlap)
    const tvW = w * 0.46;
    const tvH = h * 0.22;
    const tvX = (w - tvW) / 2;
    const tvY = h * 0.015;

    // Outer Screen Bezel Glow
    ctx.shadowColor = '#4F46E5';
    ctx.shadowBlur = 10;

    ctx.fillStyle = isDark ? '#030712' : '#0F172A';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(tvX, tvY, tvW, tvH, 10);
      ctx.fill();
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.fillRect(tvX, tvY, tvW, tvH);
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 3;
      ctx.strokeRect(tvX, tvY, tvW, tvH);
    }
    ctx.shadowBlur = 0; // Reset shadow glow

    // TV Screen Top Tag Header
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LIVE ROUND-TABLE DEBATE SCREEN', w * 0.5, tvY + 18);

    // Full Topic Text Renderer (Multi-Line Word Wrapping without Truncation)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    
    const fullTopic = this.topicText ? `"${this.topicText}"` : '"Round-Table Discussion Room"';
    const words = fullTopic.split(' ');
    const maxLineW = tvW - 24;
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineW && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Center multi-line topic text vertically in screen
    const startY = lines.length > 2 ? tvY + 32 : lines.length > 1 ? tvY + 36 : tvY + 44;
    const lineHeight = 16;
    lines.forEach((l, idx) => {
      ctx.fillText(l, w * 0.5, startY + (idx * lineHeight));
    });

    // Glass Window Lines (Behind TV)
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, tvY + tvH + 15);
    ctx.lineTo(w * 0.9, tvY + tvH + 15);
    ctx.stroke();

    // 3. Floor Planks
    const floorGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
    floorGrad.addColorStop(0, isDark ? '#0F172A' : '#CBD5E1');
    floorGrad.addColorStop(1, isDark ? '#07090E' : '#94A3B8');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h * 0.45, w, h * 0.55);

    // Indoor Potted Plants (Left & Right)
    this.drawPlant(ctx, w * 0.06, h * 0.52);
    this.drawPlant(ctx, w * 0.94, h * 0.52);

    // 4. Polished Mahogany Round Table (Shifted down to h * 0.60 for ample clearance)
    const tableX = w * 0.5;
    const tableY = h * 0.60;
    const rx = w * 0.36;
    const ry = h * 0.22;

    // Table Shadow
    ctx.beginPath();
    ctx.ellipse(tableX, tableY + 18, rx + 12, ry + 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.15)';
    ctx.fill();

    // Table Surface
    const tableGrad = ctx.createRadialGradient(tableX, tableY, 15, tableX, tableY, rx);
    tableGrad.addColorStop(0, isDark ? '#3D2319' : '#7C4A2D');
    tableGrad.addColorStop(0.85, isDark ? '#24140E' : '#54301B');
    tableGrad.addColorStop(1, isDark ? '#140A07' : '#3B2011');

    ctx.beginPath();
    ctx.ellipse(tableX, tableY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = tableGrad;
    ctx.fill();
    ctx.strokeStyle = isDark ? '#6B3E29' : '#9A5B37';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Specular Reflection Ring
    ctx.beginPath();
    ctx.ellipse(tableX, tableY - 12, rx * 0.72, ry * 0.62, 0, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.15)';
    ctx.fill();

    // Table Center Badge: "Discussion Ended"
    if (this.isDebateEnded) {
      ctx.fillStyle = 'rgba(5, 150, 105, 0.9)';
      ctx.beginPath();
      ctx.roundRect(tableX - 90, tableY - 18, 180, 36, 18);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✅ DISCUSSION ENDED', tableX, tableY + 4);
    } else {
      // Accessories on Table
      this.drawCup(ctx, tableX - 80, tableY - 20);
      this.drawCup(ctx, tableX + 80, tableY - 20);
    }

    // 5. Render 4 Seated Persona Figures (Bigger, Taller, Well-Proportioned)
    Object.keys(this.personas).forEach(key => {
      const p = this.personas[key];
      const px = w * p.x;
      const py = h * p.y;
      const isSpeaking = this.activeSpeakerId === key;
      this.drawBiggerPersonFigure(ctx, px, py, p, isSpeaking);
    });

    // 6. Active Floating Speech Bubble Overlay Card
    if (this.activeSpeakerId && this.personas[this.activeSpeakerId] && this.headlineText) {
      const activeP = this.personas[this.activeSpeakerId];
      const bubbleX = w * activeP.x;
      const bubbleY = h * activeP.y - 120;
      this.drawSpeechBubble(ctx, bubbleX, bubbleY, this.headlineText, activeP.color);
    }

    // 7. Top-Right Audio Voice Toggle Button on Canvas
    this.drawAudioToggleButton(ctx, w - 120, 15);
  }

  // Draw Bigger, Taller, Well-Proportioned Executive Figure with Smooth Slow Gestures
  drawBiggerPersonFigure(ctx, x, y, persona, isSpeaking) {
    const color = persona.color;

    ctx.save();

    // Speaking Pulse Ring
    if (isSpeaking) {
      const pulseSize = 60 + Math.sin(this.time * 2.5) * 5;
      ctx.beginPath();
      ctx.arc(x, y - 58, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Executive Chair Back (Enlarged)
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x - 34, y - 92, 68, 75);

    // Torso / Suit Jacket (Enlarged width = 64px, height = 60px)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 30, y - 12);
    ctx.lineTo(x - 25, y - 68);
    ctx.lineTo(x + 25, y - 68);
    ctx.lineTo(x + 30, y - 12);
    ctx.closePath();
    ctx.fill();

    // Shirt Collar V-Neck & Tie
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 68);
    ctx.lineTo(x, y - 46);
    ctx.lineTo(x + 10, y - 68);
    ctx.closePath();
    ctx.fill();

    // Head (Enlarged Head Radius = 20px)
    const headTilt = isSpeaking ? Math.sin(this.time * 2) * 2.5 : 0;
    ctx.fillStyle = '#F3D2B8';
    ctx.beginPath();
    ctx.arc(x + headTilt, y - 80, 20, 0, Math.PI * 2);
    ctx.fill();

    // Hair Style
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(x + headTilt, y - 85, 20, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // Animated Gesturing Hands (Enlarged Radius = 8px)
    const handGestureY = isSpeaking ? Math.sin(this.time * 1.8 + persona.gestureOffset) * 8 : 0;
    const handGestureX = isSpeaking ? Math.cos(this.time * 1.8 + persona.gestureOffset) * 5 : 0;

    ctx.fillStyle = '#F3D2B8';
    ctx.beginPath();
    ctx.arc(x - 26 + handGestureX, y - 32 + handGestureY, 7.5, 0, Math.PI * 2); // Left hand
    ctx.arc(x + 26 - handGestureX, y - 30 - handGestureY, 7.5, 0, Math.PI * 2); // Right hand
    ctx.fill();

    // Name Label Tag
    ctx.fillStyle = isSpeaking ? color : 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(x - 72, y + 6, 144, 25);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(x - 72, y + 6, 144, 25);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(persona.name, x, y + 23);

    ctx.restore();
  }

  // Floating Speech Card (Positioned with Smart Boundary Constraints to Avoid TV Screen Overlap)
  drawSpeechBubble(ctx, x, y, text, accentColor) {
    ctx.save();

    const maxW = 230;
    const padding = 10;
    ctx.font = 'bold 11px sans-serif';
    const w = this.width;
    
    const lines = this.wrapText(ctx, text, maxW - padding * 2);
    const bubbleH = lines.length * 16 + padding * 2;
    const bubbleW = maxW;
    
    // Smart X-offset to prevent overlapping center TV screen (x = 0.27w to 0.73w)
    let bx = x - bubbleW / 2;
    if (x < w * 0.40) {
      // Left speaker (Person A): Shift bubble toward left edge
      bx = Math.max(15, x - bubbleW * 0.65);
    } else if (x > w * 0.60) {
      // Right speaker (Person B): Shift bubble toward right edge
      bx = Math.min(w - bubbleW - 15, x - bubbleW * 0.35);
    }

    const by = Math.max(10, y - bubbleH);

    // Speech Card Background
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect(bx, by, bubbleW, bubbleH, 10);
    ctx.fill();
    ctx.stroke();

    // Pointer Tail
    const tailX = Math.max(bx + 20, Math.min(bx + bubbleW - 20, x));
    ctx.beginPath();
    ctx.moveTo(tailX - 8, by + bubbleH);
    ctx.lineTo(tailX, by + bubbleH + 9);
    ctx.lineTo(tailX + 8, by + bubbleH);
    ctx.fillStyle = '#0F172A';
    ctx.fill();

    // Text Lines
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'center';
    lines.forEach((line, i) => {
      ctx.fillText(line, bx + bubbleW / 2, by + padding + 13 + i * 16);
    });

    ctx.restore();
  }

  // Audio Voice Toggle Button on Canvas (Top Right)
  drawAudioToggleButton(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = this.audioEnabled ? 'rgba(79, 70, 229, 0.9)' : 'rgba(100, 116, 139, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x, y, 105, 30, 15);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    const label = this.audioEnabled ? '🔊 Voice: ON' : '🔇 Voice: OFF';
    ctx.fillText(label, x + 52, y + 19);
    ctx.restore();
  }

  drawPlant(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#54301B';
    ctx.fillRect(x - 15, y, 30, 32); // Pot
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(x - 12, y - 14, 15, 0, Math.PI * 2);
    ctx.arc(x + 12, y - 20, 18, 0, Math.PI * 2);
    ctx.arc(x, y - 32, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCup(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
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
