import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from '../../components/ui/NavBar/NavBar';
import './DetailsPage.css';
import Button from '../../components/ui/Button/Button';
import LabExam from '../../components/exam/LabExam/LabExam';
import { getLabById, submitLabExam, getExamById, submitExam } from '../../services/databaseService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

function DetailsPage() {
    const params = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [subject, setSubject] = useState(null);
    const [labData, setLabData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [examStarted, setExamStarted] = useState(false);
    const [examCompleted, setExamCompleted] = useState(false);
    const [examResults, setExamResults] = useState(null);
    const [reviewMode, setReviewMode] = useState(false);
    const [currentReviewQuestion, setCurrentReviewQuestion] = useState(0);

    // Handle different route patterns:
    // /labs/:subjectId/:labId -> params.labId
    // /exams/detail/:examId -> params.examId
    const labId = params.labId;
    const examId = params.examId;
    
    // Determine if this is a lab or exam
    const isExam = !!examId;
    const contentId = examId || labId;
    
    console.log('📍 DetailsPage params:', params);
    console.log('📍 labId:', labId, 'examId:', examId);
    console.log('📍 isExam:', isExam, 'contentId:', contentId);

    useEffect(() => {
        fetchContentData();
    }, [contentId, isExam]);

    const fetchContentData = async () => {
        try {
            setLoading(true);

            // Fetch data from Firebase based on type
            const result = isExam
                ? await getExamById(contentId)
                : await getLabById(contentId);

            if (result.success) {
                setLabData(result.data);

                console.log('Exam/Lab data:', result.data);
                console.log('SubjectId from exam/lab:', result.data.subjectId);

                // Fetch actual subject data based on subjectId
                if (result.data.subjectId) {
                    try {
                        console.log('Fetching subject with ID:', result.data.subjectId);
                        const subjectDoc = await getDoc(doc(db, 'subjects', result.data.subjectId));
                        if (subjectDoc.exists()) {
                            const subjectData = subjectDoc.data();
                            console.log('Found subject:', subjectData);
                            console.log('Subject name:', subjectData.name);
                            setSubject(subjectData);
                        } else {
                            console.error('Subject not found:', result.data.subjectId);
                            // Fallback subject
                            setSubject({ name: 'Непознат предмет' });
                        }
                    } catch (subjectError) {
                        console.error('Error fetching subject:', subjectError);
                        setSubject({ name: 'Непознат предмет' });
                    }
                } else {
                    console.error('No subjectId found in exam/lab data');
                    setSubject({ name: 'Непознат предмет' });
                }
            } else {
                console.error(`Failed to fetch ${isExam ? 'exam' : 'lab'} data:`, result.error);
            }
        } catch (error) {
            console.error(`Error fetching ${isExam ? 'exam' : 'lab'} data:`, error);
        } finally {
            setLoading(false);
        }
    };



    const handleBackToLab = () => {
        navigate(isExam ? '/exams' : '/labs');
    };

    const handleStartLab = () => {
        setExamStarted(true);
    };

    const handleExamSubmit = async (submission) => {
        try {
            // Calculate score based on correct answers
            let score = 0;
            const totalQuestions = labData.questions.length;

            labData.questions.forEach(question => {
                const userAnswer = submission.answers[question.id];

                if (question.type === 'multiple-choice') {
                    if (userAnswer === question.correctAnswer) {
                        score += question.points;
                    }
                } else if (question.type === 'coding' || question.type === 'file-upload') {
                    // For coding and file upload, give points if answer exists
                    // In a real system, you'd have more sophisticated grading
                    if (userAnswer && userAnswer.toString().trim().length > 0) {
                        score += question.points;
                    }
                }
            });

            // Save submission to Firebase
            const submissionData = {
                studentId: currentUser.uid,
                [isExam ? 'examId' : 'labId']: labData.id,
                subjectId: labData.subjectId,
                answers: submission.answers,
                score: score,
                totalPoints: labData.questions.reduce((sum, q) => sum + q.points, 0),
                timeSpent: submission.timeSpent,
                completedAt: submission.completedAt
            };

            const result = isExam
                ? await submitExam(submissionData)
                : await submitLabExam(submissionData);

            if (result.success) {
                console.log('✅ Exam submitted successfully:', result.id);
            } else {
                console.error('❌ Failed to submit exam:', result.error);
            }

            setExamResults({
                score,
                totalQuestions,
                totalPoints: submissionData.totalPoints,
                submission
            });
            setExamCompleted(true);
            setExamStarted(false);
        } catch (error) {
            console.error('Error submitting exam:', error);
        }
    };

    const handleExamExit = () => {
        setExamStarted(false);
    };

    if (loading || !labData) {
        return (
            <div>
                <NavBar />
                <div className="lab-details-loading">Loading {isExam ? 'exam' : 'lab'} data...</div>
            </div>
        );
    }

    // Show exam interface
    if (examStarted) {
        return (
            <div>
                <NavBar />
                <div className="lab-details-page">
                    <LabExam
                        labData={labData}
                        onSubmit={handleExamSubmit}
                        onExit={handleExamExit}
                        isExam={isExam}
                    />
                </div>
            </div>
        );
    }

    // Show review mode
    if (reviewMode && examResults && labData) {
        const currentQ = labData.questions[currentReviewQuestion];
        const userAnswer = examResults.submission.answers[currentQ.id];



        return (
            <div>
                <NavBar />
                <div className="lab-details-page">
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
                                    {labData.questions.map((question, index) => (
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

    // Show exam results
    if (examCompleted && examResults) {
        return (
            <div>
                <NavBar />
                <div className="lab-details-page">
                    <div className="lab-details-container">
                        <div className="exam-results">
                            <div className="results-card">
                                {isExam ? (
                                    <>
                                        <h1 className="results-title">Крај на испитот!</h1>
                                        <div className="results-message">
                                            <p>Резултатите по предметот <strong>"{subject?.name || 'Име на предметот'}"</strong> ќе бидат објавени од страна на професорите</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="results-title">Стигнавте до крајот на лабораториската!</h1>
                                        <div className="results-message">
                                            <p>Резултатите од лабораториската по предметот <strong>"{subject?.name || 'Предмет'}"</strong> ќе бидат објавени од страна на професорите. Дотолку сакате да си ги видите решенијата притеснете на копчето <strong>Преглед</strong>.</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="results-actions">
                                {!isExam && (
                                    <Button
                                        className="btn-preview"
                                        content={"Преглед"}
                                        onClick={() => setReviewMode(true)}
                                    />
                                )}
                                <Button
                                    className="btn-exit"
                                    content={"Излез"}
                                    onClick={handleBackToLab}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show lab details/start screen
    return (
        <div>
            <NavBar />
            <div className="lab-details-page">
                <div className="lab-details-container">
                    <div className="lab-details-header">
                        <span className="due-date">Рок до: 20 декември</span>
                        <Button className="btn-nazad" content={"Назад"} onClick={handleBackToLab} />
                    </div>

                    <div className="lab-details-card">
                        <h1 className="lab-title">{labData.title}</h1>

                        <div className="lab-description">
                            {isExam ? (
                                <>
                                    <p className="description-text">
                                        За да го положите овој дел треба да извадите мин <strong>50 поени</strong>.
                                        Материјали Ви се дозволени така што кликање на копчето материјали
                                        автоматски ќе ви се симнат сите дадени материјали кои Ви се потребни.
                                    </p>
                                    <h3 className="description-title">НАПОМЕНА:</h3>
                                    <p className="description-text">
                                        За секое помагање, зборување и препишување, <strong>Ви се сопира испитот</strong> и ќе бидете на дисциплинска комисија!
                                    </p>
                                    <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '24px', fontWeight: 'bold', color: '#015E86' }}>
                                        Со среќа!
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="description-title">НАПОМЕНА:</h3>
                                    <p className="description-text">
                                        Лабораториската вежба не е задолжителна и носи дополнителни поени.
                                        Секое прашање носи по 5 поени и нема негативни поени. Може само еднаш
                                        да ја направите лабораториската вежба.
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="lab-stats">
                            {isExam ? (
                                <>
                                    <span className="total-questions">
                                        Време: {labData.timeLimit ? 
                                            labData.timeLimit >= 60 
                                                ? `${Math.floor(labData.timeLimit / 60)}:${(labData.timeLimit % 60).toString().padStart(2, '0')} часа`
                                                : `${labData.timeLimit} минути`
                                            : '90 минути'}
                                    </span>
                                    <span className="total-points">Вкупно број на прашања: {labData.questions.length}</span>
                                </>
                            ) : (
                                <>
                                    <span className="total-questions">Вкупно број на прашања: {labData.questions.length}</span>
                                    <span className="total-points">Вкупно поени: {labData.questions.reduce((sum, q) => sum + q.points, 0)}</span>
                                </>
                            )}
                        </div>

                        <button className="start-lab-btn" onClick={handleStartLab}>
                            Започни
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailsPage;