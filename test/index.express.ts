const express = require('express');
const SGS = require('../src');

const app = express();
const router = express.Router();
const port = 80;

const date = (currentDate = new Date()) => currentDate.toLocaleString('en-us');

router.get('/api1', async function (req, res, next) {
  try {
    console.log('setTimeout(onShutdown, 2000);');
    setTimeout(sgs.onShutdown.bind(sgs), 2000);

    console.log('The work of /api1 will be fulffiled in 5 sec.');
    setTimeout(() => {
      res.status(200).send(`<html> <body> <h1>${date()}</h1> </body> </html>`);
      console.log('The work of /api1 is fulfiled');
    }, 5000);
  } catch (error) {
    next(error);
  }
});

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

// Initialize super-graceful-shutdown
const sgs = new SGS(app, server);

app.use('/', router);
