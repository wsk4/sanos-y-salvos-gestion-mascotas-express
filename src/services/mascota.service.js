import { MascotaRepository } from '../repositories/mascota.repository.js';

const mascotaRepository = new MascotaRepository();

const registrarMascota = async (data, file) => {
    if (file) {
        data.fotoBytes = file.buffer;
        data.fotoUrl = null;
    }
    return mascotaRepository.create(data);
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
    obtenerTodas,
    obtenerPorEstado,
    obtenerPorId,
    actualizarMascotaParcial,
    eliminarMascota,
};