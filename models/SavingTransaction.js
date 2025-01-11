class SavingTransaction {
    constructor(id, savingGroupId, amount, type, createdAt) {
      this.id = id;
      this.savingGroupId = savingGroupId;
      this.amount = amount;
      this.type = type; // "deposit" o "withdraw"
      this.createdAt = createdAt;
    }
  }
  
  export default SavingTransaction;
  