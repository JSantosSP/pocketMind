class Category {
    constructor(id, name, type, parentId = null) {
      this.id = id;
      this.name = name;
      this.type = type; // "income" o "expense"
      this.parentId = parentId; // Si es una subcategoría, tendrá un ID de la categoría principal
    }
  }
  
  export default Category;
  