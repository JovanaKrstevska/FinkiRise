import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// User Management
export const createUserProfile = async (userId, userData) => {
    try {
        await setDoc(doc(db, 'users', userId), {
            ...userData,
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating user profile:', error);
        return { success: false, error: error.message };
    }
};

export const getUserProfile = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Error getting user profile:', error);
        return { success: false, error: error.message };
    }
};

// Subject Management
export const createSubject = async (subjectData) => {
    try {
        const docRef = await addDoc(collection(db, 'subjects'), {
            ...subjectData,
            createdAt: serverTimestamp(),
            // Use provided enrolledStudents or default to random number
            enrolledStudents: subjectData.enrolledStudents !== undefined 
                ? subjectData.enrolledStudents 
                : Math.floor(Math.random() * 50) + 15,
            assignmentCount: 0
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating subject:', error);
        return { success: false, error: error.message };
    }
};

export const getSubjectsByProfessor = async (professorId) => {
    try {
        console.log('🔍 Database: Getting subjects for professor:', professorId);
        const q = query(
            collection(db, 'subjects'),
            where('professorId', '==', professorId)
        );
        console.log('📡 Database: Executing query...');
        const querySnapshot = await getDocs(q);
        console.log('📊 Database: Query completed, docs found:', querySnapshot.size);

        const subjects = [];
        querySnapshot.forEach((doc) => {
            const subjectData = { id: doc.id, ...doc.data() };
            subjects.push(subjectData);
            console.log('📄 Database: Found subject:', subjectData);
        });

        // Sort by name instead (client-side sorting)
        subjects.sort((a, b) => a.name.localeCompare(b.name));

        console.log('✅ Database: Returning subjects:', subjects);
        return { success: true, data: subjects };
    } catch (error) {
        console.error('❌ Database: Error getting subjects:', error);
        return { success: false, error: error.message };
    }
};

export const getSubjectsByStudent = async (studentId) => {
    try {
        console.log('🔍 Database: Getting subjects for student:', studentId);
        const q = query(
            collection(db, 'subjects'),
            where('enrolledStudents', 'array-contains', studentId)
        );
        const querySnapshot = await getDocs(q);
        const subjects = [];
        querySnapshot.forEach((doc) => {
            subjects.push({ id: doc.id, ...doc.data() });
        });
        console.log('✅ Database: Found enrolled subjects:', subjects.length);
        return { success: true, data: subjects };
    } catch (error) {
        console.error('❌ Database: Error getting enrolled subjects:', error);
        return { success: false, error: error.message };
    }
};

// Get all subjects from Firebase (for students to browse all available subjects)
export const getAllSubjects = async () => {
    try {
        console.log('🔍 Database: Getting all subjects...');
        const querySnapshot = await getDocs(collection(db, 'subjects'));
        const subjects = [];
        querySnapshot.forEach((doc) => {
            const subjectData = { id: doc.id, ...doc.data() };
            subjects.push(subjectData);
            console.log('📄 Database: Found subject:', {
                name: subjectData.name,
                academicYear: subjectData.academicYear,
                semesterType: subjectData.semesterType,
                allFields: Object.keys(subjectData)
            });
        });

        // Show summary of what we found
        console.log('📊 Database Summary:');
        console.log('  Total subjects:', subjects.length);
        console.log('  Academic years found:', [...new Set(subjects.map(s => s.academicYear))]);
        console.log('  Semester types found:', [...new Set(subjects.map(s => s.semesterType))]);

        // Sort by semester, then by name
        subjects.sort((a, b) => {
            if (a.semester !== b.semester) {
                return (a.semester || 0) - (b.semester || 0);
            }
            return a.name.localeCompare(b.name);
        });

        console.log('✅ Database: Returning all subjects:', subjects.length);
        return { success: true, data: subjects };
    } catch (error) {
        console.error('❌ Database: Error getting all subjects:', error);
        return { success: false, error: error.message };
    }
};

// Get subjects by semester
export const getSubjectsBySemester = async (semester) => {
    try {
        console.log('🔍 Database: Getting subjects for semester:', semester);
        const q = query(
            collection(db, 'subjects'),
            where('semester', '==', semester)
        );
        const querySnapshot = await getDocs(q);
        const subjects = [];
        querySnapshot.forEach((doc) => {
            subjects.push({ id: doc.id, ...doc.data() });
        });

        // Sort by name
        subjects.sort((a, b) => a.name.localeCompare(b.name));

        console.log('✅ Database: Found subjects for semester:', subjects.length);
        return { success: true, data: subjects };
    } catch (error) {
        console.error('❌ Database: Error getting subjects by semester:', error);
        return { success: false, error: error.message };
    }
};

// Get subjects by academic year and semester type (client-side filtering to avoid index issues)
export const getSubjectsByAcademicPeriod = async (academicYear, semesterType) => {
    try {
        console.log('🔍 Database: Getting subjects for:', academicYear, semesterType);

        // Get all subjects first, then filter client-side to avoid Firestore index issues
        const allSubjectsResult = await getAllSubjects();

        if (!allSubjectsResult.success) {
            return allSubjectsResult;
        }

        let subjects = allSubjectsResult.data;

        // Apply filters client-side
        if (academicYear) {
            subjects = subjects.filter(subject => subject.academicYear === academicYear);
            console.log('📊 After academic year filter:', subjects.length);
            console.log('📋 Subjects after year filter:', subjects.map(s => ({
                name: s.name,
                academicYear: s.academicYear,
                semesterType: s.semesterType
            })));
        }

        if (semesterType) {
            console.log('🔍 Filtering by semesterType:', semesterType, typeof semesterType);
            console.log('📋 Available semesterTypes:', subjects.map(s => ({ name: s.name, type: s.semesterType, typeOf: typeof s.semesterType })));

            // Check for subjects missing semesterType
            const subjectsWithoutType = subjects.filter(s => !s.semesterType || s.semesterType === 'undefined');
            if (subjectsWithoutType.length > 0) {
                console.warn('⚠️ Subjects missing semesterType:', subjectsWithoutType.map(s => s.name));
            }

            console.log('🔍 Exact comparison check:');
            subjects.forEach(s => {
                const matches = s.semesterType === semesterType;
                console.log(`  "${s.name}": "${s.semesterType}" === "${semesterType}" = ${matches}`);
            });

            subjects = subjects.filter(subject => subject.semesterType === semesterType);
            console.log('📊 After semester type filter:', subjects.length);
        }

        // Sort by study year, then semester, then name
        subjects.sort((a, b) => {
            if (a.studyYear !== b.studyYear) {
                return (a.studyYear || 0) - (b.studyYear || 0);
            }
            if (a.semester !== b.semester) {
                return (a.semester || 0) - (b.semester || 0);
            }
            return a.name.localeCompare(b.name);
        });

        console.log('✅ Database: Found subjects for academic period:', subjects.length);
        return { success: true, data: subjects };
    } catch (error) {
        console.error('❌ Database: Error getting subjects by academic period:', error);
        return { success: false, error: error.message };
    }
};

export const enrollStudentInSubject = async (subjectId, studentId) => {
    try {
        const subjectRef = doc(db, 'subjects', subjectId);
        const subjectDoc = await getDoc(subjectRef);

        if (subjectDoc.exists()) {
            const currentStudents = subjectDoc.data().enrolledStudents || [];
            if (!currentStudents.includes(studentId)) {
                await updateDoc(subjectRef, {
                    enrolledStudents: [...currentStudents, studentId]
                });
            }
        }
        return { success: true };
    } catch (error) {
        console.error('Error enrolling student:', error);
        return { success: false, error: error.message };
    }
};

// Assignment Management
export const createAssignment = async (assignmentData) => {
    try {
        const docRef = await addDoc(collection(db, 'assignments'), {
            ...assignmentData,
            createdAt: serverTimestamp(),
            submissions: []
        });

        // Update assignment count in subject
        const subjectRef = doc(db, 'subjects', assignmentData.subjectId);
        const subjectDoc = await getDoc(subjectRef);
        if (subjectDoc.exists()) {
            const currentCount = subjectDoc.data().assignmentCount || 0;
            await updateDoc(subjectRef, {
                assignmentCount: currentCount + 1
            });
        }

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating assignment:', error);
        return { success: false, error: error.message };
    }
};

export const getAssignmentsBySubject = async (subjectId) => {
    try {
        const q = query(
            collection(db, 'assignments'),
            where('subjectId', '==', subjectId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const assignments = [];
        querySnapshot.forEach((doc) => {
            assignments.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: assignments };
    } catch (error) {
        console.error('Error getting assignments:', error);
        return { success: false, error: error.message };
    }
};

// Clear old subjects and create new ones with proper structure
export const clearAndInitializeSampleData = async (professorId) => {
    try {
        console.log('🧹 Database: Clearing old subjects and creating new ones...');

        // First, get all existing subjects by this professor
        const existingResult = await getSubjectsByProfessor(professorId);
        if (existingResult.success && existingResult.data.length > 0) {
            console.log('🗑️ Database: Deleting', existingResult.data.length, 'old subjects...');
            for (const subject of existingResult.data) {
                await deleteDoc(doc(db, 'subjects', subject.id));
                console.log('🗑️ Deleted:', subject.name);
            }
        }

        // Now create new subjects with proper structure
        return await initializeSampleData(professorId);
    } catch (error) {
        console.error('❌ Database: Error clearing and initializing:', error);
        return { success: false, error: error.message };
    }
};

// Initialize sample data (run once)
export const initializeSampleData = async (professorId) => {
    try {
        console.log('🔧 Database: Initializing sample data for professor:', professorId);
        const sampleSubjects = [
            // Year 1 - Winter Semester 2024/2025
            { name: 'Математика 1', code: 'MAT1', professorId, semester: 1, studyYear: 1, semesterType: 'winter', academicYear: '2024/2025' },
            { name: 'Програмирање 1', code: 'PROG1', professorId, semester: 1, studyYear: 1, semesterType: 'winter', academicYear: '2024/2025' },
            { name: 'Дискретна математика', code: 'DM', professorId, semester: 1, studyYear: 1, semesterType: 'winter', academicYear: '2024/2025' },

            // Year 1 - Summer Semester 2024/2025
            { name: 'Математика 2', code: 'MAT2', professorId, semester: 2, studyYear: 1, semesterType: 'summer', academicYear: '2024/2025' },
            { name: 'Програмирање 2', code: 'PROG2', professorId, semester: 2, studyYear: 1, semesterType: 'summer', academicYear: '2024/2025' },
            { name: 'Структури на податоци', code: 'DS', professorId, semester: 2, studyYear: 1, semesterType: 'summer', academicYear: '2024/2025' },

            // Year 2 - Winter Semester 2025/2026
            { name: 'Алгоритми и структури', code: 'AS', professorId, semester: 3, studyYear: 2, semesterType: 'winter', academicYear: '2025/2026' },
            { name: 'Бази на податоци', code: 'DB', professorId, semester: 3, studyYear: 2, semesterType: 'winter', academicYear: '2025/2026' },
            { name: 'Оперативни системи', code: 'OS', professorId, semester: 3, studyYear: 2, semesterType: 'winter', academicYear: '2025/2026' },

            // Year 2 - Summer Semester 2025/2026
            { name: 'Веб програмирање', code: 'WP', professorId, semester: 4, studyYear: 2, semesterType: 'summer', academicYear: '2025/2026' },
            { name: 'Софтверско инженерство', code: 'SE', professorId, semester: 4, studyYear: 2, semesterType: 'summer', academicYear: '2025/2026' },
            { name: 'Компјутерски мрежи', code: 'CN', professorId, semester: 4, studyYear: 2, semesterType: 'summer', academicYear: '2025/2026' },

            // Year 3 - Winter Semester 2026/2027
            { name: 'Мобилни апликации', code: 'MA', professorId, semester: 5, studyYear: 3, semesterType: 'winter', academicYear: '2026/2027' },
            { name: 'Машинско учење', code: 'ML', professorId, semester: 5, studyYear: 3, semesterType: 'winter', academicYear: '2026/2027' },
            { name: 'Вештачка интелигенција', code: 'AI', professorId, semester: 5, studyYear: 3, semesterType: 'winter', academicYear: '2026/2027' },

            // Year 3 - Summer Semester 2026/2027
            { name: 'Дипломска работа', code: 'THESIS', professorId, semester: 6, studyYear: 3, semesterType: 'summer', academicYear: '2026/2027' },
            { name: 'Напредни веб технологии', code: 'AWT', professorId, semester: 6, studyYear: 3, semesterType: 'summer', academicYear: '2026/2027' },
            { name: 'Кибер безбедност', code: 'CS', professorId, semester: 6, studyYear: 3, semesterType: 'summer', academicYear: '2026/2027' }
        ];

        console.log('📝 Database: Creating subjects:', sampleSubjects.length);
        for (const subject of sampleSubjects) {
            console.log('➕ Database: Creating subject:', subject.name, `(${subject.semesterType === 'winter' ? 'Зимски' : 'Летен'} семестар ${subject.academicYear})`);
            const result = await createSubject(subject);
            console.log('✅ Database: Subject created:', result);
        }

        console.log('🎉 Database: Sample data initialization complete');
        return { success: true };
    } catch (error) {
        console.error('❌ Database: Error initializing sample data:', error);
        return { success: false, error: error.message };
    }
};