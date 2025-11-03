import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
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
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (subjectId) {
            fetchSubject();
            fetchCourseContent();
        }
    }, [subjectId]);

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
                                <span className="percentage">50%</span>
                            </div>
                        </div>
                        
                        <div className="activity-cards">
                            <div className="activity-card">
                                <div className="activity-label">Домашни</div>
                                <div className="activity-value">50%</div>
                            </div>
                            <div className="activity-card">
                                <div className="activity-label">Квизови</div>
                                <div className="activity-value">50%</div>
                            </div>
                            <div className="activity-card">
                                <div className="activity-label">Лабораториски</div>
                                <div className="activity-value">50%</div>
                            </div>
                        </div>
                    </div>

                    <div className="progress-skills">
                        <h4 className="skills-title">Прогрес на вештини</h4>
                        <div className="skills-grid">
                            <div className="skills-column">
                                <div className="skill-item">
                                    <span className="skill-label">Вештина</span>
                                    <div className="skill-bar">
                                        <div className="skill-fill" style={{width: '80%'}}></div>
                                    </div>
                                </div>
                                <div className="skill-item">
                                    <span className="skill-label">Вештина</span>
                                    <div className="skill-bar">
                                        <div className="skill-fill" style={{width: '65%'}}></div>
                                    </div>
                                </div>
                                <div className="skill-item">
                                    <span className="skill-label">Вештина</span>
                                    <div className="skill-bar">
                                        <div className="skill-fill" style={{width: '75%'}}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="skills-column">
                                <div className="skill-item">
                                    <span className="skill-label">Вештина</span>
                                    <div className="skill-bar">
                                        <div className="skill-fill" style={{width: '90%'}}></div>
                                    </div>
                                </div>
                                <div className="skill-item">
                                    <span className="skill-label">Вештина</span>
                                    <div className="skill-bar">
                                        <div className="skill-fill" style={{width: '55%'}}></div>
                                    </div>
                                </div>
                                <div className="skill-item">
                                    <span className="skill-label">Вештина</span>
                                    <div className="skill-bar">
                                        <div className="skill-fill" style={{width: '85%'}}></div>
                                    </div>
                                </div>
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