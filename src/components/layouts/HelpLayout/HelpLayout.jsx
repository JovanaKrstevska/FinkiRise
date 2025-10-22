import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import './HelpLayout.css';
import Input from '../../ui/Input/Input';
import Button from '../../ui/Button/Button';

function HelpLayout(props) {
    const [selectedEmail, setSelectedEmail] = useState('');
    const [comment, setComment] = useState('');
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleSend = () => {
        if (!selectedEmail || !comment) {
            alert("Изберете е-пошта и внесете порака!");
            return;
        }
        setShowModal(true);
        setComment('');

        const templateParams = {
            to_email: selectedEmail,
            message: comment,
        };

        emailjs.send('service_t3znz1k', 'template_goq59vo', templateParams, 'uWphuYLFByETlxegI')
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                setShowModal(true);
                setComment('');
            })
            .catch((err) => {
                console.error('FAILED...', err);
                alert("Грешка при испраќање на пораката.");
            });
    };

    const closeModal = () => {
        setShowModal(false);
        navigate('/home');
    };

    return (
        <div className='mainBox'>
            <h2>
                Доколку имате технички проблеми поврзани со апликацијата или сакате да поставите било какво прашање што не Ви е јасно, <b>тука сме за Вас!</b>
            </h2>
            <h2>
                Во зависност од Вашата потреба, треба да ја селектирате правилната е-пошта за да можете да ги контактирате.
            </h2>
            <div className="contact-row">
                <div className='contact-col'>
                    <div className='contact-title'>Општи прашања:</div>
                    <label className='email'>studenski@finki.ukim.mk</label>
                    <input
                        className='select'
                        type='radio'
                        name='contact'
                        checked={selectedEmail === "studenski@finki.ukim.mk"}
                        onChange={() => setSelectedEmail("studenski@finki.ukim.mk")}
                    />
                </div>
                <div className='contact-col'>
                    <div className='contact-title'>Технички проблеми:</div>
                    <label className='email'>krstevska.jovana@gmail.com</label>
                    <input
                        className='select'
                        type='radio'
                        name='contact'
                        checked={selectedEmail === "krstevska.jovana@gmail.com"}
                        onChange={() => setSelectedEmail("krstevska.jovana@gmail.com")}
                    />
                </div>
            </div>
            <div className='text'>
                <Input
                    style='textInput'
                    placeholder={"Внеси текст..."}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />
            </div>
            <Button className='btnPrati' content={"Прати"} onClick={handleSend} />

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <p>
                            Пораката е испратена на:<br />
                            <b>{selectedEmail}</b>
                        </p>
                        <Button className='btnClosePop' content={"Затвори"} onClick={closeModal} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default HelpLayout;
