import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTutorialsByUser, getUserProfile, saveCompleteProfile } from '../../services/databaseService';
import NavBar from '../../components/ui/NavBar/NavBar';
import ProfileLayout from '../../components/layouts/ProfileLayout/ProfileLayout';
import './ProfilePage.css';

function ProfilePage() {
    const { currentUser } = useAuth();
    const [userRole, setUserRole] = useState('student');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // User profile data
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        index: '',
        average: '',
        credits: '',
        studyDirection: '',
        email: '',
        progress: 50,
        profileImage: null,
        cvUrl: null,
        cvFileName: null
    });

    const [userTutorials, setUserTutorials] = useState([]);



    // Load user profile data on component mount
    useEffect(() => {
        if (currentUser) {
            loadUserProfile();
            fetchUserTutorials();
        }
    }, [currentUser]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const userProfile = await getUserProfile(currentUser.uid);

            if (userProfile.success && userProfile.data) {
                const data = userProfile.data;

                // Set user role
                const role = data.role || determineRoleFromEmail();
                setUserRole(role);

                // Set profile data based on role
                if (role === 'professor') {
                    setProfileData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        email: data.email || currentUser.email || '',
                        profileImage: data.profileImage || null,
                        cvUrl: data.cvUrl || null,
                        cvFileName: data.cvFileName || null
                    });
                } else {
                    // Student data
                    setProfileData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        index: data.index || '',
                        average: data.average || '',
                        credits: data.credits || '',
                        studyDirection: data.studyDirection || '',
                        email: data.email || currentUser.email || '',
                        progress: data.progress || 50,
                        profileImage: data.profileImage || null,
                        cvUrl: data.cvUrl || null,
                        cvFileName: data.cvFileName || null
                    });
                }
            } else {
                // No profile exists, create default based on role
                const role = determineRoleFromEmail();
                setUserRole(role);

                // Parse display name if available
                const displayName = currentUser.displayName || '';
                const nameParts = displayName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                setProfileData(prev => ({
                    ...prev,
                    firstName,
                    lastName,
                    email: currentUser.email || ''
                }));
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const determineRoleFromEmail = () => {
        const email = currentUser?.email?.toLowerCase() || '';

        if (email.includes('prof') ||
            email.includes('teacher') ||
            email.includes('instructor') ||
            email.includes('faculty') ||
            email.includes('@finki.ukim.mk')) {
            return 'professor';
        }
        return 'student';
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
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileData(prev => ({
                    ...prev,
                    profileImage: e.target.result
                }));
            };
            reader.readAsDataURL(file);

            // Auto-save the image
            saveProfileImage(file);
        }
    };

    const saveProfileImage = async (imageFile) => {
        if (!currentUser) return;

        try {
            setSaving(true);
            const result = await saveCompleteProfile(
                currentUser.uid,
                { ...profileData, role: userRole },
                imageFile
            );

            if (result.success) {
                console.log('Profile image saved successfully');
                // Update the profile data with the new image URL
                setProfileData(prev => ({
                    ...prev,
                    profileImage: result.data.profileImage
                }));
            } else {
                console.error('Failed to save profile image:', result.error);
                alert('Failed to save profile image. Please try again.');
            }
        } catch (error) {
            console.error('Error saving profile image:', error);
            alert('Error saving profile image. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const updateProfileData = async (newData) => {
        if (!currentUser) return;

        try {
            setSaving(true);
            const result = await saveCompleteProfile(
                currentUser.uid,
                { ...newData, role: userRole }
            );

            if (result.success) {
                setProfileData(newData);
                console.log('Profile updated successfully');
            } else {
                console.error('Failed to update profile:', result.error);
                alert('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };



    if (loading) {
        return (
            <div className="profile-page">
                <NavBar />
                <div className="profile-container">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        fontSize: '18px',
                        color: '#666'
                    }}>
                        Loading profile...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <NavBar />
            <div className="profile-container">
                {saving && (
                    <div style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        background: '#4A90E2',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        zIndex: 1000
                    }}>
                        Saving...
                    </div>
                )}
                <ProfileLayout
                    userRole={userRole}
                    profileData={profileData}
                    userTutorials={userTutorials}
                    onImageUpload={handleImageUpload}
                    onProfileUpdate={updateProfileData}
                    currentUser={currentUser}
                />
            </div>
        </div>
    );
}

export default ProfilePage;