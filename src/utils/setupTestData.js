import { enrollStudentInSubject, getSubjectsByProfessor } from '../services/databaseService';

// Helper function to enroll a student in all available subjects (for testing)
export const enrollStudentInAllSubjects = async (studentId, professorId) => {
    try {
        const result = await getSubjectsByProfessor(professorId);
        
        if (result.success) {
            const enrollmentPromises = result.data.map(subject => 
                enrollStudentInSubject(subject.id, studentId)
            );
            
            await Promise.all(enrollmentPromises);
            console.log(`Student ${studentId} enrolled in ${result.data.length} subjects`);
            return { success: true, count: result.data.length };
        }
        
        return { success: false, error: 'No subjects found' };
    } catch (error) {
        console.error('Error enrolling student:', error);
        return { success: false, error: error.message };
    }
};

// You can call this function from browser console to set up test data:
// Example: enrollStudentInAllSubjects('student-user-id', 'professor-user-id')
window.enrollStudentInAllSubjects = enrollStudentInAllSubjects;