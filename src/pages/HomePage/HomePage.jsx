import '../HomePage/HomePage.css';
import NavBar from '../../componets/ui/NavBar/NavBar';
import SubjectGrid from '../../componets/widgets/SubjectGrid/SubjectGrid';
import ProfessorSubjectGrid from '../../componets/widgets/ProfessorSubjectGrid/ProfessorSubjectGrid';
import Calendar from '../../componets/widgets/Calendar/Calendar';
import NavigationPanel from '../../componets/widgets/NavigationPanel/NavigationPanel';
import ProfessorNavigationPanel from '../../componets/widgets/ProfessorNavigationPanel/ProfessorNavigationPanel';
import UserRoleDisplay from '../../componets/widgets/UserRoleDisplay/UserRoleDisplay';
import { useAuth } from '../../contexts/AuthContext';

function HomePage(props){
    const { userRole } = useAuth();

    return(
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
                    {userRole === 'professor' ? (
                        <ProfessorNavigationPanel />
                    ) : (
                        <NavigationPanel />
                    )}
                </div>
            </div>
        </div>
    );
}
export default HomePage;