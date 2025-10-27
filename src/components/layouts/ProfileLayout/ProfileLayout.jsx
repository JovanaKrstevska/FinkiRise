import { useState, useEffect } from 'react';
import { getSubjectsByProfessor } from '../../../services/databaseService';
import './ProfileLayout.css';

function ProfileLayout({ userRole, profileData, userTutorials, onImageUpload, onProfileUpdate, currentUser }) {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Grade assignments', completed: true },
        { id: 2, text: 'Paper review', completed: true },
        { id: 3, text: 'Prepare lecture', completed: false },
        { id: 4, text: 'Administrative tasks', completed: false }
    ]);

    const [currentTutorialSlide, setCurrentTutorialSlide] = useState(0);
    const tutorialsPerSlide = 3;

    const [recentSubjects, setRecentSubjects] = useState([]);
    const [currentSubjectSlide, setCurrentSubjectSlide] = useState(0);
    const subjectsPerSlide = 4;

    const handleTaskToggle = (taskId) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const triggerImageUpload = () => {
        document.getElementById('profile-layout-image-input').click();
    };

    const handleSave = () => {
        // Just trigger save with current profile data
        onProfileUpdate(profileData);
    };

    const nextTutorialSlide = () => {
        const totalTutorials = userTutorials.length > 0 ? userTutorials.length : 6;
        const maxSlide = Math.ceil(totalTutorials / tutorialsPerSlide) - 1;
        setCurrentTutorialSlide(prev => prev < maxSlide ? prev + 1 : 0);
    };

    const prevTutorialSlide = () => {
        const totalTutorials = userTutorials.length > 0 ? userTutorials.length : 6;
        const maxSlide = Math.ceil(totalTutorials / tutorialsPerSlide) - 1;
        setCurrentTutorialSlide(prev => prev > 0 ? prev - 1 : maxSlide);
    };

    // Subject navigation functions
    const nextSubjectSlide = () => {
        const maxSlide = Math.ceil(recentSubjects.length / subjectsPerSlide) - 1;
        setCurrentSubjectSlide(prev => prev < maxSlide ? prev + 1 : 0);
    };

    const prevSubjectSlide = () => {
        const maxSlide = Math.ceil(recentSubjects.length / subjectsPerSlide) - 1;
        setCurrentSubjectSlide(prev => prev > 0 ? prev - 1 : maxSlide);
    };

    // Function to get most recent subjects (latest academic year for each subject)
    const getMostRecentSubjects = (subjects) => {
        if (!subjects || subjects.length === 0) {
            return [];
        }

        const subjectMap = new Map();

        subjects.forEach(subject => {
            const key = subject.name;

            if (!subjectMap.has(key)) {
                subjectMap.set(key, subject);
            } else {
                const existing = subjectMap.get(key);

                if (subject.academicYear && existing.academicYear &&
                    subject.academicYear > existing.academicYear) {
                    subjectMap.set(key, subject);
                }
            }
        });

        return Array.from(subjectMap.values()).sort((a, b) =>
            (b.academicYear || '').localeCompare(a.academicYear || '')
        );
    };

    // Fetch subjects for professor
    useEffect(() => {
        if (currentUser?.uid) {
            const fetchSubjects = async () => {
                try {
                    console.log('🔍 Fetching subjects for user:', currentUser.uid, 'Role:', userRole);
                    
                    // Try to get subjects by professor first
                    const result = await getSubjectsByProfessor(currentUser.uid);
                    console.log('📊 Firebase result:', result);
                    
                    if (result.success && result.data && result.data.length > 0) {
                        console.log('📚 Found subjects:', result.data);
                        const mostRecent = getMostRecentSubjects(result.data);
                        console.log('🎯 Most recent subjects:', mostRecent);
                        setRecentSubjects(mostRecent);
                    } else {
                        console.log('⚠️ No subjects found for this user');
                        // If no subjects found, try to get all subjects (for students)
                        const { getAllSubjects } = await import('../../../services/databaseService');
                        const allResult = await getAllSubjects();
                        console.log('📊 All subjects result:', allResult);
                        
                        if (allResult.success && allResult.data && allResult.data.length > 0) {
                            const mostRecent = getMostRecentSubjects(allResult.data);
                            console.log('🎯 All subjects - most recent:', mostRecent);
                            setRecentSubjects(mostRecent);
                        }
                    }
                } catch (error) {
                    console.error('❌ Error fetching subjects:', error);
                }
            };

            fetchSubjects();
        }
    }, [currentUser, userRole]);

    if (userRole === 'professor') {
        return (
            <div className="profile-layout">
                <div className="professor-layout-container">
                    {/* Left Column - Calendar and Schedule */}
                    <div className="professor-left-column">
                        {/* Personal Calendar */}
                        <div className="professor-calendar-widget">
                            <div className="professor-widget-header">
                                <h3>Personal Calendar</h3>
                                <button className="professor-add-btn">+</button>
                            </div>
                            <div className="professor-calendar-grid">
                                <div className="professor-calendar-header">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
                                    <span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span>
                                </div>
                                <div className="professor-calendar-days">
                                    {[30, 31, 1, 2, 3, 4, 5, 6, 6, 7, 8, 9, 10, 11, 12, 13, 13, 14, 15, 16, 17, 18, 19, 20, 20, 21, 22, 23, 25, 26, 27, 27, 28, 29, 31, 1, 2, 3].map((day, index) => (
                                        <div key={index} className={`professor-calendar-day ${index === 16 ? 'office-hours' : ''} ${index === 29 ? 'grades-due' : ''}`}>
                                            {index === 16 && <div className="professor-event-label">Office Hours</div>}
                                            {index === 29 && <div className="professor-event-label">Grades due</div>}
                                            {day}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Class Schedule */}
                        <div className="professor-schedule-widget">
                            <h3>Class Schedule</h3>
                            <div className="professor-schedule-table">
                                <div className="professor-schedule-header">
                                    <span>Course</span>
                                    <span>Time</span>
                                    <span>Location</span>
                                </div>
                                <div className="professor-schedule-row">
                                    <span>Intro to Psychology</span>
                                    <span>Mon, Wed 9:00 AM</span>
                                    <span>Room 101</span>
                                </div>
                                <div className="professor-schedule-row">
                                    <span>Research Methods</span>
                                    <span>Tue, Thu 11:00 AM</span>
                                    <span>Room 202</span>
                                </div>
                                <div className="professor-schedule-row">
                                    <span>Advanced Statistics</span>
                                    <span>Mon, Wed 3:00 PM</span>
                                    <span>Room 303</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Profile and Tasks */}
                    <div className="professor-right-column">
                        {/* Professor Profile Info */}
                        <div className="professor-profile-widget">
                            <div className="professor-avatar-container">
                                <div className="professor-avatar-circle" onClick={triggerImageUpload}>
                                    {profileData?.profileImage ? (
                                        <img src={profileData.profileImage} alt="Profile" className="professor-avatar-img" />
                                    ) : (
                                        <div className="professor-avatar-placeholder">
                                            <span>👤</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    id="profile-layout-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={onImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {/* Display professor information */}
                            <h3 className="professor-name">{profileData?.firstName && profileData?.lastName ? `${profileData.firstName} ${profileData.lastName}` : 'Име Презиме'}</h3>
                            <div className="professor-details">
                                <p><strong>Email:</strong> {profileData?.email || 'profesor@finki.ukim.mk'}</p>
                            </div>

                            <div className="professor-save-controls">
                                <button onClick={handleSave} className="save-btn">💾 Save</button>
                            </div>
                        </div>

                        {/* Task Manager */}
                        <div className="professor-task-widget">
                            <div className="professor-widget-header">
                                <h3>Task Manager</h3>
                                <button className="professor-add-btn">+</button>
                            </div>
                            <div className="professor-task-list">
                                {tasks.map((task) => (
                                    <div key={task.id} className={`professor-task-item ${task.completed ? 'completed' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => handleTaskToggle(task.id)}
                                        />
                                        <span>{task.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Student Layout
    return (
        <div className="profile-layout">
            <div className="student-layout-container">
                {/* Top Section - 2 Column Layout */}
                <div className="student-top-section">
                    {/* Left - Profile Card */}
                    <div className="student-info-card">
                        <div className="student-avatar-container">
                            <div className="student-avatar-circle" onClick={triggerImageUpload}>
                                {profileData?.profileImage ? (
                                    <img src={profileData.profileImage} alt="Profile" className="student-avatar-img" />
                                ) : (
                                    <div className="student-avatar-placeholder">
                                        <span>👤</span>
                                    </div>
                                )}
                            </div>
                            <input
                                id="profile-layout-image-input"
                                type="file"
                                accept="image/*"
                                onChange={onImageUpload}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Display current user information */}
                        <h2 className="student-user-name">{profileData?.firstName && profileData?.lastName ? `${profileData.firstName} ${profileData.lastName}` : 'Име Презиме'}</h2>
                        <div className="student-user-details">
                            <p><span className="student-label">Индекс:</span> <span className="student-value">{profileData?.index || '173246'}</span></p>
                            <p><span className="student-label">Просек:</span> <span className="student-value">{profileData?.average || '7.21'}</span></p>
                            <p><span className="student-label">Кредити:</span> <span className="student-value">{profileData?.credits || '240'} ЕКТС</span></p>
                            <p><span className="student-label">Смер:</span> <span className="student-value">{profileData?.studyDirection || 'Примена на е-технологии'}</span></p>
                        </div>

                        <div className="student-save-controls">
                            <button onClick={handleSave} className="save-btn">💾 Save</button>
                        </div>

                        <div className="student-cv-section">
                            <div className="student-cv-preview">
                                <div className="student-cv-icon">📄</div>
                            </div>
                            <div className="student-cv-info">
                                <h3>Вашето CV:</h3>
                                {profileData?.cvUrl ? (
                                    <>
                                        <p className="student-cv-filename">
                                            {profileData.cvFileName || `${profileData?.index || '173246'}_CV.pdf`}
                                        </p>
                                        <a
                                            href={profileData.cvUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="student-cv-download"
                                        >
                                            📥 Преземи CV
                                        </a>
                                    </>
                                ) : (
                                    <p className="student-cv-no-file">Нема прикачено CV</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right - Tutorials and Progress */}
                    <div className="student-right-section">
                        {/* Progress Circle */}
                        <h3 className="student-progress-title">Финален прогрес:</h3>
                        <div className="student-progress-container">
                            <div className="student-progress-circle" style={{
                                background: `conic-gradient(#3484bd 0deg ${(profileData?.progress || 50) * 3.6}deg, #6ed0f6  ${(profileData?.progress || 50) * 3.6}deg 360deg)`
                            }}>
                                <span className="student-progress-text">{profileData?.progress || 50}%</span>
                            </div>
                        </div>

                        {/* Tutorials */}
                        <div className="student-tutorials-card">
                            <div className="tutorials-header">
                                <h3 className="student-tutorials-title">Твои Туторијали:</h3>
                                <div className="tutorials-navigation">
                                    <button onClick={prevTutorialSlide} className="tutorial-nav-btn tutorial-prev">
                                        ◀
                                    </button>
                                    <button onClick={nextTutorialSlide} className="tutorial-nav-btn tutorial-next">
                                        ▶
                                    </button>
                                </div>
                            </div>
                            <div className="tutorials-slider">
                                <ul className="student-tutorials-list" style={{
                                    transform: `translateY(-${currentTutorialSlide * (tutorialsPerSlide * 60)}px)`
                                }}>
                                    {userTutorials.length > 0 ? (
                                        userTutorials.map((tutorial) => (
                                            <li key={tutorial.id} className="student-tutorial-item">
                                                {tutorial.title}
                                            </li>
                                        ))
                                    ) : (
                                        Array.from({ length: 6 }, (_, index) => (
                                            <li key={index} className="student-tutorial-item">
                                                Име на Туторијалот
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Recent Subjects */}
                <div className="student-subjects-section">
                    <div className="student-subjects-navigation">
                        <button onClick={prevSubjectSlide} className="student-nav-arrow student-nav-left">◀</button>
                        <div className="student-subjects-grid">
                            {recentSubjects.length > 0 ? (
                                recentSubjects
                                    .slice(currentSubjectSlide * subjectsPerSlide, (currentSubjectSlide + 1) * subjectsPerSlide)
                                    .map((subject) => (
                                        <div key={subject.id} className="student-subject-card">
                                            <div className="student-subject-icon">📚</div>
                                            <p className="student-subject-name">{subject.name}</p>
                                            <p className="student-subject-year">{subject.academicYear}</p>
                                        </div>
                                    ))
                            ) : (
                                Array.from({ length: 4 }, (_, index) => (
                                    <div key={index} className="student-subject-card">
                                        <div className="student-subject-icon">📚</div>
                                        <p className="student-subject-name">Нема предмети</p>
                                        <p className="student-subject-year">2023/2024</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={nextSubjectSlide} className="student-nav-arrow student-nav-right">▶</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileLayout;