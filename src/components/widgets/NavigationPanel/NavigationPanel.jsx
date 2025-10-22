import './NavigationPanel.css';
import { useAuth } from '../../../contexts/AuthContext';

function NavigationPanel() {
    const { userRole } = useAuth();
    
    const navigationItems = [
        {
            title: "Туторијали",
            studentAction: () => console.log('Student: View tutorials'),
            professorAction: () => console.log('Professor: Manage tutorials')
        },
        {
            title: "Лабораториски", 
            studentAction: () => console.log('Student: View lab assignments'),
            professorAction: () => console.log('Professor: Create lab assignments')
        },
        {
            title: "Испити",
            studentAction: () => console.log('Student: View exams'),
            professorAction: () => console.log('Professor: Create exams')
        }
    ];

    const handleItemClick = (item) => {
        if (userRole === 'professor') {
            item.professorAction();
        } else {
            item.studentAction();
        }
    };
    
    return (
        <div className="navigation-panel">
            {navigationItems.map((item, index) => (
                <div 
                    key={index} 
                    className="nav-item"
                    onClick={() => handleItemClick(item)}
                >
                    <div className="nav-content">
                        <span className="nav-title">{item.title}</span>
                        <img className="nav-star" src="/assets/icons/star.svg" alt="Star" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default NavigationPanel;