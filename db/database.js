import * as SQLite from 'expo-sqlite';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import SavingGroup from '../models/SavingGroup';
import SavingTransaction from '../models/SavingTransaction';

const db = SQLite.openDatabase('financeApp.db');

// Inicializar la base de datos con las tablas necesarias
const initializeDb = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, balance REAL, created_at TIMESTAMP)',
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, type TEXT, amount REAL, category_id INTEGER, description TEXT, created_at TIMESTAMP, FOREIGN KEY(account_id) REFERENCES accounts(id), FOREIGN KEY(category_id) REFERENCES categories(id))',
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, type TEXT, parent_id INTEGER, FOREIGN KEY(parent_id) REFERENCES categories(id))',
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS saving_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, parent_id INTEGER, target_amount REAL, saved_amount REAL, created_at TIMESTAMP, FOREIGN KEY(parent_id) REFERENCES saving_groups(id))',
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS saving_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, saving_group_id INTEGER, amount REAL, type TEXT, created_at TIMESTAMP, FOREIGN KEY(saving_group_id) REFERENCES saving_groups(id))',
    );
  });
};

// Crear una cuenta
const createAccount = (name, balance) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO accounts (name, balance, created_at) VALUES (?, ?, ?)',
      [name, balance, new Date().toISOString()],
    );
  });
};

// Obtener todas las cuentas
const getAccounts = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM accounts',
      [],
      (_, { rows }) => {
        const accounts = rows._array.map(row => new Account(row.id, row.name, row.balance, row.created_at));
        callback(accounts);
      },
    );
  });
};

// Eliminar una cuenta
const deleteAccount = (id) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM accounts WHERE id = ?',
      [id],
    );
  });
};

// Crear una transacción
const createTransaction = (accountId, type, amount, categoryId, description) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO transactions (account_id, type, amount, category_id, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [accountId, type, amount, categoryId, description, new Date().toISOString()],
    );
  });
};

// Obtener transacciones de una cuenta
const getTransactions = (accountId, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM transactions WHERE account_id = ?',
      [accountId],
      (_, { rows }) => {
        const transactions = rows._array.map(row => new Transaction(row.id, row.account_id, row.type, row.amount, row.category_id, row.description, row.created_at));
        callback(transactions);
      },
    );
  });
};

// Crear una categoría
const createCategory = (name, type, parentId = null) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO categories (name, type, parent_id) VALUES (?, ?, ?)',
      [name, type, parentId],
    );
  });
};

// Obtener categorías
const getCategories = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM categories',
      [],
      (_, { rows }) => {
        const categories = rows._array.map(row => new Category(row.id, row.name, row.type, row.parent_id));
        callback(categories);
      },
    );
  });
};

// Crear un grupo de ahorro
const createSavingGroup = (name, targetAmount, parentId = null) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO saving_groups (name, parent_id, target_amount, saved_amount, created_at) VALUES (?, ?, ?, ?, ?)',
      [name, parentId, targetAmount, 0, new Date().toISOString()],
    );
  });
};

// Obtener grupos de ahorro
const getSavingGroups = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM saving_groups',
      [],
      (_, { rows }) => {
        const savingGroups = rows._array.map(row => new SavingGroup(row.id, row.name, row.target_amount, row.saved_amount, row.created_at, row.parent_id));
        callback(savingGroups);
      },
    );
  });
};

// Realizar una transacción en un grupo de ahorro
const createSavingTransaction = (groupId, amount, type) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO saving_transactions (saving_group_id, amount, type, created_at) VALUES (?, ?, ?, ?)',
      [groupId, amount, type, new Date().toISOString()],
    );
  });
};

export {
  initializeDb,
  createAccount,
  getAccounts,
  deleteAccount,
  createTransaction,
  getTransactions,
  createCategory,
  getCategories,
  createSavingGroup,
  getSavingGroups,
  createSavingTransaction
};
