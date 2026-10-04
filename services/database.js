import * as SQLite from 'expo-sqlite';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import SavingGroup from '../models/SavingGroup';
import SavingTransaction from '../models/SavingTransaction';
import MonthlySummary from '../models/MonthlySummary';

let db;

// **Función para abrir la base de datos**
const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('financeApp.db');
  }
  return db;
};

const deleteDatabase = async () => {
  try {
    const db = await openDatabase();
    await db.execAsync("PRAGMA journal_mode = WAL;");

    const tables = [
      "transactions",
      "accounts",
      "categories",
      "saving_groups",
      "saving_transactions",
      "monthly_summaries"
    ];

    for (const table of tables) {
      const result = await db.runAsync(`DROP TABLE IF EXISTS ${table};`);
      console.log('Database DROPED successfully:', result);
    }
  } catch (error) {
    console.error('Error DROPED database:', error);
  }
};

// **Inicializar la base de datos**
const initializeDb = async () => {
  try {
    const db = await openDatabase();
    const result = await db.execAsync(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT, 
    balance REAL,
    pais TEXT,
    locale TEXT,
    currency TEXT,
    created_at TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    account_id INTEGER, 
    type BOOLEAN, 
    amount REAL, 
    category_id INTEGER, 
    description TEXT, 
    created_at TIMESTAMP, 
    FOREIGN KEY(account_id) REFERENCES accounts(id), 
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );
  
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT
  );
  
  CREATE TABLE IF NOT EXISTS saving_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT, 
    parent_id INTEGER, 
    color TEXT, 
    target_amount REAL, 
    saved_amount REAL, 
    created_at TIMESTAMP, 
    FOREIGN KEY(parent_id) REFERENCES accounts(id)
  );
  
  CREATE TABLE IF NOT EXISTS saving_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    saving_group_id INTEGER, 
    amount REAL, 
    type BOOLEAN, 
    created_at TIMESTAMP, 
    FOREIGN KEY(saving_group_id) REFERENCES saving_groups(id)
  );

  CREATE TABLE IF NOT EXISTS monthly_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER,
    year INTEGER,
    month INTEGER,
    expenses REAL,
    income REAL,
    UNIQUE(account_id, year, month),
    FOREIGN KEY(account_id) REFERENCES accounts(id)
  );

  -- Insert default categories
  INSERT INTO categories (name) VALUES 
    ('Alimentación'),
    ('Vivienda'),
    ('Transporte'),
    ('Salud'),
    ('Educación'),
    ('Ocio'),
    ('Tecnología'),
    ('Ropa'),
    ('Hogar'),
    ('Ahorros'),
    ('Deudas'),
    ('Familia'),
    ('Impuestos'),
    ('Regalos y donaciones'),
    ('Mascotas'),
    ('Otros');
`);

    console.log('Database initialized successfully:', result);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// **Funciones CRUD con parámetros usando prepareAsync()**

const createAccount = async (name, balance, pais, locale, currency) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync(
    'INSERT INTO accounts (name, balance, pais, locale, currency, created_at) VALUES ($name, $balance, $pais, $locale, $currency, $created_at)'
  );
  try {
    const result = await statement.executeAsync({ $name: name, $balance: balance, $pais: pais, $locale: locale, $currency: currency, $created_at: new Date().toISOString() });
    return result;
  } finally {
    await statement.finalizeAsync();
  }
};

const getAccounts = async () => {
  const db = await openDatabase();
  const result = await db.getAllAsync('SELECT * FROM accounts');
  return result.length > 0 ? result.map(row => new Account(row.id, row.name, row.balance, row.pais, row.locale, row.currency, row.created_at)) : [];
};

const updateAccountBalance = async (accountId, type, amount) => {
  const db = await openDatabase();
  let query = '';
  if (type) {
    query = 'UPDATE accounts SET balance = balance + $amount WHERE id = $id';
  } else {
    query = 'UPDATE accounts SET balance = balance - $amount WHERE id = $id';
  }
  const statement = await db.prepareAsync(query);
  try {
    const result = await statement.executeAsync({ $id: accountId, $amount: amount });
    return result;
  } finally {
    await statement.finalizeAsync();
  }
}

const deleteAccount = async (id) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync('DELETE FROM accounts WHERE id = $id');
  try {
    const result = await statement.executeAsync({ $id: id });
    return result;
  } finally {
    await statement.finalizeAsync();
  }
};

const createTransaction = async (accountId, type, amount, categoryId, description) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync(
    'INSERT INTO transactions (account_id, type, amount, category_id, description, created_at) VALUES ($account_id, $type, $amount, $category_id, $description, $created_at)'
  );
  try {
    const result = await statement.executeAsync({
      $account_id: accountId,
      $type: type,
      $amount: amount,
      $category_id: categoryId,
      $description: description,
      $created_at: new Date().toISOString()
    });
    return result;
  } finally {
    await statement.finalizeAsync();
  }
};

const getTransactions = async (accountId) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync('SELECT * FROM transactions WHERE account_id = $account_id');
  try {
    const result = await statement.executeAsync({ $account_id: accountId });
    return result.length > 0 ? result.map(row => new Transaction(row.id, row.account_id, row.type, row.amount, row.category_id, row.description, row.created_at)) : [];
  } finally {
    await statement.finalizeAsync();
  }
};

const createCategory = async (name) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync('INSERT INTO categories (name) VALUES ($name)');
  try {
    const result = await statement.executeAsync({
      $name: name,
    });
    return result;
  } finally {
    await statement.finalizeAsync();
  }
};

const getCategories = async () => {
  const db = await openDatabase();
  const result = await db.getAllAsync('SELECT * FROM categories');
  return result.length > 0 ? result.map(row => new Category(row.id, row.name)) : [];
};

const createSavingGroup = async (name, targetAmount, savedAmount, color, parentId) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync(
    'INSERT INTO saving_groups (name, parent_id, color, target_amount, saved_amount, created_at) VALUES ($name, $parent_id, $color, $target_amount, $saved_amount, $created_at)'
  );
  try {
    const result = await statement.executeAsync({
      $name: name,
      $parent_id: parentId,
      $color: color,
      $target_amount: targetAmount,
      $saved_amount: savedAmount,
      $created_at: new Date().toISOString()
    });

    return {status: true, id: result.lastInsertRowId};
  } finally {
    await statement.finalizeAsync();
  }
};

const updateSavingGroup = async (savingGroupId, name, targetAmount, savedAmount) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync('UPDATE saving_groups SET name = $name, target_amount = $target_amount, saved_amount = $saved_amount WHERE id = $id');
  try {
    const result = await statement.executeAsync({ $id: savingGroupId, $name: name, $target_amount: targetAmount, $saved_amount: savedAmount });
    return result;
  } finally {
    await statement.finalizeAsync();
  }
}

const getSavingGroups = async () => {
  const db = await openDatabase();
  const result = await db.getAllAsync('SELECT * FROM saving_groups');
  return result.length > 0 ? result.map(row => new SavingGroup(row.id, row.name, row.parent_id, row.color, row.target_amount, row.saved_amount, row.created_at )) : [];
};

const createSavingTransaction = async (groupId, amount, type) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync(
    'INSERT INTO saving_transactions (saving_group_id, amount, type, created_at) VALUES ($saving_group_id, $amount, $type, $created_at)'
  );
  try {
    const result = await statement.executeAsync({
      $saving_group_id: groupId,
      $amount: amount,
      $type: type,
      $created_at: new Date().toISOString()
    });
    return result;
  } finally {
    await statement.finalizeAsync();
  }
};

const getSavingTransactions = async (savingGroupId) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync('SELECT * FROM saving_transactions WHERE saving_group_id = ?');
  try {
    const result = await statement.executeAsync(savingGroupId);
    let resultArray = [];
    for await (const row of result) {
      resultArray.push(new SavingTransaction(row.id, row.saving_group_id, row.amount, row.type, row.created_at));
    }
    return resultArray;
  } finally {
    await statement.finalizeAsync();
  }
};

const updateSavingGroupAmount = async (groupId, type, amount) => {
  const db = await openDatabase();
  let query = '';
  if (type) {
    query = 'UPDATE saving_groups SET saved_amount = saved_amount + $amount WHERE id = $id';
  } else {
    query = 'UPDATE saving_groups SET saved_amount = saved_amount - $amount WHERE id = $id';
  }
  const statement = await db.prepareAsync(query);
  try {
    const result = await statement.executeAsync({ $id: groupId, $amount: amount });
    return result;
  } finally {
    await statement.finalizeAsync();
  }
}
const deleteSavingTransactions = async (groupId) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync('DELETE FROM saving_transactions WHERE saving_group_id = $id');
  try {
    const result = await statement.executeAsync({ $id: groupId });
    return result;
  } finally {
    await statement.finalizeAsync();
  }
};

const deleteSavingGroup = async (id) => {
  const db = await openDatabase();
  await deleteSavingTransactions(id);
  const statement = await db.prepareAsync('DELETE FROM saving_groups WHERE id = $id');
  try {
    const result = await statement.executeAsync({ $id: id });
    return result;
  } finally {
    await statement.finalizeAsync();
  }
};

const getMonthlySummaries = async (accountId, year) => {
  const db = await openDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM monthly_summaries WHERE account_id = ? AND year = ?',
    [accountId, year]
  );
  return result.map(row => new MonthlySummary(row.id, row.account_id, row.year, row.month, row.expenses, row.income));
};

const upsertMonthlySummaries = async (rows) => {
  const db = await openDatabase();
  const statement = await db.prepareAsync(
    `INSERT INTO monthly_summaries (account_id, year, month, expenses, income)
     VALUES ($account_id, $year, $month, $expenses, $income)
     ON CONFLICT(account_id, year, month) DO UPDATE SET
       expenses = excluded.expenses,
       income = excluded.income`
  );
  try {
    for (const row of rows) {
      await statement.executeAsync({
        $account_id: row.accountId,
        $year: row.year,
        $month: row.month,
        $expenses: row.expenses,
        $income: row.income
      });
    }
  } finally {
    await statement.finalizeAsync();
  }
};

const getYearTransactionTotals = async (accountId, year) => {
  const db = await openDatabase();
  const result = await db.getAllAsync(
    `SELECT
       CAST(substr(created_at, 6, 2) AS INTEGER) as month,
       SUM(CASE WHEN type THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN NOT type THEN amount ELSE 0 END) as expenses
     FROM transactions
     WHERE account_id = ? AND created_at LIKE ?
     GROUP BY month`,
    [accountId, `${year}-%`]
  );
  return result.map(row => ({
    month: row.month,
    income: row.income || 0,
    expenses: row.expenses || 0
  }));
};

export {
  deleteDatabase,
  initializeDb,
  createAccount,
  getAccounts,
  updateAccountBalance,
  deleteAccount,
  createTransaction,
  getTransactions,
  createCategory,
  getCategories,
  createSavingGroup,
  updateSavingGroup,
  getSavingGroups,
  createSavingTransaction,
  getSavingTransactions,
  updateSavingGroupAmount,
  deleteSavingGroup,
  deleteSavingTransactions,
  getMonthlySummaries,
  upsertMonthlySummaries,
  getYearTransactionTotals
};
