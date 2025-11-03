import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/ui/NavBar/NavBar';
import Button from '../../components/ui/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './QuizPage.css';

function QuizPage() {
    const { subjectId, quizId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQuiz();
    }, [subjectId, quizId]);

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

    const handleBackToQuizzes = () => {
        navigate(`/course/${subjectId}`);
    };

    const startQuiz = () => {
        navigate(`/take-quiz/${subjectId}/${quizId}`);
    };

    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="quiz-details-loading">Се вчитува квизот...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <NavBar />
                <div className="quiz-details-page">
                    <div className="quiz-details-container">
                        <div className="error">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div>
                <NavBar />
                <div className="quiz-details-page">
                    <div className="quiz-details-container">
                        <div className="error">Квизот не е пронајден</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <NavBar />
            <div className="quiz-details-page">
                <div className="quiz-details-container">
                    <div className="quiz-details-header">
                        <span className="due-date">Рок до: 20 декември</span>
                        <Button className="btn-nazad" content={"Назад"} onClick={handleBackToQuizzes} />
                    </div>

                    <div className="quiz-details-card">
                        <h1 className="quiz-title">{quiz.title}</h1>

                        <div className="quiz-description">
                            <h3 className="description-title">НАПОМЕНА:</h3>
                            <p className="description-text">
                                Квизот не е задолжителен и носи дополнителни поени.
                                Секое прашање носи по 5 поени и нема негативни поени. Може само еднаш
                                да го направите квизот.
                            </p>
                        </div>

                        <div className="quiz-stats">
                            <span className="total-questions">Вкупно број на прашања: {quiz.questions?.length || 0}</span>
                            <span className="total-points">Вкупно поени: {quiz.questions?.reduce((sum, q) => sum + (q.points || 5), 0) || 0}</span>
                        </div>

                        <button className="start-quiz-btn" onClick={startQuiz}>
                            Започни
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizPage;