# Bulk Food Logging Feature Summary

## 🚀 **New Feature: Bulk Food Logging**

Users can now log multiple food items at once, making it much easier to log complete meals or multiple snacks together.

## ✨ **Key Features**

### **1. Multiple Items at Once**
- Log 1-20 food items in a single API call
- Each item can have its own quantity and notes
- All items share the same meal type and timestamp

### **2. Comprehensive Response**
- Returns all created food log entries
- Provides total nutrition summary (calories, protein, fat, carbs)
- Shows total number of items logged

### **3. Flexible Notes System**
- General notes for the entire bulk log
- Individual notes for each food item
- Both are optional and limited to 500 characters

## 📋 **API Endpoint**

```http
POST /api/v1/food-logs/bulk
```

### **Request Body**
```json
{
  "user": "user_id",
  "mealType": "lunch",
  "loggedAt": "2024-01-15T12:30:00Z",
  "notes": "Complete lunch meal",
  "items": [
    {
      "meal": "meal_id_1",
      "quantity": 1.0,
      "notes": "Grilled chicken breast"
    },
    {
      "meal": "meal_id_2",
      "quantity": 0.5,
      "notes": "Brown rice"
    }
  ]
}
```

### **Response**
```json
{
  "success": true,
  "data": {
    "createdLogs": [...], // Array of created food log entries
    "totalItems": 2,
    "totalCalories": 450,
    "totalProtein": 35,
    "totalFat": 8,
    "totalCarbs": 45,
    "mealType": "lunch",
    "loggedAt": "2024-01-15T12:30:00Z"
  },
  "message": "Successfully logged 2 food items"
}
```

## 🔧 **Validation Rules**

- **Items**: 1-20 food items required
- **Meal Type**: Must be breakfast, lunch, dinner, or snack
- **Quantities**: Each item must be between 0.1 and 100 servings
- **Notes**: Max 500 characters for both general and item-specific notes
- **Meal References**: All meal IDs must exist in the database

## 💡 **Use Cases**

### **Complete Meal Logging**
Perfect for logging entire meals with multiple components:
- Main protein + side dishes + vegetables
- Breakfast with multiple items (eggs, toast, fruit, etc.)
- Dinner with appetizer, main course, and dessert

### **Snack Combinations**
Log multiple snacks together:
- Apple + almonds + yogurt
- Trail mix components
- Multiple small snacks throughout the day

### **Meal Prep Logging**
Log pre-prepared meals with multiple ingredients:
- Smoothie with multiple ingredients
- Salad with various toppings
- Stir-fry with multiple vegetables and proteins

## 🎯 **Benefits**

1. **Efficiency**: Log multiple items in one API call instead of multiple individual calls
2. **Consistency**: All items share the same timestamp and meal type
3. **Organization**: Better grouping of related food items
4. **Analytics**: Easier to track complete meals and their nutrition
5. **User Experience**: Faster and more intuitive for users

## 🔄 **Backward Compatibility**

- All existing single-item logging functionality remains unchanged
- New bulk endpoint is additive, doesn't affect existing endpoints
- Same validation rules apply to individual items within bulk logs

## 📊 **Performance Considerations**

- Bulk operations are processed sequentially to ensure data consistency
- Each item is validated individually before creation
- Response includes comprehensive nutrition totals for immediate feedback
- Maximum of 20 items per request to prevent performance issues

## 🚀 **Ready to Use**

The bulk logging feature is now fully integrated and ready for use! Users can start logging multiple food items at once through the new `/api/v1/food-logs/bulk` endpoint.
