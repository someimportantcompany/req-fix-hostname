import createDebug from 'debug';
import express from 'express';
import supertest from 'supertest';
import { randomBytes } from 'crypto';

import reqFixHostname from '../express';

const debug = createDebug('rfh:express');

describe('express', () => {
  const knownHeader = 'X-Forwarded-Host';
  const unknownHeader = `X-Secret-${randomBytes(4).toString('hex').toUpperCase()}-Header`;


  const app = express();

  app.use((req, _res, next) => {
    debug('req.hostname', req.hostname);
    next();
  });

  app.use(reqFixHostname([knownHeader, unknownHeader]));

  app.use((req, _res, next) => {
    debug('req.hostname', req.hostname);
    next();
  });

  app.use((req, res) => {
    res.status(200).json({
      hostname: req.hostname,
      hostHeader: req.get('Host'),
      knownHeader: req.get(knownHeader),
      unknownHeader: req.get(unknownHeader),
      headers: req.headers,
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err, _req, res, _next) => {
    debug('err', err);
    res.status(500).json({
      errCode: err.code,
      errMessage: err.message,
      errStatus: err.status,
    });
  });


  it('should handle a localhost setup', async () => {
    await supertest(app)
      .get('/')
      .set('Host', '127.0.0.1:0')
      .expect(200)
      .expect({
        hostname: '127.0.0.1',
        hostHeader: '127.0.0.1:0',
        headers: {
          'accept-encoding': 'gzip, deflate',
          'connection': 'close',
          'host': '127.0.0.1:0',
        },
      });
  });

  it('should typical fixed setup', async () => {
    await supertest(app)
      .get('/')
      .set('Host', 'dev.example.com')
      .expect(200)
      .expect({
        hostname: 'dev.example.com',
        hostHeader: 'dev.example.com',
        headers: {
          'accept-encoding': 'gzip, deflate',
          'connection': 'close',
          'host': 'dev.example.com',
        },
      });
  });

  it(`should overwrite the req.hostname with ${knownHeader}`, async () => {
    const hostname = `${randomBytes(4).toString('hex').toLowerCase()}.example.com`;

    await supertest(app)
      .get('/')
      .set('Host', '127.0.0.1:0')
      .set(knownHeader, hostname)
      .expect(200)
      .expect({
        hostname,
        hostHeader: '127.0.0.1:0',
        knownHeader: hostname,
        headers: {
          'accept-encoding': 'gzip, deflate',
          'connection': 'close',
          'host': '127.0.0.1:0',
          [knownHeader.toLowerCase()]: hostname,
        },
      });
  });

  it(`should overwrite the req.hostname with ${unknownHeader}`, async () => {
    const hostname = `${randomBytes(4).toString('hex').toLowerCase()}.example.com`;

    await supertest(app)
      .get('/')
      .set('Host', '127.0.0.1:0')
      .set(unknownHeader, hostname)
      .expect(200)
      .expect({
        hostname,
        hostHeader: '127.0.0.1:0',
        unknownHeader: hostname,
        headers: {
          'accept-encoding': 'gzip, deflate',
          'connection': 'close',
          'host': '127.0.0.1:0',
          [unknownHeader.toLowerCase()]: hostname,
        },
      });
  });

  it(`should overwrite the req.hostname with ${knownHeader} & ${unknownHeader}`, async () => {
    const hostname1 = `${randomBytes(4).toString('hex').toLowerCase()}.example.com`;
    const hostname2 = `${randomBytes(4).toString('hex').toLowerCase()}.example.com`;

    await supertest(app)
      .get('/')
      .set('Host', '127.0.0.1:0')
      .set(knownHeader, hostname1)
      .set(unknownHeader, hostname2)
      .expect(200)
      .expect({
        hostname: hostname1,
        hostHeader: '127.0.0.1:0',
        knownHeader: hostname1,
        unknownHeader: hostname2,
        headers: {
          'accept-encoding': 'gzip, deflate',
          'connection': 'close',
          'host': '127.0.0.1:0',
          [knownHeader.toLowerCase()]: hostname1,
          [unknownHeader.toLowerCase()]: hostname2,
        },
      });
  });
});
