class Interfaz {
    constructor() {
        this.initializeHTML();
        this.handleAuthentication();
        this.bindEvents();
    }

    initializeHTML() {
        document.body.innerHTML = `
            <div class="container">
                <h1>Mi Cola de Reproducción de Spotify</h1>
                <button id="btnLogin" style="display: none;">Iniciar sesión con Spotify</button>
                <button id="btnIniciar" style="display: none;">Iniciar Reproducción</button>
                <div id="error-message"></div>
                
                <div id="reproductor">
                    <h2>Reproduciendo ahora:</h2>
                    <div id="player-actual"></div>
                </div>

                <div id="cola">
                    <h2>Cola de reproducción</h2>
                    <div id="lista-cola"></div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            
            .container {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            h1 {
                color: #1DB954;
                text-align: center;
            }

            button {
                background-color: #1DB954;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 16px;
                display: block;
                margin: 20px auto;
            }

            button:hover {
                background-color: #1ed760;
            }

            #reproductor {
                margin-top: 20px;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background-color: #fff;
            }

            #cola {
                margin-top: 20px;
            }

            .cancion {
                padding: 10px;
                margin: 5px 0;
                background-color: #f8f8f8;
                border-radius: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .prioridad {
                background-color: #1DB954;
                color: white;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 12px;
            }

            .reproduciendo {
                background-color: #e8f5e9;
                border-left: 4px solid #1DB954;
            }

            #error-message {
                color: red;
                text-align: center;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(styles);
    }

    handleAuthentication() {
        const hash = window.location.hash.substr(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');

        if (accessToken) {
            localStorage.setItem('spotify_access_token', accessToken);
            document.getElementById('btnIniciar').style.display = 'block';
            document.getElementById('btnLogin').style.display = 'none';
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            document.getElementById('btnLogin').style.display = 'block';
        }
    }

    bindEvents() {
        document.getElementById('btnLogin').addEventListener('click', () => {
            const clientId = 'REMPLAZAR AQUI PILAS PUES'; // REEMPLAZAR
            const redirectUri = encodeURIComponent('http://localhost:5500'); // REEMPLAZAR (el servidor tiene que estar en la app de sporify tambien)
            const scope = 'user-top-read';
            const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}&show_dialog=true`;
            window.location.href = authUrl;
        });

        document.getElementById('btnIniciar').addEventListener('click', () => {
            const topDiez = new TopDiez(this);
            topDiez.iniciarReproduccion();
        });
    }

    actualizarListaCola(canciones) {
        const listaCola = document.getElementById('lista-cola');
        listaCola.innerHTML = '';

        canciones.forEach(cancion => {
            const elemento = document.createElement('div');
            elemento.className = 'cancion';
            elemento.innerHTML = `
                <div>
                    <strong>${cancion.titulo}</strong> - ${cancion.artista}
                </div>
                <span class="prioridad">Prioridad: ${cancion.prioridad}</span>
            `;
            listaCola.appendChild(elemento);
        });
    }

    actualizarReproductor(cancion) {
        const playerActual = document.getElementById('player-actual');
        if (cancion) {
            playerActual.innerHTML = `
                <div class="cancion reproduciendo">
                    <div>
                        <strong>${cancion.titulo}</strong> - ${cancion.artista}
                    </div>
                    <span class="prioridad">Prioridad: ${cancion.prioridad}</span>
                </div>
                <iframe 
                    src="https://open.spotify.com/embed/track/${cancion.uri.split(':')[2]}" 
                    width="100%" 
                    height="80" 
                    frameborder="0" 
                    allowtransparency="true" 
                    allow="encrypted-media">
                </iframe>
            `;
        } else {
            playerActual.innerHTML = '<p>No hay canciones en reproducción</p>';
        }
    }

    mostrarError(mensaje) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = mensaje;
    }
}