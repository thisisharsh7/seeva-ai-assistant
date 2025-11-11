# Seeva Landing Page

This is the marketing landing page for Seeva AI Assistant.

## 📁 Structure

```
landing/
├── index.html          # Main landing page
├── styles.css          # Glassmorphism styling
├── script.js           # Interactive features
├── README.md           # This file
└── assets/
    ├── logo.svg        # Seeva logo
    └── screenshots/    # App screenshots (add here)
```

## 🚀 Running Locally

Simply open `index.html` in a browser, or use a local server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

## 🎨 Design Features

- **Glassmorphism UI**: Matches the actual Seeva app aesthetic
- **Smooth animations**: Scroll-triggered animations, hover effects
- **Responsive**: Works on desktop, tablet, and mobile
- **Performance optimized**: Pure HTML/CSS/JS, no frameworks
- **SEO ready**: Semantic HTML, meta tags

## 📝 Content Sections

1. **Hero** - Main value proposition with CTA
2. **Problem/Solution** - Context switching vs. Seeva
3. **Features** - 4 key value props
4. **Showcase** - Detailed feature breakdown
5. **How It Works** - 3-step process
6. **Demo** - Video placeholder
7. **Tech Stack** - Technologies used
8. **Download** - Installation instructions
9. **Footer** - Links and legal

## 🎯 Call to Actions

- Primary: "Download for macOS"
- Secondary: "Star on GitHub"

## 🖼️ Assets Needed

To complete the landing page, add these assets to `/assets/`:

1. **Demo video** (`demo.mp4`):
   - Screen recording of Seeva in action
   - Show: hotkey press → screen capture → AI response
   - Duration: 30-60 seconds
   - Format: MP4, 16:9 aspect ratio

2. **Screenshots** (in `/assets/screenshots/`):
   - Main app window
   - Settings panel
   - Screen capture in action
   - Multi-provider selection
   - Format: PNG or JPG, high resolution

3. **Video thumbnail** (`video-placeholder.jpg`):
   - Poster frame for video element
   - 1920x1080 recommended

## 🎨 Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --color-bg: #0a0a0f;
    --gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
    /* ... more variables */
}
```

### Content

All content is in `index.html`. Key sections to update:

- Hero tagline: Line 35
- Feature descriptions: Lines 200-270
- Download links: Line 650+
- GitHub links: Update all instances of `yourusername`

## 🔗 Links to Update

Before deploying, replace placeholder links:

- [ ] GitHub repo URL (multiple places)
- [ ] Download link (`.dmg` file)
- [ ] Privacy policy link
- [ ] Terms of service link

## 🚀 Deployment Options

### Option 1: GitHub Pages

```bash
# Push to gh-pages branch
git subtree push --prefix landing origin gh-pages
```

Access at: `https://yourusername.github.io/seeva-ai-assistant/`

### Option 2: Vercel

```bash
# Deploy with Vercel CLI
cd landing
vercel
```

### Option 3: Netlify

```bash
# Drag & drop the landing folder to Netlify
# Or connect GitHub repo
```

### Option 4: Custom Domain

Upload all files to your web server's public directory.

## 📊 Analytics (Optional)

To track visitors, add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎭 Easter Eggs

- Press `Cmd+Shift+C` on the landing page for a surprise!
- Check browser console for ASCII art

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🐛 Known Issues

- Video placeholder shows until real demo is added
- Download button shows "coming soon" notification (update when ready)

## 📄 License

Same as parent project (TBD)

## 🤝 Contributing

To improve the landing page:

1. Make changes in `/landing` directory
2. Test locally
3. Submit PR with screenshots

---

**Note**: This is a static landing page separate from the main Seeva app codebase.
