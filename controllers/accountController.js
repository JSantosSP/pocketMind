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
  createSavingTransaction,
  updateAccountBalance,
  updateSavingGroup,
  updateSavingGroupAmount,
  getSavingTransactions
} from '../services/database';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import SavingGroup from '../models/SavingGroup';
import SavingTransaction from '../models/SavingTransaction';

const handleCreateAccount = async (name, balance, pais, locale, currency) => {
  try {
    await createAccount(name, balance, pais, locale, currency);
    return true;  // Si la creación de cuenta fue exitosa
  } catch (error) {
    console.error('Error al crear la cuenta:', error);
    return false;  // Si hubo un error al crear la cuenta
  }
};

// Controlador para obtener todas las cuentas
const handleGetAccounts = async (callback) => {
  try {
    const accounts = await getAccounts();
    // Transformamos las filas en instancias del modelo Account
    const accountModels = accounts.map(accountData => new Account(accountData.id, accountData.name, accountData.balance, accountData.pais, accountData.locale, accountData.currency, accountData.created_at));
    callback(accountModels);
    return true;  // Si obtuvimos las cuentas correctamente
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    return false;  // Si hubo un error al obtener las cuentas
  }
};

// Controlador para obtener la cuenta principal
const handleGetMainAccount = async (callback) => {
  try {
    const accounts = await getAccounts();
    const mainAccount = accounts.find(account => {
      return account.name === 'principal'});
    callback(mainAccount);
    return true;  // Si obtuvimos la cuenta principal correctamente
  } catch (error) {
    console.error('Error al obtener la cuenta principal:', error);
    return false;  // Si hubo un error al obtener la cuenta principal
  }
};

const handleGetAccount = async (id, callback) => {
  try {
    const accounts = await getAccounts();
    const accountData = accounts.find(account => {
      return account.id === id});
    callback(accountData);
    return true;  // Si obtuvimos la cuenta principal correctamente
  } catch (error) {
    console.error('Error al obtener la cuenta:', error);
    return false;  // Si hubo un error al obtener la cuenta principal
  }
};

const handleCheckTransactionsGroup = async (account, callback) => {
  try {
    const grupos = await getSavingGroups(account.id);
    let total = 0;
    for (let i = 0; i < grupos.length; i++) {
      const transactions = await getSavingTransactions(grupos[i].id);
      for (let j = 0; j < transactions.length; j++) {
        if (transactions[j].type) {
          total += transactions[j].amount;
        } else {
          total -= transactions[j].amount;
        }
      }
    }
    const libre = account.balance - total;
    callback(libre);
    return true;  // Si obtuvimos la cuenta principal correctamente
  } catch (error) {
    console.error('Error al obtener la cuenta:', error);
    return false;  // Si hubo un error al obtener la cuenta principal
  }
};

// Controlador para eliminar una cuenta
const handleDeleteAccount = async (id) => {
  try {
    await deleteAccount(id);
    return true;  // Si la cuenta fue eliminada correctamente
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error);
    return false;  // Si hubo un error al eliminar la cuenta
  }
};

// Controlador para crear una transacción
const handleCreateTransaction = async (accountId, type, amount, categoryId, description) => {
  try {
    console.log('accountId:', accountId);
    console.log('type:', type);
    console.log('amount:', amount);
    console.log('categoryId:', categoryId);
    console.log('description:', description);
    await updateAccountBalance(accountId, type, amount).then(async()=>{ await createTransaction(accountId, type, amount, categoryId, description);
    }).catch((error) => {
      console.error('Error al actualizar la cuenta:', error);
      return false;
    });
    return true;  // Si la transacción fue creada correctamente
  } catch (error) {
    console.error('Error al crear la transacción:', error);
    return false;  // Si hubo un error al crear la transacción
  }
};

// Controlador para obtener transacciones de una cuenta
const handleGetTransactions = async (accountId, callback) => {
  try {
    const transactions = await getTransactions(accountId);
    // Transformamos las filas en instancias del modelo Transaction
    const transactionModels = transactions.map(transactionData => new Transaction(transactionData.id, transactionData.account_id, transactionData.type, transactionData.amount, transactionData.category_id, transactionData.description, transactionData.created_at));
    callback(transactionModels);
    return true;  // Si obtuvimos las transacciones correctamente
  } catch (error) {
    console.error('Error al obtener las transacciones:', error);
    return false;  // Si hubo un error al obtener las transacciones
  }
};

// Controlador para crear una categoría
const handleCreateCategory = async (name, type, parentId = null) => {
  try {
    await createCategory(name, type, parentId);
    return true;  // Si la categoría fue creada correctamente
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    return false;  // Si hubo un error al crear la categoría
  }
};

// Controlador para obtener todas las categorías
const handleGetCategories = async (callback) => {
  try {
    const categories = await getCategories();
    // Transformamos las filas en instancias del modelo Category
    const categoryModels = categories.map(categoryData => new Category(categoryData.id, categoryData.name));
    callback(categoryModels);
    return true;  // Si obtuvimos las categorías correctamente
  } catch (error) {
    console.error('Error al obtener las categorías:', error);
    return false;  // Si hubo un error al obtener las categorías
  }
};

// Controlador para crear un grupo de ahorro
const handleCreateSavingGroup = async (name, targetAmount, savedAmount, color, parentId = null) => {
  try {
     const successObj  = await createSavingGroup(name, targetAmount, savedAmount, color, parentId);

    return successObj;  // Si el grupo de ahorro fue creado correctamente
  } catch (error) {
    console.error('Error al crear el grupo de ahorro:', error);
    return {status: false, id: null};  // Si hubo un error al crear el grupo de ahorro
  }
};

const handleUpdateSavingGroup = async (savingGroupId, name, targetAmount, savedAmount) => {
  try {
    await updateSavingGroup(savingGroupId, name, targetAmount, savedAmount);
    return true;  // Si el grupo de ahorro fue actualizado correctamente
  } catch (error) {
    console.error('Error al actualizar el grupo de ahorro:', error);
    return false;  // Si hubo un error al actualizar el grupo de ahorro
  }
};
      

// Controlador para obtener todos los grupos de ahorro
const handleGetAllSavingGroups = async (callback) => {
  try {
    const groups = await getSavingGroups();
    // Transformamos las filas en instancias del modelo SavingGroup
    const savingGroupModels = groups.map(groupData => new SavingGroup(groupData.id, groupData.name, groupData.target_amount, groupData.saved_amount, groupData.created_at, groupData.parent_id));
    callback(savingGroupModels);
    return true;  // Si obtuvimos los grupos de ahorro correctamente
  } catch (error) {
    console.error('Error al obtener los grupos de ahorro:', error);
    return false;  // Si hubo un error al obtener los grupos de ahorro
  }
};

const handleGetSavingGroups = async (accountId, callback) => {
  try {
    const groups = await getSavingGroups();
    // Filtramos solo los grupos que pertenecen a la cuenta dada
    const filteredGroups = groups.filter(group => group.parentId === accountId);
    // Transformamos las filas en instancias del modelo SavingGroup
    const savingGroupModels = filteredGroups.map(groupData => 
      new SavingGroup(
        groupData.id, 
        groupData.name,
        groupData.parentId,
        groupData.color,
        groupData.targetAmount, 
        groupData.savedAmount, 
        groupData.createdAt, 
      )
    );
    callback(savingGroupModels);
    return true;  // Si obtuvimos los grupos de ahorro correctamente
  } catch (error) {
    console.error('Error al obtener los grupos de ahorro:', error);
    return false;  // Si hubo un error al obtener los grupos de ahorro
  }
};

const handleGetSavingGroupById = async (groupId, callback) => {
  try {
    const groups = await getSavingGroups();
    // Filtramos solo los grupos que pertenecen a la cuenta dada
    const filteredGroups = groups.find(group => group.id === groupId);
    // Transformamos las filas en instancias del modelo SavingGroup
    const savingGroupModels =  
      new SavingGroup(
        filteredGroups.id, 
        filteredGroups.name,
        filteredGroups.parentId,
        filteredGroups.color,
        filteredGroups.targetAmount, 
        filteredGroups.savedAmount, 
        filteredGroups.createdAt, 
      );
    
    callback(savingGroupModels);
    return true;  // Si obtuvimos los grupos de ahorro correctamente
  } catch (error) {
    console.error('Error al obtener los grupos de ahorro:', error);
    return false;  // Si hubo un error al obtener los grupos de ahorro
  }
};

// Controlador para realizar una transacción dentro de un grupo de ahorro
const handleCreateSavingTransaction = async (groupId, amount, type) => {
  try {
    await createSavingTransaction(groupId, amount, type);
    await updateSavingGroupAmount(groupId, type, amount);
    return true;  // Si la transacción de ahorro fue creada correctamente
  } catch (error) {
    console.error('Error al crear la transacción de ahorro:', error);
    return false;  // Si hubo un error al crear la transacción de ahorro
  }
};

const handleGetSavingTransactions = async (savingGroupId, callback) => {
  try {
    const savingTransactions = await getSavingTransactions(savingGroupId);
    // Transformamos las filas en instancias del modelo Transaction
    const savingTransactionModels = savingTransactions.map(transactionData => new SavingTransaction(transactionData.id, transactionData.savingGroupId, transactionData.type, transactionData.amount, transactionData.created_at));
    callback(savingTransactionModels);
    return true;  // Si obtuvimos las transacciones correctamente
  } catch (error) {
    console.error('Error al obtener las transacciones:', error);
    return false;  // Si hubo un error al obtener las transacciones
  }
};

export {
  handleCreateAccount,
  handleGetAccounts,
  handleGetAccount,
  handleDeleteAccount,
  handleCreateTransaction,
  handleGetTransactions,
  handleGetMainAccount,
  handleCreateCategory,
  handleGetCategories,
  handleCreateSavingGroup,
  handleUpdateSavingGroup,
  handleGetAllSavingGroups,
  handleGetSavingGroups,
  handleCreateSavingTransaction,
  handleGetSavingTransactions,
  handleGetSavingGroupById,
  handleCheckTransactionsGroup
};
