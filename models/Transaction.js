class Transaction {
    constructor(id, accountId, type, amount, categoryId, description, createdAt) {
      this.id = id;
      this.accountId = accountId;
      this.type = type; // "income"(true) o "expense"(false)
      this.amount = amount;
      this.categoryId = categoryId;
      this.description = description;
      this.createdAt = createdAt;
    }
  }
  
  export default Transaction;
  