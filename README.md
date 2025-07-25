# CheckX - AI-Powered Twitter/X Fact Checker

https://www.youtube.com/watch?v=oyyM3X-Jyl4

<iframe width="1254" height="705" src="https://www.youtube.com/embed/oyyM3X-Jyl4" title="CheckX demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

CheckX is a Chrome browser extension that provides real-time misinformation detection for Twitter/X posts using Chrome's built-in AI and news verification through the NewsData.io API.

## 🚀 Features

- **AI-Powered Analysis**: Leverages Chrome's built-in AI for intelligent tweet content analysis
- **News Verification**: Cross-references tweets with recent news articles via NewsData.io API
- **Real-Time Detection**: Automatically analyzes tweets as you browse Twitter/X
- **Visual Indicators**: Color-coded badges showing truthfulness ratings
- **Detailed Analysis**: Expandable dropdowns with confidence scores, topics, and reasoning
- **Quick Access**: Context menu and keyboard shortcuts (Ctrl/Cmd+S) for manual checks
- **Smart Keywords**: AI-powered keyword extraction for relevant news searching

## 🎯 Rating System

- **✓ Verified** - Content appears truthful and well-supported
- **⚠ Questionable** - Content may contain misleading information
- **✗ False** - Content appears to be false or highly misleading
- **? Needs Review** - Unable to determine accuracy, manual review recommended

## 🧠 Why Chrome Built-in AI?

CheckX leverages Chrome's revolutionary built-in AI (Gemini Nano) to provide powerful misinformation detection with unique advantages:

### 🔐 Privacy & Security Benefits

- **Complete Privacy**: All AI analysis happens locally on your device - tweet content never leaves your computer
- **Data Security**: No external servers process your browsing data or tweet content
- **Zero Data Sharing**: Your information stays 100% private and secure

### 💰 Cost & Accessibility Benefits

- **Completely Free**: No API costs, subscription fees, or usage charges
- **No Rate Limits**: Unlimited analysis without quotas or throttling
- **No Authentication**: No API keys or account setup required for AI functionality
- **Cost Scalability**: Zero ongoing costs regardless of usage volume

### ⚡ Performance Benefits

- **Instant Response**: Local processing eliminates network latency for faster analysis
- **Offline Capability**: Works without internet connection after initial model download
- **Reliable Access**: Functions even with poor connectivity or network restrictions
- **Future-Proof**: Built on Chrome's native capabilities and continuously improved

### 🛡️ User Benefits

- **No External Dependencies**: Independent of cloud services or third-party AI providers
- **Consistent Performance**: Not affected by external API downtime or service interruptions
- **State-of-the-Art AI**: Powered by Google's advanced Gemini Nano language model
- **Seamless Integration**: Deeply integrated with Chrome for optimal performance

This approach ensures CheckX provides powerful AI-driven fact-checking while maintaining the highest standards of privacy, performance, and accessibility.

## 📋 Requirements

### Chrome Browser & AI Requirements

- **Chrome 138 or later** (required for Prompt API)
- **Supported OS**: Windows 10/11, macOS 13+ (Ventura), or Linux
- **Hardware**: GPU with 4GB+ VRAM, 22GB+ free storage
- **Network**: Unmetered connection (for Gemini Nano model download)

### Development Requirements

- **Node.js** (latest LTS version)
- **pnpm** package manager
- **NewsData.io API Key** (free tier available)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/checkx.git
cd checkx
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_NEWSDATA_API_KEY=your_newsdata_api_key_here
```

**Get your NewsData.io API key:**

1. Visit [NewsData.io](https://newsdata.io/)
2. Sign up for a free account
3. Copy your API key from the dashboard
4. Paste it in the `.env` file

### 4. Development Setup

```bash
# Start development server (Chrome)
pnpm dev

# Chrome will automatically reload on file changes
```

### 5. Enable Chrome AI (First Time Setup)

Before loading the extension, ensure Chrome's Prompt API is available:

1. **Check Chrome Version**: Ensure you have Chrome 138 or later
2. **Verify Hardware**: Confirm your system meets the requirements above
3. **Check AI Status**: Navigate to `chrome://on-device-internals` to see model status
4. **Wait for Download**: The Gemini Nano model will download automatically on first use (requires unmetered connection)

### 6. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3` folder from your project directory
5. The CheckX extension should now appear in your extensions list

## 🚀 Development Commands

| Command            | Description                                     |
| ------------------ | ----------------------------------------------- |
| `pnpm dev`         | Start development server for Chrome (port 3001) |
| `pnpm build`       | Build extension for Chrome production           |
| `pnpm compile`     | TypeScript type checking without emitting files |
| `pnpm zip`         | Create distributable zip for Chrome Web Store   |
| `pnpm postinstall` | Prepare WXT (runs automatically after install)  |

## 📖 Usage

### Automatic Analysis

- Browse Twitter/X normally - CheckX automatically detects and analyzes tweets
- Look for colored badges in the top-right corner of tweets
- Click badges to view detailed analysis with news verification

### Understanding Results

- **Badge Colors**: Green (verified), yellow (questionable), red (false), gray (needs review)
- **Confidence Scores**: Percentage indicating analysis certainty
- **News Verification**: 📰 icon indicates news cross-referencing was performed
- **Topics**: Relevant subject tags identified by AI
- **Reasoning**: Detailed explanation of the analysis

## 🏗️ Project Architecture

### Tech Stack

- **WXT Framework**: Modern web extension development
- **React 19**: UI framework with TypeScript
- **Tailwind CSS v4**: Utility-first CSS framework
- **Chrome AI API**: Built-in browser AI for content analysis
- **NewsData.io API**: News verification and fact-checking
- **shadcn/ui**: Component library built on Radix UI

### Project Structure

```
src/
├── entrypoints/          # Extension entry points
│   ├── background.ts     # Service worker (context menus, shortcuts)
│   ├── content.ts        # Content script (tweet detection, badges)
│   └── popup/           # Extension popup UI
├── components/          # Reusable React components
├── lib/                # Utility functions and AI logic
│   └── ai/             # Misinformation detection system
├── types/              # TypeScript type definitions
└── providers/          # React context providers
```

### Key Components

- **Content Script**: Monitors Twitter/X for tweets, injects analysis badges
- **Background Script**: Handles context menus and keyboard shortcuts
- **AI System**: Chrome AI integration for content analysis and keyword extraction
- **News Integration**: NewsData.io API for news verification context
- **UI Components**: React-based popup and badge interfaces

## 🔧 How It Works

1. **Tweet Detection**: Content script identifies tweets using `article[data-testid="tweet"]` selectors
2. **AI Availability Check**: Extension checks if Chrome's Prompt API is available using `LanguageModel.availability()`
3. **AI Keyword Extraction**: Chrome AI (Gemini Nano) extracts relevant keywords from tweet content
4. **News Verification**: Keywords are used to search NewsData.io for related articles
5. **AI Analysis**: Chrome AI analyzes tweet content with news context for misinformation
6. **Visual Feedback**: Results displayed as color-coded badges with detailed dropdowns

## 🎨 Customization

The extension uses CSS custom properties for theming and can be customized by modifying:

- Badge styles in `src/entrypoints/content.ts`
- Component themes in `src/components/`
- Tailwind configuration in `tailwind.config.js`

## 🐛 Troubleshooting

### Chrome AI Not Available

**Check Chrome Version & Compatibility:**

- Ensure you're using **Chrome 138 or later** (not Chromium, Edge, or other browsers)
- Verify your OS is supported: Windows 10/11, macOS 13+ (Ventura), or Linux
- Chrome for Android, iOS, and ChromeOS are **not supported**

**Hardware Requirements:**

- GPU with **4GB+ VRAM** required
- **22GB+ free storage** for Gemini Nano model
- **Unmetered network connection** for initial model download

**Check AI Status:**

1. Navigate to `chrome://on-device-internals`
2. Look for "Optimization Guide On Device Model" section
3. Check if Gemini Nano model status shows:
   - **"Available"** ✅ - Ready to use
   - **"Downloading"** ⏳ - Wait for completion
   - **"Downloadable"** 📥 - Will download on first use
   - **"Unavailable"** ❌ - Check requirements above

**Force Model Download:**
If model shows "Downloadable" but hasn't downloaded:

1. Use the extension to trigger a fact-check
2. The model will automatically download on first API call
3. Ensure you have an unmetered network connection

**Common Issues:**

- **Region Restrictions**: Chrome AI may not be available in all regions
- **Corporate Networks**: May block model downloads
- **Insufficient Storage**: Clear space if you have less than 22GB free

### Extension Not Loading

- Verify all dependencies are installed: `pnpm install`
- Check for TypeScript errors: `pnpm compile`
- Ensure `.output/chrome-mv3` directory exists after `pnpm dev`

### API Issues

- Verify your NewsData.io API key is correct in `.env`
- Check API quota limits in your NewsData.io dashboard
- Ensure `.env` file is in the project root directory

### Development Issues

- Clear Chrome extension cache: Remove and re-add the extension
- Verify development server is running on port 3001
