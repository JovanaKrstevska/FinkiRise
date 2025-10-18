import '../LoginLayout/LoginLayout.css';
import Button from '../../ui/Button/Button';
import Input from '../../ui/Input/Input';
function LoginLayout() {
    return (
        <div className="bg-container">
            <img className="finki_rise_logo" src='/assets/icons/finki_rise_logo.svg' alt='FinkiRise'></img>
            <svg className="wave-svg" viewBox="0 0 200 600" preserveAspectRatio="none">
                <path
                    d="M0,0 Q40,300 0,600 L40,600 Q50,300 40,0 Z"
                    fill="#2f7b9b"
                />
            </svg>
            <svg className="wave-svg1" viewBox="0 0 200 600" preserveAspectRatio="none">
                <path
                    d="M0,0 Q40,300 0,600 L40,600 Q50,300 40,0 Z"
                    fill="#5B98B2"
                />
            </svg>
            <div className="right-bg"></div>
            <div className="diamond-glow"></div>
            <div className='board'>
                <form className='formLogin'>
                    <h1 className='h1Edit'>Добредојде</h1>
                    <Input typename={"text"} labelname={"Електронска пошта/Индекс"} placeholder={"Внеси ја твојата електронска пошта/индекс"} />
                    <Input typename={"password"} className="inputPassword" labelname={"Лозинка"} placeholder={"Внеси ја твојата лозинка"} />
                    <Button className="btnLogin" content={"Најава"} />
                </form>
            </div>
        </div>
    );
}
export default LoginLayout;