import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Header from './Header';
import Chatbot from './chatbot/Chatbot';

const App = () => {
    return (
        <div>
            <BrowserRouter>
            <div className="container">
                <Header/>
                <Chatbot/>
            </div>
            </BrowserRouter>
        </div>
    )
}

export default App;
