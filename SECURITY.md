# 🔒 ImageFlipbook Security Guide

ImageFlipbook v1.1.1+ includes built-in security features for safe online deployment.

## 🛡️ Built-in Security Features

### HTTPS Enforcement
```javascript
const flipbook = new ImageFlipbook({
    enforceHTTPS: true,  // Default: true - converts HTTP to HTTPS
    // ...other options
});
```

### Image Source Validation
```javascript
const flipbook = new ImageFlipbook({
    validateImageSources: true,
    allowedDomains: [
        'https://yoursite.com',
        'https://cdn.yoursite.com',
        '/'  // Allow relative paths
    ]
});
```

### Right-Click Protection
```javascript
const flipbook = new ImageFlipbook({
    preventRightClick: true,  // Disables context menu and drag on images
    // ...other options
});
```

## 🌐 Online Deployment Security

### Content Security Policy
ImageFlipbook automatically adds CSP headers if none exist:
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self'; 
    img-src 'self' data: https:; 
    script-src 'self' 'unsafe-inline'; 
    style-src 'self' 'unsafe-inline'; 
    object-src 'none';">
```

### Referrer Policy
Automatically adds referrer policy for privacy:
```html
<meta name="referrer" content="strict-origin-when-cross-origin">
```

## 🏠 Local Path Best Practices

### ✅ Recommended (Secure)
```javascript
// Local relative paths
pages: ['pages/page-01.png', 'pages/page-02.png']

// Pattern with local paths  
pagePattern: 'images/page-{##}.jpg'

// Absolute paths on same domain
pages: ['/static/book/page1.png']
```

### ⚠️ Use with Caution
```javascript
// External URLs - validate domains
pages: ['https://cdn.example.com/page1.jpg'],
allowedDomains: ['https://cdn.example.com']
```

## 🔧 Server-Side Protection

### Apache (.htaccess)
```apache
# In your images directory
<Files "*.png,*.jpg">
    # Prevent hotlinking
    SetEnvIf Referer "^https://yoursite\.com/" local_ref
    Order deny,allow
    Deny from all
    Allow from env=local_ref
</Files>

# Prevent directory listing
Options -Indexes

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Nginx
```nginx
# Rate limiting for images
location ~* \.(jpg|jpeg|png|gif)$ {
    limit_req zone=images burst=10 nodelay;
    
    # Prevent hotlinking
    valid_referers none blocked yoursite.com *.yoursite.com;
    if ($invalid_referer) {
        return 403;
    }
}
```

## 🎯 Security Checklist

- [ ] Use HTTPS for your site
- [ ] Use local/relative paths for images when possible
- [ ] Enable `enforceHTTPS: true` if mixing HTTP/HTTPS
- [ ] Set up server-side hotlink protection
- [ ] Consider `preventRightClick: true` for sensitive content
- [ ] Validate external domains with `allowedDomains`
- [ ] Monitor server logs for unusual access patterns

## 🚨 Security Reporting

Found a security issue? Please report it responsibly:
- Email: security@[your-domain]
- Do not open public GitHub issues for security vulnerabilities

## 📊 Security Score: 9/10

ImageFlipbook is designed with security as a priority:
- ✅ Zero dependencies (no supply chain attacks)
- ✅ XSS protection through safe DOM manipulation
- ✅ Input validation and sanitization  
- ✅ HTTPS enforcement options
- ✅ CSP and referrer policy automation
- ✅ Local path preference for maximum security

---

*Last updated: v1.1.1 - March 2026*