# AI-Powered Question Generation Setup

This feature allows professors to automatically generate exam questions using AI services like Perplexity AI.

## Features

- 🤖 **AI-Generated Questions**: Automatically create multiple-choice questions based on any topic
- 🎯 **Difficulty Levels**: Choose from Easy, Medium, or Hard difficulty
- 📊 **Customizable Count**: Generate 3, 5, 10, or 15 questions at once
- ✅ **Smart Validation**: Questions include correct answers and are properly formatted
- 🔄 **Fallback System**: Works even without API access using intelligent templates

## Setup Instructions

### Option 1: Perplexity AI (Recommended)

1. **Get API Key**:
   - Visit [Perplexity AI Settings](https://www.perplexity.ai/settings/api)
   - Create an account and generate an API key
   - Copy your API key

2. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Add your API key:
     ```
     REACT_APP_PERPLEXITY_API_KEY=your_actual_api_key_here
     ```

3. **Restart Application**:
   ```bash
   npm start
   ```

### Option 2: OpenAI API (Alternative)

1. **Get API Key**:
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create an API key

2. **Update Configuration**:
   - Modify `src/services/aiService.js` to use OpenAI instead of Perplexity
   - Add your OpenAI API key to `.env`

### Option 3: No API (Fallback Mode)

The system works without any API keys by using intelligent question templates. Questions will be generated based on the topic you provide, but won't be as sophisticated as AI-generated ones.

## How to Use

1. **Open Create Exam Page**
2. **Click "🤖 Генерирај со AI" button**
3. **Enter Topic**: e.g., "JavaScript основи", "Бази на податоци", "Алгоритми"
4. **Select Options**:
   - Number of questions (3-15)
   - Difficulty level (Easy/Medium/Hard)
5. **Click "🚀 Генерирај"**
6. **Review and Edit**: Generated questions appear in your exam, ready to edit if needed

## Question Quality

### AI-Generated (with API):
- ✅ Contextually relevant to your topic
- ✅ Educationally sound
- ✅ Varied question types and approaches
- ✅ Appropriate difficulty level
- ✅ Current and accurate information

### Fallback Mode (without API):
- ✅ Topic-aware templates
- ✅ Educationally structured
- ✅ Consistent formatting
- ⚠️ More generic content
- ⚠️ Limited variety

## Supported Topics

The AI can generate questions for virtually any academic topic:

- **Programming**: JavaScript, Python, Java, C++, etc.
- **Computer Science**: Algorithms, Data Structures, Databases, etc.
- **Mathematics**: Calculus, Statistics, Linear Algebra, etc.
- **Sciences**: Physics, Chemistry, Biology, etc.
- **Engineering**: Software Engineering, Systems Design, etc.
- **Business**: Management, Marketing, Finance, etc.
- **And many more...**

## Troubleshooting

### "API недостапно" Message
- Check your internet connection
- Verify your API key is correct
- Ensure you have API credits/quota remaining
- The system will still work with fallback questions

### Questions Not Relevant
- Be more specific with your topic
- Try different difficulty levels
- Edit generated questions as needed

### API Rate Limits
- Perplexity has generous rate limits
- If you hit limits, wait a few minutes
- Consider upgrading your API plan for heavy usage

## Cost Considerations

- **Perplexity AI**: Very affordable, typically $0.001-0.002 per question
- **OpenAI**: Slightly more expensive but very capable
- **Fallback Mode**: Completely free

## Security Notes

- API keys are stored locally in your `.env` file
- Never commit API keys to version control
- Keys are only used for question generation
- No exam content is stored by AI services

## Future Enhancements

- 🔄 Support for other question types (coding, essay)
- 🌐 Multi-language question generation
- 📚 Subject-specific question banks
- 🎨 Custom question templates
- 📊 Question difficulty analysis