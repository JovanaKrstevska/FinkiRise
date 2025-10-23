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
    }, []);

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
                // Filter to get unique subjects by name, preferring newer academic years
                const uniqueSubjects = [];
                const seenNames = new Set();

                // Sort by academic year (newest first) to prefer newer versions
                const sortedSubjects = result.data.sort((a, b) => {
                    return b.academicYear.localeCompare(a.academicYear);
                });

                // Add unique subjects by name (first 4)
                for (const subject of sortedSubjects) {
                    if (!seenNames.has(subject.name) && uniqueSubjects.length < 4) {
                        uniqueSubjects.push(subject);
                        seenNames.add(subject.name);
                    }
                }

                // Add 5th subject - another unique one if available
                for (const subject of sortedSubjects) {
                    if (!seenNames.has(subject.name) && uniqueSubjects.length < 5) {
                        uniqueSubjects.push(subject);
                        seenNames.add(subject.name);
                        break;
                    }
                }

                // Add 6th subject - same subject but different semester/year
                for (const subject of sortedSubjects) {
                    if (uniqueSubjects.length >= 6) break;

                    // Find a subject that has the same name as one we already have but different year/semester
                    const existingSubject = uniqueSubjects.find(s => s.name === subject.name);
                    if (existingSubject &&
                        (existingSubject.academicYear !== subject.academicYear ||
                            existingSubject.semesterType !== subject.semesterType) &&
                        !uniqueSubjects.find(s => s.id === subject.id)) {
                        uniqueSubjects.push(subject);
                        break;
                    }
                }

                // If we still don't have 6, fill with any remaining subjects
                if (uniqueSubjects.length < 6) {
                    for (const subject of sortedSubjects) {
                        if (uniqueSubjects.length >= 6) break;
                        if (!uniqueSubjects.find(s => s.id === subject.id)) {
                            uniqueSubjects.push(subject);
                        }
                    }
                }

                setSubjects(uniqueSubjects);
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
                        {userRole === 'professor'
                            ? 'No subjects available. Please create subjects first.'
                            : 'No subjects available for lab exercises.'
                        }
                    </div>
                ) : (
                    <>
                        {subjects.map((subject) => (
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
                                        {userRole === 'professor' && (
                                            <span
                                                className="create-lab-link"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/professor/labs/create/${subject.id}`);
                                                }}
                                            >
                                                + Креирај нова
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default LabLayout;