/**
 * =====================================================
 * LAZY LOADING IMPLEMENTATION FOR HR-11
 * =====================================================
 */

class LazyLoader {
    constructor(options = {}) {
        this.options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1,
            loadingClass: 'lazy-loading',
            loadedClass: 'lazy-loaded',
            errorClass: 'lazy-error',
            ...options
        };
        
        this.observer = null;
        this.elements = new Set();
        this.init();
    }
    
    /**
     * Initialize Intersection Observer
     */
    init() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.loadAllElements();
            return;
        }
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.options
        );
        
        // Observe all lazy elements
        this.observeElements();
    }
    
    /**
     * Observe all lazy elements
     */
    observeElements() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(element => {
            this.observeElement(element);
        });
    }
    
    /**
     * Observe a single element
     */
    observeElement(element) {
        if (this.elements.has(element)) return;
        
        element.classList.add(this.options.loadingClass);
        this.elements.add(element);
        this.observer.observe(element);
    }
    
    /**
     * Handle intersection callback
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadElement(entry.target);
                this.unobserveElement(entry.target);
            }
        });
    }
    
    /**
     * Load element content
     */
    async loadElement(element) {
        try {
            const lazyType = element.getAttribute('data-lazy');
            
            switch (lazyType) {
                case 'image':
                    await this.loadImage(element);
                    break;
                case 'iframe':
                    await this.loadIframe(element);
                    break;
                case 'content':
                    await this.loadContent(element);
                    break;
                case 'component':
                    await this.loadComponent(element);
                    break;
                default:
                    console.warn('Unknown lazy type:', lazyType);
            }
            
            element.classList.remove(this.options.loadingClass);
            element.classList.add(this.options.loadedClass);
            
        } catch (error) {
            console.error('Lazy loading error:', error);
            element.classList.remove(this.options.loadingClass);
            element.classList.add(this.options.errorClass);
        }
    }
    
    /**
     * Load image
     */
    async loadImage(element) {
        const src = element.getAttribute('data-src');
        const srcset = element.getAttribute('data-srcset');
        const sizes = element.getAttribute('data-sizes');
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                if (src) element.src = src;
                if (srcset) element.srcset = srcset;
                if (sizes) element.sizes = sizes;
                
                element.removeAttribute('data-src');
                element.removeAttribute('data-srcset');
                element.removeAttribute('data-sizes');
                
                resolve();
            };
            
            img.onerror = reject;
            
            if (src) img.src = src;
            if (srcset) img.srcset = srcset;
            if (sizes) img.sizes = sizes;
        });
    }
    
    /**
     * Load iframe
     */
    async loadIframe(element) {
        const src = element.getAttribute('data-src');
        
        return new Promise((resolve) => {
            element.src = src;
            element.removeAttribute('data-src');
            
            element.onload = resolve;
            element.onerror = resolve;
        });
    }
    
    /**
     * Load content via AJAX
     */
    async loadContent(element) {
        const url = element.getAttribute('data-src');
        const safeUrl = this.resolveUrl(url);
        if (!safeUrl || safeUrl.origin !== window.location.origin) {
            throw new Error('Only same-origin content URLs are allowed');
        }
        
        try {
            const response = await fetch(safeUrl.toString());
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const content = await response.text();
            element.innerHTML = content;
            element.removeAttribute('data-src');

            // Script tags bên trong innerHTML không tự thực thi — phải re-create để kích hoạt
            element.querySelectorAll('script').forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr =>
                    newScript.setAttribute(attr.name, attr.value)
                );
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

        } catch (error) {
            throw new Error(`Failed to load content from ${url}: ${error.message}`);
        }
    }
    
    /**
     * Load component dynamically
     */
    async loadComponent(element) {
        const componentName = element.getAttribute('data-component');
        const componentUrl = element.getAttribute('data-src');
        
        if (!componentName) {
            throw new Error('Component name is required');
        }
        
        try {
            // Load component script if not already loaded
            if (!window[componentName]) {
                await this.loadScript(componentUrl);
            }
            
            // Initialize component
            const ComponentClass = window[componentName];
            if (typeof ComponentClass === 'function') {
                const component = new ComponentClass(element);
                element._component = component;
            }
            
            element.removeAttribute('data-src');
            element.removeAttribute('data-component');
            
        } catch (error) {
            throw new Error(`Failed to load component ${componentName}: ${error.message}`);
        }
    }
    
    /**
     * Load script dynamically
     */
    loadScript(url) {
        const safeUrl = this.resolveUrl(url);
        if (!safeUrl || safeUrl.origin !== window.location.origin) {
            return Promise.reject(new Error('Only same-origin script URLs are allowed'));
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = safeUrl.toString();
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    resolveUrl(url) {
        try {
            return new URL(url, window.location.origin);
        } catch {
            return null;
        }
    }
    
    /**
     * Unobserve element
     */
    unobserveElement(element) {
        if (this.observer && this.elements.has(element)) {
            this.observer.unobserve(element);
            this.elements.delete(element);
        }
    }
    
    /**
     * Load all elements (fallback for older browsers)
     */
    loadAllElements() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(element => {
            element.classList.add(this.options.loadingClass);
            this.loadElement(element);
        });
    }
    
    /**
     * Destroy observer
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.elements.clear();
    }
}

/**
 * =====================================================
 * LAZY LOADING COMPONENTS
 * =====================================================
 */

/**
 * Lazy Image Component
 */
class LazyImage {
    constructor(element) {
        this.element = element;
        this.init();
    }
    
    init() {
        // Add loading placeholder
        this.addPlaceholder();
        
        // Add error handling
        this.element.addEventListener('error', this.handleError.bind(this));
        this.element.addEventListener('load', this.handleLoad.bind(this));
    }
    
    addPlaceholder() {
        if (!this.element.src) {
            this.element.style.backgroundColor = '#f0f0f0';
            this.element.style.backgroundImage = `
                linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%),
                url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="12">Loading...</text></svg>')
            `;
            this.element.style.backgroundSize = '200px 100%, cover';
            this.element.style.backgroundPosition = '200% 0, center';
            this.element.style.animation = 'shimmer 1.5s infinite';
        }
    }
    
    handleError() {
        this.element.style.backgroundImage = `
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f8f9fa"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236c757d" font-family="Arial" font-size="10">Image Error</text></svg>')
        `;
        this.element.style.backgroundSize = 'cover';
        this.element.style.backgroundPosition = 'center';
        this.element.classList.add('lazy-error');
    }
    
    handleLoad() {
        this.element.style.animation = '';
        this.element.style.backgroundImage = '';
        this.element.style.backgroundColor = '';
        this.element.classList.add('lazy-loaded');
    }
}

/**
 * Lazy Table Component
 */
class LazyTable {
    constructor(element) {
        this.element = element;
        this.currentPage = 1;
        this.isLoading = false;
        this.init();
    }
    
    init() {
        this.createLoadMoreButton();
        this.bindEvents();
    }
    
    createLoadMoreButton() {
        const button = document.createElement('button');
        button.className = 'btn btn-primary mt-3';
        button.textContent = 'Tải thêm dữ liệu';
        button.id = 'load-more-btn';
        
        const container = this.element.parentNode;
        container.appendChild(button);
    }
    
    bindEvents() {
        const button = document.getElementById('load-more-btn');
        if (button) {
            button.addEventListener('click', this.loadMore.bind(this));
        }
    }
    
    async loadMore() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const button = document.getElementById('load-more-btn');
        const originalText = button.textContent;
        button.textContent = 'Đang tải...';
        button.disabled = true;
        
        try {
            const url = this.element.getAttribute('data-url');
            const response = await fetch(`${url}?page=${this.currentPage + 1}`);
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                this.appendRows(data.data);
                this.currentPage++;
                
                if (data.data.length < 10) { // Assuming 10 items per page
                    button.style.display = 'none';
                }
            } else {
                button.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error loading more data:', error);
        } finally {
            this.isLoading = false;
            button.textContent = originalText;
            button.disabled = false;
        }
    }
    
    appendRows(data) {
        const tbody = this.element.querySelector('tbody');
        if (!tbody) return;
        
        data.forEach(item => {
            const row = this.createRow(item);
            tbody.appendChild(row);
        });
    }
    
    createRow(item) {
        const row = document.createElement('tr');
        // Implement row creation based on your data structure
        return row;
    }
}

/**
 * Lazy Chart Component
 */
class LazyChart {
    constructor(element) {
        this.element = element;
        this.chart = null;
        this.init();
    }
    
    async init() {
        // Load Chart.js if not already loaded
        if (!window.Chart) {
            await this.loadChartJS();
        }
        
        this.renderChart();
    }
    
    loadChartJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/assets/js/chart.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    renderChart() {
        const ctx = this.element.getContext('2d');
        const data = JSON.parse(this.element.getAttribute('data-chart-data'));
        const type = this.element.getAttribute('data-chart-type') || 'line';
        
        this.chart = new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

/**
 * =====================================================
 * CSS FOR LAZY LOADING
 * =====================================================
 */
const lazyLoadingCSS = `
    @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    
    .lazy-loading {
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .lazy-loaded {
        opacity: 1;
        transition: opacity 0.3s ease;
    }
    
    .lazy-error {
        opacity: 0.5;
        background-color: #f8f9fa;
    }
    
    .lazy-placeholder {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = lazyLoadingCSS;
document.head.appendChild(style);

/**
 * =====================================================
 * GLOBAL LAZY LOADER INSTANCE
 * =====================================================
 */
window.LazyLoader = LazyLoader;
window.LazyImage = LazyImage;
window.LazyTable = LazyTable;
window.LazyChart = LazyChart;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.lazyLoader = new LazyLoader({
        rootMargin: '100px',
        threshold: 0.1
    });
});
