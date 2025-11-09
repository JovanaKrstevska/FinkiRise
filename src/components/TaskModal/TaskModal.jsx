import { useState } from 'react';
import './TaskModal.css';
import Input from "../ui/Input/Input";

function TaskModal({ isOpen, onClose, onSave }) {
    const [taskData, setTaskData] = useState({
        text: ''
    });

    const handleChange = (e) => {
        setTaskData({
            ...taskData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(taskData);
        setTaskData({ text: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{position: 'relative', left: '2vw'}}>Додади Таск</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <Input
                                labelname="Опис на таскот"
                                type="text"
                                name="text"
                                typename="text"
                                inputname="text"
                                value={taskData.text}
                                style="task-description-input"
                                onChange={handleChange}
                                placeholder="e.g., Прегледување на домашните"
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Затвори</button>
                        <button type="submit" className="btn-save">Зачувај</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskModal;
