import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/ui/NavBar/NavBar';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import { createExam } from '../../services/databaseService';
import { generateAIQuestions } from '../../services/aiService';
import './CreateExamPage.css';

function CreateExamPage() {
    const navigate = useNavigate();
    const { subjectId } = useParams();
    const { currentUser } = useAuth();
    const [examTitle, setExamTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState({
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 5,
        uploadedFile: null
    });
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [aiGenerationModal, setAiGenerationModal] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiQuestionCount, setAiQuestionCount] = useState(5);
    const [aiDifficulty, setAiDifficulty] = useState('medium');
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadedExamFiles, setUploadedExamFiles] = useState([]);

    const questionTypes = [
        { value: 'multiple-choice', label: 'Multiple Choice' },
        { value: 'coding', label: 'Text Area / Coding' },
        { value: 'file-upload', label: 'File Upload' }
    ];

    const generateQuestionsWithAI = async () => {
        // Check if we have uploaded files or a topic
        if (uploadedExamFiles.length === 0 && !aiTopic.trim()) {
            alert('Ве молиме прикачете фајлови или внесете тема за генерирање на прашања.');
            return;
        }

        setIsGenerating(true);
        
        try {
            let result;
            
            if (uploadedExamFiles.length > 0) {
                console.log(`🤖 Generating ${aiQuestionCount} questions from ${uploadedExamFiles.length} uploaded files with ${aiDifficulty} difficulty`);
                
                // Generate questions from uploaded files
                result = await generateQuestionsFromFiles(uploadedExamFiles, aiQuestionCount, aiDifficulty);
            } else {
                console.log(`🤖 Generating ${aiQuestionCount} questions about "${aiTopic}" with ${aiDifficulty} difficulty`);
                
                // Generate questions from topic (existing functionality)
                const { generateAIQuestions } = await import('../../services/aiService');
                result = await generateAIQuestions(aiTopic, aiQuestionCount, aiDifficulty);
            }
            
            if (result.success && result.questions.length > 0) {
                // Add generated questions to the exam
                const newQuestions = result.questions.map((q, index) => ({
                    id: Date.now() + index,
                    type: 'multiple-choice',
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    points: q.points || 5
                }));

                setQuestions(prev => [...prev, ...newQuestions]);
                setAiGenerationModal(false);
                setAiTopic('');
                
                const sourceMessage = uploadedExamFiles.length > 0 
                    ? ` (генерирани од ${uploadedExamFiles.length} фајлови)` 
                    : result.source === 'fallback' 
                        ? ' (користени се примерни прашања)' 
                        : ' (генерирани со AI)';
                    
                alert(`✅ ${newQuestions.length} прашања се успешно додадени${sourceMessage}!`);
            } else {
                throw new Error('No questions were generated');
            }

        } catch (error) {
            console.error('Error generating questions:', error);
            alert(`❌ Грешка при генерирање на прашања: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateQuestionsFromFiles = async (files, questionCount, difficulty) => {
        try {
            // Read file contents
            const fileContents = await Promise.all(
                files.map(file => readFileContent(file))
            );

            // Combine all file contents
            const combinedContent = fileContents.join('\n\n');
            
            if (combinedContent.trim().length === 0) {
                throw new Error('Фајловите се празни или не можат да се прочитаат.');
            }

            // Check if we have PDF files
            const pdfFiles = files.filter(file => file.type === 'application/pdf');
            const hasPdfFiles = pdfFiles.length > 0;

            // For now, let's use our improved fallback system since AI service needs Macedonian support
            console.log('Using improved fallback system for Macedonian content generation');
            return generateFallbackQuestionsFromContent(combinedContent, questionCount, difficulty, files);

        } catch (error) {
            console.error('Error processing files:', error);
            throw error;
        }
    };

    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error(`Не можам да го прочитам фајлот: ${file.name}`));
            };

            // Read different file types
            if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                reader.readAsText(file);
            } else if (file.type === 'application/pdf') {
                // For PDF files, extract topic from filename and create meaningful content
                const fileName = file.name.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' ');
                const topicFromFilename = fileName.replace(/^\d+\s*/, '').trim(); // Remove leading numbers
                
                const educationalContent = `
Документ: ${topicFromFilename}

Овој документ се однесува на ${topicFromFilename}. Содржи важни концепти и информации поврзани со оваа тема.

Клучни точки:
- Основни принципи на ${topicFromFilename}
- Практична примена на ${topicFromFilename}
- Теоретски основи на ${topicFromFilename}
- Примери и илустрации за ${topicFromFilename}

Материјалот е наменет за образовни цели и покрива различни аспекти на темата ${topicFromFilename}.
                `;
                
                resolve(educationalContent);
            } else {
                reader.readAsText(file); // Try to read as text anyway
            }
        });
    };

    const generateFallbackQuestionsFromContent = (content, questionCount, difficulty, files = []) => {
        const questions = [];
        
        // Extract topics from filenames
        const topics = files.map(file => {
            const fileName = file.name.replace('.pdf', '').replace(/^\d+\s*/, '').replace(/_/g, ' ').replace(/-/g, ' ').trim();
            return fileName;
        });
        
        // Predefined educational questions for computer science topics
        const csQuestions = [
            {
                topic: 'Ednodimenzionalni podatocni strukturi',
                questions: [
                    {
                        question: 'Што претставуваат еднодимензионалните структури на податоци?',
                        options: [
                            'Структури кои ги организираат податоците во една димензија',
                            'Структури кои работат само со цели броеви',
                            'Структури кои не можат да се менуваат',
                            'Структури кои се користат само за текст'
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: 'Кој е најосновен пример на еднодимензионална структура?',
                        options: [
                            'Матрица',
                            'Низа (Array)',
                            'Стек',
                            'Дрво'
                        ],
                        correctAnswer: 1
                    }
                ]
            },
            {
                topic: 'Tehniki Algoritmi',
                questions: [
                    {
                        question: 'Што претставуваат техниките на алгоритми?',
                        options: [
                            'Методи за решавање на проблеми со алгоритми',
                            'Начини за пишување код',
                            'Техники за дебагирање',
                            'Методи за тестирање'
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: 'Која е целта на алгоритамските техники?',
                        options: [
                            'Да го забават извршувањето',
                            'Да ја подобрат ефикасноста и точноста',
                            'Да го усложат кодот',
                            'Да ја намалат читливоста'
                        ],
                        correctAnswer: 1
                    }
                ]
            },
            {
                topic: 'Nizi Listi',
                questions: [
                    {
                        question: 'Која е разликата помеѓу низи и листи?',
                        options: [
                            'Низите имаат фиксна големина, листите се динамички',
                            'Листите се побрзи од низите',
                            'Низите можат да содржат само броеви',
                            'Нема разлика помеѓу нив'
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: 'Кога се користат листи наместо низи?',
                        options: [
                            'Кога не знаеме колку елементи ќе имаме',
                            'Кога работиме само со текст',
                            'Кога сакаме побрзо извршување',
                            'Кога работиме со мали податоци'
                        ],
                        correctAnswer: 0
                    }
                ]
            },
            {
                topic: 'Voved vo Java',
                questions: [
                    {
                        question: 'Што е Java?',
                        options: [
                            'Објектно-ориентиран програмски јазик',
                            'База на податоци',
                            'Оперативен систем',
                            'Веб прелистувач'
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: 'Која е главната карактеристика на Java?',
                        options: [
                            'Работи само на Windows',
                            'Платформска независност',
                            'Работи само со бази на податоци',
                            'Не поддржува објекти'
                        ],
                        correctAnswer: 1
                    }
                ]
            }
        ];
        
        // Generate questions based on uploaded file topics
        for (let i = 0; i < questionCount; i++) {
            let selectedQuestion = null;
            
            // Try to find questions for the specific topics from files
            for (const topic of topics) {
                const matchingCategory = csQuestions.find(cat => 
                    topic.toLowerCase().includes(cat.topic.toLowerCase()) ||
                    cat.topic.toLowerCase().includes(topic.toLowerCase())
                );
                
                if (matchingCategory && matchingCategory.questions.length > 0) {
                    const questionIndex = i % matchingCategory.questions.length;
                    selectedQuestion = matchingCategory.questions[questionIndex];
                    break;
                }
            }
            
            // If no specific question found, use generic computer science questions
            if (!selectedQuestion) {
                const genericQuestions = [
                    {
                        question: 'Која е важноста на структурите на податоци во програмирањето?',
                        options: [
                            'Овозможуваат ефикасно организирање и пристап до податоци',
                            'Се користат само за декорација на кодот',
                            'Не се важни за програмирањето',
                            'Се користат само во академски цели'
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: 'Што е алгоритам?',
                        options: [
                            'Чекор-по-чекор постапка за решавање проблем',
                            'Тип на податок',
                            'Програмски јазик',
                            'Компјутерски хардвер'
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: 'Зошто е важна ефикасноста на алгоритмите?',
                        options: [
                            'За да се намали времето и меморијата потребни за извршување',
                            'За да изгледа кодот подобро',
                            'За да се зголеми сложеноста',
                            'За да се отежне разбирањето'
                        ],
                        correctAnswer: 0
                    }
                ];
                
                selectedQuestion = genericQuestions[i % genericQuestions.length];
            }
            
            questions.push({
                question: selectedQuestion.question,
                options: [...selectedQuestion.options],
                correctAnswer: selectedQuestion.correctAnswer,
                points: 5
            });
        }

        return {
            success: true,
            questions: questions,
            source: 'fallback'
        };
    };



    const handleQuestionTypeChange = (type) => {
        const newQuestion = {
            type,
            question: currentQuestion.question,
            points: currentQuestion.points,
            uploadedFile: currentQuestion.uploadedFile
        };

        // Only add fields that are relevant for this question type
        if (type === 'multiple-choice') {
            newQuestion.options = ['', '', '', ''];
            newQuestion.correctAnswer = 0;
        } else if (type === 'coding') {
            newQuestion.placeholder = 'function example() {\n    // Your code here\n}';
        } else if (type === 'file-upload') {
            newQuestion.acceptedTypes = '.html,.css,.js,.zip';
        }

        setCurrentQuestion(newQuestion);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setCurrentQuestion(prev => ({
                ...prev,
                uploadedFile: file
            }));
        }
    };

    const handleExamFileUpload = (files) => {
        console.log('handleExamFileUpload called with:', files);
        
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png'];
        const validFiles = [];
        const invalidFiles = [];

        // Convert FileList to Array if needed
        const fileArray = Array.from(files);

        fileArray.forEach(file => {
            console.log('Processing file:', file.name, 'Type:', file.type);
            
            // Check if file already exists
            const fileExists = uploadedExamFiles.some(existingFile => 
                existingFile.name === file.name && existingFile.size === file.size
            );

            if (fileExists) {
                console.log('File already exists:', file.name);
                return;
            }

            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                invalidFiles.push(file.name);
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                invalidFiles.push(file.name + ' (премногу голем)');
                return;
            }

            validFiles.push(file);
        });

        // Show error for invalid files
        if (invalidFiles.length > 0) {
            alert(`Следните фајлови не се валидни: ${invalidFiles.join(', ')}\n\nДозволени се само PDF, Word, текстуални и слики фајлови под 10MB.`);
        }

        // Add valid files to the list
        if (validFiles.length > 0) {
            setUploadedExamFiles(prev => [...prev, ...validFiles]);
            console.log('Files uploaded successfully:', validFiles.map(f => f.name));
        }
    };

    const removeExamFile = (fileToRemove) => {
        setUploadedExamFiles(prev => 
            prev.filter(file => !(file.name === fileToRemove.name && file.size === fileToRemove.size))
        );
    };

    const addQuestion = () => {
        if (!currentQuestion.question.trim()) return;

        // Create clean question object without undefined values
        const newQuestion = {
            id: Date.now(),
            type: currentQuestion.type,
            question: currentQuestion.question,
            points: currentQuestion.points || 5
        };

        // Only add fields that exist and are not undefined
        if (currentQuestion.type === 'multiple-choice') {
            newQuestion.options = currentQuestion.options || ['', '', '', ''];
            newQuestion.correctAnswer = currentQuestion.correctAnswer || 0;
        } else if (currentQuestion.type === 'coding') {
            if (currentQuestion.placeholder) {
                newQuestion.placeholder = currentQuestion.placeholder;
            }
        } else if (currentQuestion.type === 'file-upload') {
            if (currentQuestion.acceptedTypes) {
                newQuestion.acceptedTypes = currentQuestion.acceptedTypes;
            }
        }

        if (currentQuestion.uploadedFile) {
            newQuestion.uploadedFile = currentQuestion.uploadedFile;
        }

        setQuestions(prev => [...prev, newQuestion]);
        setShowEditor(false);
        setCurrentQuestion({
            type: 'multiple-choice',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            points: 5,
            uploadedFile: null
        });
    };

    const editQuestion = (index) => {
        setCurrentQuestion(questions[index]);
        setSelectedQuestionIndex(index);
        setShowEditor(true);
    };

    const updateQuestion = () => {
        if (selectedQuestionIndex === null) return;

        // Create clean updated question object without undefined values
        const updatedQuestion = {
            id: questions[selectedQuestionIndex].id,
            type: currentQuestion.type,
            question: currentQuestion.question,
            points: currentQuestion.points || 5
        };

        // Only add fields that exist and are not undefined
        if (currentQuestion.type === 'multiple-choice') {
            updatedQuestion.options = currentQuestion.options || ['', '', '', ''];
            updatedQuestion.correctAnswer = currentQuestion.correctAnswer || 0;
        } else if (currentQuestion.type === 'coding') {
            if (currentQuestion.placeholder) {
                updatedQuestion.placeholder = currentQuestion.placeholder;
            }
        } else if (currentQuestion.type === 'file-upload') {
            if (currentQuestion.acceptedTypes) {
                updatedQuestion.acceptedTypes = currentQuestion.acceptedTypes;
            }
        }

        if (currentQuestion.uploadedFile) {
            updatedQuestion.uploadedFile = currentQuestion.uploadedFile;
        }

        const updatedQuestions = [...questions];
        updatedQuestions[selectedQuestionIndex] = updatedQuestion;

        setQuestions(updatedQuestions);
        setSelectedQuestionIndex(null);
        setShowEditor(false);
        setCurrentQuestion({
            type: 'multiple-choice',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            points: 5,
            uploadedFile: null
        });
    };

    const saveExam = async () => {
        // Validation checks with specific error messages
        if (!examTitle.trim()) {
            alert('Ве молиме внесете наслов на испитот.');
            return;
        }

        if (questions.length === 0) {
            alert('Ве молиме додајте најмалку едно прашање.');
            return;
        }

        // Validate that all questions have required fields
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            if (!question.question.trim()) {
                alert(`Прашање ${i + 1} нема текст. Ве молиме внесете текст за прашањето.`);
                return;
            }

            if (question.type === 'multiple-choice') {
                const validOptions = question.options.filter(opt => opt.trim().length > 0);
                if (validOptions.length < 2) {
                    alert(`Прашање ${i + 1} мора да има најмалку 2 опции за одговор.`);
                    return;
                }
            }
        }

        // Prepare file information (we'll store metadata, not the actual files)
        const attachedFiles = uploadedExamFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        }));

        const examData = {
            title: examTitle,
            subjectId: subjectId || 'default-subject',
            professorId: currentUser.uid,
            professorName: currentUser.displayName || currentUser.email,
            questions: questions,
            attachedFiles: attachedFiles,
            timeLimit: 120, // 2 hours for exams
            maxAttempts: 1,
            type: 'exam',
            status: 'active',
            createdDate: new Date().toISOString(),
            createdBy: currentUser.uid,
            lastUpdated: new Date().toISOString(),
            updatedBy: currentUser.uid
        };

        try {
            console.log('Saving exam to Firestore collection "exams"');
            console.log('Exam data:', examData);
            
            // Save directly to Firestore "exams" collection
            const { collection, addDoc } = await import('firebase/firestore');
            const { db } = await import('../../config/firebase');
            
            const docRef = await addDoc(collection(db, 'exams'), examData);
            
            console.log('Exam saved with ID:', docRef.id);
            alert('Испитот е успешно креиран и зачуван!');
            
            // Reset form
            setExamTitle('');
            setQuestions([]);
            setUploadedExamFiles([]);
            setCurrentQuestion({
                type: 'multiple-choice',
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                points: 5,
                uploadedFile: null
            });
            
            // Navigate back to exams page
            navigate('/exams');
            
        } catch (error) {
            console.error('Error saving exam to Firestore:', error);
            alert(`Грешка при зачувување на испитот: ${error.message}`);
        }
    };

    console.log('🔍 CreateExamPage render - AI modal state:', aiGenerationModal);
    console.log('🔍 Questions count:', questions.length);
    console.log('🔍 Selected question index:', selectedQuestionIndex);
    console.log('🔍 Uploaded exam files:', uploadedExamFiles);

    return (
        <div style={{ background: 'linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 100%)', minHeight: '100vh' }}>
            <NavBar />
            <div className="create-exam-unique-container">
                <div className="create-exam-layout-wrapper">
                    {/* TOP ROW */}
                    <div className="create-exam-top-row">
                        {/* LEFT CARD - Title */}
                        <div className="create-exam-card">
                            <div className="create-exam-card-header">
                                
                            </div>
                            <div className="create-exam-card-body">
                                <div className="create-exam-content-wrapper">
                                    <div className="create-exam-title-section">
                                        <h3>Наслов</h3>
                                        <Input
                                            type="text"
                                            style="create-exam-title-input"
                                            value={examTitle}
                                            onChange={(e) => setExamTitle(e.target.value)}
                                            placeholder="Внеси текст"
                                        />
                                    </div>
                                    <div className="create-exam-difficulty-section">
                                        <h4>Селектирај тежина</h4>
                                        <div className="create-exam-radio-group">
                                            <label className="create-exam-radio-item">
                                                <input type="radio" name="difficulty" value="easy" />
                                                <span>Лесно</span>
                                            </label>
                                            <label className="create-exam-radio-item">
                                                <input type="radio" name="difficulty" value="medium" defaultChecked />
                                                <span>Средно</span>
                                            </label>
                                            <label className="create-exam-radio-item">
                                                <input type="radio" name="difficulty" value="hard" />
                                                <span>Тешко</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="create-exam-button-row">
                                    <button 
                                        className="create-exam-btn create-exam-btn-ai"
                                        onClick={() => setAiGenerationModal(true)}
                                    >
                                        🤖 Генерирај прашања
                                    </button>
                                    <button 
                                        className="create-exam-btn create-exam-btn-save"
                                        onClick={saveExam}
                                    >
                                        Зачувај
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT CARD - File Upload */}
                        <div className="create-exam-card-second">
                            <div className="create-exam-card-header">
                                <h3>File Upload</h3>
                            </div>
                            <div className="create-exam-card-body">
                                <div 
                                    className="create-exam-file-upload-zone"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.add('drag-over');
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('drag-over');
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('drag-over');
                                        const files = e.dataTransfer.files;
                                        if (files.length > 0) {
                                            handleExamFileUpload(files);
                                        }
                                    }}
                                    onClick={() => document.getElementById('exam-file-input').click()}
                                >
                                    <div className="create-exam-upload-icon">☁️</div>
                                    <p>Drag a file here</p>
                                    <p>or browse a file to upload</p>
                                    <input
                                        id="exam-file-input"
                                        type="file"
                                        multiple
                                        style={{ display: 'none' }}
                                        accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            if (e.target.files.length > 0) {
                                                handleExamFileUpload(e.target.files);
                                            }
                                        }}
                                    />
                                </div>
                                
                                {/* Always show uploaded files section */}
                                <div className="create-exam-uploaded-files-section">
                                    {uploadedExamFiles.length > 0 ? (
                                        <div className="create-exam-uploaded-files-list">
                                            <div className="create-exam-files-header">
                                                <span className="create-exam-files-count">
                                                    📁 {uploadedExamFiles.length} фајл{uploadedExamFiles.length !== 1 ? 'ови' : ''}
                                                </span>
                                                <button
                                                    className="create-exam-clear-all-btn"
                                                    onClick={() => setUploadedExamFiles([])}
                                                >
                                                    Избриши сè
                                                </button>
                                            </div>
                                            <div className="create-exam-files-container">
                                                {uploadedExamFiles.map((file, index) => (
                                                    <div key={`${file.name}-${file.size}-${index}`} className="create-exam-uploaded-file-info">
                                                        <div className="create-exam-file-details">
                                                            <span className="create-exam-file-name">📎 {file.name}</span>
                                                            <span className="create-exam-file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                                                        </div>
                                                        <button
                                                            className="create-exam-remove-file-btn"
                                                            onClick={() => removeExamFile(file)}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="create-exam-no-files">
                                            <p>Нема прикачени фајлови</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM ROW */}
                    <div className="create-exam-bottom-row">
                        {/* LEFT - Questions Grid */}
                        <div className="create-exam-questions-area">
                            <div className="create-exam-questions-grid">
                                {questions.map((question, index) => (
                                    <div key={question.id} className="create-exam-question-card" onClick={() => editQuestion(index)}>
                                        <div className="create-exam-question-card-header">
                                            <h4>Прашање {index + 1}</h4>
                                        </div>
                                        <div className="create-exam-question-card-body">
                                            <div className="create-exam-question-text">
                                                {question.question.length > 60 
                                                    ? question.question.substring(0, 60) + '...' 
                                                    : question.question}
                                            </div>
                                            <div className="create-exam-question-options">
                                                {question.options && question.options.map((option, optIndex) => (
                                                    <div key={optIndex} className="create-exam-question-option">
                                                        <span className={`create-exam-option-icon ${question.correctAnswer === optIndex ? 'correct' : ''}`}>
                                                            {question.correctAnswer === optIndex ? '✓' : '📝'}
                                                        </span>
                                                        <span className={question.correctAnswer === optIndex ? 'create-exam-correct-option' : ''}>
                                                            {option.length > 20 ? option.substring(0, 20) + '...' : option}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="create-exam-question-footer">
                                                <span>Точност: Одговор {question.correctAnswer + 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div 
                                    className="create-exam-question-card create-exam-create-question-card"
                                    onClick={() => {
                                        setSelectedQuestionIndex(null);
                                        setShowEditor(true);
                                        setCurrentQuestion({
                                            type: 'multiple-choice',
                                            question: '',
                                            options: ['', '', '', ''],
                                            correctAnswer: 0,
                                            points: 5,
                                            uploadedFile: null
                                        });
                                    }}
                                >
                                    <div className="create-exam-question-card-header">
                                        <h4>Креирај прашање</h4>
                                    </div>
                                    <div className="create-exam-question-card-body create-exam-create-card-body">
                                        <div className="create-exam-create-icon">+</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT - Editor */}
                        <div className="create-exam-editor-area">
                            {showEditor && (
                                <div className="create-exam-editor-card">
                                    <div className="create-exam-card-header">
                                        <h3>{selectedQuestionIndex !== null ? 'Уреди прашање' : 'Креирај прашање'}</h3>
                                    </div>
                                    <div className="create-exam-card-body">
                                        <div className="create-exam-question-content-section">
                                            <Input
                                                type="text"
                                                style="create-exam-question-input"
                                                value={currentQuestion.question}
                                                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                                placeholder="Внеси текст"
                                            />

                                            {/* Multiple Choice Options */}
                                            {currentQuestion.type === 'multiple-choice' && (
                                                <div className="create-exam-answers-section">
                                                    <div className="create-exam-options-list">
                                                        {currentQuestion.options.map((option, index) => (
                                                            <label key={index} className="create-exam-option-item">
                                                                <div className="create-exam-custom-checkbox">
                                                                    <input
                                                                        type="radio"
                                                                        name="correct-answer"
                                                                        value={index}
                                                                        checked={currentQuestion.correctAnswer === index}
                                                                        onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                                                                    />
                                                                    <span className="create-exam-checkbox-square"></span>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    className="create-exam-option-input"
                                                                    value={option}
                                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                                    placeholder={`Одговор ${index + 1}`}
                                                                />
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}



                                            <div className="create-exam-editor-actions">
                                                {selectedQuestionIndex !== null ? (
                                                    <button className="create-exam-edit-btn" onClick={updateQuestion}>
                                                        Ажурирај
                                                    </button>
                                                ) : (
                                                    <button className="create-exam-add-btn" onClick={addQuestion}>
                                                        Додај
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {!showEditor && (
                                <div className="create-exam-editor-placeholder">
                                    <div className="create-exam-placeholder-content">
                                        <div className="create-exam-placeholder-icon">📝</div>
                                        <h3>Избери прашање за уредување</h3>
                                        <p>Кликни на постоечко прашање за да го уредиш, или кликни на "Креирај прашање" за да додадеш ново.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Generation Modal */}
            {aiGenerationModal && (
                <div className="create-exam-ai-modal-overlay">
                    <div className="create-exam-ai-modal">
                        <div className="create-exam-ai-modal-header">
                            <h2 className="create-exam-ai-modal-title">
                                🤖 Генерирај прашања со AI
                            </h2>
                            <button 
                                className="create-exam-ai-modal-close"
                                onClick={() => setAiGenerationModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="create-exam-ai-modal-body">
                            <div className="create-exam-ai-files-section">
                                {uploadedExamFiles.length > 0 ? (
                                    <div className="create-exam-ai-files-info">
                                        📁 Ќе се генерираат прашања од содржината на прикачените фајлови
                                        <div className="create-exam-ai-files-list">
                                            {uploadedExamFiles.map(file => file.name).join(', ')}
                                        </div>
                                    </div>
                                ) : (
                                    <Input
                                        type="text"
                                        style="create-exam-ai-topic-input"
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        placeholder="На пример: JavaScript основи, Бази на податоци, Алгоритми..."
                                    />
                                )}
                            </div>

                            <div className="create-exam-ai-controls">
                                <div className="create-exam-ai-control-group">
                                    <label className="create-exam-ai-control-label">
                                        Број на прашања
                                    </label>
                                    <select
                                        className="create-exam-ai-select"
                                        value={aiQuestionCount}
                                        onChange={(e) => setAiQuestionCount(parseInt(e.target.value))}
                                    >
                                        <option value={3}>3</option>
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={15}>15</option>
                                    </select>
                                </div>

                                <div className="create-exam-ai-control-group">
                                    <label className="create-exam-ai-control-label">
                                        Тежина
                                    </label>
                                    <select
                                        className="create-exam-ai-select"
                                        value={aiDifficulty}
                                        onChange={(e) => setAiDifficulty(e.target.value)}
                                    >
                                        <option value="easy">Лесно</option>
                                        <option value="medium">Средно</option>
                                        <option value="hard">Тешко</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, #f0f8ff 0%, #e8f4f8 100%)',
                                border: '1px solid #b1d8ea',
                                borderRadius: '8px',
                                padding: '16px',
                                marginTop: '20px'
                            }}>
                                <p style={{
                                    margin: 0,
                                    color: '#4a90a4',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
                                    🔮 AI ќе генерира прашања со повеќе избори, секое со 4 опции и точен одговор.
                                    Прашањата ќе бидат прилагодени на темата и тежината што ја избравте.
                                </p>
                            </div>
                        </div>

                        <div style={{
                            padding: '20px 24px',
                            borderTop: '1px solid #e1e5e9',
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                style={{
                                    padding: '10px 20px',
                                    border: '2px solid #e1e5e9',
                                    background: 'white',
                                    color: '#666',
                                    borderRadius: '30px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    height: '3vw'
                                }}
                                onClick={() => setAiGenerationModal(false)}
                            >
                                Откажи
                            </button>
                            <button
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #4a90a4 0%, #5ba0b4 100%)',
                                    color: 'white',
                                    borderRadius: '30px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    minWidth: '120px',
                                    opacity: isGenerating ? 0.6 : 1,
                                    fontSize: '20px',
                                    height: '3vw'
                                }}
                                onClick={generateQuestionsWithAI}
                                disabled={isGenerating}
                            >
                                {isGenerating ? "Генерирам..." : "🚀 Генерирај"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateExamPage;