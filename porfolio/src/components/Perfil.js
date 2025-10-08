import React from "react";

const Perfil = () => {
    return (
        <div className="card">
            <div className='main'>

                <img className='tokenImage' src="YO.jpeg" alt="Angel" />

                <h2>Angel Emiliano</h2>
                <p className='description'>
                    ¡Hola! Soy Angel, un Técnico en Programación con experiencia en desarrollo full stack. Me especializo en crear
                    soluciones web eficientes, combinando una sólida comprensión de tecnologías frontend y backend.
                </p>

                <div className='tokenInfo'>
                    <div className="price">
                        <ins>2+</ins>
                        <p>Años de experiencia</p>
                    </div>
                    <div className="duration">
                        <ins>◷</ins>
                        <p>Técnico en Programación</p>
                    </div>
                </div>
                <hr />

                <div className='creator'>
                    <div className='wrapper'>
                        <img src="Imagen2.png" alt="Habilidades de Angel" />
                    </div>
                    <p>Bienvenido <ins>a mi</ins> Portafolio</p>
                </div>
            </div>
        </div>
        
    )
}
export default Perfil;