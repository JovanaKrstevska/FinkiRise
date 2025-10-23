import { useState, useEffect } from 'react';
import './LabExam.css';

function LabExam({ labData, onSubmit, onExit }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    const questions = labData?.questions || [];

    // Timer removed - no time limit for lab exam

    // Exam starts immediately, no need for handleStartExam

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleFileUpload = (questionId, file) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: file
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmitExam = () => {
        const submission = {
            answers,
            completedAt: new Date(),
            timeSpent: 0 // No time tracking
        };
        onSubmit(submission);
    };

    // Removed renderQuestion function - using inline rendering

    // Exam starts immediately, no start screen needed

    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    // Safety check - if no questions or current question is undefined, show loading
    if (!questions || questions.length === 0 || !currentQ) {
        return (
            <div className="lab-exam">
                <div className="loading-message">Loading exam questions...</div>
            </div>
        );
    }

    return (
        <div className="lab-exam">

            <div className="exam-layout">
                <div className="question-section">
                    <div className="question-card">
                        <h2 className="question-title">Прашање {currentQuestion + 1}:</h2>

                        <div className="question-text-area">
                            <div className="question-content-text">
                                {currentQ.question}
                            </div>
                        </div>

                        <div className="answers-section">
                            {currentQ.type === 'multiple-choice' && (
                                <div className="options-list">
                                    {currentQ.options.map((option, index) => (
                                        <label key={index} className="option-item">
                                            <div className="custom-checkbox">
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQ.id}`}
                                                    value={index}
                                                    checked={answers[currentQ.id] === index}
                                                    onChange={() => handleAnswerChange(currentQ.id, index)}
                                                />
                                                <span className="checkbox-square"></span>
                                            </div>
                                            <span className="option-answer">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {currentQ.type === 'coding' && (
                                <textarea
                                    className="code-input"
                                    placeholder={currentQ.placeholder}
                                    value={answers[currentQ.id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                    rows={8}
                                />
                            )}

                            {currentQ.type === 'file-upload' && (
                                <div className="file-upload-area">
                                    <input
                                        type="file"
                                        accept={currentQ.acceptedTypes}
                                        onChange={(e) => handleFileUpload(currentQ.id, e.target.files[0])}
                                        className="file-input-field"
                                    />
                                    {answers[currentQ.id] && (
                                        <div className="uploaded-file-info">
                                            <span>Прикачен фајл: {answers[currentQ.id].name}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="navigation-section">
                    <div className="navigation-card">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                className={`question-nav-btn ${index === currentQuestion ? 'active' : ''
                                    } ${answers[questions[index].id] !== undefined ? 'answered' : ''}`}
                                onClick={() => setCurrentQuestion(index)}
                            >
                                Прашање {index + 1}
                            </button>
                        ))}

                        <div className="submit-section">
                            <button className="submit-exam-btn" onClick={handleSubmitExam}>
                                Заврши испит
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LabExam;