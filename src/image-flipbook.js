/**
 * ImageFlipbook - Zero-dependency JavaScript library for smooth image sequence viewing
 * with fullscreen navigation
 * 
 * @version 1.1.0
 * @author Rich Curry (Curbob)
 * @license MIT
 */

class ImageFlipbook {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            container: options.container || '#flipbook-container',
            pages: options.pages || [],
            pagePattern: options.pagePattern || null,
            totalPages: options.totalPages || null,
            currentPage: options.startPage || 1,
            theme: options.theme || 'default',
            chapters: options.chapters || [],
            chapterStyle: options.chapterStyle || 'buttons',
            chapterPosition: options.chapterPosition || 'bottom',
            fullscreenEnabled: options.fullscreenEnabled !== false,
            socialSharing: options.socialSharing || false,
            title: options.title || 'Image Flipbook',
            allowDualPage: options.allowDualPage !== false, // Default: allow dual page
            imageFit: options.imageFit || 'contain', // contain, cover, fill
            ...options
        };
        
        this.currentPage = this.config.currentPage;
        this.totalPages = this.config.totalPages || this.config.pages.length;
        this.container = null;
        
        // Page display mode - smart defaults based on screen size
        this.pageMode = this.loadPageMode();
        
        this.init();
    }
    
    init() {
        this.container = typeof this.config.container === 'string' 
            ? document.querySelector(this.config.container)
            : this.config.container;
            
        if (!this.container) {
            throw new Error(`Container not found: ${this.config.container}`);
        }
        
        // Ensure pageMode is set before rendering
        if (!this.pageMode) {
            this.pageMode = this.loadPageMode();
        }
        
        this.render();
        this.bindEvents();
        this.loadPage(this.currentPage);
    }
    
    render() {
        this.container.innerHTML = `
            <div class="flipbook-wrapper" data-theme="${this.config.theme}">
                <div class="flipbook-header">
                    <h1 class="flipbook-title">${this.config.title}</h1>
                </div>
                
                <div class="flipbook-viewer">
                    <div class="page-display" id="page-display">
                        <div class="loading">Loading...</div>
                    </div>
                </div>
                
                <div class="flipbook-controls">
                    <div class="nav-controls">
                        <button class="nav-button" id="prev-btn">← Prev</button>
                        
                        <span class="page-info">
                            Page <input type="number" id="page-input" min="1" max="${this.totalPages}" value="${this.currentPage}"> 
                            of ${this.totalPages}
                        </span>
                        
                        <button class="nav-button" id="next-btn">Next →</button>
                        
                        ${this.config.allowDualPage ? `
                        <div class="page-mode-toggle" title="Choose your reading view">
                            <span class="toggle-label">View:</span>
                            <button class="toggle-btn ${this.pageMode === 'single' ? 'active' : ''}" id="single-page-btn">1 Page</button>
                            <button class="toggle-btn ${this.pageMode === 'dual' ? 'active' : ''}" id="dual-page-btn">2 Pages</button>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${this.renderChapters()}
                    ${this.renderSocialButtons()}
                </div>
            </div>
        `;
        
        this.injectCSS();
    }
    
    renderChapters() {
        if (!this.config.chapters.length) return '';
        
        const chapters = this.config.chapters.map(chapter => 
            `<button class="nav-button chapter-btn" onclick="window.flipbook.goToPage(${chapter.page})">
                ${chapter.icon || ''} ${chapter.name}
            </button>`
        ).join('');
        
        return `<div class="chapter-nav" style="margin-top: 10px;">${chapters}</div>`;
    }
    
    renderSocialButtons() {
        if (!this.config.socialSharing) return '';
        
        return `
            <div class="social-buttons" style="margin-top: 10px;">
                <button class="social-btn" onclick="window.flipbook.shareToTwitter()">Share 🐦</button>
                <button class="social-btn" onclick="window.flipbook.shareToReddit()">Reddit 🔗</button>
            </div>
        `;
    }
    
    getPagePath(pageNum) {
        if (this.config.pages.length > 0) {
            return this.config.pages[pageNum - 1];
        }
        
        if (this.config.pagePattern) {
            const pageStr = pageNum.toString().padStart(2, '0');
            return this.config.pagePattern.replace('{##}', pageStr);
        }
        
        throw new Error('No pages or pagePattern specified');
    }
    
    loadPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages) return;
        
        const display = document.getElementById('page-display');
        
        if (this.pageMode === 'single' || pageNum === 1) {
            // Single page mode or cover page
            this.loadSinglePage(pageNum, display);
        } else {
            // Dual page mode - load current page and next page if available
            this.loadDualPages(pageNum, display);
        }
        
        this.currentPage = pageNum;
        this.updateControls();
    }
    
    loadSinglePage(pageNum, display) {
        const imagePath = this.getPagePath(pageNum);
        
        display.innerHTML = `
            <div class="loading">Loading page ${pageNum}...</div>
            ${this.config.fullscreenEnabled ? '<button class="fullscreen-btn">⛶ Full</button>' : ''}
        `;
        
        const img = new Image();
        img.onload = () => {
            display.innerHTML = `
                <div class="page-container single-page">
                    <img class="page-image" src="${imagePath}" alt="Page ${pageNum}" title="Page ${pageNum}">
                </div>
                ${this.config.fullscreenEnabled ? '<button class="fullscreen-btn">⛶ Full</button>' : ''}
            `;
            
            if (this.config.fullscreenEnabled) {
                display.querySelector('.page-image').onclick = () => this.toggleFullscreen();
                display.querySelector('.fullscreen-btn').onclick = () => this.toggleFullscreen();
            }
        };
        
        img.onerror = () => {
            display.innerHTML = `
                <div class="loading error">Page ${pageNum} not found</div>
                ${this.config.fullscreenEnabled ? '<button class="fullscreen-btn">⛶ Full</button>' : ''}
            `;
        };
        
        img.src = imagePath;
    }
    
    loadDualPages(pageNum, display) {
        const leftPagePath = this.getPagePath(pageNum);
        const rightPagePath = pageNum < this.totalPages ? this.getPagePath(pageNum + 1) : null;
        
        display.innerHTML = `
            <div class="loading">Loading pages ${pageNum}${rightPagePath ? ` & ${pageNum + 1}` : ''}...</div>
            ${this.config.fullscreenEnabled ? '<button class="fullscreen-btn">⛶ Full</button>' : ''}
        `;
        
        const leftImg = new Image();
        const rightImg = rightPagePath ? new Image() : null;
        let loadedCount = 0;
        const totalImages = rightImg ? 2 : 1;
        
        const onImageLoad = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                const rightPageHtml = rightImg ? 
                    `<img class="page-image right-page" src="${rightPagePath}" alt="Page ${pageNum + 1}" title="Page ${pageNum + 1}">` : '';
                
                display.innerHTML = `
                    <div class="page-container dual-page">
                        <img class="page-image left-page" src="${leftPagePath}" alt="Page ${pageNum}" title="Page ${pageNum}">
                        ${rightPageHtml}
                    </div>
                    ${this.config.fullscreenEnabled ? '<button class="fullscreen-btn">⛶ Full</button>' : ''}
                `;
                
                if (this.config.fullscreenEnabled) {
                    display.querySelectorAll('.page-image').forEach(img => {
                        img.onclick = () => this.toggleFullscreen();
                    });
                    display.querySelector('.fullscreen-btn').onclick = () => this.toggleFullscreen();
                }
            }
        };
        
        const onImageError = (pageNum) => {
            display.innerHTML = `
                <div class="loading error">Page ${pageNum} not found</div>
                ${this.config.fullscreenEnabled ? '<button class="fullscreen-btn">⛶ Full</button>' : ''}
            `;
        };
        
        leftImg.onload = onImageLoad;
        leftImg.onerror = () => onImageError(pageNum);
        leftImg.src = leftPagePath;
        
        if (rightImg) {
            rightImg.onload = onImageLoad;
            rightImg.onerror = onImageLoad; // Still show left page if right fails
            rightImg.src = rightPagePath;
        }
    }
    
    nextPage() {
        const increment = this.getPageIncrement();
        const nextPage = this.currentPage + increment;
        
        if (nextPage <= this.totalPages) {
            this.loadPageSmart(nextPage);
        }
    }
    
    prevPage() {
        const decrement = this.getPageDecrement();
        const prevPage = this.currentPage - decrement;
        
        if (prevPage >= 1) {
            this.loadPageSmart(prevPage);
        }
    }
    
    getPageIncrement() {
        if (this.pageMode === 'single' || this.currentPage === 1) {
            return 1;
        }
        // In dual mode, skip by 2 unless we're at the last page
        return (this.currentPage + 1 >= this.totalPages) ? 1 : 2;
    }
    
    getPageDecrement() {
        if (this.pageMode === 'single') {
            return 1;
        }
        // In dual mode, go back by 2, but handle cover page special case
        if (this.currentPage <= 3) {
            return this.currentPage - 1; // Go back to page 1 (cover)
        }
        return 2;
    }
    
    goToPage(pageNum) {
        const num = parseInt(pageNum);
        if (num >= 1 && num <= this.totalPages) {
            this.loadPageSmart(num);
        }
    }
    
    loadPageSmart(pageNum) {
        if (document.fullscreenElement) {
            this.changeFullscreenPage(pageNum);
        } else {
            this.loadPage(pageNum);
        }
    }
    
    changeFullscreenPage(pageNum) {
        const fullscreenElement = document.fullscreenElement;
        
        if (fullscreenElement) {
            // Stay in fullscreen and update content
            this.currentPage = pageNum;
            const pageInput = document.getElementById('page-input');
            if (pageInput) {
                pageInput.value = pageNum;
            }
            this.updateControls();
            
            // Update fullscreen content based on current mode
            if (this.pageMode === 'single' || pageNum === 1) {
                this.updateFullscreenSinglePage(pageNum, fullscreenElement);
            } else {
                this.updateFullscreenDualPage(pageNum, fullscreenElement);
            }
        }
    }
    
    updateFullscreenSinglePage(pageNum, fullscreenElement) {
        const imagePath = this.getPagePath(pageNum);
        
        // Show loading state
        fullscreenElement.innerHTML = '<div style="color: white; font-size: 2em; text-align: center;">Loading...</div>';
        
        const img = new Image();
        img.onload = () => {
            fullscreenElement.innerHTML = `
                <img src="${imagePath}" alt="Page ${pageNum}" style="
                    max-width: 100vw; 
                    max-height: 100vh; 
                    object-fit: ${this.config.imageFit};
                    display: block;
                    margin: auto;
                    background: black;
                ">
            `;
        };
        
        img.onerror = () => {
            fullscreenElement.innerHTML = '<div style="color: red; font-size: 2em; text-align: center;">Failed to load page</div>';
        };
        
        img.src = imagePath;
    }
    
    updateFullscreenDualPage(pageNum, fullscreenElement) {
        const leftPagePath = this.getPagePath(pageNum);
        const rightPagePath = pageNum < this.totalPages ? this.getPagePath(pageNum + 1) : null;
        
        // Show loading state
        fullscreenElement.innerHTML = '<div style="color: white; font-size: 2em; text-align: center;">Loading...</div>';
        
        const leftImg = new Image();
        const rightImg = rightPagePath ? new Image() : null;
        let loadedCount = 0;
        const totalImages = rightImg ? 2 : 1;
        
        const onImageLoad = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                const rightImageHtml = rightImg ? 
                    `<img src="${rightPagePath}" alt="Page ${pageNum + 1}" style="
                        max-width: 48vw; 
                        max-height: 100vh; 
                        object-fit: ${this.config.imageFit};
                        margin: 0 1vw;
                    ">` : '';
                
                fullscreenElement.innerHTML = `
                    <div style="
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        background: black;
                        gap: 2vw;
                    ">
                        <img src="${leftPagePath}" alt="Page ${pageNum}" style="
                            max-width: 48vw; 
                            max-height: 100vh; 
                            object-fit: ${this.config.imageFit};
                            margin: 0 1vw;
                        ">
                        ${rightImageHtml}
                    </div>
                `;
            }
        };
        
        leftImg.onload = onImageLoad;
        leftImg.onerror = onImageLoad; // Continue even if left image fails
        leftImg.src = leftPagePath;
        
        if (rightImg) {
            rightImg.onload = onImageLoad;
            rightImg.onerror = onImageLoad; // Continue even if right image fails  
            rightImg.src = rightPagePath;
        }
    }
    
    toggleFullscreen() {
        const pageContainer = document.querySelector('.page-container');
        if (!pageContainer) return;
        
        if (!document.fullscreenElement) {
            const fullscreenMethod = pageContainer.requestFullscreen || 
                                   pageContainer.webkitRequestFullscreen || 
                                   pageContainer.mozRequestFullScreen || 
                                   pageContainer.msRequestFullscreen;
                                   
            if (fullscreenMethod) {
                fullscreenMethod.call(pageContainer);
            }
        } else {
            const exitMethod = document.exitFullscreen || 
                             document.webkitExitFullscreen || 
                             document.mozCancelFullScreen || 
                             document.msExitFullscreen;
                             
            if (exitMethod) {
                exitMethod.call(document);
            }
        }
    }
    
    updateControls() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const pageInput = document.getElementById('page-input');
        
        if (prevBtn) prevBtn.disabled = (this.currentPage <= 1);
        if (nextBtn) nextBtn.disabled = (this.currentPage >= this.totalPages);
        if (pageInput) pageInput.value = this.currentPage;
    }
    
    bindEvents() {
        // Navigation buttons
        document.getElementById('prev-btn')?.addEventListener('click', () => this.prevPage());
        document.getElementById('next-btn')?.addEventListener('click', () => this.nextPage());
        
        // Page mode toggle buttons
        document.getElementById('single-page-btn')?.addEventListener('click', () => this.setPageMode('single'));
        document.getElementById('dual-page-btn')?.addEventListener('click', () => this.setPageMode('dual'));
        
        // Page input
        document.getElementById('page-input')?.addEventListener('change', (e) => {
            this.goToPage(e.target.value);
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    this.prevPage();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    this.nextPage();
                    break;
                case 'Home':
                    this.goToPage(1);
                    break;
                case 'End':
                    this.goToPage(this.totalPages);
                    break;
                case 'f':
                case 'F':
                    if (this.config.fullscreenEnabled) {
                        this.toggleFullscreen();
                    }
                    break;
            }
        });
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('msfullscreenchange', () => this.handleFullscreenChange());
        
        // Global reference for chapter buttons
        window.flipbook = this;
    }
    
    handleFullscreenChange() {
        const isFullscreen = document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement;
                           
        if (!isFullscreen) {
            // Exited fullscreen - update the background page
            this.loadPage(this.currentPage);
        }
    }
    
    shareToTwitter() {
        const text = `Check out this interactive flipbook: ${this.config.title}`;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
    
    shareToReddit() {
        const title = `Interactive Flipbook: ${this.config.title}`;
        const url = window.location.href;
        window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
    }
    
    loadPageMode() {
        // If dual page is disabled by creator, always use single
        if (!this.config.allowDualPage) {
            return 'single';
        }
        
        // Check localStorage first
        const saved = localStorage.getItem('flipbook-page-mode');
        if (saved === 'single' || saved === 'dual') {
            return saved;
        }
        
        // Smart default based on screen size
        return window.innerWidth >= 768 ? 'dual' : 'single';
    }
    
    savePageMode() {
        localStorage.setItem('flipbook-page-mode', this.pageMode);
    }
    
    setPageMode(mode) {
        if (mode === this.pageMode) return; // No change needed
        
        // Respect creator's dual page setting
        if (mode === 'dual' && !this.config.allowDualPage) {
            return; // Don't allow dual page if disabled
        }
        
        this.pageMode = mode;
        this.savePageMode();
        
        // Update button states
        const singleBtn = document.getElementById('single-page-btn');
        const dualBtn = document.getElementById('dual-page-btn');
        
        if (singleBtn && dualBtn) {
            singleBtn.classList.toggle('active', mode === 'single');
            dualBtn.classList.toggle('active', mode === 'dual');
        }
        
        // Reload current page with new mode
        this.loadPage(this.currentPage);
    }
    
    togglePageMode() {
        // Keep this method for backwards compatibility
        this.setPageMode(this.pageMode === 'single' ? 'dual' : 'single');
    }
    
    injectCSS() {
        if (document.getElementById('flipbook-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'flipbook-styles';
        style.textContent = this.getCSS();
        document.head.appendChild(style);
    }
    
    getCSS() {
        return `
            .flipbook-wrapper {
                font-family: 'Georgia', serif;
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
            }
            
            .flipbook-wrapper[data-theme="medieval"] {
                background: linear-gradient(45deg, #1a1a2e, #16213e);
                color: #d4af37;
                border-radius: 15px;
                padding: 30px;
            }
            
            .flipbook-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .flipbook-title {
                font-size: 2.5em;
                margin: 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            .flipbook-viewer {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
            }
            
            .page-display {
                position: relative;
                background: #f4f1e8;
                width: 80vw;
                max-width: 1200px;
                height: 60vh;
                max-height: 600px;
                border: 3px solid #8B4513;
                border-radius: 10px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .page-container {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                gap: 10px;
            }
            
            .page-container.single-page {
                gap: 0;
            }
            
            .page-container.dual-page {
                gap: 10px;
            }
            
            .page-image {
                object-fit: contain;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .single-page .page-image {
                max-width: 100%;
                max-height: 100%;
                object-fit: ${this.config.imageFit};
            }
            
            .dual-page .page-image {
                max-width: 48%;
                max-height: 100%;
                border: 1px solid #ccc;
                border-radius: 5px;
                object-fit: ${this.config.imageFit};
            }
            
            .page-image:hover {
                transform: scale(1.02);
            }
            
            .loading {
                font-size: 1.2em;
                color: #666;
                text-align: center;
            }
            
            .loading.error {
                color: #d32f2f;
            }
            
            .fullscreen-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.7);
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .fullscreen-btn:hover {
                background: rgba(0,0,0,0.9);
            }
            
            .flipbook-controls {
                text-align: center;
            }
            
            .nav-controls {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .nav-button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
            }
            
            .nav-button:hover:not(:disabled) {
                background: #45a049;
                transform: translateY(-2px);
            }
            
            .nav-button:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
            }
            
            .flipbook-wrapper[data-theme="medieval"] .nav-button {
                background: linear-gradient(45deg, #8B4513, #A0522D);
                border: 2px solid #d4af37;
                color: #d4af37;
                font-weight: bold;
            }
            
            .flipbook-wrapper[data-theme="medieval"] .nav-button:hover:not(:disabled) {
                background: linear-gradient(45deg, #A0522D, #CD853F);
                box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
            }
            
            .page-mode-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            
            .toggle-label {
                font-weight: bold;
                color: #666;
            }
            
            .toggle-btn {
                background: #f0f0f0;
                color: #666;
                border: 2px solid #ddd;
                padding: 6px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.3s ease;
                min-width: 60px;
            }
            
            .toggle-btn:hover {
                background: #e0e0e0;
                border-color: #ccc;
            }
            
            .toggle-btn.active {
                background: #2196F3;
                color: white;
                border-color: #1976D2;
                font-weight: bold;
            }
            
            .toggle-btn.active:hover {
                background: #1976D2;
            }
            
            .flipbook-wrapper[data-theme="medieval"] .toggle-label {
                color: #d4af37;
            }
            
            .flipbook-wrapper[data-theme="medieval"] .toggle-btn {
                background: rgba(139, 69, 19, 0.3);
                color: #d4af37;
                border-color: #8B4513;
            }
            
            .flipbook-wrapper[data-theme="medieval"] .toggle-btn.active {
                background: linear-gradient(45deg, #4A148C, #6A1B9A);
                border-color: #d4af37;
                color: #d4af37;
            }
            
            .flipbook-wrapper[data-theme="medieval"] .toggle-btn.active:hover {
                background: linear-gradient(45deg, #6A1B9A, #8E24AA);
            }
            
            .page-info {
                font-size: 16px;
                font-weight: bold;
            }
            
            #page-input {
                width: 60px;
                text-align: center;
                border: 1px solid #ccc;
                border-radius: 3px;
                padding: 2px 5px;
                margin: 0 5px;
            }
            
            .chapter-nav, .social-buttons {
                display: flex;
                justify-content: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .chapter-btn, .social-btn {
                font-size: 14px;
                padding: 8px 15px;
            }
            
            .social-btn {
                background: #1da1f2;
            }
            
            .social-btn:hover {
                background: #0d8bd9;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .flipbook-wrapper {
                    padding: 10px;
                }
                
                .flipbook-title {
                    font-size: 1.8em;
                }
                
                .page-display {
                    width: 95vw;
                    height: 50vh;
                }
                
                /* Force single page mode on mobile for dual pages */
                .dual-page .page-image {
                    max-width: 100%;
                    border: none;
                    border-radius: 0;
                }
                
                .dual-page {
                    flex-direction: column;
                    gap: 5px;
                }
                
                .nav-controls {
                    flex-wrap: wrap;
                    gap: 12px;
                    justify-content: center;
                    padding: 15px 10px;
                }
                
                /* Touch-friendly navigation buttons (minimum 44px target) */
                .nav-button {
                    font-size: 16px;
                    padding: 12px 18px;
                    min-width: 44px;
                    min-height: 44px;
                    border-radius: 8px;
                    touch-action: manipulation; /* Disable double-tap zoom */
                }
                
                /* Page input field */
                #page-input {
                    font-size: 16px;
                    padding: 12px 8px;
                    min-height: 44px;
                    width: 70px;
                    text-align: center;
                    border-radius: 6px;
                    border: 2px solid #ddd;
                }
                
                /* Page mode toggle - bottom row if enabled */
                .page-mode-toggle {
                    order: 3;
                    flex-basis: 100%;
                    margin-top: 15px;
                    justify-content: center;
                    gap: 15px;
                }
                
                .toggle-label {
                    font-size: 16px;
                    font-weight: bold;
                    align-self: center;
                }
                
                .toggle-btn {
                    font-size: 15px;
                    padding: 12px 20px;
                    min-width: 80px;
                    min-height: 44px;
                    border-radius: 8px;
                    touch-action: manipulation;
                }
                
                /* Chapter and social buttons */
                .chapter-nav, .social-buttons {
                    justify-content: center;
                    gap: 10px;
                    margin-top: 15px;
                }
                
                .chapter-btn, .social-btn {
                    font-size: 14px;
                    padding: 12px 16px;
                    min-height: 44px;
                    margin: 4px;
                    border-radius: 6px;
                    touch-action: manipulation;
                    white-space: nowrap;
                }
                
                /* Fullscreen button */
                .fullscreen-btn {
                    min-width: 44px;
                    min-height: 44px;
                    padding: 12px;
                    border-radius: 8px;
                }
            }
        `;
    }
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageFlipbook;
} else if (typeof define === 'function' && define.amd) {
    define(() => ImageFlipbook);
} else {
    window.ImageFlipbook = ImageFlipbook;
}