import { createContext, useContext, useState, useEffect } from 'react';

const SubjectHistoryContext = createContext();

export const useSubjectHistory = () => {
    const context = useContext(SubjectHistoryContext);
    if (!context) {
        throw new Error('useSubjectHistory must be used within a SubjectHistoryProvider');
    }
    return context;
};

export const SubjectHistoryProvider = ({ children }) => {
    const [recentSubjects, setRecentSubjects] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('recentSubjects');
        if (saved) {
            try {
                setRecentSubjects(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading recent subjects:', error);
            }
        }
    }, []);

    // Save to localStorage whenever recentSubjects changes
    useEffect(() => {
        localStorage.setItem('recentSubjects', JSON.stringify(recentSubjects));
    }, [recentSubjects]);

    const addSubjectToHistory = (subject) => {
        setRecentSubjects(prev => {
            // Remove if already exists
            const filtered = prev.filter(s => s.id !== subject.id);
            
            // Add to beginning with timestamp
            const newSubject = {
                ...subject,
                accessedAt: new Date().toISOString()
            };
            
            // Keep only last 10 subjects
            return [newSubject, ...filtered].slice(0, 10);
        });
    };

    const clearHistory = () => {
        setRecentSubjects([]);
    };

    return (
        <SubjectHistoryContext.Provider value={{
            recentSubjects,
            addSubjectToHistory,
            clearHistory
        }}>
            {children}
        </SubjectHistoryContext.Provider>
    );
};