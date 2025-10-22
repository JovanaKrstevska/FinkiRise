import { useNavigate } from 'react-router-dom';
import { loginWithEmailAndPassword } from '../../../config/firebase';
import { useState } from 'react';
import '../LoginLayout/LoginLayout.css';
import Button from '../../ui/Button/Button';
import Input from '../../ui/Input/Input';

function LoginLayout() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        
        const result = await loginWithEmailAndPassword(email, password);
        
        if (result.success) {
            navigate('/home');
            console.log('User logged in successfully!');
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };
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
                <form className='formLogin' onSubmit={handleLogin}>
                    <h1 className='h1Edit'>Добредојде</h1>
                    {error && <div className="error-message">{error}</div>}
                    <Input 
                        typename={"email"} 
                        labelname={"Електронска пошта/Индекс"} 
                        placeholder={"Внеси ја твојата електронска пошта/индекс"} 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input 
                        typename={"password"} 
                        className="inputPassword" 
                        labelname={"Лозинка"} 
                        placeholder={"Внеси ја твојата лозинка"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button 
                        className="btnLogin" 
                        content={"Најава"} 
                        type="submit"
                        disabled={loading}
                    />
                </form>
            </div>
        </div>
    );
}
export default LoginLayout;