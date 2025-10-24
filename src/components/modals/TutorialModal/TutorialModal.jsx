import './TutorialModal.css';
import { useState, useEffect } from 'react';
import Button from '../../ui/Button/Button';
import Input from '../../ui/Input/Input';

function TutorialModal({ isOpen, onClose, onSave, tutorial = null }) {
    const [title, setTitle] = useState(tutorial?.title || '');
    const [youtubeUrl, setYoutubeUrl] = useState(tutorial?.youtubeUrl || '');
    const [description, setDescription] = useState(tutorial?.description || '');
    const [thumbnail, setThumbnail] = useState(tutorial?.thumbnail || '');
    const [dragActive, setDragActive] = useState(false);


    // Helper function to extract YouTube video ID
    const extractYouTubeId = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return match ? match[1] : null;
    };

    // Extract video ID early
    const videoId = extractYouTubeId(youtubeUrl);

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
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setThumbnail(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleYouTubeUrlChange = (url) => {
        setYoutubeUrl(url);
        if (url && !thumbnail) {
            const videoId = extractYouTubeId(url);
            if (videoId) {
                setThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
            }
        }
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert('Ве молиме внесете наслов');
            return;
        }

        const tutorialData = {
            title: title.trim(),
            description: description.trim(),
            youtubeUrl: youtubeUrl.trim(),
            thumbnail: thumbnail,
            category: 'Custom',
            isPublic: false
        };

        onSave(tutorialData);
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setYoutubeUrl('');
        setDescription('');
        setThumbnail('');
        setDragActive(false);
        onClose();
    };



    if (!isOpen) return null;

    return (
        <div className="tutorial-modal-overlay" onClick={handleClose}>
            <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tutorial-modal-header">
                    <h2 className="tutorial-modal-title">Креирање на Туторијал</h2>
                    <Button
                        className="tutorial-modal-save"
                        content="Зачувај"
                        onClick={handleSave}
                    />
                </div>

                <div className="tutorial-modal-content">
                    <div className="tutorial-form-section">
                        <label className="tutorial-form-label">Наслов</label>
                        <Input
                            type="text"
                            style="tutorial-form-input"
                            placeholder="Внеси текст"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="tutorial-form-section">
                        <label className="tutorial-form-label">YouTube URL</label>
                        <Input
                            type="url"
                            style="tutorial-form-input"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={youtubeUrl}
                            onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                        />
                    </div>

                    <div className="tutorial-content-row">
                        <div className="tutorial-upload-section">
                            <label className="tutorial-form-label-upload">Upload Thumbnail</label>
                            <div
                                className={`tutorial-upload-area ${dragActive ? 'drag-active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('thumbnail-input').click()}
                            >
                                {thumbnail ? (
                                    <img src={thumbnail} alt="Thumbnail" className="tutorial-thumbnail-preview" />
                                ) : (
                                    <div className="tutorial-upload-placeholder">
                                        <div className="tutorial-upload-icon">☁️</div>
                                        <div className="tutorial-upload-text">
                                            <div>Drag a file here</div>
                                            <div>or browse a file to upload</div>
                                        </div>
                                    </div>
                                )}
                                <input
                                    id="thumbnail-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        <div className="tutorial-preview-section">
                            {videoId ? (
                                <div className="tutorial-video-preview">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title="YouTube video preview"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="tutorial-video-iframe"
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="tutorial-video-placeholder">
                                    <div className="tutorial-play-icon">▶</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorialModal;