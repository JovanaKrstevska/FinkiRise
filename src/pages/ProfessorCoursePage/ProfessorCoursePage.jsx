import NavBar from "../../components/ui/NavBar/NavBar";
import ProfessorCourseLayout from "../../components/layouts/ProfessorCourseLayout/ProfessorCourseLayout";
import { useParams } from 'react-router-dom';
import "./ProfessorCoursePage.css";

function ProfessorCoursePage() {
    const { subjectId } = useParams();
    
    return (
        <div className="professor-course-page">
            <NavBar />
            <ProfessorCourseLayout subjectId={subjectId} />
        </div>
    );
}

export default ProfessorCoursePage;