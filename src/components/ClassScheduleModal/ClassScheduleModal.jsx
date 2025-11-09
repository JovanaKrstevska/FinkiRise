import { useState } from 'react';
import './ClassScheduleModal.css';
import Input from '../ui/Input/Input';

function ClassScheduleModal({ isOpen, onClose, onSave }) {
    const [scheduleData, setScheduleData] = useState({
        course: '',
        days: '',
        time: '',
        location: ''
    });

    const handleChange = (e) => {
        setScheduleData({
            ...scheduleData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(scheduleData);
        setScheduleData({ course: '', days: '', time: '', location: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{position: 'relative', left: '2vw'}}>Додади распоред</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <Input
                                labelname="Име на курс"
                                typename="text"
                                inputname="course"
                                style="schedule-name-input"
                                value={scheduleData.course}
                                onChange={handleChange}
                                placeholder="e.g., Веб програмирање предавања"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                labelname="Време"
                                typename="text"
                                inputname="time"
                                style="schedule-time-input"
                                value={scheduleData.time}
                                onChange={handleChange}
                                placeholder="e.g., 9:00 AM"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                labelname="Локација"
                                typename="text"
                                inputname="location"
                                style="schedule-location-input"
                                value={scheduleData.location}
                                onChange={handleChange}
                                placeholder="e.g., Просторија 117"
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

export default ClassScheduleModal;
