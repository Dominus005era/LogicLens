// LogicLens Dashboard & Canvas Sequential Turn Engine (dashboard.js)

let currentMode = 'deep_discussion';
let roundTableData = null;
let fallacyLibraryCache = [];
let canvasStage = null;
let activeTurnIndex = 0;
let liveStreamTimer = null;
let activeOpenDrawerPersonId = null;
let isAnalysisViewActive = false;

// Sample Topic Presets Catalog
const TOPIC_PRESETS = {
  uniforms: "Whether school and colleges need proper uniform or not",
  ai_creativity: "Is Generative AI a threat or an enhancement to human artistic creativity?",
  remote_work: "Should companies mandate 5-day in-office work or offer full remote flexibility?",
  mars_colony: "Should governments prioritize funding a Mars colony or Earth climate preservation?",
  social_media: "Should social media usage for teenagers under 16 be legally restricted?"
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchFallacyLibrary();

  // Initialize Canvas 2D Pseudo-3D Stage
  if (document.getElementById('roundtable-canvas')) {
    canvasStage = new CanvasRoundTable('roundtable-canvas');
  }
});

// Mobile Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar-panel');
  if (sidebar) sidebar.classList.toggle('open');
}

// Working Theme Switcher Sync
function initTheme() {
  const savedTheme = localStorage.getItem('logiclens_theme') || 'light';
  applyTheme(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const icon = document.getElementById('theme-btn-icon');
    const text = document.getElementById('theme-btn-text');
    if (icon) icon.textContent = '☀️';
    if (text) text.textContent = 'Light Mode';
  } else {
    document.documentElement.removeAttribute('data-theme');
    const icon = document.getElementById('theme-btn-icon');
    const text = document.getElementById('theme-btn-text');
    if (icon) icon.textContent = '🌙';
    if (text) text.textContent = 'Dark Mode';
  }
  localStorage.setItem('logiclens_theme', theme);
}

// Sidebar Navigation Tabs
function switchSidebarTab(target) {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.target === target);
  });

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  const activePanel = document.getElementById(`${target}-view`);
  if (activePanel) {
    activePanel.classList.remove('hidden');
  }

  const sidebar = document.getElementById('sidebar-panel');
  if (sidebar) sidebar.classList.remove('open');

  if (target === 'library') {
    renderDashFallacies(fallacyLibraryCache);
  }
}

// Load Topic Preset
function loadTopicPreset(key) {
  const input = document.getElementById('topic-input');
  if (TOPIC_PRESETS[key]) {
    input.value = TOPIC_PRESETS[key];
    input.focus();
  }
}

// Clear Input
function clearInput() {
  document.getElementById('topic-input').value = '';
  document.getElementById('roundtable-workspace').classList.add('hidden');
  document.getElementById('error-message').classList.add('hidden');
  if (liveStreamTimer) clearTimeout(liveStreamTimer);
  if (canvasStage) canvasStage.stopSpeech();
}

// Topic Minimization Handlers
function collapseTopicInput() {
  document.getElementById('topic-input-container').classList.add('hidden');
  document.getElementById('minimized-topic-bar').classList.remove('hidden');
}

function expandTopicInput() {
  document.getElementById('topic-input-container').classList.remove('hidden');
  document.getElementById('minimized-topic-bar').classList.add('hidden');
}

// Mode Selection (Deep Discussion vs Calm Rewrite)
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });

  const btnText = document.getElementById('btn-text');
  if (btnText) {
    btnText.textContent = mode === 'calm' ? '🕊️ Launch Calm Rewrite Discussion' : '✨ Launch Deep Discussion';
  }
}

// Trigger Round-Table Simulation
async function triggerRoundTable() {
  const topic = document.getElementById('topic-input').value.trim();
  const errorBanner = document.getElementById('error-message');
  const loadingIndicator = document.getElementById('loading-indicator');
  const stageWorkspace = document.getElementById('roundtable-workspace');
  const analyzeBtn = document.getElementById('analyze-btn');

  errorBanner.classList.add('hidden');
  stageWorkspace.classList.add('hidden');
  if (liveStreamTimer) clearTimeout(liveStreamTimer);
  if (canvasStage) canvasStage.stopSpeech();

  if (!topic || topic.length < 5) {
    showError('Please enter a valid topic or opinion (at least 5 characters).');
    return;
  }

  loadingIndicator.classList.remove('hidden');
  analyzeBtn.disabled = true;

  try {
    const endpoint = currentMode === 'calm' ? '/api/rewrite-calm' : '/api/simulate-roundtable';
    
    // In calm mode, wrap request if needed or use simulate-roundtable with calm directive
    const res = await fetch('/api/simulate-roundtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, mode: currentMode })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to simulate discussion');

    roundTableData = data.data;
    
    // Initialize persona live logs
    roundTableData.personaLogs = {
      person_a: [],
      person_b: [],
      person_c: [],
      person_d: []
    };

    if (canvasStage) {
      canvasStage.setTopic(roundTableData.topic);
    }

    document.getElementById('minimized-topic-text').textContent = `"${roundTableData.topic}"`;
    document.getElementById('stage-topic-title').textContent = roundTableData.topic;

    collapseTopicInput();
    stageWorkspace.classList.remove('hidden');
    stageWorkspace.scrollIntoView({ behavior: 'smooth' });

    // Populate Transcript Analysis Window Data
    renderTopicTranscriptAnalysis(roundTableData.transcript_analysis);

    // Start Live 1-to-2 Minute Turn-by-Turn Discussion Stream
    startSequentialLiveStream(roundTableData.turns || []);
  } catch (err) {
    showError(err.message || 'An error occurred during discussion simulation.');
  } finally {
    loadingIndicator.classList.add('hidden');
    analyzeBtn.disabled = false;
  }
}

function showError(msg) {
  const errorBanner = document.getElementById('error-message');
  errorBanner.textContent = `⚠️ Error: ${msg}`;
  errorBanner.classList.remove('hidden');
}

// Live 1-to-2 Minute Turn Sequencer Engine with TTS Synchronization
function startSequentialLiveStream(turns) {
  if (!turns || turns.length === 0) return;
  activeTurnIndex = 0;

  const runNextTurn = () => {
    if (activeTurnIndex >= turns.length) {
      // Stream completed — show Discussion Ended badge on table center
      if (canvasStage) {
        canvasStage.setDebateEnded(true);
      }
      const liveTag = document.getElementById('live-indicator-tag');
      if (liveTag) {
        liveTag.style.background = 'rgba(5,150,105,0.15)';
        liveTag.style.color = 'var(--accent-emerald)';
        liveTag.textContent = '✅ DEBATE COMPLETED';
      }
      document.getElementById('live-speaker-status').textContent = 'Discussion concluded across all 4 parameters. Click "Seek Synthesis & Report" to view final executive report.';
      return;
    }

    const turn = turns[activeTurnIndex];
    const speakerId = turn.speaker_id;

    // 1. Update Persona Live Logs
    if (roundTableData.personaLogs[speakerId]) {
      roundTableData.personaLogs[speakerId].push(turn);
    }

    // 2. If Persona Drawer is open for this speaker, UPDATE LIVE!
    if (activeOpenDrawerPersonId === speakerId) {
      renderLivePersonaDrawerContent(speakerId);
    }

    // 3. Update Status Banner
    const statusText = `Turn ${turn.turn_index} of ${turns.length}: ${turn.speaker_name} is speaking...`;
    document.getElementById('live-speaker-status').textContent = statusText;

    // Advance turn callback
    let turnAdvanced = false;
    const advanceTurn = () => {
      if (turnAdvanced) return;
      turnAdvanced = true;
      activeTurnIndex++;
      runNextTurn();
    };

    // 4. Trigger Canvas Active Speaker & Speech Audio
    if (canvasStage) {
      canvasStage.setActiveSpeaker(speakerId, turn.headline_point, turn.spoken_text, () => {
        advanceTurn();
      });
    }

    const duration = turn.duration_ms || 8000;
    liveStreamTimer = setTimeout(advanceTurn, duration + 1000);
  };

  runNextTurn();
}

// On-Demand Transcript Analysis View Toggle
function toggleTranscriptAnalysisView() {
  const analysisContainer = document.getElementById('topic-transcript-analysis-container');
  const toggleBtn = document.getElementById('toggle-analysis-btn');
  if (!analysisContainer) return;

  isAnalysisViewActive = !isAnalysisViewActive;
  if (isAnalysisViewActive) {
    analysisContainer.classList.remove('hidden');
    if (toggleBtn) toggleBtn.innerHTML = '<span>🗣️ Back to Round Table Stage</span>';
    analysisContainer.scrollIntoView({ behavior: 'smooth' });
  } else {
    analysisContainer.classList.add('hidden');
    if (toggleBtn) toggleBtn.innerHTML = '<span>📊 View Transcript Analysis</span>';
  }
}

// Render Topic Transcript Analysis Data
function renderTopicTranscriptAnalysis(analysis) {
  if (!analysis) return;

  // Summary & Coach
  document.getElementById('topic-summary-text').textContent = analysis.summary || '';
  const coach = analysis.coach || { overall_score: 85, verdict: 'Good reasoning quality.', tips: [] };
  document.getElementById('topic-coach-score-num').textContent = coach.overall_score;
  document.getElementById('topic-coach-verdict-title').textContent = coach.verdict;
  
  // Score Ring Offset & Gradient
  const scoreRing = document.getElementById('topic-score-ring');
  if (scoreRing) {
    const circumference = 264;
    const offset = circumference - (coach.overall_score / 100) * circumference;
    scoreRing.style.strokeDashoffset = offset;
    scoreRing.style.stroke = coach.overall_score >= 80 ? 'url(#ringGradientEmerald)' : 'url(#ringGradientIndigo)';
  }

  const tipsList = document.getElementById('topic-coach-tips-list');
  if (tipsList) {
    tipsList.innerHTML = (coach.tips || []).map(tip => `<li>💡 ${escapeHtml(tip)}</li>`).join('');
  }

  // Color Mapping for Personas
  const colorMap = {
    'Person A': { color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.12)' },
    'Person B': { color: '#E11D48', bg: 'rgba(225, 29, 72, 0.12)' },
    'Person C': { color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
    'Person D': { color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' }
  };

  // Participants Grid
  const partContainer = document.getElementById('topic-participants-container');
  if (partContainer) {
    partContainer.innerHTML = (analysis.participants || []).map(p => {
      let key = 'Person A';
      if (p.name.includes('B')) key = 'Person B';
      if (p.name.includes('C')) key = 'Person C';
      if (p.name.includes('D')) key = 'Person D';
      const theme = colorMap[key] || { color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.12)' };

      return `
        <div class="participant-card" style="border-top-color: ${theme.color};">
          <div class="p-header">
            <div>
              <span class="p-name" style="color: ${theme.color};">${escapeHtml(p.name)}</span>
            </div>
            <span class="p-score-badge" style="background: ${theme.bg}; color: ${theme.color};">${p.logic_score}/10 Logic</span>
          </div>
          <div class="badges-row">
            ${(p.badges || []).map(b => `<span class="badge-tag" style="background: ${theme.bg}; color: ${theme.color};">${escapeHtml(b)}</span>`).join('')}
          </div>
          <div class="p-metrics">
            <div class="metric-line">
              <span>Evidence Support</span>
              <strong>${p.evidence_score}/10</strong>
            </div>
            <div style="width:100%; height:6px; background:var(--border-subtle); border-radius:3px; overflow:hidden;">
              <div style="width:${(p.evidence_score * 10)}%; height:100%; background:${theme.color}; border-radius:3px;"></div>
            </div>

            <div class="metric-line" style="margin-top:0.4rem;">
              <span>Clarity</span>
              <strong>${p.clarity_score}/10</strong>
            </div>
            <div style="width:100%; height:6px; background:var(--border-subtle); border-radius:3px; overflow:hidden;">
              <div style="width:${(p.clarity_score * 10)}%; height:100%; background:${theme.color}; border-radius:3px;"></div>
            </div>

            <div class="metric-line" style="margin-top:0.4rem;">
              <span>Respectfulness</span>
              <strong>${p.respect_score}/10</strong>
            </div>
            <div style="width:100%; height:6px; background:var(--border-subtle); border-radius:3px; overflow:hidden;">
              <div style="width:${(p.respect_score * 10)}%; height:100%; background:${theme.color}; border-radius:3px;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Heatmap
  const heatContainer = document.getElementById('topic-heatmap-container');
  if (heatContainer) {
    heatContainer.innerHTML = (analysis.heat_map || []).map(h => `
      <div class="heatmap-item level-${(h.level || 'Blue').toLowerCase()}">
        <span class="speaker">${escapeHtml(h.speaker)}</span>
        <span class="msg">"${escapeHtml(h.message)}"</span>
        <span class="tone-tag">${escapeHtml(h.tone)}</span>
      </div>
    `).join('');
  }

  // Evidence Meter
  const evContainer = document.getElementById('topic-evidence-container');
  if (evContainer) {
    evContainer.innerHTML = (analysis.evidence_meter || []).map(e => `
      <div class="evidence-item">
        <span class="ev-status ${e.status.includes('Supported') ? 'supported' : 'unsupported'}">${escapeHtml(e.status)}</span>
        <strong style="color:var(--text-main); font-size:0.9rem;">"${escapeHtml(e.claim)}"</strong>
        <span style="color:var(--text-muted); font-size:0.85rem;">— ${escapeHtml(e.speaker)} (${escapeHtml(e.reason)})</span>
      </div>
    `).join('');
  }
}

// Canvas Click Handler
function handleCanvasClick(evt) {
  if (!canvasStage) return;
  const rect = canvasStage.canvas.getBoundingClientRect();
  const clickX = evt.clientX - rect.left;
  const clickY = evt.clientY - rect.top;
  const w = canvasStage.canvas.width;

  // Check audio toggle button
  if (clickX >= w - 125 && clickX <= w - 15 && clickY >= 10 && clickY <= 50) {
    const isEnabled = canvasStage.toggleAudio();
    alert(isEnabled ? '🔊 Voice Audio Enabled for Discussion!' : '🔇 Voice Audio Muted.');
    return;
  }

  // Check proximity to 4 personas
  Object.keys(canvasStage.personas).forEach(key => {
    const p = canvasStage.personas[key];
    const px = w * p.x;
    const py = canvasStage.canvas.height * p.y;
    const dist = Math.hypot(clickX - px, clickY - py);
    if (dist < 65) {
      openPersonaDrawer(key);
    }
  });
}

// Open Persona Detail Slide Drawer
function openPersonaDrawer(personaId) {
  activeOpenDrawerPersonId = personaId;
  const drawer = document.getElementById('persona-drawer');
  if (!drawer) return;

  renderLivePersonaDrawerContent(personaId);
  drawer.classList.remove('hidden');
}

function renderLivePersonaDrawerContent(personaId) {
  if (!roundTableData) return;
  const persona = (roundTableData.personas || []).find(p => p.id === personaId) || { name: personaId, archetype: 'Debater' };
  const logs = (roundTableData.personaLogs && roundTableData.personaLogs[personaId]) ? roundTableData.personaLogs[personaId] : [];

  document.getElementById('drawer-persona-name').textContent = persona.name;
  document.getElementById('drawer-persona-archetype').textContent = persona.archetype || 'Perspective Parameter';
  
  if (logs.length > 0) {
    const latest = logs[logs.length - 1];
    document.getElementById('drawer-persona-quote').textContent = `"${latest.spoken_text}"`;
  } else {
    document.getElementById('drawer-persona-quote').textContent = '"Awaiting speaker turn in live discussion..."';
  }

  const pointsList = document.getElementById('drawer-persona-points');
  if (logs.length === 0) {
    pointsList.innerHTML = '<li style="font-style:italic;">No points spoken yet in the live debate.</li>';
  } else {
    pointsList.innerHTML = logs.map(l => `
      <li style="background:var(--bg-dark); padding:0.65rem; border-radius:var(--radius-sm); border-left:3px solid var(--accent-indigo);">
        <strong style="color:var(--text-main); display:block;">${escapeHtml(l.headline_point)}</strong>
        <span style="color:var(--text-muted); font-size:0.85rem;">"${escapeHtml(l.spoken_text)}"</span>
      </li>
    `).join('');
  }
}

function closePersonaDrawer() {
  activeOpenDrawerPersonId = null;
  document.getElementById('persona-drawer').classList.add('hidden');
}

// Open Formal Executive Synthesis Conclusion Report Modal
function openConclusionModal() {
  if (!roundTableData || !roundTableData.attributed_conclusion) {
    alert('Please generate a discussion first.');
    return;
  }

  const conc = roundTableData.attributed_conclusion;
  document.getElementById('report-topic-title').textContent = `"${roundTableData.topic}"`;
  document.getElementById('report-score-badge').textContent = `${conc.discussion_quality_score || 88} / 100`;
  document.getElementById('conclusion-summary-text').textContent = conc.summary || '';
  
  // Render Persona Behavioral Profiles Grid
  const personasGrid = document.getElementById('report-personas-grid');
  if (personasGrid && roundTableData.personas) {
    personasGrid.innerHTML = roundTableData.personas.map(p => `
      <div style="background:var(--bg-card); padding:0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle); border-top:3px solid ${p.avatar_color === 'indigo' ? '#4F46E5' : p.avatar_color === 'rose' ? '#E11D48' : p.avatar_color === 'emerald' ? '#059669' : '#D97706'};">
        <strong style="color:var(--text-main); font-size:0.9rem;">${escapeHtml(p.name)}</strong>
        <span style="display:block; font-size:0.75rem; color:var(--text-muted); margin-bottom:0.4rem;">${escapeHtml(p.archetype)}</span>
        <div style="font-size:0.8rem; color:var(--text-muted);">Behavior Tone: <strong style="color:var(--text-main);">${escapeHtml(p.tone || 'Calm')}</strong></div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">Logic Score: <strong style="color:var(--accent-emerald);">${p.logic_rating || 8}/10</strong></div>
      </div>
    `).join('');
  }

  // Agreement Mappings
  const mappingsContainer = document.getElementById('conclusion-agreements-list');
  const mappings = conc.agreement_mappings || [];
  
  if (mappings.length === 0) {
    mappingsContainer.innerHTML = '<p style="font-style:italic; font-size:0.9rem;">Consensus synthesized across all 4 parameters.</p>';
  } else {
    mappingsContainer.innerHTML = mappings.map(m => `
      <div style="background:var(--bg-card); padding:0.75rem 1rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
        <strong style="color:var(--accent-emerald); font-size:0.88rem;">🤝 Alignment (${(m.persons || []).join(' & ')}):</strong>
        <p style="font-size:0.88rem; color:var(--text-main); margin-top:0.2rem;">${escapeHtml(m.common_point)}</p>
      </div>
    `).join('');
  }

  document.getElementById('conclusion-tradeoff-text').textContent = conc.core_tradeoffs || '';

  document.getElementById('conclusion-modal').classList.remove('hidden');
}

function closeConclusionModal() {
  document.getElementById('conclusion-modal').classList.add('hidden');
}

// Fallacy Library Fetching
async function fetchFallacyLibrary() {
  try {
    const res = await fetch('/api/fallacies');
    const data = await res.json();
    if (data.success) {
      fallacyLibraryCache = data.fallacies;
    }
  } catch (err) {
    console.error('Failed to load fallacy library', err);
  }
}

function renderDashFallacies(list) {
  const grid = document.getElementById('dash-fallacy-grid');
  if (!grid) return;
  grid.innerHTML = list.map(f => `
    <div class="fallacy-modal-card">
      <span class="fallacy-cat">${escapeHtml(f.category)}</span>
      <h4>❌ ${escapeHtml(f.name)}</h4>
      <p class="fallacy-def">${escapeHtml(f.definition)}</p>
      <div class="fallacy-ex"><strong>Example:</strong> "${escapeHtml(f.example)}"</div>
    </div>
  `).join('');
}

function filterDashFallacies() {
  const query = document.getElementById('dash-fallacy-search').value.toLowerCase();
  const filtered = fallacyLibraryCache.filter(f => 
    f.name.toLowerCase().includes(query) ||
    f.category.toLowerCase().includes(query) ||
    f.definition.toLowerCase().includes(query)
  );
  renderDashFallacies(filtered);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
