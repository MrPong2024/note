class RandomNumberGenerator {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('randomHistory')) || [];
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
    }

    initializeElements() {
        this.minValueInput = document.getElementById('minValue');
        this.maxValueInput = document.getElementById('maxValue');
        this.resultNumber = document.getElementById('resultNumber');
        this.resultInfo = document.getElementById('resultInfo');
        this.generateBtn = document.getElementById('generateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.historyList = document.getElementById('historyList');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateNumber());
        this.clearBtn.addEventListener('click', () => this.clearResult());
        this.copyBtn.addEventListener('click', () => this.copyResult());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Input validation
        this.minValueInput.addEventListener('input', () => this.validateInputs());
        this.maxValueInput.addEventListener('input', () => this.validateInputs());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input')) {
                e.preventDefault();
                this.generateNumber();
            } else if (e.code === 'KeyR' && e.ctrlKey) {
                e.preventDefault();
                this.clearResult();
            } else if (e.code === 'KeyC' && e.ctrlKey && this.copyBtn.disabled === false) {
                if (!e.target.matches('input')) {
                    e.preventDefault();
                    this.copyResult();
                }
            }
        });

        // Auto-generate on Enter in input fields
        this.minValueInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateNumber();
        });
        this.maxValueInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateNumber();
        });
    }

    validateInputs() {
        const min = parseInt(this.minValueInput.value);
        const max = parseInt(this.maxValueInput.value);
        
        // Reset custom validity
        this.minValueInput.setCustomValidity('');
        this.maxValueInput.setCustomValidity('');

        if (isNaN(min) || isNaN(max)) {
            this.generateBtn.disabled = true;
            return false;
        }

        if (min >= max) {
            this.minValueInput.setCustomValidity('ตัวเลขต่ำสุดต้องน้อยกว่าตัวเลขสูงสุด');
            this.maxValueInput.setCustomValidity('ตัวเลขสูงสุดต้องมากกว่าตัวเลขต่ำสุด');
            this.generateBtn.disabled = true;
            return false;
        }

        if (max - min > 1000000) {
            this.maxValueInput.setCustomValidity('ช่วงตัวเลขต้องไม่เกิน 1,000,000');
            this.generateBtn.disabled = true;
            return false;
        }

        this.generateBtn.disabled = false;
        return true;
    }

    async generateNumber() {
        if (!this.validateInputs()) {
            this.showToast('กรุณาตรวจสอบค่าที่กรอก', 'error');
            return;
        }

        const min = parseInt(this.minValueInput.value);
        const max = parseInt(this.maxValueInput.value);

        try {
            this.showLoading(true);
            this.generateBtn.disabled = true;

            // Simulate API call delay for better UX
            await this.delay(300);

            const response = await fetch('/api/random', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ min, max }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            await this.delay(200); // Additional delay for animation
            this.displayResult(data);
            this.addToHistory(data);
            this.showToast('สุ่มเลขสำเร็จ!');

        } catch (error) {
            console.error('Error generating random number:', error);
            this.showToast('เกิดข้อผิดพลาดในการสุ่มเลข', 'error');
        } finally {
            this.showLoading(false);
            this.generateBtn.disabled = false;
        }
    }

    displayResult(data) {
        // Animate number change
        this.resultNumber.classList.add('animate');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            this.resultNumber.classList.remove('animate');
        }, 600);

        // Update result display
        this.resultNumber.textContent = data.number.toLocaleString('th-TH');
        this.resultInfo.innerHTML = `
            <span class="range-text">
                ช่วง ${data.min.toLocaleString('th-TH')} - ${data.max.toLocaleString('th-TH')}
            </span>
        `;

        // Enable copy button
        this.copyBtn.disabled = false;

        // Add result glow effect
        this.resultNumber.style.textShadow = `
            0 0 30px rgba(99, 102, 241, 0.8),
            0 0 60px rgba(99, 102, 241, 0.4),
            0 0 90px rgba(99, 102, 241, 0.2)
        `;

        // Remove glow after 2 seconds
        setTimeout(() => {
            this.resultNumber.style.textShadow = '0 0 30px rgba(99, 102, 241, 0.5)';
        }, 2000);
    }

    clearResult() {
        this.resultNumber.textContent = '?';
        this.resultInfo.innerHTML = '<span class="range-text">กดปุ่มเพื่อสุ่มเลข</span>';
        this.copyBtn.disabled = true;
        this.resultNumber.style.textShadow = '0 0 30px rgba(99, 102, 241, 0.5)';
        this.showToast('ล้างผลลัพธ์แล้ว');
    }

    async copyResult() {
        if (this.resultNumber.textContent === '?') return;

        try {
            const numberToCopy = this.resultNumber.textContent.replace(/,/g, '');
            await navigator.clipboard.writeText(numberToCopy);
            this.showToast('คัดลอกแล้ว!');
            
            // Visual feedback
            this.copyBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.copyBtn.style.transform = '';
            }, 150);

        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('ไม่สามารถคัดลอกได้', 'error');
        }
    }

    addToHistory(data) {
        const historyItem = {
            id: Date.now(),
            number: data.number,
            min: data.min,
            max: data.max,
            timestamp: new Date().toLocaleString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };

        this.history.unshift(historyItem);
        
        // Keep only last 50 items
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="history-empty">
                    <i data-lucide="archive" class="empty-icon"></i>
                    <p>ยังไม่มีประวัติการสุ่ม</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div>
                    <div class="history-number">${item.number.toLocaleString('th-TH')}</div>
                    <div class="history-range">ช่วง ${item.min.toLocaleString('th-TH')} - ${item.max.toLocaleString('th-TH')}</div>
                </div>
                <div class="history-time">${item.timestamp}</div>
            </div>
        `).join('');

        // Add click handlers for history items
        this.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const number = item.querySelector('.history-number').textContent.replace(/,/g, '');
                navigator.clipboard.writeText(number).then(() => {
                    this.showToast('คัดลอกจากประวัติแล้ว!');
                }).catch(() => {
                    this.showToast('ไม่สามารถคัดลอกได้', 'error');
                });
            });
        });
    }

    loadHistory() {
        this.renderHistory();
    }

    saveHistory() {
        try {
            localStorage.setItem('randomHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    clearHistory() {
        if (this.history.length === 0) return;

        if (confirm('คุณต้องการลบประวัติการสุ่มทั้งหมดหรือไม่?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            this.showToast('ล้างประวัติแล้ว');
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.add('show');
        } else {
            this.loadingOverlay.classList.remove('show');
        }
    }

    showToast(message, type = 'success') {
        const toastIcon = this.toast.querySelector('.toast-icon');
        const toastMessage = this.toast.querySelector('.toast-message');
        
        // Update icon based on type
        if (type === 'error') {
            toastIcon.setAttribute('data-lucide', 'x-circle');
            toastIcon.style.color = 'var(--danger-color)';
        } else {
            toastIcon.setAttribute('data-lucide', 'check');
            toastIcon.style.color = 'var(--secondary-color)';
        }

        toastMessage.textContent = message;
        
        // Recreate icons for the updated icon
        lucide.createIcons();
        
        // Show toast
        this.toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the random number generator
    const app = new RandomNumberGenerator();
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Add some interactive effects
    addInteractiveEffects();
    
    console.log('🎲 Random Number Generator initialized!');
});

// Additional interactive effects
function addInteractiveEffects() {
    // Parallax effect for header background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.header::before');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateX(-50%) translateY(${speed}px)`;
        }
    });

    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add floating animation to cards on hover
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px) scale(1)';
        });
    });

    // Keyboard navigation hints
    let hintTimeout;
    document.addEventListener('keydown', (e) => {
        clearTimeout(hintTimeout);
        
        const hints = document.querySelector('.keyboard-hints');
        if (hints) {
            hints.style.opacity = '1';
            hintTimeout = setTimeout(() => {
                hints.style.opacity = '0';
            }, 2000);
        }
    });
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .keyboard-hints {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 1rem;
        font-size: 0.75rem;
        color: var(--text-secondary);
        transition: opacity 0.3s ease;
        opacity: 0;
        pointer-events: none;
        z-index: 1000;
        max-width: 200px;
    }
    
    .keyboard-hints div {
        margin-bottom: 0.25rem;
    }
    
    .keyboard-hints kbd {
        background: var(--bg-tertiary);
        padding: 0.125rem 0.25rem;
        border-radius: 0.125rem;
        font-family: monospace;
        font-size: 0.7rem;
    }
`;
document.head.appendChild(style);

// Add keyboard hints to the page
const keyboardHints = document.createElement('div');
keyboardHints.className = 'keyboard-hints';
keyboardHints.innerHTML = `
    <div><kbd>Space</kbd> สุ่มเลข</div>
    <div><kbd>Ctrl+R</kbd> รีเซ็ต</div>
    <div><kbd>Ctrl+C</kbd> คัดลอก</div>
    <div><kbd>Enter</kbd> สุ่ม (ในช่องกรอก)</div>
`;
document.body.appendChild(keyboardHints);