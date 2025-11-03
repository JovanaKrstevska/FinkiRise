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

    const startQuiz = () => {
        navigate(`/take-quiz/${subjectId}/${quizId}`);
    };

    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="quiz-page">
                    <div className="loading">Се вчитува квизот...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <NavBar />
                <div className="quiz-page">
                    <div className="error">{error}</div>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div>
                <NavBar />
                <div className="quiz-page">
                    <div className="error">Квизот не е пронајден</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <NavBar />
            <div className="quiz-page">
                <div className="quiz-info-container">
                    <div className="quiz-info-card">
                        <div className="quiz-header">
                            <h1 className="quiz-title">{quiz.title}</h1>
                            <div className="quiz-details">
                                <p className="quiz-time">Време: {quiz.timeLimit || 30} минути</p>
                                <p className="quiz-questions">Вкупно прашања: {quiz.questions?.length || 0}</p>
                            </div>
                        </div>

                        <div className="quiz-instructions">
                            <h3>Инструкции:</h3>
                            <ul>
                                <li>Квизот се состои од {quiz.questions?.length || 0} прашања</li>
                                <li>Имате {quiz.timeLimit || 30} минути за решавање</li>
                                <li>Секое прашање носи {quiz.questions?.[0]?.points || 5} поени</li>
                                <li>Можете да се вратите на претходни прашања</li>
                                <li>Кликнете "Започни" за да го започнете квизот</li>
                            </ul>
                        </div>

                        <div className="quiz-actions">
                            <Button
                                className="btn-start-quiz"
                                content="Започни"
                                onClick={startQuiz}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizPage;