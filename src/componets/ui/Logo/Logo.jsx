import '../Logo/Logo.css';

function Logo(props){
    return(
        <img className={`${props.className ? props.className : ''}`} src="/assets/icons/finki_rise_logo.svg" alt='FinkiRise'></img>
    );
}
export default Logo;