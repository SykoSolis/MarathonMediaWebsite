// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.messages = [];
        this.currentFilter = 'all';
        this.currentMessage = null;
        this.isLoggedIn = false;
        
        this.init();
    }
    
    init() {
        this.loadStoredMessages();
        this.bindEvents();
        this.checkLoginStatus();
        
        // Make adminPanel globally available immediately
        window.adminPanel = this;
    }
    
    bindEvents() {
        // Login form
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Reply form
        document.getElementById('replyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleReply();
        });
        
        // Cancel reply
        document.getElementById('cancelReply').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal on backdrop click
        document.getElementById('messageModal').addEventListener('click', (e) => {
            if (e.target.id === 'messageModal') {
                this.closeModal();
            }
        });
    }
    
    checkLoginStatus() {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        if (isLoggedIn) {
            this.showAdminPanel();
        } else {
            this.showLoginScreen();
        }
    }
    
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Secure login check
        const validUsername = 'admin';
        const validPassword = 'Sc00bYD00?y0u@KnowH*wW3dO';
        
        if (username === validUsername && password === validPassword) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            this.showAdminPanel();
            document.getElementById('loginError').style.display = 'none';
        } else {
            document.getElementById('loginError').style.display = 'block';
            // Clear password field
            document.getElementById('password').value = '';
        }
    }
    
    handleLogout() {
        sessionStorage.removeItem('adminLoggedIn');
        this.showLoginScreen();
    }
    
    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
        this.isLoggedIn = false;
    }
    
    showAdminPanel() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        this.isLoggedIn = true;
        this.updateStats();
        this.renderMessages();
    }
    
    loadStoredMessages() {
        const stored = localStorage.getItem('contactMessages');
        if (stored) {
            this.messages = JSON.parse(stored);
        }
    }
    
    saveMessages() {
        localStorage.setItem('contactMessages', JSON.stringify(this.messages));
    }
    
    addMessage(messageData) {
        const message = {
            id: Date.now() + Math.random(),
            ...messageData,
            timestamp: new Date().toISOString(),
            status: 'unread',
            replies: []
        };
        
        this.messages.unshift(message);
        this.saveMessages();
        
        // Log for debugging
        console.log('New message added:', message);
        
        if (this.isLoggedIn) {
            this.updateStats();
            this.renderMessages();
        }
    }
    
    updateStats() {
        const total = this.messages.length;
        const unread = this.messages.filter(m => m.status === 'unread').length;
        const replied = this.messages.filter(m => m.status === 'replied').length;
        const today = this.messages.filter(m => {
            const messageDate = new Date(m.timestamp);
            const todayDate = new Date();
            return messageDate.toDateString() === todayDate.toDateString();
        }).length;
        
        document.getElementById('totalMessages').textContent = total;
        document.getElementById('unreadMessages').textContent = unread;
        document.getElementById('repliedMessages').textContent = replied;
        document.getElementById('todayMessages').textContent = today;
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderMessages();
    }
    
    getFilteredMessages() {
        switch (this.currentFilter) {
            case 'unread':
                return this.messages.filter(m => m.status === 'unread');
            case 'replied':
                return this.messages.filter(m => m.status === 'replied');
            default:
                return this.messages;
        }
    }
    
    renderMessages() {
        const container = document.getElementById('messagesList');
        const filteredMessages = this.getFilteredMessages();
        
        if (filteredMessages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>No messages found</h3>
                    <p>There are no messages matching your current filter.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredMessages.map(message => this.renderMessageItem(message)).join('');
        
        // Add click handlers
        container.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', () => {
                const messageId = item.dataset.messageId;
                this.openMessage(messageId);
            });
        });
    }
    
    renderMessageItem(message) {
        const date = new Date(message.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const services = Array.isArray(message.services) ? message.services : [];
        const servicesHtml = services.length > 0 ? 
            `<div class="message-services">
                ${services.map(service => `<span class="service-tag">${this.formatServiceName(service)}</span>`).join('')}
            </div>` : '';
        
        return `
            <div class="message-item ${message.status}" data-message-id="${message.id}">
                <div class="message-header">
                    <div class="message-sender">
                        <div class="sender-name">${this.escapeHtml(message.name)}</div>
                        <div class="sender-email">${this.escapeHtml(message.email)}</div>
                    </div>
                    <div class="message-meta">
                        <div class="message-date">${date}</div>
                        <div class="message-status status-${message.status}">
                            ${message.status === 'unread' ? 'Unread' : 'Replied'}
                        </div>
                    </div>
                </div>
                <div class="message-preview">${this.escapeHtml(message.message).substring(0, 150)}${message.message.length > 150 ? '...' : ''}</div>
                ${servicesHtml}
            </div>
        `;
    }
    
    formatServiceName(service) {
        const serviceNames = {
            'advert-creation': 'Advert Creation',
            'running-adverts': 'Running Adverts',
            'website-creation': 'Website Creation',
            'seo': 'SEO Optimization',
            'audits': 'Marketing Audits',
            'trial': 'Trial Run'
        };
        return serviceNames[service] || service;
    }
    
    openMessage(messageId) {
        const message = this.messages.find(m => m.id == messageId);
        if (!message) return;
        
        this.currentMessage = message;
        
        // Mark as read
        if (message.status === 'unread') {
            message.status = 'read';
            this.saveMessages();
            this.updateStats();
            this.renderMessages();
        }
        
        this.renderMessageModal(message);
        document.getElementById('messageModal').style.display = 'flex';
    }
    
    renderMessageModal(message) {
        const date = new Date(message.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const services = Array.isArray(message.services) ? message.services : [];
        const servicesText = services.length > 0 ? 
            services.map(s => this.formatServiceName(s)).join(', ') : 'None specified';
        
        document.getElementById('modalTitle').textContent = `Message from ${message.name}`;
        
        document.getElementById('messageDetails').innerHTML = `
            <div class="detail-row">
                <div class="detail-label">From:</div>
                <div class="detail-value">${this.escapeHtml(message.name)} (${this.escapeHtml(message.email)})</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Company:</div>
                <div class="detail-value">${this.escapeHtml(message.company || 'Not provided')}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Website:</div>
                <div class="detail-value">${message.website ? `<a href="${this.escapeHtml(message.website)}" target="_blank" style="color: #dfc368;">${this.escapeHtml(message.website)}</a>` : 'Not provided'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Services:</div>
                <div class="detail-value">${servicesText}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Budget:</div>
                <div class="detail-value">${this.formatBudget(message.budget)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Timeline:</div>
                <div class="detail-value">${this.formatTimeline(message.timeline)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Date:</div>
                <div class="detail-value">${date}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Message:</div>
                <div class="detail-value">
                    <div class="message-content">${this.escapeHtml(message.message)}</div>
                </div>
            </div>
        `;
        
        // Set reply subject
        document.getElementById('replySubject').value = `Re: Your inquiry about ${servicesText}`;
        document.getElementById('replyMessage').value = '';
    }
    
    formatBudget(budget) {
        const budgetLabels = {
            'under-1000': 'Under $1,000',
            '1000-2500': '$1,000 - $2,500',
            '2500-5000': '$2,500 - $5,000',
            '5000-10000': '$5,000 - $10,000',
            'over-10000': 'Over $10,000'
        };
        return budgetLabels[budget] || 'Not specified';
    }
    
    formatTimeline(timeline) {
        const timelineLabels = {
            'asap': 'As soon as possible',
            '1-2-weeks': '1-2 weeks',
            '1-month': 'Within a month',
            '2-3-months': '2-3 months',
            'planning': 'Just planning ahead'
        };
        return timelineLabels[timeline] || 'Not specified';
    }
    
    async handleReply() {
        if (!this.currentMessage) return;
        
        const subject = document.getElementById('replySubject').value;
        const messageText = document.getElementById('replyMessage').value;
        
        if (!subject.trim() || !messageText.trim()) {
            this.showAlert('Please fill in both subject and message fields.', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('#replyForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate email sending (in a real application, this would call your email service)
            await this.sendEmail({
                to: this.currentMessage.email,
                subject: subject,
                message: messageText,
                originalMessage: this.currentMessage
            });
            
            // Update message status
            this.currentMessage.status = 'replied';
            this.currentMessage.replies.push({
                subject: subject,
                message: messageText,
                timestamp: new Date().toISOString()
            });
            
            this.saveMessages();
            this.updateStats();
            this.renderMessages();
            
            this.showAlert('Reply sent successfully!', 'success');
            
            // Close modal after a short delay
            setTimeout(() => {
                this.closeModal();
            }, 2000);
            
        } catch (error) {
            console.error('Error sending reply:', error);
            this.showAlert('Failed to send reply. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    async sendEmail(emailData) {
        // This is a placeholder for email sending functionality
        // In a real application, you would integrate with an email service
        
        console.log('Email would be sent:', emailData);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demonstration, we'll show the email details in console
        console.log(`
            Email Details:
            To: ${emailData.to}
            Subject: ${emailData.subject}
            Message: ${emailData.message}
            
            Original Message:
            From: ${emailData.originalMessage.name}
            Company: ${emailData.originalMessage.company}
            Message: ${emailData.originalMessage.message}
        `);
        
        // In a real implementation, you would:
        // 1. Send this data to your backend server
        // 2. Your server would use an email service (like SendGrid, Mailgun, or SMTP)
        // 3. Configure it with your GoDaddy/Outlook email settings
        
        return { success: true };
    }
    
    showAlert(message, type) {
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        const modalBody = document.querySelector('.modal-body');
        modalBody.insertBefore(alert, modalBody.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
    
    closeModal() {
        document.getElementById('messageModal').style.display = 'none';
        this.currentMessage = null;
        
        // Clear any alerts
        const alert = document.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();
