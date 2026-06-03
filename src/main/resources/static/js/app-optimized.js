/**
 * =====================================================
 * OPTIMIZED JAVASCRIPT FOR HR-11 FRONTEND
 * =====================================================
 */

// =====================================================
// 1. MODULE PATTERN IMPLEMENTATION
// =====================================================
const HRApp = (function() {
    'use strict';
    
    // Private variables
    let isInitialized = false;
    let config = {
        apiBaseUrl: '/api',
        timeout: 30000,
        retryAttempts: 3,
        cacheEnabled: true,
        debugMode: false
    };
    
    // Cache object for API responses
    const cache = new Map();
    
    // =====================================================
    // 2. UTILITY FUNCTIONS
    // =====================================================
    
    /**
     * Debounce function to limit function calls
     */
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }
    
    /**
     * Throttle function to limit function calls
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Format date for display
     */
    function formatDate(date, format = 'dd/mm/yyyy') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        switch (format) {
            case 'dd/mm/yyyy':
                return `${day}/${month}/${year}`;
            case 'yyyy-mm-dd':
                return `${year}-${month}-${day}`;
            case 'dd-mm-yyyy':
                return `${day}-${month}-${year}`;
            default:
                return d.toLocaleDateString();
        }
    }
    
    /**
     * Format currency for display
     */
    function formatCurrency(amount, currency = 'VND') {
        if (amount === null || amount === undefined) return '';
        
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    /**
     * Show loading spinner
     */
    function showLoading(element = document.body) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Đang tải...</span>
            </div>
        `;
        element.appendChild(spinner);
        return spinner;
    }
    
    /**
     * Hide loading spinner
     */
    function hideLoading(spinner) {
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }
    
    /**
     * Show notification
     */
    function showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        const messageContainer = document.createElement('span');
        messageContainer.textContent = message == null ? '' : String(message);

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.setAttribute('data-bs-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');

        notification.appendChild(messageContainer);
        notification.appendChild(closeButton);
        
        document.body.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    }

    /**
     * Resolve CSRF token from meta tag or hidden input
     */
    function getCsrfToken() {
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            const value = metaToken.getAttribute('content');
            if (value) return value;
        }
        const inputToken = document.querySelector('input[name="_csrf_token"]');
        return inputToken ? inputToken.value : null;
    }
    
    // =====================================================
    // 3. API CLIENT
    // =====================================================
    
    /**
     * API Client with retry logic and caching
     */
    const ApiClient = {
        /**
         * Make HTTP request with retry logic
         */
        async request(url, options = {}) {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                timeout: config.timeout
            };
            
            const requestOptions = { ...defaultOptions, ...options };
            const method = String(requestOptions.method || 'GET').toUpperCase();
            if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
                const csrfToken = getCsrfToken();
                if (csrfToken) {
                    requestOptions.headers = {
                        ...requestOptions.headers,
                        'X-CSRF-TOKEN': csrfToken
                    };
                }
            }
            const cacheKey = `${requestOptions.method}:${url}:${JSON.stringify(requestOptions.body || '')}`;
            
            // Check cache for GET requests
            if (config.cacheEnabled && requestOptions.method === 'GET' && cache.has(cacheKey)) {
                if (config.debugMode) console.log('Cache hit:', cacheKey);
                return cache.get(cacheKey);
            }
            
            let lastError;
            for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
                try {
                    if (config.debugMode) console.log(`API Request (attempt ${attempt}):`, url, requestOptions);
                    
                    const response = await fetch(url, requestOptions);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    
                    // Cache successful GET responses
                    if (config.cacheEnabled && requestOptions.method === 'GET') {
                        cache.set(cacheKey, data);
                    }
                    
                    return data;
                    
                } catch (error) {
                    lastError = error;
                    if (config.debugMode) console.error(`API Request failed (attempt ${attempt}):`, error);
                    
                    if (attempt < config.retryAttempts) {
                        // Exponential backoff
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                    }
                }
            }
            
            throw lastError;
        },
        
        /**
         * GET request
         */
        async get(url, params = {}) {
            const urlParams = new URLSearchParams(params);
            const fullUrl = urlParams.toString() ? `${url}?${urlParams}` : url;
            return this.request(fullUrl);
        },
        
        /**
         * POST request
         */
        async post(url, data = {}) {
            return this.request(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        
        /**
         * PUT request
         */
        async put(url, data = {}) {
            return this.request(url, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },
        
        /**
         * DELETE request
         */
        async delete(url) {
            return this.request(url, {
                method: 'DELETE'
            });
        }
    };
    
    // =====================================================
    // 4. FORM HANDLING
    // =====================================================
    
    const FormHandler = {
        /**
         * Initialize form with validation
         */
        init(formSelector) {
            const form = document.querySelector(formSelector);
            if (!form) return;
            
            // Add CSRF token if available
            const csrfToken = document.querySelector('meta[name="csrf-token"]');
            if (csrfToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_csrf_token';
                csrfInput.value = csrfToken.getAttribute('content');
                form.appendChild(csrfInput);
            }
            
            // Add form validation
            form.addEventListener('submit', this.handleSubmit.bind(this));
            
            // Add real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', this.validateField.bind(this));
                input.addEventListener('input', debounce(this.validateField.bind(this), 300));
            });
        },
        
        /**
         * Handle form submission
         */
        async handleSubmit(event) {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Validate form
            if (!this.validateForm(form)) {
                showNotification('Vui lòng kiểm tra lại thông tin đã nhập', 'danger');
                return;
            }
            
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';
            
            try {
                const response = await ApiClient.post(form.action, data);
                
                if (response.success) {
                    showNotification(response.message || 'Thành công', 'success');
                    form.reset();
                    // Trigger custom event
                    form.dispatchEvent(new CustomEvent('form:success', { detail: response }));
                } else {
                    showNotification(response.message || 'Có lỗi xảy ra', 'danger');
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                showNotification('Có lỗi xảy ra khi gửi form', 'danger');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        },
        
        /**
         * Validate form
         */
        validateForm(form) {
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField({ target: input })) {
                    isValid = false;
                }
            });
            
            return isValid;
        },
        
        /**
         * Validate individual field
         */
        validateField(event) {
            const field = event.target;
            const value = field.value.trim();
            const type = field.type;
            const required = field.hasAttribute('required');
            
            // Remove existing error classes
            field.classList.remove('is-invalid');
            const errorElement = field.parentNode.querySelector('.invalid-feedback');
            if (errorElement) {
                errorElement.remove();
            }
            
            // Required validation
            if (required && !value) {
                this.showFieldError(field, 'Trường này là bắt buộc');
                return false;
            }
            
            // Type-specific validation
            if (value) {
                switch (type) {
                    case 'email':
                        if (!this.isValidEmail(value)) {
                            this.showFieldError(field, 'Email không hợp lệ');
                            return false;
                        }
                        break;
                    case 'tel':
                        if (!this.isValidPhone(value)) {
                            this.showFieldError(field, 'Số điện thoại không hợp lệ');
                            return false;
                        }
                        break;
                    case 'url':
                        if (!this.isValidUrl(value)) {
                            this.showFieldError(field, 'URL không hợp lệ');
                            return false;
                        }
                        break;
                }
                
                // Length validation
                const minLength = field.getAttribute('minlength');
                const maxLength = field.getAttribute('maxlength');
                
                if (minLength && value.length < parseInt(minLength)) {
                    this.showFieldError(field, `Tối thiểu ${minLength} ký tự`);
                    return false;
                }
                
                if (maxLength && value.length > parseInt(maxLength)) {
                    this.showFieldError(field, `Tối đa ${maxLength} ký tự`);
                    return false;
                }
            }
            
            field.classList.add('is-valid');
            return true;
        },
        
        /**
         * Show field error
         */
        showFieldError(field, message) {
            field.classList.add('is-invalid');
            
            const errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            errorElement.textContent = message;
            
            field.parentNode.appendChild(errorElement);
        },
        
        /**
         * Validation helpers
         */
        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        
        isValidPhone(phone) {
            return /^(\+84|84|0)[0-9]{9,10}$/.test(phone);
        },
        
        isValidUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }
    };
    
    // =====================================================
    // 5. TABLE HANDLING
    // =====================================================
    
    const TableHandler = {
        /**
         * Initialize table with sorting and filtering
         */
        init(tableSelector) {
            const table = document.querySelector(tableSelector);
            if (!table) return;
            
            // Add sorting functionality
            const headers = table.querySelectorAll('th[data-sort]');
            headers.forEach(header => {
                header.style.cursor = 'pointer';
                header.addEventListener('click', this.sortTable.bind(this, table, header));
            });
            
            // Add search functionality
            const searchInput = document.querySelector(`${tableSelector}-search`);
            if (searchInput) {
                searchInput.addEventListener('input', debounce(this.filterTable.bind(this, table), 300));
            }
        },
        
        /**
         * Sort table by column
         */
        sortTable(table, header) {
            const column = header.getAttribute('data-sort');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const isAscending = header.classList.contains('sort-asc');
            
            // Remove existing sort classes
            table.querySelectorAll('th').forEach(th => {
                th.classList.remove('sort-asc', 'sort-desc');
            });
            
            // Add new sort class
            header.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
            
            // Sort rows
            rows.sort((a, b) => {
                const aValue = a.querySelector(`[data-sort="${column}"]`)?.textContent || '';
                const bValue = b.querySelector(`[data-sort="${column}"]`)?.textContent || '';
                
                if (isAscending) {
                    return bValue.localeCompare(aValue);
                } else {
                    return aValue.localeCompare(bValue);
                }
            });
            
            // Reorder rows
            rows.forEach(row => tbody.appendChild(row));
        },
        
        /**
         * Filter table rows
         */
        filterTable(table, event) {
            const searchTerm = event.target.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
    };
    
    // =====================================================
    // 6. PUBLIC API
    // =====================================================
    
    return {
        /**
         * Initialize the application
         */
        init(options = {}) {
            if (isInitialized) return;
            
            config = { ...config, ...options };
            
            // Initialize components
            this.initForms();
            this.initTables();
            this.initEventListeners();
            
            isInitialized = true;
            console.log('HR App initialized successfully');
        },
        
        /**
         * Initialize forms
         */
        initForms() {
            document.querySelectorAll('form[data-validate]').forEach(form => {
                FormHandler.init(`#${form.id}`);
            });
        },
        
        /**
         * Initialize tables
         */
        initTables() {
            document.querySelectorAll('table[data-sortable]').forEach(table => {
                TableHandler.init(`#${table.id}`);
            });
        },
        
        /**
         * Initialize event listeners
         */
        initEventListeners() {
            // Global error handling
            window.addEventListener('error', (event) => {
                console.error('Global error:', event.error);
                showNotification('Có lỗi xảy ra trong ứng dụng', 'danger');
            });
            
            // Unhandled promise rejection
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
                showNotification('Có lỗi xảy ra trong ứng dụng', 'danger');
            });
        },
        
        /**
         * Configuration
         */
        config,
        
        /**
         * API Client
         */
        api: ApiClient,
        
        /**
         * Utility functions
         */
        utils: {
            debounce,
            throttle,
            formatDate,
            formatCurrency,
            showLoading,
            hideLoading,
            showNotification
        },
        
        /**
         * Clear cache
         */
        clearCache() {
            cache.clear();
            console.log('Cache cleared');
        }
    };
})();

// =====================================================
// 7. INITIALIZE WHEN DOM IS READY
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    HRApp.init({
        debugMode: window.location.hostname === 'localhost'
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HRApp;
}
