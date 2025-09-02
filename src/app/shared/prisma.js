import { PrismaClient } from "@prisma/client";

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ["query", "error", "warn"], // optional logging for debugging
  });
}

prisma = global.prisma;

export default prisma;
