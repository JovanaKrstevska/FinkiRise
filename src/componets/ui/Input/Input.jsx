import '../Input/Input.css';

function Input(props) {
return (
    <label className={`${props.className ? props.className : ''}`}>
        {props.labelname}
    <input type={props.typename} name={props.inputname} placeholder={props.placeholder} value={props.value} onChange={props.onChange}></input>
    </label>
)
}


export default Input;