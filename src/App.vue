<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="header-content">
        <h1>ZUS Chatbot</h1>
        <p v-if="stats">{{ stats.total_products }} products • {{ stats.total_outlets }} outlets</p>
        <p v-else class="loading-text">Loading...</p>
      </div>
      <div :class="['status-indicator', connectionStatus]" :title="`Status: ${connectionStatus}`"></div>
    </div>

    <div class="chat-messages">
      <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
        <div class="message-avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="message-content">
          <div v-if="showThinking && msg.planning_info && msg.role === 'agent'" class="thinking-block">
            <div class="thinking-header">AI Thinking Process</div>
            
            <div class="thinking-section">
              <strong>Primary Action:</strong> {{ msg.planning_info.primary_action }}
            </div>
            
            <div v-if="msg.planning_info.decisions && msg.planning_info.decisions.length > 0" class="thinking-section">
              <strong>Decision Log:</strong>
              <div v-for="(decision, didx) in msg.planning_info.decisions" :key="didx" class="decision-item">
                <div class="decision-header">
                  <span class="decision-action">{{ decision.action }}</span>
                  <span class="decision-confidence">{{ (decision.confidence * 100).toFixed(0) }}%</span>
                </div>
                <div class="decision-reasoning">{{ decision.reasoning }}</div>
                <div v-if="decision.detected_entities && decision.detected_entities.length > 0" class="decision-entities">
                  Detected: {{ decision.detected_entities.join(', ') }}
                </div>
              </div>
            </div>
            
            <div v-if="msg.planning_info.execution_plan && msg.planning_info.execution_plan.length > 0" class="thinking-section">
              <strong>Execution Plan:</strong>
              <ol class="execution-plan">
                <li v-for="(step, sidx) in msg.planning_info.execution_plan" :key="sidx">{{ step }}</li>
              </ol>
            </div>
            
            <div v-if="msg.planning_info.clarification_needed && msg.planning_info.clarification_questions && msg.planning_info.clarification_questions.length > 0" class="thinking-section clarification-section">
              <strong>Clarification Needed:</strong>
              <ul class="clarification-list">
                <li v-for="(question, qidx) in msg.planning_info.clarification_questions" :key="qidx">{{ question }}</li>
              </ul>
            </div>
            
            <div v-if="msg.planning_info.calculation_performed" class="thinking-section">
              <strong>Calculation:</strong>
              <div v-if="msg.planning_info.calculation_result && msg.planning_info.calculation_result.success">
                {{ msg.planning_info.calculation_result.formatted }}
              </div>
              <div v-else class="calculation-error">
                {{ msg.planning_info.calculation_result?.error || 'Unknown error' }}
              </div>
            </div>
          </div>
          
          <div class="message-text" v-html="formatMessage(msg.content)"></div>
          
          <div v-if="msg.search_info" class="message-meta">
            <span v-if="msg.search_info.mode === 'product'" class="badge">Product Search</span>
            <span v-if="msg.search_info.mode === 'outlet'" class="badge">Outlet Search</span>
            <span v-if="msg.search_info.mode === 'conversational'" class="badge">Conversational</span>
            <span v-if="msg.products_found" class="badge">{{ msg.products_found }} products</span>
            <span v-if="msg.outlets_found" class="badge">{{ msg.outlets_found }} outlets</span>
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="message agent">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- Scroll anchor -->
      <div ref="messagesEnd"></div>
    </div>

    <!-- Input Area -->
    <div class="chat-input-area">
      <!-- Slash Command Suggestions -->
      <div v-if="showCommands && filteredCommands.length > 0" class="command-suggestions">
        <div
          v-for="(cmd, idx) in filteredCommands"
          :key="idx"
          :class="['command-item', { active: selectedCommandIndex === idx }]"
          @click="selectCommand(cmd)"
          @mouseenter="selectedCommandIndex = idx"
        >
          <span class="command-name">{{ cmd.command }}</span>
          <span class="command-desc">{{ cmd.description }}</span>
        </div>
      </div>

      <div class="input-wrapper">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="Type / for commands or ask about ZUS products..."
          @keypress.enter="handleEnter"
          @keydown.up.prevent="navigateCommands(-1)"
          @keydown.down.prevent="navigateCommands(1)"
          @keydown.tab.prevent="handleTab"
          @keydown.escape="hideCommands"
          @input="handleInput"
          :disabled="loading"
          class="chat-input"
          ref="inputField"
        />
        <div 
          class="thinking-toggle" 
          @click="showThinking = !showThinking"
          :title="showThinking ? 'Hide thinking' : 'Show thinking'"
        >
          <img 
            :src="showThinking ? '/assets/show_thinking.png' : '/assets/hide_thinking.png'" 
            alt="Toggle thinking visibility" 
          />
        </div>
        <button
          @click="sendMessage"
          :disabled="loading || !inputMessage.trim()"
          class="send-button"
        >
          <span v-if="!loading">Send</span>
          <span v-else>...</span>
        </button>
      </div>
      <div class="input-hints">
        <small>Type <code>/</code> for quick commands • Try: "What tumblers?" • "Outlets near me"</small>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="error = null" class="close-btn">×</button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, nextTick, computed } from 'vue'
import commandHandler from './services/CommandHandler.js'
import apiService from './services/ApiService.js'
import './styles/ChatContainer.css'

export default {
  name: 'App',
  setup() {
    const messages = reactive([
      {
        role: 'agent',
        content: 'Hi! Welcome to ZUS Drinkware Chat. I can help you find products or locate nearby outlets. What would you like to know?',
        search_info: null
      }
    ])

    const inputMessage = ref('')
    const loading = ref(false)
    const error = ref(null)
    const connectionStatus = ref('connecting')
    const stats = ref(null)
    const messagesEnd = ref(null)
    const inputField = ref(null)
    const sessionId = ref(null)

    const showCommands = ref(false)
    const selectedCommandIndex = ref(0)
    const showThinking = ref(false)
    
    const slashCommands = commandHandler.getCommands()

    const filteredCommands = computed(() => {
      return commandHandler.filterCommands(inputMessage.value)
    })

    const handleInput = () => {
      if (commandHandler.shouldShowCommands(inputMessage.value)) {
        showCommands.value = true
        selectedCommandIndex.value = 0
      } else {
        showCommands.value = false
      }
    }

    const navigateCommands = (direction) => {
      if (!showCommands.value || filteredCommands.value.length === 0) return
      
      selectedCommandIndex.value = commandHandler.navigateCommands(
        selectedCommandIndex.value,
        direction,
        filteredCommands.value
      )
    }

    const handleTab = () => {
      commandHandler.handleTab({
        showCommands,
        filteredCommands,
        selectedCommandIndex,
        selectCommandCallback: selectCommand
      })
    }

    const handleEnter = () => {
      commandHandler.handleEnter({
        showCommands,
        filteredCommands,
        selectedCommandIndex,
        selectCommandCallback: selectCommand,
        sendMessageCallback: sendMessage
      })
    }

    const selectCommand = (cmd) => {
      commandHandler.selectCommand(cmd, {
        stats,
        messages,
        sessionId,
        inputMessage,
        showCommands,
        inputField,
        scrollToBottomCallback: scrollToBottom
      })
    }

    const formatMessage = (text) => {
      return commandHandler.formatMessage(text)
    }

    const hideCommands = () => {
      commandHandler.hideCommands(showCommands)
    }

    const clearChat = () => {
      commandHandler.clearChat(messages, sessionId)
    }

    const scrollToBottom = async () => {
      await nextTick()
      if (messagesEnd.value) {
        messagesEnd.value.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const checkHealth = async () => {
      const result = await apiService.checkHealth()
      if (result.success) {
        connectionStatus.value = 'connected'
        error.value = null
      } else {
        connectionStatus.value = 'disconnected'
        error.value = result.error
      }
    }

    const loadStats = async () => {
      const result = await apiService.getStats()
      if (result.success) {
        stats.value = result.data
      }
    }

    const sendMessage = async () => {
      const message = inputMessage.value.trim()
      if (!message) return

      messages.push({
        role: 'user',
        content: message,
        search_info: null
      })
      inputMessage.value = ''
      loading.value = true
      error.value = null
      showCommands.value = false

      await scrollToBottom()

      const result = await apiService.sendChatMessage(message, sessionId.value)

      if (result.success) {
        const data = result.data
        
        if (!sessionId.value && data.session_id) {
          sessionId.value = data.session_id
        }

        messages.push({
          role: 'agent',
          content: data.response,
          search_info: data.search_info,
          products_found: data.products_found,
          outlets_found: data.outlets_found,
          planning_info: data.planning_info
        })

        connectionStatus.value = 'connected'
      } else {
        error.value = result.error
        connectionStatus.value = 'disconnected'

        messages.push({
          role: 'agent',
          content: 'Sorry, I encountered an error. Please try again.',
          search_info: null
        })
      }

      loading.value = false
      await scrollToBottom()
    }

    checkHealth()
    loadStats()

    return {
      messages,
      inputMessage,
      loading,
      error,
      connectionStatus,
      stats,
      messagesEnd,
      inputField,
      showCommands,
      selectedCommandIndex,
      slashCommands,
      filteredCommands,
      showThinking,
      sendMessage,
      scrollToBottom,
      handleInput,
      handleEnter,
      handleTab,
      navigateCommands,
      selectCommand,
      hideCommands,
      formatMessage
    }
  }
}
</script>
