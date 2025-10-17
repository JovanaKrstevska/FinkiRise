import '../Button/Button.css';

function Button(props){
    return(
        <button className={props.className ? props.className : null} onClick={props.onClick}>{props.content}</button>
    )
}
export default Button;