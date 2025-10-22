import '../HomePage/HomePage.css';
import NavBar from '../../components/ui/NavBar/NavBar';
import SubjectGrid from '../../components/widgets/SubjectGrid/SubjectGrid';
import ProfessorSubjectGrid from '../../components/widgets/ProfessorSubjectGrid/ProfessorSubjectGrid';
import Calendar from '../../components/widgets/Calendar/Calendar';
import NavigationPanel from '../../components/widgets/NavigationPanel/NavigationPanel';
import UserRoleDisplay from '../../components/widgets/UserRoleDisplay/UserRoleDisplay';
import { useAuth } from '../../contexts/AuthContext';

function HomePage(props) {
    const { userRole } = useAuth();

    return (
        <div className="homepage">
            <NavBar />
            <div className="homepage-content">
                <div className="main-section">
                    {userRole === 'professor' ? (
                        <ProfessorSubjectGrid />
                    ) : (
                        <SubjectGrid />
                    )}
                </div>
                <div className="sidebar">
                    <UserRoleDisplay />
                    <Calendar />
                    <NavigationPanel />
                </div>
            </div>
        </div>
    );
}
export default HomePage;