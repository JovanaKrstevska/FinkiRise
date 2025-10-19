import '../AnnoumncementDetail/AnnoumncementDetail.css';
import Button from '../../ui/Button/Button';

function AnnouncementDetail({ announcement, onClose }) {
  if (!announcement) return null;
  return (
    <div className="annoumncementOverlay" onClick={onClose}>
      <div className="annoumncementContent" onClick={e => e.stopPropagation()}>
        <h2>{announcement.title}</h2>
        <p><strong>Date:</strong> {announcement.date}</p>
        {announcement.description && announcement.description.map((desc, idx) => (
          <p key={idx}>{desc}</p>
        ))}
        <Button className='btnClose' content={"Close"} onClick={onClose}/>
      </div>
    </div>
  );
}

export default AnnouncementDetail;
