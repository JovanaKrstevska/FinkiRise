import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/ui/NavBar/NavBar';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import { createLab } from '../../services/databaseService';
import './CreateLabPage.css';

function CreateLabPage() {
    const navigate = useNavigate();
    const { subjectId } = useParams();
    const { currentUser } = useAuth();
    const [labTitle, setLabTitle] = useState('');
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
        setCurrentQuestion(prev => ({
            ...prev,
            type,
            options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
            correctAnswer: type === 'multiple-choice' ? 0 : undefined,
            placeholder: type === 'coding' ? 'function example() {\n    // Your code here\n}' : undefined,
            acceptedTypes: type === 'file-upload' ? '.html,.css,.js,.zip' : undefined
        }));
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

        const newQuestion = {
            ...currentQuestion,
            id: Date.now()
        };

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

        const updatedQuestions = [...questions];
        updatedQuestions[selectedQuestionIndex] = {
            ...currentQuestion,
            id: questions[selectedQuestionIndex].id
        };

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


    const saveLab = async () => {
        // Validation checks with specific error messages
        if (!labTitle.trim()) {
            alert('Ве молиме внесете наслов на лабораториската.');
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

        const labData = {
            title: labTitle,
            subjectId: subjectId || 'default-subject',
            professorId: currentUser.uid,
            questions: questions,
            timeLimit: 60,
            maxAttempts: 1
        };

        try {
            console.log('Saving lab data:', labData);
            const result = await createLab(labData);

            if (result.success) {
                alert('Лабораториската е успешно креирана!');
                navigate('/lab'); // Navigate back to lab page
            } else {
                console.error('Lab creation failed:', result.error);
                alert(`Грешка при креирање: ${result.error || 'Непозната грешка'}`);
            }
        } catch (error) {
            console.error('Error creating lab:', error);
            alert(`Грешка при креирање на лабораториската: ${error.message}`);
        }
    };

    return (
        <div>
            <NavBar />
            <div className="create-lab-page">
                <div className="create-lab-container">
                    {/* Main Content Section (Left Side) */}
                    <div className="create-lab-main-section">
                        <div className="create-lab-card">
                            <div className="create-lab-header">
                                <h1 className="page-title">Креирање на Лабораториска</h1>
                                <Button
                                    className="btn-save-lab"
                                    content="Зачувај"
                                    onClick={saveLab}
                                />
                            </div>

                            <div className="create-lab-content">
                                {/* Title and Question Type Row */}
                                <div className="form-row">
                                    <div className="input-group">
                                        <label className="naslov-label">Наслов</label>
                                        <Input
                                            type="text"
                                            style="lab-title-input"
                                            value={labTitle}
                                            onChange={(e) => setLabTitle(e.target.value)}
                                            placeholder="Внеси текст"
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Тип на прашање</label>
                                        <select
                                            className="question-type-select"
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

                                <div className="question-content-section">
                                    <label className="input-label-kreiraj-prasanje">Креирај прашање</label>
                                    <Input
                                        type="text"
                                        style="question-textarea-create"
                                        value={currentQuestion.question}
                                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                        placeholder="Внеси текст"
                                    />

                                    {/* Multiple Choice Options */}
                                    {currentQuestion.type === 'multiple-choice' && (
                                        <div className="answers-section-create">
                                            <div className="options-list-create">
                                                {currentQuestion.options.map((option, index) => (
                                                    <label key={index} className="option-item">
                                                        <div className="custom-checkbox-create">
                                                            <input
                                                                type="radio"
                                                                name="correct-answer"
                                                                value={index}
                                                                checked={currentQuestion.correctAnswer === index}
                                                                onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                                                            />
                                                            <span className="checkbox-square"></span>
                                                        </div>
                                                        <Input
                                                            type="text"
                                                            style="option-input"
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
                    <div className="questions-navigation-section">
                        <div className="questions-navigation-card">
                            <div className="questions-list-header">
                                <h3 className="list-title">Листа на прашања</h3>
                            </div>

                            <div className="questions-list">
                                {questions.length === 0 ? (
                                    <div className="empty-questions">
                                        <p>Нема додадени прашања</p>
                                    </div>
                                ) : (
                                    questions.map((question, index) => (
                                        <button
                                            key={question.id}
                                            className={`question-nav-btn ${selectedQuestionIndex === index ? 'active' : ''}`}
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

export default CreateLabPage;