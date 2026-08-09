// LogicLens Dashboard & Canvas Sequential Turn Engine (dashboard.js)

let currentMode = 'deep_discussion';
let roundTableData = null;
let fallacyLibraryCache = [];
let canvasStage = null;
let activeTurnIndex = 0;
let liveStreamTimer = null;
let activeOpenDrawerPersonId = null;
let isAnalysisViewActive = false;

// Sample Curated Cover Images for Debate Themes
const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80"
];

// Sample Topic Presets Catalog
const TOPIC_PRESETS = {
  uniforms: "Whether school and colleges need proper uniform or not",
  ai_creativity: "Is Generative AI a threat or an enhancement to human artistic creativity?",
  remote_work: "Should companies mandate 5-day in-office work or offer full remote flexibility?",
  mars_colony: "Should governments prioritize funding a Mars colony or Earth climate preservation?",
  social_media: "Should social media usage for teenagers under 16 be legally restricted?"
};

    attributed_conclusion: {
      summary: "AI democratizes commercial production and rapid prototyping, but risks devaluing specialized human craftsmanship and intellectual property rights.",
      agreement_mappings: [
        { persons: ["Person B", "Person D"], common_point: "Both agreed that preserving uncompensated human artist labor and psychological mastery is essential." },
        { persons: ["Person A", "Person C"], common_point: "Both recognized that AI dramatically accelerates production speed for independent creators." }
      ],
      core_tradeoffs: "Trade-off between rapid low-cost production and human artistic authenticity.",
      discussion_quality_score: 92
    },
    transcript_analysis: {
      summary: "Multi-faceted debate weighing economic democratization against intellectual property theft and loss of human mastery.",
      coach: { overall_score: 92, verdict: "Exceptional debate moving from philosophical clashes to concrete economic data.", tips: ["Establish clear AI attribution standards for artists"] },
      participants: [
        { name: "Person A (Economic)", logic_score: 8, evidence_score: 8, respect_score: 8, clarity_score: 9, badges: ["🧠 Rational Thinker"] },
        { name: "Person B (Social & Freedom)", logic_score: 9, evidence_score: 8, respect_score: 8, clarity_score: 9, badges: ["🕊️ Autonomy Defender"] },
        { name: "Person C (Empirical Data)", logic_score: 10, evidence_score: 9, respect_score: 9, clarity_score: 9, badges: ["🔍 Evidence Hunter", "🧠 Data Master"] },
        { name: "Person D (Ethics & Psychology)", logic_score: 8, evidence_score: 8, respect_score: 10, clarity_score: 8, badges: ["🕊️ Respectful Debater"] }
      ],
      heat_map: [
        { speaker: "Person A", message: "AI lowers barriers to entry.", tone: "Calm", level: "Blue" },
        { speaker: "Person B", message: "It cannibalizes artists through uncompensated labor.", tone: "Passionate", level: "Green" },
        { speaker: "Person C", message: "Market rates for entry-level illustrators are declining.", tone: "Calm", level: "Blue" },
        { speaker: "Person D", message: "We risk a loss of human emotional connection.", tone: "Thoughtful", level: "Blue" }
      ],
      evidence_meter: [
        { claim: "AI increases output volume in commercial sectors.", speaker: "Person C", status: "Supported by facts", reason: "Consistent with current industry observations in digital media." }
      ]
    }
  },
  {
    id: "seed-3",
    topic: "Should companies mandate 5-day in-office work or offer full remote flexibility?",
    mode: "calm",
    date: "Aug 9, 2026",
    coverImage: COVER_IMAGES[2],
    personas: [
      { id: "person_a", name: "Person A", archetype: "Economic & Logistics", avatar_color: "indigo", tone: "Calm", logic_rating: 8 },
      { id: "person_b", name: "Person B", archetype: "Social & Freedom", avatar_color: "rose", tone: "Calm", logic_rating: 8 },
      { id: "person_c", name: "Person C", archetype: "Empirical Data", avatar_color: "emerald", tone: "Calm", logic_rating: 9 },
      { id: "person_d", name: "Person D", archetype: "Ethics & Psychology", avatar_color: "amber", tone: "Calm", logic_rating: 8 }
    ],
    turns: [
      { turn_index: 1, speaker_id: "person_a", speaker_name: "Person A", headline_point: "1. Spontaneous Innovation & Mentorship", spoken_text: "In-office presence fosters serendipitous collaboration, mentorship for junior talent, and maximizes real estate investments.", duration_ms: 7500 },
      { turn_index: 2, speaker_id: "person_b", speaker_name: "Person B", headline_point: "2. Work-Life Integration & Reduced Fatigue", spoken_text: "Remote flexibility eliminates commute fatigue, expands hiring diversity, and significantly improves employee well-being.", duration_ms: 8000 },
      { turn_index: 3, speaker_id: "person_c", speaker_name: "Person C", headline_point: "3. Retention Metrics & Productivity Data", spoken_text: "Longitudinal workplace studies confirm that hybrid models yield 14% higher retention with zero productivity loss.", duration_ms: 8000 },
      { turn_index: 4, speaker_id: "person_d", speaker_name: "Person D", headline_point: "4. Trust-Based Leadership & Mental Health", spoken_text: "Ethically, managing by output rather than physical desk presence builds organizational trust and reduces burnout.", duration_ms: 8000 },
      { turn_index: 5, speaker_id: "person_a", speaker_name: "Person A", headline_point: "5. Onboarding Challenges in Fully Remote Teams", spoken_text: "However, fully remote teams report 25% slower onboarding times for early-career hires who lack organic shadowing.", duration_ms: 7500 },
      { turn_index: 6, speaker_id: "person_b", speaker_name: "Person B", headline_point: "6. Socioeconomic Inclusion for Caregivers", spoken_text: "Remote flexibility allows working parents and caregivers to maintain full employment while supporting family routines.", duration_ms: 8000 },
      { turn_index: 7, speaker_id: "person_c", speaker_name: "Person C", headline_point: "7. Survey Preferences across 50,000 Employees", spoken_text: "76% of knowledge workers state they would consider leaving a role that enforces rigid 5-day office mandates.", duration_ms: 8000 },
      { turn_index: 8, speaker_id: "person_d", speaker_name: "Person D", headline_point: "8. Balanced Resolution: Structured Hybrid Model", spoken_text: "A structured 2/3 hybrid policy balances team bonding with individual focus time.", duration_ms: 7500 }
    ],
    attributed_conclusion: {
      summary: "Hybrid policies offer the optimal compromise between in-person team trust building and remote lifestyle flexibility.",
      agreement_mappings: [
        { persons: ["Person A", "Person B"], common_point: "Both agreed that structured core collaboration days preserve team cohesion while granting focus time." },
        { persons: ["Person C", "Person D"], common_point: "Both emphasized that output-based performance metrics beat physical desk monitoring." }
      ],
      core_tradeoffs: "Balancing centralized organizational culture with employee work-life autonomy.",
      discussion_quality_score: 85
    },
    transcript_analysis: {
      summary: "Constructive examination of organizational productivity versus individual remote flexibility.",
      coach: { overall_score: 85, verdict: "Respectful dialogue focusing on hybrid compromises.", tips: ["Measure output metrics rather than physical desk presence"] },
      participants: [
        { name: "Person A (Economic)", logic_score: 8, evidence_score: 8, respect_score: 9, clarity_score: 8, badges: ["🧠 Rational Thinker"] },
        { name: "Person B (Social & Freedom)", logic_score: 8, evidence_score: 8, respect_score: 9, clarity_score: 8, badges: ["🕊️ Autonomy Defender"] },
        { name: "Person C (Empirical Data)", logic_score: 9, evidence_score: 9, respect_score: 9, clarity_score: 9, badges: ["🔍 Evidence Hunter"] },
        { name: "Person D (Ethics & Psychology)", logic_score: 8, evidence_score: 8, respect_score: 10, clarity_score: 8, badges: ["🕊️ Respectful Debater"] }
      ],
      heat_map: [
        { speaker: "Person A", message: "In-office presence fosters spontaneous collaboration.", tone: "Calm", level: "Blue" },
        { speaker: "Person B", message: "Remote flexibility improves satisfaction and retention.", tone: "Calm", level: "Blue" }
      ],
      evidence_meter: [
        { claim: "Hybrid models maintain productivity while boosting retention.", speaker: "Person C", status: "Supported by facts", reason: "Supported by recent workplace survey data." }
      ]
    }
  }
];

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchFallacyLibrary();
  initStorage();
  initSettings();

  // Initialize Canvas 2D Stage
  if (document.getElementById('roundtable-canvas')) {
    canvasStage = new CanvasRoundTable('roundtable-canvas');
  }
});

// Settings Management (Custom Persona Names, Personalities & Duration)
const DEFAULT_SETTINGS = {
  personas: {
    person_a: { name: "Person A", archetype: "Economic & Logistics Parameter" },
    person_b: { name: "Person B", archetype: "Social & Individual Freedom Parameter" },
    person_c: { name: "Person C", archetype: "Empirical Data & Scientific Parameter" },
    person_d: { name: "Person D", archetype: "Ethical & Psychological Parameter" }
  },
  discussionDurationMinutes: 1
};

function getSavedSettings() {
  try {
    const raw = localStorage.getItem('logiclens_settings');
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

function initSettings() {
  const settings = getSavedSettings();
  
  const pA = settings.personas?.person_a || DEFAULT_SETTINGS.personas.person_a;
  const pB = settings.personas?.person_b || DEFAULT_SETTINGS.personas.person_b;
  const pC = settings.personas?.person_c || DEFAULT_SETTINGS.personas.person_c;
  const pD = settings.personas?.person_d || DEFAULT_SETTINGS.personas.person_d;

  const nameA = document.getElementById('setting-name-a');
  const nameB = document.getElementById('setting-name-b');
  const nameC = document.getElementById('setting-name-c');
  const nameD = document.getElementById('setting-name-d');

  if (nameA) nameA.value = pA.name || "Person A";
  if (nameB) nameB.value = pB.name || "Person B";
  if (nameC) nameC.value = pC.name || "Person C";
  if (nameD) nameD.value = pD.name || "Person D";

  const archA = document.getElementById('setting-arch-a');
  const archB = document.getElementById('setting-arch-b');
  const archC = document.getElementById('setting-arch-c');
  const archD = document.getElementById('setting-arch-d');

  if (archA) archA.value = pA.archetype || "Economic & Logistics Parameter";
  if (archB) archB.value = pB.archetype || "Social & Individual Freedom Parameter";
  if (archC) archC.value = pC.archetype || "Empirical Data & Scientific Parameter";
  if (archD) archD.value = pD.archetype || "Ethical & Psychological Parameter";

  const durationSelect = document.getElementById('setting-duration-select');
  if (durationSelect) durationSelect.value = settings.discussionDurationMinutes || 1;

  updateArchetypeDropdowns();
}

// Mutual Exclusion Rule: Ensures no two personas share the exact same personality archetype!
function updateArchetypeDropdowns() {
  const dropdowns = [
    document.getElementById('setting-arch-a'),
    document.getElementById('setting-arch-b'),
    document.getElementById('setting-arch-c'),
    document.getElementById('setting-arch-d')
  ];

  if (dropdowns.some(d => !d)) return;

  const selectedValues = dropdowns.map(d => d.value);

  dropdowns.forEach((currentDropdown, currentIndex) => {
    const otherSelected = selectedValues.filter((_, idx) => idx !== currentIndex);
    Array.from(currentDropdown.options).forEach(option => {
      if (otherSelected.includes(option.value)) {
        option.disabled = true;
        option.textContent = `${option.textContent.replace(' (In Use)', '')} (In Use)`;
      } else {
        option.disabled = false;
        option.textContent = option.textContent.replace(' (In Use)', '');
      }
    });
  });
}

function saveSettings() {
  const nameA = document.getElementById('setting-name-a')?.value.trim() || "Person A";
  const nameB = document.getElementById('setting-name-b')?.value.trim() || "Person B";
  const nameC = document.getElementById('setting-name-c')?.value.trim() || "Person C";
  const nameD = document.getElementById('setting-name-d')?.value.trim() || "Person D";

  const archA = document.getElementById('setting-arch-a')?.value || "Economic & Logistics Parameter";
  const archB = document.getElementById('setting-arch-b')?.value || "Social & Individual Freedom Parameter";
  const archC = document.getElementById('setting-arch-c')?.value || "Empirical Data & Scientific Parameter";
  const archD = document.getElementById('setting-arch-d')?.value || "Ethical & Psychological Parameter";

  const duration = parseInt(document.getElementById('setting-duration-select')?.value) || 1;

  const newSettings = {
    personas: {
      person_a: { name: nameA, archetype: archA },
      person_b: { name: nameB, archetype: archB },
      person_c: { name: nameC, archetype: archC },
      person_d: { name: nameD, archetype: archD }
    },
    discussionDurationMinutes: duration
  };

  localStorage.setItem('logiclens_settings', JSON.stringify(newSettings));
  alert(`✅ Settings Saved Successfully!\n\nPersonas set to:\n• ${nameA} (${archA.split(' ')[0]})\n• ${nameB} (${archB.split(' ')[0]})\n• ${nameC} (${archC.split(' ')[0]})\n• ${nameD} (${archD.split(' ')[0]})\n\nDiscussion Duration: ${duration} Minute(s).`);
}

// Storage Management
function initStorage() {
  const existing = localStorage.getItem('logiclens_saved_debates');
  if (!existing) {
    localStorage.setItem('logiclens_saved_debates', JSON.stringify(DEFAULT_SEED_DEBATES));
  } else {
    try {
      const parsed = JSON.parse(existing);
      // Auto-upgrade storage if old seed data had less than 6 turns
      const needsUpgrade = parsed.some(d => !d.turns || d.turns.length < 6);
      if (needsUpgrade) {
        localStorage.setItem('logiclens_saved_debates', JSON.stringify(DEFAULT_SEED_DEBATES));
      }
    } catch (e) {
      localStorage.setItem('logiclens_saved_debates', JSON.stringify(DEFAULT_SEED_DEBATES));
    }
  }
}

function getStoredDebates() {
  try {
    const raw = localStorage.getItem('logiclens_saved_debates');
    return raw ? JSON.parse(raw) : DEFAULT_SEED_DEBATES;
  } catch (e) {
    return DEFAULT_SEED_DEBATES;
  }
}

function saveDebateToStorage(debateData) {
  if (!debateData || !debateData.topic) return;
  const stored = getStoredDebates();
  
  const existingIdx = stored.findIndex(d => d.topic.toLowerCase() === debateData.topic.toLowerCase());
  
  const settings = getSavedSettings();
  const newEntry = {
    id: `debate-${Date.now()}`,
    topic: debateData.topic,
    mode: currentMode,
    durationMinutes: debateData.durationMinutes || settings.discussionDurationMinutes || 1,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    coverImage: COVER_IMAGES[stored.length % COVER_IMAGES.length],
    personas: debateData.personas || [],
    turns: debateData.turns || [],
    attributed_conclusion: debateData.attributed_conclusion || {},
    transcript_analysis: debateData.transcript_analysis || {}
  };

  if (existingIdx !== -1) {
    stored[existingIdx] = newEntry;
  } else {
    stored.unshift(newEntry);
  }

  localStorage.setItem('logiclens_saved_debates', JSON.stringify(stored));
}

function clearSavedStorage() {
  if (confirm("Are you sure you want to clear all saved debates from storage?")) {
    localStorage.removeItem('logiclens_saved_debates');
    initStorage();
    alert("Saved debates have been reset to default seeds.");
    switchSidebarTab('library');
  }
}

// Mobile Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar-panel');
  if (sidebar) sidebar.classList.toggle('open');
}

// Theme Switcher Sync
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

let isDiscussionPaused = false;

// Sidebar Navigation Tabs (Pauses live discussion & TTS speech audio immediately on tab switch!)
function switchSidebarTab(target) {
  if (target !== 'dashboard') {
    pauseDiscussion();
  }

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
    renderLibraryView();
  } else if (target === 'reports') {
    renderReportsView();
  } else if (target === 'analytics') {
    renderAnalyticsView();
  } else if (target === 'insights') {
    renderInsightsView();
  }
}

// Discussion Pause / Resume Control Engine
function toggleDiscussionPause() {
  if (isDiscussionPaused) {
    resumeDiscussion();
  } else {
    pauseDiscussion();
  }
}

function pauseDiscussion() {
  isDiscussionPaused = true;
  if (canvasStage) canvasStage.stopSpeech();
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const pauseBtn = document.getElementById('pause-resume-btn');
  if (pauseBtn) pauseBtn.innerHTML = '<span>▶️ Resume</span>';

  const liveTag = document.getElementById('live-indicator-tag');
  if (liveTag) {
    liveTag.style.background = 'rgba(217,119,6,0.15)';
    liveTag.style.color = 'var(--accent-amber)';
    liveTag.textContent = '⏸️ PAUSED';
  }

  const statusEl = document.getElementById('live-speaker-status');
  if (statusEl && activeTurnIndex < (roundTableData?.turns?.length || 0)) {
    statusEl.textContent = `Discussion paused at Turn ${activeTurnIndex + 1}. Click ▶️ Resume to continue playback.`;
  }
}

function resumeDiscussion() {
  if (!roundTableData || !roundTableData.turns) return;
  isDiscussionPaused = false;

  const pauseBtn = document.getElementById('pause-resume-btn');
  if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ Pause</span>';

  const liveTag = document.getElementById('live-indicator-tag');
  if (liveTag) {
    liveTag.style.background = 'rgba(220,38,38,0.15)';
    liveTag.style.color = 'var(--accent-rose)';
    liveTag.textContent = '🔴 LIVE DEBATE STREAMING';
  }

  // Resume turn-by-turn playback from current active turn index
  runSequentialTurn();
}

// Delete Debate Card Helper
function deleteDebateCard(evt, debateId) {
  if (evt) evt.stopPropagation();
  if (!confirm("Are you sure you want to delete this saved debate?")) return;

  if (canvasStage) canvasStage.stopSpeech();
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  let stored = getStoredDebates();
  stored = stored.filter(d => d.id !== debateId);
  localStorage.setItem('logiclens_saved_debates', JSON.stringify(stored));

  renderLibraryView();
  renderReportsView();
  renderAnalyticsView();
  renderInsightsView();
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

// Mode Selection
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
    const settings = getSavedSettings();
    const res = await fetch('/api/simulate-roundtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        mode: currentMode,
        customPersonas: settings.personas,
        discussionDurationMinutes: settings.discussionDurationMinutes
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to simulate discussion');

    roundTableData = data.data;
    
    // Save to Local Storage Vault
    saveDebateToStorage(roundTableData);

    // Initialize persona live logs
    roundTableData.personaLogs = {
      person_a: [],
      person_b: [],
      person_c: [],
      person_d: []
    };

    if (canvasStage) {
      canvasStage.setTopic(roundTableData.topic);
      canvasStage.updatePersonas(roundTableData.personas);
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

let activeTurnsList = [];
let activeStreamSessionId = 0;

// Live Turn Sequencer Engine (Deterministic Session Guard & Sequential Flow)
function startSequentialLiveStream(turns) {
  if (!turns || turns.length === 0) return;
  
  // Invalidate any previous stream loop immediately
  activeStreamSessionId++;
  if (canvasStage) canvasStage.stopSpeech();
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  activeTurnsList = turns;
  activeTurnIndex = 0;
  isDiscussionPaused = false;

  const pauseBtn = document.getElementById('pause-resume-btn');
  if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ Pause</span>';

  const liveTag = document.getElementById('live-indicator-tag');
  if (liveTag) {
    liveTag.style.background = 'rgba(220,38,38,0.15)';
    liveTag.style.color = 'var(--accent-rose)';
    liveTag.textContent = '🔴 LIVE DEBATE STREAMING';
  }

  runSequentialTurn();
}

function runSequentialTurn() {
  const currentSessionId = activeStreamSessionId;

  if (isDiscussionPaused || currentSessionId !== activeStreamSessionId || !activeTurnsList || activeTurnsList.length === 0) {
    return;
  }

  if (activeTurnIndex >= activeTurnsList.length) {
    document.getElementById('live-speaker-status').textContent = 'Discussion wrapping up... personas synthesizing common ground.';
    
    setTimeout(() => {
      if (isDiscussionPaused || currentSessionId !== activeStreamSessionId) return;
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
    }, 2000);
    return;
  }

  const turn = activeTurnsList[activeTurnIndex];
  const speakerId = turn.speaker_id;

  if (roundTableData && roundTableData.personaLogs && roundTableData.personaLogs[speakerId]) {
    // Avoid duplicate log push on resume
    const lastLogged = roundTableData.personaLogs[speakerId][roundTableData.personaLogs[speakerId].length - 1];
    if (!lastLogged || lastLogged.turn_index !== turn.turn_index) {
      roundTableData.personaLogs[speakerId].push(turn);
    }
  }

  if (activeOpenDrawerPersonId === speakerId) {
    renderLivePersonaDrawerContent(speakerId);
  }

  const transitionLabel = turn.transition_type === 'organic_interjection' ? '⚡ interjecting...' : turn.transition_type === 'direct_counter' ? '💬 responding...' : 'speaking...';
  const statusText = `Turn ${turn.turn_index} of ${activeTurnsList.length}: ${turn.speaker_name} is ${transitionLabel}`;
  document.getElementById('live-speaker-status').textContent = statusText;

  let turnAdvanced = false;
  const advanceTurn = () => {
    if (turnAdvanced || isDiscussionPaused || currentSessionId !== activeStreamSessionId) return;
    turnAdvanced = true;
    activeTurnIndex++;
    runSequentialTurn();
  };

  if (canvasStage) {
    canvasStage.setActiveSpeaker(speakerId, turn.headline_point, turn.spoken_text, advanceTurn);
  } else {
    setTimeout(advanceTurn, 7500);
  }
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

// --------------------------------------------------------------------------
// 📚 SUB-PAGE 1: LIBRARY VIEW RENDERER (SAVED DEBATES VAULT)
// --------------------------------------------------------------------------
function renderLibraryView() {
  const grid = document.getElementById('library-grid-container');
  if (!grid) return;
  const debates = getStoredDebates();

  if (debates.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted); font-style:italic; grid-column:1/-1;">No saved debates found. Generate a debate from the Dashboard tab!</p>';
    return;
  }

  grid.innerHTML = debates.map(d => `
    <div class="debate-card" onclick="loadSavedDebateIntoRoundTable('${d.id}')">
      <div class="debate-card-img-wrap">
        <button class="card-delete-btn" onclick="deleteDebateCard(event, '${d.id}')" title="Delete debate">🗑️</button>
        <img src="${d.coverImage || COVER_IMAGES[0]}" alt="Cover" class="debate-card-img" />
        <span class="debate-card-mode-badge">${d.mode === 'calm' ? '🕊️ Calm Rewrite' : '🗣️ Deep Discussion'}</span>
        <span class="debate-card-duration-badge">⏱️ ${d.durationMinutes || 1} Min</span>
      </div>
      <div class="debate-card-body">
        <h4 class="debate-card-title">${escapeHtml(d.topic)}</h4>
        <div class="debate-card-footer">
          <span>📅 ${escapeHtml(d.date || 'Recent')}</span>
          <span style="color:var(--accent-indigo); font-weight:700;">Re-Play Stage →</span>
        </div>
      </div>
    </div>
  `).join('');
}

function filterLibraryCards() {
  const query = document.getElementById('library-search-input').value.toLowerCase();
  const debates = getStoredDebates();
  const filtered = debates.filter(d => d.topic.toLowerCase().includes(query));
  
  const grid = document.getElementById('library-grid-container');
  if (!grid) return;

  grid.innerHTML = filtered.map(d => `
    <div class="debate-card" onclick="loadSavedDebateIntoRoundTable('${d.id}')">
      <div class="debate-card-img-wrap">
        <button class="card-delete-btn" onclick="deleteDebateCard(event, '${d.id}')" title="Delete debate">🗑️</button>
        <img src="${d.coverImage || COVER_IMAGES[0]}" alt="Cover" class="debate-card-img" />
        <span class="debate-card-mode-badge">${d.mode === 'calm' ? '🕊️ Calm Rewrite' : '🗣️ Deep Discussion'}</span>
        <span class="debate-card-duration-badge">⏱️ ${d.durationMinutes || 1} Min</span>
      </div>
      <div class="debate-card-body">
        <h4 class="debate-card-title">${escapeHtml(d.topic)}</h4>
        <div class="debate-card-footer">
          <span>📅 ${escapeHtml(d.date || 'Recent')}</span>
          <span style="color:var(--accent-indigo); font-weight:700;">Re-Play Stage →</span>
        </div>
      </div>
    </div>
  `).join('');
}

function loadSavedDebateIntoRoundTable(debateId) {
  const debates = getStoredDebates();
  const debate = debates.find(d => d.id === debateId);
  if (!debate) return;

  // Invalidate any previous running session immediately
  activeStreamSessionId++;
  if (canvasStage) canvasStage.stopSpeech();
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  roundTableData = debate;
  roundTableData.personaLogs = { person_a: [], person_b: [], person_c: [], person_d: [] };

  switchSidebarTab('dashboard');
  isDiscussionPaused = false;
  
  document.getElementById('topic-input').value = debate.topic;
  document.getElementById('minimized-topic-text').textContent = `"${debate.topic}"`;
  document.getElementById('stage-topic-title').textContent = debate.topic;

  collapseTopicInput();
  const stageWorkspace = document.getElementById('roundtable-workspace');
  stageWorkspace.classList.remove('hidden');

  if (canvasStage) {
    canvasStage.setTopic(debate.topic);
    canvasStage.updatePersonas(debate.personas);
  }

  renderTopicTranscriptAnalysis(debate.transcript_analysis);
  startSequentialLiveStream(debate.turns || []);
}

// --------------------------------------------------------------------------
// 📄 SUB-PAGE 2: REPORTS VAULT VIEW RENDERER (SEPARATE REPORTS VAULT PAGE)
// --------------------------------------------------------------------------
function renderReportsView() {
  const grid = document.getElementById('reports-grid-container');
  if (!grid) return;
  const debates = getStoredDebates();

  if (debates.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted); font-style:italic; grid-column:1/-1;">No reports found. Generate a debate to store executive reports!</p>';
    return;
  }

  grid.innerHTML = debates.map(d => {
    const score = d.attributed_conclusion?.discussion_quality_score || d.transcript_analysis?.coach?.overall_score || 88;
    return `
      <div class="debate-card" onclick="openReportModalForDebate('${d.id}')">
        <div class="debate-card-img-wrap">
          <button class="card-delete-btn" onclick="deleteDebateCard(event, '${d.id}')" title="Delete report">🗑️</button>
          <img src="${d.coverImage || COVER_IMAGES[0]}" alt="Cover" class="debate-card-img" />
          <span class="debate-card-mode-badge" style="background:rgba(79,70,229,0.9);">📄 ${score}/100 Score</span>
          <span class="debate-card-duration-badge">⏱️ ${d.durationMinutes || 1} Min</span>
        </div>
        <div class="debate-card-body">
          <h4 class="debate-card-title">${escapeHtml(d.topic)}</h4>
          <div class="debate-card-footer">
            <span>📅 ${escapeHtml(d.date || 'Recent')}</span>
            <span style="color:var(--accent-indigo); font-weight:700;">Open Report →</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openReportModalForDebate(debateId) {
  const debates = getStoredDebates();
  const debate = debates.find(d => d.id === debateId);
  if (!debate) return;

  roundTableData = debate;
  openConclusionModal();
}

// --------------------------------------------------------------------------
// 📥 UNIVERSAL PDF EXPORT ENGINE (CLEAN PRINTING WITHOUT TEXT CLIPPING)
// --------------------------------------------------------------------------
function exportReportToPDF() {
  if (!roundTableData || !roundTableData.attributed_conclusion) {
    alert('No report data available to export.');
    return;
  }

  const conc = roundTableData.attributed_conclusion;
  const topic = roundTableData.topic;
  const score = conc.discussion_quality_score || 88;
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const personasHtml = (roundTableData.personas || []).map(p => `
    <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:12px; border-radius:8px; margin-bottom:10px;">
      <strong style="color:#1E293B; font-size:14px;">${escapeHtml(p.name)} (${escapeHtml(p.archetype)})</strong>
      <div style="font-size:13px; color:#475569; margin-top:4px;">Behavior Tone: <strong>${escapeHtml(p.tone || 'Calm')}</strong> | Logic Rating: <strong>${p.logic_rating || 8}/10</strong></div>
    </div>
  `).join('');

  const alignmentsHtml = (conc.agreement_mappings || []).map(m => `
    <div style="background:#F0FDF4; border:1px solid #BBF7D0; padding:12px; border-radius:8px; margin-bottom:10px;">
      <strong style="color:#166534; font-size:13px;">🤝 Alignment (${(m.persons || []).join(' & ')}):</strong>
      <p style="font-size:13px; color:#1E293B; margin-top:4px;">${escapeHtml(m.common_point)}</p>
    </div>
  `).join('');

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow pop-ups to download/print the PDF report.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>LogicLens AI Executive Report - ${escapeHtml(topic)}</title>
      <style>
        body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 40px; color: #0F172A; line-height: 1.6; }
        .header-box { border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .title { font-size: 22px; font-weight: 800; color: #1E293B; margin-top: 4px; }
        .score-badge { font-size: 24px; font-weight: 800; color: #059669; background: #ECFDF5; padding: 8px 16px; border-radius: 8px; border: 1px solid #A7F3D0; }
        .section-header { font-size: 15px; font-weight: 700; color: #4F46E5; text-transform: uppercase; letter-spacing: 0.05em; margin: 25px 0 10px; }
        .summary-box { font-size: 14px; background: #F8FAFC; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0; }
        .tradeoff-box { background: #FFFBEB; border: 1px solid #FDE68A; padding: 16px; border-radius: 8px; font-size: 14px; }
        @media print {
          body { padding: 20px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div>
          <div style="font-size:12px; color:#64748B; font-weight:700; text-transform:uppercase;">LogicLens AI Executive Reasoning Report • ${date}</div>
          <div class="title">"${escapeHtml(topic)}"</div>
        </div>
        <div class="score-badge">${score} / 100</div>
      </div>

      <div class="section-header">1. Synthesized Consensus Verdict</div>
      <div class="summary-box">${escapeHtml(conc.summary || '')}</div>

      <div class="section-header">2. Participant Behavioral Profiles & Cognitive Logic Ratings</div>
      ${personasHtml}

      <div class="section-header">3. Attributed Common Ground Alignments</div>
      ${alignmentsHtml}

      <div class="section-header">4. Fundamental Dilemma & Strategic Trade-Off</div>
      <div class="tradeoff-box">${escapeHtml(conc.core_tradeoffs || '')}</div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

// --------------------------------------------------------------------------
// 📈 SUB-PAGE 3: ANALYTICS VIEW RENDERER (GLOBAL + INDIVIDUAL CARDS)
// --------------------------------------------------------------------------
function renderAnalyticsView() {
  const debates = getStoredDebates();

  const totalCount = debates.length;
  let totalScoreSum = 0;
  debates.forEach(d => {
    const score = d.attributed_conclusion?.discussion_quality_score || d.transcript_analysis?.coach?.overall_score || 88;
    totalScoreSum += score;
  });
  const avgScore = totalCount > 0 ? Math.round(totalScoreSum / totalCount) : 0;

  document.getElementById('stat-total-debates').textContent = totalCount;
  document.getElementById('stat-avg-score').textContent = `${avgScore} / 100`;
  document.getElementById('stat-consensus-rate').textContent = `100%`;
  document.getElementById('stat-top-parameter').textContent = `Empirical Data`;

  const grid = document.getElementById('analytics-grid-container');
  if (!grid) return;

  if (debates.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted); font-style:italic; grid-column:1/-1;">No analytics available yet. Generate a debate from the Dashboard tab!</p>';
    return;
  }

  grid.innerHTML = debates.map(d => {
    const score = d.attributed_conclusion?.discussion_quality_score || d.transcript_analysis?.coach?.overall_score || 88;
    return `
      <div class="debate-card" onclick="openIndividualDebateAnalytics('${d.id}')">
        <div class="debate-card-img-wrap">
          <button class="card-delete-btn" onclick="deleteDebateCard(event, '${d.id}')" title="Delete debate">🗑️</button>
          <img src="${d.coverImage || COVER_IMAGES[0]}" alt="Cover" class="debate-card-img" />
          <span class="debate-card-mode-badge" style="background:rgba(5,150,105,0.9);">${score}/100 Score</span>
          <span class="debate-card-duration-badge">⏱️ ${d.durationMinutes || 1} Min</span>
        </div>
        <div class="debate-card-body">
          <h4 class="debate-card-title">${escapeHtml(d.topic)}</h4>
          <div class="debate-card-footer">
            <span>📅 ${escapeHtml(d.date || 'Recent')}</span>
            <span style="color:var(--accent-emerald); font-weight:700;">Inspect Metrics →</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openIndividualDebateAnalytics(debateId) {
  const debates = getStoredDebates();
  const debate = debates.find(d => d.id === debateId);
  if (!debate) return;

  roundTableData = debate;
  switchSidebarTab('dashboard');
  
  collapseTopicInput();
  const stageWorkspace = document.getElementById('roundtable-workspace');
  stageWorkspace.classList.remove('hidden');

  renderTopicTranscriptAnalysis(debate.transcript_analysis);
  
  isAnalysisViewActive = false;
  toggleTranscriptAnalysisView();
}

// --------------------------------------------------------------------------
// 💡 SUB-PAGE 4: INSIGHTS VIEW RENDERER (KEY INSIGHTS MODAL POP-UP)
// --------------------------------------------------------------------------
function renderInsightsView() {
  const grid = document.getElementById('insights-grid-container');
  if (!grid) return;
  const debates = getStoredDebates();

  if (debates.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted); font-style:italic; grid-column:1/-1;">No saved insights available yet. Generate a debate from the Dashboard tab!</p>';
    return;
  }

  grid.innerHTML = debates.map(d => `
    <div class="debate-card" onclick="openInsightsModal('${d.id}')">
      <div class="debate-card-img-wrap">
        <button class="card-delete-btn" onclick="deleteDebateCard(event, '${d.id}')" title="Delete debate">🗑️</button>
        <img src="${d.coverImage || COVER_IMAGES[0]}" alt="Cover" class="debate-card-img" />
        <span class="debate-card-mode-badge" style="background:rgba(217,119,6,0.9);">💡 Insights</span>
        <span class="debate-card-duration-badge">⏱️ ${d.durationMinutes || 1} Min</span>
      </div>
      <div class="debate-card-body">
        <h4 class="debate-card-title">${escapeHtml(d.topic)}</h4>
        <div class="debate-card-footer">
          <span>📅 ${escapeHtml(d.date || 'Recent')}</span>
          <span style="color:var(--accent-amber); font-weight:700;">View Takeaways →</span>
        </div>
      </div>
    </div>
  `).join('');
}

function openInsightsModal(debateId) {
  const debates = getStoredDebates();
  const debate = debates.find(d => d.id === debateId);
  if (!debate) return;

  document.getElementById('insights-modal-topic').textContent = `"${debate.topic}"`;
  document.getElementById('insights-modal-summary').textContent = debate.attributed_conclusion?.summary || debate.transcript_analysis?.summary || 'Comprehensive reasoning insights generated across 4 cognitive parameters.';
  
  const personasContainer = document.getElementById('insights-modal-personas');
  if (personasContainer) {
    personasContainer.innerHTML = (debate.personas || []).map(p => `
      <div style="background:var(--bg-card); padding:0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
        <strong style="color:var(--accent-indigo); font-size:0.85rem;">${escapeHtml(p.name)} (${escapeHtml(p.archetype)})</strong>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-top:0.2rem;">Key Parameter: Evaluated practical, social, empirical, or psychological dimensions.</p>
      </div>
    `).join('');
  }

  document.getElementById('insights-modal-tradeoff').textContent = debate.attributed_conclusion?.core_tradeoffs || 'Fundamental trade-off reconciled through multi-parameter consensus.';
  document.getElementById('insights-modal').classList.remove('hidden');
}

function closeInsightsModal() {
  document.getElementById('insights-modal').classList.add('hidden');
}

// TRANSCRIPT ANALYSIS METRICS RENDERER
function renderTopicTranscriptAnalysis(analysis) {
  if (!analysis) return;

  document.getElementById('topic-summary-text').textContent = analysis.summary || '';
  const coach = analysis.coach || { overall_score: 85, verdict: 'Good reasoning quality.', tips: [] };
  document.getElementById('topic-coach-score-num').textContent = coach.overall_score;
  document.getElementById('topic-coach-verdict-title').textContent = coach.verdict;
  
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

  const colorMap = {
    'Person A': { color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.12)' },
    'Person B': { color: '#E11D48', bg: 'rgba(225, 29, 72, 0.12)' },
    'Person C': { color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
    'Person D': { color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' }
  };

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
            <div class="metric-line"><span>Evidence Support</span><strong>${p.evidence_score}/10</strong></div>
            <div style="width:100%; height:6px; background:var(--border-subtle); border-radius:3px; overflow:hidden;">
              <div style="width:${(p.evidence_score * 10)}%; height:100%; background:${theme.color}; border-radius:3px;"></div>
            </div>

            <div class="metric-line" style="margin-top:0.4rem;"><span>Clarity</span><strong>${p.clarity_score}/10</strong></div>
            <div style="width:100%; height:6px; background:var(--border-subtle); border-radius:3px; overflow:hidden;">
              <div style="width:${(p.clarity_score * 10)}%; height:100%; background:${theme.color}; border-radius:3px;"></div>
            </div>

            <div class="metric-line" style="margin-top:0.4rem;"><span>Respectfulness</span><strong>${p.respect_score}/10</strong></div>
            <div style="width:100%; height:6px; background:var(--border-subtle); border-radius:3px; overflow:hidden;">
              <div style="width:${(p.respect_score * 10)}%; height:100%; background:${theme.color}; border-radius:3px;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

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

  if (clickX >= w - 125 && clickX <= w - 15 && clickY >= 10 && clickY <= 50) {
    const isEnabled = canvasStage.toggleAudio();
    alert(isEnabled ? '🔊 Voice Audio Enabled for Discussion!' : '🔇 Voice Audio Muted.');
    return;
  }

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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
