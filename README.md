# Modelos de Economía Abierta

Una página web para mover los modelos macro de economía abierta con el mouse, en vez de dibujarlos a mano.

**https://joaquin-vmo.github.io/economia-abierta/**

Tiene tres pestañas:

- **IS-LM-BP (Mundell–Fleming).** Subes el gasto público o la oferta de dinero y ves cómo se desplazan las curvas y adónde se va el equilibrio. Se puede elegir tipo de cambio fijo o flexible y regular la movilidad de capital, desde nula hasta perfecta. El botón *Congelar* deja el equilibrio anterior en pantalla para comparar.
- **Overshooting (Dornbusch).** El diagrama de fase del tipo de cambio y los precios, con la senda de silla, más la animación de un shock monetario. Con $\pi$ alto (precios flexibles) la sobrerreacción desaparece.
- **Curva J / Marshall–Lerner.** Se mueven las elasticidades de exportaciones e importaciones y se ve si una depreciación termina mejorando o empeorando la balanza comercial, y cuánto demora.

Los parámetros estructurales (propensión a consumir, sensibilidades, etc.) están en la sección *avanzado* de cada panel.

## Cómo correrlo

No hay nada que instalar. Basta abrir el link de arriba, o clonar el repositorio y abrir `index.html` en el navegador:

```bash
git clone https://github.com/joaquin-vmo/economia-abierta.git
```

Si el navegador bloquea algo al abrir el archivo directo, sirve la carpeta:

```bash
python3 -m http.server 8000   # http://localhost:8000
```

Los gráficos usan [Plotly](https://plotly.com/javascript/) y las ecuaciones [MathJax](https://www.mathjax.org/), ambos cargados desde CDN.

## Las ecuaciones

$$IS:\quad Y = c(Y-T) + a - b\,i + G + x\,e - m\,Y$$
$$LM:\quad M/P = k\,Y - h\,i \qquad BP:\quad 0 = x\,e - m\,Y + v\,(i - i^*)$$

Dornbusch: $\dot e = i - i^*$ (paridad descubierta), $m - p = \phi y - \lambda i$, $\dot p = \pi[\bar u + \delta(e-p) + \gamma y - \sigma i - y]$.
