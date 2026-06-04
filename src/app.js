require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models/mascota.model');
const mascotaRoutes = require('./routes/mascota.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use('/api/v1/mascotas', mascotaRoutes);
app.use(errorHandler);

sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos sincronizada');
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
}).catch(err => {
    console.error('Error al conectar con la base de datos:', err);
});