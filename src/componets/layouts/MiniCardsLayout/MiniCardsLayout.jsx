import React, { useState } from 'react';
import MiniCard from '../../widgets/MiniCard/MiniCard';
import FavouriteStar from '../../widgets/FavouriteStar/FavouriteStar';
import '../MiniCardsLayout/MiniCardsLayout.css';
import data from '../../../announcements.json'; 

function MiniCardsLayout() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
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
    else if (pageNum > totalPages) pageNum = totalPages;
    setCurrentPage(pageNum);
  };

  const handleTabClick = (index) => {
    setSelectedTab(index);
    setCurrentPage(1);
  };

  return (
    <>
      <div className='miniCardLayout'>
        <MiniCard
          content="Соопштенија"
          mini_desc="Тука ќе можете да ги разгледате сите соопштенија"
          onClick={() => handleTabClick(0)}
        />
        <MiniCard
          content="Пракса и вработување"
          mini_desc="Тука ќе можете да ги разгледате сите огласи за пракси и за вработување"
          onClick={() => handleTabClick(1)}
        />
        <MiniCard
          content="Консултации"
          mini_desc="Тука ќе можете да ги разгледате сите соби за консултации од сите професори"
          onClick={() => handleTabClick(2)}
        />
      </div>

      <div className='tableContainer'>
        <div className='table-container'>
          {currentData.map(item => (
            <div className='table-row' key={item.id}>
              <FavouriteStar />
              <a className='title' href="#">{item.title}</a>
              <span className='date'>{item.date}</span>
            </div>
          ))}
        </div>

        <div className='pagination'>
          <span className='arrow left' onClick={() => changePage(currentPage - 1)}>
            &#9664;
          </span>
          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <span
                key={pageNum}
                className={`page${pageNum === currentPage ? ' active' : ''}`}
                onClick={() => changePage(pageNum)}
              >
                {pageNum}
              </span>
            );
          })}
          <span className='arrow right' onClick={() => changePage(currentPage + 1)}>
            &#9654;
          </span>
        </div>
      </div>
    </>
  );
}

export default MiniCardsLayout;
