# Fetching strategies

Efficient data retrieval is crucial for the performance and scalability of applications. The fetching strategy gives you the freedom to decide how much related data you want to pull along with your primary request. Below are examples of common fetching strategies, including fetching entire relations and subsets of columns. When no fetching strategy is present, it will fetch all columns without its relations.

## Including a relation

This example fetches orders and their corresponding delivery addresses, including all columns from both entities.

```js
import map from './map';
const db = map.sqlite('demo.db');

getRows();

async function getRows() {
  const rows = await db.order.getMany({
    deliveryAddress: true
  });
}
```

## Ad-hoc relations

An ad-hoc relation adds rows from a mapped table to a result without declaring a permanent relationship in the mapping. Define it as a fetch-strategy callback and return `db.table.many()` or `db.table.one()` from that callback. The target table must be part of the mapping and exposed by the server when the query is sent over HTTP.

The callback separates the local row from the stable query context:

- Its first parameter is the current row that owns the ad-hoc property.
- `db` exposes the mapped tables and their `many()` and `one()` ad-hoc builders.
- `root` is the row from the top-level `getMany()` or `getOne()` call.

```js
const customers = await db.customer.getMany({
  name: true,
  recentOrders: (customer, { db }) => db.order.many({
    orderDate: true,
    where: order => order.customerId.eq(customer.id),
    orderBy: 'id',
    limit: 5,
    lines: {
      product: true,
      packagesForLine: (line, { db }) => db.package.many({
        where: pkg => pkg.lineId.eq(line.id),
        orderBy: 'id'
      })
    },
    firstLine: (order, { db, root }) => db.orderLine.one({
      where: line => line.orderId.eq(order.id)
        .and(order.customerId.eq(root.id)),
      orderBy: 'id'
    })
  })
});
```

Here, `customer` is the current row for `recentOrders`, `order` is the current row for `firstLine`, and `root` remains the top-level `customer`. `lines` and `packages` are mapped relations from the example mapping; `recentOrders`, `packagesForLine`, and `firstLine` are ad-hoc. TypeScript derives these types from where each ad-hoc property is placed. The `where` callback otherwise has the same syntax as an ordinary filter, including access to mapped relations.

Scopes are lexical. In the nested `firstLine` query, `order` refers to the current result from `recentOrders`, while `root` still refers to the top-level customer. Captured current-row variables remain tied to their original rows through batching and HTTP transport.

The callback form is required; a descriptor cannot be placed directly in a strategy as `matchingLines: db.orderLine.many(...)`. Keeping construction inside the callback is what gives the current row and `root` their exact types and runtime scope.

`many()` returns an array. `one()` returns one row or `null`; use `orderBy` when the matching filter can return several rows and the choice must be deterministic. Both support column selection, mapped relations, nested ad-hoc relations, `where`, `orderBy`, `limit`, and `offset`. `one()` always returns at most one row. The property name cannot collide with a mapped column, relation, or reserved strategy option.

Ad-hoc results are read-only and cannot use `forUpdate` or `skipLocked`. Simple equality correlations against the current or root row are fetched in batches, with up to 200 distinct scope values per batch or fewer when required by the database's parameter limit. More complex scope predicates can use a conservative per-owner fallback, so batching is not guaranteed for every query. Hidden values required to correlate `root` and captured current rows are selected and removed automatically.

If a fetched row is modified and persisted with `saveChanges()`, Orange re-runs its ad-hoc strategy and replaces the projection with fresh results. Changes made directly inside an ad-hoc result are not persisted.

## Including a subset of columns

In scenarios where only specific fields are required, you can specify a subset of columns to include. In the example below, orderDate is explicitly excluded, so all other columns in the order table are included by default. For the deliveryAddress relation, only countryCode and name are included, excluding all other columns. If you have a mix of explicitly included and excluded columns, all other columns will be excluded from that table.

```js
import map from './map';
const db = map.sqlite('demo.db');

getRows();

async function getRows() {
  const rows = await db.order.getMany({
    orderDate: false,
    deliveryAddress: {
      countryCode: true,
      name: true
    }
  });
}
```
