import React from 'react';
import './ProfessorNavigationPanel.css';

function ProfessorNavigationPanel() {
    const professorActions = [
        {
            title: 'Туторијали'
        },
        {
            title: 'Лабораториски'
        },
        {
            title: 'Испити'
        }
    ];

    return (
        <div className="professor-navigation-panel">
            {professorActions.map((action, index) => (
                <div key={index} className="professor-nav-item">
                    <div className="professor-nav-content">
                        <span className="professor-nav-title">{action.title}</span>
                        <img className="professor-nav-star" src="/assets/icons/star.svg" alt="Star" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProfessorNavigationPanel;