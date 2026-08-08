// LogicLens Dashboard & Virtual Round-Table Conference Engine (dashboard.js)

let currentMode = 'roundtable';
let roundTableData = null;
let fallacyLibraryCache = [];

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
});

// Mobile Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar-panel');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
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

  // Close mobile sidebar if open
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
  if (mode === 'roundtable') {
    btnText.textContent = '✨ Generate Round-Table Discussion';
  } else if (mode === 'calm') {
    btnText.textContent = '🕊️ Rewrite Calm Dialogue';
  } else {
    btnText.textContent = '📊 Full Transcript Analysis';
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

  if (!topic || topic.length < 5) {
    showError('Please enter a valid topic or opinion (at least 5 characters).');
    return;
  }

  loadingIndicator.classList.remove('hidden');
  analyzeBtn.disabled = true;

  try {
    const res = await fetch('/api/simulate-roundtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to simulate round-table discussion');

    roundTableData = data.data;
    renderRoundTableStage(roundTableData);

    // Minimize topic input box & show round-table stage
    collapseTopicInput();
    stageWorkspace.classList.remove('hidden');
    stageWorkspace.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showError(err.message || 'An error occurred during round-table simulation.');
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

// Render Round-Table Stage
function renderRoundTableStage(data) {
  document.getElementById('minimized-topic-text').textContent = `"${data.topic}"`;
  document.getElementById('stage-topic-title').textContent = data.topic;

  const personas = data.personas || [];
  
  personas.forEach(p => {
    const id = p.id;
    if (id === 'person_a') {
      document.getElementById('bubble-person-a').textContent = `"${p.headline_quote}"`;
      document.getElementById('tag-person-a').textContent = `${p.name} (${p.archetype})`;
    } else if (id === 'person_b') {
      document.getElementById('bubble-person-b').textContent = `"${p.headline_quote}"`;
      document.getElementById('tag-person-b').textContent = `${p.name} (${p.archetype})`;
    } else if (id === 'person_c') {
      document.getElementById('bubble-person-c').textContent = `"${p.headline_quote}"`;
      document.getElementById('tag-person-c').textContent = `${p.name} (${p.archetype})`;
    } else if (id === 'person_d') {
      document.getElementById('bubble-person-d').textContent = `"${p.headline_quote}"`;
      document.getElementById('tag-person-d').textContent = `${p.name} (${p.archetype})`;
    }
  });
}

// Open Persona Detail Slide Drawer
function openPersonaDrawer(personaId) {
  if (!roundTableData || !roundTableData.personas) return;
  const persona = roundTableData.personas.find(p => p.id === personaId);
  if (!persona) return;

  document.getElementById('drawer-persona-name').textContent = persona.name;
  document.getElementById('drawer-persona-archetype').textContent = persona.archetype;
  document.getElementById('drawer-persona-quote').textContent = `"${persona.headline_quote}"`;
  document.getElementById('drawer-persona-argument').textContent = persona.full_argument;
  
  const pointsList = document.getElementById('drawer-persona-points');
  pointsList.innerHTML = (persona.key_points || []).map(pt => `<li>${escapeHtml(pt)}</li>`).join('');
  
  document.getElementById('drawer-persona-evidence').textContent = persona.evidence_cited || 'General qualitative rationale.';

  document.getElementById('persona-drawer').classList.remove('hidden');
}

function closePersonaDrawer() {
  document.getElementById('persona-drawer').classList.add('hidden');
}

// Open Conclusion Synthesis Modal
function openConclusionModal() {
  if (!roundTableData || !roundTableData.synthesis_conclusion) {
    alert('Please generate a round-table discussion first.');
    return;
  }

  const conc = roundTableData.synthesis_conclusion;
  document.getElementById('conclusion-summary-text').textContent = conc.summary || '';
  
  const consensusList = document.getElementById('conclusion-consensus-list');
  consensusList.innerHTML = (conc.consensus_points || []).map(pt => `<li>${escapeHtml(pt)}</li>`).join('');

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
