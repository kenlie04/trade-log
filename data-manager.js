/**
 * Data Manager - Handles all database operations
 * Supports: LocalStorage (default) + easy API integration
 */

class DataManager {
  constructor() {
    this.storageKey = 'tradelog_data';
    this.initStorage();
  }

  /**
   * Initialize empty storage structure if it doesn't exist
   */
  initStorage() {
    const existing = this.getAll();
    if (!existing) {
      const emptyData = {
        trades: [],
        journals: [],
        checklists: {},
        settings: {
          createdAt: new Date().toISOString(),
          version: '1.0'
        }
      };
      localStorage.setItem(this.storageKey, JSON.stringify(emptyData));
    }
  }

  // ==================== TRADES ====================
  /**
   * Get all trades
   */
  getTrades() {
    const data = this.getAll();
    return data?.trades || [];
  }

  /**
   * Add a new trade
   */
  addTrade(trade) {
    const data = this.getAll();
    const newTrade = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...trade
    };
    data.trades.push(newTrade);
    this.saveAll(data);
    return newTrade;
  }

  /**
   * Update an existing trade
   */
  updateTrade(id, updates) {
    const data = this.getAll();
    const tradeIndex = data.trades.findIndex(t => t.id === id);
    if (tradeIndex === -1) return null;
    
    data.trades[tradeIndex] = {
      ...data.trades[tradeIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveAll(data);
    return data.trades[tradeIndex];
  }

  /**
   * Delete a trade
   */
  deleteTrade(id) {
    const data = this.getAll();
    data.trades = data.trades.filter(t => t.id !== id);
    this.saveAll(data);
  }

  /**
   * Get trade by ID
   */
  getTradeById(id) {
    const data = this.getAll();
    return data.trades.find(t => t.id === id);
  }

  /**
   * Get trades filtered by date range
   */
  getTradesByDateRange(startDate, endDate) {
    const trades = this.getTrades();
    return trades.filter(t => {
      const tradeDate = new Date(t.createdAt);
      return tradeDate >= startDate && tradeDate <= endDate;
    });
  }

  /**
   * Calculate trade statistics
   */
  calculateStats() {
    const trades = this.getTrades();
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        breakEven: 0,
        winRate: 0,
        totalProfitLoss: 0,
        averageTrade: 0,
        largestWin: 0,
        largestLoss: 0
      };
    }

    const wins = trades.filter(t => t.result === 'win').length;
    const losses = trades.filter(t => t.result === 'loss').length;
    const breakEven = trades.filter(t => t.result === 'be').length;
    
    const totalProfitLoss = trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const averageTrade = trades.length > 0 ? totalProfitLoss / trades.length : 0;

    return {
      totalTrades: trades.length,
      wins,
      losses,
      breakEven,
      winRate: ((wins / trades.length) * 100).toFixed(2),
      totalProfitLoss: totalProfitLoss.toFixed(2),
      averageTrade: averageTrade.toFixed(2),
      largestWin: Math.max(...trades.map(t => t.profitLoss || 0)).toFixed(2),
      largestLoss: Math.min(...trades.map(t => t.profitLoss || 0)).toFixed(2)
    };
  }

  // ==================== JOURNALS ====================
  /**
   * Get all journal entries
   */
  getJournals() {
    const data = this.getAll();
    return data?.journals || [];
  }

  /**
   * Add a new journal entry
   */
  addJournal(entry) {
    const data = this.getAll();
    const newEntry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...entry
    };
    data.journals.push(newEntry);
    this.saveAll(data);
    return newEntry;
  }

  /**
   * Update journal entry
   */
  updateJournal(id, updates) {
    const data = this.getAll();
    const entryIndex = data.journals.findIndex(j => j.id === id);
    if (entryIndex === -1) return null;
    
    data.journals[entryIndex] = {
      ...data.journals[entryIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveAll(data);
    return data.journals[entryIndex];
  }

  /**
   * Delete journal entry
   */
  deleteJournal(id) {
    const data = this.getAll();
    data.journals = data.journals.filter(j => j.id !== id);
    this.saveAll(data);
  }

  // ==================== CHECKLISTS ====================
  /**
   * Get checklist state
   */
  getChecklistState() {
    const data = this.getAll();
    return data?.checklists || {};
  }

  /**
   * Save checklist state
   */
  saveChecklistState(state) {
    const data = this.getAll();
    data.checklists = state;
    this.saveAll(data);
  }

  // ==================== SETTINGS ====================
  /**
   * Get all settings
   */
  getSettings() {
    const data = this.getAll();
    return data?.settings || {};
  }

  /**
   * Update settings
   */
  updateSettings(updates) {
    const data = this.getAll();
    data.settings = {
      ...data.settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveAll(data);
  }

  // ==================== CORE STORAGE ====================
  /**
   * Get all data
   */
  getAll() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Save all data
   */
  saveAll(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  /**
   * Clear all data (⚠️ Use with caution)
   */
  clearAll() {
    if (confirm('Are you sure? This will delete ALL data permanently.')) {
      localStorage.removeItem(this.storageKey);
      this.initStorage();
      console.log('All data cleared');
    }
  }

  /**
   * Export data as JSON
   */
  exportData() {
    const data = this.getAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tradelog-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  /**
   * Import data from JSON
   */
  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      localStorage.setItem(this.storageKey, JSON.stringify(imported));
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Initialize global data manager
const db = new DataManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataManager;
}
