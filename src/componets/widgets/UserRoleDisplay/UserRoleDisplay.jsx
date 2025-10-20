import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import './UserRoleDisplay.css';

function UserRoleDisplay() {
    const { currentUser, userRole } = useAuth();

    if (!currentUser) {
        return null;
    }

    return (
        <div className="user-role-display">
            <h3>Информации за корисникот</h3>
            <div className="user-info">
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Улога:</strong> {userRole === 'professor' ? 'Професор' : 'Студент'}</p>
                <div className={`role-indicator ${userRole}`}>
                    {userRole === 'professor' ? '👨‍🏫' : '👨‍🎓'} {userRole === 'professor' ? 'Професор' : 'Студент'}
                </div>
            </div>
        </div>
    );
}

export default UserRoleDisplay;