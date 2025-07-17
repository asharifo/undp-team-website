import { Link } from "react-router-dom";
import "../css/NavBar.css"
import { forwardRef } from "react";

const NavBar = forwardRef((props, ref) => {
  return (
    <nav ref={ref}className="navbar">
      <a href="#top" className="logo">
        <img src="https://www.undp.org/sites/g/files/zskgke326/files/2025-04/undp-logo-blue.4f32e17f.svg"
          alt="UNDP logo" />
      </a>
      <ul className="navbar_list">
        <li className="navbar_item">
          <Link to="/" className="navbar_link">
            Disaster Dimensions
          </Link>
        </li>
        <li className="navbar_item">
          <Link to="/chatbot" className="navbar_link">
            Chatbot
          </Link>
        </li>
        <li className="navbar_item">
          <Link to="/more-info" className="navbar_link">
            More Info
          </Link>
        </li>
      </ul>
    </nav>
  );
});

export default NavBar