// Multi-Tool Random Generator Application
class MultiToolApp {
    constructor() {
        this.currentTool = 'number';
        this.initializeElements();
        this.bindEvents();
        this.initializeNavigation();
        
        // Initialize individual tools
        this.numberGenerator = new NumberGenerator(this);
        this.colorGenerator = new ColorGenerator(this);
        this.passwordGenerator = new PasswordGenerator(this);
        this.nameGenerator = new NameGenerator(this);
        this.foodGenerator = new FoodGenerator(this);
        this.quoteGenerator = new QuoteGenerator(this);
        this.decisionMaker = new DecisionMaker(this);
        
        console.log('🎲 Multi-Tool Random Generator initialized!');
    }

    initializeElements() {
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Navigation events
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.closest('.nav-tab').dataset.tab;
                this.switchTool(tabName);
            });
        });
    }

    initializeNavigation() {
        this.switchTool('number');
    }

    switchTool(toolName) {
        this.currentTool = toolName;
        
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === toolName);
        });
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${toolName}Tab`);
        });
        
        // Initialize tool if needed
        if (this[`${toolName}Generator`] && this[`${toolName}Generator`].onActivate) {
            this[`${toolName}Generator`].onActivate();
        }
        if (toolName === 'decision' && this.decisionMaker.onActivate) {
            this.decisionMaker.onActivate();
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
        
        if (type === 'error') {
            toastIcon.setAttribute('data-lucide', 'x-circle');
            toastIcon.style.color = '#ef4444';
        } else {
            toastIcon.setAttribute('data-lucide', 'check');
            toastIcon.style.color = '#10b981';
        }

        toastMessage.textContent = message;
        lucide.createIcons();
        
        this.toast.classList.add('show');
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    async copyToClipboard(text, successMessage = 'คัดลอกแล้ว!') {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast(successMessage);
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('ไม่สามารถคัดลอกได้', 'error');
            return false;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Number Generator Tool
class NumberGenerator {
    constructor(app) {
        this.app = app;
        this.currentMode = 'basic';
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.minValueInput = document.getElementById('minValue');
        this.maxValueInput = document.getElementById('maxValue');
        this.resultNumber = document.getElementById('resultNumber');
        this.multiNumbers = document.getElementById('multiNumbers');
        this.resultInfo = document.getElementById('resultInfo');
        this.generateBtn = document.getElementById('generateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.shareBtn = document.getElementById('shareBtn');

        // Mode elements
        this.basicModeBtn = document.getElementById('basicModeBtn');
        this.multipleModeBtn = document.getElementById('multipleModeBtn');
        this.lotteryModeBtn = document.getElementById('lotteryModeBtn');
        this.templateModeBtn = document.getElementById('templateModeBtn');
    }

    bindEvents() {
        if (this.generateBtn) this.generateBtn.addEventListener('click', () => this.generateNumber());
        if (this.clearBtn) this.clearBtn.addEventListener('click', () => this.clearResult());
        if (this.copyBtn) this.copyBtn.addEventListener('click', () => this.copyResult());
        if (this.shareBtn) this.shareBtn.addEventListener('click', () => this.shareResult());

        // Mode switching
        console.log('Binding mode events...');
        if (this.basicModeBtn) {
            console.log('Basic mode button found');
            this.basicModeBtn.addEventListener('click', () => this.switchMode('basic'));
        }
        if (this.multipleModeBtn) {
            console.log('Multiple mode button found');
            this.multipleModeBtn.addEventListener('click', () => this.switchMode('multiple'));
        }
        if (this.lotteryModeBtn) {
            console.log('Lottery mode button found');
            this.lotteryModeBtn.addEventListener('click', () => this.switchMode('lottery'));
        }
        if (this.templateModeBtn) {
            console.log('Template mode button found');
            this.templateModeBtn.addEventListener('click', () => this.switchMode('template'));
        }

        // Lottery presets
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-lottery]')) {
                console.log('Lottery preset clicked:', e.target.dataset.lottery);
                this.generateLottery(e.target.dataset.lottery);
            }
            if (e.target.matches('[data-template]')) {
                console.log('Template clicked:', e.target.dataset.template);
                this.generateTemplate(e.target.dataset.template);
            }
        });

        // Input validation
        [this.minValueInput, this.maxValueInput].forEach(input => {
            if (input) input.addEventListener('input', () => this.validateInputs());
        });
    }

    switchMode(mode) {
        console.log('Switching to mode:', mode);
        this.currentMode = mode;
        
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.getElementById(`${mode}ModeBtn`);
        if (targetBtn) {
            targetBtn.classList.add('active');
            console.log('Activated button:', targetBtn.id);
        } else {
            console.error('Button not found:', `${mode}ModeBtn`);
        }
        
        // Update content visibility
        document.querySelectorAll('.mode-content').forEach(content => content.classList.remove('active'));
        const targetContent = document.getElementById(`${mode}Mode`);
        if (targetContent) {
            targetContent.classList.add('active');
            console.log('Activated content:', targetContent.id);
        } else {
            console.error('Content not found:', `${mode}Mode`);
        }
        
        this.clearResult();
    }

    generateLottery(type) {
        let numbers = [];
        let info = '';
        
        switch(type) {
            case 'thai':
                numbers = this.generateRandomNumbers(100000, 999999, 1);
                info = 'ลอตเตอรี่ไทย (6 หลัก)';
                break;
            case 'mega':
                numbers = this.generateRandomNumbers(1, 70, 5);
                info = 'Mega Millions (5 เลข 1-70)';
                break;
            case 'powerball':
                numbers = this.generateRandomNumbers(1, 69, 5);
                info = 'Powerball (5 เลข 1-69)';
                break;
        }
        
        this.displayMultipleResults(numbers, info);
    }

    generateTemplate(type) {
        let numbers = [];
        let info = '';
        
        switch(type) {
            case 'phone':
                const phonePrefix = ['080', '081', '082', '083', '084', '085', '086', '087', '088', '089'];
                const prefix = phonePrefix[Math.floor(Math.random() * phonePrefix.length)];
                const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
                this.displaySingleResult(prefix + suffix, 'หมายเลขโทรศัพท์มือถือ');
                return;
            case 'dice':
                numbers = this.generateRandomNumbers(1, 6, 1);
                info = 'ลูกเต๋า (1-6)';
                break;
            case 'coin':
                const coin = Math.random() < 0.5 ? 'หัว' : 'ก้อย';
                this.displaySingleResult(coin, 'เหรียญ');
                return;
            case 'grade':
                const grades = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
                const grade = grades[Math.floor(Math.random() * grades.length)];
                this.displaySingleResult(grade, 'เกรด');
                return;
            case 'year':
                numbers = this.generateRandomNumbers(1900, 2024, 1);
                info = 'ปี ค.ศ.';
                break;
            case 'percent':
                numbers = this.generateRandomNumbers(0, 100, 1);
                info = 'เปอร์เซ็นต์ (%)';
                break;
        }
        
        if (numbers.length === 1) {
            this.displaySingleResult(numbers[0], info);
        } else {
            this.displayMultipleResults(numbers, info);
        }
    }

    generateRandomNumbers(min, max, count, unique = false) {
        const numbers = [];
        
        if (unique && (max - min + 1) < count) {
            count = max - min + 1; // Adjust count if range is smaller
        }
        
        for (let i = 0; i < count; i++) {
            let number;
            do {
                number = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (unique && numbers.includes(number));
            
            numbers.push(number);
        }
        
        return unique ? numbers.sort((a, b) => a - b) : numbers;
    }

    displaySingleResult(result, info) {
        if (this.resultNumber) {
            this.resultNumber.textContent = result;
            this.resultNumber.classList.remove('animate');
            this.resultNumber.style.display = 'inline-block';
            setTimeout(() => this.resultNumber.classList.add('animate'), 10);
        }
        
        if (this.multiNumbers) {
            this.multiNumbers.classList.remove('show');
        }
        
        if (this.resultInfo) {
            this.resultInfo.innerHTML = `<span class="range-text">${info}</span>`;
        }
        
        this.enableActionButtons();
    }

    displayMultipleResults(numbers, info) {
        if (this.resultNumber) {
            this.resultNumber.style.display = 'none';
        }
        
        if (this.multiNumbers) {
            this.multiNumbers.innerHTML = '';
            numbers.forEach((num, index) => {
                const numberElement = document.createElement('div');
                numberElement.className = 'multi-number';
                numberElement.textContent = num;
                numberElement.style.animationDelay = `${index * 0.1}s`;
                this.multiNumbers.appendChild(numberElement);
            });
            this.multiNumbers.classList.add('show');
        }
        
        if (this.resultInfo) {
            this.resultInfo.innerHTML = `<span class="range-text">${info}</span>`;
        }
        
        this.enableActionButtons();
    }

    enableActionButtons() {
        [this.clearBtn, this.copyBtn, this.shareBtn].forEach(btn => {
            if (btn) btn.disabled = false;
        });
    }

    validateInputs() {
        if (!this.minValueInput || !this.maxValueInput) return false;
        
        const min = parseInt(this.minValueInput.value);
        const max = parseInt(this.maxValueInput.value);
        
        if (isNaN(min) || isNaN(max) || min >= max) {
            this.generateBtn.disabled = true;
            return false;
        }
        
        this.generateBtn.disabled = false;
        return true;
    }

    async generateNumber() {
        // Handle multiple mode
        if (this.currentMode === 'multiple') {
            const countInput = document.getElementById('multipleCount');
            const uniqueCheckbox = document.getElementById('uniqueNumbers');
            
            if (!countInput || !this.validateInputs()) {
                this.app.showToast('กรุณาตรวจสอบค่าที่กรอก', 'error');
                return;
            }
            
            const min = parseInt(this.minValueInput.value);
            const max = parseInt(this.maxValueInput.value);
            const count = parseInt(countInput.value) || 5;
            const unique = uniqueCheckbox ? uniqueCheckbox.checked : false;
            
            const numbers = this.generateRandomNumbers(min, max, count, unique);
            const info = `${count} เลข (${min}-${max})${unique ? ' ไม่ซ้ำ' : ''}`;
            this.displayMultipleResults(numbers, info);
            this.app.showToast('สุ่มเลขสำเร็จ!');
            return;
        }
        
        // Handle basic mode (original functionality)
        if (!this.validateInputs()) {
            this.app.showToast('กรุณาตรวจสอบค่าที่กรอก', 'error');
            return;
        }

        const min = parseInt(this.minValueInput.value);
        const max = parseInt(this.maxValueInput.value);

        try {
            this.app.showLoading(true);
            this.generateBtn.disabled = true;

            await this.app.delay(300);

            const response = await fetch('/api/random', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ min, max }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.displaySingleResult(data.number, `ระหว่าง ${min} - ${max}`);
            this.app.showToast('สุ่มเลขสำเร็จ!');

        } catch (error) {
            console.error('Error:', error);
            this.app.showToast('เกิดข้อผิดพลาด', 'error');
        } finally {
            this.app.showLoading(false);
            this.generateBtn.disabled = false;
        }
    }

    clearResult() {
        if (this.resultNumber) {
            this.resultNumber.textContent = '?';
            this.resultNumber.style.display = 'inline-block';
        }
        
        if (this.multiNumbers) {
            this.multiNumbers.innerHTML = '';
            this.multiNumbers.classList.remove('show');
        }
        
        if (this.resultInfo) {
            this.resultInfo.innerHTML = '<span class="range-text">กดปุ่มเพื่อสุ่มเลข</span>';
        }
        
        [this.copyBtn, this.shareBtn].forEach(btn => {
            if (btn) btn.disabled = true;
        });
    }

    copyResult() {
        let textToCopy = '';
        
        if (this.multiNumbers && this.multiNumbers.classList.contains('show')) {
            // Copy multiple numbers
            const numbers = Array.from(this.multiNumbers.children)
                .map(el => el.textContent)
                .join(', ');
            textToCopy = numbers;
        } else if (this.resultNumber && this.resultNumber.textContent !== '?') {
            // Copy single number
            textToCopy = this.resultNumber.textContent.replace(/,/g, '');
        }
        
        if (textToCopy) {
            this.app.copyToClipboard(textToCopy);
        }
    }

    async shareResult() {
        let shareText = '';
        
        if (this.multiNumbers && this.multiNumbers.classList.contains('show')) {
            const numbers = Array.from(this.multiNumbers.children)
                .map(el => el.textContent)
                .join(', ');
            shareText = `สุ่มเลขได้: ${numbers} 🎲\n\nสุ่มเลขออนไลน์ที่ ${window.location.href}`;
        } else if (this.resultNumber && this.resultNumber.textContent !== '?') {
            shareText = `สุ่มเลขได้: ${this.resultNumber.textContent} 🎲\n\nสุ่มเลขออนไลน์ที่ ${window.location.href}`;
        }
        
        if (!shareText) return;
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'สุ่มเลข',
                    text: shareText,
                    url: window.location.href
                });
            } else {
                await this.app.copyToClipboard(shareText, 'คัดลอกข้อความสำหรับแชร์แล้ว!');
            }
        } catch (error) {
            console.error('Share failed:', error);
        }
    }
}

// Color Generator Tool
class ColorGenerator {
    constructor(app) {
        this.app = app;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.colorPreview = document.getElementById('colorPreview');
        this.colorCode = document.getElementById('colorCode');
        this.colorFormats = document.getElementById('colorFormats');
        this.generateColorBtn = document.getElementById('generateColorBtn');
        this.copyColorBtn = document.getElementById('copyColorBtn');
        this.saveColorBtn = document.getElementById('saveColorBtn');
        this.currentColor = null;
    }

    bindEvents() {
        if (this.generateColorBtn) this.generateColorBtn.addEventListener('click', () => this.generateColor());
        if (this.copyColorBtn) this.copyColorBtn.addEventListener('click', () => this.copyColor());
        if (this.saveColorBtn) this.saveColorBtn.addEventListener('click', () => this.saveColor());
    }

    generateColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        
        this.currentColor = { r, g, b };
        this.displayColor();
        this.app.showToast('สุ่มสีสำเร็จ!');
    }

    displayColor() {
        if (!this.currentColor) return;
        
        const { r, g, b } = this.currentColor;
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        const rgb = `rgb(${r}, ${g}, ${b})`;
        const hsl = this.rgbToHsl(r, g, b);
        
        // Update preview
        this.colorPreview.style.background = rgb;
        
        // Update code display
        this.colorCode.textContent = hex;
        
        // Update formats
        this.colorFormats.innerHTML = `
            <div class="color-format">
                <span>HEX:</span>
                <span>${hex}</span>
            </div>
            <div class="color-format">
                <span>RGB:</span>
                <span>${rgb}</span>
            </div>
            <div class="color-format">
                <span>HSL:</span>
                <span>${hsl}</span>
            </div>
        `;
        
        this.copyColorBtn.disabled = false;
        this.saveColorBtn.disabled = false;
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    copyColor() {
        if (!this.currentColor) return;
        this.app.copyToClipboard(this.colorCode.textContent, 'คัดลอกโค้ดสีแล้ว!');
    }

    saveColor() {
        if (!this.currentColor) return;
        // Implementation for saving favorite colors
        this.app.showToast('บันทึกสีแล้ว!');
    }
}

// Password Generator Tool
class PasswordGenerator {
    constructor(app) {
        this.app = app;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.passwordLengthInput = document.getElementById('passwordLength');
        this.lengthValue = document.getElementById('lengthValue');
        this.includeUppercase = document.getElementById('includeUppercase');
        this.includeLowercase = document.getElementById('includeLowercase');
        this.includeNumbers = document.getElementById('includeNumbers');
        this.includeSymbols = document.getElementById('includeSymbols');
        this.generatedPassword = document.getElementById('generatedPassword');
        this.togglePasswordVisibility = document.getElementById('togglePasswordVisibility');
        this.visibilityIcon = document.getElementById('visibilityIcon');
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthText = document.getElementById('strengthText');
        this.generatePasswordBtn = document.getElementById('generatePasswordBtn');
        this.copyPasswordBtn = document.getElementById('copyPasswordBtn');
        this.regeneratePasswordBtn = document.getElementById('regeneratePasswordBtn');
    }

    bindEvents() {
        if (this.passwordLengthInput) {
            this.passwordLengthInput.addEventListener('input', () => {
                this.lengthValue.textContent = this.passwordLengthInput.value;
            });
        }
        
        if (this.generatePasswordBtn) this.generatePasswordBtn.addEventListener('click', () => this.generatePassword());
        if (this.copyPasswordBtn) this.copyPasswordBtn.addEventListener('click', () => this.copyPassword());
        if (this.regeneratePasswordBtn) this.regeneratePasswordBtn.addEventListener('click', () => this.generatePassword());
        if (this.togglePasswordVisibility) this.togglePasswordVisibility.addEventListener('click', () => this.toggleVisibility());
    }

    generatePassword() {
        const length = parseInt(this.passwordLengthInput.value);
        const options = {
            includeUppercase: this.includeUppercase?.checked || false,
            includeLowercase: this.includeLowercase?.checked || false,
            includeNumbers: this.includeNumbers?.checked || false,
            includeSymbols: this.includeSymbols?.checked || false
        };

        if (!Object.values(options).some(option => option)) {
            this.app.showToast('กรุณาเลือกตัวอักษรอย่างน้อย 1 ประเภท', 'error');
            return;
        }

        let charset = '';
        if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (options.includeNumbers) charset += '0123456789';
        if (options.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        this.generatedPassword.value = password;
        this.updatePasswordStrength(password, options);
        this.copyPasswordBtn.disabled = false;
        this.regeneratePasswordBtn.disabled = false;
        this.app.showToast('สร้างรหัสผ่านสำเร็จ!');
    }

    updatePasswordStrength(password, options) {
        let score = 0;
        let feedback = '';

        // Length scoring
        if (password.length >= 12) score += 25;
        else if (password.length >= 8) score += 15;
        else if (password.length >= 6) score += 10;

        // Character variety
        if (options.includeUppercase) score += 15;
        if (options.includeLowercase) score += 15;
        if (options.includeNumbers) score += 15;
        if (options.includeSymbols) score += 30;

        // Determine strength level
        if (score >= 80) {
            feedback = 'แข็งแกร่งมาก';
            this.strengthFill.style.background = '#22c55e';
        } else if (score >= 60) {
            feedback = 'แข็งแกร่ง';
            this.strengthFill.style.background = '#10b981';
        } else if (score >= 40) {
            feedback = 'ปานกลาง';
            this.strengthFill.style.background = '#f59e0b';
        } else {
            feedback = 'อย่อย';
            this.strengthFill.style.background = '#ef4444';
        }

        this.strengthFill.style.width = `${score}%`;
        this.strengthText.textContent = feedback;
    }

    toggleVisibility() {
        const isPassword = this.generatedPassword.type === 'password';
        this.generatedPassword.type = isPassword ? 'text' : 'password';
        this.visibilityIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        lucide.createIcons();
    }

    copyPassword() {
        if (!this.generatedPassword.value) return;
        this.app.copyToClipboard(this.generatedPassword.value, 'คัดลอกรหัสผ่านแล้ว!');
    }
}

// Name Generator Tool
class NameGenerator {
    constructor(app) {
        this.app = app;
        this.currentType = 'thai-male';
        this.initializeElements();
        this.bindEvents();
        this.loadNameData();
    }

    initializeElements() {
        this.generatedName = document.getElementById('generatedName');
        this.nameMeaning = document.getElementById('nameMeaning');
        this.generateNameBtn = document.getElementById('generateNameBtn');
        this.copyNameBtn = document.getElementById('copyNameBtn');
        this.favoriteNameBtn = document.getElementById('favoriteNameBtn');
    }

    bindEvents() {
        document.querySelectorAll('.name-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentType = btn.dataset.type;
                document.querySelectorAll('.name-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        if (this.generateNameBtn) this.generateNameBtn.addEventListener('click', () => this.generateName());
        if (this.copyNameBtn) this.copyNameBtn.addEventListener('click', () => this.copyName());
        if (this.favoriteNameBtn) this.favoriteNameBtn.addEventListener('click', () => this.favoriteName());
    }

    loadNameData() {
        this.nameData = {
            'thai-male': [
                { name: 'สมชาย', meaning: 'ชายที่เหมาะสม' },
                { name: 'วิชัย', meaning: 'ผู้ชนะ' },
                { name: 'สมศักดิ์', meaning: 'มีศักดิ์ศรีเหมาะสม' },
                { name: 'อนุชา', meaning: 'น้องชาย' },
                { name: 'ธีรพงษ์', meaning: 'วงศ์ของผู้อดทน' },
                { name: 'ปกรณ์', meaning: 'อาวุธ' },
                { name: 'รัฐพล', meaning: 'กำลังของรัฐ' },
                { name: 'ศิวกร', meaning: 'ผู้รับใช้พระศิวะ' },
                { name: 'นพดล', meaning: 'เก้าอานุภาพ' },
                { name: 'สุทิน', meaning: 'วันที่ดี' }
            ],
            'thai-female': [
                { name: 'สมหญิง', meaning: 'หญิงที่เหมาะสม' },
                { name: 'วิมล', meaning: 'สะอาด บริสุทธิ์' },
                { name: 'ประภา', meaning: 'แสงสว่าง' },
                { name: 'สุดา', meaning: 'หญิงที่ดี' },
                { name: 'นิตยา', meaning: 'นิรันดร์' },
                { name: 'กัลยา', meaning: 'สาวงาม' },
                { name: 'รุ่งทิวา', meaning: 'แสงตะวัน' },
                { name: 'สุภาพร', meaning: 'พรอันดี' },
                { name: 'ธิดาภร', meaning: 'ธิดาผู้มีพร' },
                { name: 'อรุณี', meaning: 'แสงอรุณ' }
            ],
            'english': [
                { name: 'Alexander', meaning: 'Defender of men' },
                { name: 'Benjamin', meaning: 'Son of the right hand' },
                { name: 'Charlotte', meaning: 'Free woman' },
                { name: 'Elizabeth', meaning: 'God is my oath' },
                { name: 'William', meaning: 'Resolute protector' },
                { name: 'Sophia', meaning: 'Wisdom' },
                { name: 'James', meaning: 'Supplanter' },
                { name: 'Emma', meaning: 'Whole, universal' },
                { name: 'Michael', meaning: 'Who is like God?' },
                { name: 'Olivia', meaning: 'Olive tree' }
            ],
            'pet': [
                { name: 'มิโกะ', meaning: 'ลูกแมวน่ารัก' },
                { name: 'ชิบะ', meaning: 'สุนัขพันธุ์ญี่ปุ่น' },
                { name: 'ลูกบอล', meaning: 'กลมๆ น่ารัก' },
                { name: 'มาร์หม', meaning: 'แมวส้ม' },
                { name: 'คุกกี้', meaning: 'หวานๆ' },
                { name: 'บับเบิ้ล', meaning: 'ขี้เล่น' },
                { name: 'โมจิ', meaning: 'นุ่มๆ' },
                { name: 'เกี้ยว', meaning: 'แสนรู้' },
                { name: 'ทาโร่', meaning: 'ลูกชายคนโต' },
                { name: 'นินจา', meaning: 'เร็วแรง' }
            ],
            'company': [
                { name: 'Digital Innovation Co.', meaning: 'บริษัทนวัตกรรมดิจิทัล' },
                { name: 'Smart Solutions Ltd.', meaning: 'โซลูชันอัจฉริยะ' },
                { name: 'Future Tech Systems', meaning: 'ระบบเทคโนโลยีอนาคต' },
                { name: 'Global Connect', meaning: 'การเชื่อมต่อสากล' },
                { name: 'Creative Minds Studio', meaning: 'สตูดิโอจิตใจสร้างสรรค์' },
                { name: 'Advanced Analytics', meaning: 'การวิเคราะห์ขั้นสูง' },
                { name: 'NextGen Enterprises', meaning: 'องค์กรยุคใหม่' },
                { name: 'Synergy Dynamics', meaning: 'พลวัตแห่งการร่วมมือ' },
                { name: 'Quantum Solutions', meaning: 'โซลูชันควอนตัม' },
                { name: 'Infinite Possibilities', meaning: 'ความเป็นไปได้อนันต์' }
            ],
            'username': [
                { name: 'CodeNinja2024', meaning: 'นินจาเขียนโค้ด' },
                { name: 'PixelMaster', meaning: 'เซียนพิกเซล' },
                { name: 'DataWhiz', meaning: 'เทพข้อมูล' },
                { name: 'CyberPhoenix', meaning: 'นกฟีนิกส์ไซเบอร์' },
                { name: 'TechSage', meaning: 'นักปราชญ์เทค' },
                { name: 'ByteBender', meaning: 'นักดัดแปลงไบต์' },
                { name: 'QuantumCoder', meaning: 'โปรแกรมเมอร์ควอนตัม' },
                { name: 'DigitalNomad', meaning: 'เร่ร่อนดิจิทัล' },
                { name: 'CloudSurfer', meaning: 'นักเซิร์ฟคลาวด์' },
                { name: 'AlgorithmAce', meaning: 'เซียนอัลกอริธึม' }
            ]
        };
    }

    generateName() {
        const names = this.nameData[this.currentType];
        if (!names || names.length === 0) {
            this.app.showToast('ไม่พบข้อมูลชื่อ', 'error');
            return;
        }

        const randomName = names[Math.floor(Math.random() * names.length)];
        this.generatedName.textContent = randomName.name;
        this.nameMeaning.textContent = randomName.meaning;
        
        this.copyNameBtn.disabled = false;
        this.favoriteNameBtn.disabled = false;
        this.app.showToast('สุ่มชื่อสำเร็จ!');
    }

    copyName() {
        if (this.generatedName.textContent === 'กดปุ่มเพื่อสุ่มชื่อ') return;
        this.app.copyToClipboard(this.generatedName.textContent, 'คัดลอกชื่อแล้ว!');
    }

    favoriteName() {
        // Implementation for saving favorite names
        this.app.showToast('บันทึกชื่อโปรดแล้ว!');
    }
}

// Food Generator Tool
class FoodGenerator {
    constructor(app) {
        this.app = app;
        this.currentCategory = 'all';
        this.initializeElements();
        this.bindEvents();
        this.loadFoodData();
    }

    initializeElements() {
        this.foodName = document.getElementById('foodName');
        this.foodDetails = document.getElementById('foodDetails');
        this.foodEmoji = document.getElementById('foodEmoji');
        this.generateFoodBtn = document.getElementById('generateFoodBtn');
        this.saveFoodBtn = document.getElementById('saveFoodBtn');
        this.nearbyRestaurantBtn = document.getElementById('nearbyRestaurantBtn');
    }

    bindEvents() {
        document.querySelectorAll('.food-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentCategory = btn.dataset.category;
                document.querySelectorAll('.food-category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        if (this.generateFoodBtn) this.generateFoodBtn.addEventListener('click', () => this.generateFood());
        if (this.saveFoodBtn) this.saveFoodBtn.addEventListener('click', () => this.saveFood());
        if (this.nearbyRestaurantBtn) this.nearbyRestaurantBtn.addEventListener('click', () => this.findNearbyRestaurants());
    }

    loadFoodData() {
        this.foodData = {
            thai: [
                { name: 'ผิดทอด', details: 'อาหารไทยยอดนิยม กุ้งผัดใส่ผัก', emoji: '🍜' },
                { name: 'ต้มยำกุ้ง', details: 'ซุปรสเปรี้ยวเผ็ด', emoji: '🍲' },
                { name: 'แกงเขียวหวาน', details: 'แกงหวานหอมกะทิ', emoji: '🥥' },
                { name: 'ส้มตำ', details: 'สลัดผลไม้รสเปรี้ยวเผ็ด', emoji: '🥗' },
                { name: 'มะม่วงข้าวเหนียว', details: 'ของหวานไทยโบราณ', emoji: '🥭' }
            ],
            japanese: [
                { name: 'ซูชิ', details: 'ข้าวปั้นหน้าปลาดิบ', emoji: '🍣' },
                { name: 'ราเมน', details: 'ก๋วยเตี๋ยวน้ำใส', emoji: '🍜' },
                { name: 'เทมปุระ', details: 'ของทอดแป้งกรอบ', emoji: '🍤' },
                { name: 'ยากิโตริ', details: 'ไก่ย่างเสียบไม้', emoji: '🍗' },
                { name: 'โดะรายากิ', details: 'ขนมปังไส้ครีม', emoji: '🥞' }
            ],
            western: [
                { name: 'เบอร์เกอร์', details: 'แฮมเบอร์เกอร์เนื้อสัด', emoji: '🍔' },
                { name: 'พิซซ่า', details: 'แป้งหนักชีส', emoji: '🍕' },
                { name: 'สเต็ก', details: 'เนื้อย่างชิ้นใหญ่', emoji: '🥩' },
                { name: 'พาสต้า', details: 'เส้นเล็ดอิตาเลียน', emoji: '🍝' },
                { name: 'ซัลมอนย่าง', details: 'ปลาซัลมอนย่างเจาะ', emoji: '🐟' }
            ],
            dessert: [
                { name: 'ไอศกรีม', details: 'ของหวานเย็น', emoji: '🍨' },
                { name: 'เค้ก', details: 'ขนมเค้กช็อคโกแลต', emoji: '🍰' },
                { name: 'คุกกี้', details: 'ขนมกรอบหวาน', emoji: '🍪' },
                { name: 'ทิรามิสุ', details: 'ขนมหวานอิตาเลียน', emoji: '🧁' },
                { name: 'มาการอน', details: 'ขนมหวานฝรั่งเศส', emoji: '🎂' }
            ],
            healthy: [
                { name: 'สลัดผล', details: 'ผลไม้รวมแป่น', emoji: '🥗' },
                { name: 'สมูเกรอิน', details: 'เครื่องดื่มผลไม้ปั่น', emoji: '🥤' },
                { name: 'ควินัว', details: 'เมล็ดพือธัญพืช', emoji: '🌾' },
                { name: 'อโวคาโด ต้นทาน', details: 'ขนมปังอโวคาโด', emoji: '🥑' },
                { name: 'ปลาเซลมอน', details: 'ปลาอ์คร่าโอเมก้า 3', emoji: '🐟' }
            ]
        };
        
        this.allFoods = Object.values(this.foodData).flat();
    }

    generateFood() {
        let foods;
        if (this.currentCategory === 'all') {
            foods = this.allFoods;
        } else {
            foods = this.foodData[this.currentCategory] || [];
        }

        if (foods.length === 0) {
            this.app.showToast('ไม่พบเมนูในหมวดนี้', 'error');
            return;
        }

        const randomFood = foods[Math.floor(Math.random() * foods.length)];
        this.foodName.textContent = randomFood.name;
        this.foodDetails.textContent = randomFood.details;
        this.foodEmoji.textContent = randomFood.emoji;
        
        this.saveFoodBtn.disabled = false;
        this.nearbyRestaurantBtn.disabled = false;
        this.app.showToast('เลือกเมนูให้แล้ว!');
    }

    saveFood() {
        // Implementation for saving favorite foods
        this.app.showToast('บันทึกเมนูแล้ว!');
    }

    findNearbyRestaurants() {
        // Implementation for finding nearby restaurants
        this.app.showToast('ค้นหาร้านใกล้เคียง...');
    }
}

// Quote Generator Tool
class QuoteGenerator {
    constructor(app) {
        this.app = app;
        this.currentCategory = 'motivation';
        this.initializeElements();
        this.bindEvents();
        this.loadQuoteData();
    }

    initializeElements() {
        this.quoteText = document.getElementById('quoteText');
        this.quoteAuthor = document.getElementById('quoteAuthor');
        this.generateQuoteBtn = document.getElementById('generateQuoteBtn');
        this.shareQuoteBtn = document.getElementById('shareQuoteBtn');
        this.favoriteQuoteBtn = document.getElementById('favoriteQuoteBtn');
    }

    bindEvents() {
        document.querySelectorAll('.quote-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentCategory = btn.dataset.category;
                document.querySelectorAll('.quote-category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        if (this.generateQuoteBtn) this.generateQuoteBtn.addEventListener('click', () => this.generateQuote());
        if (this.shareQuoteBtn) this.shareQuoteBtn.addEventListener('click', () => this.shareQuote());
        if (this.favoriteQuoteBtn) this.favoriteQuoteBtn.addEventListener('click', () => this.favoriteQuote());
    }

    loadQuoteData() {
        this.quoteData = {
            motivation: [
                { text: 'ความสำเร็จคือการเดินไปข้างหน้าแม้จะล้มลงหลายครั้ง', author: 'วินสตัน เชอร์ชิล' },
                { text: 'อนาคตขึ้นอยู่กับสิ่งที่เราทำในวันนี้', author: 'มหาตมะ คานธี' },
                { text: 'จงเป็นการเปลี่ยนแปลงที่คุณต้องการเห็นในโลก', author: 'มหาตมะ คานธี' },
                { text: 'คุณไม่สามารถใช้ชีวิตแบบเดิมแล้วคาดหวังผลลัพธ์ใหม่', author: 'อัลเบิร์ต ไอน์สไตน์' },
                { text: 'ก้าวเล็กๆ ทุกวัน นำไปสู่การเปลี่ยนแปลงใหญ่', author: 'ปรัชญาไทย' }
            ],
            love: [
                { text: 'ความรักคือความงามที่มองเห็นได้ด้วยใจ', author: 'เฮเลน เคลเลอร์' },
                { text: 'ความรักแท้คือการให้โดยไม่คิดหวังสิ่งตอบแทน', author: 'ลาโอจื' },
                { text: 'หัวใจไม่เคยรู้สึกเก่า เมื่อมีความรักใหม่เข้ามา', author: 'ปาโบล เนรูดา' },
                { text: 'ความรักไม่ใช่การมองหน้ากัน แต่เป็นการมองไปทิศทางเดียวกัน', author: 'แซงต์ เอ็กซูเปรี' },
                { text: 'ความรักเกิดจากความเข้าใจ ไม่ใช่จากความสวยงาม', author: 'ปรัชญาไทย' }
            ],
            wisdom: [
                { text: 'ความฉลาดแท้คือการรู้ว่าเราไม่รู้', author: 'โสเครติส' },
                { text: 'การเรียนรู้ไม่มีที่สิ้นสุด', author: 'ขงจื้อ' },
                { text: 'ประสบการณ์คือครูที่ดีที่สุด แต่ค่าเล่าเรียนแพง', author: 'เบนจามิน แฟรงคลิน' },
                { text: 'คนฉลาดเรียนรู้จากความผิดพลาดของตนเอง คนเก่งเรียนรู้จากความผิดพลาดของผู้อื่น', author: 'ออตโต ฟอน บิสมาร์ค' },
                { text: 'การใส่ใจในปัจจุบันคือการลงทุนในอนาคต', author: 'ปรัชญาไทย' }
            ],
            success: [
                { text: 'ความสำเร็จคือการทำในสิ่งที่คุณรัก', author: 'สตีฟ จ็อบส์' },
                { text: 'ความล้มเหลวคือบันไดแห่งความสำเร็จ', author: 'โทมัส เอดิสัน' },
                { text: 'อย่าวัดความสำเร็จด้วยสิ่งที่คุณได้ แต่วัดด้วยอุปสรรคที่คุณผ่านพ้น', author: 'บุ๊กเกอร์ ที. วอชิงตัน' },
                { text: 'ความสำเร็จคือการเตรียมตัวพบกับโอกาส', author: 'เซเนกา' },
                { text: 'จงทำวันนี้ให้ดีที่สุด เพราะมันจะกลายเป็นเมื่อวาน', author: 'ปรัชญาไทย' }
            ]
        };
    }

    generateQuote() {
        const quotes = this.quoteData[this.currentCategory] || [];
        if (quotes.length === 0) {
            this.app.showToast('ไม่พบคำคมในหมวดนี้', 'error');
            return;
        }

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        this.quoteText.textContent = `"${randomQuote.text}"`;
        this.quoteAuthor.textContent = `— ${randomQuote.author}`;
        
        this.shareQuoteBtn.disabled = false;
        this.favoriteQuoteBtn.disabled = false;
        this.app.showToast('ได้คำคมใหม่แล้ว!');
    }

    async shareQuote() {
        if (this.quoteText.textContent === 'กดปุ่มเพื่อรับคำคมดีๆ') return;
        
        const text = `${this.quoteText.textContent}\\n${this.quoteAuthor.textContent}\\n\\nคำคมจาก ${window.location.href}`;
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'คำคมสร้างแรงบันดาลใจ',
                    text: text
                });
            } else {
                await this.app.copyToClipboard(text, 'คัดลอกคำคมแล้ว!');
            }
        } catch (error) {
            console.error('Share failed:', error);
        }
    }

    favoriteQuote() {
        // Implementation for saving favorite quotes
        this.app.showToast('บันทึกคำคมโปรดแล้ว!');
    }
}

// Decision Maker Tool
class DecisionMaker {
    constructor(app) {
        this.app = app;
        this.currentMode = 'yesno';
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.decisionResult = document.getElementById('decisionResult');
        this.decisionConfidence = document.getElementById('decisionConfidence');
        this.customOptions = document.getElementById('customOptions');
        this.customChoices = document.getElementById('customChoices');
        this.makeDecisionBtn = document.getElementById('makeDecisionBtn');
        this.askAgainBtn = document.getElementById('askAgainBtn');
    }

    bindEvents() {
        document.querySelectorAll('.decision-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentMode = btn.dataset.mode;
                document.querySelectorAll('.decision-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.toggleCustomOptions();
            });
        });

        if (this.makeDecisionBtn) this.makeDecisionBtn.addEventListener('click', () => this.makeDecision());
        if (this.askAgainBtn) this.askAgainBtn.addEventListener('click', () => this.makeDecision());
    }

    toggleCustomOptions() {
        if (this.currentMode === 'custom') {
            this.customOptions.classList.remove('hidden');
        } else {
            this.customOptions.classList.add('hidden');
        }
    }

    makeDecision() {
        let result, confidence;

        switch (this.currentMode) {
            case 'yesno':
                result = Math.random() > 0.5 ? 'ใช่' : 'ไม่ใช่';
                confidence = `ความมั่นใจ: ${Math.floor(Math.random() * 30) + 70}%`;
                break;

            case 'custom':
                const choices = this.customChoices.value.split(',').map(s => s.trim()).filter(s => s);
                if (choices.length === 0) {
                    this.app.showToast('กรุณากรอกตัวเลือกก่อน', 'error');
                    return;
                }
                result = choices[Math.floor(Math.random() * choices.length)];
                confidence = `เลือกจาก ${choices.length} ตัวเลือก`;
                break;

            case 'magic8':
                const magic8Responses = [
                    'แน่นอน!', 'ใช่', 'อาจจะใช่', 'ลองดูแล้วแต่',
                    'ไม่แน่ใจ', 'ถามใหม่ทีหลัง', 'ไม่น่าจะใช่', 'ไม่'
                ];
                result = magic8Responses[Math.floor(Math.random() * magic8Responses.length)];
                confidence = 'ลูกแก้วมีคำตอบ';
                break;
        }

        this.decisionResult.textContent = result;
        this.decisionConfidence.textContent = confidence;
        this.askAgainBtn.disabled = false;
        this.app.showToast('ตัดสินใจแล้ว!');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MultiToolApp();
    lucide.createIcons();
});