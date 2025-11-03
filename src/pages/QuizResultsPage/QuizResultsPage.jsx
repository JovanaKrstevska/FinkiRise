import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../../components/ui/NavBar/NavBar';
import Button from '../../components/ui/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './QuizResultsPage.css';

function QuizResultsPage() {
    const { subjectId, quizId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [subject, setSubject] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewMode, setReviewMode] = useState(false);
    const [currentReviewQuestion, setCurrentReviewQuestion] = useState(0);

    useEffect(() => {
        // Get results from navigation state or fetch from database
        if (location.state?.results) {
            setResults(location.state.results);
            fetchQuizAndSubject();
        } else {
            fetchResultsFromDB();
        }
    }, []);

    const fetchQuizAndSubject = async () => {
        try {
            const contentDoc = await getDoc(doc(db, 'courseContent', subjectId));
            if (contentDoc.exists()) {
                const data = contentDoc.data();
                const quizzes = data.quizzes || [];
                const foundQuiz = quizzes.find(q => q.id.toString() === quizId);
                setQuiz(foundQuiz);
            }

            // Fetch subject data
            try {
                const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
                if (subjectDoc.exists()) {
                    setSubject(subjectDoc.data());
                } else {
                    setSubject({ name: 'Непознат предмет' });
                }
            } catch (subjectError) {
                console.error('Error fetching subject:', subjectError);
                setSubject({ name: 'Непознат предмет' });
            }
        } catch (err) {
            console.error('Error fetching quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResultsFromDB = async () => {
        try {
            setLoading(true);
            const submissionDoc = await getDoc(doc(db, 'quizSubmissions', `${quizId}_${currentUser.uid}`));
            
            if (submissionDoc.exists()) {
                setResults(submissionDoc.data());
                await fetchQuizAndSubject();
            } else {
                navigate(`/course/${subjectId}`);
            }
        } catch (err) {
            console.error('Error fetching results:', err);
            navigate(`/course/${subjectId}`);
        }
    };

    const handleBackToQuizzes = () => {
        navigate(`/course/${subjectId}`);
    };

    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="quiz-details-loading">Се вчитуваат резултатите...</div>
            </div>
        );
    }

    if (!results || !quiz) {
        return (
            <div>
                <NavBar />
                <div className="quiz-details-page">
                    <div className="quiz-details-container">
                        <div className="error">Резултатите не се пронајдени</div>
                    </div>
                </div>
            </div>
        );
    }

    // Show review mode
    if (reviewMode && results && quiz) {
        const currentQ = quiz.questions[currentReviewQuestion];
        const userAnswer = results.answers[currentQ.id];

        return (
            <div>
                <NavBar />
                <div className="quiz-details-page">
                    <div className="review-layout">
                        <div className="review-header">
                            <button className="back-to-results-btn" onClick={() => setReviewMode(false)}>
                                ← Назад
                            </button>
                            <h2>Преглед на одговори</h2>
                        </div>

                        <div className="review-content">
                            <div className="review-question-section">
                                <div className="review-question-card">
                                    <h3 className="review-question-title">Прашање {currentReviewQuestion + 1}:</h3>

                                    <div className="review-question-text">
                                        {currentQ.question}
                                    </div>

                                    <div className="review-answers">
                                        {currentQ.type === 'multiple-choice' && (
                                            <div className="review-options">
                                                {currentQ.options && Array.isArray(currentQ.options) && currentQ.options.length > 0 ? (
                                                    currentQ.options.map((option, index) => {
                                                        const isCorrect = index === currentQ.correctAnswer;
                                                        const isUserSelected = index === userAnswer;
                                                        const isIncorrect = isUserSelected && !isCorrect;

                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`review-option ${isCorrect ? 'correct' : ''
                                                                    } ${isUserSelected ? 'user-selected' : ''
                                                                    } ${isIncorrect ? 'incorrect' : ''
                                                                    }`}
                                                            >
                                                                <div className="review-checkbox">
                                                                    <span className={`checkbox-indicator ${isUserSelected ? 'selected' : ''
                                                                        }`}>
                                                                        {isUserSelected ? '✓' : ''}
                                                                    </span>
                                                                </div>
                                                                <span className="review-option-text">{option}</span>
                                                                {isCorrect && (
                                                                    <span className="correct-indicator">✓ Точен одговор</span>
                                                                )}
                                                                {isIncorrect && (
                                                                    <span className="incorrect-indicator">✗ Неточен одговор</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="missing-data-warning">
                                                        <h4>⚠️ Непотполни податоци за прашањето</h4>
                                                        <p>Ова прашање нема дефинирани опции за одговор.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {currentQ.type === 'coding' && (
                                            <div className="review-code">
                                                <h4>Вашиот код:</h4>
                                                <pre className="code-display">{userAnswer || 'Нема одговор'}</pre>
                                            </div>
                                        )}

                                        {currentQ.type === 'file-upload' && (
                                            <div className="review-file">
                                                <h4>Прикачен фајл:</h4>
                                                <div className="file-display">
                                                    {userAnswer ? userAnswer.name : 'Нема прикачен фајл'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="review-navigation-section">
                                <div className="review-navigation-card">
                                    {quiz.questions.map((question, index) => (
                                        <button
                                            key={index}
                                            className={`review-nav-btn ${question.type} ${index === currentReviewQuestion ? 'active' : ''
                                                }`}
                                            onClick={() => setCurrentReviewQuestion(index)}
                                        >
                                            Прашање {index + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show quiz results (same as lab results design)
    return (
        <div>
            <NavBar />
            <div className="quiz-details-page">
                <div className="quiz-details-container">
                    <div className="exam-results">
                        <div className="results-card">
                            <h1 className="results-title">Стигнавте до крајот на квизот!</h1>
                            <div className="results-message">
                                <p>Резултатите од квизот по предметот <strong>"{subject?.name || 'Предмет'}"</strong> ќе бидат објавени од страна на професорите. Дотолку сакате да си ги видите решенијата притеснете на копчето <strong>Преглед</strong>.</p>
                            </div>
                        </div>

                        <div className="results-actions">
                            <Button
                                className="btn-preview"
                                content={"Преглед"}
                                onClick={() => setReviewMode(true)}
                            />
                            <Button
                                className="btn-exit"
                                content={"Излез"}
                                onClick={handleBackToQuizzes}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizResultsPage;