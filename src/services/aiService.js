// AI Service for generating exam questions
// This would typically connect to Perplexity API or similar AI service

const PERPLEXITY_API_KEY = process.env.REACT_APP_PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Check if API key is configured
const isAPIConfigured = () => {
    return PERPLEXITY_API_KEY && PERPLEXITY_API_KEY !== 'your_perplexity_api_key_here';
};

export const generateQuestionsWithPerplexity = async (topic, count, difficulty) => {
    // Check if API is configured
    if (!isAPIConfigured()) {
        console.log('🔄 Perplexity API not configured, using fallback questions');
        return {
            success: true,
            questions: generateFallbackQuestions(topic, count, difficulty),
            source: 'fallback'
        };
    }

    const prompt = `Generate ${count} multiple-choice exam questions about "${topic}" with ${difficulty} difficulty level for university students.

Requirements:
- Each question should test understanding, not just memorization
- Provide exactly 4 options for each question
- Clearly indicate which option is correct
- Questions should be educational and appropriate for academic assessment
- Cover different aspects of the topic
- Use clear, concise language
- Avoid ambiguous wording

Format the response as a JSON array where each question has:
- question: the question text (clear and specific)
- options: array of 4 possible answers
- correctAnswer: index (0-3) of the correct answer
- points: 5

Example format:
[
    {
        "question": "What is the primary purpose of...",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 2,
        "points": 5
    }
]

Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: ${count}

IMPORTANT: Respond ONLY with the JSON array, no additional text or formatting.`;

    try {
        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert educator who creates high-quality exam questions. Always respond with valid JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7,
                top_p: 0.9,
                return_citations: false,
                search_domain_filter: ["edu"],
                return_images: false,
                return_related_questions: false,
                search_recency_filter: "month",
                top_k: 0,
                stream: false,
                presence_penalty: 0,
                frequency_penalty: 1
            })
        });

        if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;
        
        // Clean up the response - remove any markdown formatting
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Parse the JSON response
        let questions;
        try {
            questions = JSON.parse(content);
        } catch (parseError) {
            console.error('Failed to parse AI response:', content);
            throw new Error('Invalid JSON response from AI service');
        }
        
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
                correctAnswer: Math.max(0, Math.min(3, q.correctAnswer)), // Ensure correctAnswer is 0-3
                points: q.points || 5
            };
        });

        return {
            success: true,
            questions: validatedQuestions
        };

    } catch (error) {
        console.error('Error generating questions with Perplexity:', error);
        
        // Return fallback questions if API fails
        return {
            success: false,
            error: error.message,
            questions: generateFallbackQuestions(topic, count, difficulty)
        };
    }
};

// Fallback question generation when API is not available
const generateFallbackQuestions = (topic, count, difficulty) => {
    // Topic-specific question templates
    const topicTemplates = {
        javascript: {
            easy: [
                {
                    question: "What is the correct way to declare a variable in JavaScript?",
                    options: ["var myVar;", "variable myVar;", "v myVar;", "declare myVar;"],
                    correctAnswer: 0
                },
                {
                    question: "Which method is used to add an element to the end of an array?",
                    options: ["push()", "add()", "append()", "insert()"],
                    correctAnswer: 0
                }
            ],
            medium: [
                {
                    question: "What is the difference between '==' and '===' in JavaScript?",
                    options: [
                        "No difference",
                        "=== checks type and value, == only checks value",
                        "== checks type and value, === only checks value",
                        "=== is faster than =="
                    ],
                    correctAnswer: 1
                }
            ],
            hard: [
                {
                    question: "What is a closure in JavaScript?",
                    options: [
                        "A way to close the browser",
                        "A function that has access to outer scope variables",
                        "A method to end a loop",
                        "A type of error handling"
                    ],
                    correctAnswer: 1
                }
            ]
        },
        python: {
            easy: [
                {
                    question: "How do you create a comment in Python?",
                    options: ["// comment", "/* comment */", "# comment", "-- comment"],
                    correctAnswer: 2
                }
            ],
            medium: [
                {
                    question: "What is the difference between a list and a tuple in Python?",
                    options: [
                        "Lists are mutable, tuples are immutable",
                        "Tuples are mutable, lists are immutable",
                        "No difference",
                        "Lists are faster than tuples"
                    ],
                    correctAnswer: 0
                }
            ],
            hard: [
                {
                    question: "What is a decorator in Python?",
                    options: [
                        "A way to decorate code with comments",
                        "A function that modifies another function",
                        "A type of loop",
                        "A method to handle errors"
                    ],
                    correctAnswer: 1
                }
            ]
        }
    };

    // Generic templates for any topic
    const difficultyTemplates = {
        easy: [
            {
                question: `What is the basic definition of ${topic}?`,
                options: [
                    `${topic} is a fundamental concept in computer science`,
                    `${topic} is only used in advanced programming`,
                    `${topic} is obsolete technology`,
                    `${topic} is a type of hardware`
                ],
                correctAnswer: 0
            },
            {
                question: `Which statement about ${topic} is most accurate?`,
                options: [
                    `It's only theoretical`,
                    `It's only practical`,
                    `It combines theory and practice`,
                    `It's not important to learn`
                ],
                correctAnswer: 2
            }
        ],
        medium: [
            {
                question: `What are the key principles of ${topic}?`,
                options: [
                    `Simplicity and clarity`,
                    `Complexity and depth`,
                    `Theory and application`,
                    `All of the above`
                ],
                correctAnswer: 3
            },
            {
                question: `How does ${topic} apply in real-world scenarios?`,
                options: [
                    `Through theoretical analysis`,
                    `Through practical implementation`,
                    `Through research and development`,
                    `Through all of the above methods`
                ],
                correctAnswer: 3
            }
        ],
        hard: [
            {
                question: `What are the advanced implications of ${topic} in modern systems?`,
                options: [
                    `Limited to academic research`,
                    `Applicable only in specific domains`,
                    `Fundamental to system architecture`,
                    `Relevant across multiple disciplines`
                ],
                correctAnswer: 3
            },
            {
                question: `How does ${topic} integrate with contemporary methodologies?`,
                options: [
                    `Through isolated implementation`,
                    `Through interdisciplinary approaches`,
                    `Through traditional methods only`,
                    `Through theoretical frameworks exclusively`
                ],
                correctAnswer: 1
            }
        ]
    };

    // Check if we have specific templates for this topic
    const topicKey = topic.toLowerCase().replace(/\s+/g, '');
    const specificTemplates = topicTemplates[topicKey];
    
    let templates;
    if (specificTemplates && specificTemplates[difficulty]) {
        templates = specificTemplates[difficulty];
    } else {
        templates = difficultyTemplates[difficulty] || difficultyTemplates.medium;
    }
    
    const questions = [];
    
    for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        questions.push({
            question: template.question,
            options: [...template.options], // Create a copy of options
            correctAnswer: template.correctAnswer,
            points: 5
        });
    }
    
    return questions;
};

// Alternative: Use OpenAI API if Perplexity is not available
export const generateQuestionsWithOpenAI = async (topic, count, difficulty) => {
    // This would be similar to Perplexity but using OpenAI's API
    // Implementation would be similar but with different API endpoints and parameters
    console.log('OpenAI integration would go here');
    return generateFallbackQuestions(topic, count, difficulty);
};

// Main function that tries different AI services
export const generateAIQuestions = async (topic, count, difficulty) => {
    try {
        // Try Perplexity first
        const result = await generateQuestionsWithPerplexity(topic, count, difficulty);
        if (result.success) {
            return result;
        }
        
        // Fallback to local generation
        return {
            success: true,
            questions: generateFallbackQuestions(topic, count, difficulty),
            source: 'fallback'
        };
        
    } catch (error) {
        console.error('All AI services failed:', error);
        return {
            success: true,
            questions: generateFallbackQuestions(topic, count, difficulty),
            source: 'fallback'
        };
    }
};