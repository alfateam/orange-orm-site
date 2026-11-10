# Transactions

We initiate a database transaction using db.transaction.
Within the transaction, a customer is retrieved and its balance updated using the tx object to ensure operations are transactional.
An error is deliberately thrown to demonstrate a rollback, ensuring all previous changes within the transaction are reverted.
Always use the provided tx object for operations within the transaction to maintain data integrity.

> [!important] NOTE: Transactions are not supported for Cloudflare D1

```js
import map from './map';
const db = map.sqlite('demo.db');

execute();

async function execute() {
  await db.transaction(async tx => {
    const customer = await tx.customer.getById(1);
    customer.balance = 100;
    await customer.saveChanges();
    throw new Error('This will rollback');
  });
}

```

## Advisory locks

```ts
await db.transaction(async tx => {
  await tx.advisoryLock('invoice:123');
  // Read and update after acquiring the lock.
});
```

Local transactions only; never exposed over HTTP. Locks are held until commit/rollback. Supported by PostgreSQL/PGlite, MySQL/MariaDB, SQL Server and Oracle 12.1+ (requires `DBMS_LOCK` permission). MySQL/MariaDB locks are released by Orange before returning the connection to the pool. SAP ASE and D1 are unsupported.

**SQLite:** automatically runs a zero-row `UPDATE` on an existing mapped ordinary table. It reserves write access to the entire main database, regardless of key; no helper table is needed. Throws if no suitable table exists. Acquire before reading; on `SQLITE_BUSY`/`SQLITE_BUSY_SNAPSHOT`, retry the whole transaction when appropriate.
