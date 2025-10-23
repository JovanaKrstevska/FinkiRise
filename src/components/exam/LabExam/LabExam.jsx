import { useState, useEffect } from 'react';
import './LabExam.css';

function LabExam({ labData, onSubmit, onExit }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(labData.timeLimit * 60); // Convert minutes to seconds
    const [examStarted, setExamStarted] = useState(true); // Start exam immediately

    const questions = labData?.questions || [];

    // Timer effect
    useEffect(() => {
        if (examStarted && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            handleSubmitExam();
        }
    }, [timeLeft, examStarted]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
            timeSpent: (labData.timeLimit * 60) - timeLeft
        };
        onSubmit(submission);
    };

    const renderQuestion = (question) => {
        switch (question.type) {
            case 'multiple-choice':
                return (
                    <div className="question-content">
                        <h3 className="question-text">{question.question}</h3>
                        <div className="options-container">
                            {question.options.map((option, index) => (
                                <label key={index} className="option-label">
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={index}
                                        checked={answers[question.id] === index}
                                        onChange={() => handleAnswerChange(question.id, index)}
                                    />
                                    <span className="option-text">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case 'coding':
                return (
                    <div className="question-content">
                        <h3 className="question-text">{question.question}</h3>
                        <textarea
                            className="code-editor"
                            placeholder={question.placeholder}
                            value={answers[question.id] || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            rows={10}
                        />
                    </div>
                );

            case 'file-upload':
                return (
                    <div className="question-content">
                        <h3 className="question-text">{question.question}</h3>
                        <div className="file-upload-container">
                            <input
                                type="file"
                                accept={question.acceptedTypes}
                                onChange={(e) => handleFileUpload(question.id, e.target.files[0])}
                                className="file-input"
                            />
                            {answers[question.id] && (
                                <div className="uploaded-file">
                                    <span>Прикачен фајл: {answers[question.id].name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return <div>Непознат тип на прашање</div>;
        }
    };

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
            <div className="exam-header">
                <div className="exam-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="progress-text">
                        Прашање {currentQuestion + 1} од {questions.length}
                    </span>
                </div>
                <div className="exam-timer">
                    <span className="timer-text">Преостанато време: {formatTime(timeLeft)}</span>
                </div>
            </div>

            <div className="exam-content">
                <div className="question-container">
                    <div className="question-header">
                        <span className="question-type">{currentQ.type.toUpperCase()}</span>
                        <span className="question-points">{currentQ.points} поени</span>
                    </div>
                    {renderQuestion(currentQ)}
                </div>
            </div>

            <div className="exam-navigation">
                <button
                    className="nav-btn prev-btn"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                >
                    ← Претходно
                </button>

                <div className="question-indicators">
                    {questions.map((_, index) => (
                        <button
                            key={index}
                            className={`question-indicator ${index === currentQuestion ? 'active' : ''
                                } ${answers[questions[index].id] !== undefined ? 'answered' : ''}`}
                            onClick={() => setCurrentQuestion(index)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

                {currentQuestion === questions.length - 1 ? (
                    <button className="nav-btn submit-btn" onClick={handleSubmitExam}>
                        Заврши испит
                    </button>
                ) : (
                    <button
                        className="nav-btn next-btn"
                        onClick={handleNextQuestion}
                    >
                        Следно →
                    </button>
                )}
            </div>
        </div>
    );
}

export default LabExam;