import './TutorialCard.css';

function TutorialCard({ title = "Име на курсот", image, onClick }) {
    return (
        <div className='border-card-container' onClick={onClick}>
            <div className='block-img' style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            </div>
            <h3 className='name-tutorial'>{title}</h3>
        </div>
    );
}

export default TutorialCard;