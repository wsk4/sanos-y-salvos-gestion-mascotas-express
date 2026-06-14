import Mascota from '../models/mascota.model.js';

export class MascotaRepository {
    async create(data) {
        return Mascota.create(data);
    }

    async findAll() {
        return Mascota.findAll();
    }

    async findByEstado(estado) {
        return Mascota.findAll({ where: { estado: estado.toUpperCase() } });
    }

    async findById(id) {
        return Mascota.findByPk(id);
    }

    async update(mascota, data, file) {
        if (data) Object.assign(mascota, data);
        if (file) {
        mascota.fotoBytes = file.buffer;
        mascota.fotoUrl = null;
        }
        return mascota.save();
    }

    async delete(mascota) {
        return mascota.destroy();
    }
}
