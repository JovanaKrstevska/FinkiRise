import './ExamLayout.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllSubjects, getSubjectsByProfessor } from '../../../services/databaseService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import Button from '../../ui/Button/Button';

function ExamLayout({ subjectId = null }) {
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
                console.log('Raw professor subjects from database:', result.data);
            } else {
                result = await getAllSubjects();
                console.log('Raw all subjects from database:', result.data);
            }

            // Also get all subjects to show available ones for adding
            const allSubjectsResult = userRole === 'professor'
                ? await getSubjectsByProfessor(currentUser.uid)
                : await getAllSubjects();

            if (allSubjectsResult.success) {
                setAllSubjects(allSubjectsResult.data);
            }

            // Fetch exams for current professor only
            try {
                const examsSnapshot = await getDocs(collection(db, 'exams'));
                const allExams = [];
                examsSnapshot.forEach((doc) => {
                    const examData = { id: doc.id, ...doc.data() };
                    allExams.push(examData);
                });
                
                // Filter exams by current professor
                const professorExams = userRole === 'professor' 
                    ? allExams.filter(exam => exam.professorId === currentUser.uid)
                    : allExams;
                
                console.log('All exams:', allExams);
                console.log('Professor exams:', professorExams);
                console.log('Current user ID:', currentUser.uid);
                
                setExams(professorExams);
            } catch (examError) {
                console.error('Error fetching exams:', examError);
            }

            if (result.success) {
                let displaySubjects;
                
                if (subjectId) {
                    // Show only the specific subject that was clicked
                    displaySubjects = result.data.filter(subject => subject.id === subjectId);
                    console.log('Showing specific subject:', displaySubjects);
                } else {
                    // Show all subjects without any limit
                    displaySubjects = result.data.sort((a, b) => {
                        return b.academicYear.localeCompare(a.academicYear);
                    });
                    console.log('Showing all subjects:', displaySubjects.length);
                }

                console.log('Subjects for display:', displaySubjects.map(s => ({
                    name: s.name,
                    academicYear: s.academicYear,
                    id: s.id
                })));
                
                setSubjects(displaySubjects);
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
            <div className="exam-layout">
                <div className="exam-container">
                    <div className="loading-message">Loading subjects...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exam-layout">
                <div className="exam-container">
                    <div className="error-message">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="exam-layout">
            <div className="exam-container">
                {subjects.length === 0 ? (
                    <div className="no-subjects-message">
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
                                className="exam-card"
                            >
                                <div className="exam-card-header">
                                    <h3 className="subject-name-exam">{formatSubjectName(subject)}</h3>
                                    {userRole === 'professor' && (
                                        <button
                                            className="professor-edit-btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveSubject(subject.id);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="exam-card-content">
                                    <div className="exam-info">
                                        <div>
                                            {/* Display exams for this subject */}
                                            {(() => {
                                                const subjectExams = exams.filter(exam => exam.subjectId === subject.id);
                                                console.log(`Subject "${subject.name}" (ID: ${subject.id}) has ${subjectExams.length} exams:`, subjectExams);
                                                return subjectExams.length > 0;
                                            })() ? (
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {exams.filter(exam => exam.subjectId === subject.id).map((exam) => (
                                                        <li key={exam.id} style={{ marginBottom: '5px' }}>
                                                            <span className="star-icon">★</span>
                                                            <span
                                                                className="exam-name exam-link"
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
                                                <span className="exam-name">Име на испитот</span>
                                            )}

                                            {/* Create new exam link - ONLY FOR PROFESSORS */}
                                            {userRole === 'professor' && (
                                                <span
                                                    className="create-exam-link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Creating exam for subject:', subject.name, 'with ID:', subject.id);
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
                            <div className="professor-create-section">
                                {!showCreateForm ? (
                                    <div className="professor-create-card-simple">
                                        <button
                                            className="professor-create-btn-simple"
                                            onClick={() => setShowCreateForm(true)}
                                        >
                                            <span className="professor-plus-icon-simple">+</span>
                                            <span className="professor-create-text-simple">Креирај ново</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="professor-create-card-simple">
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
                                                    className='btn-dodaj'
                                                    content={"Додај"}
                                                />
                                                <Button
                                                    onClick={() => {
                                                        setShowCreateForm(false);
                                                        setSelectedSubjectId('');
                                                    }}
                                                    className='btn-otkazi'
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