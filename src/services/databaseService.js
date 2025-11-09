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
import { 
    ref, 
    uploadBytes, 
    getDownloadURL
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

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

// Profile Image Management
export const uploadProfileImage = async (userId, imageFile) => {
    try {
        // Create a reference to the profile image
        const imageRef = ref(storage, `profile-images/${userId}/${Date.now()}_${imageFile.name}`);
        
        // Upload the file
        const snapshot = await uploadBytes(imageRef, imageFile);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return { success: true, url: downloadURL };
    } catch (error) {
        console.error('Error uploading profile image:', error);
        return { success: false, error: error.message };
    }
};

// CV File Management
export const uploadCvFile = async (userId, cvFile) => {
    try {
        // Create a reference to the CV file
        const cvRef = ref(storage, `cv-files/${userId}/${Date.now()}_${cvFile.name}`);
        
        // Upload the file
        const snapshot = await uploadBytes(cvRef, cvFile);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return { 
            success: true, 
            url: downloadURL,
            fileName: cvFile.name
        };
    } catch (error) {
        console.error('Error uploading CV file:', error);
        return { success: false, error: error.message };
    }
};

// Update User Profile Data
export const updateUserProfile = async (userId, profileData) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...profileData,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: error.message };
    }
};

// Create or Update Complete Profile (with image)
export const saveCompleteProfile = async (userId, profileData, imageFile = null) => {
    try {
        let imageUrl = profileData.profileImage || null;
        
        // Upload image if provided
        if (imageFile) {
            const imageResult = await uploadProfileImage(userId, imageFile);
            if (imageResult.success) {
                imageUrl = imageResult.url;
            } else {
                return { success: false, error: 'Failed to upload image' };
            }
        }
        
        // Prepare profile data
        const completeProfileData = {
            ...profileData,
            profileImage: imageUrl,
            updatedAt: serverTimestamp()
        };
        
        // Check if profile exists
        const existingProfile = await getUserProfile(userId);
        
        if (existingProfile.success) {
            // Update existing profile
            await updateDoc(doc(db, 'users', userId), completeProfileData);
        } else {
            // Create new profile
            await setDoc(doc(db, 'users', userId), {
                ...completeProfileData,
                createdAt: serverTimestamp()
            });
        }
        
        return { success: true, data: completeProfileData };
    } catch (error) {
        console.error('Error saving complete profile:', error);
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

// Lab Management
export const createLab = async (labData) => {
    try {
        const docRef = await addDoc(collection(db, 'labs'), {
            ...labData,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating lab:', error);
        return { success: false, error: error.message };
    }
};

export const getLabBySubject = async (subjectId) => {
    try {
        console.log('🔍 Database: Getting lab for subject:', subjectId);
        const q = query(
            collection(db, 'labs'),
            where('subjectId', '==', subjectId)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log('📄 Database: No lab found for subject, creating default lab...');
            // Create a default lab if none exists
            const defaultLab = await createDefaultLab(subjectId);
            return defaultLab;
        }

        let lab = null;
        querySnapshot.forEach((doc) => {
            lab = { id: doc.id, ...doc.data() };
        });

        console.log('✅ Database: Found lab:', lab);
        return { success: true, data: lab };
    } catch (error) {
        console.error('❌ Database: Error getting lab:', error);
        return { success: false, error: error.message };
    }
};

// Get lab by its specific ID (no creation)
export const getLabById = async (labId) => {
    try {
        console.log('🔍 Database: Getting lab by ID:', labId);
        const docRef = doc(db, 'labs', labId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const lab = { id: docSnap.id, ...docSnap.data() };
            console.log('✅ Database: Found lab by ID:', lab);
            return { success: true, data: lab };
        } else {
            console.log('❌ Database: No lab found with ID:', labId);
            return { success: false, error: 'Lab not found' };
        }
    } catch (error) {
        console.error('❌ Database: Error getting lab by ID:', error);
        return { success: false, error: error.message };
    }
};

export const createDefaultLab = async (subjectId) => {
    try {
        const defaultLabData = {
            subjectId,
            title: "Лабораториска вежба 1",
            timeLimit: 60, // minutes
            maxAttempts: 1,
            questions: [
                {
                    id: 1,
                    type: 'multiple-choice',
                    question: 'Што е HTML?',
                    options: [
                        'Hypertext Markup Language',
                        'High Tech Modern Language',
                        'Home Tool Markup Language',
                        'Hyperlink and Text Markup Language'
                    ],
                    correctAnswer: 0,
                    points: 5
                },
                {
                    id: 2,
                    type: 'multiple-choice',
                    question: 'Кој од следниве е валиден CSS селектор?',
                    options: [
                        '.class-name',
                        '#id-name',
                        'element-name',
                        'Сите од горните'
                    ],
                    correctAnswer: 3,
                    points: 5
                },
                {
                    id: 3,
                    type: 'coding',
                    question: 'Напишете JavaScript функција која ги собира два броја:',
                    placeholder: 'function addNumbers(a, b) {\n    // Вашиот код овде\n    return a + b;\n}',
                    points: 10
                },
                {
                    id: 4,
                    type: 'file-upload',
                    question: 'Прикачете ја вашата HTML страница за проектот:',
                    acceptedTypes: '.html,.htm,.zip',
                    points: 10
                }
            ]
        };

        const result = await createLab(defaultLabData);
        if (result.success) {
            return { success: true, data: { id: result.id, ...defaultLabData } };
        }
        return result;
    } catch (error) {
        console.error('❌ Database: Error creating default lab:', error);
        return { success: false, error: error.message };
    }
};

export const getLabsByProfessor = async (professorId) => {
    try {
        console.log('🔍 Database: Getting labs for professor:', professorId);
        const q = query(
            collection(db, 'labs'),
            where('professorId', '==', professorId)
        );
        const querySnapshot = await getDocs(q);
        const labs = [];
        querySnapshot.forEach((doc) => {
            labs.push({ id: doc.id, ...doc.data() });
        });
        console.log('✅ Database: Found labs:', labs.length);
        return { success: true, data: labs };
    } catch (error) {
        console.error('❌ Database: Error getting labs by professor:', error);
        return { success: false, error: error.message };
    }
};



// Exam Management
export const createExam = async (examData) => {
    try {
        const docRef = await addDoc(collection(db, 'exams'), {
            ...examData,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating exam:', error);
        return { success: false, error: error.message };
    }
};

export const getExamsByProfessor = async (professorId) => {
    try {
        console.log('🔍 Database: Getting exams for professor:', professorId);
        const q = query(
            collection(db, 'exams'),
            where('professorId', '==', professorId)
        );
        const querySnapshot = await getDocs(q);
        const exams = [];
        querySnapshot.forEach((doc) => {
            exams.push({ id: doc.id, ...doc.data() });
        });
        console.log('✅ Database: Found exams:', exams.length);
        return { success: true, data: exams };
    } catch (error) {
        console.error('❌ Database: Error getting exams by professor:', error);
        return { success: false, error: error.message };
    }
};

export const getExamsBySubject = async (subjectId) => {
    try {
        console.log('🔍 Database: Getting exams for subject:', subjectId);
        const q = query(
            collection(db, 'exams'),
            where('subjectId', '==', subjectId)
        );
        const querySnapshot = await getDocs(q);
        const exams = [];
        querySnapshot.forEach((doc) => {
            exams.push({ id: doc.id, ...doc.data() });
        });
        console.log('✅ Database: Found exams for subject:', exams.length);
        return { success: true, data: exams };
    } catch (error) {
        console.error('❌ Database: Error getting exams by subject:', error);
        return { success: false, error: error.message };
    }
};

export const getExamById = async (examId) => {
    try {
        console.log('🔍 Database: Getting exam by ID:', examId);
        const docRef = doc(db, 'exams', examId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const exam = { id: docSnap.id, ...docSnap.data() };
            console.log('✅ Database: Found exam by ID:', exam);
            return { success: true, data: exam };
        } else {
            console.log('❌ Database: No exam found with ID:', examId);
            return { success: false, error: 'Exam not found' };
        }
    } catch (error) {
        console.error('❌ Database: Error getting exam by ID:', error);
        return { success: false, error: error.message };
    }
};

// Exam Submissions
export const submitExam = async (submissionData) => {
    try {
        const docRef = await addDoc(collection(db, 'examSubmissions'), {
            ...submissionData,
            submittedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error submitting exam:', error);
        return { success: false, error: error.message };
    }
};

export const getExamSubmissions = async (studentId, examId) => {
    try {
        const q = query(
            collection(db, 'examSubmissions'),
            where('studentId', '==', studentId),
            where('examId', '==', examId),
            orderBy('submittedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const submissions = [];
        querySnapshot.forEach((doc) => {
            submissions.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: submissions };
    } catch (error) {
        console.error('Error getting exam submissions:', error);
        return { success: false, error: error.message };
    }
};

// Lab Submissions
export const submitLabExam = async (submissionData) => {
    try {
        const docRef = await addDoc(collection(db, 'labSubmissions'), {
            ...submissionData,
            submittedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error submitting lab exam:', error);
        return { success: false, error: error.message };
    }
};

export const getLabSubmissions = async (studentId, labId) => {
    try {
        const q = query(
            collection(db, 'labSubmissions'),
            where('studentId', '==', studentId),
            where('labId', '==', labId),
            orderBy('submittedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const submissions = [];
        querySnapshot.forEach((doc) => {
            submissions.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: submissions };
    } catch (error) {
        console.error('Error getting lab submissions:', error);
        return { success: false, error: error.message };
    }
};

// Tutorial Management
export const createTutorial = async (tutorialData) => {
    try {
        const docRef = await addDoc(collection(db, 'tutorials'), {
            ...tutorialData,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating tutorial:', error);
        return { success: false, error: error.message };
    }
};

export const getAllTutorials = async () => {
    try {
        console.log('🔍 Database: Getting all tutorials...');
        const querySnapshot = await getDocs(collection(db, 'tutorials'));
        const tutorials = [];
        querySnapshot.forEach((doc) => {
            tutorials.push({ id: doc.id, ...doc.data() });
        });
        console.log('✅ Database: Found tutorials:', tutorials.length);
        return { success: true, data: tutorials };
    } catch (error) {
        console.error('❌ Database: Error getting tutorials:', error);
        return { success: false, error: error.message };
    }
};

export const getTutorialsByUser = async (userId) => {
    try {
        console.log('🔍 Database: Getting tutorials for user:', userId);
        const q = query(
            collection(db, 'tutorials'),
            where('createdBy', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const tutorials = [];
        querySnapshot.forEach((doc) => {
            tutorials.push({ id: doc.id, ...doc.data() });
        });
        console.log('✅ Database: Found user tutorials:', tutorials.length);
        return { success: true, data: tutorials };
    } catch (error) {
        console.error('❌ Database: Error getting user tutorials:', error);
        return { success: false, error: error.message };
    }
};

// Initialize sample YouTube tutorials
export const initializeSampleTutorials = async () => {
    try {
        console.log('🎥 Database: Initializing sample YouTube tutorials...');
        
        const sampleTutorials = [
            {
                title: "JavaScript за почетници",
                description: "Научете ги основите на JavaScript програмирањето",
                youtubeUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                thumbnail: "https://img.youtube.com/vi/PkZNo7MFNFg/maxresdefault.jpg",
                category: "Programming",
                duration: "3:45:30",
                isPublic: true
            },
            {
                title: "React Tutorial за почетници",
                description: "Комплетен React курс за почетници",
                youtubeUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                thumbnail: "https://img.youtube.com/vi/Ke90Tje7VS0/maxresdefault.jpg",
                category: "Web Development",
                duration: "11:55:23",
                isPublic: true
            },
            {
                title: "Python за почетници",
                description: "Научете Python програмирање од нула",
                youtubeUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
                thumbnail: "https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg",
                category: "Programming",
                duration: "4:26:52",
                isPublic: true
            },
            {
                title: "HTML & CSS Tutorial",
                description: "Создавајте убави веб страници со HTML и CSS",
                youtubeUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc",
                thumbnail: "https://img.youtube.com/vi/mU6anWqZJcc/maxresdefault.jpg",
                category: "Web Development",
                duration: "2:04:41",
                isPublic: true
            },
            {
                title: "Node.js Tutorial",
                description: "Backend развој со Node.js",
                youtubeUrl: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
                thumbnail: "https://img.youtube.com/vi/TlB_eWDSMt4/maxresdefault.jpg",
                category: "Backend",
                duration: "3:26:15",
                isPublic: true
            },
            {
                title: "Database Design Tutorial",
                description: "Научете како да дизајнирате бази на податоци",
                youtubeUrl: "https://www.youtube.com/watch?v=ztHopE5Wnpc",
                thumbnail: "https://img.youtube.com/vi/ztHopE5Wnpc/maxresdefault.jpg",
                category: "Database",
                duration: "1:16:44",
                isPublic: true
            },
            {
                title: "Git & GitHub Tutorial",
                description: "Version control со Git и GitHub",
                youtubeUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk",
                thumbnail: "https://img.youtube.com/vi/RGOj5yH7evk/maxresdefault.jpg",
                category: "Tools",
                duration: "1:08:13",
                isPublic: true
            },
            {
                title: "Machine Learning Basics",
                description: "Вовед во машинското учење",
                youtubeUrl: "https://www.youtube.com/watch?v=ukzFI9rgwfU",
                thumbnail: "https://img.youtube.com/vi/ukzFI9rgwfU/maxresdefault.jpg",
                category: "AI/ML",
                duration: "2:25:17",
                isPublic: true
            },
            {
                title: "Mobile App Development",
                description: "Создавајте мобилни апликации",
                youtubeUrl: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
                thumbnail: "https://img.youtube.com/vi/0-S5a0eXPoc/maxresdefault.jpg",
                category: "Mobile",
                duration: "4:41:54",
                isPublic: true
            },
            {
                title: "Cybersecurity Fundamentals",
                description: "Основи на кибер безбедноста",
                youtubeUrl: "https://www.youtube.com/watch?v=U_P23SqJaDc",
                thumbnail: "https://img.youtube.com/vi/U_P23SqJaDc/maxresdefault.jpg",
                category: "Security",
                duration: "2:12:33",
                isPublic: true
            },
            {
                title: "UI/UX Design Principles",
                description: "Дизајн принципи за корисничко искуство",
                youtubeUrl: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
                thumbnail: "https://img.youtube.com/vi/c9Wg6Cb_YlU/maxresdefault.jpg",
                category: "Design",
                duration: "1:45:22",
                isPublic: true
            },
            {
                title: "Docker Tutorial",
                description: "Контејнеризација со Docker",
                youtubeUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE",
                thumbnail: "https://img.youtube.com/vi/3c-iBn73dDE/maxresdefault.jpg",
                category: "DevOps",
                duration: "2:10:45",
                isPublic: true
            }
        ];

        console.log('📝 Database: Creating tutorials:', sampleTutorials.length);
        for (const tutorial of sampleTutorials) {
            const result = await createTutorial(tutorial);
            if (result.success) {
                console.log('✅ Database: Tutorial created:', tutorial.title);
            } else {
                console.error('❌ Database: Failed to create tutorial:', tutorial.title);
            }
        }

        console.log('🎉 Database: Sample tutorials initialization complete');
        return { success: true };
    } catch (error) {
        console.error('❌ Database: Error initializing sample tutorials:', error);
        return { success: false, error: error.message };
    }
};
