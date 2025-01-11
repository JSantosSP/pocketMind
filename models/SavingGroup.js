class SavingGroup {
    constructor(id, name, targetAmount, savedAmount, createdAt, parentId = null) {
      this.id = id;
      this.name = name;
      this.targetAmount = targetAmount;
      this.savedAmount = savedAmount;
      this.createdAt = createdAt;
      this.parentId = parentId; // Si es un subgrupo de ahorro
    }
  
    // Método para actualizar la cantidad ahorrada
    updateSavedAmount(amount) {
      this.savedAmount += amount;
    }
  }
  
  export default SavingGroup;
  