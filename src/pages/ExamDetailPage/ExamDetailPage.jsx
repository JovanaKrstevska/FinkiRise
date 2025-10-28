import './ExamDetailPage.css';
import NavBar from '../../components/ui/NavBar/NavBar';
import ExamLayout from '../../components/layouts/ExamLayout/ExamLayout';

function ExamDetailPage() {
    return (
        <div className="exam-detail-page">
            <NavBar />
            <div className="exam-detail-content">
                <ExamLayout />
            </div>
        </div>
    );
}

export default ExamDetailPage;