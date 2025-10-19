import './NavigationPanel.css';

function NavigationPanel() {
    const navigationItems = [
        {
            title: "Туторијали"
        },
        {
            title: "Лабораториски"
        },
        {
            title: "Испити"
        }
    ];
    
    return (
        <div className="navigation-panel">
            {navigationItems.map((item, index) => (
                <div key={index} className="nav-item">
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