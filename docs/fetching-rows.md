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
