/**
 * StorageService
 * 
 * Handles localStorage persistence for chat state.
 * Manages saving, loading, and clearing chat messages and session data.
 */

const STORAGE_KEY = 'zus-chat-state'
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

export class StorageService {
  /**
   * Save chat state to localStorage
   * @param {Array} messages - Array of chat messages
   * @param {String} sessionId - Current session ID
   * @returns {Boolean} - Success status
   */
  saveState(messages, sessionId) {
    try {
      // Only store last 50 messages to prevent size issues
      const messagesToStore = messages.slice(-50)
      
      // Strip planning_info to save space (can be large)
      const lightMessages = messagesToStore.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        search_info: msg.search_info,
        products_found: msg.products_found,
        outlets_found: msg.outlets_found
        // Omit planning_info to save space
      }))
      
      const chatState = {
        messages: lightMessages,
        sessionId: sessionId,
        timestamp: Date.now(),
        version: '1.0'
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatState))
      return true
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data')
        this.clearState()
      }
      
      return false
    }
  }

  /**
   * Load chat state from localStorage
   * @returns {Object|null} - Saved state or null if not found/expired
   */
  loadState() {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY)
      if (!savedState) return null
      
      const chatState = JSON.parse(savedState)
      
      // Check if data is not too old (7 days)
      if (chatState.timestamp && Date.now() - chatState.timestamp > SEVEN_DAYS) {
        console.log('Chat history expired (>7 days), clearing...')
        this.clearState()
        return null
      }
      
      console.log(`Restored ${chatState.messages?.length || 0} messages from localStorage`)
      
      return {
        messages: chatState.messages || [],
        sessionId: chatState.sessionId || null
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      this.clearState()
      return null
    }
  }

  /**
   * Clear all stored chat state
   */
  clearState() {
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Check if there is saved state available
   * @returns {Boolean}
   */
  hasState() {
    return localStorage.getItem(STORAGE_KEY) !== null
  }

  /**
   * Get storage usage info (for debugging)
   * @returns {Object}
   */
  getStorageInfo() {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (!savedState) {
      return {
        exists: false,
        size: 0,
        messageCount: 0
      }
    }

    try {
      const chatState = JSON.parse(savedState)
      return {
        exists: true,
        size: new Blob([savedState]).size,
        messageCount: chatState.messages?.length || 0,
        savedAt: new Date(chatState.timestamp).toLocaleString(),
        age: Date.now() - chatState.timestamp
      }
    } catch (error) {
      return {
        exists: true,
        size: new Blob([savedState]).size,
        error: error.message
      }
    }
  }
}

// Export singleton instance
export default new StorageService()
