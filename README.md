# ImageFlipbook

[![NPM Version](https://img.shields.io/npm/v/image-flipbook.svg)](https://www.npmjs.com/package/image-flipbook)
[![License](https://img.shields.io/npm/l/image-flipbook.svg)](https://github.com/curbob/image-flipbook/blob/main/LICENSE)
[![Size](https://img.shields.io/bundlephobia/minzip/image-flipbook.svg)](https://bundlephobia.com/result?p=image-flipbook)

**Zero-dependency JavaScript library for smooth image sequence viewing with fullscreen navigation.**

Perfect for digital art books, comic readers, technical manuals, portfolios, and any content where you need elegant page-by-page image navigation.

## ✨ Features

- 🚀 **Zero dependencies** - Pure vanilla JavaScript
- 📱 **Enhanced mobile support** - Touch gestures, swipe navigation, mobile fullscreen fallback
- 🖼️ **Smooth fullscreen navigation** - Seamless page transitions without flickering
- 👆 **Touch-friendly controls** - 44px minimum touch targets, intuitive mobile navigation
- ⌨️ **Keyboard support** - Arrow keys, spacebar, F for fullscreen
- 🎨 **Customizable themes** - Built-in themes + full CSS customization
- 📖 **Chapter navigation** - Optional chapter markers for easy jumping
- 🌐 **Social sharing** - Built-in Twitter and Reddit sharing
- 📄 **Multiple image formats** - JPG, PNG, WebP, SVG support
- 🔧 **Flexible configuration** - File arrays or naming patterns

### 🔥 New in v1.2.0: Mobile Enhancements

- **📱 Mobile Fullscreen Fallback** - Custom overlay when native fullscreen isn't available
- **🎮 Touch Navigation** - Circular ← → buttons in mobile fullscreen mode
- **👉 Swipe Gestures** - Swipe left/right to change pages
- **🎯 Tap to Advance** - Tap center area to go to next page
- **🍎 iOS Safari Support** - Enhanced compatibility with mobile browsers
- **♿ Accessibility** - 44px minimum touch targets for mobile accessibility

## 🚀 Quick Start

### NPM Installation

```bash
npm install image-flipbook
```

### CDN (Coming Soon)

```html
<script src="https://unpkg.com/image-flipbook@latest/dist/image-flipbook.min.js"></script>
```

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Flipbook</title>
</head>
<body>
    <div id="my-flipbook"></div>
    
    <script src="image-flipbook.js"></script>
    <script>
        const flipbook = new ImageFlipbook({
            container: '#my-flipbook',
            title: 'My Image Collection',
            pages: [
                'images/page1.jpg',
                'images/page2.jpg',
                'images/page3.jpg'
            ]
        });
    </script>
</body>
</html>
```

## 📖 Examples

### Simple Gallery
```javascript
const gallery = new ImageFlipbook({
    container: '#gallery',
    title: 'Photo Gallery',
    pages: [
        'photos/sunset.jpg',
        'photos/mountains.jpg',
        'photos/ocean.jpg'
    ]
});
```

### Comic Book Reader
```javascript
const comic = new ImageFlipbook({
    container: '#comic-reader',
    title: 'Amazing Comics #1',
    pages: [
        'comic/cover.png',
        'comic/page-01.png',
        'comic/page-02.png',
        // ... more pages
    ],
    chapters: [
        { name: "Cover", page: 1, icon: "📖" },
        { name: "Chapter 1", page: 2, icon: "🦸" },
        { name: "Chapter 2", page: 15, icon: "💥" },
        { name: "Back Cover", page: 30, icon: "🔚" }
    ],
    theme: 'default'
});
```

### Medieval Manuscript
```javascript
const manuscript = new ImageFlipbook({
    container: '#manuscript',
    title: '✨ The Illuminated Codex ✨',
    pagePattern: 'manuscript/page-{##}.png', // Auto-generates page-01.png, page-02.png, etc.
    totalPages: 50,
    chapters: [
        { name: "Prologue", page: 1, icon: "📜" },
        { name: "Saints", page: 10, icon: "👑" },
        { name: "Protocols", page: 26, icon: "⚡" },
        { name: "Epilogue", page: 50, icon: "🔚" }
    ],
    theme: 'medieval',
    socialSharing: true
});
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | string/Element | `'#flipbook-container'` | CSS selector or DOM element |
| `pages` | Array | `[]` | Array of image paths/URLs |
| `pagePattern` | string | `null` | Pattern like `'pages/page-{##}.png'` for auto-generation |
| `totalPages` | number | `pages.length` | Total pages (required with pagePattern) |
| `startPage` | number | `1` | Initial page to display |
| `title` | string | `'Image Flipbook'` | Flipbook title |
| `theme` | string | `'default'` | Theme: `'default'` or `'medieval'` |
| `chapters` | Array | `[]` | Chapter navigation buttons |
| `chapterStyle` | string | `'buttons'` | Chapter style (currently only buttons) |
| `chapterPosition` | string | `'bottom'` | Chapter position |
| `fullscreenEnabled` | boolean | `true` | Enable fullscreen viewing |
| `socialSharing` | boolean | `false` | Show social share buttons |

### Chapter Configuration

```javascript
chapters: [
    {
        name: "Chapter Title",    // Display name
        page: 5,                  // Page number to jump to
        icon: "📖"               // Optional emoji/icon
    }
]
```

## 🎨 Themes

### Default Theme
Clean, modern design suitable for most use cases.

```javascript
theme: 'default'
```

### Medieval Theme
Rich, illuminated manuscript style with gold accents and dark backgrounds.

```javascript
theme: 'medieval'
```

### Custom CSS
Override any styles by targeting the CSS classes:

```css
.flipbook-wrapper[data-theme="custom"] {
    background: linear-gradient(45deg, #667eea, #764ba2);
}

.flipbook-wrapper[data-theme="custom"] .nav-button {
    background: #764ba2;
    border-radius: 20px;
}
```

## ⌨️ Keyboard Controls

| Key | Action |
|-----|--------|
| `←` `↑` | Previous page |
| `→` `↓` `Space` | Next page |
| `Home` | First page |
| `End` | Last page |
| `F` | Toggle fullscreen |

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

**Fullscreen API requires HTTPS** in production.

## 📱 Mobile Support

Fully responsive with touch-friendly controls:
- Touch-optimized button sizes
- Responsive layout
- Mobile-friendly navigation

## 🔧 Methods

```javascript
const flipbook = new ImageFlipbook(options);

// Navigation
flipbook.nextPage();
flipbook.prevPage();
flipbook.goToPage(pageNumber);

// Fullscreen
flipbook.toggleFullscreen();

// Social
flipbook.shareToTwitter();
flipbook.shareToReddit();
```

## 🎯 Use Cases

**Perfect for:**
- 📚 Digital art books and portfolios
- 📖 Comic and manga readers
- 📑 Technical documentation with diagrams
- 🎨 Photography galleries
- 📜 Historical document viewers
- 🖼️ Any image sequence that needs smooth navigation

**Why choose ImageFlipbook over PDF viewers?**
- Better performance for image-heavy content
- Pixel-perfect image quality
- Custom styling and branding
- Smooth fullscreen experience
- Mobile-optimized interface

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/curbob/image-flipbook.git
cd image-flipbook

# Install dependencies (for building)
npm install

# Run examples locally
npm run dev

# Build distribution files
npm run build
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests.

## 📧 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/curbob/image-flipbook/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/curbob/image-flipbook/discussions)
- 📖 **Documentation**: [Full Documentation](https://github.com/curbob/image-flipbook/wiki)

## ⭐ Show Your Support

If this library helped you, please give it a ⭐ on GitHub!

---

**Made with ❤️ by [Rich Curry (Curbob)](https://github.com/curbob)**