import { Connection, createConnection, getConnectionOptions } from "typeorm";

export default async (host = "database", port = 5432): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  return createConnection(
    Object.assign(defaultOptions, {
      host: process.env.NODE_ENV === "test" ? "localhost" : host,
      port: process.env.NODE_ENV === "test" ? 5105 : port,
      database:
        process.env.NODE_ENV === "test"
          ? "fin_api"
          : defaultOptions.database,
    })
  );
};
