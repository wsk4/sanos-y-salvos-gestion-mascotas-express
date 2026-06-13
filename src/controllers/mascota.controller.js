import mascotaService from '../services/mascota.service.js';

const formatearMascota = (mascota) => {
    const mascotaJSON = mascota.toJSON ? mascota.toJSON() : { ...mascota };
    if (mascotaJSON.fotoBytes) {
        delete mascotaJSON.fotoBytes;
        mascotaJSON.tieneFoto = true;
    } else {
        mascotaJSON.tieneFoto = false;
    }
    return mascotaJSON;
};

// endpoint para crear una mascota
const crearMascota = async (req, res, next) => {
    try {
        const nuevaMascota = await mascotaService.registrarMascota(req.body, req.file);
        res.status(201).json(nuevaMascota);
    } catch (err) {
        next(err);
    }
};

// endpoint combinado con datos de geolocalizacion
const getDashboard = async (req, res, next) => {
    try {
        const data = await mascotaService.obtenerDashboard();
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

//endpoint apra listar mascotas
const listarMascotas = async (req, res, next) => {
    try {
        const { estado } = req.query;
        const mascotas = estado
        ? await mascotaService.obtenerPorEstado(estado)
        : await mascotaService.obtenerTodas();
        res.status(200).json(mascotas);
    } catch (err) {
        next(err);
    }
};

//endpoint para obtener una mascota
const obtenerMascota = async (req, res, next) => {
    try {
        const mascota = await mascotaService.obtenerPorId(req.params.id);
        res.status(200).json(mascota);
    } catch (err) {
        next(err);
    }
};

//endpoint para actualizar alguan caracteristica de una mascota
const actualizarMascotaParcial = async (req, res, next) => {
    try {
        const mascotaActualizada = await mascotaService.actualizarMascotaParcial(
        req.params.id,
        req.body,
        req.file
        );
        res.status(200).json(mascotaActualizada);
    } catch (err) {
        next(err);
    }
};

//endpoint para eliminar una mascota
const eliminarMascota = async (req, res, next) => {
    try {
        await mascotaService.eliminarMascota(req.params.id);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

export default {
    crearMascota,
    getDashboard,
    listarMascotas,
    obtenerMascota,
    actualizarMascotaParcial,
    eliminarMascota,
};