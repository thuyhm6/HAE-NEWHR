
    class TabSystem {
        constructor() {
        this.tabs = new Map();
        this.activeTabId = null;
        this.tabCounter = 0;
        this.init();
    }

        init() {
        this.bindMenuLinks();
        this.initializeDashboardTab();
        this.initializeContextMenu();
        this.bindTabSwitchEvents();
    }

        bindTabSwitchEvents() {
        // Bootstrap tab switch: re-inject scripts cho tab được kích hoạt
        document.addEventListener('shown.bs.tab', (event) => {
        const tabId = event.target.id ? event.target.id.replace('-tab', '') : null;
        if (tabId && this.tabs.has(tabId)) {
        this.activeTabId = tabId;
        this.handleTabScripts(tabId);
    }
    });
    }

        initializeDashboardTab() {
        // Create dashboard as the first tab
        const dashboardUrl = '/dashboard';
        const dashboardTitle = 'Dashboard';

        // Create dashboard tab
        const tabId = 'tab-' + (++this.tabCounter);
        const tab = {
        id: tabId,
        url: dashboardUrl,
        title: dashboardTitle,
        content: null,
        loaded: true
    };

        this.tabs.set(tabId, tab);
        this.createDashboardTabElement(tab);
        this.activateTab(tabId);
    }

        createDashboardTabElement(tab) {
        const tabList = document.getElementById('tab-list');
        const tabNav = document.getElementById('tab-navigation');

        // Show tab navigation
        tabNav.style.display = 'block';

        // Hide default content
        const defaultContent = document.getElementById('default-content');
        if (defaultContent) {
        defaultContent.classList.remove('active');
    }

        // Create tab element
        const tabElement = document.createElement('li');
        tabElement.className = 'nav-item';
        const closeButton = this.tabs.size > 1 ? `<span class="tab-close" onclick="tabSystem.closeTab('${tab.id}')" title="Đóng tab">
                            <i class="bx bx-x"></i>
                        </span>` : '';
        tabElement.innerHTML = `
                        <a class="nav-link" id="${tab.id}-tab" data-bs-toggle="tab" href="#${tab.id}" role="tab">
                            ${tab.title}
                            ${closeButton}
                        </a>
                    `;

        tabList.appendChild(tabElement);

        // Create content pane with current dashboard content
        const contentArea = document.getElementById('tab-content-area');
        const contentPane = document.createElement('div');
        contentPane.className = 'tab-pane active';
        contentPane.id = tab.id;

        // Move default content to this tab (using DOM node move to avoid duplicate IDs)
        const defaultContentDiv = document.getElementById('default-content');
        if (defaultContentDiv) {
            while (defaultContentDiv.firstChild) {
                contentPane.appendChild(defaultContentDiv.firstChild);
            }
            defaultContentDiv.style.display = 'none';
        }

        contentArea.appendChild(contentPane);
    }

        initializeContextMenu() {
        // Create context menu element
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'tab-context-menu';
        this.contextMenu.innerHTML = `
                        <div class="menu-item" data-action="close">
                            <i class="bx bx-x"></i> Đóng tab
                        </div>
                        <div class="menu-item" data-action="close-left">
                            <i class="bx bx-chevron-left"></i> Đóng tab bên trái
                        </div>
                        <div class="menu-item" data-action="close-right">
                            <i class="bx bx-chevron-right"></i> Đóng tab bên phải
                        </div>
                        <div class="menu-item danger" data-action="close-all">
                            <i class="bx bx-x-circle"></i> Đóng toàn bộ tab
                        </div>
                    `;
        document.body.appendChild(this.contextMenu);

        // Bind context menu events
        this.bindContextMenuEvents();
    }

        bindContextMenuEvents() {
        // Right click on tab
        document.addEventListener('contextmenu', (e) => {
        const tabLink = e.target.closest('#tab-list .nav-link');
        if (tabLink) {
        e.preventDefault();
        this.showContextMenu(e, tabLink);
    }
    });

        // Click on context menu items
        this.contextMenu.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.menu-item');
        if (menuItem) {
        const action = menuItem.getAttribute('data-action');
        this.handleContextMenuAction(action);
        this.hideContextMenu();
    }
    });

        // Click outside to hide context menu
        document.addEventListener('click', (e) => {
        if (!this.contextMenu.contains(e.target)) {
        this.hideContextMenu();
    }
    });
    }

        showContextMenu(e, tabLink) {
        const tabId = tabLink.id.replace('-tab', '');
        this.currentContextTabId = tabId;

        // Position context menu
        this.contextMenu.style.left = e.pageX + 'px';
        this.contextMenu.style.top = e.pageY + 'px';
        this.contextMenu.classList.add('show');

        // Update menu items based on tab position
        this.updateContextMenuItems(tabId);
    }

        updateContextMenuItems(tabId) {
        const tabList = document.getElementById('tab-list');
        const tabs = Array.from(tabList.children);
        const currentIndex = tabs.findIndex(tab => tab.querySelector('.nav-link').id === tabId + '-tab');

        // Enable/disable menu items based on tab position
        const closeLeftItem = this.contextMenu.querySelector('[data-action="close-left"]');
        const closeRightItem = this.contextMenu.querySelector('[data-action="close-right"]');
        const closeAllItem = this.contextMenu.querySelector('[data-action="close-all"]');

        // Close left - only enable if there are tabs to the left
        if (currentIndex > 0) {
        closeLeftItem.style.display = 'flex';
    } else {
        closeLeftItem.style.display = 'none';
    }

        // Close right - only enable if there are tabs to the right
        if (currentIndex < tabs.length - 1) {
        closeRightItem.style.display = 'flex';
    } else {
        closeRightItem.style.display = 'none';
    }

        // Close all - only enable if there are multiple tabs
        if (tabs.length > 1) {
        closeAllItem.style.display = 'flex';
    } else {
        closeAllItem.style.display = 'none';
    }
    }

        hideContextMenu() {
        this.contextMenu.classList.remove('show');
    }

        handleContextMenuAction(action) {
        const tabId = this.currentContextTabId;
        const tabList = document.getElementById('tab-list');
        const tabs = Array.from(tabList.children);
        const currentIndex = tabs.findIndex(tab => tab.querySelector('.nav-link').id === tabId + '-tab');

        switch (action) {
        case 'close':
        this.closeTab(tabId);
        break;
        case 'close-left':
        // Close all tabs to the left
        for (let i = 0; i < currentIndex; i++) {
        const tab = tabs[i];
        const tabIdToClose = tab.querySelector('.nav-link').id.replace('-tab', '');
        this.closeTab(tabIdToClose);
    }
        break;
        case 'close-right':
        // Close all tabs to the right
        for (let i = currentIndex + 1; i < tabs.length; i++) {
        const tab = tabs[i];
        const tabIdToClose = tab.querySelector('.nav-link').id.replace('-tab', '');
        this.closeTab(tabIdToClose);
    }
        break;
        case 'close-all':
        // Close all tabs except current
        const allTabIds = Array.from(this.tabs.keys());
        for (const id of allTabIds) {
        if (id !== tabId) {
        this.closeTab(id);
    }
    }
        break;
    }
    }

        bindMenuLinks() {
        // Bind all menu links with data-tab attribute
        document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-tab]');
        if (link) {
        e.preventDefault();
        const url = link.getAttribute('href') || link.getAttribute('data-tab');
        const title = link.getAttribute('data-title') || link.textContent.trim();
        this.openTab(url, title);
    }
    });
    }

        openTab(url, title) {
        // Check if tab already exists
        const existingTab = this.findTabByUrl(url);
        if (existingTab) {
        this.activateTab(existingTab.id);
        return;
    }

        // Create new tab
        const tabId = 'tab-' + (++this.tabCounter);
        const tab = {
        id: tabId,
        url: url,
        title: title,
        content: null,
        loaded: false
    };

        this.tabs.set(tabId, tab);
        this.createTabElement(tab);
        this.loadTabContent(tab);
        this.activateTab(tabId);
        this.updateCloseButtons();
    }

        findTabByUrl(url) {
        for (let [id, tab] of this.tabs) {
        if (tab.url === url) {
        return tab;
    }
    }
        return null;
    }

        createTabElement(tab) {
        const tabList = document.getElementById('tab-list');
        const tabNav = document.getElementById('tab-navigation');

        // Show tab navigation if hidden
        if (tabNav.style.display === 'none') {
        tabNav.style.display = 'block';
    }

        // Hide default content
        const defaultContent = document.getElementById('default-content');
        if (defaultContent) {
        defaultContent.classList.remove('active');
    }

        // Create tab element
        const tabElement = document.createElement('li');
        tabElement.className = 'nav-item';
        const closeButton = this.tabs.size > 1 ? `<span class="tab-close" onclick="tabSystem.closeTab('${tab.id}')" title="Đóng tab">
                            <i class="bx bx-x"></i>
                        </span>` : '';
        tabElement.innerHTML = `
                        <a class="nav-link" id="${tab.id}-tab" data-bs-toggle="tab" href="#${tab.id}" role="tab">
                            ${tab.title}
                            ${closeButton}
                        </a>
                    `;

        tabList.appendChild(tabElement);

        // Create content pane
        const contentArea = document.getElementById('tab-content-area');
        const contentPane = document.createElement('div');
        contentPane.className = 'tab-pane';
        contentPane.id = tab.id;
        contentPane.innerHTML = '<div class="tab-loading">Đang tải...</div>';

        contentArea.appendChild(contentPane);
    }

        loadTabContent(tab) {
        fetch(tab.url, {
        method: 'GET',
        headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/html'
    }
    })
        .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
    }
        return response.text();
    })
        .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('[th\\:fragment="content"]') ||
        doc.querySelector('.container-fluid') ||
        doc.body;

        tab.content = content.innerHTML;
        tab.loaded = true;

        // Lưu nội dung fragment scripts từ doc gốc để inject đáng tin cậy
        const docFragmentScripts = doc.querySelector('#fragmentScripts');
        if (docFragmentScripts) {
        tab.fragmentScriptsHTML = docFragmentScripts.innerHTML;
    }

        const contentPane = document.getElementById(tab.id);
        if (contentPane) {
        contentPane.innerHTML = tab.content;
    }

        // Chỉ inject scripts nếu tab này đang được hiển thị
        if (this.activeTabId === tab.id) {
        this.handleTabScripts(tab.id);
    }
    })
        .catch(error => {
        console.error('Error loading tab content:', error);
        const contentPane = document.getElementById(tab.id);
        if (contentPane) {
        contentPane.innerHTML = '<div class="alert alert-danger">Lỗi tải nội dung: ' + error.message + '</div>';
    }
    });
    }

        activateTab(tabId) {
        // Update active tab
        this.activeTabId = tabId;

        // Update tab navigation
        document.querySelectorAll('#tab-list .nav-link').forEach(link => {
        link.classList.remove('active');
    });

        const activeLink = document.getElementById(tabId + '-tab');
        if (activeLink) {
        activeLink.classList.add('active');
    }

        // Chỉ xóa active của các outer tab pane (direct children của #tab-content-area)
        // để tránh xóa nhầm inner tab pane bên trong mỗi trang
        const contentArea = document.getElementById('tab-content-area');
        if (contentArea) {
        Array.from(contentArea.children).forEach(pane => {
        pane.classList.remove('active');
    });
    }

        const activePane = document.getElementById(tabId);
        if (activePane) {
        activePane.classList.add('active');

        // Handle scripts for active tab
        this.handleTabScripts(tabId);
    }
    }

        handleTabScripts(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab || !tab.loaded) return;

        // Clear previous dynamic scripts
        const dynamicScripts = document.getElementById('dynamic-scripts');
        if (dynamicScripts) {
        dynamicScripts.innerHTML = '';
    }

        // Tìm scripts: ưu tiên HTML đã lưu từ doc gốc (đáng tin nhất), fallback live DOM
        let scripts = [];
        let styles  = [];

        if (tab.fragmentScriptsHTML) {
        const tempDoc = new DOMParser().parseFromString(tab.fragmentScriptsHTML, 'text/html');
        scripts = Array.from(tempDoc.querySelectorAll('script'));
        styles  = Array.from(tempDoc.querySelectorAll('style'));
    }

        // Fallback: thử lấy từ live DOM
        if (scripts.length === 0) {
        const activePane = document.getElementById(tabId);
        if (activePane) {
        const fragmentScripts = activePane.querySelector('#fragmentScripts');
        if (fragmentScripts && fragmentScripts.innerHTML) {
        const tempDoc = new DOMParser().parseFromString(fragmentScripts.innerHTML, 'text/html');
        scripts = Array.from(tempDoc.querySelectorAll('script'));
        styles  = Array.from(tempDoc.querySelectorAll('style'));
    }
    }
    }

        if (scripts.length === 0) return;

        // Inject tab URL so fragment scripts can read query params
        const urlVarScript = document.createElement('script');
        urlVarScript.textContent = 'window._currentTabUrl = ' + JSON.stringify(tab.url) + '; window._currentTabId = ' + JSON.stringify(tabId) + ';';
        if (dynamicScripts) {
        dynamicScripts.appendChild(urlVarScript);
    }

        styles.forEach(style => {
        const newStyle = document.createElement('style');
        newStyle.textContent = style.textContent;
        if (dynamicScripts) {
        dynamicScripts.appendChild(newStyle);
    }
    });

        scripts.forEach(script => {
        const newScript = document.createElement('script');

        // Copy all attributes
        Array.from(script.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
    });

        // Copy script content
        newScript.textContent = script.textContent;

        // Append to dynamic-scripts
        if (dynamicScripts) {
        dynamicScripts.appendChild(newScript);
    }
    });

        console.log('Scripts activated for tab:', tabId, 'Count:', scripts.length);
    }

        closeTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) return;

        // Don't allow closing the last tab (dashboard)
        if (this.tabs.size <= 1) {
        return;
    }

        // Remove tab element
        const tabElement = document.getElementById(tabId + '-tab').parentElement;
        if (tabElement) {
        tabElement.remove();
    }

        // Remove content pane
        const contentPane = document.getElementById(tabId);
        if (contentPane) {
        contentPane.remove();
    }

        // Remove from tabs map
        this.tabs.delete(tabId);

        // If this was the active tab, activate another tab
        if (this.activeTabId === tabId) {
        if (this.tabs.size > 0) {
        // Activate the last remaining tab
        const remainingTabs = Array.from(this.tabs.keys());
        this.activateTab(remainingTabs[remainingTabs.length - 1]);
    } else {
        // Show default content
        this.showDefaultContent();
    }
    }
    }

        updateCloseButtons() {
        // Close buttons are now controlled by CSS hover
        // No need to manually show/hide them
        // CSS handles the visibility based on hover and tab count
    }

        showDefaultContent() {
        // Hide tab navigation
        const tabNav = document.getElementById('tab-navigation');
        if (tabNav) {
        tabNav.style.display = 'none';
    }

        // Show default content
        const defaultContent = document.getElementById('default-content');
        if (defaultContent) {
        defaultContent.style.display = 'block';
        defaultContent.classList.add('active');
    }

        // Chỉ ẩn các outer tab pane (direct children của #tab-content-area)
        const contentArea = document.getElementById('tab-content-area');
        if (contentArea) {
        Array.from(contentArea.children).forEach(pane => {
        if (pane.id !== 'default-content') {
        pane.classList.remove('active');
    }
    });
    }
    }
}

// Initialize tab system
const tabSystem = new TabSystem();
