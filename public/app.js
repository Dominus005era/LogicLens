// State management
let currentMode = 'analyze';
let fallacyLibraryCache = [];

// Preset Debates Catalog
const PRESETS = {
  ev: `Person A: Electric cars are useless because charging stations don't exist.
Person B: That's false. Thousands of charging stations exist today.
Person A: Whatever. Batteries explode anyway.
Person B: Statistics show EV fires are actually less common than gasoline vehicle fires.`,

  ai: `Developer A: Generative AI is going to destroy all software engineering jobs within two years!
Developer B: That's an extreme claim. AI tools currently assist with boilerplate code, but high-level system architecture and problem solving still require human reasoning.
Developer A: You're just coping because you don't want to admit you'll be unemployed.
Developer B: I'm relying on historical data regarding technology adoption rather than fear.`,

  remote: `Manager: Remote work makes employees lazy and completely destroys company culture.
Employee: Studies from Stanford show remote workers are 13% more productive and report higher job satisfaction.
Manager: Well, true dedicated employees want to be in the office every day.
Employee: Productivity metrics and retention rates are more reliable indicators of dedication than physical presence.`,

  mars: `Advocate: We must colonize Mars immediately to ensure the survival of human consciousness.
Skeptic: Fixing Earth's climate issues should take 100% priority before spending trillions on a dead planet.
Advocate: You obviously don't care about human extinction risks.
Skeptic: I care deeply about extinction, which is why preserving our existing biosphere is mathematically the highest leverage priority.`,

  social: `User A: Social media is pure cancer that ruins teenager mental health.
User B: While heavy usage correlates with anxiety, social media also enables global communities and educational access.
User A: My nephew spends 8 hours on TikTok and got bad grades, so it's all bad.
User B: That's a single anecdotal example; randomized controlled trials suggest screen time quality and sleep hygiene matter more than app existence.`
};

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  fetchFallacyLibrary();
});

// Load Preset Debate Text
function loadPreset(key) {
  const input = document.getElementById('debate-input');
  if (PRESETS[key]) {
    input.value = PRESETS[key];
    input.focus();
  }
}

// Clear Textarea
function clearInput() {
  document.getElementById('debate-input').value = '';
  document.getElementById('results-dashboard').classList.add('hidden');
  document.getElementById('error-message').classList.add('hidden');
}

// Mode Selection
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });

  const personaContainer = document.getElementById('persona-select-container');
  const btnText = document.getElementById('btn-text');

  if (mode === 'persona') {
    personaContainer.classList.remove('hidden');
    btnText.textContent = '🎭 Evaluate with Persona';
  } else if (mode === 'calm') {
    personaContainer.classList.add('hidden');
    btnText.textContent = '🕊️ Rewrite Calm Dialogue';
  } else {
    personaContainer.classList.add('hidden');
    btnText.textContent = '✨ Analyze Reasoning Quality';
  }
}

// Trigger Analysis Button Action
async function triggerAnalysis() {
  const debateText = document.getElementById('debate-input').value.trim();
  const errorBanner = document.getElementById('error-message');
  const loadingIndicator = document.getElementById('loading-indicator');
  const resultsDashboard = document.getElementById('results-dashboard');
  const analyzeBtn = document.getElementById('analyze-btn');

  errorBanner.classList.add('hidden');
  resultsDashboard.classList.add('hidden');

  if (!debateText || debateText.length < 10) {
    showError('Please enter a valid argument or conversation transcript (at least 10 characters).');
    return;
  }

  // UI Loading State
  loadingIndicator.classList.remove('hidden');
  analyzeBtn.disabled = true;

  try {
    if (currentMode === 'analyze') {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debateText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze debate');
      renderAnalysisResults(data.data);
    } else if (currentMode === 'calm') {
      const res = await fetch('/api/rewrite-calm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debateText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rewrite calm debate');
      renderCalmRewriteResults(data.data);
    } else if (currentMode === 'persona') {
      const persona = document.getElementById('persona-select').value;
      const res = await fetch('/api/persona-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debateText, persona })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run persona evaluation');
      renderPersonaResults(data.data);
    }

    resultsDashboard.classList.remove('hidden');
    resultsDashboard.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showError(err.message || 'An error occurred during analysis.');
  } finally {
    loadingIndicator.classList.add('hidden');
    analyzeBtn.disabled = false;
  }
}

// Display Error Message
function showError(msg) {
  const errorBanner = document.getElementById('error-message');
  errorBanner.textContent = `⚠️ Error: ${msg}`;
  errorBanner.classList.remove('hidden');
}

// Render Standard Analysis Results
function renderAnalysisResults(data) {
  // Hide specialized cards
  document.getElementById('calm-results-card').classList.add('hidden');
  document.getElementById('persona-results-card').classList.add('hidden');

  // 1. Summary & Coach Score
  document.getElementById('summary-text').textContent = data.summary || 'Summary unavailable.';
  
  const score = data.coach?.overall_score || 75;
  document.getElementById('coach-score-num').textContent = score;
  
  // Animate Gauge Ring
  const ring = document.getElementById('score-ring');
  const circumference = 264; // 2 * pi * 42
  const offset = circumference - (score / 100) * circumference;
  ring.style.strokeDashoffset = offset;

  document.getElementById('coach-verdict-title').textContent = data.coach?.verdict || 'Reasoning Evaluation';
  const tipsList = document.getElementById('coach-tips-list');
  tipsList.innerHTML = (data.coach?.tips || []).map(tip => `<li>${escapeHtml(tip)}</li>`).join('');

  // 2. Participants Cards
  const pContainer = document.getElementById('participants-container');
  pContainer.innerHTML = '';

  (data.participants || []).forEach(p => {
    const card = document.createElement('div');
    card.className = 'participant-card';

    const badgesHtml = (p.badges || []).map(b => `<span class="badge-tag">${escapeHtml(b)}</span>`).join('');
    
    const fallaciesHtml = (p.fallacies && p.fallacies.length > 0) ? `
      <div class="participant-fallacies">
        <h5>❌ Fallacies Detected (${p.fallacies.length})</h5>
        ${p.fallacies.map(f => `
          <div class="fallacy-item">
            <span class="fallacy-name">${escapeHtml(f.name)}:</span> ${escapeHtml(f.reason)}
            <span class="fallacy-quote">"${escapeHtml(f.quote)}"</span>
          </div>
        `).join('')}
      </div>
    ` : '<div class="participant-fallacies" style="background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.2);"><h5 style="color:var(--accent-emerald);">✅ Zero Fallacies Detected</h5></div>';

    card.innerHTML = `
      <div class="participant-header">
        <span class="participant-name">${escapeHtml(p.name)}</span>
      </div>
      <div class="participant-badges">${badgesHtml}</div>
      <div class="scores-metrics">
        ${renderMetricBar('Logic', p.logic_score)}
        ${renderMetricBar('Evidence', p.evidence_score)}
        ${renderMetricBar('Respect', p.respect_score)}
        ${renderMetricBar('Clarity', p.clarity_score)}
        ${renderMetricBar('Consistency', p.consistency_score)}
        ${renderMetricBar('Persuasion', p.persuasiveness_score)}
      </div>
      ${fallaciesHtml}
    `;
    pContainer.appendChild(card);

    // Trigger bar fill animation
    setTimeout(() => {
      card.querySelectorAll('.metric-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.val + '%';
      });
    }, 100);
  });

  // 3. Heat Map
  const heatContainer = document.getElementById('heatmap-container');
  heatContainer.innerHTML = (data.heat_map || []).map(h => {
    let colorClass = 'heat-blue';
    const lvl = (h.level || h.tone || '').toLowerCase();
    if (lvl.includes('yellow') || lvl.includes('defensive')) colorClass = 'heat-yellow';
    else if (lvl.includes('orange') || lvl.includes('aggressive')) colorClass = 'heat-orange';
    else if (lvl.includes('red') || lvl.includes('hostile')) colorClass = 'heat-red';
    else if (lvl.includes('green') || lvl.includes('curious')) colorClass = 'heat-green';

    return `
      <div class="heat-msg">
        <span class="heat-badge ${colorClass}">${escapeHtml(h.tone || 'Calm')}</span>
        <div class="heat-content">
          <span class="heat-speaker">${escapeHtml(h.speaker)}</span>
          <p class="heat-text">"${escapeHtml(h.message)}"</p>
        </div>
      </div>
    `;
  }).join('');

  // 4. Evidence Meter
  const evidenceContainer = document.getElementById('evidence-container');
  evidenceContainer.innerHTML = (data.evidence_meter || []).map(e => {
    let badgeClass = 'badge-green';
    if ((e.level || e.status || '').toLowerCase().includes('yellow') || (e.status || '').includes('Assertion')) badgeClass = 'badge-yellow';
    if ((e.level || e.status || '').toLowerCase().includes('red') || (e.status || '').includes('Contradicted')) badgeClass = 'badge-red';

    return `
      <div class="evidence-card">
        <div>
          <p class="evidence-claim">"${escapeHtml(e.claim)}"</p>
          <span class="evidence-speaker">${escapeHtml(e.speaker)} — ${escapeHtml(e.reason || '')}</span>
        </div>
        <span class="evidence-status ${badgeClass}">${escapeHtml(e.status)}</span>
      </div>
    `;
  }).join('');

  // 5. Strongest vs Weakest
  document.getElementById('strongest-quote').textContent = data.strongest_argument?.quote ? `"${data.strongest_argument.quote}"` : '';
  document.getElementById('strongest-speaker').textContent = data.strongest_argument?.speaker ? `— ${data.strongest_argument.speaker}` : '';
  document.getElementById('strongest-reason').textContent = data.strongest_argument?.reason || '';

  document.getElementById('weakest-quote').textContent = data.weakest_argument?.quote ? `"${data.weakest_argument.quote}"` : '';
  document.getElementById('weakest-speaker').textContent = data.weakest_argument?.speaker ? `— ${data.weakest_argument.speaker}` : '';
  document.getElementById('weakest-reason').textContent = data.weakest_argument?.reason || '';

  // 6. Suggestions
  const suggContainer = document.getElementById('suggestions-container');
  suggContainer.innerHTML = (data.constructive_suggestions || []).map(s => `
    <div class="suggestion-card">
      <div class="sugg-orig">❌ Original (${escapeHtml(s.speaker)}): "${escapeHtml(s.original)}"</div>
      <div class="sugg-new">💡 Try Constructive Alternative: "${escapeHtml(s.suggested)}"</div>
    </div>
  `).join('');
}

// Render Metric Bar Helper
function renderMetricBar(label, val) {
  const num = val || 5;
  const pct = (num / 10) * 100;
  return `
    <div class="metric-row">
      <span class="metric-label">${label}</span>
      <div class="metric-bar-bg">
        <div class="metric-bar-fill" data-val="${pct}"></div>
      </div>
      <span class="metric-val">${num}/10</span>
    </div>
  `;
}

// Render Calm Rewrite Results
function renderCalmRewriteResults(data) {
  const calmCard = document.getElementById('calm-results-card');
  calmCard.classList.remove('hidden');

  const dialogueContainer = document.getElementById('calm-dialogue-container');
  dialogueContainer.innerHTML = (data.rewritten_conversation || []).map(item => `
    <div class="suggestion-card" style="margin-bottom:1rem;">
      <div class="sugg-orig">Original (${escapeHtml(item.speaker)}): "${escapeHtml(item.original)}"</div>
      <div class="sugg-new">🕊️ Calm Version: "${escapeHtml(item.calm_version)}"</div>
    </div>
  `).join('');

  document.getElementById('calm-takeaway').innerHTML = `<strong>💡 Key Constructive Takeaway:</strong> ${escapeHtml(data.key_takeaway || '')}`;
}

// Render Persona Results
function renderPersonaResults(data) {
  const personaCard = document.getElementById('persona-results-card');
  personaCard.classList.remove('hidden');

  document.getElementById('persona-title').textContent = `🎭 Perspectives from ${data.persona}`;
  document.getElementById('persona-verdict-text').textContent = data.persona_verdict || '';

  const critiquesList = document.getElementById('persona-critiques-list');
  critiquesList.innerHTML = (data.key_critiques || []).map(c => `<li>${escapeHtml(c)}</li>`).join('');
}

// Fallacy Library Fetching & Modal
async function fetchFallacyLibrary() {
  try {
    const res = await fetch('/api/fallacies');
    const data = await res.json();
    if (data.success) {
      fallacyLibraryCache = data.fallacies;
      renderFallacyGrid(fallacyLibraryCache);
    }
  } catch (err) {
    console.error('Failed to load fallacy library', err);
  }
}

function renderFallacyGrid(list) {
  const grid = document.getElementById('fallacy-library-grid');
  grid.innerHTML = list.map(f => `
    <div class="fallacy-modal-card">
      <span class="fallacy-cat">${escapeHtml(f.category)}</span>
      <h4>❌ ${escapeHtml(f.name)}</h4>
      <p class="fallacy-def">${escapeHtml(f.definition)}</p>
      <div class="fallacy-ex"><strong>Example:</strong> "${escapeHtml(f.example)}"</div>
    </div>
  `).join('');
}

function filterFallacies() {
  const query = document.getElementById('fallacy-search').value.toLowerCase();
  const filtered = fallacyLibraryCache.filter(f => 
    f.name.toLowerCase().includes(query) ||
    f.category.toLowerCase().includes(query) ||
    f.definition.toLowerCase().includes(query)
  );
  renderFallacyGrid(filtered);
}

function openFallacyModal(highlightId) {
  document.getElementById('fallacy-modal').classList.remove('hidden');
  if (highlightId && fallacyLibraryCache.length > 0) {
    const input = document.getElementById('fallacy-search');
    const target = fallacyLibraryCache.find(f => f.id === highlightId);
    if (target) {
      input.value = target.name;
      filterFallacies();
    }
  }
}

function closeFallacyModal() {
  document.getElementById('fallacy-modal').classList.add('hidden');
}

// Copy Summary & Share Report
function copyExecutiveSummary() {
  const summary = document.getElementById('summary-text').textContent;
  const score = document.getElementById('coach-score-num').textContent;
  const textToCopy = `🧠 LogicLens AI Reasoning Analysis Summary\n\nOverall Debate Quality Score: ${score}/100\n\nSummary:\n${summary}\n\nEvaluated by LogicLens AI (Powered by Google Gemma 4 AI)`;
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('📋 Executive summary report copied to clipboard!');
  });
}

function shareCard() {
  alert('📤 Shareable LogicLens card generated! Copy summary report to share on X, Reddit, or LinkedIn.');
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
