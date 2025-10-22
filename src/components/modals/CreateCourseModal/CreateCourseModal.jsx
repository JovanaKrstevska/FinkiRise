import { useState } from 'react';
import './CreateCourseModal.css';
import { createSubject } from '../../../services/databaseService';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../ui/Input/Input';

function CreateCourseModal({ isOpen, onClose, onCourseCreated }) {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        academicYear: '2024/2025',
        semesterType: 'winter',
        enrolledStudents: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'enrolledStudents' || name === 'studyYear' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const courseData = {
                ...formData,
                professorId: currentUser.uid,
                semester: formData.semesterType === 'winter' ? 1 : 2
            };

            const result = await createSubject(courseData);

            if (result.success) {
                onCourseCreated();
                onClose();
                setFormData({
                    name: '',
                    code: '',
                    academicYear: '2024/2025',
                    semesterType: 'winter',
                    enrolledStudents: null
                });
            } else {
                setError(result.error || 'Грешка при креирање на курсот');
            }
        } catch (err) {
            setError('Грешка при креирање на курсот');
        }

        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Креирај нов курс</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="course-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <Input
                            style="form-input"
                            typename="text"
                            inputname="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            labelname={'Име на курсот:'}
                            placeholder="пр. Веб програмирање"
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            typename="text"
                            style="form-input"
                            inputname="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            labelname={'Код на курсот:'}
                            placeholder="пр. WP"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <select
                                id="academicYear"
                                name="academicYear"
                                value={formData.academicYear}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="2021/2022">2021/2022</option>
                                <option value="2022/2023">2022/2023</option>
                                <option value="2023/2024">2023/2024</option>
                                <option value="2024/2025">2024/2025</option>
                                <option value="2025/2026">2025/2026</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <select
                                id="semesterType"
                                name="semesterType"
                                value={formData.semesterType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="winter">Зимски семестар</option>
                                <option value="summer">Летен семестар</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <Input
                            style="form-input"
                            typename="number"
                            inputname="enrolledStudents"
                            value={formData.enrolledStudents}
                            onChange={handleInputChange}
                            labelname={'Број на студенти:'}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Откажи
                        </button>
                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? 'Се креира...' : 'Креирај курс'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateCourseModal;