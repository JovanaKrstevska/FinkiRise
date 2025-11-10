// AI Service for generating exam questions
// This would typically connect to Perplexity API or similar AI service

const PERPLEXITY_API_KEY = process.env.REACT_APP_PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Note: Direct browser calls to Perplexity API are blocked by CORS.
// For production, you should use a backend server to make API calls.
// For now, we'll use fallback generation which works well.

export const generateQuestionsWithPerplexity = async (topic, count, difficulty) => {
    console.log('🔵 [AI Service] Starting Perplexity API call');
    console.log('🔵 [AI Service] Topic:', topic);
    console.log('🔵 [AI Service] Count:', count);
    console.log('🔵 [AI Service] Difficulty:', difficulty);
    console.log('🔵 [AI Service] API Key exists:', !!PERPLEXITY_API_KEY);
    console.log('🔵 [AI Service] API Key preview:', PERPLEXITY_API_KEY ? PERPLEXITY_API_KEY.substring(0, 10) + '...' : 'NOT SET');
    
    const prompt = `Generate ${count} multiple-choice exam questions about "${topic}" with ${difficulty} difficulty level for university students. 

IMPORTANT: All questions and answers MUST be in Macedonian language (македонски јазик).

Return ONLY a JSON array with this exact format:
[
    {
        "question": "Прашање на македонски...",
        "options": ["Опција 1", "Опција 2", "Опција 3", "Опција 4"],
        "correctAnswer": 0,
        "points": 5
    }
]

Requirements:
- Write all questions in Macedonian
- Write all answer options in Macedonian
- Provide exactly 4 options per question
- correctAnswer is the index (0-3) of the correct option
- Each question should be unique and test understanding

Return ONLY the JSON array, no additional text.`;

    try {
        console.log('🔵 [AI Service] Making API request to:', PERPLEXITY_API_URL);
        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert educator who creates exam questions in Macedonian language. Always respond with ONLY valid JSON array format, no additional text or markdown. All questions and answers must be in Macedonian.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log('🔴 [AI Service] API request failed with status:', response.status);
            console.log('🔴 [AI Service] Error response:', errorText);
            throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
        }

        console.log('🟢 [AI Service] API request successful!');
        const data = await response.json();
        console.log('🟢 [AI Service] API response received:', data);
        let content = data.choices[0].message.content;
        console.log('🟢 [AI Service] Raw content from AI:', content);
        
        // Clean up the content - remove markdown code blocks if present
        content = content.trim();
        if (content.startsWith('```json')) {
            content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        } else if (content.startsWith('```')) {
            content = content.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }
        
        // Find JSON array in the content
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }
        
        console.log('🟢 [AI Service] Cleaned content:', content);
        
        // Parse the JSON response
        const questions = JSON.parse(content);
        
        // Validate the response format
        if (!Array.isArray(questions)) {
            throw new Error('Invalid response format from AI');
        }

        // Validate each question
        const validatedQuestions = questions.map((q, index) => {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'number') {
                throw new Error(`Invalid question format at index ${index}`);
            }
            
            return {
                question: q.question,
                options: q.options,
                correctAnswer: Math.max(0, Math.min(3, q.correctAnswer)),
                points: q.points || 5
            };
        });

        console.log('🟢 [AI Service] Successfully validated', validatedQuestions.length, 'questions');
        return {
            success: true,
            questions: validatedQuestions,
            source: 'perplexity'
        };

    } catch (error) {
        console.error('🔴 [AI Service] Error with Perplexity API:', error);
        console.log('🟡 [AI Service] Falling back to local question generation');
        
        // Return fallback questions if API fails
        const fallbackQuestions = generateFallbackQuestions(topic, count, difficulty);
        console.log('🟡 [AI Service] Generated', fallbackQuestions.length, 'fallback questions');
        
        return {
            success: true,
            error: error.message,
            questions: fallbackQuestions,
            source: 'fallback'
        };
    }
};

// IMPROVED Fallback question generation - Creates UNIQUE questions
const generateFallbackQuestions = (topic, count, difficulty) => {
    console.log('🟡 [Fallback] Generating questions for:', topic);
    console.log('🟡 [Fallback] Count:', count);
    console.log('🟡 [Fallback] Difficulty:', difficulty);
    
    // Large pool of diverse question templates
    const questionPool = [
        // Easy Questions
        {
            difficulty: 'easy',
            question: `What is the main purpose of ${topic}?`,
            options: [
                `To provide a foundation for understanding`,
                `To make things more complicated`,
                `To replace older methods entirely`,
                `To serve as decoration`
            ],
            correctAnswer: 0
        },
        {
            difficulty: 'easy',
            question: `Which of the following best describes ${topic}?`,
            options: [
                `A complex and inaccessible concept`,
                `A practical and useful tool`,
                `An outdated methodology`,
                `A purely theoretical idea`
            ],
            correctAnswer: 1
        },
        {
            difficulty: 'easy',
            question: `When learning ${topic}, what should you focus on first?`,
            options: [
                `Advanced techniques`,
                `Basic fundamentals`,
                `Expert-level concepts`,
                `Historical context only`
            ],
            correctAnswer: 1
        },
        {
            difficulty: 'easy',
            question: `Why is ${topic} important in modern applications?`,
            options: [
                `It's not important anymore`,
                `It provides essential functionality`,
                `It's only for academic purposes`,
                `It's being phased out`
            ],
            correctAnswer: 1
        },
        {
            difficulty: 'easy',
            question: `What is a common use case for ${topic}?`,
            options: [
                `Solving real-world problems`,
                `Making code more complex`,
                `Avoiding best practices`,
                `Replacing all other methods`
            ],
            correctAnswer: 0
        },
        // Medium Questions
        {
            difficulty: 'medium',
            question: `How does ${topic} improve system efficiency?`,
            options: [
                `By adding more complexity`,
                `By optimizing resource usage`,
                `By removing all features`,
                `By slowing down processes`
            ],
            correctAnswer: 1
        },
        {
            difficulty: 'medium',
            question: `What is the relationship between ${topic} and best practices?`,
            options: [
                `They are unrelated`,
                `${topic} contradicts best practices`,
                `${topic} aligns with best practices`,
                `Best practices make ${topic} obsolete`
            ],
            correctAnswer: 2
        },
        {
            difficulty: 'medium',
            question: `Which approach is most effective when implementing ${topic}?`,
            options: [
                `Ignoring documentation`,
                `Following established patterns`,
                `Using random methods`,
                `Avoiding testing`
            ],
            correctAnswer: 1
        },
        {
            difficulty: 'medium',
            question: `What challenge might you face when working with ${topic}?`,
            options: [
                `It's too simple to be useful`,
                `Understanding the underlying concepts`,
                `It has no practical applications`,
                `It's impossible to learn`
            ],
            correctAnswer: 1
        },
        {
            difficulty: 'medium',
            question: `How does ${topic} integrate with other technologies?`,
            options: [
                `It doesn't integrate at all`,
                `Through well-defined interfaces`,
                `By replacing everything`,
                `Only in isolated systems`
            ],
            correctAnswer: 1
        },
        // Hard Questions
        {
            difficulty: 'hard',
            question: `What are the advanced implications of ${topic} in distributed systems?`,
            options: [
                `No implications exist`,
                `It enables scalability and reliability`,
                `It prevents system growth`,
                `It's only for small applications`
            ],
            correctAnswer: 1
        },
        {
            difficulty: 'hard',
            question: `How would you optimize ${topic} for performance-critical applications?`,
            options: [
                `By avoiding it completely`,
                `Through careful profiling and refinement`,
                `By using default settings only`,
                `Performance optimization isn't possible`
            ],
            correctAnswer: 1
        },
        {
            difficulty: 'hard',
            question: `What architectural patterns work best with ${topic}?`,
            options: [
                `No patterns are compatible`,
                `Modular and scalable patterns`,
                `Only monolithic architectures`,
                `Deprecated patterns only`
            ],
            correctAnswer: 1
        },
        {
            difficulty: 'hard',
            question: `How does ${topic} handle edge cases and error scenarios?`,
            options: [
                `It ignores all errors`,
                `Through robust error handling mechanisms`,
                `By crashing the system`,
                `Errors are impossible`
            ],
            correctAnswer: 1
        },
        {
            difficulty: 'hard',
            question: `What trade-offs should be considered when using ${topic}?`,
            options: [
                `There are no trade-offs`,
                `Complexity vs. performance`,
                `It's always the best choice`,
                `Trade-offs don't matter`
            ],
            correctAnswer: 1
        }
    ];

    // Filter questions by difficulty
    const filteredQuestions = questionPool.filter(q => q.difficulty === difficulty);
    console.log('🟡 [Fallback] Questions matching difficulty:', filteredQuestions.length);
    
    // If we don't have enough questions for this difficulty, use all questions
    const availableQuestions = filteredQuestions.length >= count ? filteredQuestions : questionPool;
    console.log('🟡 [Fallback] Available questions:', availableQuestions.length);
    
    // Shuffle the questions to ensure randomness
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    console.log('🟡 [Fallback] Questions shuffled');
    
    // Select unique questions
    const selectedQuestions = [];
    for (let i = 0; i < count && i < shuffled.length; i++) {
        console.log(`🟡 [Fallback] Processing question ${i + 1}/${count}`);
        const template = shuffled[i];
        
        // Create a copy with shuffled options to add more variety
        const options = [...template.options];
        const correctOption = options[template.correctAnswer];
        
        // Shuffle options
        for (let j = options.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [options[j], options[k]] = [options[k], options[j]];
        }
        
        // Find new position of correct answer
        const newCorrectAnswer = options.indexOf(correctOption);
        
        const uniqueQuestion = {
            question: template.question,
            options: options,
            correctAnswer: newCorrectAnswer,
            points: 5
        };
        
        console.log(`🟡 [Fallback] Question ${i + 1}:`, uniqueQuestion.question.substring(0, 50));
        console.log(`🟡 [Fallback] Correct answer index:`, uniqueQuestion.correctAnswer);
        
        selectedQuestions.push(uniqueQuestion);
    }
    
    console.log('🟢 [Fallback] Successfully generated', selectedQuestions.length, 'unique questions');
    return selectedQuestions;
};

// Main function that tries different AI services
export const generateAIQuestions = async (topic, count, difficulty) => {
    console.log('🚀 [Main] generateAIQuestions called');
    console.log('🚀 [Main] Parameters:', { topic, count, difficulty });
    
    try {
        // Try Perplexity first
        console.log('🚀 [Main] Attempting Perplexity API...');
        const result = await generateQuestionsWithPerplexity(topic, count, difficulty);
        
        if (result.success && result.source === 'perplexity') {
            console.log('🟢 [Main] Perplexity API succeeded!');
            return result;
        }
        
        // Fallback to local generation
        console.log('🟡 [Main] Using fallback generation');
        const fallbackQuestions = generateFallbackQuestions(topic, count, difficulty);
        return {
            success: true,
            questions: fallbackQuestions,
            source: 'fallback'
        };
        
    } catch (error) {
        console.error('🔴 [Main] All AI services failed:', error);
        console.log('🟡 [Main] Using fallback as last resort');
        return {
            success: true,
            questions: generateFallbackQuestions(topic, count, difficulty),
            source: 'fallback'
        };
    }
};