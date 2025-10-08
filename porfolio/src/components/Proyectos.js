import React from "react";

const Proyectos = () => {
  return (
    <section className="seccion-proyectos">
      <h2 className="titulo-seccion">Proyectos</h2>
      <div className="contenedor-tarjetas">
        <a className="tarjeta" href="#">
          <div
            className="tarjeta__fondo"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1557177324-56c542165309?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)",
            }}
          ></div>
          <div className="tarjeta__contenido">
            <p className="tarjeta__categoria">Categoría</p>
            <h3 className="tarjeta__titulo">Ejemplo de Título</h3>
          </div>
        </a>

        <a className="tarjeta" href="#">
          <div
            className="tarjeta__fondo"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1557187666-4fd70cf76254?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60)",
            }}
          ></div>
          <div className="tarjeta__contenido">
            <p className="tarjeta__categoria">Categoría</p>
            <h3 className="tarjeta__titulo">Ejemplo de Título</h3>
          </div>
        </a>

        <a className="tarjeta" href="#">
          <div
            className="tarjeta__fondo"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1556680262-9990363a3e6d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60)",
            }}
          ></div>
          <div className="tarjeta__contenido">
            <p className="tarjeta__categoria">Categoría</p>
            <h3 className="tarjeta__titulo">Ejemplo de Título</h3>
          </div>
        </a>

        <a className="tarjeta" href="#">
          <div
            className="tarjeta__fondo"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1557004396-66e4174d7bf6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60)",
            }}
          ></div>
          <div className="tarjeta__contenido">
            <p className="tarjeta__categoria">Categoría</p>
            <h3 className="tarjeta__titulo">Ejemplo de Título</h3>
          </div>
        </a>
      </div>
    </section>
  );
};

export default Proyectos;
