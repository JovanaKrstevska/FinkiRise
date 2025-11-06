# 🤖 Perplexity AI Setup for Question Generation

## Quick Setup (5 minutes)

### Step 1: Get Your API Key
1. Go to [Perplexity AI](https://www.perplexity.ai/settings/api)
2. Sign up or log in
3. Navigate to API settings
4. Generate a new API key
5. Copy the key

### Step 2: Configure Your App
1. Open the `.env` file in your project root
2. Replace `your_perplexity_api_key_here` with your actual API key:
   ```
   REACT_APP_PERPLEXITY_API_KEY=pplx-your-actual-key-here
   ```
3. Save the file

### Step 3: Restart Your App
```bash
npm start
```

## How to Use AI Question Generation

1. **Open Create Exam Page**
2. **Click the "🤖 Генерирај прашања" button**
3. **Fill in the form:**
   - **Topic**: e.g., "JavaScript", "Python", "Databases", "Algorithms"
   - **Number of questions**: 3, 5, 10, or 15
   - **Difficulty**: Easy, Medium, or Hard
4. **Click "🚀 Генерирај"**
5. **Questions will be automatically added to your exam!**

## Example Topics That Work Well

### Programming Languages
- JavaScript основи
- Python програмирање
- Java објектно ориентирано програмирање
- C++ алгоритми

### Computer Science
- Структури на податоци
- Алгоритми за сортирање
- Бази на податоци
- Мрежно програмирање

### Web Development
- HTML и CSS
- React компоненти
- Node.js и Express
- REST API дизајн

## Fallback Mode (Works Without API)

Even without an API key, the system will generate relevant questions using intelligent templates. The questions won't be as sophisticated as AI-generated ones, but they'll still be educational and properly formatted.

## Troubleshooting

### "API недостапно" Message
- ✅ Check your internet connection
- ✅ Verify your API key is correct in `.env`
- ✅ Make sure you have API credits remaining
- ✅ Restart your application after adding the key

### Questions Not Relevant
- ✅ Be more specific with your topic (e.g., "JavaScript arrays" instead of just "programming")
- ✅ Try different difficulty levels
- ✅ You can always edit generated questions manually

### API Costs
- Perplexity AI is very affordable: ~$0.001-0.002 per question
- 100 questions ≈ $0.10-0.20
- Perfect for educational use!

## Security Note
Never commit your `.env` file to version control. Your API key should remain private.