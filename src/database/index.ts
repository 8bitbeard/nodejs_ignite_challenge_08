import { Connection, getConnectionOptions, createConnection } from 'typeorm';

export default async (host = "database", port = 5432): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  console.log(defaultOptions)

  return createConnection(
    Object.assign(defaultOptions, {
      host: process.env.NODE_ENV === "test" ? "localhost" : host,
      port: process.env.NODE_ENV === "test" ? 5107 : port,
      database:
        process.env.NODE_ENV === "test"
          ? "fin_api"
          : defaultOptions.database,
    })
  );
};
