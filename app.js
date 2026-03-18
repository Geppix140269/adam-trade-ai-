// ============================================
// CONFIGURATION
// ============================================

// Backend API URL - Configured for Railway deployment
// Local development: http://localhost:3000
// Production: https://adam-trade-ai-backend-production.up.railway.app
const BACKEND_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://adam-trade-ai-backend-production.up.railway.app';

const MODEL_NAME = 'gpt-3.5-turbo';

// ============================================
// STATE MANAGEMENT
// ============================================

const appState = {
    user: {
        name: '',
        score: 0,
        progress: 0,
        completedModules: []
    },
    modules: [
        { id: 1, title: 'Introduction to Global Trade', desc: 'Fundamentals of international commerce', icon: '🌍' },
        { id: 2, title: 'Incoterms & Contracts', desc: 'Trade terms and legal frameworks', icon: '📜' },
        { id: 3, title: 'Customs & Compliance', desc: 'Regulations and documentation', icon: '🛃' },
        { id: 4, title: 'Logistics & Shipping', desc: 'Transportation and warehousing', icon: '🚢' },
        { id: 5, title: 'Trade Finance', desc: 'Payments and financial instruments', icon: '💰' },
        { id: 6, title: 'Risk Management', desc: 'Insurance and mitigation strategies', icon: '🛡️' },
        { id: 7, title: 'Market Entry Strategies', desc: 'Expanding into new markets', icon: '🎯' },
        { id: 8, title: 'Supply Chain Optimization', desc: 'Efficiency and cost reduction', icon: '⚙️' },
        { id: 9, title: 'Digital Trade', desc: 'E-commerce and technology', icon: '💻' },
        { id: 10, title: 'Sustainability in Trade', desc: 'Environmental and social responsibility', icon: '🌱' }
    ],
    currentView: 'dashboard',
    ollamaConnected: false
};

// ============================================
// OLLAMA API FUNCTIONS
// ============================================

/**
 * Check if backend API and Ollama are running and accessible
 */
async function checkOllamaConnection() {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/health`);
        if (response.ok) {
            const data = await response.json();
            const hasModel = data.models && data.models.some(m => m.name.includes(MODEL_NAME));
            updateOllamaStatus(data.status === 'connected', hasModel);
            return data.status === 'connected';
        }
    } catch (error) {
        updateOllamaStatus(false, false);
        return false;
    }
}

/**
 * Update UI to show AI service connection status
 */
function updateOllamaStatus(connected, hasModel) {
    const statusEl = document.getElementById('ollama-status');
    appState.ollamaConnected = connected;

    if (connected && hasModel) {
        statusEl.className = 'ollama-status connected';
        statusEl.querySelector('.status-text').textContent = `AI Ready (${MODEL_NAME})`;
    } else if (connected && !hasModel) {
        statusEl.className = 'ollama-status disconnected';
        statusEl.querySelector('.status-text').textContent = `AI model not available`;
    } else {
        statusEl.className = 'ollama-status disconnected';
        statusEl.querySelector('.status-text').textContent = 'AI Service Connecting...';
    }
}

/**
 * Generate text using backend API (which connects to Ollama)
 */
async function generateText(prompt, systemPrompt = '') {
    if (!appState.ollamaConnected) {
        throw new Error('AI service is not available. Please check your connection.');
    }

    showLoading();

    try {
        const response = await fetch(`${BACKEND_API_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                system: systemPrompt || 'You are a helpful AI tutor specializing in global trade, international commerce, and business.'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        hideLoading();
        return data.response;
    } catch (error) {
        hideLoading();
        console.error('Error generating text:', error);
        alert('Failed to communicate with AI. Please ensure Ollama is running.');
        throw error;
    }
}

/**
 * Chat with Ollama (for tutor)
 */
async function chatWithAI(messages) {
    if (!appState.ollamaConnected) {
        throw new Error('Ollama is not connected. Please start Ollama and refresh.');
    }

    showLoading();

    try {
        // Convert messages to a simple prompt format
        const prompt = messages.map(msg =>
            `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`
        ).join('\n\n');

        const systemPrompt = `You are an expert AI tutor specializing in global trade, international commerce, logistics, and supply chain management. You provide clear, accurate, and helpful explanations. Always be encouraging and educational.`;

        const response = await fetch(`${OLLAMA_API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: `${systemPrompt}\n\n${prompt}\n\nTutor:`,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();
        hideLoading();
        return data.response;
    } catch (error) {
        hideLoading();
        console.error('Error chatting with AI:', error);
        alert('Failed to communicate with AI. Please ensure Ollama is running.');
        throw error;
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

function startCourse() {
    if (!appState.ollamaConnected) {
        alert('Please start Ollama before beginning the course.');
        return;
    }

    document.getElementById('intro').classList.remove('active');
    document.getElementById('app').classList.add('active');

    // Initialize the app
    renderModules();
    updateDashboard();
    generateRecommendation();
}

function switchView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');

    appState.currentView = viewName;
}

function updateDashboard() {
    const completed = appState.user.completedModules.length;
    const total = appState.modules.length;
    const progress = Math.round((completed / total) * 100);

    document.getElementById('user-score').textContent = appState.user.score;
    document.getElementById('user-progress').textContent = `${progress}%`;
    document.getElementById('dash-score').textContent = appState.user.score;
    document.getElementById('dash-progress-fill').style.width = `${progress}%`;
    document.getElementById('dash-progress-text').textContent = `${completed} of ${total} modules completed`;
}

function renderModules() {
    const container = document.getElementById('modules-container');
    container.innerHTML = appState.modules.map(module => `
        <div class="module-card" onclick="openModule(${module.id})">
            <div class="module-num">Module ${module.id}</div>
            <div class="module-title">${module.icon} ${module.title}</div>
            <div class="module-desc">${module.desc}</div>
        </div>
    `).join('');
}

function openModule(id) {
    alert(`Module ${id} content coming soon! For now, try the AI Tutor to learn about this topic.`);
}

// ============================================
// AI TUTOR FEATURE
// ============================================

const chatHistory = [];

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to UI
    addChatMessage('user', message);
    input.value = '';

    // Add to history
    chatHistory.push({ role: 'user', content: message });

    try {
        // Get AI response
        const aiResponse = await chatWithAI(chatHistory);

        // Add AI response to UI and history
        addChatMessage('ai', aiResponse);
        chatHistory.push({ role: 'assistant', content: aiResponse });
    } catch (error) {
        addChatMessage('ai', 'Sorry, I encountered an error. Please make sure Ollama is running.');
    }
}

function addChatMessage(type, content) {
    const messagesContainer = document.getElementById('chat-messages');
    const isUser = type === 'user';

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.innerHTML = `
        <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
        <div class="message-content">
            <p>${content.replace(/\n/g, '</p><p>')}</p>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ============================================
// PRACTICE QUESTIONS FEATURE
// ============================================

async function generatePracticeQuestions() {
    const topic = document.getElementById('practice-topic').value.trim() || 'global trade';
    const difficulty = document.getElementById('practice-difficulty').value;
    const count = parseInt(document.getElementById('practice-count').value);

    const prompt = `Generate ${count} multiple choice question(s) about ${topic} at ${difficulty} level for a global trade course.

For each question, provide:
1. The question text
2. Four answer options (A, B, C, D)
3. The correct answer letter
4. A detailed explanation of why the answer is correct

Format each question exactly like this:
QUESTION: [question text]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
CORRECT: [A/B/C/D]
EXPLANATION: [detailed explanation]

${count > 1 ? '---\n(repeat for each question, separated by ---)' : ''}`;

    try {
        const response = await generateText(prompt);
        const questions = parseQuestions(response);
        displayPracticeQuestions(questions);
    } catch (error) {
        console.error('Error generating questions:', error);
    }
}

function parseQuestions(text) {
    const questions = [];
    const questionBlocks = text.split('---').filter(b => b.trim());

    questionBlocks.forEach(block => {
        const questionMatch = block.match(/QUESTION:\s*(.+?)(?=\n[A-D]\))/s);
        const optionA = block.match(/A\)\s*(.+?)(?=\n[B-D]\)|CORRECT:)/s);
        const optionB = block.match(/B\)\s*(.+?)(?=\n[C-D]\)|CORRECT:)/s);
        const optionC = block.match(/C\)\s*(.+?)(?=\n[D]\)|CORRECT:)/s);
        const optionD = block.match(/D\)\s*(.+?)(?=\nCORRECT:)/s);
        const correctMatch = block.match(/CORRECT:\s*([A-D])/);
        const explanationMatch = block.match(/EXPLANATION:\s*(.+?)$/s);

        if (questionMatch && optionA && optionB && optionC && optionD && correctMatch && explanationMatch) {
            questions.push({
                question: questionMatch[1].trim(),
                options: [
                    { letter: 'A', text: optionA[1].trim() },
                    { letter: 'B', text: optionB[1].trim() },
                    { letter: 'C', text: optionC[1].trim() },
                    { letter: 'D', text: optionD[1].trim() }
                ],
                correct: correctMatch[1],
                explanation: explanationMatch[1].trim()
            });
        }
    });

    return questions;
}

function displayPracticeQuestions(questions) {
    const container = document.getElementById('practice-questions');

    if (questions.length === 0) {
        container.innerHTML = '<p style="color: var(--muted);">Failed to generate questions. Please try again.</p>';
        return;
    }

    container.innerHTML = questions.map((q, index) => `
        <div class="question-card" data-question="${index}">
            <div class="question-text">Question ${index + 1}: ${q.question}</div>
            <div class="question-options">
                ${q.options.map(opt => `
                    <button
                        class="option-btn"
                        data-option="${opt.letter}"
                        onclick="checkAnswer(${index}, '${opt.letter}', '${q.correct}')"
                    >
                        ${opt.letter}) ${opt.text}
                    </button>
                `).join('')}
            </div>
            <div class="answer-explanation" id="explanation-${index}" style="display: none;">
                <strong>Explanation:</strong>
                ${q.explanation}
            </div>
        </div>
    `).join('');
}

function checkAnswer(questionIndex, selected, correct) {
    const card = document.querySelector(`[data-question="${questionIndex}"]`);
    const buttons = card.querySelectorAll('.option-btn');
    const explanation = document.getElementById(`explanation-${questionIndex}`);

    // Disable all buttons
    buttons.forEach(btn => {
        btn.disabled = true;
        const letter = btn.dataset.option;

        if (letter === correct) {
            btn.classList.add('correct');
        } else if (letter === selected && selected !== correct) {
            btn.classList.add('incorrect');
        }
    });

    // Show explanation
    explanation.style.display = 'block';

    // Update score
    if (selected === correct) {
        appState.user.score += 10;
        updateDashboard();
    }
}

// ============================================
// PERSONALIZED STUDY PLAN FEATURE
// ============================================

async function generateStudyPlan() {
    const completed = appState.user.completedModules.length;
    const total = appState.modules.length;
    const score = appState.user.score;

    const prompt = `Create a personalized 4-week study plan for a student learning global trade.

Student Progress:
- Completed ${completed} out of ${total} modules
- Current score: ${score} points
- Topics covered: ${completed > 0 ? appState.user.completedModules.join(', ') : 'None yet'}

Create a structured weekly plan that:
1. Builds progressively from fundamentals to advanced topics
2. Includes specific learning objectives
3. Suggests practice activities
4. Balances theory and practical application

Format the plan as:
WEEK 1: [Theme]
- [Activity 1]
- [Activity 2]
- [Activity 3]

WEEK 2: [Theme]
- [Activity 1]
- [Activity 2]
- [Activity 3]

(Continue for weeks 3 and 4)`;

    try {
        const response = await generateText(prompt);
        displayStudyPlan(response);
    } catch (error) {
        console.error('Error generating study plan:', error);
    }
}

function displayStudyPlan(planText) {
    const container = document.getElementById('study-plan-content');

    // Parse the plan
    const weeks = planText.split(/WEEK \d+:/i).filter(w => w.trim());

    let html = '<div class="study-plan-card"><h3>Your Personalized Study Plan</h3>';

    weeks.forEach((week, index) => {
        const lines = week.split('\n').filter(l => l.trim());
        const theme = lines[0].trim();
        const activities = lines.slice(1).filter(l => l.includes('-')).map(l => l.replace(/^-\s*/, ''));

        html += `
            <div class="study-plan-week">
                <div class="week-title">Week ${index + 1}: ${theme}</div>
                <ul>
                    ${activities.map(activity => `<li>${activity}</li>`).join('')}
                </ul>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ============================================
// AI RECOMMENDATION FEATURE
// ============================================

async function generateRecommendation() {
    const recEl = document.getElementById('ai-recommendation');
    recEl.textContent = 'Analyzing your progress...';

    const completed = appState.user.completedModules.length;
    const score = appState.user.score;

    const prompt = `As an AI learning advisor, provide a brief (2-3 sentences) personalized recommendation for a student with this progress:
- Completed modules: ${completed}/10
- Score: ${score} points

Give specific, actionable advice on what they should focus on next.`;

    try {
        const response = await generateText(prompt);
        recEl.textContent = response;
    } catch (error) {
        recEl.textContent = 'Unable to generate recommendation. Please ensure Ollama is running.';
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check Ollama connection on load
    await checkOllamaConnection();

    // Recheck every 5 seconds
    setInterval(checkOllamaConnection, 5000);
});
