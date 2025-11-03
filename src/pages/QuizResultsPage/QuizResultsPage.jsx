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
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get results from navigation state or fetch from database
        if (location.state?.results) {
            setResults(location.state.results);
            fetchQuiz();
        } else {
            fetchResultsFromDB();
        }
    }, []);

    const fetchQuiz = async () => {
        try {
            const contentDoc = await getDoc(doc(db, 'courseContent', subjectId));
            if (contentDoc.exists()) {
                const data = contentDoc.data();
                const quizzes = data.quizzes || [];
                const foundQuiz = quizzes.find(q => q.id.toString() === quizId);
                setQuiz(foundQuiz);
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
                await fetchQuiz();
            } else {
                navigate(`/course/${subjectId}`);
            }
        } catch (err) {
            console.error('Error fetching results:', err);
            navigate(`/course/${subjectId}`);
        }
    };

    const calculatePercentage = () => {
        if (!results || !quiz) return 0;
        const totalPossiblePoints = quiz.questions.reduce((sum, q) => sum + (q.points || 5), 0);
        return Math.round((results.score / totalPossiblePoints) * 100);
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return '#28a745'; // Green
        if (percentage >= 80) return '#17a2b8'; // Blue
        if (percentage >= 70) return '#ffc107'; // Yellow
        if (percentage >= 60) return '#fd7e14'; // Orange
        return '#dc3545'; // Red
    };

    const getGradeLetter = (percentage) => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const goBackToCourse = () => {
        navigate(`/course/${subjectId}`);
    };

    const reviewQuiz = () => {
        navigate(`/review-quiz/${subjectId}/${quizId}`);
    };

    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="quiz-results-page">
                    <div className="loading">Се вчитуваат резултатите...</div>
                </div>
            </div>
        );
    }

    if (!results || !quiz) {
        return (
            <div>
                <NavBar />
                <div className="quiz-results-page">
                    <div className="error">Резултатите не се пронајдени</div>
                </div>
            </div>
        );
    }

    const percentage = calculatePercentage();
    const gradeColor = getGradeColor(percentage);
    const gradeLetter = getGradeLetter(percentage);

    return (
        <div>
            <NavBar />
            <div className="quiz-results-page">
                <div className="results-container">
                    <div className="results-card">
                        <div className="results-header">
                            <h1 className="quiz-title">{quiz.title}</h1>
                            <div className="completion-badge">
                                <span className="badge-text">Завршено</span>
                                <span className="completion-time">
                                    {new Date(results.submittedAt).toLocaleString('mk-MK')}
                                </span>
                            </div>
                        </div>

                        <div className="score-section">
                            <div className="score-circle" style={{ borderColor: gradeColor }}>
                                <div className="score-percentage" style={{ color: gradeColor }}>
                                    {percentage}%
                                </div>
                                <div className="score-grade" style={{ color: gradeColor }}>
                                    {gradeLetter}
                                </div>
                            </div>

                            <div className="score-details">
                                <div className="score-item">
                                    <span className="score-label">Вашиот резултат:</span>
                                    <span className="score-value">{results.score} поени</span>
                                </div>
                                <div className="score-item">
                                    <span className="score-label">Точни одговори:</span>
                                    <span className="score-value">
                                        {results.correctAnswers} од {results.totalQuestions}
                                    </span>
                                </div>
                                <div className="score-item">
                                    <span className="score-label">Време за решавање:</span>
                                    <span className="score-value">
                                        {formatTime(results.timeSpent)}
                                    </span>
                                </div>
                                <div className="score-item">
                                    <span className="score-label">Максимални поени:</span>
                                    <span className="score-value">
                                        {quiz.questions.reduce((sum, q) => sum + (q.points || 5), 0)} поени
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="performance-analysis">
                            <h3>Анализа на перформансите</h3>
                            <div className="performance-bar">
                                <div 
                                    className="performance-fill" 
                                    style={{ 
                                        width: `${percentage}%`, 
                                        backgroundColor: gradeColor 
                                    }}
                                ></div>
                            </div>
                            <div className="performance-labels">
                                <span>0%</span>
                                <span>25%</span>
                                <span>50%</span>
                                <span>75%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        <div className="feedback-section">
                            <h3>Повратна информација</h3>
                            <div className="feedback-content">
                                {percentage >= 90 && (
                                    <div className="feedback excellent">
                                        <strong>Одлично!</strong> Вашиот резултат е извонреден. Продолжете со одличната работа!
                                    </div>
                                )}
                                {percentage >= 70 && percentage < 90 && (
                                    <div className="feedback good">
                                        <strong>Добро!</strong> Солиден резултат. Има простор за подобрување во некои области.
                                    </div>
                                )}
                                {percentage >= 50 && percentage < 70 && (
                                    <div className="feedback average">
                                        <strong>Просечно.</strong> Препорачуваме дополнително учење и повторување на материјалот.
                                    </div>
                                )}
                                {percentage < 50 && (
                                    <div className="feedback poor">
                                        <strong>Потребно е подобрување.</strong> Препорачуваме детално повторување на материјалот и дополнителна подготовка.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="actions-section">
                            <Button
                                className="btn-review"
                                content="Прегледај одговори"
                                onClick={reviewQuiz}
                            />
                            <Button
                                className="btn-back"
                                content="Назад кон курсот"
                                onClick={goBackToCourse}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizResultsPage;