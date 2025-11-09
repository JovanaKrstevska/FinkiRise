import './EventDetailModal.css';

function EventDetailModal({ isOpen, onClose, event, onDelete }) {
    if (!isOpen || !event) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="event-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Event Details</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="event-detail-body">
                    <div className="event-detail-row">
                        <span className="event-detail-label">Наслов:</span>
                        <span className="event-detail-value">{event.title}</span>
                    </div>
                    <div className="event-detail-row">
                        <span className="event-detail-label">Датум:</span>
                        <span className="event-detail-value">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="event-detail-row">
                        <span className="event-detail-label">Време:</span>
                        <span className="event-detail-value">{event.time}</span>
                    </div>
                    {event.description && (
                        <div className="event-detail-row">
                            <span className="event-detail-label">Опис:</span>
                            <span className="event-detail-value">{event.description}</span>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button 
                        className="btn-delete" 
                        onClick={() => {
                            onDelete(event.id);
                            onClose();
                        }}
                    >
                        Избриши Евент
                    </button>
                    <button className="btn-close" onClick={onClose}>Затвори</button>
                </div>
            </div>
        </div>
    );
}

export default EventDetailModal;
