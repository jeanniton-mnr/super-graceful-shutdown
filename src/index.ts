import { NextFunction, Response, Request, Application } from 'express';
import { Server } from 'http';
import net, { Server as NetServer } from 'net';
import process from 'process';

class App {
  static PORT = 3000;
  static KEY = 'shutdown';

  public exitIsRequested: boolean;
  public timeoutID: any;

  public app: Application;
  public server: NetServer;
  public callback?: () => void;

  private activeConnections: Array<Request>;
  private tcpServer: any;

  constructor(app: Application, server: Server, callback?: () => void) {
    this.app = app;
    this.server = server;
    this.callback = callback;
    this.exitIsRequested = false;
    this.timeoutID = null;

    this.activeConnections =  [];
    this.tcpServer = net.createServer(socket => {
      socket.on('data', data => {
        const msg = data.toString();
        console.warn('SuperGracefulShutdonw received TCP message:', msg);
        const isShutdown = msg.indexOf(App.KEY) != -1;
        if (isShutdown) { this.onShutdown() }
      });
    });

  // Count how many connections are active
  this.app.use(async (req: Request, res: Response, next: NextFunction) => {
    // Add the current connection to the activeConnections array
    this.activeConnections.push(req);
    console.warn(`+ open connection(s): ${this.activeConnections.length}.`);

    // Remove the connection from the activeConnections array when it is fullfiled / finished.
    // A `finish` event is emitted by the response object (res) in Express when all data has been written to the underlying system and the response has been sent to the client.
    res.on('finish', () => {
      const index = this.activeConnections.indexOf(req);
      if (index !== -1) {
        this.activeConnections.splice(index, 1);
      }
      console.warn(`- open connection(s): ${this.activeConnections.length}.`);
    });

    next();
  });

    // Respond with 503 Service Unavailable if exit is required
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      this.exitIsRequested ? res.sendStatus(503) : next();
    });

    this.tcpServer.listen(App.PORT, () => {
      console.warn(
        "SuperGracefulShutdonw's TCP server is listening on port",
        App.PORT
      );
    });
  }

  public onShutdown() {
    console.warn('Trying to gracefully shutting the server application down.');
    this.exitIsRequested = true;
    this.tryShutdown();
  }

  public async tryShutdown() {
    const connectionsCount = await this.getConnectionCount();

    if (connectionsCount) {
      this.timeoutID = setTimeout(this.tryShutdown.bind(this), 1000);
    } else {
      clearTimeout(this.timeoutID);
      this.tcpServer.close();
      this.server.close(() => { console.warn('HTTP(S) server closed') });
      this.callback && this.callback();
      
      setTimeout(() => {
        process.kill(process.pid, 'SIGTERM');
        process.exit(0)
      }, 2000);
    }
  }

  public async getConnectionCount() {
    const promise = new Promise((resolve, reject) => {
      try {
        resolve(this.activeConnections.length);
      } catch (error) {
        reject(error);
      }
    });
    return promise;
  }

}

export default App;