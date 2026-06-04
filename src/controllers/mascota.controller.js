const mascotaService = require('../services/mascota.service');

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

module.exports = {
    crearMascota,
    listarMascotas,
    obtenerMascota,
    actualizarMascotaParcial,
    eliminarMascota,
};