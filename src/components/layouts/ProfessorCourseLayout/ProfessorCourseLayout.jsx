import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import FileUploadModal from '../../modals/FileUploadModal/FileUploadModal';
import VideoLinkModal from '../../modals/VideoLinkModal/VideoLinkModal';
import '../CourseLayout/CourseLayout.css';

function ProfessorCourseLayout({ subjectId }) {
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Modal states
    const [fileUploadModal, setFileUploadModal] = useState({ isOpen: false, sectionType: '' });
    const [videoLinkModal, setVideoLinkModal] = useState(false);

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
        console.log('🔄 ProfessorCourseLayout useEffect triggered');
        console.log('📋 Subject ID:', subjectId);
        console.log('👤 Current User:', currentUser?.uid);
        console.log('🔐 User authenticated:', !!currentUser);
        
        if (subjectId && currentUser) {
            fetchSubject();
            fetchCourseContent();
        } else if (subjectId && !currentUser) {
            console.warn('⚠️ Subject ID provided but no authenticated user');
            setError('Please log in to access course content');
            setLoading(false);
        } else if (!subjectId) {
            console.warn('⚠️ No subject ID provided');
            setError('No subject ID provided');
            setLoading(false);
        }
    }, [subjectId, currentUser]);

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
            console.log('📚 Fetching course content for subject:', subjectId);
            const contentDoc = await getDoc(doc(db, 'courseContent', subjectId));
            console.log('📄 Course content document exists:', contentDoc.exists());
            
            let contentData = {
                lectures: [],
                exercises: [],
                literature: [],
                recordings: [],
                quizzes: [],
                labs: [],
                homework: [],
                results: []
            };
            
            if (contentDoc.exists()) {
                contentData = { ...contentData, ...contentDoc.data() };
                console.log('✅ Course content retrieved:', contentData);
                console.log('✅ Quizzes found in courseContent:', contentData.quizzes?.length || 0);
            } else {
                console.log('ℹ️ No course content found, using empty structure');
            }
            
            // Fetch labs from labs collection
            try {
                const labsQuery = query(
                    collection(db, 'labs'),
                    where('subjectId', '==', subjectId)
                );
                const labsSnapshot = await getDocs(labsQuery);
                const labs = [];
                labsSnapshot.forEach(doc => {
                    labs.push({ id: doc.id, ...doc.data() });
                });
                contentData.labs = labs;
                console.log('✅ Labs fetched:', labs.length);
            } catch (labError) {
                console.error('❌ Error fetching labs:', labError);
            }
            
            setCourseContent(contentData);
            console.log('🔄 Final courseContent set:', contentData);
        } catch (err) {
            console.error('❌ Error fetching course content:', err);
            console.error('Course content error details:', {
                message: err.message,
                code: err.code
            });
            
            // Set empty content structure on error
            setCourseContent({
                lectures: [],
                exercises: [],
                literature: [],
                recordings: [],
                quizzes: [],
                labs: [],
                homework: [],
                results: []
            });
        }
    };

    const handleAddContent = (sectionType) => {
        console.log('➕ Add content clicked:', sectionType);
        
        if (sectionType === 'recordings') {
            console.log('📹 Opening video link modal for recordings');
            setVideoLinkModal(true);
        } else if (['lectures', 'exercises', 'literature', 'homework', 'results'].includes(sectionType)) {
            console.log('📤 Opening file upload modal for:', sectionType);
            setFileUploadModal({ isOpen: true, sectionType });
        } else if (sectionType === 'quizzes') {
            console.log('📝 Navigating to create quiz');
            navigate(`/create-quiz/${subjectId}`);
        } else if (sectionType === 'labs') {
            console.log('💻 Navigating to create lab');
            navigate(`/create-lab/${subjectId}`);
        }
    };

    const handleFileUpload = async (file, sectionType) => {
        console.log('🔄 Starting file upload...', { file: file.name, sectionType, subjectId });
        
        try {
            if (!currentUser) {
                console.error('❌ No current user');
                alert('You must be logged in to upload files.');
                return;
            }

            if (!file) {
                console.error('❌ No file selected');
                alert('No file selected.');
                return;
            }

            console.log('📁 File details:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            // Check file size limit (5MB = 5242880 bytes)
            if (file.size > 5242880) {
                console.warn('⚠️ File too large:', file.size, 'bytes');
                alert('File is too large. Please select a file smaller than 5MB.');
                return;
            }
            
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target.result;
                const fileId = Date.now().toString();
                let fileSaved = false;
                
                // Create file document in separate collection
                const fileDoc = {
                    id: fileId,
                    name: file.name,
                    originalName: file.name,
                    type: file.type,
                    size: file.size,
                    fileData: base64Data, // Store base64 data in separate document
                    uploadDate: new Date().toISOString(),
                    uploadedBy: currentUser.uid,
                    subjectId: subjectId,
                    sectionType: sectionType
                };

                console.log('📝 Creating file document:', { ...fileDoc, fileData: '[BASE64_DATA]' });
                console.log('📊 Base64 data size:', base64Data.length, 'bytes');
                
                // Check if file needs to be chunked (800KB limit per document to be extra safe)
                const maxChunkSize = 800000; // 800KB to be extra safe with Firestore limits
                
                if (base64Data.length > maxChunkSize) {
                    console.log('📦 File too large for single document, using chunking...');
                    // Don't save the fileDoc, use chunking instead
                    await saveFileInChunks(fileId, file, base64Data, sectionType);
                    console.log('💾 Chunked file saved');
                    fileSaved = true;
                } else {
                    console.log('📄 File small enough for single document...');
                    fileDoc.isChunked = false;
                    
                    // Save file to separate collection
                    await addDoc(collection(db, 'courseFiles'), fileDoc);
                    console.log('💾 Single file document saved');
                    fileSaved = true;
                }

                // Create reference object for main document
                const fileReference = {
                    id: fileId,
                    name: file.name,
                    originalName: file.name,
                    type: file.type,
                    size: file.size,
                    uploadDate: new Date().toISOString(),
                    uploadedBy: currentUser.uid
                };

                // Update local state
                setCourseContent(prev => ({
                    ...prev,
                    [sectionType]: [...(prev[sectionType] || []), fileReference]
                }));
                console.log('🔄 Local state updated');

                // Save reference to main course content document
                await saveCourseContentToFirestore(sectionType, fileReference);
                console.log('💾 Reference saved to course content');
                
                alert('File uploaded successfully!');
            };
            
            reader.readAsDataURL(file);
            
        } catch (error) {
            console.error('❌ Error uploading file:', error);
            alert(`Error uploading file: ${error.message}`);
        }
    };

    const saveFileInChunks = async (fileId, file, base64Data, sectionType) => {
        const chunkSize = 800000; // 800KB chunks to be extra safe
        const totalChunks = Math.ceil(base64Data.length / chunkSize);
        
        console.log(`📦 Splitting file into ${totalChunks} chunks`);
        
        // Create metadata document
        const metadataDoc = {
            id: fileId,
            name: file.name,
            originalName: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString(),
            uploadedBy: currentUser.uid,
            subjectId: subjectId,
            sectionType: sectionType,
            isChunked: true,
            totalChunks: totalChunks,
            chunkSize: chunkSize
        };
        
        // Save metadata
        await addDoc(collection(db, 'courseFiles'), metadataDoc);
        console.log('💾 Metadata document saved');
        
        // Save chunks
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, base64Data.length);
            const chunkData = base64Data.slice(start, end);
            
            const chunkDoc = {
                fileId: fileId,
                chunkIndex: i,
                chunkData: chunkData,
                uploadDate: new Date().toISOString()
            };
            
            await addDoc(collection(db, 'courseFileChunks'), chunkDoc);
            console.log(`💾 Chunk ${i + 1}/${totalChunks} saved`);
        }
        
        console.log('✅ All chunks saved successfully');
    };

    const handleVideoLinkAdd = async (videoData) => {
        console.log('🔄 Adding video link...', videoData);
        
        try {
            if (!currentUser) {
                console.error('❌ No current user');
                alert('You must be logged in to add recordings.');
                return;
            }

            // Add uploadedBy field
            const videoRecord = {
                ...videoData,
                uploadedBy: currentUser.uid
            };

            // Update local state
            setCourseContent(prev => ({
                ...prev,
                recordings: [...(prev.recordings || []), videoRecord]
            }));
            console.log('🔄 Local state updated with video link');

            // Save to Firestore
            await saveCourseContentToFirestore('recordings', videoRecord);
            console.log('💾 Video link saved to Firestore');
            
            alert('Recording link added successfully!');
        } catch (error) {
            console.error('❌ Error adding video link:', error);
            alert(`Error adding recording: ${error.message}`);
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
        console.log(`🎨 Rendering ${sectionType}:`, items?.length || 0, 'items');
        if (sectionType === 'quizzes') {
            console.log('📝 Quiz items to render:', items);
            console.log('📝 Current courseContent.quizzes:', courseContent.quizzes);
            console.log('🔍 Debug: subjectId is:', subjectId);
            console.log('🔍 Debug: currentUser is:', currentUser?.uid);
        }
        
        if (!items || items.length === 0) {
            return <div className="empty-section">Нема содржина</div>;
        }

        return items.map((item) => (
            <div key={item.id} className="section-item blue" onClick={() => handleItemClick(item, sectionType)}>
                <div className="item-icon">
                    {sectionType === 'quizzes' ? '📝' : 
                     sectionType === 'labs' ? '💻' : 
                     sectionType === 'recordings' ? '📹' :
                     getFileIcon(item.name, item.type)}
                </div>
                <div className="item-details">
                    <span className="item-name">{item.name || item.title}</span>
                    <div className="item-meta">
                        {/* Show different metadata for quizzes and labs */}
                        {sectionType === 'quizzes' && (
                            <>
                                {item.questions?.length && <span className="question-count">{item.questions.length} прашања</span>}
                                {item.timeLimit && <span className="time-limit">{item.timeLimit} мин</span>}
                                {item.createdDate && <span className="created-date">{formatDate(item.createdDate)}</span>}
                            </>
                        )}
                        {sectionType === 'labs' && (
                            <>
                                {item.difficulty && <span className="difficulty">Тежина: {item.difficulty}</span>}
                                {item.estimatedTime && <span className="estimated-time">{item.estimatedTime} мин</span>}
                                {item.createdDate && <span className="created-date">{formatDate(item.createdDate)}</span>}
                            </>
                        )}
                        {/* Show file metadata for file sections */}
                        {!['quizzes', 'labs'].includes(sectionType) && (
                            <>
                                {item.uploadDate && <span className="upload-date">{formatDate(item.uploadDate)}</span>}
                            </>
                        )}
                    </div>
                </div>
            </div>
        ));
    };

    const getFileIcon = (fileName, fileType) => {
        if (!fileName) return '📄';
        
        const extension = fileName.split('.').pop()?.toLowerCase();
        const type = fileType?.toLowerCase();
        
        if (extension === 'pdf' || type?.includes('pdf')) return '📕';
        if (['xlsx', 'xls'].includes(extension) || type?.includes('sheet')) return '📊';
        if (['docx', 'doc'].includes(extension) || type?.includes('document')) return '📘';
        if (['pptx', 'ppt'].includes(extension) || type?.includes('presentation')) return '📙';
        if (['mp4', 'avi', 'mov'].includes(extension) || type?.includes('video')) return '🎥';
        if (['mp3', 'wav'].includes(extension) || type?.includes('audio')) return '🎵';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension) || type?.includes('image')) return '🖼️';
        if (['zip', 'rar', '7z'].includes(extension)) return '📦';
        
        return '📄';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('mk-MK', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const handleItemClick = async (item, sectionType) => {
        console.log('🖱️ Item clicked:', item.name, sectionType);
        
        // Handle quizzes and labs differently - navigate to view/edit pages
        if (sectionType === 'quizzes') {
            console.log('📝 Opening quiz:', item.title || item.name);
            navigate(`/quiz/${item.id}`);
            return;
        }
        
        if (sectionType === 'labs') {
            console.log('💻 Opening lab:', item.title || item.name);
            navigate(`/lab/${item.id}`);
            return;
        }
        
        // Handle recordings (video links) differently
        if (sectionType === 'recordings') {
            console.log('📹 Opening video link:', item.url);
            if (item.url) {
                window.open(item.url, '_blank');
            } else {
                alert('Video URL not found.');
            }
            return;
        }
        
        // Handle file downloads for other sections
        try {
            // Fetch the actual file data from courseFiles collection
            console.log('🔍 Fetching file data for ID:', item.id);
            console.log('🔍 Item details:', item);
            
            const filesQuery = query(
                collection(db, 'courseFiles'), 
                where('id', '==', item.id.toString())
            );
            const filesSnapshot = await getDocs(filesQuery);
            
            console.log('📊 Query results:', filesSnapshot.size, 'documents found');
            
            if (!filesSnapshot.empty) {
                const fileDoc = filesSnapshot.docs[0];
                const fileData = fileDoc.data();
                console.log('✅ File data retrieved:', { 
                    name: fileData.name, 
                    isChunked: fileData.isChunked,
                    hasData: !!fileData.fileData 
                });
                
                if (fileData.isChunked) {
                    console.log('📦 File is chunked, reassembling...');
                    const reassembledData = await reassembleChunkedFile(item.id, fileData.totalChunks);
                    if (reassembledData) {
                        downloadFile(reassembledData, fileData.name);
                    }
                } else if (fileData.fileData) {
                    console.log('📄 File is single document, downloading...');
                    downloadFile(fileData.fileData, fileData.name);
                } else {
                    console.warn('⚠️ No file data in document');
                    alert('File data not found.');
                }
            } else {
                console.warn('⚠️ File document not found for ID:', item.id);
                alert('File not found in database.');
            }
        } catch (error) {
            console.error('❌ Error downloading file:', error);
            alert('Error downloading file. Please try again.');
        }
    };

    const reassembleChunkedFile = async (fileId, totalChunks) => {
        try {
            console.log(`🔄 Reassembling ${totalChunks} chunks for file ID: ${fileId}`);
            
            const chunksQuery = query(
                collection(db, 'courseFileChunks'),
                where('fileId', '==', fileId)
            );
            const chunksSnapshot = await getDocs(chunksQuery);
            
            if (chunksSnapshot.empty) {
                console.error('❌ No chunks found for file ID:', fileId);
                alert('File chunks not found.');
                return null;
            }
            
            // Sort chunks by index
            const chunks = [];
            chunksSnapshot.forEach(doc => {
                const chunkData = doc.data();
                chunks[chunkData.chunkIndex] = chunkData.chunkData;
            });
            
            // Reassemble the file
            const reassembledData = chunks.join('');
            console.log('✅ File reassembled successfully, size:', reassembledData.length, 'bytes');
            
            return reassembledData;
        } catch (error) {
            console.error('❌ Error reassembling chunked file:', error);
            alert('Error reassembling file chunks.');
            return null;
        }
    };

    const downloadFile = (base64Data, fileName) => {
        try {
            const link = document.createElement('a');
            link.href = base64Data;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('✅ File downloaded:', fileName);
        } catch (error) {
            console.error('❌ Error downloading file:', error);
            alert('Error downloading file.');
        }
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
                                className="add-btn-section" 
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
                                className="add-btn-section" 
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
                                className="add-btn-section" 
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
                                className="add-btn-section" 
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
                                className="add-btn-section" 
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
                                className="add-btn-section" 
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
                                className="add-btn-section" 
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
                                className="add-btn-section" 
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
            
            <VideoLinkModal
                isOpen={videoLinkModal}
                onClose={() => setVideoLinkModal(false)}
                onAddLink={handleVideoLinkAdd}
            />
        </div>
    );
}

export default ProfessorCourseLayout;