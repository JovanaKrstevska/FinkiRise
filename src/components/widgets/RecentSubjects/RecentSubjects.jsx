import { useSubjectHistory } from '../../../contexts/SubjectHistoryContext';
import './RecentSubjects.css';

function RecentSubjects() {
    const { recentSubjects, clearHistory } = useSubjectHistory();

    const formatAccessTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Сега';
        if (diffInMinutes < 60) return `Пред ${diffInMinutes} мин`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Пред ${diffInHours} час${diffInHours > 1 ? 'а' : ''}`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `Пред ${diffInDays} ден${diffInDays > 1 ? 'а' : ''}`;
    };

    return (
        <div className="recent-subjects-widget">
            <div className="recent-subjects-header">
                <h3>Последно посетени предмети</h3>
                {recentSubjects.length > 0 && (
                    <button onClick={clearHistory} className="clear-history-btn">
                        Избриши
                    </button>
                )}
            </div>
            
            <div className="recent-subjects-list">
                {recentSubjects.length > 0 ? (
                    recentSubjects.slice(0, 3).map((subject) => (
                        <div key={subject.id} className="recent-subject-item">
                            <div className="subject-info">
                                <h4 className="subject-name">{subject.name}</h4>
                                <p className="subject-details">
                                    {subject.code} • {subject.academicYear}
                                </p>
                            </div>
                            <div className="access-time">
                                {formatAccessTime(subject.accessedAt)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-recent-subjects">
                        <p>Нема последно посетени предмети</p>
                        <small>Кликнете на предмет за да се појави овде</small>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecentSubjects;