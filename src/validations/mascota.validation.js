import { z } from 'zod';

export const createMascotaSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener más de 3 caracteres')
    .max(12)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  raza: z
    .string()
    .min(3, 'La raza debe tener más de 3 caracteres')
    .max(15)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/, 'La raza solo puede contener letras'),
  color: z
    .string()
    .min(4, 'El color debe tener más de 4 caracteres')
    .max(15)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,]+$/, 'El color solo debe contener letras'),
  tamano: z
    .string()
    .regex(/^(pequeño|mediano|grande)$/i, 'El tamaño debe ser pequeño, mediano o grande'),
  estado: z
    .string()
    .regex(/^(PERDIDA|ENCONTRADA)$/, 'El estado debe ser exactamente PERDIDA o ENCONTRADA'),
  contactoInfo: z
    .string()
    .min(9, 'La información de contacto debe tener entre 9 y 30 caracteres')
    .max(30)
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ@.\+\-\s]+$/,
      'El contacto contiene caracteres especiales no permitidos'
    ),
});

export const updateMascotaSchema = createMascotaSchema.partial();