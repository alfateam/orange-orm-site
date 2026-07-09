# Updating rows

To update rows, modify the property values and invoke the method `saveChanges()`. The function updates only the modified columns, not the entire row. Rows in child relations can also be updated as long as the parent order <i>owns</i> the child tables.

In our illustration, the `order` table owns both the `deliveryAddress` and the `lines` tables because they're part of a <i>hasOne/hasMany relationship</i>.

Contrastingly, the `customer`is part of a <i>reference relationship</i> and thus can't be updated here. But you can detach the reference to the customer by assigning it to null or undefined.\
_(Setting `order.customerId` to null or undefined achieves the same result.)_

## Updating a single row

```js
import map from './map';
const db = map.sqlite('demo.db');

update();

async function update() {
  const order = await db.order.getById(1, {
    customer: true,
    deliveryAddress: true,
    lines: true
  });

  order.orderDate = new Date();
  order.deliveryAddress = null;
  order.lines.push({product: 'Cloak of invisibility', amount: 600});

  await order.saveChanges();
}
```

## Updating many rows

```js
import map from './map';
const db = map.sqlite('demo.db');

update();

async function update() {
  let orders = await db.order.getMany({
    orderBy: 'id',
    lines: true,
    deliveryAddress: true,
    customer: true
  });

  orders[0].orderDate = new Date();
  orders[0].deliveryAddress.street = 'Node street 2';
  orders[0].lines[1].product = 'Big guitar';

  orders[1].orderDate = '2023-07-14T12:00:00'; //iso-string is allowed
  orders[1].deliveryAddress = null;
  orders[1].customer = null;
  orders[1].lines.push({product: 'Cloak of invisibility', amount: 600});

  await orders.saveChanges();
}
```

## Selective updates

The update method is ideal for updating specific columns and relationships across one or multiple rows. You must provide a where filter to specify which rows to target. If you include a fetching strategy, the affected rows and their related data will be returned; otherwise, no data is returned.

```js
import map from './map';
const db = map.sqlite('demo.db');

update();

async function update() {

  const propsToBeModified = {
    orderDate: new Date(),
    customerId: 2,
    lines: [
      { id: 1, product: 'Bicycle', amount: 250 }, //already existing line
      { id: 2, product: 'Small guitar', amount: 150 }, //already existing line
      { product: 'Piano', amount: 800 } //the new line to be inserted
    ]
  };

  const strategy = {customer: true, deliveryAddress: true, lines: true};
  const orders = await db.order.update(propsToBeModified, { where: x => x.id.eq(1) }, strategy);
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

## Replacing a row from JSON

The replace method is suitable when a complete overwrite is required from a JSON object - typically in a REST API. However, it's important to consider that this method replaces the entire row and it's children, which might not always be desirable in a multi-user environment.

```js
import map from './map';
const db = map.sqlite('demo.db');

replace();

async function replace() {

  const modified = {
    id: 1,
    orderDate: '2023-07-14T12:00:00',
    customer: {
      id: 2
    },
    deliveryAddress: {
      name: 'Roger', //modified name
      street: 'Node street 1',
      postalCode: '7059',
      postalPlace: 'Jakobsli',
      countryCode: 'NO'
    },
    lines: [
      { id: 1, product: 'Bicycle', amount: 250 },
      { id: 2, product: 'Small guitar', amount: 150 },
      { product: 'Piano', amount: 800 } //the new line to be inserted
    ]
  };

  const order = await db.order.replace(modified, {customer: true, deliveryAddress: true, lines: true});
}
```

## Partially updating from JSON

The updateChanges method applies a partial update based on difference between original and modified row. It is often preferable because it minimizes the risk of unintentionally overwriting data that may have been altered by other users in the meantime. To do so, you need to pass in the original row object before modification as well.

```js
import map from './map';
const db = map.sqlite('demo.db');

update();

async function update() {

  const original = {
    id: 1,
    orderDate: '2023-07-14T12:00:00',
    customer: {
      id: 2
    },
    deliveryAddress: {
      id: 1,
      name: 'George',
      street: 'Node street 1',
      postalCode: '7059',
      postalPlace: 'Jakobsli',
      countryCode: 'NO'
    },
    lines: [
      { id: 1, product: 'Bicycle', amount: 250 },
      { id: 2, product: 'Small guitar', amount: 150 }
    ]
  };

  const modified = JSON.parse(JSON.stringify(original));
  modified.deliveryAddress.name = 'Roger';
  modified.lines.push({ product: 'Piano', amount: 800 });

  const order = await db.order.updateChanges(modified, original, { customer: true, deliveryAddress: true, lines: true });
}
```

## Conflict resolution

Rows get updated using an <i id="conflicts">optimistic</i> concurrency approach by default. This means if a property being edited was meanwhile altered, an exception is raised, indicating the row was modified by a different user. You can change the concurrency strategy either at the table or column level.

Currently, there are three concurrency strategies:

- **`optimistic`** Raises an exception if another user changes the property during an update.
- **`overwrite`** Overwrites the property, regardless of changes by others.
- **`skipOnConflict`** Silently avoids updating the property if another user has modified it in the interim.

In the example below, we've set the concurrency strategy for orderDate to 'overwrite'. This implies that if other users modify orderDate while you're making changes, their updates will be overwritten.

```js
import map from './map';
const db = map.sqlite('demo.db');

update();

async function update() {
  const order = await db.order.getById(1, {
    customer: true,
    deliveryAddress: true,
    lines: true
  });

  order.orderDate = new Date();
  order.deliveryAddress = null;
  order.lines.push({product: 'Cloak of invisibility',  amount: 600});

  await order.saveChanges( {
    orderDate: {
      concurrency: 'overwrite'
  }});
}
```
