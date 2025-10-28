import './ExamPage.css';
import NavBar from '../../components/ui/NavBar/NavBar';
import SubjectGrid from '../../components/widgets/SubjectGrid/SubjectGrid';
import RecentSubjects from '../../components/widgets/RecentSubjects/RecentSubjects';
import Calendar from '../../components/widgets/Calendar/Calendar';
import { useAuth } from '../../contexts/AuthContext';

function ExamPage() {
    const { userRole } = useAuth();

    return (
        <div className="exampage">
            <NavBar />
            <div className="exams-content">
                <div className="main-section-exams">
                    <h1 style={{ color: '#015E86', textAlign: 'center', position: 'relative', right: '0.5vw', fontSize: '28px', marginBottom: '10px' }}>Избери Предмет</h1>
                    {userRole === 'professor' ? (
                        <SubjectGrid />
                    ) : (
                        <SubjectGrid />
                    )}
                </div>
                <div className="sidebar-exams">
                    <Calendar />
                    <h1 style={{ color: '#015E86', textAlign: 'center', position: 'relative', right: '0.5vw', fontSize: '25px' }}>
                        Неодамна посетени курсеви
                    </h1>
                    <RecentSubjects />
                </div>
            </div>
        </div>
    );
}

export default ExamPage;