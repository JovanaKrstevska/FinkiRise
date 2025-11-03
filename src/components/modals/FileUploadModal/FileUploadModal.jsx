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
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile, sectionType);
            setSelectedFile(null);
            onClose();
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
                <h3>File Upload</h3>
                
                <div 
                    className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="upload-icon">📁</div>
                    <p>Drag and drop files here</p>
                    <span>OR</span>
                    <input 
                        type="file" 
                        id="file-input" 
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        hidden
                    />
                    <label htmlFor="file-input" className="browse-btn">
                        Browse Files
                    </label>
                </div>

                {selectedFile && (
                    <div className="selected-file">
                        <p>Selected: {selectedFile.name}</p>
                    </div>
                )}

                <div className="modal-actions">
                    <button onClick={handleUpload} className="upload-btn" disabled={!selectedFile}>
                        Upload File
                    </button>
                    <button onClick={handleCancel} className="cancel-btn">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FileUploadModal;