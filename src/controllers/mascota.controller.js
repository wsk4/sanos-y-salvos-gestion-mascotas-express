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

const crearMascota = async (req, res, next) => {
    try {
        const nuevaMascota = await mascotaService.registrarMascota(req.body, req.file);
        res.status(201).json(nuevaMascota);
    } catch (err) {
        next(err);
    }
};

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

const obtenerMascota = async (req, res, next) => {
    try {
        const mascota = await mascotaService.obtenerPorId(req.params.id);
        res.status(200).json(mascota);
    } catch (err) {
        next(err);
    }
};

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
    listarMascotas,
    obtenerMascota,
    actualizarMascotaParcial,
    eliminarMascota,
};