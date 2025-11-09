import { useState } from 'react';
import './CalendarEventModal.css';
import Input from '../ui/Input/Input';

function CalendarEventModal({ isOpen, onClose, onSave }) {
    const [eventData, setEventData] = useState({
        title: '',
        date: '',
        time: '',
        description: ''
    });

    const handleChange = (e) => {
        setEventData({
            ...eventData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(eventData);
        setEventData({ title: '', date: '', time: '', description: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{position: 'relative', left: '2vw'}}>Додади Евент</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <Input
                                labelname="Име на евент"
                                typename="text"
                                inputname="title"
                                style="event-title-input"
                                value={eventData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                labelname="Датум"
                                typename="date"
                                inputname="date"
                                style="event-date-input"
                                value={eventData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                labelname="Време"
                                typename="time"
                                inputname="time"
                                style="event-time-input"
                                value={eventData.time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Опис</label>
                            <textarea
                                name="description"
                                value={eventData.description}
                                onChange={handleChange}
                                rows="3"
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

export default CalendarEventModal;
