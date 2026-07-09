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

## Row locks with forUpdate and skipLocked

Use `forUpdate: true` in a fetching strategy to lock selected rows for update until the current transaction completes. Add `skipLocked: true` when concurrent workers should skip rows that are already locked instead of waiting for them. This is useful for queue-like workloads where several workers pick the next available rows.

`forUpdate` and `skipLocked` should be used inside a transaction. They are supported by PostgreSQL/PGlite, MySQL, MariaDB, Oracle, and MS SQL. SQLite and SAP ASE throw an error because row locking with `SELECT FOR UPDATE` is not supported there.

```js
import map from './map';
const db = map.postgres('postgres://postgres:postgres@postgres/postgres');

async function claimNextOrders() {
  return await db.transaction(async tx => {
    const orders = await tx.order.getMany({
      where: x => x.orderDate.lessThan(new Date()),
      orderBy: 'id',
      limit: 10,
      forUpdate: true,
      skipLocked: true,
      lines: {
        forUpdate: true
      }
    });

    for (const order of orders) {
      order.orderDate = new Date();
    }

    await orders.saveChanges();
    return orders;
  });
}
```

The same lock strategy can be passed to write helpers that return affected rows:

```js
const updated = await db.transaction(async tx => {
  return await tx.customer.update(
    { name: 'Updated' },
    { where: x => x.id.eq(customerId) },
    { forUpdate: true, skipLocked: true }
  );
});
```
