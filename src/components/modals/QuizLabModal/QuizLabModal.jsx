import { useState } from 'react';
import './QuizLabModal.css';

function QuizLabModal({ isOpen, onClose, onSave, type = 'quiz' }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        points: '',
        instructions: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        if (formData.title.trim()) {
            onSave(formData, type);
            setFormData({
                title: '',
                description: '',
                dueDate: '',
                points: '',
                instructions: ''
            });
            onClose();
        }
    };

    const handleCancel = () => {
        setFormData({
            title: '',
            description: '',
            dueDate: '',
            points: '',
            instructions: ''
        });
        onClose();
    };

    if (!isOpen) return null;

    const modalTitle = type === 'quiz' ? 'Креирање на квиз' : 'Креирање на лабораториска вежба';

    return (
        <div className="modal-overlay">
            <div className="quiz-lab-modal">
                <div className="modal-header">
                    <h3>{modalTitle}</h3>
                    <button onClick={handleCancel} className="close-btn">×</button>
                </div>

                <div className="modal-content">
                    <div className="form-group">
                        <label htmlFor="title">Наслов</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder={`Внесете наслов на ${type === 'quiz' ? 'квизот' : 'лабораториската вежба'}`}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Опис</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Внесете опис..."
                            rows="4"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dueDate">Краен рок</label>
                            <input
                                type="datetime-local"
                                id="dueDate"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="points">Поени</label>
                            <input
                                type="number"
                                id="points"
                                name="points"
                                value={formData.points}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="instructions">Инструкции</label>
                        <textarea
                            id="instructions"
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleInputChange}
                            placeholder="Внесете детални инструкции..."
                            rows="6"
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={handleSave} className="save-btn" disabled={!formData.title.trim()}>
                        Зачувај
                    </button>
                    <button onClick={handleCancel} className="cancel-btn">
                        Откажи
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuizLabModal;