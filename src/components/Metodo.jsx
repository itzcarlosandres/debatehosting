import React from 'react';

export const Metodo = () => {
  const steps = [
    {
      num: '01',
      title: 'Pruebas de carga bajo estrés',
      desc: 'Contratamos planes anónimamente y ejecutamos tests de latencia (TTFB) con peticiones concurrentes para medir caídas reales de CPU.',
    },
    {
      num: '02',
      title: 'Monitorización de Uptime 24/7',
      desc: 'Medimos la disponibilidad de cada infraestructura mediante sondas automáticas cada 60 segundos desde nodos en Europa y América.',
    },
    {
      num: '03',
      title: 'Ponderación matemática limpia',
      desc: 'La posición en La Balanza responde exclusivamente a los deslizadores que tú mueves. El algoritmo no tiene coeficientes ocultos por comisión.',
    },
    {
      num: '04',
      title: 'Auditoría mensual de renovaciones',
      desc: 'Desgranamos las trampas habituales de los contratos baratos: cuánto te costará el hosting en el segundo año y qué limitaciones impone la letra pequeña.',
    },
  ];

  return (
    <section id="metodo" className="metodo-section">
      <div className="container">
        <div className="kicker">ÉTICA EDITORIAL Y TRANSPARENCIA</div>
        <h2>
          Cómo puntuamos <span className="italic-serif">(y cómo ganamos).</span>
        </h2>

        <div className="metodo-grid">
          {/* Caja Izquierda: Transparencia */}
          <div className="transparency-box">
            <h3>Declaración de Afiliación y Financiación</h3>
            <p>
              En <strong>Debatehosting</strong> creemos que la transparencia no es opcional.
              Mantenemos este laboratorio periodístico mediante enlaces de afiliados.
            </p>
            <p>
              Si decides contratar un servicio tras leer nuestros análisis, la empresa proveedora
              nos remite una pequeña comisión de recomendación. Esto <strong>nunca encarece el precio</strong> para
              ti (al contrario: la mayoría de veces consigues descuentos extra con nuestros cupones).
            </p>
            <p>
              <strong>Regla de oro de nuestra redacción:</strong> Ningún proveedor puede pagar por
              ocupar el podio, por subir notas en La Balanza o por alterar un veredicto. Si un servicio
              falla o su soporte es pésimo, lo decimos con nombres y apellidos.
            </p>
          </div>

          {/* Caja Derecha: 4 Pasos */}
          <div className="steps-list">
            {steps.map((step) => (
              <div key={step.num} className="step-item">
                <div className="step-num">{step.num}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
