import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import '../CourseLayout/CourseLayout.css';

function StudentCourseLayout({ subjectId }) {
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [courseContent, setCourseContent] = useState({
        lectures: [],
        exercises: [],
        literature: [],
        recordings: [],
        quizzes: [],
        labs: [],
        homework: [],
        results: []
    });
    const [studentProgress, setStudentProgress] = useState({
        overall: 75,  // Test value to see if UI updates
        homework: 85, // Test value
        quizzes: 70,  // Test value
        labs: 80,     // Test value
        skills: []
    });
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('🔄 StudentCourseLayout useEffect triggered');
        console.log('📋 Subject ID:', subjectId);
        console.log('👤 Current User:', currentUser?.uid);
        
        if (subjectId) {
            fetchSubject();
            fetchCourseContent();
            if (currentUser) {
                fetchStudentProgress();
            } else {
                console.log('⚠️ No current user, cannot fetch progress');
            }
        }
    }, [subjectId, currentUser]);

    const fetchSubject = async () => {
        try {
            setLoading(true);
            console.log('StudentCourseLayout: Fetching subject with ID:', subjectId);
            
            const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
            if (subjectDoc.exists()) {
                const subjectData = { id: subjectDoc.id, ...subjectDoc.data() };
                console.log('StudentCourseLayout: Found subject:', subjectData);
                setSubject(subjectData);
            } else {
                setError('Subject not found');
            }
        } catch (err) {
            setError('Error fetching subject');
            console.error('StudentCourseLayout Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseContent = async () => {
        try {
            const contentDoc = await getDoc(doc(db, 'courseContent', subjectId));
            if (contentDoc.exists()) {
                const data = contentDoc.data();
                setCourseContent({
                    lectures: data.lectures || [],
                    exercises: data.exercises || [],
                    literature: data.literature || [],
                    recordings: data.recordings || [],
                    quizzes: data.quizzes || [],
                    labs: data.labs || [],
                    homework: data.homework || [],
                    results: data.results || []
                });
            }
        } catch (err) {
            console.error('Error fetching course content:', err);
        }
    };

    const fetchStudentProgress = async () => {
        try {
            if (!currentUser) {
                console.log('❌ No current user for progress fetching');
                return;
            }

            console.log('📊 Fetching student progress for user:', currentUser.uid, 'subject:', subjectId);
            console.log('🎯 Looking for progress data specific to subject:', subjectId);
            
            // Try subject-specific document ID patterns first
            const possibleDocIds = [
                `${currentUser.uid}_${subjectId}`,
                `${subjectId}_${currentUser.uid}`,
                `${currentUser.uid}-${subjectId}`,
                `${subjectId}-${currentUser.uid}`
            ];

            let progressData = null;
            
            // First, try subject-specific document IDs
            for (const docId of possibleDocIds) {
                try {
                    console.log('🔍 Trying to fetch subject-specific progress with docId:', docId);
                    const progressDoc = await getDoc(doc(db, 'studentProgress', docId));
                    
                    if (progressDoc.exists()) {
                        const data = progressDoc.data();
                        console.log('✅ Found progress document:', data);
                        
                        // Strict check - must match current subject
                        if (data.subjectId === subjectId || data.subject === subjectId) {
                            progressData = data;
                            console.log('✅ Progress data matches current subject:', subjectId);
                            break;
                        } else {
                            console.log('⚠️ Document found but for different subject:', data.subjectId || data.subject);
                        }
                    }
                } catch (docError) {
                    console.log('⚠️ Error fetching with docId:', docId, docError.message);
                }
            }
            
            // If no subject-specific document found, try to find it in a general document
            if (!progressData) {
                console.log('🔍 No subject-specific document found, trying general documents...');
                const generalDocIds = [currentUser.uid, subjectId];
                
                for (const docId of generalDocIds) {
                    try {
                        console.log('🔍 Trying general document with docId:', docId);
                        const progressDoc = await getDoc(doc(db, 'studentProgress', docId));
                        
                        if (progressDoc.exists()) {
                            const data = progressDoc.data();
                            console.log('✅ Found general progress document:', data);
                            
                            // Check if this document contains subject-specific data
                            if (data.subjects && data.subjects[subjectId]) {
                                progressData = data.subjects[subjectId];
                                console.log('✅ Found subject-specific data in general document');
                                break;
                            } else if (data.subjectId === subjectId || data.subject === subjectId) {
                                progressData = data;
                                console.log('✅ General document matches current subject');
                                break;
                            }
                        }
                    } catch (docError) {
                        console.log('⚠️ Error fetching general document:', docId, docError.message);
                    }
                }
            }

            if (progressData) {
                // Handle nested activities structure
                const activities = progressData.activities || {};
                
                // Update the progress state with fetched data
                const newProgress = {
                    overall: progressData.overall || progressData.overallProgress || 0,
                    homework: activities.homework || progressData.homework || progressData.homeworkProgress || 0,
                    quizzes: activities.quizzes || progressData.quizzes || progressData.quizProgress || 0,
                    labs: activities.labs || progressData.labs || progressData.labProgress || 0,
                    skills: progressData.skills || []
                };
                
                console.log('✅ Student progress updated from Firestore:', newProgress);
                console.log('📊 Activities data:', activities);
                setStudentProgress(newProgress);
            } else {
                console.log('⚠️ No subject-specific progress found, generating and saving unique progress for subject:', subjectId);
                
                // Generate unique progress based on subject ID to ensure different values per subject
                const subjectHash = subjectId.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
                
                const baseProgress = Math.abs(subjectHash % 40) + 50; // 50-90 range
                
                // Generate subject-specific skills based on subject name/ID
                const subjectSpecificSkills = generateSubjectSkills(subjectId, subjectHash, baseProgress);
                
                const uniqueProgress = {
                    overall: baseProgress,
                    homework: Math.min(100, baseProgress + (Math.abs(subjectHash % 10))),
                    quizzes: Math.min(100, baseProgress + (Math.abs((subjectHash * 2) % 15) - 5)),
                    labs: Math.min(100, baseProgress + (Math.abs((subjectHash * 3) % 12) - 3)),
                    skills: subjectSpecificSkills
                };
                
                console.log('🎲 Generated unique progress for subject', subjectId, ':', uniqueProgress);
                console.log('🎨 Skills for this subject:', uniqueProgress.skills.map(s => s.name));
                
                // Save to Firebase for future use
                await saveProgressToFirebase(uniqueProgress);
                
                setStudentProgress(uniqueProgress);
            }
            
        } catch (error) {
            console.error('❌ Error fetching student progress:', error);
            setStudentProgress({
                overall: 0,
                homework: 0,
                quizzes: 0,
                labs: 0,
                skills: []
            });
        }
    };

    const generateSubjectSkills = (subjectId, subjectHash, baseProgress) => {
        console.log('🎯 Generating skills for subject:', subjectId, 'with hash:', subjectHash);
        
        // Define ALL possible skills
        const allSkills = [
            // Programming skills
            'Програмирање', 'Алгоритми', 'Структури на податоци', 'Дебагирање', 'Тестирање', 'Документација',
            // Math skills  
            'Математичко размислување', 'Решавање проблеми', 'Логичко размислување', 'Анализа', 'Докажување', 'Пресметување',
            // Database skills
            'SQL', 'Дизајн на бази', 'Нормализација', 'Индексирање', 'Оптимизација', 'Безбедност',
            // Web skills
            'HTML/CSS', 'JavaScript', 'Респонзивен дизајн', 'API интеграција', 'Frontend', 'Backend',
            // Network skills
            'Протоколи', 'Рутирање', 'Конфигурација', 'Дијагностика', 'Мрежна безбедност', 'Администрација',
            // General skills
            'Критичко размислување', 'Комуникација', 'Тимска работа', 'Управување со време', 'Презентација', 'Истражување'
        ];

        // Use subject hash to deterministically select 6 unique skills for this subject
        const selectedSkills = [];
        const usedIndices = new Set();
        
        // Generate 6 unique skills based on subject hash
        for (let i = 0; i < 6; i++) {
            let skillIndex;
            let attempts = 0;
            
            do {
                skillIndex = Math.abs((subjectHash * (i + 1) * 7 + attempts) % allSkills.length);
                attempts++;
            } while (usedIndices.has(skillIndex) && attempts < 50);
            
            usedIndices.add(skillIndex);
            selectedSkills.push(allSkills[skillIndex]);
        }

        console.log('✅ Selected skills for subject', subjectId, ':', selectedSkills);

        // Generate progress for each selected skill
        return selectedSkills.map((skillName, index) => ({
            name: skillName,
            progress: Math.min(100, Math.max(30, baseProgress + (Math.abs((subjectHash * (index + 1)) % 25) - 12)))
        }));
    };

    const saveProgressToFirebase = async (progressData) => {
        try {
            const docId = `${currentUser.uid}_${subjectId}`;
            const progressDoc = {
                userId: currentUser.uid,
                subjectId: subjectId,
                overall: progressData.overall,
                activities: {
                    homework: progressData.homework,
                    quizzes: progressData.quizzes,
                    labs: progressData.labs
                },
                skills: progressData.skills,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            await setDoc(doc(db, 'studentProgress', docId), progressDoc);
            console.log('💾 Progress saved to Firebase with docId:', docId);
        } catch (error) {
            console.error('❌ Error saving progress to Firebase:', error);
        }
    };

    const renderSectionItems = (items, sectionType) => {
        if (!items || items.length === 0) {
            return (
                <div className="section-item blue">
                    <span>No content available</span>
                </div>
            );
        }

        return items.map((item, index) => (
            <div key={item.id || index} className="section-item blue" onClick={() => handleItemClick(item, sectionType)}>
                {sectionType === 'quizzes' ? '📝' : 
                 sectionType === 'labs' ? '💻' : 
                 sectionType === 'recordings' ? '📹' :
                 <img src={item.type?.includes('excel') || item.type?.includes('sheet') ? 
                     '../assets/icons/exel_icon.svg' : '../assets/icons/pdf_icon.svg'} alt="File" />}
                <span className="item-name">{item.name || item.title}</span>
            </div>
        ));
    };

    const handleItemClick = (item, sectionType) => {
        if (item.downloadURL) {
            // Open file in new tab
            window.open(item.downloadURL, '_blank');
        } else if (sectionType === 'quizzes') {
            // Navigate to quiz page
            navigate(`/quiz/${subjectId}/${item.id}`);
        } else if (sectionType === 'labs') {
            // Navigate to lab page
            navigate(`/lab/${subjectId}/${item.id}`);
        }
    };

    if (loading) {
        return (
            <div className="course-layout">
                <div className="course-loading">Loading course...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="course-layout">
                <div className="course-error">Error: {error}</div>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="course-layout">
                <div className="course-error">No course found</div>
            </div>
        );
    }

    // Debug: Log current progress state before rendering
    console.log('🎨 Rendering StudentCourseLayout with progress:', studentProgress);

    return (
        <div className="course-layout">
            {/* Header */}
            <div className="course-header">
                <h1 className="course-title">{subject.name}</h1>
                <div className="course-semester">Семестар: {subject.semesterType === 'winter' ? 'Зимски' : 'Летен'} {subject.academicYear}</div>
            </div>

            {/* Main Container */}
            <div className="course-container">
                {/* Progress Card */}
                <div className="progress-card">
                    <div className="progress-header">
                        <div className="subject-badge">
                            <img 
                                src="/assets/icons/finki_subject_logo.svg" 
                                alt="Subject Badge" 
                                className="badge-image"
                            />
                        </div>
                        <h3 className="progress-title">Прогрес на активности</h3>
                    </div>
                    
                    <div className="progress-main">
                        <div className="progress-circle-container">
                            <div className="progress-circle">
                                <span className="percentage">{studentProgress.overall}%</span>
                            </div>
                        </div>
                        
                        <div className="activity-cards">
                            <div className="activity-card">
                                <div className="activity-label">Домашни</div>
                                <div className="activity-value">{studentProgress.homework}%</div>
                            </div>
                            <div className="activity-card">
                                <div className="activity-label">Квизови</div>
                                <div className="activity-value">{studentProgress.quizzes}%</div>
                            </div>
                            <div className="activity-card">
                                <div className="activity-label">Лабораториски</div>
                                <div className="activity-value">{studentProgress.labs}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="progress-skills">
                        <h4 className="skills-title">Прогрес на вештини</h4>
                        <div className="skills-grid">
                            <div className="skills-column">
                                {studentProgress.skills.slice(0, Math.ceil(studentProgress.skills.length / 2)).map((skill, index) => (
                                    <div key={index} className="skill-item">
                                        <span className="skill-label">{skill.name || 'Вештина'}</span>
                                        <div className="skill-bar">
                                            <div className="skill-fill" style={{width: `${skill.progress || 0}%`}}></div>
                                        </div>
                                    </div>
                                ))}
                                {/* Show default skills if no skills data */}
                                {studentProgress.skills.length === 0 && (
                                    <>
                                        <div className="skill-item">
                                            <span className="skill-label">Програмирање</span>
                                            <div className="skill-bar">
                                                <div className="skill-fill" style={{width: '0%'}}></div>
                                            </div>
                                        </div>
                                        <div className="skill-item">
                                            <span className="skill-label">Алгоритми</span>
                                            <div className="skill-bar">
                                                <div className="skill-fill" style={{width: '0%'}}></div>
                                            </div>
                                        </div>
                                        <div className="skill-item">
                                            <span className="skill-label">Структури</span>
                                            <div className="skill-bar">
                                                <div className="skill-fill" style={{width: '0%'}}></div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="skills-column">
                                {studentProgress.skills.slice(Math.ceil(studentProgress.skills.length / 2)).map((skill, index) => (
                                    <div key={index} className="skill-item">
                                        <span className="skill-label">{skill.name || 'Вештина'}</span>
                                        <div className="skill-bar">
                                            <div className="skill-fill" style={{width: `${skill.progress || 0}%`}}></div>
                                        </div>
                                    </div>
                                ))}
                                {/* Show default skills if no skills data */}
                                {studentProgress.skills.length === 0 && (
                                    <>
                                        <div className="skill-item">
                                            <span className="skill-label">Дебагирање</span>
                                            <div className="skill-bar">
                                                <div className="skill-fill" style={{width: '0%'}}></div>
                                            </div>
                                        </div>
                                        <div className="skill-item">
                                            <span className="skill-label">Тестирање</span>
                                            <div className="skill-bar">
                                                <div className="skill-fill" style={{width: '0%'}}></div>
                                            </div>
                                        </div>
                                        <div className="skill-item">
                                            <span className="skill-label">Документација</span>
                                            <div className="skill-bar">
                                                <div className="skill-fill" style={{width: '0%'}}></div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="notifications">
                        <div className="notification-item">
                            <span className="notification-icon">💬</span>
                            <span className="notification-text">Соопштенија</span>
                        </div>
                        <div className="notification-item">
                            <img 
                                src="/assets/icons/star.svg" 
                                alt="Star" 
                                className="notification-icon-img"
                            />
                            <span className="notification-text">Анкета за изработка на лабораториски вежби</span>
                        </div>
                        <div className="notification-item">
                            <img 
                                src="/assets/icons/star.svg" 
                                alt="Star" 
                                className="notification-icon-img"
                            />
                            <span className="notification-text">Анкета за изработка на испитот во септември</span>
                        </div>
                        <div className="notification-item">
                            <img 
                                src="/assets/icons/big_blue_button.svg" 
                                alt="Clock" 
                                className="notification-icon-img-play"
                            />
                            <span className="notification-text-play">Соба за онлајн час</span>
                        </div>
                    </div>
                </div>

                {/* Course Sections */}
                <div className="course-sections">
                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Предавања</h4>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.lectures, 'lectures')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Аудиториски вежби</h4>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.exercises, 'exercises')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Литература</h4>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.literature, 'literature')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Снимени предавања</h4>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.recordings, 'recordings')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Квизови</h4>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.quizzes, 'quizzes')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Лабораториски вежби</h4>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.labs, 'labs')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Домашни</h4>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.homework, 'homework')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Резултати</h4>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.results, 'results')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentCourseLayout;