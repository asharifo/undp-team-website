import '../css/DisasterDimensions.css';
import ImageSlider from '../components/ImageSlider';
import mountain from '../assets/mountains.jpg';
import river from '../assets/river.jpg';
import farmer from '../assets/farmer.jpg';
import forest from '../assets/forest.jpg';
import garden from '../assets/garden.jpg';
import lake from '../assets/lake.jpg';
import marsh from '../assets/marsh.jpg';
import mechanic from '../assets/mechanic.jpg';

const IMAGES = [
    mountain,
    forest,
    farmer,
    river,
    garden,
    lake,
    marsh,
    mechanic
];

function DisasterDimensions() {

    return <div className="disaster-dimensions">
        <ImageSlider images = {IMAGES}/>
    </div>
}

export default DisasterDimensions