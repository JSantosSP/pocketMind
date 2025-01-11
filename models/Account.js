class Account {
    constructor(id, name, balance, createdAt) {
      this.id = id;
      this.name = name;
      this.balance = balance;
      this.createdAt = createdAt;
    }
  
    // Método para actualizar el saldo de la cuenta
    updateBalance(newBalance) {
      this.balance = newBalance;
    }
  }
  
  export default Account;  