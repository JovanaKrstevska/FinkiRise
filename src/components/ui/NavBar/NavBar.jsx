import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Button from '../Button/Button';
import { useAuth } from '../../../contexts/AuthContext';
import '../NavBar/NavBar.css';

function NavBar(props) {
    const { userRole } = useAuth();

    return (
        <div className='navigationBar'>
            <Logo className="logo" />
            <nav className='navbar-menu'>
                <Link className='buttonLink' to={"/home"}>Почетна</Link>
                <Link className='buttonLink' to={"/profile"}>Профил</Link>
                <Link className='buttonLink' to={"/help"}>Помош</Link>
                <Link className='buttonLink' to={"/sic"}>SIC</Link>
                <Link className='buttonLink' to={"/about_us"}>За Нас</Link>
            </nav>
            <div className="navbar-user-info">
                <span className="user-role-badge">
                    {userRole === 'professor' ? 'Професор' : 'Студент'}
                </span>
                <Link to={"/login"}><Button className="btnLogOut" content={"Log Out"} /></Link>
            </div>
        </div>
    );
}
export default NavBar;