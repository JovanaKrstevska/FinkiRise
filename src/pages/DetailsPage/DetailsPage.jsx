import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from '../../components/ui/NavBar/NavBar';
import './DetailsPage.css';
import Button from '../../components/ui/Button/Button';
import LabExam from '../../components/exam/LabExam/LabExam';
import { getLabBySubject, submitLabExam } from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';

function DetailsPage() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [subject, setSubject] = useState(null);
    const [labData, setLabData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [examStarted, setExamStarted] = useState(false);
    const [examCompleted, setExamCompleted] = useState(false);
    const [examResults, setExamResults] = useState(null);

    useEffect(() => {
        fetchLabData();
    }, [subjectId]);

    const fetchLabData = async () => {
        try {
            setLoading(true);

            // Fetch lab data from Firebase
            const labResult = await getLabBySubject(subjectId);

            if (labResult.success) {
                setLabData(labResult.data);

                // Mock subject data - you can fetch this from subjects collection too
                const mockSubject = {
                    name: "Веб програмирање",
                    academicYear: "2025/2026",
                    semesterType: "summer"
                };
                setSubject(mockSubject);
            } else {
                console.error('Failed to fetch lab data:', labResult.error);
            }
        } catch (error) {
            console.error('Error fetching lab data:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleBackToLab = () => {
        navigate('/lab');
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
                labId: labData.id,
                subjectId: subjectId,
                answers: submission.answers,
                score: score,
                totalPoints: labData.questions.reduce((sum, q) => sum + q.points, 0),
                timeSpent: submission.timeSpent,
                completedAt: submission.completedAt
            };

            const result = await submitLabExam(submissionData);

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
                <div className="lab-details-loading">Loading lab data...</div>
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
                    />
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
                            <h1 className="results-title">Резултати од испитот</h1>
                            <div className="score-display">
                                <div className="score-circle">
                                    <span className="score-number">{examResults.score}</span>
                                    <span className="score-total">/ 100</span>
                                </div>
                            </div>
                            <div className="results-details">
                                <p>Вашиот резултат: <strong>{examResults.score} од {examResults.totalPoints} поени</strong></p>
                                <p>Процент: <strong>{Math.round((examResults.score / examResults.totalPoints) * 100)}%</strong></p>
                                <p>Статус: <strong>{examResults.score >= (examResults.totalPoints * 0.6) ? 'Положено' : 'Не положено'}</strong></p>
                            </div>
                            <div className="results-actions">
                                <Button
                                    className="btn-back-to-labs"
                                    content={"Назад кон лабораториски"}
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
                            <h3 className="description-title">НАПОМЕНА:</h3>
                            <p className="description-text">
                                Лабораториската вежба не е задолжителна и носи дополнителни поени.
                                Секое прашање носи по 5 поени и нема негативни поени. Може само еднаш
                                да ја направите лабораториската вежба.
                            </p>
                        </div>

                        <div className="lab-stats">
                            <span className="total-questions">Вкупно број на прашања: {labData.questions.length}</span>
                            <span className="total-points">Вкупно поени: {labData.questions.reduce((sum, q) => sum + q.points, 0)}</span>
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