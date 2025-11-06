import './ExamDetailLayout.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllSubjects, getSubjectsByProfessor } from '../../../services/databaseService';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import Button from '../../ui/Button/Button';
import Input from '../../ui/Input/Input';

function ExamDetailLayout({ subjectId = null, children }) {
    const [subjects, setSubjects] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [customExamSections, setCustomExamSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        fetchSubjects();
        fetchCustomExamSections();
    }, []);

    const fetchCustomExamSections = async () => {
        try {
            const customExamSectionsSnapshot = await getDocs(collection(db, 'customExamSections'));
            const customSections = [];
            customExamSectionsSnapshot.forEach((doc) => {
                const sectionData = { id: doc.id, ...doc.data() };
                // For professors: only show sections they created
                // For students: show all custom exam sections
                if (userRole === 'professor') {
                    if (sectionData.professorId === currentUser.uid) {
                        customSections.push(sectionData);
                    }
                } else {
                    // Students can see all custom exam sections
                    customSections.push(sectionData);
                }
            });
            console.log('Custom exam sections:', customSections);
            setCustomExamSections(customSections);
        } catch (error) {
            console.error('Error fetching custom exam sections:', error);
        }
    };

    // Load displayed subjects from localStorage
    useEffect(() => {
        const savedDisplayedSubjects = localStorage.getItem('displayedExamSubjects');
        if (savedDisplayedSubjects) {
            try {
                const parsedSubjects = JSON.parse(savedDisplayedSubjects);
                console.log('Loaded displayed exam subjects from localStorage:', parsedSubjects);
            } catch (error) {
                console.error('Error parsing saved exam subjects:', error);
            }
        }
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
                    const savedDisplayedSubjects = localStorage.getItem('displayedExamSubjects');
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
                            console.error('Error loading saved exam subjects:', error);
                        }
                    }

                    displaySubjects = finalSubjects;
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
        // If it's a custom exam section, return the name as is
        if (subject.isCustomExam) {
            return subject.name;
        }
        
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

            // Save to localStorage
            const subjectIds = updatedSubjects.map(s => s.id);
            localStorage.setItem('displayedExamSubjects', JSON.stringify(subjectIds));

            setSelectedSubjectId('');
            setShowCreateForm(false);
            alert('Предметот е успешно додаден!');
        }
    };

    const handleAddNewExamSection = async () => {
        if (!selectedSubjectId.trim()) {
            alert('Ве молиме внесете наслов на испитот');
            return;
        }

        try {
            // Create a new exam section with the entered title
            const newExamSection = {
                id: `exam-${Date.now()}`,
                name: selectedSubjectId.trim(),
                academicYear: new Date().getFullYear().toString(),
                isCustomExam: true,
                professorId: currentUser.uid,
                createdAt: new Date().toISOString()
            };

            // Save to Firebase
            await setDoc(doc(db, 'customExamSections', newExamSection.id), newExamSection);

            // Update local state
            const updatedCustomSections = [...customExamSections, newExamSection];
            setCustomExamSections(updatedCustomSections);

            setSelectedSubjectId('');
            setShowCreateForm(false);
            alert('Новиот испит е успешно додаден!');
        } catch (error) {
            console.error('Error adding custom exam section:', error);
            alert('Грешка при додавање на испитот. Ве молиме обидете се повторно.');
        }
    };

    const handleRemoveSubject = (subjectId) => {
        if (window.confirm('Дали сте сигурни дека сакате да го отстраните овој предмет од приказот?')) {
            const updatedSubjects = subjects.filter(s => s.id !== subjectId);
            setSubjects(updatedSubjects);

            // Update localStorage
            const subjectIds = updatedSubjects.map(s => s.id);
            localStorage.setItem('displayedExamSubjects', JSON.stringify(subjectIds));

            alert('Предметот е успешно отстранет!');
        }
    };

    const handleRemoveCustomSection = async (sectionId) => {
        if (window.confirm('Дали сте сигурни дека сакате да го отстраните овој испит од приказот?')) {
            try {
                // Remove from Firebase
                await deleteDoc(doc(db, 'customExamSections', sectionId));

                // Update local state
                const updatedCustomSections = customExamSections.filter(s => s.id !== sectionId);
                setCustomExamSections(updatedCustomSections);

                alert('Испитот е успешно отстранет!');
            } catch (error) {
                console.error('Error removing custom section:', error);
                alert('Грешка при отстранување на испитот. Ве молиме обидете се повторно.');
            }
        }
    };

    // Get subjects that are not currently displayed
    const getAvailableSubjects = () => {
        const displayedSubjectIds = subjects.map(s => s.id);
        return allSubjects.filter(subject => !displayedSubjectIds.includes(subject.id));
    };

    if (loading) {
        return (
            <div className="exam-detail-layout">
                {children}
                <div className="exam-detail-layout-container">
                    <div className="exam-detail-loading-message">Loading subjects...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exam-detail-layout">
                {children}
                <div className="exam-detail-layout-container">
                    <div className="exam-detail-error-message">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="exam-detail-layout">
            {children}
            <div className="exam-detail-layout-container">
                {subjects.length === 0 ? (
                    <div className="exam-detail-no-subjects-message">
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
                                className="exam-detail-card"
                            >
                                <div className="exam-detail-card-header">
                                    <h3 className="exam-detail-subject-name">{formatSubjectName(subject)}</h3>
                                    {userRole === 'professor' && (
                                        <button
                                            className="exam-detail-professor-edit-btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveSubject(subject.id);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="exam-detail-card-content">
                                    <div className="exam-detail-info">
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
                                                            <span className="exam-detail-star-icon">★</span>
                                                            <span
                                                                className="exam-detail-name exam-detail-exam-link"
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
                                                <span className="exam-detail-name">Име на испитот</span>
                                            )}

                                            {/* Create new exam link - ONLY FOR PROFESSORS */}
                                            {userRole === 'professor' && (
                                                <span
                                                    className="exam-detail-create-exam-link"
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

                        {/* Custom Exam Sections */}
                        {customExamSections.map((customSection) => (
                            <div
                                key={customSection.id}
                                className="exam-detail-card"
                            >
                                <div className="exam-detail-card-header">
                                    <h3 className="exam-detail-subject-name">{customSection.name}</h3>
                                    {userRole === 'professor' && (
                                        <button
                                            className="exam-detail-professor-edit-btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveCustomSection(customSection.id);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="exam-detail-card-content">
                                    <div className="exam-detail-info">
                                        <div>
                                            {/* Display exams for this custom section */}
                                            {exams.filter(exam => exam.customSectionId === customSection.id).length > 0 ? (
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {exams.filter(exam => exam.customSectionId === customSection.id).map((exam) => (
                                                        <li key={exam.id} style={{ marginBottom: '5px' }}>
                                                            <span className="exam-detail-star-icon">★</span>
                                                            <span
                                                                className="exam-detail-name exam-detail-exam-link"
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
                                                <span className="exam-detail-name">Име на испитот</span>
                                            )}

                                            {/* Create new exam link - ONLY FOR PROFESSORS */}
                                            {userRole === 'professor' && (
                                                <span
                                                    className="exam-detail-create-exam-link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Creating exam for custom section:', customSection.name, 'with ID:', customSection.id);
                                                        navigate(`/professor/exams/create/${customSection.id}`);
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
                            <div className="exam-detail-professor-create-section">
                                {!showCreateForm ? (
                                    <div className="exam-detail-professor-create-card-simple">
                                        <button
                                            className="exam-detail-professor-create-btn-simple"
                                            onClick={() => setShowCreateForm(true)}
                                        >
                                            <span className="exam-detail-professor-plus-icon-simple">+</span>
                                            <span className="exam-detail-professor-create-text-simple">Креирај ново</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="exam-detail-professor-create-card-simple">
                                        <div style={{ padding: '20px' }}>
                                            <h3 style={{ marginBottom: '15px' }}>Додај нов испит</h3>
                                            <Input
                                                type="text"
                                                value={selectedSubjectId}
                                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                                placeholder="Испит 11/6/2025 - Термин 3"
                                                style="exam-detail-input-field"
                                            />
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <Button
                                                    onClick={handleAddNewExamSection}
                                                    className='exam-detail-btn-dodaj'
                                                    content={"Додај"}
                                                />
                                                <Button
                                                    onClick={() => {
                                                        setShowCreateForm(false);
                                                        setSelectedSubjectId('');
                                                    }}
                                                    className='exam-detail-btn-otkazi'
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

export default ExamDetailLayout;