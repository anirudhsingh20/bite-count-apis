# Food Logging API Documentation

## Overview

The Food Logging API allows users to log their daily food intake with meal types (breakfast, lunch, dinner, snack) and track their nutrition over time. This system integrates with the existing meal database to provide comprehensive food tracking capabilities.

## Features

- **Daily Food Logging**: Log food items with quantities and meal types
- **Meal Type Support**: Breakfast, lunch, dinner, and snack categorization
- **Nutrition Tracking**: Automatic calculation of calories, protein, fat, and carbs
- **Daily Summaries**: Get comprehensive nutrition breakdowns by day
- **Analytics**: Weekly and monthly nutrition trends
- **Search & Filter**: Find food logs by date range, meal type, and user
- **Statistics**: Detailed analytics on food consumption patterns

## API Endpoints

### Basic CRUD Operations

#### Create Food Log Entry
```http
POST /api/v1/food-logs
Content-Type: application/json

{
  "user": "user_id",
  "meal": "meal_id",
  "mealType": "breakfast",
  "quantity": 1.5,
  "loggedAt": "2024-01-15T08:30:00Z",
  "notes": "Added extra protein"
}
```

#### Create Bulk Food Log Entries
```http
POST /api/v1/food-logs/bulk
Content-Type: application/json

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
    },
    {
      "meal": "meal_id_3",
      "quantity": 1.0,
      "notes": "Steamed broccoli"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "createdLogs": [
      {
        "_id": "log_id_1",
        "user": "user_id",
        "meal": {
          "_id": "meal_id_1",
          "name": "Grilled Chicken Breast",
          "calories": 200,
          "protein": 30,
          "fat": 5,
          "carbs": 0,
          "servingSize": "100g",
          "emoji": "🍗"
        },
        "mealType": "lunch",
        "quantity": 1.0,
        "loggedAt": "2024-01-15T12:30:00Z",
        "notes": "Grilled chicken breast",
        "createdAt": "2024-01-15T12:30:00Z",
        "updatedAt": "2024-01-15T12:30:00Z"
      }
      // ... other log entries
    ],
    "totalItems": 3,
    "totalCalories": 450,
    "totalProtein": 35,
    "totalFat": 8,
    "totalCarbs": 45,
    "mealType": "lunch",
    "loggedAt": "2024-01-15T12:30:00Z"
  },
  "message": "Successfully logged 3 food items"
}
```

#### Get Food Log by ID
```http
GET /api/v1/food-logs/:id
```

#### Update Food Log
```http
PUT /api/v1/food-logs/:id
Content-Type: application/json

{
  "quantity": 2.0,
  "mealType": "lunch",
  "notes": "Updated portion size"
}
```

#### Delete Food Log
```http
DELETE /api/v1/food-logs/:id
```

### User-Specific Operations

#### Get User's Food Logs
```http
GET /api/v1/food-logs/user/:userId?page=1&limit=200&startDate=1704067200000&endDate=1706745599999
```

**Query Parameters:**
- `page` (optional): Page number, defaults to 1
- `limit` (optional): Items per page, defaults to 200
- `startDate` (optional): Filter logs from this date (epoch timestamp in milliseconds)
- `endDate` (optional): Filter logs until this date (epoch timestamp in milliseconds)

#### Get Recent Food Logs
```http
GET /api/v1/food-logs/recent/:userId?limit=5
```

### Search and Filter

#### Search Food Logs
```http
GET /api/v1/food-logs/search?userId=user_id&mealType=breakfast&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10
```

#### Get Food Logs by Meal Type
```http
GET /api/v1/food-logs/meal-type/:userId/:mealType?page=1&limit=10
```

### Nutrition Tracking

#### Get Daily Nutrition Summary
```http
GET /api/v1/food-logs/daily-nutrition/:userId?date=2024-01-15
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "totalCalories": 2150,
    "totalProtein": 120.5,
    "totalFat": 85.2,
    "totalCarbs": 245.8,
    "mealBreakdown": {
      "breakfast": {
        "calories": 450,
        "protein": 25.5,
        "fat": 15.2,
        "carbs": 45.8,
        "items": 2
      },
      "lunch": {
        "calories": 800,
        "protein": 45.0,
        "fat": 30.0,
        "carbs": 85.0,
        "items": 3
      },
      "dinner": {
        "calories": 700,
        "protein": 35.0,
        "fat": 25.0,
        "carbs": 75.0,
        "items": 2
      },
      "snack": {
        "calories": 200,
        "protein": 15.0,
        "fat": 15.0,
        "carbs": 40.0,
        "items": 1
      }
    },
    "totalItems": 8
  }
}
```

#### Get Nutrition Summary for Date Range
```http
GET /api/v1/food-logs/nutrition-range/:userId?startDate=2024-01-01&endDate=2024-01-31
```

### Analytics

#### Get Weekly Nutrition Trend
```http
GET /api/v1/food-logs/weekly-trend/:userId?weeks=4
```

#### Get Monthly Nutrition Trend
```http
GET /api/v1/food-logs/monthly-trend/:userId?months=6
```

#### Get Food Log Statistics
```http
GET /api/v1/food-logs/stats/:userId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLogs": 150,
    "totalCalories": 45000,
    "totalProtein": 2500,
    "totalFat": 1800,
    "totalCarbs": 5200,
    "averageQuantity": 1.8,
    "mealTypeBreakdown": {
      "breakfast": 45,
      "lunch": 50,
      "dinner": 40,
      "snack": 15
    }
  }
}
```

### Utility Endpoints

#### Get Available Meal Types
```http
GET /api/v1/food-logs/meal-types
```

**Response:**
```json
{
  "success": true,
  "data": ["breakfast", "lunch", "dinner", "snack"]
}
```

## Data Models

### FoodLog
```typescript
interface FoodLog {
  _id: string;
  user: string;           // User ID reference
  meal: string;           // Meal ID reference
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;       // Number of servings (0.1 - 100)
  loggedAt: Date;         // When the food was logged
  notes?: string;         // Optional notes (max 500 chars)
  createdAt: Date;
  updatedAt: Date;
}
```

### Bulk Food Logging
```typescript
interface BulkFoodLogItem {
  meal: string;           // Meal ID reference
  quantity: number;       // Number of servings (0.1 - 100)
  notes?: string;         // Optional notes for this item (max 500 chars)
}

interface CreateBulkFoodLogRequest {
  user: string;           // User ID reference
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: BulkFoodLogItem[]; // Array of food items (1-20 items)
  loggedAt?: Date;        // When the food was logged (defaults to now)
  notes?: string;         // General notes for the entire bulk log (max 500 chars)
}

interface BulkFoodLogResponse {
  success: boolean;
  data: {
    createdLogs: FoodLog[]; // Array of created food log entries
    totalItems: number;     // Number of items logged
    totalCalories: number;  // Total calories across all items
    totalProtein: number;   // Total protein across all items
    totalFat: number;       // Total fat across all items
    totalCarbs: number;     // Total carbs across all items
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    loggedAt: Date;         // When the food was logged
  };
  message: string;         // Success message
}
```

### DailyNutritionSummary
```typescript
interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  mealBreakdown: {
    breakfast: NutritionBreakdown;
    lunch: NutritionBreakdown;
    dinner: NutritionBreakdown;
    snack: NutritionBreakdown;
  };
  totalItems: number;
}

interface NutritionBreakdown {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  items: number;
}
```

## Validation Rules

### Food Log Creation/Update
- **user**: Required, must be valid ObjectId
- **meal**: Required, must be valid ObjectId referencing existing meal
- **mealType**: Required, must be one of: 'breakfast', 'lunch', 'dinner', 'snack'
- **quantity**: Required, must be between 0.1 and 100
- **loggedAt**: Optional, defaults to current date/time
- **notes**: Optional, max 500 characters

### Bulk Food Log Creation
- **user**: Required, must be valid ObjectId
- **mealType**: Required, must be one of: 'breakfast', 'lunch', 'dinner', 'snack'
- **items**: Required, array of 1-20 food items
- **loggedAt**: Optional, defaults to current date/time
- **notes**: Optional, max 500 characters (general notes for entire bulk log)

#### Individual Item Validation
- **meal**: Required, must be valid ObjectId referencing existing meal
- **quantity**: Required, must be between 0.1 and 100
- **notes**: Optional, max 500 characters (item-specific notes)

### Query Parameters
- **page**: Optional, defaults to 1, must be positive integer
- **limit**: Optional, defaults to 200, must be between 1 and 1000
- **date**: Must be valid ISO date string
- **startDate/endDate**: Must be valid epoch timestamps (milliseconds), startDate must be before endDate

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **404**: Not Found
- **500**: Internal Server Error

## Usage Examples

### Logging Breakfast
```javascript
const response = await fetch('/api/v1/food-logs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user: '64a1b2c3d4e5f6789012345',
    meal: '64a1b2c3d4e5f6789012346',
    mealType: 'breakfast',
    quantity: 1.5,
    notes: 'Added extra protein powder'
  })
});
```

### Bulk Logging Complete Meal
```javascript
const response = await fetch('/api/v1/food-logs/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user: '64a1b2c3d4e5f6789012345',
    mealType: 'dinner',
    loggedAt: new Date().toISOString(),
    notes: 'Complete dinner meal',
    items: [
      {
        meal: '64a1b2c3d4e5f6789012346',
        quantity: 1.0,
        notes: 'Grilled salmon fillet'
      },
      {
        meal: '64a1b2c3d4e5f6789012347',
        quantity: 0.5,
        notes: 'Quinoa'
      },
      {
        meal: '64a1b2c3d4e5f6789012348',
        quantity: 1.0,
        notes: 'Mixed vegetables'
      },
      {
        meal: '64a1b2c3d4e5f6789012349',
        quantity: 0.25,
        notes: 'Olive oil drizzle'
      }
    ]
  })
});

const result = await response.json();
console.log(`Logged ${result.data.totalItems} items with ${result.data.totalCalories} calories`);
```

### Logging Multiple Snacks
```javascript
const snacks = [
  { meal: 'apple_id', quantity: 1.0, notes: 'Medium apple' },
  { meal: 'almonds_id', quantity: 0.25, notes: 'Handful of almonds' },
  { meal: 'yogurt_id', quantity: 1.0, notes: 'Greek yogurt' }
];

const response = await fetch('/api/v1/food-logs/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user: '64a1b2c3d4e5f6789012345',
    mealType: 'snack',
    items: snacks
  })
});
```

### Getting User's Food Logs with Date Filter
```javascript
// Get all food logs for a user
const response = await fetch('/api/v1/food-logs/user/user123?page=1&limit=200');

// Get food logs for a specific date range (January 2024)
const startDate = new Date('2024-01-01').getTime(); // 1704067200000
const endDate = new Date('2024-01-31T23:59:59').getTime(); // 1706745599999
const response = await fetch(`/api/v1/food-logs/user/user123?startDate=${startDate}&endDate=${endDate}`);

// Get food logs from a specific date onwards
const startDate = new Date('2024-01-15').getTime();
const response = await fetch(`/api/v1/food-logs/user/user123?startDate=${startDate}`);

// Get food logs up to a specific date
const endDate = new Date('2024-01-15T23:59:59').getTime();
const response = await fetch(`/api/v1/food-logs/user/user123?endDate=${endDate}`);

// Get food logs for the last 7 days
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
const startDate = sevenDaysAgo.getTime();
const response = await fetch(`/api/v1/food-logs/user/user123?startDate=${startDate}`);
```

### Getting Today's Nutrition Summary
```javascript
const today = new Date().toISOString().split('T')[0];
const response = await fetch(`/api/v1/food-logs/daily-nutrition/user123?date=${today}`);
const data = await response.json();
console.log(`Today's calories: ${data.data.totalCalories}`);
```

### Getting Weekly Trends
```javascript
const response = await fetch('/api/v1/food-logs/weekly-trend/user123?weeks=4');
const trends = await response.json();
// Process weekly nutrition data for charts/analytics
```

## Integration Notes

- The food logging system integrates seamlessly with the existing meal database
- All nutrition calculations are based on the meal's nutritional information multiplied by the logged quantity
- The system supports both individual food logging and bulk operations
- All endpoints support pagination for large datasets
- The API is designed to work with frontend applications for real-time food tracking

## Performance Considerations

- Database indexes are optimized for common query patterns (user + date, meal type filtering)
- Pagination is implemented for all list endpoints to handle large datasets
- Aggregation pipelines are used for nutrition summaries to ensure efficient data processing
- Caching can be implemented at the application level for frequently accessed data
