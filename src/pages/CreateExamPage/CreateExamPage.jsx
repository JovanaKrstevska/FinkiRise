import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/ui/NavBar/NavBar';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import { createExam } from '../../services/databaseService';
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

    return (
        <div>
            <NavBar />
            <div className="create-exam-page">
                <div className="create-exam-container">
                    {/* Main Content Section (Left Side) */}
                    <div className="create-exam-main-section">
                        <div className="create-exam-card">
                            <div className="create-exam-header">
                                <h1 className="exam-page-title">Креирање на Испит</h1>
                                <Button
                                    className="btn-save-exam"
                                    content="Зачувај"
                                    onClick={saveExam}
                                />
                            </div>

                            <div className="create-exam-content">
                                {/* Title and Question Type Row */}
                                <div className="exam-form-row">
                                    <div className="exam-input-group">
                                        <label className="exam-naslov-label">Наслов</label>
                                        <Input
                                            type="text"
                                            style="exam-title-input"
                                            value={examTitle}
                                            onChange={(e) => setExamTitle(e.target.value)}
                                            placeholder="Внеси текст"
                                        />
                                    </div>

                                    <div className="exam-input-group">
                                        <label className="exam-input-label">Тип на прашање</label>
                                        <select
                                            className="exam-question-type-select"
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

                                <div className="exam-question-content-section">
                                    <label className="exam-input-label-kreiraj-prasanje">Креирај прашање</label>
                                    <Input
                                        type="text"
                                        style="exam-question-textarea-create"
                                        value={currentQuestion.question}
                                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                        placeholder="Внеси текст"
                                    />

                                    {/* Multiple Choice Options */}
                                    {currentQuestion.type === 'multiple-choice' && (
                                        <div className="exam-answers-section-create">
                                            <div className="exam-options-list-create">
                                                {currentQuestion.options.map((option, index) => (
                                                    <label key={index} className="exam-option-item">
                                                        <div className="exam-custom-checkbox-create">
                                                            <input
                                                                type="radio"
                                                                name="correct-answer"
                                                                value={index}
                                                                checked={currentQuestion.correctAnswer === index}
                                                                onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                                                            />
                                                            <span className="exam-checkbox-square"></span>
                                                        </div>
                                                        <Input
                                                            type="text"
                                                            style="exam-option-input"
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
                                        <div className="exam-coding-config-section">
                                            <label className="exam-input-label-placeholder">Placeholder за студентите</label>
                                            <Input
                                                type="text"
                                                style="exam-coding-placeholder-textarea"
                                                value={currentQuestion.placeholder || ''}
                                                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, placeholder: e.target.value }))}
                                                placeholder="function example() { // Your code here }"
                                            />
                                            <div className="exam-coding-preview">
                                                <label className="exam-input-label">Преглед (како ќе го видат студентите):</label>
                                                <Input
                                                    type="text"
                                                    style="exam-code-input"
                                                    value={currentQuestion.placeholder || ''}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* File Upload Configuration */}
                                    {currentQuestion.type === 'file-upload' && (
                                        <div className="exam-file-upload-config-section">
                                            <label className="exam-input-label-file">Дозволени типови на фајлови</label>
                                            <Input
                                                type="text"
                                                style="exam-accepted-types-input"
                                                value={currentQuestion.acceptedTypes || ''}
                                                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, acceptedTypes: e.target.value }))}
                                                placeholder=".html,.css,.js,.zip,.pdf,.doc,.docx"
                                            />

                                            <div className="exam-professor-file-upload">
                                                <label className="exam-input-label-prikaci">Прикачи фајл за прашањето (опционално):</label>
                                                <div className="exam-file-upload-section">
                                                    <Input
                                                        type="file"
                                                        style="exam-professor-file-input"
                                                        onChange={handleFileUpload}
                                                        accept={currentQuestion.acceptedTypes || '.html,.css,.js,.zip,.pdf,.doc,.docx'}
                                                    />
                                                    {currentQuestion.uploadedFile && (
                                                        <div className="exam-uploaded-file-info">
                                                            <span className="exam-file-name">📎 {currentQuestion.uploadedFile.name}</span>
                                                            <span className="exam-file-size">({(currentQuestion.uploadedFile.size / 1024).toFixed(1)} KB)</span>
                                                            <Button
                                                                className="exam-remove-file-btn"
                                                                onClick={() => setCurrentQuestion(prev => ({ ...prev, uploadedFile: null }))}
                                                                type="button"
                                                                content={"✕"} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="exam-question-actions">
                                        {selectedQuestionIndex !== null ? (
                                            <Button
                                                className="btn-update-exam-question"
                                                content="Ажурирај"
                                                onClick={updateQuestion}
                                            />
                                        ) : (
                                            <Button
                                                className="btn-add-exam-question"
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
                    <div className="exam-questions-navigation-section">
                        <div className="exam-questions-navigation-card">
                            <div className="exam-questions-list-header">
                                <h3 className="exam-list-title">Листа на прашања</h3>
                            </div>

                            <div className="exam-questions-list">
                                {questions.length === 0 ? (
                                    <div className="exam-empty-questions">
                                        <p>Нема додадени прашања</p>
                                    </div>
                                ) : (
                                    questions.map((question, index) => (
                                        <button
                                            key={question.id}
                                            className={`exam-question-nav-btn ${selectedQuestionIndex === index ? 'active' : ''}`}
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

export default CreateExamPage;