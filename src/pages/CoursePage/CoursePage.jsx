import "../CoursePage/CoursePage.css";
import NavBar from "../../components/ui/NavBar/NavBar";
import CourseLayout from "../../components/layouts/CourseLayout/CourseLayout";
import { useParams } from 'react-router-dom';

function CoursePage(){
    const { subjectId } = useParams();
    
    return(
        <div className="course-page">
            <NavBar/>
            <CourseLayout subjectId={subjectId} />
        </div>
    );
}
export default CoursePage;