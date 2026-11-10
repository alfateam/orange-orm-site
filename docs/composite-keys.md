# Composite keys

A composite key is defined by marking multiple columns as primary keys. This is done using the `.primary()` method on each column that is part of the composite key.

Consider a scenario where we have orders and order lines, and each order line is uniquely identified by combining the order type, order number, and line number.

```js
import orange from 'orange-orm';

const map = orange.map(x => ({
  order: x.table('_order').map(({ column }) => ({
    orderType: column('orderType').string().primary().notNull(),
    orderNo: column('orderNo').numeric().primary().notNull(),
    orderDate: column('orderDate').date().notNull(),
  })),

  orderLine: x.table('orderLine').map(({ column }) => ({
    orderType: column('orderType').string().primary().notNull(),
    orderNo: column('orderNo').numeric().primary().notNull(),
    lineNo: column('lineNo').numeric().primary().notNull(),
    product: column('product').string(),
  }))
})).map(x => ({
  order: x.order.map(v => ({
    lines: v.hasMany(x.orderLine).by('orderType', 'orderNo'),
  }))
}));

export default map;
```

## Fetching without change tracking

`getById.plain()` takes the primary-key values in the order they are declared in the mapping, followed by an optional fetching strategy:

```ts
const order = await db.order.getById.plain('typeA', 100, { lines: true });
const line = await db.orderLine.getById.plain('typeA', 100, 1);
```

Each call returns an untracked row or `undefined` when no row matches. Included relations are also untracked. See [plain results](./fetching-rows.md#plain-results).
