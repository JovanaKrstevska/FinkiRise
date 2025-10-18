import '../AboutUsPage/AboutUsPage.css';
import NavBar from '../../componets/ui/NavBar/NavBar';
function AboutUsPage(){
    return(
        <>
        <NavBar />
        <div className='mainBoxAboutUs'>
            <h2 className='aboutUs'>Секогаш кроиме кон подобрување за нашите студенти кога станува збор за полагања и следење на настава. 
                Овозможуваме нова апликација каде што "Courses" и "Ispiti", ги обединуваме во едно со многу подобар upgrade на веќе постоечко и со нови предизвици. 
                Секако тука не запира, бидејќи секогаш гледаме да им овозможиме на студентите со што можни подобри функционалности.</h2>
            <h1 className='advice'>"Learning to code is learning to create. It's like having superpower to shape the world with your ideas." - Jovana Krstevska</h1>
            <img className='starAboutUs' src='/assets/icons/star.svg'/>
        </div>
        </>
    );
}
export default AboutUsPage;