import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTutorialsByUser, getUserProfile } from '../../services/databaseService';
import NavBar from '../../components/ui/NavBar/NavBar';
import ProfileLayout from '../../components/layouts/ProfileLayout/ProfileLayout';
import './ProfilePage.css';

function ProfilePage() {
    const { currentUser } = useAuth();
    const [userRole, setUserRole] = useState('student'); // 'student' or 'professor'
    const [studentData, setStudentData] = useState({
        name: 'Јована Крстевска',
        index: '173240',
        prosek: '7.21',
        credits: '240',
        smer: 'Примена на е-технологии',
        progress: 50
    });

    const [professorData, setProfessorData] = useState({
        name: 'Проф. Марко Петровски',
        department: 'Компјутерски науки',
        email: 'marko.petrovski@finki.ukim.mk'
    });

    const [userTutorials, setUserTutorials] = useState([]);
    const [profileImage, setProfileImage] = useState(null);



    // Determine user role and fetch user tutorials
    useEffect(() => {
        if (currentUser) {
            determineUserRole();
            fetchUserTutorials();
        }
    }, [currentUser]);

    const determineUserRole = async () => {
        try {
            // First, try to get user profile from database
            const userProfile = await getUserProfile(currentUser.uid);

            if (userProfile.success && userProfile.data?.role) {
                // If role is stored in database, use it
                setUserRole(userProfile.data.role);
            } else {
                // Fallback: determine role based on email patterns
                const email = currentUser.email?.toLowerCase() || '';

                if (email.includes('prof') ||
                    email.includes('teacher') ||
                    email.includes('instructor') ||
                    email.includes('faculty') ||
                    email.includes('@finki.ukim.mk')) {
                    setUserRole('professor');
                } else {
                    setUserRole('student');
                }
            }
        } catch (error) {
            console.error('Error determining user role:', error);
            // Default to student if there's an error
            setUserRole('student');
        }
    };

    const fetchUserTutorials = async () => {
        try {
            const result = await getTutorialsByUser(currentUser.uid);
            if (result.success) {
                setUserTutorials(result.data);
            } else {
                console.error('Error fetching user tutorials:', result.error);
            }
        } catch (error) {
            console.error('Error fetching user tutorials:', error);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };



    return (
        <div className="profile-page">
            <NavBar />
            <div className="profile-container">
                <ProfileLayout
                    userRole={userRole}
                    studentData={studentData}
                    professorData={professorData}
                    userTutorials={userTutorials}
                    profileImage={profileImage}
                    onImageUpload={handleImageUpload}
                />
            </div>
        </div>
    );
}

export default ProfilePage;