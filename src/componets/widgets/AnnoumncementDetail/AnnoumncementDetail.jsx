import '../AnnoumncementDetail/AnnoumncementDetail.css';
import Button from '../../ui/Button/Button';

function AnnouncementDetail({ announcement, onClose }) {
  if (!announcement) return null;

  return (
    <div className="annoumncementOverlay" onClick={onClose}>
      <div className="annoumncementContent" onClick={e => e.stopPropagation()}>
        {/* Email Header */}
        <div className="email-header">
          <div className="email-header-top">
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="email-subject">
            <h1>{announcement.title}</h1>
          </div>
          <div className="email-meta">
            <div className="sender-info">
              <div className="sender-avatar">
                <img src="/assets/icons/finki_subject_logo.svg" alt="FINKI" />
              </div>
              <div className="sender-details">
                <div className="sender-name">FINKI Администрација</div>
                <div className="sender-email">admin@finki.ukim.mk</div>
              </div>
            </div>
            <div className="email-date">{announcement.date}</div>
          </div>
        </div>

        {/* Email Body */}
        <div className="email-body">
          {announcement.description && announcement.description.map((desc, idx) => (
            <p key={idx}>{desc}</p>
          ))}

          {/* Close Button */}
          <div className="email-close-section">
            <Button className="email-close-btn" content="Затвори" onClick={onClose} />
          </div>
        </div>


      </div>
    </div>
  );
}

export default AnnouncementDetail;
