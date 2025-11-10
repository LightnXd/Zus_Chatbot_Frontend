/**
 * ApiService
 * 
 * Handles all API calls to the backend server.
 * Centralized location for all HTTP requests.
 */

import axios from 'axios'

export class ApiService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${this.apiUrl}/health`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: 'Cannot connect to backend. The server might be down.' 
      }
    }
  }

  async getStats() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/stats`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error loading stats:', error)
      return { 
        success: false, 
        error: 'Failed to load statistics',
        data: null 
      }
    }
  }

  async sendChatMessage(message, sessionId = null) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/chat`, {
        question: message,
        session_id: sessionId
      })

      return { 
        success: true, 
        data: response.data 
      }
    } catch (error) {
      console.error('Error sending message:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Error: Could not get response. Check if backend is running.',
        data: null 
      }
    }
  }
}

export default new ApiService()
