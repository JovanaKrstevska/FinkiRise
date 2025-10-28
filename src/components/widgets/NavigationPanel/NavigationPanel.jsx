import './NavigationPanel.css';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function NavigationPanel() {
    const { userRole } = useAuth();
    const navigate = useNavigate();

    const navigationItems = [
        {
            title: "Туторијали",
            studentAction: () => navigate('/tutorials'),
            professorAction: () => navigate('/tutorials')
        },
        {
            title: "Лабораториски",
            studentAction: () => navigate('/labs'),
            professorAction: () => navigate('/labs')
        },
        {
            title: "Испити",
            studentAction: () => navigate('/exams'),
            professorAction: () => navigate('/exams')
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