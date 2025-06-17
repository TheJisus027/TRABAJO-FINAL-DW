# 📊 Dashboard Educativo de Bogotá 🎓

¡Bienvenido al Dashboard Educativo de Bogotá! 🎉 Este proyecto es tu puerta de entrada interactiva para explorar y analizar datos cruciales sobre los establecimientos educativos de Preescolar, Básica y Media en la capital colombiana. Toda la información proviene directamente del Sistema de Matrícula Estudiantil de Educación Básica y Media (SIMAT), ¡haciendo que los datos cobren vida! ✨

## ✨ Características Destacadas

- **Exploración Interactiva**: Sumérgete en los datos de los establecimientos educativos a través de gráficos dinámicos y visualizaciones cautivadoras. 📈
- **Filtros Inteligentes**: ¿Quieres ver solo escuelas públicas o las de jornada completa? ¡Fácil! Aplica filtros por Prestador de Servicio, Jornada y Nivel Educativo para afinar tu búsqueda y obtener insights precisos. 🔎
- **Módulos de Análisis Específicos**:
  - **Por Zonas**: Descubre cómo se distribuyen los establecimientos entre áreas Urbanas y Rurales de Bogotá. 🏙️🌳
  - **Por Tipo de Establecimiento**: Conoce la proporción de instituciones, centros educativos y sedes. 🏫🏢
  - **Por Jornadas**: Entiende la oferta de horarios: Mañana, Tarde, Completa, etc. ⏰📚
  - **Servicio y Propiedad**: Analiza la interesante relación entre quién presta el servicio educativo y la propiedad de la infraestructura física. 🤝🔗
- **Tecnología de Vanguardia**: Construido con las herramientas más eficientes para una experiencia web moderna y fluida. 💻🚀

## 🛠️ Tecnologías Usadas

- **HTML5**: La columna vertebral de nuestra interfaz. 🕸️
- **CSS (Tailwind CSS)**: Estilos veloces y un diseño responsivo que se adapta a cualquier pantalla. 🎨📱
- **JavaScript (ES Modules)**: La magia detrás de la interactividad y la organización modular del código. 💡
- **Chart.js**: ¡Tus datos se transforman en gráficos impresionantes! 📊
- **API de Datos Abiertos de Colombia**: Nuestra fuente confiable de información educativa de Bogotá. 🌐

## 📂 Estructura del Proyecto

```
TRABAJO-FINAL-DW/
├── README.md
└── src/
    ├── index.html
    └── js/
        ├── api.js
        ├── main.js
        └── modules/
            ├── Jornadas/
            │   └── index.js
            ├── ServicioYPropiedad/
            │   └── index.js
            ├── TiposEstablecimiento/
            │   └── index.js
            └── Zonas/
                └── index.js

```

- `index.html`: La página principal que ves en tu navegador. 🏠
- `README.md`: Este documento que estás leyendo, ¡tu guía de inicio rápido! 📖
- `src/`: Donde reside el corazón de la aplicación. ❤️
  - `src/js/main.js`: El cerebro que orquesta la carga de módulos y la lógica general. 🧠
  - `src/modules/`: Un conjunto de carpetas, cada una con su propia lógica (`index.js`) para una visualización específica. 🧩
  - `src/modules/zona/`: Contiene utilidades clave como `api.js` (para hablar con la API de datos.gov.co) y `chart.js` (probablemente para facilitar la integración con Chart.js). 📡📈

## 🚀 ¡Manos a la Obra! ¿Cómo Ponerlo en Marcha?

Es súper sencillo ejecutar este dashboard en tu propia máquina:

1.  **Clonar el Repositorio**: Abre tu terminal y ejecuta:
    ```bash
    git clone [https://github.com/TheJisus027/TRABAJO-FINAL-DW.git](https://github.com/TheJisus027/TRABAJO-FINAL-DW.git)
    cd TRABAJO-FINAL-DW
    ```
2.  **Abrir `index.html`**: Simplemente haz doble clic en el archivo `index.html` (lo encontrarás en la carpeta principal `TRABAJO-FINAL-DW/`) en tu navegador web. ¡Listo! No necesitas configuraciones de servidor complicadas, ya que los datos se obtienen de una API pública. 📁➡️🌐

    _💡 **Tip Pro**: Si tienes problemas con las importaciones de módulos JavaScript, considera usar una extensión de "Live Server" en tu editor de código (como VS Code). Esto simula un servidor local y resuelve problemas de CORS. ¡Más fácil imposible!_

## 🎯 ¿Cómo Usarlo?

Una vez que el dashboard cargue, un cálido mensaje de bienvenida te recibirá. Utiliza el menú de navegación a tu izquierda para elegir la categoría de análisis que te interese. Al seleccionar un módulo, verás los filtros disponibles en la parte superior. ¡Experimenta con ellos para descubrir patrones y tendencias educativas en Bogotá! 🕵️‍♀️✨

## 🙏 Créditos

- Datos obtenidos con amor y precisión de: [Datos Abiertos Colombia - Establecimientos Educativos de Preescolar, Básica y Media (SIMAT)](https://www.datos.gov.co/Educaci-n/Establecimientos-Educativos-de-Preescolar-B-sica-y/qijw-htwa). ¡Gracias por hacer la información accesible! 💖
