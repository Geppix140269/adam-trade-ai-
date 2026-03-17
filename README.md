# ADAMftd AI-Powered Global Trade Course

An interactive learning platform for mastering global trade, powered by local AI using Ollama.

## Features

- **AI Tutor Chat**: Get instant answers to your global trade questions from a knowledgeable AI assistant
- **Smart Question Generation**: Generate custom practice questions tailored to your chosen topics and difficulty level
- **Answer Explanations**: Receive detailed explanations for every answer to deepen your understanding
- **Personalized Study Plans**: Get AI-generated 4-week study plans based on your progress and performance
- **10 Comprehensive Modules**: Cover all aspects of global trade from fundamentals to advanced topics
- **Progress Tracking**: Monitor your learning journey with real-time score and progress updates

## Prerequisites

1. **Ollama** installed on your machine
   - Download from: https://ollama.com
   - Installation guide: https://github.com/ollama/ollama

2. **Mistral Model** (or any other model you prefer)
   ```bash
   ollama pull mistral
   ```

## Local Setup

1. **Clone or download this repository**

2. **Ensure Ollama is running**
   ```bash
   ollama serve
   ```

3. **Open the app**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 8000

     # Node.js
     npx serve
     ```

4. **Check AI connection**
   - The app will automatically detect if Ollama is running
   - Look for the green "AI Ready" indicator on the intro screen

## How It Works

The app connects to your **locally running Ollama instance** at `http://localhost:11434`. This means:

- ✅ Complete privacy - your data never leaves your machine
- ✅ No API keys or subscriptions needed
- ✅ Works offline once models are downloaded
- ✅ Fast responses with local processing

## Usage

### AI Tutor
1. Navigate to the "AI Tutor" section
2. Type your question about global trade
3. Get instant, detailed explanations

### Practice Questions
1. Go to the "Practice" section
2. Choose a topic (or let AI pick)
3. Select difficulty level
4. Generate custom questions
5. Test your knowledge and see explanations

### Study Plan
1. Visit the "Study Plan" section
2. Click "Generate My Study Plan"
3. Get a personalized 4-week learning roadmap

## Customization

### Change the AI Model
Edit `app.js` and update:
```javascript
const MODEL_NAME = 'mistral';  // Change to 'llama3', 'codellama', etc.
```

### Customize the Prompt Behavior
Modify the system prompts in the `generateText()` and `chatWithAI()` functions in `app.js`.

### Add More Modules
Update the `modules` array in `appState` in `app.js`.

## Deployment

### Deploy to Netlify

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Deploy!

3. **Important Note**: Users who visit your deployed site will need to have Ollama running locally on their own machines for the AI features to work.

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Troubleshooting

### "AI Offline" Status
- Make sure Ollama is installed and running: `ollama serve`
- Check that the Mistral model is installed: `ollama list`
- If the model is missing: `ollama pull mistral`

### CORS Errors
- Ollama's API should allow local connections by default
- If you see CORS errors, ensure you're accessing the app via a web server, not just opening the HTML file

### Slow Response Times
- Larger models take longer to respond
- Consider using a smaller model like `mistral:7b` instead of `mistral:13b`
- Check your system resources (CPU/RAM usage)

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **AI Engine**: Ollama (local AI runtime)
- **AI Model**: Mistral (configurable)
- **Styling**: Custom CSS with modern design
- **No backend required** - purely client-side with local AI

## Contributing

Feel free to fork this project and customize it for your own learning needs!

## License

MIT License - Feel free to use and modify as needed.

## Credits

Powered by:
- [Ollama](https://ollama.com) - Local AI runtime
- [Mistral AI](https://mistral.ai) - AI model
- Inspired by modern e-learning platforms

---

**Built with ❤️ for learners who value privacy and local-first AI**
