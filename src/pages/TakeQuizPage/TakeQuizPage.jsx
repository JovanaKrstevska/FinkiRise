import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/ui/NavBar/NavBar';
import Button from '../../components/ui/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './TakeQuizPage.css';

function TakeQuizPage() {
    const { subjectId, quizId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [subjectId, quizId]);

    useEffect(() => {
        if (quiz && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        submitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [quiz, timeLeft]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const contentDoc = await getDoc(doc(db, 'courseContent', subjectId));
            
            if (contentDoc.exists()) {
                const data = contentDoc.data();
                const quizzes = data.quizzes || [];
                const foundQuiz = quizzes.find(q => q.id.toString() === quizId);
                
                if (foundQuiz) {
                    setQuiz(foundQuiz);
                    setTimeLeft((foundQuiz.timeLimit || 30) * 60); // Convert to seconds
                } else {
                    setError('Квизот не е пронајден');
                }
            } else {
                setError('Содржината на курсот не е пронајдена');
            }
        } catch (err) {
            console.error('Error fetching quiz:', err);
            setError('Грешка при вчитување на квизот');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const calculateScore = () => {
        let totalScore = 0;
        let correctAnswers = 0;

        quiz.questions.forEach(question => {
            const userAnswer = answers[question.id];
            if (question.type === 'multiple-choice') {
                if (userAnswer === question.correctAnswer) {
                    totalScore += question.points || 5;
                    correctAnswers++;
                }
            }
            // For other question types, we'll need manual grading
        });

        return { totalScore, correctAnswers, totalQuestions: quiz.questions.length };
    };

    const submitQuiz = async () => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            const results = calculateScore();
            const submissionData = {
                quizId: quiz.id,
                studentId: currentUser.uid,
                answers: answers,
                score: results.totalScore,
                correctAnswers: results.correctAnswers,
                totalQuestions: results.totalQuestions,
                submittedAt: new Date().toISOString(),
                timeSpent: ((quiz.timeLimit || 30) * 60) - timeLeft
            };

            // Save submission to Firestore
            const submissionDocRef = doc(db, 'quizSubmissions', `${quizId}_${currentUser.uid}`);
            await setDoc(submissionDocRef, submissionData);

            // Navigate to results page
            navigate(`/quiz-results/${subjectId}/${quizId}`, { 
                state: { results: submissionData } 
            });
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Грешка при поднесување на квизот. Обидете се повторно.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="take-quiz-page">
                    <div className="loading">Се вчитува квизот...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <NavBar />
                <div className="take-quiz-page">
                    <div className="error">{error}</div>
                </div>
            </div>
        );
    }

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div>
                <NavBar />
                <div className="take-quiz-page">
                    <div className="error">Квизот не содржи прашања</div>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div>
            <NavBar />
            <div className="take-quiz-page">
                <div className="quiz-container">
                    {/* Main Quiz Section */}
                    <div className="quiz-main-section">
                        <div className="quiz-header">
                            <h1 className="quiz-title">{quiz.title}</h1>
                            <div className="quiz-timer">
                                <span className="timer-label">Време:</span>
                                <span className={`timer-value ${timeLeft < 300 ? 'warning' : ''}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        <div className="question-card">
                            <div className="question-header">
                                <h2 className="question-title">
                                    Прашање {currentQuestionIndex + 1}:
                                </h2>
                                <span className="question-points">
                                    {currentQuestion.points || 5} поени
                                </span>
                            </div>

                            <div className="question-content">
                                <p className="question-text">{currentQuestion.question}</p>

                                {/* Multiple Choice */}
                                {currentQuestion.type === 'multiple-choice' && (
                                    <div className="options-container">
                                        {currentQuestion.options.map((option, index) => (
                                            <label key={index} className="option-label">
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion.id}`}
                                                    value={index}
                                                    checked={answers[currentQuestion.id] === index}
                                                    onChange={() => handleAnswerChange(currentQuestion.id, index)}
                                                />
                                                <span className="option-text">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Coding/Text Area */}
                                {currentQuestion.type === 'coding' && (
                                    <div className="coding-container">
                                        <textarea
                                            className="coding-textarea"
                                            placeholder={currentQuestion.placeholder || 'Внесете го вашиот код овде...'}
                                            value={answers[currentQuestion.id] || ''}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* File Upload */}
                                {currentQuestion.type === 'file-upload' && (
                                    <div className="file-upload-container">
                                        <input
                                            type="file"
                                            accept={currentQuestion.acceptedTypes || '.pdf,.doc,.docx,.zip'}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.files[0])}
                                            className="file-input"
                                        />
                                        {answers[currentQuestion.id] && (
                                            <div className="uploaded-file">
                                                📎 {answers[currentQuestion.id].name}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="question-navigation">
                                <Button
                                    className="btn-prev"
                                    content="Претходно"
                                    onClick={prevQuestion}
                                    disabled={currentQuestionIndex === 0}
                                />
                                
                                {currentQuestionIndex === quiz.questions.length - 1 ? (
                                    <Button
                                        className="btn-submit"
                                        content={isSubmitting ? "Се поднесува..." : "Заврши"}
                                        onClick={submitQuiz}
                                        disabled={isSubmitting}
                                    />
                                ) : (
                                    <Button
                                        className="btn-next"
                                        content="Следно"
                                        onClick={nextQuestion}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Questions Navigation Sidebar */}
                    <div className="questions-takequiz-sidebar">
                        <div className="sidebar-takequiz-header">
                            <h3>Прашања</h3>
                            <div className="progress-info">
                                {Object.keys(answers).length} / {quiz.questions.length} одговорени
                            </div>
                        </div>
                        
                        <div className="questions-takequiz-grid">
                            {quiz.questions.map((question, index) => (
                                <button
                                    key={question.id}
                                    className={`question-takequiz-nav-btn ${
                                        index === currentQuestionIndex ? 'active' : ''
                                    } ${
                                        answers[question.id] !== undefined ? 'answered' : ''
                                    }`}
                                    onClick={() => goToQuestion(index)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <div className="sidebar-actions">
                            <Button
                                className="btn-submit-sidebar"
                                content={isSubmitting ? "Се поднесува..." : "Заврши квиз"}
                                onClick={submitQuiz}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TakeQuizPage;