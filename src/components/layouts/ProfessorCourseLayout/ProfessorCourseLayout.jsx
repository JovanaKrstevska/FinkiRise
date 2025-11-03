import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../config/firebase';
import FileUploadModal from '../../modals/FileUploadModal/FileUploadModal';
import '../CourseLayout/CourseLayout.css';

function ProfessorCourseLayout({ subjectId }) {
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Modal states (only for file upload now)
    const [fileUploadModal, setFileUploadModal] = useState({ isOpen: false, sectionType: '' });

    // Course content states
    const [courseContent, setCourseContent] = useState({
        lectures: [],
        exercises: [],
        literature: [],
        recordings: [],
        quizzes: [],
        labs: [],
        homework: [],
        results: []
    });

    useEffect(() => {
        if (subjectId) {
            fetchSubject();
            fetchCourseContent();
        }
    }, [subjectId]);

    const fetchSubject = async () => {
        try {
            setLoading(true);
            const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
            if (subjectDoc.exists()) {
                const subjectData = { id: subjectDoc.id, ...subjectDoc.data() };
                setSubject(subjectData);
            } else {
                setError('Subject not found');
            }
        } catch (err) {
            setError('Error fetching subject');
            console.error('ProfessorCourseLayout Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseContent = async () => {
        try {
            const contentDoc = await getDoc(doc(db, 'courseContent', subjectId));
            if (contentDoc.exists()) {
                setCourseContent(contentDoc.data());
            }
        } catch (err) {
            console.error('Error fetching course content:', err);
        }
    };

    const handleAddContent = (sectionType) => {
        if (['lectures', 'exercises', 'literature', 'recordings', 'homework', 'results'].includes(sectionType)) {
            setFileUploadModal({ isOpen: true, sectionType });
        } else if (sectionType === 'quizzes') {
            navigate(`/create-quiz/${subjectId}`);
        } else if (sectionType === 'labs') {
            navigate(`/create-lab/${subjectId}`);
        }
    };

    const handleFileUpload = async (file, sectionType) => {
        try {
            if (!currentUser) {
                alert('You must be logged in to upload files.');
                return;
            }

            if (!file) {
                alert('No file selected.');
                return;
            }
            
            // Create a unique filename
            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const filePath = `courseContent/${subjectId}/${sectionType}/${fileName}`;
            
            // Upload file to Firebase Storage
            const storageRef = ref(storage, filePath);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Create new item object
            const newItem = {
                id: timestamp,
                name: file.name,
                originalName: file.name,
                fileName: fileName,
                type: file.type,
                size: file.size,
                downloadURL: downloadURL,
                uploadDate: new Date().toISOString(),
                uploadedBy: currentUser.uid
            };

            // Update local state
            setCourseContent(prev => ({
                ...prev,
                [sectionType]: [...(prev[sectionType] || []), newItem]
            }));

            // Save to Firestore
            await saveCourseContentToFirestore(sectionType, newItem);
            
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert(`Error uploading file: ${error.message}`);
        }
    };



    const saveCourseContentToFirestore = async (sectionType, newItem) => {
        try {
            const contentDocRef = doc(db, 'courseContent', subjectId);
            
            // Check if document exists
            const contentDoc = await getDoc(contentDocRef);
            
            if (contentDoc.exists()) {
                // Update existing document
                await updateDoc(contentDocRef, {
                    [sectionType]: arrayUnion(newItem),
                    lastUpdated: new Date().toISOString(),
                    updatedBy: currentUser.uid
                });
            } else {
                // Create new document
                const initialData = {
                    lectures: [],
                    exercises: [],
                    literature: [],
                    recordings: [],
                    quizzes: [],
                    labs: [],
                    homework: [],
                    results: [],
                    createdDate: new Date().toISOString(),
                    createdBy: currentUser.uid,
                    lastUpdated: new Date().toISOString(),
                    updatedBy: currentUser.uid
                };
                
                initialData[sectionType] = [newItem];
                
                await setDoc(contentDocRef, initialData);
            }
        } catch (error) {
            console.error('Error saving to Firestore:', error);
            throw error;
        }
    };

    const renderSectionItems = (items, sectionType) => {
        if (items.length === 0) {
            return <div className="empty-section">Нема содржина</div>;
        }

        return items.map((item) => (
            <div key={item.id} className="section-item blue">
                {sectionType === 'quizzes' ? '📝' : 
                 sectionType === 'labs' ? '💻' : 
                 sectionType === 'recordings' ? '📹' :
                 <img src={item.name?.endsWith('.xlsx') || item.name?.endsWith('.xls') ? 
                     '../assets/icons/exel_icon.svg' : '../assets/icons/pdf_icon.svg'} alt="File" />}
                <span className="item-name">{item.name || item.title}</span>
            </div>
        ));
    };

    if (loading) {
        return (
            <div className="course-layout">
                <div className="course-loading">Loading course...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="course-layout">
                <div className="course-error">Error: {error}</div>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="course-layout">
                <div className="course-error">No course found</div>
            </div>
        );
    }

    return (
        <div className="course-layout">
            {/* Header */}
            <div className="course-header">
                <h1 className="course-title">{subject.name}</h1>
                <div className="course-semester">
                    Семестар: {subject.semesterType === 'winter' ? 'Зимски' : 'Летен'} {subject.academicYear}
                </div>
            </div>

            {/* Main Container */}
            <div className="course-container">
                {/* Course Sections */}
                <div className="course-sections">
                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Предавања</h4>
                            <button 
                                className="add-btn" 
                                onClick={() => handleAddContent('lectures')}
                            >
                                +
                            </button>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.lectures, 'lectures')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Аудиториски вежби</h4>
                            <button 
                                className="add-btn" 
                                onClick={() => handleAddContent('exercises')}
                            >
                                +
                            </button>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.exercises, 'exercises')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Литература</h4>
                            <button 
                                className="add-btn" 
                                onClick={() => handleAddContent('literature')}
                            >
                                +
                            </button>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.literature, 'literature')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Снимени предавања</h4>
                            <button 
                                className="add-btn" 
                                onClick={() => handleAddContent('recordings')}
                            >
                                +
                            </button>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.recordings, 'recordings')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Квизови</h4>
                            <button 
                                className="add-btn" 
                                onClick={() => handleAddContent('quizzes')}
                            >
                                +
                            </button>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.quizzes, 'quizzes')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Лабораториски вежби</h4>
                            <button 
                                className="add-btn" 
                                onClick={() => handleAddContent('labs')}
                            >
                                +
                            </button>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.labs, 'labs')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Домашни</h4>
                            <button 
                                className="add-btn" 
                                onClick={() => handleAddContent('homework')}
                            >
                                +
                            </button>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.homework, 'homework')}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h4 className="section-title">Резултати</h4>
                            <button 
                                className="add-btn" 
                                onClick={() => handleAddContent('results')}
                            >
                                +
                            </button>
                        </div>
                        <div className="section-list">
                            {renderSectionItems(courseContent.results, 'results')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <FileUploadModal
                isOpen={fileUploadModal.isOpen}
                onClose={() => setFileUploadModal({ isOpen: false, sectionType: '' })}
                onUpload={handleFileUpload}
                sectionType={fileUploadModal.sectionType}
            />
        </div>
    );
}

export default ProfessorCourseLayout;