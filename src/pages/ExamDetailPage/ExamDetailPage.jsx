import './ExamDetailPage.css';
import NavBar from '../../components/ui/NavBar/NavBar';
import ExamLayout from '../../components/layouts/ExamLayout/ExamLayout';
import { useParams } from 'react-router-dom';

function ExamDetailPage() {
    const { subjectId } = useParams();
    
    return (
        <div className="exam-detail-page">
            <NavBar />
            <div className="exam-detail-content">
                <ExamLayout subjectId={subjectId} />
            </div>
        </div>
    );
}

export default ExamDetailPage;