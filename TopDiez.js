class Cancion {
    constructor(titulo, artista, uri, prioridad = 0) {
        this.titulo = titulo;
        this.artista = artista;
        this.uri = uri;
        this.prioridad = prioridad;
    }
}

class ColaPrioridad {
    constructor() {
        this.canciones = [];
    }

    enqueue(cancion) {
        let index = this.canciones.findIndex(c => c.prioridad < cancion.prioridad);
        index === -1 ? this.canciones.push(cancion) : this.canciones.splice(index, 0, cancion);
    }

    dequeue() {
        return this.canciones.shift() || null;
    }

    isEmpty() {
        return this.canciones.length === 0;
    }
}

class TopDiez {
    constructor(interfaz) {
        this.interfaz = interfaz;
        this.cola = new ColaPrioridad();
        this.intervaloReproduccion = null;
    }

    async iniciarReproduccion() {
        try {
            this.interfaz.mostrarError('');
            const accessToken = localStorage.getItem('spotify_access_token');

            if (!accessToken) throw new Error('Debes iniciar sesión primero');

            if (this.intervaloReproduccion) clearInterval(this.intervaloReproduccion);

            const topTracks = await this.getTopTracks(accessToken);
            const tracks = topTracks.items;

            tracks.forEach(track => {
                const prioridad = Math.floor(Math.random() * 5);
                const cancion = new Cancion(
                    track.name,
                    track.artists[0].name,
                    track.uri,
                    prioridad
                );
                this.cola.enqueue(cancion);
            });

            this.interfaz.actualizarListaCola(this.cola.canciones);
            this.reproducir();
            this.intervaloReproduccion = setInterval(() => this.reproducir(), 3000);

        } catch (error) {
            this.interfaz.mostrarError('Error al iniciar la reproducción: ' + error.message);
            console.error(error);
        }
    }
//
    async getTopTracks(accessToken) {
        const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10', {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        if (!response.ok) throw new Error('Error al obtener las canciones');
        return await response.json();
    }

    reproducir() {
        if (!this.cola.isEmpty()) {
            const cancion = this.cola.dequeue();
            this.interfaz.actualizarReproductor(cancion);
            this.interfaz.actualizarListaCola(this.cola.canciones);
        } else {
            this.interfaz.actualizarReproductor(null);
            clearInterval(this.intervaloReproduccion);
        }
    }
}