require('dotenv').config();

module.exports =
  {
    "development": {
      "username": process.env.DATABASE_USERNAME || "postgres",
      "password": process.env.DATABASE_PASSWORD || "admin",
      "database": process.env.DATABASE_NAME || "nodeDB",
      "host": process.env.DATABASE_HOSTNAME || "127.0.0.1",
      "port": process.env.DATABASE_PORT || 5777,
      "dialect": process.env.DATABASE_DIALECT || "postgres"
    },
    "test": {
      "username": process.env.DATABASE_USERNAME || "postgres",
      "password": process.env.DATABASE_PASSWORD || "admin",
      "database": process.env.DATABASE_NAME || "nodeDB",
      "host": process.env.DATABASE_HOSTNAME || "127.0.0.1",
      "port": process.env.DATABASE_PORT || 5777,
      "dialect": process.env.DATABASE_DIALECT || "postgres"
    },
    "remote-dev": {
      "username": process.env.DATABASE_USERNAME || "postgres",
      "password": process.env.DATABASE_PASSWORD || "admin",
      "database": process.env.DATABASE_NAME || "nodeDB",
      "host": process.env.DATABASE_HOSTNAME || "flair-ap-pgsql-dev",
      "port": process.env.DATABASE_PORT || 5432,
      "dialect": process.env.DATABASE_DIALECT || "postgres"
    },
    "staging": {
      "username": process.env.DATABASE_USERNAME || "postgres",
      "password": process.env.DATABASE_PASSWORD || "admin",
      "database": process.env.DATABASE_NAME || "nodeDB",
      "host": process.env.DATABASE_HOSTNAME || "flair-ap-pgsql-stag",
      "port": process.env.DATABASE_PORT || 5432,
      "dialect": process.env.DATABASE_DIALECT || "postgres"
    },
    "production": {
      "username": process.env.DATABASE_USERNAME || "postgres",
      "password": process.env.DATABASE_PASSWORD || "admin",
      "database": process.env.DATABASE_NAME || "nodeDB",
      "host": process.env.DATABASE_HOSTNAME || "flair-notifications-pgsql",
      "port": process.env.DATABASE_PORT || 5432,
      "dialect": process.env.DATABASE_DIALECT || "postgres"
    },
    "local-dev": {
      "username": process.env.DATABASE_USERNAME || "postgres",
      "password": process.env.DATABASE_PASSWORD || "admin",
      "database": process.env.DATABASE_NAME || "flairnotify",
      "host": process.env.DATABASE_HOSTNAME || "flair-notifications-pgsql",
      "port": process.env.DATABASE_PORT || 5432,
      "dialect": process.env.DATABASE_DIALECT || "postgres"
    },
    "oss-dev": {
      "username": process.env.DATABASE_USERNAME || 'postgres',
      "password":  process.env.DATABASE_PASSWORD || "admin",
      "database":  process.env.DATABASE_NAME || "flairnotify",
      "host":  process.env.DATABASE_HOSTNAME || "flair-pgsql",
      "port":  process.env.DATABASE_PORT || 5432,
      "dialect": process.env.DATABASE_DIALECT || "postgres"
    },
    "jenkins": {
      "username": process.env.DATABASE_USERNAME || "postgres",
      "password": process.env.DATABASE_PASSWORD || "admin",
      "database": process.env.DATABASE_NAME || "flairnotify",
      "host": process.env.DATABASE_HOSTNAME || "flair-ap-pgsql",
      "port": process.env.DATABASE_PORT || 5777,
      "dialect": process.env.DATABASE_DIALECT || "postgres"
    },
    "kube": {
      "username": process.env.DATABASE_USERNAME || "postgres",
      "password": process.env.DATABASE_PASSWORD || "admin",
      "database": process.env.DATABASE_NAME || "flairnotify",
      "host": process.env.DATABASE_HOSTNAME || "flair-notifications-pg-postgresql",
      "port": process.env.DATABASE_PORT || 5432,
      "dialect": process.env.DATABASE_DIALECT || "postgres"
    }
  }
