const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
    }
);

const Mascota = sequelize.define('Mascota', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING(12),
        allowNull: false,
    },
    raza: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    color: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    tamano: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    fotoBytes: {
        type: DataTypes.BLOB,
        field: 'foto_bytes',
        allowNull: true,
    },
    fotoUrl: {
        type: DataTypes.STRING,
        field: 'foto_url',
        allowNull: true,
    },
    estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    fechaReporte: {
        type: DataTypes.DATE,
        field: 'fecha_reporte',
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    contactoInfo: {
        type: DataTypes.STRING(50),
        field: 'contacto_info',
        allowNull: false,
    },
    }, {
    tableName: 'mascotas',
    timestamps: false,
    hooks: {
        beforeCreate: (mascota) => {
        mascota.fechaReporte = new Date();
        }
    }
});

module.exports = { sequelize, Mascota };