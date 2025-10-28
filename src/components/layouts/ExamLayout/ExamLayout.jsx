import './ExamLayout.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllSubjects, getSubjectsByProfessor } from '../../../services/databaseService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import Button from '../../ui/Button/Button';

function ExamLayout() {
    const [subjects, setSubjects] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
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

            // Also get all subjects to show available ones for adding
            const allSubjectsResult = userRole === 'professor'
                ? await getSubjectsByProfessor(currentUser.uid)
                : await getAllSubjects();

            if (allSubjectsResult.success) {
                setAllSubjects(allSubjectsResult.data);
            }

            // Fetch ALL exams from Firebase
            try {
                const examsSnapshot = await getDocs(collection(db, 'exams'));
                const allExams = [];
                examsSnapshot.forEach((doc) => {
                    allExams.push({ id: doc.id, ...doc.data() });
                });
                setExams(allExams);
            } catch (examError) {
                console.error('Error fetching all exams:', examError);
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

    const formatSubjectName = (subject) => {
        // Use subject ID to generate a consistent term number (1-4)
        const termNumber = (subject.id.charCodeAt(0) % 4) + 1;
        return `Испит ${new Date().toLocaleDateString('mk-MK')} - Термин ${termNumber}`;
    };

    const handleAddExistingSubject = () => {
        if (!selectedSubjectId) {
            alert('Ве молиме изберете предмет');
            return;
        }

        const selectedSubject = allSubjects.find(s => s.id === selectedSubjectId);
        if (selectedSubject) {
            const updatedSubjects = [...subjects, selectedSubject];
            setSubjects(updatedSubjects);
            setSelectedSubjectId('');
            setShowCreateForm(false);
            alert('Предметот е успешно додаден!');
        }
    };

    const handleRemoveSubject = (subjectId) => {
        if (window.confirm('Дали сте сигурни дека сакате да го отстраните овој предмет од приказот?')) {
            const updatedSubjects = subjects.filter(s => s.id !== subjectId);
            setSubjects(updatedSubjects);
            alert('Предметот е успешно отстранет!');
        }
    };

    // Get subjects that are not currently displayed
    const getAvailableSubjects = () => {
        const displayedSubjectIds = subjects.map(s => s.id);
        return allSubjects.filter(subject => !displayedSubjectIds.includes(subject.id));
    };

    if (loading) {
        return (
            <div className="exam-subject-layout">
                <div className="exam-subject-container">
                    <div className="exam-loading-message">Loading subjects...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exam-subject-layout">
                <div className="exam-subject-container">
                    <div className="exam-error-message">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="exam-subject-layout">
            <div className="exam-subject-container">
                {subjects.length === 0 ? (
                    <div className="exam-no-subjects-message">
                        {userRole === 'professor'
                            ? 'No subjects available. Please create subjects first.'
                            : 'No subjects available for exams.'
                        }
                    </div>
                ) : (
                    <>
                        {subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className="exam-subject-card"
                            >
                                <div className="exam-subject-card-header">
                                    <h3 className="exam-subject-name">{formatSubjectName(subject)}</h3>
                                    {userRole === 'professor' && (
                                        <button
                                            className="exam-professor-edit-btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveSubject(subject.id);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="exam-subject-card-content">
                                    <div className="exam-subject-info">
                                        <div>
                                            {/* Display exams for this subject */}
                                            {exams.filter(exam => exam.subjectId === subject.id).length > 0 ? (
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {exams.filter(exam => exam.subjectId === subject.id).map((exam) => (
                                                        <li key={exam.id} style={{ marginBottom: '5px' }}>
                                                            <span className="exam-subject-star-icon">★</span>
                                                            <span
                                                                className="exam-subject-name"
                                                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/exams/detail/${exam.id}`);
                                                                }}
                                                            >
                                                                {exam.title || 'Име на испитот'}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="exam-subject-name">Име на испитот</span>
                                            )}

                                            {/* Create new exam link - ONLY FOR PROFESSORS */}
                                            {userRole === 'professor' && (
                                                <span
                                                    className="exam-create-link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/professor/exams/create/${subject.id}`);
                                                    }}
                                                >
                                                    + Креирај нов
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Professor-only create new section */}
                        {userRole === 'professor' && (
                            <div className="exam-professor-create-section">
                                {!showCreateForm ? (
                                    <div className="exam-professor-create-card-simple">
                                        <button
                                            className="exam-professor-create-btn-simple"
                                            onClick={() => setShowCreateForm(true)}
                                        >
                                            <span className="exam-professor-plus-icon-simple">+</span>
                                            <span className="exam-professor-create-text-simple">Креирај ново</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="exam-professor-create-card-simple">
                                        <div style={{ padding: '20px' }}>
                                            <h3 style={{ marginBottom: '15px' }}>Додај постоечки предмет</h3>
                                            <select
                                                value={selectedSubjectId}
                                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    marginBottom: '15px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <option value="">Изберете предмет...</option>
                                                {getAvailableSubjects().map(subject => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name} - {subject.academicYear}
                                                    </option>
                                                ))}
                                            </select>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <Button
                                                    onClick={handleAddExistingSubject}
                                                    className='exam-btn-dodaj'
                                                    content={"Додај"}
                                                />
                                                <Button
                                                    onClick={() => {
                                                        setShowCreateForm(false);
                                                        setSelectedSubjectId('');
                                                    }}
                                                    className='exam-btn-otkazi'
                                                    content={"Откажи"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ExamLayout;