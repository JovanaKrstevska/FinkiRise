import { useAuth } from '../../../contexts/AuthContext';
import StudentCourseLayout from '../StudentCourseLayout/StudentCourseLayout';
import ProfessorCourseLayout from '../ProfessorCourseLayout/ProfessorCourseLayout';

function CourseLayout({ subjectId }) {
    const { userRole } = useAuth();

    // Switch between Student and Professor layouts based on user role
    if (userRole === 'professor') {
        return <ProfessorCourseLayout subjectId={subjectId} />;
    } else {
        return <StudentCourseLayout subjectId={subjectId} />;
    }
}

export default CourseLayout;