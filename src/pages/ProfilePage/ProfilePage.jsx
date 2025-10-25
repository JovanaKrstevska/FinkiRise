import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTutorialsByUser, getUserProfile } from '../../services/databaseService';
import NavBar from '../../components/ui/NavBar/NavBar';
import './ProfilePage.css';

function ProfilePage() {
    const { currentUser } = useAuth();
    const [userRole, setUserRole] = useState('student'); // 'student' or 'professor'
    const [studentData, setStudentData] = useState({
        name: 'Јована Крстевска',
        index: '173240',
        credits: '140/240',
        semester: 'Пролетен 6-ти семестар',
        progress: 50
    });

    const [professorData, setProfessorData] = useState({
        name: 'Проф. Марко Петровски',
        department: 'Компјутерски науки',
        email: 'marko.petrovski@finki.ukim.mk'
    });

    const [userTutorials, setUserTutorials] = useState([]);



    // Determine user role and fetch user tutorials
    useEffect(() => {
        if (currentUser) {
            determineUserRole();
            fetchUserTutorials();
        }
    }, [currentUser]);

    const determineUserRole = async () => {
        try {
            // First, try to get user profile from database
            const userProfile = await getUserProfile(currentUser.uid);

            if (userProfile.success && userProfile.data?.role) {
                // If role is stored in database, use it
                setUserRole(userProfile.data.role);
            } else {
                // Fallback: determine role based on email patterns
                const email = currentUser.email?.toLowerCase() || '';

                if (email.includes('prof') ||
                    email.includes('teacher') ||
                    email.includes('instructor') ||
                    email.includes('faculty') ||
                    email.includes('@finki.ukim.mk')) {
                    setUserRole('professor');
                } else {
                    setUserRole('student');
                }
            }
        } catch (error) {
            console.error('Error determining user role:', error);
            // Default to student if there's an error
            setUserRole('student');
        }
    };

    const fetchUserTutorials = async () => {
        try {
            const result = await getTutorialsByUser(currentUser.uid);
            if (result.success) {
                setUserTutorials(result.data);
            } else {
                console.error('Error fetching user tutorials:', result.error);
            }
        } catch (error) {
            console.error('Error fetching user tutorials:', error);
        }
    };

    const renderStudentProfile = () => (
        <div className="profile-content">
            {/* Left Section - Profile Info */}
            <div className="profile-left">
                <div className="profile-card">
                    <div className="profile-avatar">
                        <div className="avatar-placeholder">
                            <span>👤</span>
                        </div>
                    </div>
                    <h2 className="student-name">{studentData.name}</h2>
                    <div className="student-info">
                        <p><strong>Индекс:</strong> {studentData.index}</p>
                        <p><strong>Кредити:</strong> {studentData.credits}</p>
                        <p><strong>Семестар:</strong> {studentData.semester}</p>
                    </div>

                    <div className="cv-section">
                        <h3>Вашето CV</h3>
                        <button className="cv-btn">
                            📄 {studentData.index}_CV.pdf
                        </button>
                    </div>
                </div>
            </div>

            {/* Center Section - Progress */}
            <div className="profile-center">
                <div className="progress-section">
                    <h3>Финален прогрес:</h3>
                    <div className="progress-circle">
                        <div className="circle-progress" style={{
                            background: `conic-gradient(#A8D5E2 0deg ${studentData.progress * 3.6}deg, #e9ecef ${studentData.progress * 3.6}deg 360deg)`
                        }}>
                            <span className="progress-text">{studentData.progress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Tutorials */}
            <div className="profile-right">
                <div className="tutorials-section">
                    <h3>Твои Туторијали:</h3>
                    <div className="tutorials-list">
                        {userTutorials.length > 0 ? (
                            userTutorials.map((tutorial) => (
                                <div key={tutorial.id} className="tutorial-item">
                                    <span className="tutorial-title">{tutorial.title}</span>
                                </div>
                            ))
                        ) : (
                            <div className="tutorial-item">
                                <span className="tutorial-title">Нема креирани туторијали</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProfessorProfile = () => (
        <div className="professor-profile-content">
            {/* Left Column */}
            <div className="professor-left-column">
                {/* Personal Calendar */}
                <div className="calendar-widget-profile">
                    <div className="widget-header-profile">
                        <h3>Personal Calendar</h3>
                        <button className="add-btn">+</button>
                    </div>
                    <div className="calendar-grid-profile">
                        <div className="calendar-header-profile">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
                            <span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span>
                        </div>
                        <div className="calendar-days-profile">
                            {[30, 31, 1, 2, 3, 4, 5, 6, 6, 7, 8, 9, 10, 11, 12, 13, 13, 14, 15, 16, 17, 18, 19, 20, 20, 21, 22, 23, 25, 26, 27, 27, 28, 29, 31, 1, 2, 3].map((day, index) => (
                                <div key={index} className={`calendar-day-profile ${index === 16 ? 'office-hours' : ''} ${index === 29 ? 'grades-due' : ''}`}>
                                    {index === 16 && <div className="event-label">Office Hours</div>}
                                    {index === 29 && <div className="event-label">Grades due</div>}
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Class Schedule */}
                <div className="schedule-widget">
                    <h3>Class Schedule</h3>
                    <div className="schedule-table">
                        <div className="schedule-header">
                            <span>Course</span>
                            <span>Time</span>
                            <span>Location</span>
                        </div>
                        <div className="schedule-row">
                            <span>Intro to Psychology</span>
                            <span>Mon, Wed 9:00 AM</span>
                            <span>Room 101</span>
                        </div>
                        <div className="schedule-row">
                            <span>Research Methods</span>
                            <span>Tue, Thu 11:00 AM</span>
                            <span>Room 202</span>
                        </div>
                        <div className="schedule-row">
                            <span>Advanced Statistics</span>
                            <span>Mon, Wed 3:00 PM</span>
                            <span>Room 303</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="professor-right-column">
                {/* Professor Info */}
                <div className="professor-info-widget">
                    <div className="professor-avatar">
                        <div className="avatar-circle">
                            <span>👤</span>
                        </div>
                    </div>
                    <h3 className="professor-name">Име на Професор</h3>
                    <div className="professor-details">
                        <p><strong>Линк до консултации:</strong></p>
                        <p>Консултации</p>
                    </div>
                </div>

                {/* Task Manager */}
                <div className="task-manager-widget">
                    <div className="widget-header">
                        <h3>Task Manager</h3>
                        <button className="add-btn">+</button>
                    </div>
                    <div className="task-list">
                        <div className="task-item completed">
                            <input type="checkbox" checked readOnly />
                            <span>Grade assignments</span>
                        </div>
                        <div className="task-item completed">
                            <input type="checkbox" checked readOnly />
                            <span>Paper review</span>
                        </div>
                        <div className="task-item">
                            <input type="checkbox" />
                            <span>Prepare lecture</span>
                        </div>
                        <div className="task-item">
                            <input type="checkbox" />
                            <span>Administrative tasks</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="profile-page">
            <NavBar />
            <div className="profile-container">
                {userRole === 'student' ? renderStudentProfile() : renderProfessorProfile()}
            </div>
        </div>
    );
}

export default ProfilePage;