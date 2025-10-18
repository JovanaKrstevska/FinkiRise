import MiniCard from '../../widgets/MiniCard/MiniCard';
import '../MiniCardsLayout/MiniCardsLayout.css';

function MiniCardsLayout() {
    return (
        <div className='miniCardLayout'>
            <MiniCard content={"Соопшетнија"} mini_desc={"Тука ќе можете да ги разгледате сите соопштенија"}/>
            <MiniCard content={"Пракса и вработување"} mini_desc={"Тука ќе можете да ги разгледате сите ограси за пракси и за вработување"}/>
            <MiniCard content={"Консултации"} mini_desc={"Тука ќе можете да ги разгледате сите соби за консултации од сите професори"}/>
        </div>
    );
}
export default MiniCardsLayout;