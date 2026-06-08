/**
 * TradeLog - Main Application Script
 * Handles navigation, page switching, and interactive elements
 */

// ==================== DOM Elements ====================
const sidebar = document.querySelector('.sidebar');
const hamburger = document.querySelector('.hamburger');
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.querySelector('.page-title');
const currentDateEl = document.getElementById('current-date');
const checklistItems = document.querySelectorAll('.checklist-item');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const resultBtns = document.querySelectorAll('.result-btn');
const rangeSlidersContainer = document.querySelectorAll('.range-with-value');

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
  initDate();
  initNavigation();
  initChecklists();
  initToggleButtons();
  initRangeSliders();
  initChart();
});

// ==================== Date Display ====================
/**
 * Update the current date display in the topbar
 */
function initDate() {
  const updateDate = () => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    };
    const today = new Date();
    currentDateEl.textContent = today.toLocaleDateString('en-US', options);
  };

  updateDate();
  // Update date at midnight
  setInterval(updateDate, 1000 * 60 * 60);
}

// ==================== Navigation ====================
/**
 * Initialize sidebar navigation
 */
function initNavigation() {
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page');
      if (!page) return;

      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');

      // Switch page
      switchPage(page);

      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });

  // Hamburger menu toggle
  hamburger.addEventListener('click', toggleSidebar);
}

/**
 * Switch between pages/sections
 */
function switchPage(pageName) {
  // Hide all sections
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  const targetSection = document.getElementById(pageName);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    journal: 'Trade Journal',
    trades: 'Recent Trades',
    analytics: 'Analytics',
    calendar: 'Trading Calendar'
  };
  pageTitle.textContent = titles[pageName] || 'Dashboard';

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Toggle sidebar visibility on mobile
 */
function toggleSidebar() {
  sidebar.style.transform = sidebar.style.transform === 'translateX(-100%)' 
    ? 'translateX(0)' 
    : 'translateX(-100%)';
}

/**
 * Close sidebar
 */
function closeSidebar() {
  sidebar.style.transform = 'translateX(0)';
}

// ==================== Checklist Functionality ====================
/**
 * Initialize checklist item interactions
 */
function initChecklists() {
  checklistItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      updateChecklistProgress();
      saveChecklistState();
    });
  });

  // Load saved state
  loadChecklistState();
}

/**
 * Update checklist progress display
 */
function updateChecklistProgress() {
  const checklistSections = document.querySelectorAll('.checklist-section');
  
  checklistSections.forEach(section => {
    const items = section.querySelectorAll('.checklist-item');
    const checked = section.querySelectorAll('.checklist-item.checked');
    const countEl = section.querySelector('.section-count');
    
    if (countEl) {
      countEl.textContent = `${checked.length}/${items.length}`;
    }
  });
}

/**
 * Save checklist state to localStorage
 */
function saveChecklistState() {
  const state = {};
  checklistItems.forEach((item, index) => {
    state[`item-${index}`] = item.classList.contains('checked');
  });
  localStorage.setItem('checklistState', JSON.stringify(state));
}

/**
 * Load checklist state from localStorage
 */
function loadChecklistState() {
  const state = JSON.parse(localStorage.getItem('checklistState') || '{}');
  checklistItems.forEach((item, index) => {
    if (state[`item-${index}`]) {
      item.classList.add('checked');
    }
  });
  updateChecklistProgress();
}

// ==================== Toggle Buttons ====================
/**
 * Initialize toggle button groups (Long/Short, Win/Loss/BE)
 */
function initToggleButtons() {
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.parentElement;
      const groupBtns = group.querySelectorAll('.toggle-btn, .result-btn');
      
      // Remove active from siblings
      groupBtns.forEach(b => {
        b.classList.remove('active-long', 'active-short', 'active-win', 'active-loss', 'active-be');
      });
      
      // Add active to clicked button
      const buttonText = btn.textContent.trim().toLowerCase();
      if (buttonText === 'long') {
        btn.classList.add('active-long');
      } else if (buttonText === 'short') {
        btn.classList.add('active-short');
      }
    });
  });

  resultBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.parentElement;
      const groupBtns = group.querySelectorAll('.result-btn');
      
      // Remove active from siblings
      groupBtns.forEach(b => {
        b.classList.remove('active-win', 'active-loss', 'active-be');
      });
      
      // Add active to clicked button
      const buttonText = btn.textContent.trim().toLowerCase();
      if (buttonText === 'win') {
        btn.classList.add('active-win');
      } else if (buttonText === 'loss') {
        btn.classList.add('active-loss');
      } else if (buttonText === 'be') {
        btn.classList.add('active-be');
      }
    });
  });
}

// ==================== Range Sliders ====================
/**
 * Initialize range slider displays (confidence level)
 */
function initRangeSliders() {
  rangeSlidersContainer.forEach(container => {
    const slider = container.querySelector('input[type="range"]');
    const valueDisplay = container.querySelector('.range-value');

    if (slider && valueDisplay) {
      slider.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value + '%';
      });
    }
  });
}

// ==================== Chart Initialization ====================
/**
 * Initialize Chart.js for analytics
 */
function initChart() {
  const chartCanvas = document.getElementById('winLossChart');
  if (!chartCanvas) return;

  // Win/Loss Pie Chart
  new Chart(chartCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Wins', 'Losses', 'Break Even'],
      datasets: [{
        data: [68, 24, 8],
        backgroundColor: [
          'rgba(0, 212, 170, 0.3)',   // Accent (Wins)
          'rgba(255, 77, 109, 0.3)',  // Red (Losses)
          'rgba(245, 158, 11, 0.3)'   // Amber (BE)
        ],
        borderColor: [
          'rgb(0, 212, 170)',
          'rgb(255, 77, 109)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#e8eaf0',
            font: {
              family: "'DM Sans', sans-serif",
              size: 12
            }
          }
        }
      }
    }
  });
}

// ==================== Form Handling ====================
/**
 * Handle form submission for new trades
 */
document.addEventListener('DOMContentLoaded', () => {
  const saveTradeBtn = document.querySelector('.btn.btn-primary[style*="width"]');
  if (saveTradeBtn) {
    saveTradeBtn.addEventListener('click', handleSaveTradeForm);
  }
});

/**
 * Save trade form data
 */
function handleSaveTradeForm() {
  const formInputs = {
    symbol: document.querySelector('input[placeholder*="EUR"]')?.value,
    entryPrice: document.querySelector('input[placeholder="0.00"]')?.value,
    strategy: document.querySelector('.form-select')?.value,
    confidence: document.querySelector('input[type="range"]')?.value
  };

  if (formInputs.symbol && formInputs.entryPrice) {
    console.log('Trade saved:', formInputs);
    showNotification('Trade saved successfully!');
    // Reset form
    document.querySelectorAll('.form-input, .form-textarea').forEach(el => el.value = '');
  } else {
    showNotification('Please fill in all required fields', 'error');
  }
}

// ==================== Notifications ====================
/**
 * Display a temporary notification
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    ${type === 'success' 
      ? 'background: rgba(0, 212, 170, 0.2); border: 1px solid rgba(0, 212, 170, 0.3); color: #00d4aa;'
      : 'background: rgba(255, 77, 109, 0.2); border: 1px solid rgba(255, 77, 109, 0.3); color: #ff4d6d;'
    }
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ==================== Utility Functions ====================
/**
 * Format currency values
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

/**
 * Format percentage values
 */
function formatPercent(value) {
  return `${Number(value).toFixed(2)}%`;
}

/**
 * Debounce function for event handlers
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==================== Responsive Handling ====================
/**
 * Handle window resize
 */
window.addEventListener('resize', debounce(() => {
  if (window.innerWidth > 768) {
    sidebar.style.transform = 'translateX(0)';
  }
}, 250));

// ==================== Keyboard Shortcuts ====================
/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + N: New trade
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    const newTradeBtn = document.querySelector('.btn.btn-primary');
    if (newTradeBtn && !newTradeBtn.style.width) {
      newTradeBtn.click();
    }
  }

  // Escape: Close sidebar on mobile
  if (e.key === 'Escape' && window.innerWidth <= 768) {
    closeSidebar();
  }
});

// ==================== Export Functions ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    switchPage,
    formatCurrency,
    formatPercent,
    showNotification
  };
}
