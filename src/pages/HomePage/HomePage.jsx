import '../HomePage/HomePage.css';
import NavBar from '../../componets/ui/NavBar/NavBar';
import SubjectGrid from '../../componets/widgets/SubjectGrid/SubjectGrid';
import Calendar from '../../componets/widgets/Calendar/Calendar';
import NavigationPanel from '../../componets/widgets/NavigationPanel/NavigationPanel';

function HomePage(props){
    return(
        <div className="homepage">
            <NavBar />
            <div className="homepage-content">
                <div className="main-section">
                    <SubjectGrid />
                </div>
                <div className="sidebar">
                    <Calendar />
                    <NavigationPanel />
                </div>
            </div>
        </div>
    );
}
export default HomePage;