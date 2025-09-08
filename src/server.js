// import config from "./app/config/index.js";
import app from "./app.js";

async function main() {
  const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running in http://localhost:${process.env.PORT}`);
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed!");
      });
    }
    process.exit(1);
  };

  process.on("uncaughtException", (error) => {
    console.error(error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.error(error);
    exitHandler();
  });
}

main();

// import app from "./app.js";
// // import config from "./app/config/index.js";



// if (process.env.NODE_ENV !== "production" && !process.env.PASSENGER) {
//   app.listen(process.env.PORT, () => {
//     console.log(`🚀 Server listening on http://localhost:${process.env.PORT}`);
//   });
// }
