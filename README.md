# req-fix-hostname

[![NPM](https://badge.fury.io/js/req-fix-hostname.svg)](https://npm.im/req-fix-hostname)
[![CI](https://github.com/someimportantcompany/req-fix-hostname/workflows/CI/badge.svg?branch=master)](https://github.com/someimportantcompany/req-fix-hostname/actions?query=branch%3Amaster)
[![Typescript](https://img.shields.io/badge/TS-TypeScript-%230074c1.svg)](https://www.typescriptlang.org)

Overwrite `req.hostname` with the value from another header - similar to how `X-Forwarded-Host` works with proxies.

## Express

```ts
import express from 'express';
import { express as reqFixHostname } from 'req-fix-hostname';

const app = express();

if (process.env.X_FWD_HOST_HEADER) {
  // If X_FWD_HOST_HEADER is set & that header is present on the request, rewrite req.hostname to that value
  app.use(reqFixHostname(process.env.X_FWD_HOST_HEADER.split(',').map(s => s.trim())));
}

app.get('/', (req, res) => {
  // req.hostname will be unchangesd
  res.status(200).json('Hello, world!');
});

// Assuming X_FWD_HOST_HEADER is omitted
// req.hostname is unchanged
// => "localhost", "dev.infra.example.com"

// Assuming X_FWD_HOST_HEADER is set to: X-Forwarded-Host
// And X-Forwarded-Host = dev.example.com
// req.hostname is overwritten
// => "dev.example.com"

// Assuming X_FWD_HOST_HEADER is set to: X-Secret-Forwarded-Host
// And X-Secret-Forwarded-Host = staging.example.com
// req.hostname is overwritten
// => "staging.example.com"

// Assuming X_FWD_HOST_HEADER is set to:
//   X-Secret-Forwarded-Host, X-Forwarded-Host
// And X-Forwarded-Host = dev.example.com
// And X-Secret-Forwarded-Host = dev2.example.com
// req.hostname is overwritten as dev2 was found first
// => "dev2.example.com"
```

### What about `trust proxy`?

> [Express behind proxies](https://expressjs.com/en/guide/behind-proxies.html) documentation

Services like AWS block developers from manipulating `X-Forwarded-Host`, or even the revised `Forwarded` header, so a new header (`X-Secret-Forwarded-Host`) needs to be set & used.
