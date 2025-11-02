import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SubjectGrid.css';
import { useAuth } from '../../../contexts/AuthContext';
import { useSubjectHistory } from '../../../contexts/SubjectHistoryContext';
import { getAllSubjects, getSubjectsByAcademicPeriod } from '../../../services/databaseService';

function SubjectGrid() {
    const [currentPage, setCurrentPage] = useState(1);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
    const [selectedSemesterType, setSelectedSemesterType] = useState('all');
    const { currentUser } = useAuth();
    const { addSubjectToHistory } = useSubjectHistory();
    const navigate = useNavigate();
    const location = useLocation();
    const itemsPerPage = 6;

    useEffect(() => {
        loadSubjects();
    }, [currentUser, selectedAcademicYear, selectedSemesterType]);

    const loadSubjects = async () => {
        if (currentUser) {
            console.log('🎓 Student: Loading subjects from Firebase...');
            console.log('📊 Filters - Academic Year:', selectedAcademicYear, 'Semester Type:', selectedSemesterType);
            setLoading(true);
            try {
                let result;
                if (selectedAcademicYear === 'all' && selectedSemesterType === 'all') {
                    console.log('🔍 Getting ALL subjects (no filters)');
                    result = await getAllSubjects();
                } else {
                    const academicYear = selectedAcademicYear === 'all' ? null : selectedAcademicYear;
                    const semesterType = selectedSemesterType === 'all' ? null : selectedSemesterType;
                    console.log('🔍 Getting filtered subjects - Year:', academicYear, 'Type:', semesterType);
                    result = await getSubjectsByAcademicPeriod(academicYear, semesterType);
                }

                if (result.success) {
                    setSubjects(result.data);
                    console.log('✅ Student: Loaded subjects from Firebase:', result.data.length);
                } else {
                    console.error('❌ Student: Error loading subjects:', result.error);
                    // Show fallback subjects if Firebase fails
                    const fallbackSubjects = [
                        { id: '1', name: 'Веб програмирање', code: 'WP', semesterType: 'summer', academicYear: '2025/2026' },
                        { id: '2', name: 'Бази на податоци', code: 'DB', semesterType: 'winter', academicYear: '2025/2026' },
                        { id: '3', name: 'Софтверско инженерство', code: 'SE', semesterType: 'summer', academicYear: '2025/2026' }
                    ];
                    setSubjects(fallbackSubjects);
                    console.log('🔄 Student: Using fallback subjects');
                }
            } catch (error) {
                console.error('💥 Student: Database connection failed:', error);
                // Show fallback subjects if database fails
                const fallbackSubjects = [
                    { id: '1', name: 'Веб програмирање', code: 'WP', semesterType: 'summer', academicYear: '2025/2026' },
                    { id: '2', name: 'Бази на податоци', code: 'DB', semesterType: 'winter', academicYear: '2025/2026' },
                    { id: '3', name: 'Софтверско инженерство', code: 'SE', semesterType: 'summer', academicYear: '2025/2026' }
                ];
                setSubjects(fallbackSubjects);
                console.log('🔄 Student: Using fallback subjects due to error');
            }
            setLoading(false);
        }
    };

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

    if (loading) {
        return (
            <div className="subject-grid-container">
                <div className="loading-message">Се вчитуваат предметите...</div>
            </div>
        );
    }

    console.log('🎓 SubjectGrid: Rendering with subjects:', subjects.length);
    console.log('🎓 SubjectGrid: Current subjects:', subjects);

    return (
        <div className="subject-grid-container">


            {/* Academic Period Filters */}
            <div className="academic-filters">
                <div className="filter-group">
                    <label htmlFor="year-select">Академска година:</label>
                    <select
                        id="year-select"
                        value={selectedAcademicYear}
                        onChange={(e) => setSelectedAcademicYear(e.target.value)}
                        className="filter-dropdown"
                    >
                        <option value="all">Сите години</option>
                        <option value="2022/2023">2022/2023</option>
                        <option value="2023/2024">2023/2024</option>
                        <option value="2024/2025">2024/2025</option>
                        <option value="2025/2026">2025/2026</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="semester-type-select">Тип семестар:</label>
                    <select
                        id="semester-type-select"
                        value={selectedSemesterType}
                        onChange={(e) => setSelectedSemesterType(e.target.value)}
                        className="filter-dropdown"
                    >
                        <option value="all">Сите семестри</option>
                        <option value="winter">Зимски семестар</option>
                        <option value="summer">Летен семестар</option>
                    </select>
                </div>
            </div>

            <div className="subject-grid">
                {currentSubjects.map((subject) => (
                    <div
                        key={subject.id}
                        className="subject-card"
                        onClick={() => {
                            addSubjectToHistory(subject);
                            console.log('📚 Subject clicked:', subject.name);
                            
                            // Navigate based on current page
                            console.log('Current pathname:', location.pathname);
                            if (location.pathname.startsWith('/exams')) {
                                console.log('Navigating to exam page for subject:', subject.id);
                                navigate(`/exams/${subject.id}`);
                            } else if (location.pathname.startsWith('/courses')) {
                                console.log('Navigating to course page for subject:', subject.id);
                                navigate(`/courses/${subject.id}`);
                            } else {
                                // Default navigation for other pages (like home)
                                console.log('Default navigation to course page for subject:', subject.id);
                                navigate(`/courses/${subject.id}`);
                            }
                        }}
                    >
                        <div className="subject-logo">
                            <img
                                src="/assets/icons/finki_subject_logo.svg"
                                alt="Subject Logo"
                                className="logo-image"
                            />
                        </div>
                        <div className="subject-name">{subject.name}</div>
                        {subject.semesterType && subject.academicYear && (
                            <div className="subject-semester">
                                {subject.semesterType === 'winter' ? 'Зимски' : 'Летен'} семестар {subject.academicYear}
                            </div>
                        )}
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
            </div>
        </div>
    );
}

export default SubjectGrid;