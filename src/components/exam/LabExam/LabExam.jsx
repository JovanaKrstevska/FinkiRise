import { useState, useEffect, useRef } from 'react';
import './LabExam.css';

function LabExam({ labData, onSubmit, onExit, isExam = false }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    // Use timeLimit from labData (in minutes), convert to seconds. Default to 90 minutes if not set
    const initialTimeInSeconds = isExam ? (labData?.timeLimit || 90) * 60 : null;
    const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
    const [startTime] = useState(new Date()); // Track when exam/lab started

    const answersRef = useRef(answers);
    const onSubmitRef = useRef(onSubmit);

    const questions = labData?.questions || [];

    // Keep refs updated
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        onSubmitRef.current = onSubmit;
    }, [onSubmit]);

    // Timer for exams only - simplified approach
    useEffect(() => {
        if (!isExam) return;


        
        const timer = setInterval(() => {
            setTimeLeft(currentTime => {
                const newTime = currentTime - 1;
                
                if (newTime <= 0) {
                    clearInterval(timer);
                    // Auto submit when time runs out
                    const submission = {
                        answers: answersRef.current,
                        completedAt: new Date(),
                        timeSpent: initialTimeInSeconds
                    };
                    onSubmitRef.current(submission);
                    return 0;
                }
                
                return newTime;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [isExam]);

    // Format time for display (HH:MM)
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        // Calculate time spent
        let timeSpent = 0;
        const completedAt = new Date();
        
        if (isExam && timeLeft !== null) {
            // For exams: initial time minus remaining time
            timeSpent = initialTimeInSeconds - timeLeft;
        } else {
            // For labs: calculate actual time spent from start to completion
            timeSpent = Math.floor((completedAt - startTime) / 1000); // in seconds
        }

        const submission = {
            answers,
            completedAt: completedAt,
            timeSpent: timeSpent
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
                                    {currentQ.options && Array.isArray(currentQ.options) ? (
                                        currentQ.options.map((option, index) => (
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
                                        ))
                                    ) : (
                                        <div className="options-error">
                                            <p>Опциите не се достапни за ова прашање.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentQ.type === 'coding' && (
                                <textarea
                                    className="code-input1"
                                    placeholder={currentQ.placeholder}
                                    value={answers[currentQ.id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                    rows={8}
                                />
                            )}

                            {currentQ.type === 'file-upload' && (
                                <div className="file-upload-area-labexam">
                                    <input
                                        type="file"
                                        accept={currentQ.acceptedTypes}
                                        onChange={(e) => handleFileUpload(currentQ.id, e.target.files[0])}
                                        className="file-input-field-labexam"
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

            {/* Timer for exams only */}
            {isExam && timeLeft !== null && (
                <div className="exam-timer-exam">
                    Време: {formatTime(timeLeft)}
                </div>
            )}
        </div>
    );
}

export default LabExam;