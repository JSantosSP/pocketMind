import {
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
} from './db';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import SavingGroup from '../models/SavingGroup';
import SavingTransaction from '../models/SavingTransaction';

// Controlador para crear una nueva cuenta
const handleCreateAccount = (name, balance) => {
  createAccount(name, balance);
};

// Controlador para obtener todas las cuentas
const handleGetAccounts = (callback) => {
  getAccounts((accounts) => {
    // Transformamos las filas en instancias del modelo Account
    const accountModels = accounts.map(accountData => new Account(accountData.id, accountData.name, accountData.balance, accountData.created_at));
    callback(accountModels);
  });
};

// Controlador para eliminar una cuenta
const handleDeleteAccount = (id) => {
  deleteAccount(id);
};

// Controlador para crear una transacción
const handleCreateTransaction = (accountId, type, amount, categoryId, description) => {
  createTransaction(accountId, type, amount, categoryId, description);
};

// Controlador para obtener transacciones de una cuenta
const handleGetTransactions = (accountId, callback) => {
  getTransactions(accountId, (transactions) => {
    // Transformamos las filas en instancias del modelo Transaction
    const transactionModels = transactions.map(transactionData => new Transaction(transactionData.id, transactionData.account_id, transactionData.type, transactionData.amount, transactionData.category_id, transactionData.description, transactionData.created_at));
    callback(transactionModels);
  });
};

// Controlador para crear una categoría
const handleCreateCategory = (name, type, parentId = null) => {
  createCategory(name, type, parentId);
};

// Controlador para obtener todas las categorías
const handleGetCategories = (callback) => {
  getCategories((categories) => {
    // Transformamos las filas en instancias del modelo Category
    const categoryModels = categories.map(categoryData => new Category(categoryData.id, categoryData.name, categoryData.type, categoryData.parent_id));
    callback(categoryModels);
  });
};

// Controlador para crear un grupo de ahorro
const handleCreateSavingGroup = (name, targetAmount, parentId = null) => {
  createSavingGroup(name, targetAmount, parentId);
};

// Controlador para obtener todos los grupos de ahorro
const handleGetSavingGroups = (callback) => {
  getSavingGroups((groups) => {
    // Transformamos las filas en instancias del modelo SavingGroup
    const savingGroupModels = groups.map(groupData => new SavingGroup(groupData.id, groupData.name, groupData.target_amount, groupData.saved_amount, groupData.created_at, groupData.parent_id));
    callback(savingGroupModels);
  });
};

// Controlador para realizar una transacción dentro de un grupo de ahorro
const handleCreateSavingTransaction = (groupId, amount, type) => {
  createSavingTransaction(groupId, amount, type);
};

export {
  handleCreateAccount,
  handleGetAccounts,
  handleDeleteAccount,
  handleCreateTransaction,
  handleGetTransactions,
  handleCreateCategory,
  handleGetCategories,
  handleCreateSavingGroup,
  handleGetSavingGroups,
  handleCreateSavingTransaction
};
