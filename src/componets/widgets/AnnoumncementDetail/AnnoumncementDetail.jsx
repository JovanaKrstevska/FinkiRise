import '../AnnoumncementDetail/AnnoumncementDetail.css';
function AnnouncementDetail({ announcement, onClose }) {
  if (!announcement) return null;
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={e => e.stopPropagation()}>
        <h2>{announcement.title}</h2>
        <p><strong>Date:</strong> {announcement.date}</p>
        {/* For longer description, add it in JSON and show here */}
        {announcement.description && <p>{announcement.description}</p>}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
export default AnnouncementDetail;