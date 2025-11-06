import { useState } from 'react';
import './VideoLinkModal.css';
import Button from '../../ui/Button/Button';

function VideoLinkModal({ isOpen, onClose, onAddLink }) {
    const [videoTitle, setVideoTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isValidUrl, setIsValidUrl] = useState(true);

    const validateUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setVideoUrl(url);
        if (url) {
            setIsValidUrl(validateUrl(url));
        } else {
            setIsValidUrl(true);
        }
    };

    const handleSubmit = () => {
        if (!videoTitle.trim()) {
            alert('Please enter a title for the recording.');
            return;
        }

        if (!videoUrl.trim()) {
            alert('Please enter a video URL.');
            return;
        }

        if (!isValidUrl) {
            alert('Please enter a valid URL.');
            return;
        }

        const videoData = {
            id: Date.now().toString(),
            name: videoTitle.trim(),
            originalName: videoTitle.trim(),
            type: 'video/link',
            url: videoUrl.trim(),
            uploadDate: new Date().toISOString(),
            size: 0 // Links don't have file size
        };

        onAddLink(videoData);
        handleCancel();
    };

    const handleCancel = () => {
        setVideoTitle('');
        setVideoUrl('');
        setIsValidUrl(true);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="video-link-modal">
                <h2 className="modal-title">Add Video Recording Link</h2>
                
                <div className="form-group">
                    <label style={{position: 'relative', top: '0.5vw', left: '0.2vw'}} htmlFor="video-title">Име на снимката</label>
                    <input
                        type="text"
                        id="video-title"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="Enter recording title (e.g., Lecture 1 - Introduction)"
                        className="form-input-records"
                    />
                </div>

                <div className="form-group">
                    <label style={{position: 'relative', top: '0.5vw', left: '0.2vw'}} htmlFor="video-url">Видео URL</label>
                    <input
                        type="url"
                        id="video-url"
                        value={videoUrl}
                        onChange={handleUrlChange}
                        placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                        className={`form-input-records ${!isValidUrl ? 'invalid' : ''}`}
                    />
                    {!isValidUrl && (
                        <span className="error-text">Please enter a valid URL</span>
                    )}
                </div>

                <div className="url-examples">
                    <p className="examples-title">Supported platforms:</p>
                    <ul className="examples-list">
                        <li>YouTube: https://youtube.com/watch?v=...</li>
                        <li>Vimeo: https://vimeo.com/...</li>
                        <li>Google Drive: https://drive.google.com/...</li>
                        <li>Any direct video link</li>
                    </ul>
                </div>

                <div className="modal-actions">
                    <button 
                        className="cancel-btn" 
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <Button 
                        className="add-btn" 
                        onClick={handleSubmit}
                        disabled={!videoTitle.trim() || !videoUrl.trim() || !isValidUrl}
                        content={"Add Recording"}
                    />
                </div>
            </div>
        </div>
    );
}

export default VideoLinkModal;