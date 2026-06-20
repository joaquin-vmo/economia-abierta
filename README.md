# Laboratorio de Finanzas Internacionales

Página web interactiva para docencia: **IS-LM-BP de economía abierta (Mundell–Fleming)** y
**overshooting del tipo de cambio (Dornbusch)**. Pensada para el curso *Finanzas Internacionales*
(Magíster en Análisis Económico). Todo corre en el navegador — sin servidor, sin instalación.

## Contenido

- **Pestaña IS-LM-BP.** Gráfico interactivo en el plano \(Y, i\) con las curvas IS, LM y BP.
  Controles: régimen cambiario (flexible/fijo), política fiscal \(G\), oferta monetaria \(M/P\),
  tasa internacional \(i^*\), movilidad de capital \(v\) (hasta movilidad perfecta), y los
  parámetros estructurales \(c, m, b, x, k, h\). Botón **"Congelar"** para comparar el equilibrio
  nuevo contra el inicial. Reproduce numéricamente la Ayudantía 4:
  con \(c=\tfrac12, a=100, G=50, b=x=m=v=k=h=1, i^*=0, M/P=50\) da \(Y=100, i=50, e=0\);
  con movilidad perfecta da \(Y=50, i=0, e=-100\).

- **Pestaña Overshooting.** Diagrama de fase \((e,p)\) con isoclinas y senda de silla, más las
  trayectorias temporales de \(e, p, i\). Botón **▶ Animar shock** y un preset **"Precios
  flexibles"** que muestra cómo desaparece la sobrerreacción.

## Notación

| IS | \(Y = c(Y-T) + a - b\,i + G + x\,e - m\,Y\) |
| LM | \(M/P = k\,Y - h\,i\) |
| BP | \(0 = x\,e - m\,Y + v\,(i - i^*)\) |

Dornbusch: \(\;\dot e = i - i^*\;\) (paridad descubierta), \(\;m-p=\phi y-\lambda i\;\),
\(\;\dot p = \pi[\bar u + \delta(e-p) + \gamma y - \sigma i - y]\).

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube estos archivos (`index.html`, `styles.css`, `js/`, `.nojekyll`):
   ```bash
   git init
   git add .
   git commit -m "Laboratorio de finanzas internacionales"
   git branch -M main
   git remote add origin https://github.com/USUARIO/REPO.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   rama `main`, carpeta `/ (root)`.
3. La página queda en `https://USUARIO.github.io/REPO/` en ~1 minuto.

## Probar localmente

Abre `index.html` directamente en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8000   # luego abre http://localhost:8000
```

## Dependencias (vía CDN, sin instalación)

- [Plotly.js](https://plotly.com/javascript/) — gráficos.
- [MathJax](https://www.mathjax.org/) — ecuaciones.
