import '../MiniCard/MiniCard.css';

function MiniCard(props){
    return(
        <div className='miniBox' onClick={props.onClick}>
            <div className='sic'>
                <img className='notifyIcon' src='/assets/icons/notification_icon.svg' alt='Notification'/>
                <h2 className='miniContent'>{props.content}</h2>
            </div>
            <h3 className='miniDesc'>{props.mini_desc}</h3>
        </div>
    );
}
export default MiniCard;