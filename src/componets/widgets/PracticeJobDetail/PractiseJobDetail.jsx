import '../PracticeJobDetail/PracticeJobDetail.css';
import Button from '../../ui/Button/Button';

function PracticeJobDetail({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="practiseJobOverlay" onClick={onClose}>
      <div className="practiseJobContent" onClick={e => e.stopPropagation()}>
        {/* Email Header */}
        <div className="email-header">
          <div className="email-header-top">
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="email-subject">
            <h1>{job.title}</h1>
          </div>
          <div className="email-meta">
            <div className="sender-info">
              <div className="sender-avatar">
                <img src="/assets/icons/finki_subject_logo.svg" alt="FINKI" />
              </div>
              <div className="sender-details">
                <div className="sender-name">FINKI Кариерен Центар</div>
                <div className="sender-email">career@finki.ukim.mk</div>
              </div>
            </div>
            <div className="email-date">{job.date}</div>
          </div>
        </div>

        {/* Email Body */}
        <div className="email-body">
          {job.description && job.description.map((desc, idx) => (
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

export default PracticeJobDetail;
