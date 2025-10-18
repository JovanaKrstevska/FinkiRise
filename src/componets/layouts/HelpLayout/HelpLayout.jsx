import './HelpLayout.css';
import Input from '../../ui/Input/Input';
import Button from '../../ui/Button/Button';
function HelpLayout(props) {
    return (
        <div className='mainBox'>
            <h2>Доколку имате технички проблеми поврзани со апликацијата или сакате да поставите било какво прашање што не Ви е јасно, <b>тука сме за Вас!</b></h2>
            <h2>Во зависност од Вашата потреба, треба да ја селектирате правилната е-пошта за да можете да ги контактирате.</h2>
            <div className="contact-row">
                <div className='contact-col'>
                    <div className='contact-title'>Општи прашања:</div>
                    <label className='email'>studenski@finki.ukim.mk</label>
                    <input className='select' type='radio' />
                </div>
                <div className='contact-col'>
                    <div className='contact-title'>Технички проблеми:</div>
                    <label className='email'>krstevska.jovana@gmail.com</label>
                    <input className='select' type='radio' />
                </div>
            </div>
            <div className='text'>
                <Input style='textInput' placeholder={"Внеси текст..."}/>
            </div>
            <Button className='btnPrati' content={"Прати"}/>
        </div>
    );
}
export default HelpLayout;