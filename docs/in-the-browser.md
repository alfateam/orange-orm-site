# In the browser

You can use <span v-html="$projectName"></span> in the browser by using the adapter for Express or Hono. Instead of sending raw SQL queries from the client to the server, this approach records the method calls in the client. These method calls are then replayed at the server, ensuring a higher level of security by not exposing raw SQL on the client side.
Raw sql queries, raw sql filters and transactions are disabled at the http client due to security reasons.\
If you would like <span v-html="$projectName"></span> to support other web frameworks, like nestJs, fastify, etc, please let me know.

<Badge type="info" text="📄 server.ts" />

```ts
import map from './map';
import { json } from 'body-parser';
import express from 'express';
import cors from 'cors';

const db = map.sqlite('demo.db');

express().disable('x-powered-by')
  .use(json({ limit: '100mb' }))
  .use(cors())
  //for demonstrational purposes, authentication middleware is not shown here.
  .use('/orange', db.express())
  .listen(3000, () => console.log('Example app listening on port 3000!'));
```

<Badge type="info" text="📄 browser.ts" />

```ts
import map from './map';

const db = map.http('http://localhost:3000/orange');

updateRows();

async function updateRows() {
  const order = await db.order.getOne({
    where: x => x.lines.any(line => line.product.startsWith('Magic wand'))
      .and(x.customer.name.startsWith('Harry'),
    lines: true
  });

  order.lines.push({
    product: 'broomstick',
    amount: 300,
  });

  await order.saveChanges();
}

```

## Hono adapter

You can host the same HTTP endpoint with Hono by replacing `db.express()` with `db.hono()`. The browser client setup stays the same (`map.http(...)`), so you can reuse the `browser.ts` example above.

<Badge type="info" text="📄 server.ts" />

```ts
import map from './map';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

const db = map.sqlite('demo.db');
const app = new Hono();

app.use('/orange', cors());
app.use('/orange/*', cors());
// for demonstrational purposes, authentication middleware is not shown here.
app.all('/orange', db.hono());
app.all('/orange/*', db.hono());

serve({ fetch: app.fetch, port: 3000 });
```

`baseFilter` and transaction hooks are also supported in `db.hono({...})`, using Hono-style request/response objects.

## Plain reads {#plain-reads}

The HTTP client supports the same untracked fetch methods as a local database client:

```ts
import map from './map';

const db = map.http('http://localhost:3000/orange');

db.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer <token>';
  return config;
});

const orders = await db.order.getMany.plain({
  where: x => x.customerId.eq(42),
  orderBy: 'id',
  lines: true
});
const firstOrder = await db.order.getOne.plain({ orderBy: 'id' });
const order = await db.order.getById.plain(123, { lines: true });
```

`.plain()` skips client-side change tracking and reactive wrapping, which makes reads faster and lighter — especially for large result sets. It uses the existing server read operation, so authentication middleware, interceptors, transaction hooks, server-side `baseFilter`, table exposure and query validation still apply through Express and Hono. An explicit primary key cannot bypass the root table's `baseFilter`; ad-hoc targets must be exposed and keep their own `baseFilter`.

Raw SQL queries and raw SQL filters remain disallowed over HTTP. Configure authentication and access rules on the server as with ordinary fetch methods; `.plain()` does not grant access or make the endpoint read-only.

Results have no active record methods. `getMany.plain()` returns `[]` for no matches; `getOne.plain()` and `getById.plain()` return `undefined`. See [plain results](./fetching-rows.md#plain-results) for method details and TypeScript behavior.

## Interceptors and base filter {#interceptors-and-base-filter}

In the next setup, axios interceptors are employed on the client side to add an Authorization header of requests. Meanwhile, on the server side, an Express middleware (validateToken) is utilized to ensure the presence of the Authorization header, while a base filter is applied on the order table to filter incoming requests based on the `customerId` extracted from this header.

This combined approach enhances security by ensuring that users can only access data relevant to their authorization level and that every request is accompanied by a token. In real-world applications, it's advisable to use a more comprehensive token system and expand error handling to manage a wider range of potential issues.

One notable side effect compared to the previous example, is that only the order table is exposed for interaction, while all other potential tables in the database remain shielded from direct client access (except for related tables). If you want to expose a table without a baseFilter, just set the tableName to an empty object.

<Badge type="info" text="📄 server.ts" />

```ts
import map from './map';
import { json } from 'body-parser';
import express from 'express';
import cors from 'cors';

const db = map.sqlite('demo.db');

express().disable('x-powered-by')
  .use(json({ limit: '100mb' }))
  .use(cors())
  .use('/orange', validateToken)
  .use('/orange', db.express({
    order: {
      baseFilter: (db, req, _res) => {
        const customerId = Number.parseInt(req.headers.authorization.split(' ')[1]); //Bearer 2
        return db.order.customerId.eq(Number.parseInt(customerId));
      }
    }
  }))
  .listen(3000, () => console.log('Example app listening on port 3000!'));

function validateToken(req, res, next) {
  // For demo purposes, we're just checking against existence of authorization header
  // In a real-world scenario, this would be a dangerous approach because it bypasses signature validation
  const authHeader = req.headers.authorization;
  if (authHeader)
    return next();
  else
    return res.status(401).json({ error: 'Authorization header missing' });
}
```

<Badge type="info" text="📄 browser.ts" />

```ts
import map from './map';

const db = map.http('http://localhost:3000/orange');

updateRows();

async function updateRows() {

  db.interceptors.request.use((config) => {
    // For demo purposes, we're just adding hardcoded token
    // In a real-world scenario, use a proper JSON web token
    config.headers.Authorization = 'Bearer 2' //customerId
    return config;
  });

  db.interceptors.response.use(
    response => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.dir('Unauthorized, dispatch a login action');
        //redirectToLogin();
      }
      return Promise.reject(error);
    }
  );

  const order = await db.order.getOne({
    where: x => x.lines.any(line => line.product.startsWith('Magic wand'))
      .and(db.order.customer.name.startsWith('Harry')),
    lines: true
  });

  order.lines.push({
    product: 'broomstick',
    amount: 300
  });

  await order.saveChanges();

}

```

## Row Level Security

You can enforce tenant isolation at the database level by combining Postgres RLS with Express hooks. The example below mirrors the [Interceptors and base filter](#interceptors-and-base-filter) style by putting the tenant id in a (fake) token on the client, then extracting it on the server and setting it inside the transaction.

This is convenient for a demo because we can seed data and prove rows are filtered. In a real application you must validate signatures and derive tenant id from a trusted identity source, not from arbitrary client input.

<Badge type="info" text="📄 setup.sql" />

```sql
create role rls_app_user nologin;

create table tenant_data (
  id serial primary key,
  tenant_id int not null,
  value text not null
);

alter table tenant_data enable row level security;
create policy tenant_data_tenant on tenant_data
  using (tenant_id = current_setting('app.tenant_id', true)::int);

grant select, insert, update, delete on tenant_data to rls_app_user;

insert into tenant_data (tenant_id, value) values
  (1, 'alpha'),
  (1, 'beta'),
  (2, 'gamma');
```

<Badge type="info" text="📄 server.ts" />

```ts
import map from './map';
import { json } from 'body-parser';
import express from 'express';
import cors from 'cors';

const db = map.postgres('postgres://postgres:postgres@localhost/postgres');

express().disable('x-powered-by')
  .use(json({ limit: '100mb' }))
  .use(cors())
  .use('/orange', validateToken)
  .use('/orange', db.express({
    hooks: {
      transaction: {
        //beforeBegin: async (db, req) => ...,
        afterBegin: async (db, req) => {
          const tenantId = Number.parseInt(String(req.user?.tenantId ?? ''), 10);
          if (!Number.isFinite(tenantId)) throw new Error('Missing tenant id');
          await db.query('set local role rls_app_user');
          await db.query({
            sql: 'select set_config(\'app.tenant_id\', ?, true)',
            parameters: [String(tenantId)]
          });
        },
        //beforeCommit: async (db, req) => ...,
        //afterCommit: async (db, req) => ...,
        // afterRollback: async (db, req, error) => {
        //   console.dir(error);
        // }
      }
    }
  }))
  .listen(3000, () => console.log('Example app listening on port 3000!'));

function validateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
  try {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const payload = decodeFakeJwt(token); // demo-only, do not use in production
    req.user = { tenantId: String(payload.tenantId) };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function decodeFakeJwt(token) {
  // Demo-only format: "tenant:<id>"
  const match = /^tenant:(\d+)$/.exec(token);
  if (!match) throw new Error('Invalid demo token');
  return { tenantId: Number(match[1]) };
}
```

<Badge type="info" text="📄 browser.ts" />

```ts
import map from './map';

const db = map.http('http://localhost:3000/orange');

db.interceptors.request.use((config) => {
  // Demo-only token: payload carries the tenant id so we can verify filtering
  config.headers.Authorization = 'Bearer tenant:1';
  return config;
});

const rows = await db.tenant_data.getMany();
// rows => [{ id: 1, tenant_id: 1, value: 'alpha' }, { id: 2, tenant_id: 1, value: 'beta' }]
```
