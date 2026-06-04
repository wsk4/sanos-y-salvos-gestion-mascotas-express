const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, param, query, validationResult } = require('express-validator');
const mascotaController = require('../controllers/mascota.controller');

const upload = multer({ storage: multer.memoryStorage() });

// Validaciones que replican las anotaciones @Valid / @Pattern / @Size del modelo Java
const validacionesMascota = [
    body('nombre')
        .notEmpty().withMessage('El nombre de la mascota no puede estar vacío')
        .isLength({ min: 3 }).withMessage('El nombre debe tener mas de 3 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),

    body('raza')
        .notEmpty().withMessage('La raza es obligatoria')
        .isLength({ min: 3}).withMessage('La raza debe tener mas de 3 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/).withMessage('La raza solo puede contener letras'),

    body('color')
        .notEmpty().withMessage('El color es obligatorio')
        .isLength({ min: 4}).withMessage('El color debe tener ams de 4 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,]+$/).withMessage('El color solo debe contener letras'),

    body('tamano')
        .notEmpty().withMessage('El tamaño es obligatorio')
        .matches(/^(pequeño|mediano|grande)$/i).withMessage('El tamaño debe ser PEQUEÑO, MEDIANO o GRANDE'),

    body('estado')
        .notEmpty().withMessage('El estado (PERDIDA/ENCONTRADA) es obligatorio')
        .matches(/^(PERDIDA|ENCONTRADA)$/).withMessage('El estado debe ser exactamente PERDIDA o ENCONTRADA'),

    body('contactoInfo')
        .notEmpty().withMessage('La información de contacto es obligatoria')
        .isLength({ min: 9, max: 30 }).withMessage('La información de contacto debe tener entre 9 y 30 caracteres')
        .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ@.\+\-\s]+$/).withMessage('El contacto contiene caracteres especiales no permitidos'),
];

const manejarErroresValidacion = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// POST /api/v1/mascotas  — multipart/form-data
router.post(
    '/',
    upload.single('archivo'),
    (req, res, next) => {
        // Parsear JSON del campo "mascota" del multipart
        try {
        if (req.body.mascota && typeof req.body.mascota === 'string') {
            req.body = { ...req.body, ...JSON.parse(req.body.mascota) };
        }
        } catch (e) {
        return res.status(400).json({ error: 'JSON inválido en campo mascota' });
        }
        next();
    },
    validacionesMascota,
    manejarErroresValidacion,
    mascotaController.crearMascota
);

// GET /api/v1/mascotas?estado=PERDIDA
router.get('/', mascotaController.listarMascotas);

// GET /api/v1/mascotas/:id
router.get('/:id', mascotaController.obtenerMascota);

// PATCH /api/v1/mascotas/:id — multipart/form-data
router.patch(
    '/:id',
    upload.single('archivo'),
    (req, res, next) => {
        try {
        if (req.body.mascota && typeof req.body.mascota === 'string') {
            req.body = { ...req.body, ...JSON.parse(req.body.mascota) };
        }
        } catch (e) {
        return res.status(400).json({ error: 'JSON inválido en campo mascota' });
        }
        next();
    },
    mascotaController.actualizarMascotaParcial
);

// DELETE /api/v1/mascotas/:id
router.delete('/:id', mascotaController.eliminarMascota);

module.exports = router;