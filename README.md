<!-- After completing the above you can use `npm publish` to publish your package, complete with type definitions and docs. -->


## Description

The super-graceful-shutdown npm package provides a super graceful way to shutdown an Express server application.

super-graceful-shutdown always make sure a response is sent to the client for any connections that were open before you send a super graceful "shutdown" message.

When you send the default `shutdown` message on default port `3000` to your node the Express app, super-graceful-shutdown will gracefully wait for all requests to close, ensuring a response is sent to the client; block any new connections; shutdown the server; then terminate node process.


## Usage
To use the super-graceful-shutdown package, follow these steps:

1. Import the package and initialize it using its constructor with an instance of your Express app and server:

```
const express = require('express');
const SGS = require('super-graceful-shutdown');

const app = express();
const router = express.Router();
const port = 80; // Set your desired port number

// ...

router.get('/api1', async function(req, res, next){
  try {
      setTimeout(() => { res.status(200).send(`<html> <body> <h1>${date()}</h1> </body> </html>`)  }, 3000);
    } catch (error) {
      next(error);
    }
});

const server = app.listen(port, () => console.log(`Example Express app listening on port ${port}!`) );

// ℹ️ Before you initialize other routes, you need to initialize super-graceful-shutdown
new SGS(app, server);

// 👨‍💻 Then, you can initialize other routes
app.use('/', router);
```

2. Once your Express app is running, to super gracefully shutdown your Node.Js Express application through your host CLI, run this command:

```
echo "shutdown" | nc localhost 3000
````

## Notes
Do not expose port 3000 to prevent outsiders from shutting down your application. You can [find](https://www.digitalocean.com/community/tutorials/opening-a-port-on-linux) an article on how to allow or block a port to the outside network in this link provided by DigitalOcean.

## Reference:
I have this npm [package boilerplate](https://github.com/ryansonshine/typescript-npm-package-template/tree/main) to create this package.

### Author
[Monero Jeanniton](https://www.linkedin.com/in/monero-jeanniton-0431826a/)
