import React from 'react';

import "./assets/styles/App.css"
import Perfil from './components/Perfil';
import Service from './components/Service';
import Proyectos from './components/Proyectos';
const App = () => {
    return (
        <div>
            <Perfil/>
            <Service/>
            <Proyectos/>

            
            
        </div>

    );
};

export default App;
