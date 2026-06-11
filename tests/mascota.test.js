// tests/mascota.test.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/config/database.js', () => ({
  default: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    define: jest.fn().mockReturnValue({}),
  },
}));

jest.unstable_mockModule('../src/models/mascota.model.js', () => ({
  default: {
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 1, nombre: 'Rex' }),
    destroy: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue({ id: 1 }),
  },
}));

// import dinámico DESPUÉS de los mocks
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
});

describe('GET /api/v1/mascotas/:id - no encontrado', () => {
  it('retorna 404 si la mascota no existe', async () => {
    const { default: request } = await import('supertest');
    const res = await request(app).get('/api/v1/mascotas/999');
    expect(res.statusCode).toBe(404);
  });
});