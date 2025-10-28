import '../LabPage/LabPage.css';
import NavBar from '../../components/ui/NavBar/NavBar';
import LabLayout from '../../components/layouts/LabLayout/LabLayout';

function LabPage() {
    return (
        <div>
            <NavBar />
            <div className="lab-page">
                <LabLayout />
            </div>
        </div>
    );
}

export default LabPage;