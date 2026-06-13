import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/config/database.js', () => ({
  default: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    define: jest.fn().mockReturnValue({}),
  },
}));

// Mascota mock con toJSON() para soportar formatearMascota() del controller
const mascotaMock = {
  id: 1,
  nombre: 'Rex',
  raza: 'Labrador',
  color: 'Dorado',
  tamano: 'grande',
  estado: 'PERDIDA',
  contactoInfo: '+56912345678',
  fotoBytes: null,
  toJSON() { return { ...this }; },
  save: jest.fn().mockResolvedValue(this),
  destroy: jest.fn().mockResolvedValue(1),
};

jest.unstable_mockModule('../src/models/mascota.model.js', () => ({
  default: {
    findAll:   jest.fn().mockResolvedValue([mascotaMock]),
    findByPk:  jest.fn().mockResolvedValue(mascotaMock),
    create:    jest.fn().mockResolvedValue(mascotaMock),
    destroy:   jest.fn().mockResolvedValue(1),
    save:      jest.fn().mockResolvedValue(mascotaMock),
  },
}));

// Silencia los fetch() al MS Geo en los tests
global.fetch = jest.fn().mockResolvedValue({
  ok: false,
  json: jest.fn().mockResolvedValue([]),
});

const { default: app } = await import('../src/app.js');

describe('GET /health', () => {
  it('responde 200 con status ok', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('gestion-mascotas');
  });
});

describe('GET /api/v1/mascotas', () => {
  it('responde 200 con un array', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app).get('/api/v1/mascotas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filtra por estado=PERDIDA y retorna 200', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app).get('/api/v1/mascotas?estado=PERDIDA');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filtra por estado=ENCONTRADA y retorna 200', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app).get('/api/v1/mascotas?estado=ENCONTRADA');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/v1/mascotas/dashboard', () => {
  it('responde 200 con un array enriquecido', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app).get('/api/v1/mascotas/dashboard');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('cada elemento tiene los campos requeridos del dashboard', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app).get('/api/v1/mascotas/dashboard');
    expect(res.statusCode).toBe(200);
    if (res.body.length > 0) {
      const item = res.body[0];
      expect(item).toHaveProperty('idMascota');
      expect(item).toHaveProperty('nombre');
      expect(item).toHaveProperty('estado');
      expect(item).toHaveProperty('latitud');
      expect(item).toHaveProperty('longitud');
      expect(item).toHaveProperty('direccion');
    }
  });
});

describe('POST /api/v1/mascotas - validación Zod', () => {
  it('retorna 400 si el nombre es muy corto', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app)
      .post('/api/v1/mascotas')
      .send({ nombre: 'a' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('retorna 400 si falta el campo raza', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app)
      .post('/api/v1/mascotas')
      .send({
        nombre: 'Rex',
        color: 'Dorado',
        tamano: 'grande',
        estado: 'PERDIDA',
        contactoInfo: '+56912345678',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('retorna 400 si el estado no es PERDIDA ni ENCONTRADA', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app)
      .post('/api/v1/mascotas')
      .send({
        nombre: 'Rex',
        raza: 'Labrador',
        color: 'Dorado',
        tamano: 'grande',
        estado: 'ADOPTADA', 
        contactoInfo: '+56912345678',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('retorna 400 si el tamaño no es pequeño|mediano|grande', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app)
      .post('/api/v1/mascotas')
      .send({
        nombre: 'Rex',
        raza: 'Labrador',
        color: 'Dorado',
        tamano: 'gigante', 
        estado: 'PERDIDA',
        contactoInfo: '+56912345678',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('retorna 201 con cuerpo válido y sin archivo', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app)
      .post('/api/v1/mascotas')
      .send({
        nombre: 'Rex',
        raza: 'Labrador',
        color: 'Dorado',
        tamano: 'grande',
        estado: 'PERDIDA',
        contactoInfo: '+56912345678',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe('Rex');
  });

  it('retorna 201 usando multipart/form-data con campo mascota JSON', async () => {
    const { default: request } = await import('supertest');
    const mascotaPayload = JSON.stringify({
      nombre: 'Luna',
      raza: 'Poodle',
      color: 'Blanco',
      tamano: 'pequeño',
      estado: 'ENCONTRADA',
      contactoInfo: 'luna@correo.cl',
    });
    const res = await request(app)
      .post('/api/v1/mascotas')
      .field('mascota', mascotaPayload);
    expect(res.statusCode).toBe(201);
  });
});

describe('GET /api/v1/mascotas/:id', () => {
  it('retorna 404 si la mascota no existe', async () => {
    const { default: Mascota }  = await import('../src/models/mascota.model.js');
    Mascota.findByPk.mockResolvedValueOnce(null);

    const { default: request } = await import('supertest');
    const res = await request(app).get('/api/v1/mascotas/999');
    expect(res.statusCode).toBe(404);
  });

  it('retorna 200 con el objeto enriquecido cuando la mascota existe', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app).get('/api/v1/mascotas/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('idMascota', 1);
    expect(res.body).toHaveProperty('nombre');
    expect(res.body).toHaveProperty('latitud', null);
  });
});


describe('PATCH /api/v1/mascotas/:id', () => {
  it('retorna 404 si la mascota a actualizar no existe', async () => {
    const { default: Mascota } = await import('../src/models/mascota.model.js');
    Mascota.findByPk.mockResolvedValueOnce(null);

    const { default: request } = await import('supertest');
    const res = await request(app)
      .patch('/api/v1/mascotas/999')
      .send({ estado: 'ENCONTRADA' });
    expect(res.statusCode).toBe(404);
  });

  it('retorna 400 si el estado enviado es inválido', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app)
      .patch('/api/v1/mascotas/1')
      .send({ estado: 'INVALIDO' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('retorna 200 con actualización parcial válida', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app)
      .patch('/api/v1/mascotas/1')
      .send({ estado: 'ENCONTRADA' });
    expect(res.statusCode).toBe(200);
  });

  it('retorna 200 al actualizar con multipart/form-data', async () => {
    const { default: request } = await import('supertest');
    const payload = JSON.stringify({ estado: 'ENCONTRADA' });
    const res = await request(app)
      .patch('/api/v1/mascotas/1')
      .field('mascota', payload);
    expect(res.statusCode).toBe(200);
  });
});


describe('DELETE /api/v1/mascotas/:id', () => {
  it('retorna 404 si la mascota a eliminar no existe', async () => {
    const { default: Mascota } = await import('../src/models/mascota.model.js');
    Mascota.findByPk.mockResolvedValueOnce(null);

    const { default: request } = await import('supertest');
    const res = await request(app).delete('/api/v1/mascotas/999');
    expect(res.statusCode).toBe(404);
  });

  it('retorna 204 al eliminar una mascota existente', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app).delete('/api/v1/mascotas/1');
    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});  
  });
});