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
