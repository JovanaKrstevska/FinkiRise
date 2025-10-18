import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Button from '../Button/Button';
import '../NavBar/NavBar.css';

function NavBar(props) {
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
            <Link to={"/login"}><Button className="btnLogOut" content={"Log Out"}/></Link>
        </div>
    );
}
export default NavBar;