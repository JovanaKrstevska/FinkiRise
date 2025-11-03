import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/ui/NavBar/NavBar';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './CreateQuizPage.css';

function CreateQuizPage() {
    const navigate = useNavigate();
    const { subjectId } = useParams();
    const { currentUser } = useAuth();
    const [quizTitle, setQuizTitle] = useState('');
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

    const questionTypes = [
        { value: 'multiple-choice', label: 'Multiple Choice' },
        { value: 'coding', label: 'Text Area / Coding' },
        { value: 'file-upload', label: 'File Upload' }
    ];

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
        setCurrentQuestion({
            type: 'multiple-choice',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            points: 5,
            uploadedFile: null
        });
    };

    const saveQuizToFirestore = async (quizData) => {
        try {
            const contentDocRef = doc(db, 'courseContent', subjectId);
            
            // Check if document exists
            const contentDoc = await getDoc(contentDocRef);
            
            if (contentDoc.exists()) {
                // Update existing document
                await updateDoc(contentDocRef, {
                    quizzes: arrayUnion(quizData),
                    lastUpdated: new Date().toISOString(),
                    updatedBy: currentUser.uid
                });
            } else {
                // Create new document
                const initialData = {
                    lectures: [],
                    exercises: [],
                    literature: [],
                    recordings: [],
                    quizzes: [quizData],
                    labs: [],
                    homework: [],
                    results: [],
                    createdDate: new Date().toISOString(),
                    createdBy: currentUser.uid,
                    lastUpdated: new Date().toISOString(),
                    updatedBy: currentUser.uid
                };
                
                await setDoc(contentDocRef, initialData);
            }
        } catch (error) {
            console.error('Error saving quiz to Firestore:', error);
            throw error;
        }
    };

    const saveQuiz = async () => {
        // Validation checks with specific error messages
        if (!quizTitle.trim()) {
            alert('Ве молиме внесете наслов на квизот.');
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

        const quizData = {
            id: Date.now(),
            title: quizTitle,
            subjectId: subjectId || 'default-subject',
            professorId: currentUser.uid,
            questions: questions,
            timeLimit: 60,
            maxAttempts: 1,
            createdDate: new Date().toISOString(),
            createdBy: currentUser.uid,
            type: 'quiz'
        };

        try {
            console.log('Saving quiz data:', quizData);
            await saveQuizToFirestore(quizData);
            
            alert('Квизот е успешно креиран!');
            navigate(`/courses/${subjectId}`); // Navigate back to course page
        } catch (error) {
            console.error('Error creating quiz:', error);
            alert(`Грешка при креирање на квизот: ${error.message}`);
        }
    };

    return (
        <div>
            <NavBar />
            <div className="create-quiz-page">
                <div className="create-quiz-container">
                    {/* Main Content Section (Left Side) */}
                    <div className="create-quiz-main-section">
                        <div className="create-quiz-card">
                            <div className="create-quiz-header">
                                <h1 className="quiz-page-title">Креирање на Квиз</h1>
                                <Button
                                    className="btn-save-quiz"
                                    content="Зачувај"
                                    onClick={saveQuiz}
                                />
                            </div>

                            <div className="create-quiz-content">
                                {/* Title and Question Type Row */}
                                <div className="quiz-form-row">
                                    <div className="quiz-input-group">
                                        <label className="quiz-naslov-label">Наслов</label>
                                        <Input
                                            type="text"
                                            style="quiz-title-input"
                                            value={quizTitle}
                                            onChange={(e) => setQuizTitle(e.target.value)}
                                            placeholder="Внеси текст"
                                        />
                                    </div>

                                    <div className="quiz-input-group">
                                        <label className="quiz-input-label">Тип на прашање</label>
                                        <select
                                            className="quiz-question-type-select"
                                            value={currentQuestion.type}
                                            onChange={(e) => handleQuestionTypeChange(e.target.value)}
                                        >
                                            {questionTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="quiz-question-content-section">
                                    <label className="quiz-input-label-kreiraj-prasanje">Креирај прашање</label>
                                    <Input
                                        type="text"
                                        style="quiz-question-textarea-create"
                                        value={currentQuestion.question}
                                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                        placeholder="Внеси текст"
                                    />

                                    {/* Multiple Choice Options */}
                                    {currentQuestion.type === 'multiple-choice' && (
                                        <div className="quiz-answers-section-create">
                                            <div className="quiz-options-list-create">
                                                {currentQuestion.options.map((option, index) => (
                                                    <label key={index} className="quiz-option-item">
                                                        <div className="quiz-custom-checkbox-create">
                                                            <input
                                                                type="radio"
                                                                name="correct-answer"
                                                                value={index}
                                                                checked={currentQuestion.correctAnswer === index}
                                                                onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                                                            />
                                                            <span className="quiz-checkbox-square"></span>
                                                        </div>
                                                        <Input
                                                            type="text"
                                                            style="quiz-option-input"
                                                            value={option}
                                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                                            placeholder={`Одговор ${index + 1}`}
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Coding/Text Area Configuration */}
                                    {currentQuestion.type === 'coding' && (
                                        <div className="coding-config-section">
                                            <label className="input-label-placeholder">Placeholder за студентите</label>
                                            <Input
                                                type="text"
                                                style="coding-placeholder-textarea"
                                                value={currentQuestion.placeholder || ''}
                                                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, placeholder: e.target.value }))}
                                                placeholder="function example() { // Your code here }"
                                            />
                                            <div className="coding-preview">
                                                <label className="input-label">Преглед (како ќе го видат студентите):</label>
                                                <Input
                                                    type="text"
                                                    style="code-input"
                                                    value={currentQuestion.placeholder || ''}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* File Upload Configuration */}
                                    {currentQuestion.type === 'file-upload' && (
                                        <div className="file-upload-config-section">
                                            <label className="input-label-file">Дозволени типови на фајлови</label>
                                            <Input
                                                type="text"
                                                style="accepted-types-input"
                                                value={currentQuestion.acceptedTypes || ''}
                                                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, acceptedTypes: e.target.value }))}
                                                placeholder=".html,.css,.js,.zip,.pdf,.doc,.docx"
                                            />

                                            <div className="professor-file-upload">
                                                <label className="input-label-prikaci">Прикачи фајл за прашањето (опционално):</label>
                                                <div className="file-upload-section">
                                                    <Input
                                                        type="file"
                                                        style="professor-file-input"
                                                        onChange={handleFileUpload}
                                                        accept={currentQuestion.acceptedTypes || '.html,.css,.js,.zip,.pdf,.doc,.docx'}
                                                    />
                                                    {currentQuestion.uploadedFile && (
                                                        <div className="uploaded-file-info">
                                                            <span className="file-name">📎 {currentQuestion.uploadedFile.name}</span>
                                                            <span className="file-size">({(currentQuestion.uploadedFile.size / 1024).toFixed(1)} KB)</span>
                                                            <Button
                                                                className="remove-file-btn"
                                                                onClick={() => setCurrentQuestion(prev => ({ ...prev, uploadedFile: null }))}
                                                                type="button"
                                                                content={"✕"} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="question-actions">
                                        {selectedQuestionIndex !== null ? (
                                            <Button
                                                className="btn-update-question"
                                                content="Ажурирај"
                                                onClick={updateQuestion}
                                            />
                                        ) : (
                                            <Button
                                                className="btn-add-question"
                                                content="Додај"
                                                onClick={addQuestion}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Section (Right Side) */}
                    <div className="questions-quiz-navigation-section">
                        <div className="questions-quiz-navigation-card">
                            <div className="questions-quiz-list-header">
                                <h3 className="list-title">Листа на прашања</h3>
                            </div>

                            <div className="questions-quiz-list">
                                {questions.length === 0 ? (
                                    <div className="empty-questions">
                                        <p>Нема додадени прашања</p>
                                    </div>
                                ) : (
                                    questions.map((question, index) => (
                                        <button
                                            key={question.id}
                                            className={`question-quiz-nav-btn ${selectedQuestionIndex === index ? 'active' : ''}`}
                                            onClick={() => editQuestion(index)}
                                        >
                                            Прашање {index + 1}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateQuizPage;