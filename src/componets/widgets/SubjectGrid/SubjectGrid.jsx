import { useState } from 'react';
import './SubjectGrid.css';
import Button from '../../ui/Button/Button';

function SubjectGrid() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Mock data for subjects
    const subjects = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: "Име на предмет",
        code: "IO"
    }));

    const totalPages = Math.ceil(subjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSubjects = subjects.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPaginationNumbers = () => {
        const pages = [];
        const maxVisiblePages = 10;

        for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
            pages.push(
                <span
                    key={i}
                    className={`page1 ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </span>
            );
        }

        if (totalPages > maxVisiblePages) {
            pages.push(<span key="ellipsis">...</span>);
            pages.push(
                <span
                    key={totalPages}
                    className={`page1 ${currentPage === totalPages ? 'active' : ''}`}
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </span>
            );
        }

        return pages;
    };

    return (
        <div className="subject-grid-container">
            <div className="subject-grid">
                {currentSubjects.map((subject) => (
                    <div key={subject.id} className="subject-card">
                        <div className="subject-logo">
                            <img 
                                src="/assets/icons/finki_subject_logo.svg" 
                                alt="Subject Logo" 
                                className="logo-image"
                            />
                        </div>
                        <div className="subject-name">{subject.name}</div>
                    </div>
                ))}
            </div>

            <div className="paginationSubjectGrid">
                <span
                    className="arrow1 left"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                >
                    &#9664;
                </span>

                {renderPaginationNumbers()}

                <span
                    className="arrow1 right"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                >
                    &#9654;
                </span>

                <Button className="filter-btn" content="Филтрирај" />
            </div>
        </div>
    );
}

export default SubjectGrid;