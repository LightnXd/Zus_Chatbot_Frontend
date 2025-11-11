/**
 * CommandHandler
 * 
 * Handles slash commands and command-related logic for the chat interface.
 * Extracted from App.vue for better separation of concerns.
 */

import storageService from './StorageService.js'

export class CommandHandler {
  constructor() {
    this.commands = [
      { command: '/products', description: 'Search drinkware products', example: 'What tumblers do you have?' },
      { command: '/outlets', description: 'Find outlet locations', example: 'Show outlets in Shah Alam' },
      { command: '/calculate', description: 'Perform calculations', example: 'What is 5 + 3?' },
      { command: '/count', description: 'Count outlets by location', example: 'How many outlets in KL?' },
      { command: '/maps', description: 'Get outlet map links', example: 'Give me maps for Subang outlets' },
      { command: '/help', description: 'Show available commands', example: 'What can you do?' },
      { command: '/stats', description: 'Show database statistics', example: 'How many products?' },
      { command: '/clear', description: 'Clear chat history', example: '' }
    ]
  }

  getCommands() {
    return this.commands
  }

  filterCommands(input) {
    const lowerInput = input.toLowerCase()
    
    if (input === '/') {
      return this.commands
    }
    
    if (input.startsWith('/')) {
      return this.commands.filter(cmd => 
        cmd.command.toLowerCase().startsWith(lowerInput)
      )
    }
    
    return []
  }

  shouldShowCommands(input) {
    return input.startsWith('/')
  }

  clearChat(messages, sessionIdRef) {
    messages.splice(0, messages.length)
    messages.push({
      role: 'agent',
      content: 'Chat cleared! 🧹 How can I help you?',
      search_info: null,
      timestamp: this.getCurrentTimestamp()
    })
    if (sessionIdRef) {
      sessionIdRef.value = null
    }
    
    // Clear localStorage using StorageService
    storageService.clearState()
  }

  getCurrentTimestamp() {
    const now = new Date()
    // Convert to GMT+8 (Malaysia Time)
    const gmt8Offset = 8 * 60 // 8 hours in minutes
    const localOffset = now.getTimezoneOffset() // Get local timezone offset
    const gmt8Time = new Date(now.getTime() + (gmt8Offset + localOffset) * 60000)
    
    const hours = String(gmt8Time.getHours()).padStart(2, '0')
    const minutes = String(gmt8Time.getMinutes()).padStart(2, '0')
    
    return `${hours}:${minutes}`
  }

  hideCommands(showCommandsRef) {
    showCommandsRef.value = false
  }

  handleEnter(context) {
    const { showCommands, filteredCommands, selectedCommandIndex, selectCommandCallback, sendMessageCallback } = context
    
    if (showCommands.value && filteredCommands.value.length > 0) {
      selectCommandCallback(filteredCommands.value[selectedCommandIndex.value])
    } else {
      sendMessageCallback()
    }
  }

  handleTab(context) {
    const { showCommands, filteredCommands, selectedCommandIndex, selectCommandCallback } = context
    
    if (showCommands.value && filteredCommands.value.length > 0) {
      selectCommandCallback(filteredCommands.value[selectedCommandIndex.value])
    }
  }

  selectCommand(cmd, context) {
    const { 
      stats, 
      messages, 
      sessionId,
      inputMessage, 
      showCommands, 
      inputField,
      scrollToBottomCallback 
    } = context

    switch (cmd.command) {
      case '/clear':
        this.clearChat(messages, sessionId)
        inputMessage.value = ''
        showCommands.value = false
        return

      case '/help':
        messages.push({
          role: 'agent',
          content: `Available commands:\n\n${this.commands.map(c => `${c.command} - ${c.description}`).join('\n')}`,
          search_info: null,
          timestamp: this.getCurrentTimestamp()
        })
        if (scrollToBottomCallback) {
          scrollToBottomCallback()
        }
        inputMessage.value = ''
        showCommands.value = false
        return

      case '/stats':
        const statsMessage = `📊 Database Stats:\n• ${stats.value?.total_products || 0} drinkware products\n• ${stats.value?.total_outlets || 0} outlets\n• Regions: ${stats.value?.regions?.join(', ') || 'N/A'}`
        messages.push({
          role: 'agent',
          content: statsMessage,
          search_info: null,
          timestamp: this.getCurrentTimestamp()
        })
        if (scrollToBottomCallback) {
          scrollToBottomCallback()
        }
        inputMessage.value = ''
        showCommands.value = false
        return

      default:
        inputMessage.value = this.buildCommandString(cmd, inputMessage.value)
        showCommands.value = false
        inputField.value?.focus()
    }
  }

  buildCommandString(cmd, currentInput) {
    const commandPattern = /^\/\w*/
    const userQuestion = currentInput.replace(commandPattern, '').trim()

    if (userQuestion) {
      return `${cmd.command} ${userQuestion}`
    } else {
      return cmd.command + ' '
    }
  }

  navigateCommands(currentIndex, direction, filteredCommands) {
    if (!filteredCommands || filteredCommands.length === 0) {
      return currentIndex
    }

    let newIndex = currentIndex + direction

    if (newIndex < 0) {
      newIndex = filteredCommands.length - 1
    } else if (newIndex >= filteredCommands.length) {
      newIndex = 0
    }

    return newIndex
  }

  formatMessage(text) {
    if (!text) return ''
    
    let formatted = text.replace(/\n/g, '<br>')
    
    formatted = formatted.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: underline;">$1</a>'
    )
    
    return formatted
  }
}

export default new CommandHandler()
