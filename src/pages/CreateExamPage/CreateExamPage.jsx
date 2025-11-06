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

    const questionTypes = [
        { value: 'multiple-choice', label: 'Multiple Choice' },
        { value: 'coding', label: 'Text Area / Coding' },
        { value: 'file-upload', label: 'File Upload' }
    ];

    const generateQuestionsWithAI = async () => {
        if (!aiTopic.trim()) {
            alert('Ве молиме внесете тема за генерирање на прашања.');
            return;
        }

        setIsGenerating(true);
        
        try {
            console.log(`🤖 Generating ${aiQuestionCount} questions about "${aiTopic}" with ${aiDifficulty} difficulty`);
            
            const result = await generateAIQuestions(aiTopic, aiQuestionCount, aiDifficulty);
            
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
                
                const sourceMessage = result.source === 'fallback' 
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

        const examData = {
            title: examTitle,
            subjectId: subjectId || 'default-subject',
            professorId: currentUser.uid,
            questions: questions,
            timeLimit: 120, // 2 hours for exams
            maxAttempts: 1,
            type: 'exam' // Add type to distinguish from labs
        };

        try {
            console.log('Creating exam with subjectId:', subjectId);
            console.log('Saving exam data:', examData);
            const result = await createExam(examData);

            if (result.success) {
                alert('Испитот е успешно креиран!');
                navigate('/exams'); // Navigate back to exam page
            } else {
                console.error('Exam creation failed:', result.error);
                alert(`Грешка при креирање: ${result.error || 'Непозната грешка'}`);
            }
        } catch (error) {
            console.error('Error creating exam:', error);
            alert(`Грешка при креирање на испитот: ${error.message}`);
        }
    };

    console.log('🔍 CreateExamPage render - AI modal state:', aiGenerationModal);
    console.log('🔍 Questions count:', questions.length);
    console.log('🔍 Selected question index:', selectedQuestionIndex);

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
                                <h3>Наслов</h3>
                                <Input
                                    type="text"
                                    style="exam-title-input"
                                    value={examTitle}
                                    onChange={(e) => setExamTitle(e.target.value)}
                                    placeholder="Внеси текст"
                                />
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
                        <div className="create-exam-card">
                            <div className="create-exam-card-header">
                                <h3>File Upload</h3>
                            </div>
                            <div className="create-exam-card-body">
                                <div className="create-exam-file-upload-zone">
                                    <div className="create-exam-upload-icon">☁️</div>
                                    <p>Drag a file here</p>
                                    <p>or browse a file to upload</p>
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
                                        <textarea
                                            className="create-exam-question-input"
                                            value={currentQuestion.question}
                                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                            placeholder={selectedQuestionIndex !== null ? 'Уреди го текстот на прашањето' : 'Внеси текст на прашањето'}
                                            rows={3}
                                        />
                                        <div className="create-exam-answer-options">
                                            {currentQuestion.type === 'multiple-choice' && currentQuestion.options.map((option, index) => (
                                                <div key={index} className="create-exam-answer-item-editable">
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                                        placeholder={`Одговор ${index + 1}`}
                                                        className="create-exam-option-input"
                                                    />
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        checked={currentQuestion.correctAnswer === index}
                                                        onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                                                        className="create-exam-correct-answer-radio"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="create-exam-editor-toolbar">
                                            <button className="create-exam-toolbar-button">A</button>
                                            <button className="create-exam-toolbar-button">B</button>
                                            <button className="create-exam-toolbar-button">I</button>
                                            <button className="create-exam-toolbar-button">≡</button>
                                            <button className="create-exam-toolbar-button">⋯</button>
                                        </div>
                                        <div className="create-exam-editor-actions">
                                            {selectedQuestionIndex !== null ? (
                                                <button className="create-exam-edit-btn" onClick={updateQuestion}>
                                                    Edit
                                                </button>
                                            ) : (
                                                <button className="create-exam-add-btn" onClick={addQuestion}>
                                                    Додај
                                                </button>
                                            )}
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
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '0',
                        width: '500px',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #4a90a4 0%, #5ba0b4 100%)',
                            color: 'white',
                            padding: '20px 24px',
                            borderRadius: '16px 16px 0 0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                                🤖 Генерирај прашања со AI
                            </h2>
                            <button 
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    padding: '0',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onClick={() => setAiGenerationModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    fontWeight: '500', 
                                    marginBottom: '8px', 
                                    color: '#333', 
                                    fontSize: '14px' 
                                }}>
                                    Тема за прашањата
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e1e5e9',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    placeholder="На пример: JavaScript основи, Бази на податоци, Алгоритми..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ 
                                        display: 'block', 
                                        fontWeight: '500', 
                                        marginBottom: '8px', 
                                        color: '#333', 
                                        fontSize: '14px' 
                                    }}>
                                        Број на прашања
                                    </label>
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid #e1e5e9',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: 'white',
                                            cursor: 'pointer',
                                            boxSizing: 'border-box'
                                        }}
                                        value={aiQuestionCount}
                                        onChange={(e) => setAiQuestionCount(parseInt(e.target.value))}
                                    >
                                        <option value={3}>3 прашања</option>
                                        <option value={5}>5 прашања</option>
                                        <option value={10}>10 прашања</option>
                                        <option value={15}>15 прашања</option>
                                    </select>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label style={{ 
                                        display: 'block', 
                                        fontWeight: '500', 
                                        marginBottom: '8px', 
                                        color: '#333', 
                                        fontSize: '14px' 
                                    }}>
                                        Тежина
                                    </label>
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid #e1e5e9',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: 'white',
                                            cursor: 'pointer',
                                            boxSizing: 'border-box'
                                        }}
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
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
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
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    minWidth: '120px',
                                    opacity: isGenerating ? 0.6 : 1
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