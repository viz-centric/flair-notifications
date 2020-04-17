'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const logger = require('../../logger');


let config = require(__dirname + '/../config.js')[env];
const db = {};

let sequelize;

logger.info(`process.env:   ${JSON.stringify(process.env)}`);

logger.info(`process.env.NODE_ENV:   ${process.env.NODE_ENV}`);

setEnvironment();

logger.info(`config: ${JSON.stringify(config)}`);

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

function setEnvironment() {

  if (process.env.DATABASE_USERNAME) {
    config.username = process.env.DATABASE_USERNAME;
  }

  if (process.env.DATABASE_PASSWORD) {
    config.password = process.env.DATABASE_PASSWORD;
  }

  if (process.env.DATABASE_NAME) {
    config.database = process.env.DATABASE_NAME;
  }

  if (process.env.DATABASE_HOSTNAME) {
    config.host = process.env.DATABASE_HOSTNAME;
  }

  if (process.env.DATABASE_PORT) {
    config.port = process.env.DATABASE_PORT;
  }

  if (process.env.DATABASE_DIALECT) {
    config.dialect = process.env.DATABASE_DIALECT;
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
