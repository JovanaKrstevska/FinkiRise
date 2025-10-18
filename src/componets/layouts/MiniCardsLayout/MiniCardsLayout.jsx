import React, { useState } from 'react';
import MiniCard from '../../widgets/MiniCard/MiniCard';
import FavouriteStar from '../../widgets/FavouriteStar/FavouriteStar';
import '../MiniCardsLayout/MiniCardsLayout.css';
import data from '../../../announcements.json';
import AnnouncementDetail from '../../widgets/AnnoumncementDetail/AnnoumncementDetail';
import PracticeJobDetail from '../../widgets/PracticeJobDetail/PractiseJobDetail';

function MiniCardsLayout() {
    const [selectedTab, setSelectedTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [selectedPracticeJob, setSelectedPracticeJob] = useState(null);
    const itemsPerPage = 10;

    const datasets = [data.announcements, data.practiceJobs, data.consultations];
    const selectedData = datasets[selectedTab] || [];

    const totalPages = Math.ceil(selectedData.length / itemsPerPage);
    const currentData = selectedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const changePage = (pageNum) => {
        if (pageNum < 1) pageNum = 1;
        if (pageNum > totalPages) pageNum = totalPages;
        setCurrentPage(pageNum);
    };

    const handleTabClick = (index) => {
        setSelectedTab(index);
        setCurrentPage(1);
        setSelectedAnnouncement(null);
    };
    const openAnnouncementDetail = announcement => {
        setSelectedAnnouncement(announcement);
    };

    const closeAnnouncementDetail = () => {
        setSelectedAnnouncement(null);
    };

    const openPracticeJobDetail = (job) => {
        setSelectedPracticeJob(job);
    };

    const closePracticeJobDetail = () => {
        setSelectedPracticeJob(null);
    };

    return (
        <>
            <div className='miniCardLayout'>
                <MiniCard content="Соопштенија" mini_desc="Тука ќе можете да ги разгледате сите соопштенија" onClick={() => handleTabClick(0)} />
                <MiniCard content="Пракса и вработување" mini_desc="Тука ќе можете да ги разгледате сите огласи за пракси и за вработување" onClick={() => handleTabClick(1)} />
                <MiniCard content="Консултации" mini_desc="Тука ќе можете да ги разгледате сите соби за консултации од сите професори" onClick={() => handleTabClick(2)} />
            </div>

            <div className='tableContainer'>
                <div className='table-container'>
                    {selectedTab === 0 && currentData.map(item => (
                        <div className='table-row' key={item.id}>
                            <FavouriteStar />
                            <a className='title' href="#" onClick={() => openAnnouncementDetail(item)} style={{ cursor: 'pointer' }}>{item.title}</a>
                            <span className='date'>{item.date}</span>
                        </div>
                    ))}
                    {selectedTab === 1 && currentData.map(item => (
                        <div className='table-row' key={item.id}>
                            <FavouriteStar />
                            <a className='title' href="#" onClick={() => openPracticeJobDetail(item)} style={{ cursor: 'pointer' }}>{item.title}</a>
                            <span className='date'>{item.date}</span>
                        </div>
                    ))}
                    {selectedTab === 2 && currentData.map(item => (
                        <div className='table-row' key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className='title'>{item.professor}</span>
                            <img style={{ width: '3vw' }} src='/assets/icons/big_blue_button.svg' alt='BigBlueButton' />
                            <a style={{ alignItems: 'center', textDecoration: 'none', color: '#2a7fa3', fontSize: '20px' }} href={item.meetingLink} target="_blank" className="blueButton">Консултации</a>
                        </div>
                    ))}
                </div>
                <div className='pagination'>
                    <span className='arrow left' onClick={() => changePage(currentPage - 1)}>&#9664;</span>
                    {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                            <span key={pageNum} className={`page${pageNum === currentPage ? ' active' : ''}`} onClick={() => changePage(pageNum)}>
                                {pageNum}
                            </span>
                        );
                    })}
                    <span className='arrow right' onClick={() => changePage(currentPage + 1)}>&#9654;</span>
                </div>
            </div>
            {selectedTab === 0 && selectedAnnouncement && (
                <AnnouncementDetail announcement={selectedAnnouncement} onClose={closeAnnouncementDetail} />
            )}
            {selectedTab === 1 && selectedPracticeJob && (
                <PracticeJobDetail job={selectedPracticeJob} onClose={closePracticeJobDetail} />
            )}
        </>
    );
}

export default MiniCardsLayout;
