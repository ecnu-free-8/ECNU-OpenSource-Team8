document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const statsToggle = document.getElementById('stats-toggle');
    const statsPanel = document.getElementById('stats-panel');
    const closeStats = document.getElementById('close-stats');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    
    // 图表实例
    let categoryChart;
    
    // 语音识别
    let recognition;
    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'zh-CN';
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
        };
        
        recognition.onerror = function(event) {
            console.error('语音识别错误:', event.error);
            addMessage("语音识别失败，请重试", "bot");
        };
    } catch(e) {
        console.warn('浏览器不支持语音识别');
        voiceBtn.style.display = 'none';
    }
    
    // 初始化
    init();
    
    function init() {
        // 初始欢迎消息
        addMessage("你好！我是智能开支助手，可以帮你记录和分析日常消费。", "bot");
        
        // 加载今日统计数据
        loadStatsData('today');
        
        // 事件监听
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // 发送消息
        sendBtn.addEventListener('click', sendMessage);
        
        // 回车发送
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // 语音输入
        if (recognition) {
            voiceBtn.addEventListener('click', toggleVoiceInput);
        }
        
        // 统计面板
        statsToggle.addEventListener('click', toggleStatsPanel);
        closeStats.addEventListener('click', toggleStatsPanel);
        
        // 统计标签切换
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                loadStatsData(this.dataset.period);
            });
        });
        
        // 快捷建议
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                userInput.value = this.dataset.msg;
                sendMessage();
            });
        });
    }
    
    function toggleVoiceInput() {
        if (voiceBtn.classList.contains('voice-active')) {
            // 停止录音
            recognition.stop();
            voiceBtn.classList.remove('voice-active');
        } else {
            // 开始录音
            try {
                recognition.start();
                voiceBtn.classList.add('voice-active');
                addMessage("请开始说话...", "bot");
            } catch(e) {
                console.error('语音识别启动失败:', e);
                addMessage("无法启动语音识别", "bot");
            }
        }
    }
    
    function toggleStatsPanel() {
        statsPanel.classList.toggle('visible');
    }
    
    function loadStatsData(period) {
        fetch(`/api/expenses?period=${period}`)
            .then(response => response.json())
            .then(data => {
                updateStatsUI(data);
            })
            .catch(error => {
                console.error('加载统计数据失败:', error);
            });
    }
    
    function updateStatsUI(data) {
        // 更新统计数字
        document.getElementById('total-amount').textContent = `${data.summary.total}元`;
        document.getElementById('total-count').textContent = `${data.summary.count}笔`;
        
        // 更新图表
        updateChart(data.summary.by_category);
        
        // 更新最近消费列表
        updateExpensesList(data.expenses.slice(0, 5));
    }
    
    function updateChart(data) {
        const ctx = document.getElementById('category-chart').getContext('2d');
        
        // 销毁旧图表
        if (categoryChart) {
            categoryChart.destroy();
        }
        
        // 创建新图表
        categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#4a6baf',
                        '#6c8fd8',
                        '#8fa8e0',
                        '#b3c2e8',
                        '#d6dbf0'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }
    
    function updateExpensesList(expenses) {
        const listContainer = document.getElementById('expenses-list');
        listContainer.innerHTML = '';
        
        if (expenses.length === 0) {
            listContainer.innerHTML = '<div class="text-muted">暂无消费记录</div>';
            return;
        }
        
        expenses.forEach(expense => {
            const item = document.createElement('div');
            item.className = 'expense-item';
            item.innerHTML = `
                <div>
                    <div class="expense-desc">${expense.description}</div>
                    <div class="expense-category">${expense.category}</div>
                </div>
                <div class="expense-amount">${expense.amount}元</div>
            `;
            listContainer.appendChild(item);
        });
    }
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        addMessage(message, "user");
        userInput.value = "";
        
        // 显示"正在输入"指示器
        const typingId = 'typing-' + Date.now();
        const typingIndicator = document.createElement('div');
        typingIndicator.id = typingId;
        typingIndicator.className = 'message bot-message';
        typingIndicator.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // 发送到后端
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            // 移除"正在输入"指示器
            const indicator = document.getElementById(typingId);
            if (indicator) {
                indicator.remove();
            }
            // 添加AI回复
            addMessage(data.response, "bot");
            // 刷新统计数据
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                loadStatsData(activeTab.dataset.period);
            }
        })
        .catch(error => {
            // 移除"正在输入"指示器
            const indicator = document.getElementById(typingId);
            if (indicator) {
                indicator.remove();
            }
            addMessage("网络错误，请稍后再试", "bot");
            console.error('Error:', error);
        });
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // 处理换行和特殊格式
        if (text.includes('\n')) {
            text.split('\n').forEach(line => {
                if (line.startsWith('- ')) {
                    const recordDiv = document.createElement('div');
                    recordDiv.className = 'expense-record';
                    recordDiv.textContent = line.substring(2);
                    contentDiv.appendChild(recordDiv);
                } else if (line.trim() !== '') {
                    const para = document.createElement('p');
                    para.textContent = line;
                    contentDiv.appendChild(para);
                }
            });
        } else {
            contentDiv.textContent = text;
        }
        
        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});