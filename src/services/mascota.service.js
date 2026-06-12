import { MascotaRepository } from '../repositories/mascota.repository.js';

const mascotaRepository = new MascotaRepository();

const GEO_URL = process.env.MS_GEOLOCALIZACION_URL || 'http://localhost:8081';

// Helper: fetch con timeout para evitar que un servicio dormido congele la petición
const fetchConTimeout = async (url, options = {}, timeoutMs = 10000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        return res;
    } finally {
        clearTimeout(timer);
    }
};

const registrarMascota = async (data, file) => {
    // Separa "direccion" del resto — Mascotas no tiene ese campo en su tabla
    const { direccion, ...mascotaData } = data;

    if (file) {
        mascotaData.fotoBytes = file.buffer;
        mascotaData.fotoUrl = null;
    }

    const nuevaMascota = await mascotaRepository.create(mascotaData);

    // Llama al MS Geo para geocodificar la dirección y guardar las coordenadas
    if (direccion) {
        try {
            await fetchConTimeout(`${GEO_URL}/api/v1/geolocalizacion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mascotaId: nuevaMascota.id,
                    direccion: direccion
                })
            });
        } catch (err) {
            // No bloquea el flujo si el MS Geo no está disponible
            console.warn('MS Geo no disponible al registrar mascota:', err.message);
        }
    }

    return nuevaMascota;
};

// Endpoint combinado que une datos de Mascotas + Geolocalizacion
const obtenerDashboard = async () => {
    const mascotas = await mascotaRepository.findAll();

    // Intenta obtener todas las geolocalizaciones
    let geoList = [];
    try {
        const res = await fetchConTimeout(`${GEO_URL}/api/v1/geolocalizacion`);
        if (res.ok) geoList = await res.json();
    } catch (err) {
        // Dashboard funciona igual sin geo, simplemente sin coordenadas
        console.warn('MS Geo no disponible para dashboard:', err.message);
    }

    // Map de mascotaId -> geo para búsqueda O(1)
    const geoMap = Object.fromEntries(
        geoList.map(g => [g.mascotaId, g])
    );

    return mascotas.map(m => {
        const mJSON = m.toJSON();
        const geo = geoMap[mJSON.id];
        return {
            idMascota:    mJSON.id,
            nombre:       mJSON.nombre,
            raza:         mJSON.raza,
            estado:       mJSON.estado,
            color:        mJSON.color,
            tamano:       mJSON.tamano,
            contactoInfo: mJSON.contactoInfo,
            // Convierte Buffer a base64 para que el frontend pueda renderizar la imagen
            fotoBytes:    mJSON.fotoBytes
                            ? mJSON.fotoBytes.toString('base64')
                            : null,
            latitud:      geo?.latitud  ?? null,
            longitud:     geo?.longitud ?? null,
            direccion:    geo?.direccion ?? null,
        };
    });
};

const obtenerTodas = async () => mascotaRepository.findAll();

const obtenerPorEstado = async (estado) =>
    mascotaRepository.findByEstado(estado);

const obtenerPorId = async (id) => {
    const mascota = await mascotaRepository.findById(id);
    if (!mascota) {
        const err = new Error(`Mascota con id ${id} no encontrada`);
        err.status = 404;
        throw err;
    }
    return mascota;
};

const actualizarMascotaParcial = async (id, data, file) => {
    const mascota = await obtenerPorId(id);
    return mascotaRepository.update(mascota, data, file);
};

const eliminarMascota = async (id) => {
    const mascota = await obtenerPorId(id);
    return mascotaRepository.delete(mascota);
};

export default {
    registrarMascota,
    obtenerDashboard,
    obtenerTodas,
    obtenerPorEstado,
    obtenerPorId,
    actualizarMascotaParcial,
    eliminarMascota,
};