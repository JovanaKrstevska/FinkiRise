import React, { useState, useEffect } from 'react';
import './ProfessorSubjectGrid.css';
import Button from '../../ui/Button/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { getSubjectsByProfessor, clearAndInitializeSampleData } from '../../../services/databaseService';

function ProfessorSubjectGrid() {
    const [currentPage, setCurrentPage] = useState(1);
    const [professorSubjects, setProfessorSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const itemsPerPage = 6;

    useEffect(() => {
        const loadSubjects = async () => {
            if (currentUser) {
                console.log('🔍 Loading subjects for professor:', currentUser.uid);
                setLoading(true);
                try {
                    console.log('📡 Calling getSubjectsByProfessor...');
                    const result = await getSubjectsByProfessor(currentUser.uid);
                    console.log('📊 getSubjectsByProfessor result:', result);

                    if (result.success) {
                        console.log('✅ Success! Found subjects:', result.data.length);
                        if (result.data.length === 0) {
                            console.log('🔧 No subjects found, initializing sample data...');
                            // Initialize sample data if no subjects exist
                            try {
                                const initResult = await clearAndInitializeSampleData(currentUser.uid);
                                console.log('🔧 Initialize sample data result:', initResult);
                                
                                const newResult = await getSubjectsByProfessor(currentUser.uid);
                                console.log('📊 After initialization, subjects:', newResult);
                                
                                if (newResult.success) {
                                    setProfessorSubjects(newResult.data);
                                    console.log('✅ Set subjects from database:', newResult.data);
                                }
                            } catch (initError) {
                                console.warn('❌ Could not initialize sample data:', initError);
                                // Use fallback mock data
                                const fallbackData = [
                                    { id: '1', name: 'Веб програмирање', enrolledStudents: [], assignmentCount: 0 },
                                    { id: '2', name: 'Бази на податоци', enrolledStudents: [], assignmentCount: 0 },
                                    { id: '3', name: 'Софтверско инженерство', enrolledStudents: [], assignmentCount: 0 }
                                ];
                                setProfessorSubjects(fallbackData);
                                console.log('🔄 Using fallback data:', fallbackData);
                            }
                        } else {
                            setProfessorSubjects(result.data);
                            console.log('✅ Set subjects from database:', result.data);
                        }
                    } else {
                        console.error('❌ Error loading subjects:', result.error);
                        // Use fallback mock data
                        const fallbackData = [
                            { id: '1', name: 'Веб програмирање', enrolledStudents: [], assignmentCount: 0 },
                            { id: '2', name: 'Бази на податоци', enrolledStudents: [], assignmentCount: 0 },
                            { id: '3', name: 'Софтверско инженерство', enrolledStudents: [], assignmentCount: 0 }
                        ];
                        setProfessorSubjects(fallbackData);
                        console.log('🔄 Using fallback data due to error:', fallbackData);
                    }
                } catch (error) {
                    console.error('💥 Database connection failed:', error);
                    // Use fallback mock data
                    const fallbackData = [
                        { id: '1', name: 'Веб програмирање', enrolledStudents: [], assignmentCount: 0 },
                        { id: '2', name: 'Бази на податоци', enrolledStudents: [], assignmentCount: 0 },
                        { id: '3', name: 'Софтверско инженерство', enrolledStudents: [], assignmentCount: 0 }
                    ];
                    setProfessorSubjects(fallbackData);
                    console.log('🔄 Using fallback data due to exception:', fallbackData);
                }
                setLoading(false);
                console.log('🏁 Loading complete');
            } else {
                console.log('❌ No current user found');
            }
        };

        loadSubjects();
    }, [currentUser]);

    const totalPages = Math.ceil(professorSubjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSubjects = professorSubjects.slice(startIndex, startIndex + itemsPerPage);

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
            <div className="professor-subject-grid-container">
                <div className="loading-message">Се вчитуваат предметите...</div>
            </div>
        );
    }

    return (
        <div className="professor-subject-grid-container">
            <div className="professor-subject-grid">
                {currentSubjects.map((subject) => (
                    <div key={subject.id} className="professor-subject-card">
                        <div className="subject-logo">
                            <img
                                src="/assets/icons/finki_subject_logo.svg"
                                alt="Subject Logo"
                                className="logo-image"
                            />
                        </div>
                        <div className="subject-name">{subject.name}</div>
                        <div className="professor-subject-stats">
                            <div className="stat-item">
                                <span className="stat-number">{subject.enrolledStudents?.length || 0}</span>
                                <span className="stat-label">студенти</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{subject.assignmentCount || 0}</span>
                                <span className="stat-label">задачи</span>
                            </div>
                        </div>
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

export default ProfessorSubjectGrid;