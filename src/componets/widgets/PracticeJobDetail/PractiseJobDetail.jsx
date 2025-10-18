// PracticeJobDetail.jsx
import React from 'react';
import '../PracticeJobDetail/PracticeJobDetail.css';

function PracticeJobDetail({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={e => e.stopPropagation()}>
        <h2>{job.title}</h2>
        <p><strong>Date:</strong> {job.date}</p>
        {job.description && <p>{job.description}</p>}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default PracticeJobDetail;
