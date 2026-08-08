// LogicLens Landing Page Script (app.js)

let fallacyLibraryCache = [];

// Initialize Theme & UI
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchFallacyLibrary();
});

// Working Theme Switcher Logic (Default: Light Theme)
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
    document.getElementById('theme-btn-icon').textContent = '☀️';
    document.getElementById('theme-btn-text').textContent = 'Light Mode';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('theme-btn-icon').textContent = '🌙';
    document.getElementById('theme-btn-text').textContent = 'Dark Mode';
  }
  localStorage.setItem('logiclens_theme', theme);
}

// FAQ Accordion Toggle
function toggleFaq(btn) {
  const faqItem = btn.parentElement;
  const answer = faqItem.querySelector('.faq-answer');
  const icon = btn.querySelector('.faq-icon');

  const isActive = faqItem.classList.contains('active');
  
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
    item.querySelector('.faq-answer').classList.add('hidden');
    item.querySelector('.faq-icon').textContent = '+';
  });

  if (!isActive) {
    faqItem.classList.add('active');
    answer.classList.remove('hidden');
    icon.textContent = '✕';
  }
}

// Fetch Fallacy Library for Modal
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
    if (target && input) {
      input.value = target.name;
      filterFallacies();
    }
  }
}

function closeFallacyModal() {
  document.getElementById('fallacy-modal').classList.add('hidden');
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
