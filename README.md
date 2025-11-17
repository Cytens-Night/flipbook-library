# 📚 Flipbook Library

A feature-rich, open-source digital library application with a beautiful Gemini-inspired dark theme and realistic flipbook reading experience.

## ✨ Features

### 📖 Reading Experience
- **3D Flipbook Animation** - Realistic page-turning effect using `react-pageflip`
- **Read Aloud** - Built-in text-to-speech using the Web Speech API (free!)
- **Bookmarks** - Save your favorite pages for quick access
- **Quotes** - Select and save memorable quotes with page references
- **Dictionary** - Double-click words for instant definitions
- **Full-Text Search** - Search within books and across your library
- **Customizable Reading Settings** - Adjust font, size, line height, and color schemes

### 📚 Library Management
- **Multi-Format Support** - Upload PDF, EPUB, and TXT files
- **Drag & Drop Organization** - Rearrange books with intuitive 6-dot handles
- **Smart Grouping** - Stack related books together with visual indicators
- **Recycle Bin** - Safely delete and restore books
- **Duplicate Detection** - Prevents re-uploading the same book
- **Metadata Editor** - Edit titles, authors, and cover images

### 🎨 Design
- **Gemini Dark Theme** - Systematic dark design with high contrast
- **Responsive Layout** - Works on desktop and mobile devices
- **PWA Support** - Install as an app and read offline
- **Smooth Animations** - Polished transitions throughout

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn installed

### Installation

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Start the development server:**
   ```powershell
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Building for Production

```powershell
npm run build
```

The production-ready files will be in the `dist` folder.

## 💻 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18 | Component-based UI |
| **Styling** | Styled-Components | CSS-in-JS with theming |
| **State** | Zustand + LocalForage | State management + IndexedDB persistence |
| **Flipbook** | react-pageflip | 3D page-turning animation |
| **Drag & Drop** | dnd-kit | Shelf organization |
| **PDF** | pdf.js | PDF parsing and rendering |
| **EPUB** | epubjs | EPUB parsing |
| **TTS** | Web Speech API | Free text-to-speech |
| **Build** | Vite | Fast development and building |
| **PWA** | vite-plugin-pwa | Offline support |

## 📖 Usage Guide

### Uploading Books
1. Click the "Upload Book" button
2. Select a PDF, EPUB, or TXT file
3. The book will be processed and added to your shelf

### Organizing Your Library
- **Drag Books:** Use the 6-dot handle to drag and reorder
- **Create Groups:** Drag one book onto another to create a stack
- **Search:** Use the search bar to find books by title, author, or group

### Reading
- Click any book to open the reading view
- Use arrow keys or swipe to turn pages
- Click "Read Aloud" to enable text-to-speech
- Click the bookmark icon to save the current page
- Select text and click "Save Quote" to save memorable passages

### Customizing
- Click the Settings icon to adjust:
  - Font family and size
  - Line height
  - Background color (Dark/Light/Sepia modes)
  - TTS speed and pitch

## 🗂️ Project Structure

```
flipbook-library/
├── src/
│   ├── components/       # React components
│   │   ├── Shelf/       # Library shelf view
│   │   ├── BookCard/    # Individual book cards
│   │   ├── ReadingView/ # Book reading interface
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand stores
│   ├── styles/          # Theme and global styles
│   └── utils/           # Helper functions
├── public/              # Static assets
└── package.json         # Dependencies
```

## 🎨 Customizing the Theme

Edit `src/styles/theme.js` to customize colors:

```javascript
export const theme = {
  colors: {
    background: '#0A0A0A',    // Main background
    surface: '#1E1E1E',       // Cards/surfaces
    accent: '#89B4FA',        // Accent color
    text: '#E8EAED',          // Text color
    // ...
  }
};
```

## 🔧 Advanced Configuration

### Adjusting Page Size
In `bookParser.js`, modify `CHARS_PER_PAGE` to change how text files are split into pages:

```javascript
const CHARS_PER_PAGE = 2000; // Characters per page
```

### TTS Voice Settings
Access different voices in the Settings panel. The app uses your browser's built-in voices.

## 📱 PWA Installation

When running the production build, you can install the app:

1. Click the install icon in your browser's address bar
2. The app will be added to your home screen/applications
3. Use it offline like a native app

## 🤝 Contributing

This is an open-source project. Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Fork and customize for your needs

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🙏 Acknowledgments

- **react-pageflip** for the amazing flipbook animation
- **pdf.js** by Mozilla for PDF rendering
- **epubjs** for EPUB parsing
- **dnd-kit** for drag-and-drop functionality
- Google's Material Design for dark theme inspiration

## 🐛 Troubleshooting

### Books won't upload
- Check the file format (PDF, EPUB, or TXT only)
- Large files may take time to process
- Check browser console for errors

### TTS not working
- Ensure your browser supports Web Speech API (Chrome, Edge, Safari)
- Check that your system has TTS voices installed
- Try a different voice in Settings

### PWA not installing
- Run `npm run build` and serve the production build
- PWA only works over HTTPS or localhost

---

**Enjoy your new digital library! 📚✨**
