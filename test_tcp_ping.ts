import * as dotenv from "dotenv";
dotenv.config();
import * as net from "net";

async function tcpPing(host: string, port: number, timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function run() {
  const isOnline = await tcpPing("192.168.1.6", 80);
  console.log("Device TCP ping result:", isOnline);
}

run();
