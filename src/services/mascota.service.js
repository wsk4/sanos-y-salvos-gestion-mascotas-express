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
    const { direccion, ...mascotaData } = data;

    if (file) {
        mascotaData.fotoBytes = file.buffer;
        mascotaData.fotoUrl = null;
    }

    const nuevaMascota = await mascotaRepository.create(mascotaData);

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
            console.warn('MS Geo no disponible al registrar mascota:', err.message);
        }
    }

    return nuevaMascota;
};

const obtenerDashboard = async () => {
    const mascotas = await mascotaRepository.findAll();

    let geoList = [];
    try {
        const res = await fetchConTimeout(`${GEO_URL}/api/v1/geolocalizacion`);
        if (res.ok) geoList = await res.json();
    } catch (err) {
        console.warn('MS Geo no disponible para dashboard:', err.message);
    }

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

// NUEVO: busca una mascota por ID y enriquece con datos del MS Geo
const obtenerPorIdConGeo = async (id) => {
    const mascota = await mascotaRepository.findById(id);
    if (!mascota) {
        const err = new Error(`Mascota con id ${id} no encontrada`);
        err.status = 404;
        throw err;
    }
    const mJSON = mascota.toJSON();

    let geo = null;
    try {
        const res = await fetchConTimeout(`${GEO_URL}/api/v1/geolocalizacion/mascota/${id}`);
        if (res.ok) geo = await res.json();
    } catch (err) {
        console.warn('MS Geo no disponible para detalle de mascota:', err.message);
    }

    return {
        idMascota:    mJSON.id,
        nombre:       mJSON.nombre,
        raza:         mJSON.raza,
        estado:       mJSON.estado,
        color:        mJSON.color,
        tamano:       mJSON.tamano,
        contactoInfo: mJSON.contactoInfo,
        fotoBytes:    mJSON.fotoBytes
                        ? mJSON.fotoBytes.toString('base64')
                        : null,
        latitud:      geo?.latitud  ?? null,
        longitud:     geo?.longitud ?? null,
        direccion:    geo?.direccion ?? null,
    };
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
    obtenerPorIdConGeo,   // ← exportado
    actualizarMascotaParcial,
    eliminarMascota,
};