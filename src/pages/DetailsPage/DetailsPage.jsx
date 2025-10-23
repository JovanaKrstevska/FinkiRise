import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from '../../components/ui/NavBar/NavBar';
import './DetailsPage.css';
import Button from '../../components/ui/Button/Button';

function DetailsPage() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For now, we'll use mock data. You can replace this with actual Firebase fetch
        const mockSubject = {
            name: "Веб програмирање",
            academicYear: "2025/2026",
            semesterType: "summer"
        };

        setSubject(mockSubject);
        setLoading(false);
    }, [subjectId]);

    const handleBackToLab = () => {
        navigate('/lab');
    };

    const handleStartLab = () => {
        // Handle lab start logic here
        console.log('Starting lab for subject:', subjectId);
    };

    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="lab-details-loading">Loading...</div>
            </div>
        );
    }

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
                        <h1 className="lab-title">Име на лабораториската вежба</h1>

                        <div className="lab-description">
                            <h3 className="description-title">НАПОМЕНА:</h3>
                            <p className="description-text">
                                Лабораториската вежба не е задолжителна и носи дополнителни поени.
                                Секое прашање носи по 5 поени и нема негативни поени. Може само еднаш
                                да ја направите лабораториската вежба.
                            </p>
                        </div>

                        <div className="lab-stats">
                            <span className="total-questions">Вкупно број на прашања: 20</span>
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