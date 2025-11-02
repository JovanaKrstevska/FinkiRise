import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import './CourseLayout.css';

function CourseLayout({ subjectId }) {
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        if (subjectId) {
            fetchSubject();
        }
    }, [subjectId]);

    const fetchSubject = async () => {
        try {
            setLoading(true);
            console.log('CourseLayout: Fetching subject with ID:', subjectId);
            
            const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
            if (subjectDoc.exists()) {
                const subjectData = { id: subjectDoc.id, ...subjectDoc.data() };
                console.log('CourseLayout: Found subject:', subjectData);
                setSubject(subjectData);
            } else {
                setError('Subject not found');
            }
        } catch (err) {
            setError('Error fetching subject');
            console.error('CourseLayout Error:', err);
        } finally {
            setLoading(false);
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
                        <button className="back-btn">Беј</button>
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
                            <span className="notification-icon">⭐</span>
                            <span className="notification-text">Анкета за изработка на лабораториски вежби</span>
                        </div>
                        <div className="notification-item">
                            <span className="notification-icon">⭐</span>
                            <span className="notification-text">Анкета за изработка на испитот во септември</span>
                        </div>
                        <div className="notification-item">
                            <span className="notification-icon">🕐</span>
                            <span className="notification-text">Соба за онлајн час</span>
                        </div>
                    </div>
                </div>

                {/* Course Sections */}
                <div className="course-sections">
                    <div className="section-card">
                        <h4 className="section-title">Предавања</h4>
                        <div className="section-list">
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h4 className="section-title">Аудиториски вежби</h4>
                        <div className="section-list">
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item green">📄</div>
                            <div className="section-item green">📄</div>
                            <div className="section-item green">📄</div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h4 className="section-title">Литература</h4>
                        <div className="section-list">
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item green">📄</div>
                            <div className="section-item green">📄</div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h4 className="section-title">Снимени предавања</h4>
                        <div className="section-list">
                            <div className="section-item blue">📹</div>
                            <div className="section-item blue">📹</div>
                            <div className="section-item blue">📹</div>
                            <div className="section-item blue">📹</div>
                            <div className="section-item blue">📹</div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h4 className="section-title">Квизови</h4>
                        <div className="section-list">
                            <div className="section-item gray">🏆</div>
                            <div className="section-item gray">🏆</div>
                            <div className="section-item gray">🏆</div>
                            <div className="section-item gray">🏆</div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h4 className="section-title">Лабораториски вежби</h4>
                        <div className="section-list">
                            <div className="section-item blue">🧪</div>
                            <div className="section-item blue">🧪</div>
                            <div className="section-item blue">🧪</div>
                            <div className="section-item blue">🧪</div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h4 className="section-title">Домашни</h4>
                        <div className="section-list">
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                            <div className="section-item red">📄</div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h4 className="section-title">Резултати</h4>
                        <div className="section-list">
                            <div className="section-item red">📊</div>
                            <div className="section-item red">📊</div>
                            <div className="section-item red">📊</div>
                            <div className="section-item red">📊</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseLayout;
