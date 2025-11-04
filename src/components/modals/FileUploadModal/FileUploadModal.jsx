import { useState } from 'react';
import './FileUploadModal.css';

function FileUploadModal({ isOpen, onClose, onUpload, sectionType }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        console.log('🎯 FileUploadModal: File dropped', e.dataTransfer.files);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            console.log('✅ FileUploadModal: Dropped file details', {
                name: file.name,
                size: file.size,
                type: file.type
            });
            setSelectedFile(file);
        }
    };

    const handleFileSelect = (e) => {
        console.log('📁 FileUploadModal: File selected', e.target.files);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            console.log('✅ FileUploadModal: File details', {
                name: file.name,
                size: file.size,
                type: file.type
            });
            setSelectedFile(file);
        }
    };

    const handleUpload = () => {
        console.log('🚀 FileUploadModal: Starting upload', { 
            hasFile: !!selectedFile, 
            fileName: selectedFile?.name,
            sectionType 
        });
        
        if (selectedFile) {
            console.log('📤 FileUploadModal: Calling onUpload function');
            onUpload(selectedFile, sectionType);
            setSelectedFile(null);
            onClose();
        } else {
            console.warn('⚠️ FileUploadModal: No file selected');
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="file-upload-modal">
                <h2 className="modal-title">File Upload</h2>
                
                <div 
                    className={`upload-drop-area ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <div className="upload-cloud-icon">
                        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="40" fill="#4A90A4"/>
                            <path d="M50 30 L50 60 M38 42 L50 30 L62 42" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="upload-text">
                        <p className="drag-text">Drag a file here</p>
                        <p className="browse-text">or browse a file to upload</p>
                    </div>
                </div>

                <div className="or-divider">
                    <span>-OR-</span>
                </div>

                <input 
                    type="file" 
                    id="file-input" 
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.avi,.mov,.wmv"
                    hidden
                />
                
                <button className="browse-files-btn" onClick={() => document.getElementById('file-input').click()}>
                    Browse Files
                </button>

                {selectedFile && (
                    <div className="selected-file-info">
                        <p>📎 {selectedFile.name}</p>
                        <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                )}

                <button 
                    className="done-btn" 
                    onClick={selectedFile ? handleUpload : handleCancel}
                >
                    {selectedFile ? 'UPLOAD' : 'DONE'}
                </button>
            </div>
        </div>
    );
}

export default FileUploadModal;