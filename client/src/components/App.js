import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Header from './Header';
import Shop from './shop/Shop';
import Chatbot from './chatbot/Chatbot';

const App = () => {
    return (
        <div>
            <BrowserRouter>
            <div className="container">
                <Header/>
                <Route exact path="/shop" component={Shop} />
                <Chatbot/>
            </div>
            </BrowserRouter>
        </div>
    )
}

export default App;
