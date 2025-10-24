import './TutorialLayout.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllTutorials, getTutorialsByUser, createTutorial } from '../../../services/databaseService';
import TutorialCard from '../../widgets/TutorialCard/TutorialCard';
import TutorialModal from '../../modals/TutorialModal/TutorialModal';

function TutorialLayout() {
    const [currentPage, setCurrentPage] = useState(0);
    const [allTutorials, setAllTutorials] = useState([]);
    const [myTutorials, setMyTutorials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTutorial, setEditingTutorial] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchTutorials();
    }, [currentUser]);

    const fetchTutorials = async () => {
        try {
            setLoading(true);

            // Fetch all public tutorials
            const allTutorialsResult = await getAllTutorials();
            if (allTutorialsResult.success) {
                // Shuffle tutorials for random display
                const shuffledTutorials = [...allTutorialsResult.data].sort(() => Math.random() - 0.5);
                setAllTutorials(shuffledTutorials);
            }

            // Fetch user's tutorials if logged in
            if (currentUser) {
                const userTutorialsResult = await getTutorialsByUser(currentUser.uid);
                if (userTutorialsResult.success) {
                    setMyTutorials(userTutorialsResult.data);
                }
            }
        } catch (err) {
            setError('Error fetching tutorials');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter tutorials based on search term
    const filteredTutorials = allTutorials.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tutorialsPerPage = 10; // 2 rows × 5 columns
    const totalPages = Math.ceil(filteredTutorials.length / tutorialsPerPage);

    const getCurrentTutorials = () => {
        const startIndex = currentPage * tutorialsPerPage;
        return filteredTutorials.slice(startIndex, startIndex + tutorialsPerPage);
    };

    // Reset to first page when search term changes
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(0);
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    };

    const handleTutorialClick = (tutorial) => {
        console.log('Tutorial clicked:', tutorial.title);
        // Open YouTube video in new tab for all tutorials
        if (tutorial.youtubeUrl) {
            window.open(tutorial.youtubeUrl, '_blank');
        }
    };

    const handleCreateNew = () => {
        if (!currentUser) {
            alert('Ве молиме најавете се за да креирате туторијал');
            return;
        }
        setEditingTutorial(null);
        setShowModal(true);
    };

    const handleSaveTutorial = async (tutorialData) => {
        try {
            const newTutorial = {
                ...tutorialData,
                createdBy: currentUser.uid,
                isPublic: false
            };

            const result = await createTutorial(newTutorial);
            if (result.success) {
                alert('Туторијалот е успешно креиран!');
                fetchTutorials(); // Refresh tutorials
            } else {
                alert(`Грешка при креирање: ${result.error}`);
            }
        } catch (error) {
            console.error('Error creating tutorial:', error);
            alert('Грешка при креирање на туторијалот');
        }
    };



    if (loading) {
        return (
            <div className="tutorial-layout">
                <div className="tutorial-container">
                    <div className="loading-message">Loading tutorials...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tutorial-layout">
                <div className="tutorial-container">
                    <div className="error-message">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="tutorial-layout">
            <div className="tutorial-container">
                {/* Search input */}
                <div className="search-section">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Побарај туторијал..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                {/* Main tutorials grid */}
                <div className="tutorials-grid">
                    {getCurrentTutorials().map((tutorial) => (
                        <TutorialCard
                            key={tutorial.id}
                            title={tutorial.title}
                            image={tutorial.thumbnail}
                            onClick={() => handleTutorialClick(tutorial)}
                        />
                    ))}
                </div>

                {/* Navigation arrows */}
                <div className="navigation-arrows">
                    <button
                        className="nav-arrow nav-arrow-left"
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                    >
                        ◀
                    </button>

                    <div className="page-numbers">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = index;
                            } else if (currentPage < 3) {
                                pageNum = index;
                            } else if (currentPage >= totalPages - 3) {
                                pageNum = totalPages - 5 + index;
                            } else {
                                pageNum = currentPage - 2 + index;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum + 1}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        className="nav-arrow nav-arrow-right"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages - 1}
                    >
                        ▶
                    </button>
                </div>

                {/* My tutorials section */}
                <div className="my-tutorials-section">
                    <h2 className="my-tutorials-title">Мои туторијали</h2>
                    <div className="my-tutorials-grid">
                        {myTutorials
                            .filter(tutorial => tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((tutorial) => (
                                <TutorialCard
                                    key={tutorial.id}
                                    title={tutorial.title}
                                    image={tutorial.thumbnail}
                                    onClick={() => handleTutorialClick(tutorial)}
                                />
                            ))}
                        {/* Create new tutorial card */}
                        <div className="create-new-card" onClick={handleCreateNew}>
                            <div className="create-new-content">
                                <span className="create-new-icon">+</span>
                                <span className="create-new-text">Креирај ново</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tutorial Modal */}
                <TutorialModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveTutorial}
                    tutorial={editingTutorial}
                />
            </div>
        </div>
    );
}

export default TutorialLayout;