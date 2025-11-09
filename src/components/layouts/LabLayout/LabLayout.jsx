import './LabLayout.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllSubjects, getSubjectsByProfessor } from '../../../services/databaseService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import Input from '../../ui/Input/Input';
import Button from '../../ui/Button/Button';

function LabLayout() {
    const [subjects, setSubjects] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Load displayed subjects from localStorage
    useEffect(() => {
        const savedDisplayedSubjects = localStorage.getItem('displayedSubjects');
        if (savedDisplayedSubjects) {
            try {
                const parsedSubjects = JSON.parse(savedDisplayedSubjects);
                // We'll merge these with fetched subjects after they're loaded
                console.log('Loaded displayed subjects from localStorage:', parsedSubjects);
            } catch (error) {
                console.error('Error parsing saved subjects:', error);
            }
        }
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

            // Fetch ALL labs from Firebase
            try {
                const labsSnapshot = await getDocs(collection(db, 'labs'));
                const allLabs = [];
                labsSnapshot.forEach((doc) => {
                    allLabs.push({ id: doc.id, ...doc.data() });
                });
                console.log('All labs from Firebase:', allLabs);
                console.log('Lab IDs:', allLabs.map(lab => ({ title: lab.title, id: lab.id })));
                setLabs(allLabs);
            } catch (labError) {
                console.error('Error fetching all labs:', labError);
            }

            if (result.success) {
                let displaySubjects;
                
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

                // Load saved displayed subjects and merge with default ones
                const savedDisplayedSubjects = localStorage.getItem('displayedSubjects');
                let finalSubjects = uniqueSubjects;

                if (savedDisplayedSubjects) {
                    try {
                        const savedSubjectIds = JSON.parse(savedDisplayedSubjects);
                        const savedSubjects = result.data.filter(subject =>
                            savedSubjectIds.includes(subject.id)
                        );

                        // Combine unique subjects with saved ones, avoiding duplicates
                        const allDisplayedSubjects = [...uniqueSubjects];
                        savedSubjects.forEach(savedSubject => {
                            if (!allDisplayedSubjects.find(s => s.id === savedSubject.id)) {
                                allDisplayedSubjects.push(savedSubject);
                            }
                        });

                        finalSubjects = allDisplayedSubjects;
                    } catch (error) {
                        console.error('Error loading saved subjects:', error);
                    }
                }

                setSubjects(finalSubjects);
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

    const handleAddExistingSubject = () => {
        if (!selectedSubjectId) {
            alert('Ве молиме изберете предмет');
            return;
        }

        const selectedSubject = allSubjects.find(s => s.id === selectedSubjectId);
        if (selectedSubject) {
            // Add the selected subject to the displayed subjects
            const updatedSubjects = [...subjects, selectedSubject];
            setSubjects(updatedSubjects);

            // Save to localStorage
            const subjectIds = updatedSubjects.map(s => s.id);
            localStorage.setItem('displayedSubjects', JSON.stringify(subjectIds));

            setSelectedSubjectId('');
            setShowCreateForm(false);
            alert('Предметот е успешно додаден!');
        }
    };

    const handleRemoveSubject = (subjectId) => {
        if (window.confirm('Дали сте сигурни дека сакате да го отстраните овој предмет од приказот?')) {
            const updatedSubjects = subjects.filter(s => s.id !== subjectId);
            setSubjects(updatedSubjects);

            // Update localStorage
            const subjectIds = updatedSubjects.map(s => s.id);
            localStorage.setItem('displayedSubjects', JSON.stringify(subjectIds));

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
                            >
                                <div className="lab-card-header">
                                    <h3 className="subject-name-lab">{formatSubjectName(subject)}</h3>
                                    {userRole === 'professor' && (
                                        <button
                                            className="professor-edit-btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveSubject(subject.id);
                                            }}
                                            style={{ backgroundColor: '#4a90a4',
                                                    width: '10vw'
                                             }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="lab-card-content">
                                    <div className="lab-info">
                                        <div>
                                            {/* Display ALL labs for this subject */}
                                            {labs.filter(lab => lab.subjectId === subject.id).length > 0 ? (
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {labs.filter(lab => lab.subjectId === subject.id).map((lab) => (
                                                        <li key={lab.id} style={{ marginBottom: '5px' }}>
                                                            <span className="star-icon">★</span>
                                                            <span
                                                                className="lab-name"
                                                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    console.log('Clicking lab:', lab.title, 'with ID:', lab.id);
                                                                    console.log('Navigating to:', `/labs/${subject.id}/${lab.id}`);
                                                                    navigate(`/labs/${subject.id}/${lab.id}`);
                                                                }}
                                                            >
                                                                {lab.title}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="lab-name">Лабораториска вежба</span>
                                            )}

                                            {/* Create new lab link - ONLY FOR PROFESSORS */}
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

export default LabLayout;