const { Mascota } = require('../models/mascota.model');

const registrarMascota = async (data, file) => {
    if (file) {
        data.fotoBytes = file.buffer;
        data.fotoUrl = null;
    }
    return await Mascota.create(data);
};

const obtenerTodas = async () => Mascota.findAll();

const obtenerPorEstado = async (estado) =>
    Mascota.findAll({ where: { estado: estado.toUpperCase() } });

const obtenerPorId = async (id) => {
    const mascota = await Mascota.findByPk(id);
    if (!mascota) {
        const err = new Error(`Mascota con id ${id} no encontrada`);
        err.status = 404;
        throw err;
    }
    return mascota;
};

const actualizarMascotaParcial = async (id, data, file) => {
    const mascota = await obtenerPorId(id);
    if (data) Object.assign(mascota, data);
    if (file) {
        mascota.fotoBytes = file.buffer;
        mascota.fotoUrl = null;
    }
    return await mascota.save();
};

const eliminarMascota = async (id) => {
    const mascota = await obtenerPorId(id);
    await mascota.destroy();
};

module.exports = {
    registrarMascota,
    obtenerTodas,
    obtenerPorEstado,
    obtenerPorId,
    actualizarMascotaParcial,
    eliminarMascota,
};