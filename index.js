import 'dotenv/config';
import app from './src/app.js';
import sequelize from './src/config/database.js';

const PORT = process.env.PORT || 8080;

try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada');
    app.listen(PORT, () => {
        console.log(`Mascotas service corriendo en puerto ${PORT}`);
    });
    } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
    process.exit(1);
}