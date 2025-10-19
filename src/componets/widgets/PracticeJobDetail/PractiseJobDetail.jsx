// PracticeJobDetail.jsx
import React from 'react';
import '../PracticeJobDetail/PracticeJobDetail.css';
import Button from '../../ui/Button/Button';

function PracticeJobDetail({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="practiseJobOverlay" onClick={onClose}>
      <div className="practiseJobContent" onClick={e => e.stopPropagation()}>
        <h2>{job.title}</h2>
        <p><strong>Date:</strong> {job.date}</p>
        {job.description && job.description.map((desc, idx) => (
          <p key={idx}>{desc}</p>
        ))}
        <Button className='btnClose' content={"Close"} onClick={onClose}/>
      </div>
    </div>
  );
}

export default PracticeJobDetail;
