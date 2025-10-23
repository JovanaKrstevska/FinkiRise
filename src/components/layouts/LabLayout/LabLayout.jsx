import './LabLayout.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllSubjects, getSubjectsByProfessor } from '../../../services/databaseService';

function LabLayout() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        fetchSubjects();
    }, [currentUser, userRole]);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            let result;

            if (userRole === 'professor') {
                result = await getSubjectsByProfessor(currentUser.uid);
            } else {
                result = await getAllSubjects();
            }

            if (result.success) {
                // Take only first 4 subjects for display
                setSubjects(result.data.slice(0, 4));
            } else {
                setError(result.error || 'Failed to fetch subjects');
            }
        } catch (err) {
            setError('Error fetching subjects');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLabClick = (subject) => {
        navigate(`/lab/${subject.id}`);
    };

    const formatSubjectName = (subject) => {
        return `${subject.name} - ${subject.academicYear}`;
    };

    if (loading) {
        return (
            <div className="lab-layout">
                <div className="lab-container">
                    <div className="loading-message">Loading subjects...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="lab-layout">
                <div className="lab-container">
                    <div className="error-message">Error: {error}</div>
                </div>
            </div>
        );
    }


    return (
        <div className="lab-layout">
            <div className="lab-container">
                {subjects.length === 0 ? (
                    <div className="no-subjects-message">
                        No subjects available for lab exercises.
                    </div>
                ) : (
                    subjects.map((subject) => (
                        <div
                            key={subject.id}
                            className="lab-card"
                            onClick={() => handleLabClick(subject)}
                        >
                            <div className="lab-card-header">
                                <h3 className="subject-name">{formatSubjectName(subject)}</h3>
                            </div>
                            <div className="lab-card-content">
                                <div className="lab-info">
                                    <span className="star-icon">★</span>
                                    <span className="lab-name">Лабораториска вежба</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default LabLayout;