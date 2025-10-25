import { useState } from 'react';
import './ProfileLayout.css';

function ProfileLayout({ userRole, studentData, professorData, userTutorials, profileImage, onImageUpload }) {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Grade assignments', completed: true },
        { id: 2, text: 'Paper review', completed: true },
        { id: 3, text: 'Prepare lecture', completed: false },
        { id: 4, text: 'Administrative tasks', completed: false }
    ]);

    const handleTaskToggle = (taskId) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const triggerImageUpload = () => {
        document.getElementById('profile-layout-image-input').click();
    };

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
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="professor-avatar-img" />
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
                            <h3 className="professor-name">Име на Професор</h3>
                            <div className="professor-details">
                                <p><strong>Линк до консултации:</strong></p>
                                <p>Консултации</p>
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

    // Student Layout (same as before but with unique classes)
    return (
        <div className="profile-layout">
            <div className="student-layout-container">
                {/* Top Section - 3 Column Layout */}
                <div className="student-top-section">
                    {/* Left - Profile Card */}
                    <div className="student-info-card">
                        <div className="student-avatar-container">
                            <div className="student-avatar-circle" onClick={triggerImageUpload}>
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="student-avatar-img" />
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

                        <h2 className="student-user-name">{studentData.name}</h2>

                        <div className="student-user-details">
                            <p><span className="student-label">Индекс:</span> <span className="student-value">{studentData.index}</span></p>
                            <p><span className="student-label">Просек:</span> <span className="student-value">{studentData.prosek}</span></p>
                            <p><span className="student-label">Кредити:</span> <span className="student-value">{studentData.credits} ЕКТС</span></p>
                            <p><span className="student-label">Смер:</span> <span className="student-value">{studentData.smer}</span></p>
                        </div>

                        <div className="student-cv-section">
                            <div className="student-cv-preview">
                                <div className="student-cv-icon">Бед</div>
                            </div>
                            <div className="student-cv-info">
                                <h3>Вашето CV:</h3>
                                <p className="student-cv-filename">{studentData.index}_CV.pdf</p>
                            </div>
                        </div>
                    </div>

                    {/* Center - Progress Circle */}
                    <div className="student-progress-card">
                        <h3 className="student-progress-title">Финален прогрес:</h3>
                        <div className="student-progress-container">
                            <div className="student-progress-circle" style={{
                                background: `conic-gradient(#A8D5E2 0deg ${studentData.progress * 3.6}deg, #e9ecef ${studentData.progress * 3.6}deg 360deg)`
                            }}>
                                <span className="student-progress-text">{studentData.progress}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Right - Tutorials */}
                    <div className="student-tutorials-card">
                        <h3 className="student-tutorials-title">Твои Туторијали:</h3>
                        <div className="student-tutorials-list">
                            {userTutorials.length > 0 ? (
                                userTutorials.map((tutorial) => (
                                    <div key={tutorial.id} className="student-tutorial-item">
                                        <span className="student-tutorial-name">{tutorial.title}</span>
                                    </div>
                                ))
                            ) : (
                                Array.from({ length: 6 }, (_, index) => (
                                    <div key={index} className="student-tutorial-item">
                                        <span className="student-tutorial-name">Име на Туторијалот</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Subjects */}
                <div className="student-subjects-section">
                    <div className="student-subjects-navigation">
                        <button className="student-nav-arrow student-nav-left">◀</button>
                        <div className="student-subjects-grid">
                            {Array.from({ length: 4 }, (_, index) => (
                                <div key={index} className="student-subject-card">
                                    <div className="student-subject-icon">Бед</div>
                                    <p className="student-subject-name">Име на предмет</p>
                                </div>
                            ))}
                        </div>
                        <button className="student-nav-arrow student-nav-right">▶</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileLayout;