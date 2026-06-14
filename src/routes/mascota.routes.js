import { Router } from 'express';
import multer from 'multer';
import mascotaController from '../controllers/mascota.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createMascotaSchema, updateMascotaSchema } from '../validations/mascota.validation.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const parseMascotaField = (req, res, next) => {
    try {
        if (req.body.mascota && typeof req.body.mascota === 'string') {
            req.body = { ...req.body, ...JSON.parse(req.body.mascota) };
        }
    } catch (e) {
        return res.status(400).json({ error: 'JSON inválido en campo mascota' });
    }
    next();
};

// debe ir ANTES de /:id para que "dashboard" no sea tratado como un ID
router.get('/dashboard', mascotaController.getDashboard);

// POST /api/v1/mascotas
router.post(
    '/',
    upload.single('archivo'),
    parseMascotaField,
    validate(createMascotaSchema),
    mascotaController.crearMascota
);

// GET /api/v1/mascotas?estado=PERDIDA
router.get('/', mascotaController.listarMascotas);

// GET /api/v1/mascotas/:id
router.get('/:id', mascotaController.obtenerMascota);

// PATCH /api/v1/mascotas/:id
router.patch(
    '/:id',
    upload.single('archivo'),
    parseMascotaField,
    validate(updateMascotaSchema),
    mascotaController.actualizarMascotaParcial
);

// DELETE /api/v1/mascotas/:id
router.delete('/:id', mascotaController.eliminarMascota);

export default router;