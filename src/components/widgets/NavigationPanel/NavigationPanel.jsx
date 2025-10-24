import './NavigationPanel.css';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function NavigationPanel() {
    const { userRole } = useAuth();
    const navigate = useNavigate();

    const navigationItems = [
        {
            title: "Туторијали",
            studentAction: () => navigate('/tutorial'),
            professorAction: () => navigate('/tutorial')
        },
        {
            title: "Лабораториски",
            studentAction: () => navigate('/lab'),
            professorAction: () => navigate('/lab')
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