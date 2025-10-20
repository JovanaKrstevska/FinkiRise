import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

// Function to completely reset subjects with proper structure
export const resetSubjectsDatabase = async (professorId) => {
    try {
        console.log('🧹 RESET: Starting complete database reset...');
        
        // 1. Delete ALL existing subjects
        const allSubjectsSnapshot = await getDocs(collection(db, 'subjects'));
        console.log('🗑️ RESET: Found', allSubjectsSnapshot.size, 'subjects to delete...');
        
        for (const docSnapshot of allSubjectsSnapshot.docs) {
            await deleteDoc(docSnapshot.ref);
            console.log('🗑️ RESET: Deleted:', docSnapshot.data().name);
        }
        
        console.log('✅ RESET: All subjects deleted');
        
        // 2. Create new subjects with CORRECT structure
        const newSubjects = [
            // 2024/2025 Winter
            { name: 'Математика 1', code: 'MAT1', professorId, semester: 1, studyYear: 1, semesterType: 'winter', academicYear: '2024/2025' },
            { name: 'Програмирање 1', code: 'PROG1', professorId, semester: 1, studyYear: 1, semesterType: 'winter', academicYear: '2024/2025' },
            { name: 'Дискретна математика', code: 'DM', professorId, semester: 1, studyYear: 1, semesterType: 'winter', academicYear: '2024/2025' },
            
            // 2024/2025 Summer
            { name: 'Математика 2', code: 'MAT2', professorId, semester: 2, studyYear: 1, semesterType: 'summer', academicYear: '2024/2025' },
            { name: 'Програмирање 2', code: 'PROG2', professorId, semester: 2, studyYear: 1, semesterType: 'summer', academicYear: '2024/2025' },
            { name: 'Структури на податоци', code: 'DS', professorId, semester: 2, studyYear: 1, semesterType: 'summer', academicYear: '2024/2025' },
            
            // 2025/2026 Winter
            { name: 'Алгоритми и структури', code: 'AS', professorId, semester: 3, studyYear: 2, semesterType: 'winter', academicYear: '2025/2026' },
            { name: 'Бази на податоци', code: 'DB', professorId, semester: 3, studyYear: 2, semesterType: 'winter', academicYear: '2025/2026' },
            { name: 'Оперативни системи', code: 'OS', professorId, semester: 3, studyYear: 2, semesterType: 'winter', academicYear: '2025/2026' },
            
            // 2025/2026 Summer
            { name: 'Веб програмирање', code: 'WP', professorId, semester: 4, studyYear: 2, semesterType: 'summer', academicYear: '2025/2026' },
            { name: 'Софтверско инженерство', code: 'SE', professorId, semester: 4, studyYear: 2, semesterType: 'summer', academicYear: '2025/2026' },
            { name: 'Компјутерски мрежи', code: 'CN', professorId, semester: 4, studyYear: 2, semesterType: 'summer', academicYear: '2025/2026' }
        ];
        
        console.log('➕ RESET: Creating', newSubjects.length, 'new subjects...');
        
        for (const subject of newSubjects) {
            const docRef = await addDoc(collection(db, 'subjects'), {
                ...subject,
                createdAt: serverTimestamp(),
                enrolledStudents: [],
                assignmentCount: 0
            });
            console.log('✅ RESET: Created:', subject.name, 'with semesterType:', subject.semesterType);
        }
        
        console.log('🎉 RESET: Database reset complete!');
        return { success: true, message: 'Database reset successfully' };
        
    } catch (error) {
        console.error('❌ RESET: Error:', error);
        return { success: false, error: error.message };
    }
};

// Make it available globally for console use
window.resetSubjectsDatabase = resetSubjectsDatabase;