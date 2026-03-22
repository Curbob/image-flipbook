/**
 * ImageFlipbook - Zero-dependency JavaScript library for smooth image sequence viewing
 * with fullscreen navigation
 * 
 * @version 1.0.0
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
            ...options
        };
        
        this.currentPage = this.config.currentPage;
        this.totalPages = this.config.totalPages || this.config.pages.length;
        this.container = null;
        
        this.init();
    }
    
    init() {
        this.container = typeof this.config.container === 'string' 
            ? document.querySelector(this.config.container)
            : this.config.container;
            
        if (!this.container) {
            throw new Error(`Container not found: ${this.config.container}`);
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
        const imagePath = this.getPagePath(pageNum);
        
        display.innerHTML = `
            <div class="loading">Loading page ${pageNum}...</div>
            ${this.config.fullscreenEnabled ? '<button class="fullscreen-btn">⛶ Full</button>' : ''}
        `;
        
        const img = new Image();
        img.onload = () => {
            display.innerHTML = `
                <img class="page-image" src="${imagePath}" alt="Page ${pageNum}" title="Page ${pageNum}">
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
        this.currentPage = pageNum;
        this.updateControls();
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.loadPageSmart(this.currentPage + 1);
        }
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.loadPageSmart(this.currentPage - 1);
        }
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
        const imagePath = this.getPagePath(pageNum);
        const fullscreenImg = document.fullscreenElement;
        
        if (fullscreenImg && fullscreenImg.tagName === 'IMG') {
            const newImg = new Image();
            newImg.onload = () => {
                fullscreenImg.src = imagePath;
                fullscreenImg.alt = `Page ${pageNum}`;
                fullscreenImg.title = `Page ${pageNum}`;
            };
            newImg.src = imagePath;
            
            this.currentPage = pageNum;
            document.getElementById('page-input').value = pageNum;
            this.updateControls();
        }
    }
    
    toggleFullscreen() {
        const img = document.querySelector('.page-image');
        if (!img) return;
        
        if (!document.fullscreenElement) {
            const fullscreenMethod = img.requestFullscreen || 
                                   img.webkitRequestFullscreen || 
                                   img.mozRequestFullScreen || 
                                   img.msRequestFullscreen;
                                   
            if (fullscreenMethod) {
                fullscreenMethod.call(img);
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
                max-width: 800px;
                height: 60vh;
                max-height: 600px;
                border: 3px solid #8B4513;
                border-radius: 10px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .page-image {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                cursor: pointer;
                transition: transform 0.2s ease;
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
                
                .nav-controls {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .nav-button {
                    font-size: 14px;
                    padding: 8px 16px;
                }
                
                .chapter-nav, .social-buttons {
                    justify-content: center;
                }
                
                .chapter-btn, .social-btn {
                    font-size: 12px;
                    padding: 6px 12px;
                    margin: 2px;
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