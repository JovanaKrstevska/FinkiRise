import { useState, useEffect } from 'react';
import { getAllTutorials } from '../../../services/databaseService';
import './TutorialsList.css';

function TutorialsList() {
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const tutorialsPerSlide = 3;

    useEffect(() => {
        loadTutorials();
    }, []);

    const loadTutorials = async () => {
        try {
            setLoading(true);
            const result = await getAllTutorials();
            
            if (result.success) {
                setTutorials(result.data);
            } else {
                console.error('Error loading tutorials:', result.error);
            }
        } catch (error) {
            console.error('Error loading tutorials:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        const maxSlide = Math.ceil(tutorials.length / tutorialsPerSlide) - 1;
        setCurrentSlide(prev => prev < maxSlide ? prev + 1 : 0);
    };

    const prevSlide = () => {
        const maxSlide = Math.ceil(tutorials.length / tutorialsPerSlide) - 1;
        setCurrentSlide(prev => prev > 0 ? prev - 1 : maxSlide);
    };

    const formatDuration = (duration) => {
        if (!duration) return '';
        return ` • ${duration}`;
    };

    if (loading) {
        return (
            <div className="tutorials-list-widget">
                <div className="tutorials-header">
                    <h3 className="tutorials-title">Твои Туторијали:</h3>
                </div>
                <div className="tutorials-loading">
                    Се вчитуваат туторијалите...
                </div>
            </div>
        );
    }

    return (
        <div className="tutorials-list-widget">
            <div className="tutorials-header">
                <h3 className="tutorials-title">Твои Туторијали:</h3>
                {tutorials.length > tutorialsPerSlide && (
                    <div className="tutorials-navigation">
                        <button onClick={prevSlide} className="tutorial-nav-btn tutorial-prev">
                            ◀
                        </button>
                        <button onClick={nextSlide} className="tutorial-nav-btn tutorial-next">
                            ▶
                        </button>
                    </div>
                )}
            </div>
            
            <div className="tutorials-slider">
                <ul className="tutorials-list" style={{
                    transform: `translateY(-${currentSlide * (tutorialsPerSlide * 60)}px)`
                }}>
                    {tutorials.length > 0 ? (
                        tutorials.map((tutorial) => (
                            <li key={tutorial.id} className="tutorial-item">
                                <div className="tutorial-info">
                                    <h4 className="tutorial-name">{tutorial.title}</h4>
                                    <p className="tutorial-details">
                                        {tutorial.category}{formatDuration(tutorial.duration)}
                                    </p>
                                </div>
                                {tutorial.youtubeUrl && (
                                    <a 
                                        href={tutorial.youtubeUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="tutorial-link"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        ▶
                                    </a>
                                )}
                            </li>
                        ))
                    ) : (
                        Array.from({ length: 6 }, (_, index) => (
                            <li key={index} className="tutorial-item">
                                <div className="tutorial-info">
                                    <h4 className="tutorial-name">Име на Туторијалот</h4>
                                    <p className="tutorial-details">Категорија • Времетраење</p>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}

export default TutorialsList;