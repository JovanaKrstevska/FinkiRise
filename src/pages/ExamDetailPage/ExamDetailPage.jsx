import './ExamDetailPage.css';
import NavBar from '../../components/ui/NavBar/NavBar';
import { useParams } from 'react-router-dom';
import ExamDetailLayout from '../../components/layouts/ExamDetailLayout/ExamDetailLayout';

function ExamDetailPage() {
    const { subjectId } = useParams();

    return (
        <>
            <NavBar />
            <ExamDetailLayout subjectId={subjectId} />
        </>
    );
}

export default ExamDetailPage;