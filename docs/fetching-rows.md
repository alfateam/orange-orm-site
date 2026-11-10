# Fetching rows

<span v-html="$projectName"></span> has a rich querying model. As you navigate through, you'll learn about the various methods available to retrieve data from your tables, whether you want to fetch all rows, many rows with specific criteria, or a single row based on a primary key.

The fetching strategy in <span v-html="$projectName"></span> is optional, and its use is influenced by your specific needs. You can define the fetching strategy either on the table level or the column level. This granularity gives you the freedom to decide how much related data you want to pull along with your primary request.

## All rows

```js
import map from './map';
const db = map.sqlite('demo.db');

getRows();

async function getRows() {
  const orders = await db.order.getMany({
    customer: true,
    deliveryAddress: true,
    lines: {
      packages: true
    }
  });
}
```

## Limit, offset and order by

This script demonstrates how to fetch `orders` with `customer`, `lines`, `packages` and `deliveryAddress`, limiting the results to 10, skipping the first row, and sorting the data based on the `orderDate` in descending order followed by id. The `lines` are sorted by `product`.

```js
import map from './map';
const db = map.sqlite('demo.db');

getRows();

async function getRows() {
  const orders = await db.order.getMany({
    offset: 1,
    orderBy: ['orderDate desc', 'id'],
    limit: 10,
    customer: true,
    deliveryAddress: true,
    lines: {
      packages: true,
      orderBy: 'product'
    },
  });
}
```

For a mapped `hasMany` relation such as `lines`, `limit` and `offset` are applied independently for each parent order. The same per-parent pagination applies to an ad-hoc `many()` relation. Add an `orderBy` whenever the selected page must be deterministic.

## With aggregated results {#aggregate-results}

You can count records and aggregate numerical columns.
The following operators are supported:

- `count`
- `sum`
- `min`
- `max`
- `avg`

You can also elevate associated data to a parent level for easier access.\
In the example below, `balance` of the `customer` is elevated to the root level.

```js
import map from './map';
const db = map.sqlite('demo.db');

getRows();

async function getRows() {
  const orders = await db.order.getMany({
    numberOfLines: x => x.count(x => x.lines.id),
    totalAmount: x => x.sum(x => lines.amount),
    balance: x => x.customer.balance
  });
}
```

## Many rows filtered

```js
import map from './map';
const db = map.sqlite('demo.db');

getRows();

async function getRows() {
  const orders = await db.order.getMany({
    where: x => x.lines.any(line => line.product.contains('i'))
      .and(x.customer.balance.greaterThan(180)),
    customer: true,
    deliveryAddress: true,
    lines: true
  });
}
```

You can also build the `where` filter separately and pass it in via the `where` clause.\
This keeps the filter independent of the fetching strategy and easier to reuse.

```js
async function getRows() {
  const filter = db.order.lines.any(line => line.product.contains('i'))
                 .and(db.order.customer.balance.greaterThan(180));
  const orders = await db.order.getMany({
    where: filter,
    customer: true,
    deliveryAddress: true,
    lines: true
  });
}
```

## Single row filtered

```js
import map from './map';
const db = map.sqlite('demo.db');

getRows();

async function getRows() {
  const order = await db.order.getOne({
    where: x => x.customer(customer => customer.isActive.eq(true)
                 .and(customer.startsWith('Harr'))),
    customer: true,
    deliveryAddress: true,
    lines: true
  });
}
```

You can also build the `where` filter independently and reuse it.\
With `getOne`, you can combine the positional `where` filter with the `where` option to compose filters.

```js
async function getRows() {
  const filter = db.order.customer(customer => customer.isActive.eq(true)
                 .and(customer.startsWith('Harr')));
                 // equivalent, but creates slightly different SQL:
                 // const filter = db.order.customer.isActive.eq(true).and(db.order.customer.startsWith('Harr'));
  const order = await db.order.getOne({
    where: filter,
    customer: true,
    deliveryAddress: true,
    lines: true
  });
}
```

## Single row by primary key

```js
import map from './map';
const db = map.sqlite('demo.db');

getRows();

async function getRows() {
  const order = await db.order.getById(1, {
    customer: true,
    deliveryAddress: true,
    lines: true
  });
}
```

## Plain results without change tracking {#plain-results}

Use `getMany.plain()`, `getOne.plain()` and `getById.plain()` when you need data without change tracking or active record methods. Call `.plain()` on the fetch function, for example `db.order.getMany.plain({ lines: true })`.

Plain results also give better performance. Because no change tracking proxies or active record methods are set up, rows are materialized faster and use less memory. This is especially noticeable when fetching large result sets or deeply nested relations. Prefer `.plain()` for read-only scenarios such as rendering lists, reports or serializing to JSON, and use the tracked fetch methods only when you intend to modify and save the rows.

| Method | Result | No matching row |
| --- | --- | --- |
| `getMany.plain(strategy?)` | Array of untracked rows | `[]` |
| `getOne.plain(strategy?)` | First matching untracked row | `undefined` |
| `getById.plain(...keys, strategy?)` | Untracked row matching the primary key | `undefined` |

### getMany.plain()

```ts
const orders = await db.order.getMany.plain({
  where: x => x.customerId.eq(42),
  orderBy: 'id',
  limit: 20,
  lines: { packages: true }
});
```

Filtering, sorting, pagination and [fetching strategies](./fetching-strategies.md) work as with `getMany()`, including column selection, mapped relations and ad-hoc relations. All rows and nested relations in the result are untracked.

### getOne.plain()

```ts
const firstOrder = await db.order.getOne.plain({
  where: x => x.customerId.eq(42),
  orderBy: 'id',
  lines: true
});

if (firstOrder) {
  console.log(firstOrder.id);
}
```

This selects at most one row. Use `orderBy` when several rows can match and the choice of first row matters. An empty result is `undefined`.

### getById.plain()

```ts
const order = await db.order.getById.plain(123);
const orderWithLines = await db.order.getById.plain(123, { lines: true });
```

The optional fetching strategy follows the primary-key values. For [composite keys](./composite-keys.md), pass all key values in mapping order. An empty result is `undefined`.

### Mutability and TypeScript

Plain objects and arrays can be changed locally, but those edits are not tracked or persisted. They have no `saveChanges`, `save`, `refresh`, `delete`, `acceptChanges` or `clearChanges` methods. Use the regular tracked fetch methods for the [active record update workflow](./updating-rows.md).

TypeScript infers the selected columns and relations without active record methods. `getOne.plain()` and `getById.plain()` include `undefined` in their return types. `.plain()` also skips the configured `db.reactive(...)` wrapper.

The same methods are available on local transaction clients, such as `tx.order.getMany.plain()`.

### HTTP access controls

With `map.http(...)`, these methods use the same server read operation as their tracked counterparts. Authentication middleware, request interceptors, transaction hooks, server-side `baseFilter`, table exposure restrictions and query validation still apply through Express and Hono. Supplying a primary key does not bypass the root table's `baseFilter`. Ad-hoc relation targets must be exposed and retain their own `baseFilter`.

Use the filter DSL over HTTP; `.plain()` does not enable raw SQL queries or raw SQL filters. See [plain reads in the browser](./in-the-browser.md#plain-reads) for an example.

## Many rows by primary key

```js
import map from './map';
const db = map.sqlite('demo.db');

getRows();

async function getRows() {
  const orders = await db.order.getMany({
    where: () => [
      {id: 1},
      {id: 2}
    ],
    customer: true,
    deliveryAddress: true,
    lines: true
  });
}
```
