import { useState, useEffect } from 'react';
import { getSubjectsByProfessor } from '../../../services/databaseService';
import TutorialsList from '../../widgets/TutorialsList/TutorialsList';
import CalendarEventModal from '../../CalendarEventModal/CalendarEventModal';
import ClassScheduleModal from '../../ClassScheduleModal/ClassScheduleModal';
import TaskModal from '../../TaskModal/TaskModal';
import EventDetailModal from '../../EventDetailModal/EventDetailModal';
import './ProfileLayout.css';

function ProfileLayout({ userRole, profileData, onImageUpload, onProfileUpdate, currentUser }) {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Прегледување на домашните', completed: true },
        { id: 2, text: 'Консултации', completed: true },
        { id: 3, text: 'Спремање за ново предавање', completed: false },
        { id: 4, text: 'Административни таскови', completed: false }
    ]);

    const [calendarEvents, setCalendarEvents] = useState([]);
    const [classSchedules, setClassSchedules] = useState([
        { id: 1, course: 'Веб програмирање предавања', days: 'Mon, Wed', time: '9:00 AM', location: 'Просторија 117' },
        { id: 2, course: 'Објектно-ориентирано програмирање', days: 'Tue, Thu', time: '11:00 AM', location: 'Барака 2.2' },
        { id: 3, course: 'ЕМТ Аудиториски', days: 'Mon, Wed', time: '3:00 PM', location: 'Просторија 225' }
    ]);

    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [recentSubjects, setRecentSubjects] = useState([]);
    const [currentSubjectSlide, setCurrentSubjectSlide] = useState(0);
    const subjectsPerSlide = 4;

    const handleTaskToggle = (taskId) => {
        // Delete task when checkbox is clicked
        handleDeleteTask(taskId);
    };

    const handleAddCalendarEvent = (eventData) => {
        const newEvent = {
            id: Date.now(),
            ...eventData
        };
        setCalendarEvents([...calendarEvents, newEvent]);
    };

    const handleAddSchedule = (scheduleData) => {
        const newSchedule = {
            id: Date.now(),
            ...scheduleData
        };
        setClassSchedules([...classSchedules, newSchedule]);
    };

    const handleAddTask = (taskData) => {
        const newTask = {
            id: Date.now(),
            text: taskData.text,
            completed: false
        };
        setTasks([...tasks, newTask]);
    };

    const handleDeleteEvent = (eventId) => {
        setCalendarEvents(calendarEvents.filter(event => event.id !== eventId));
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsEventDetailModalOpen(true);
    };

    const handleDeleteSchedule = (scheduleId) => {
        setClassSchedules(classSchedules.filter(schedule => schedule.id !== scheduleId));
    };

    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    // Badge function based on grade
    const getBadge = (grade) => {
        if (!grade) return null;
        const numGrade = parseFloat(grade);
        if (numGrade >= 10) return { emoji: '🥇', name: 'Gold', color: '#FFD700' };
        if (numGrade >= 8) return { emoji: '🥈', name: 'Silver', color: '#C0C0C0' };
        if (numGrade >= 6) return { emoji: '🥉', name: 'Bronze', color: '#CD7F32' };
        return null;
    };

    // Calendar functions
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        return { daysInMonth, startingDayOfWeek: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 };
    };

    const getEventsForDate = (date) => {
        return calendarEvents.filter(event => event.date === date);
    };

    const formatCalendarDate = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const triggerImageUpload = () => {
        document.getElementById('profile-layout-image-input').click();
    };

    const handleSave = () => {
        // Just trigger save with current profile data
        onProfileUpdate(profileData);
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
                                <h3>Personal Calendar - {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                                <button className="professor-add-btn" onClick={() => setIsCalendarModalOpen(true)}>+</button>
                            </div>
                            <div className="professor-calendar-grid">
                                <div className="professor-calendar-header">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
                                    <span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                                <div className="professor-calendar-days">
                                    {(() => {
                                        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                                        const year = currentMonth.getFullYear();
                                        const month = currentMonth.getMonth();
                                        const today = new Date();
                                        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
                                        const todayDate = today.getDate();
                                        
                                        const days = [];
                                        
                                        // Empty cells before month starts
                                        for (let i = 0; i < startingDayOfWeek; i++) {
                                            days.push(<div key={`empty-${i}`} className="professor-calendar-day empty"></div>);
                                        }
                                        
                                        // Days of the month
                                        for (let day = 1; day <= daysInMonth; day++) {
                                            const dateStr = formatCalendarDate(year, month, day);
                                            const dayEvents = getEventsForDate(dateStr);
                                            const isToday = isCurrentMonth && day === todayDate;
                                            
                                            days.push(
                                                <div 
                                                    key={day} 
                                                    className={`professor-calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                                                >
                                                    <span className="day-number">{day}</span>
                                                    {dayEvents.map(event => (
                                                        <div 
                                                            key={event.id} 
                                                            className="professor-event-label" 
                                                            title={`${event.title} at ${event.time}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEventClick(event);
                                                            }}
                                                        >
                                                            <span className="event-title">{event.title}</span>
                                                            <button 
                                                                className="delete-event-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteEvent(event.id);
                                                                }}
                                                            >×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        
                                        return days;
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Class Schedule */}
                        <div className="professor-schedule-widget">
                            <div className="professor-widget-header">
                                <h3>Class Schedule</h3>
                                <button className="professor-add-btn" onClick={() => setIsScheduleModalOpen(true)}>+</button>
                            </div>
                            <div className="professor-schedule-table">
                                <div className="professor-schedule-header">
                                    <span>Course</span>
                                    <span>Time</span>
                                    <span>Location</span>
                                </div>
                                {classSchedules.map((schedule) => (
                                    <div key={schedule.id} className="professor-schedule-row">
                                        <span>{schedule.course}</span>
                                        <span>{schedule.days} {schedule.time}</span>
                                        <span>{schedule.location}</span>
                                        <button 
                                            className="delete-schedule-btn"
                                            onClick={() => handleDeleteSchedule(schedule.id)}
                                        >×</button>
                                    </div>
                                ))}
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
                            <h3 className="professor-name">
                                {profileData?.firstName && profileData?.lastName 
                                    ? `${profileData.firstName} ${profileData.lastName}` 
                                    : currentUser?.displayName 
                                        ? currentUser.displayName 
                                        : currentUser?.email?.split('@')[0] || 'Име Презиме'
                                }
                            </h3>
                            <div className="professor-details">
                                <h3>Линк до Консултации</h3>
                                <a href="https://bbb-24.finki.ukim.mk/html5client/join?sessionToken=ji2tvuuidtrmrh4e" style={{ color: "#015E86", textDecoration: "none" }}>Консултации</a>
                            </div>

                            <div className="professor-save-controls">
                                <button onClick={handleSave} className="save-btn">💾 Зачувај</button>
                            </div>
                        </div>

                        {/* Task Manager */}
                        <div className="professor-task-widget">
                            <div className="professor-widget-header">
                                <h3>Task Manager</h3>
                                <button className="professor-add-btn" onClick={() => setIsTaskModalOpen(true)}>+</button>
                            </div>
                            <div className="professor-task-list">
                                {tasks.map((task) => (
                                    <div key={task.id} className={`professor-task-item ${task.completed ? 'completed' : ''}`}>
                                        <input
                                            type="checkbox"
                                            className='professor-task-list-check'
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

                {/* Modals */}
                <CalendarEventModal 
                    isOpen={isCalendarModalOpen}
                    onClose={() => setIsCalendarModalOpen(false)}
                    onSave={handleAddCalendarEvent}
                />
                <ClassScheduleModal 
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    onSave={handleAddSchedule}
                />
                <TaskModal 
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={handleAddTask}
                />
                <EventDetailModal 
                    isOpen={isEventDetailModalOpen}
                    onClose={() => setIsEventDetailModalOpen(false)}
                    event={selectedEvent}
                    onDelete={handleDeleteEvent}
                />
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
                            <button onClick={handleSave} className="save-btn">💾 Зачувај</button>
                        </div>

                        <div className="student-cv-section">
                            <div className="student-cv-preview">
                                <div className="student-cv-icon">
                                    <img src="/assets/icons/graduation_logo.svg" alt="CV" className="cv-icon-image" />
                                </div>
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
                        <TutorialsList />
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
                                    .map((subject, index) => {
                                        // For demo: assign random grades if not present
                                        const grade = subject.finalGrade || [10, 9, 8, 7, 6][index % 5];
                                        const badge = getBadge(grade);
                                        return (
                                            <div key={subject.id} className="student-subject-card">
                                                {badge && (
                                                    <div className="subject-badge" title={`${badge.name} Badge - Grade: ${grade}`}>
                                                        {badge.emoji}
                                                    </div>
                                                )}
                                                <p className="student-subject-name">{subject.name}</p>
                                                <p className="student-subject-year">{subject.academicYear}</p>
                                                <p className="student-subject-grade">Оценка: {grade}</p>
                                            </div>
                                        );
                                    })
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