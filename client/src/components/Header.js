import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <nav>
            <div className="nav-wrapper">
                <Link to={'/'} className="brand-logo">Opes</Link>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
            </ul>
            </div>
        </nav>
    )
};

export default Header;
