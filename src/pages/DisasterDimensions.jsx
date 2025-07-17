import '../css/DisasterDimensions.css';
import ImageSlider from '../components/ImageSlider';
import mountain from '../assets/mountains.jpg';
import river from '../assets/river.jpg';

const IMAGES = [
    mountain,
    river,
    mountain,
    river,
    mountain,
    river,
    mountain,
    river
];

function DisasterDimensions() {

    return <div className="disaster-dimensions">
        <ImageSlider images = {IMAGES}/>
    </div>
}

export default DisasterDimensions