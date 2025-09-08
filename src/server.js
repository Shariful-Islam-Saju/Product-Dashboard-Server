// import config from "./app/config/index.js";
// import app from "./app.js";

// async function main() {
//   const server = app.listen(config.port, () => {
//     console.log(`Server is running in http://localhost:${config.port}`);
//   });

//   const exitHandler = () => {
//     if (server) {
//       server.close(() => {
//         console.info("Server closed!");
//       });
//     }
//     process.exit(1);
//   };

//   process.on("uncaughtException", (error) => {
//     console.error(error);
//     exitHandler();
//   });

//   process.on("unhandledRejection", (error) => {
//     console.error(error);
//     exitHandler();
//   });
// }

// main();

import app from "./app.js";
import config from "./app/config/index.js";



if (config.env !== "production" && !process.env.PASSENGER) {
  app.listen(config.port, () => {
    console.log(`🚀 Server listening on http://localhost:${config.port}`);
  });
}
