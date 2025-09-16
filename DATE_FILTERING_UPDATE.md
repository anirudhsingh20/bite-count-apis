# Date Filtering Enhancement for User Food Logs

## 🗓️ **New Feature: Date Filtering for User Food Logs**

The `GET /api/v1/food-logs/user/:userId` endpoint now supports date filtering to help users retrieve their food logs for specific time periods.

## ✨ **New Query Parameters**

### **startDate** (optional)
- **Format**: Epoch timestamp in milliseconds
- **Description**: Filter food logs from this date onwards
- **Example**: `?startDate=1704067200000` (Jan 1, 2024 00:00:00 UTC)

### **endDate** (optional)
- **Format**: Epoch timestamp in milliseconds
- **Description**: Filter food logs up to this date
- **Example**: `?endDate=1706745599999` (Jan 31, 2024 23:59:59 UTC)

### **Combined Usage**
- **Date Range**: `?startDate=1704067200000&endDate=1706745599999` (January 2024)
- **From Date**: `?startDate=1704067200000` (all logs from Jan 1st onwards)
- **Until Date**: `?endDate=1706745599999` (all logs up to Jan 31st)

## 📋 **API Examples**

### **Get All User Food Logs**
```http
GET /api/v1/food-logs/user/user123?page=1&limit=10
```

### **Get Food Logs for January 2024**
```http
GET /api/v1/food-logs/user/user123?startDate=1704067200000&endDate=1706745599999
```

### **Get Food Logs from Last Week**
```http
GET /api/v1/food-logs/user/user123?startDate=1704067200000&endDate=1704671999999
```

### **Get Recent Food Logs (Last 7 Days)**
```http
GET /api/v1/food-logs/user/user123?startDate=1704067200000
```

## 🔧 **Validation**

- **Date Format**: Must be valid epoch timestamp in milliseconds
- **Date Logic**: startDate must be before or equal to endDate
- **Error Handling**: Returns 400 Bad Request for invalid timestamps

## 💡 **Use Cases**

### **Monthly Reports**
Get all food logs for a specific month to generate monthly nutrition reports.

### **Weekly Tracking**
Retrieve food logs for the past week to track weekly nutrition patterns.

### **Date Range Analysis**
Analyze food consumption patterns over custom date ranges.

### **Recent Activity**
Get food logs from a specific date onwards to see recent activity.

## 🚀 **JavaScript Examples**

```javascript
// Get all food logs
const allLogs = await fetch('/api/v1/food-logs/user/user123');

// Get logs for specific month (January 2024)
const startDate = new Date('2024-01-01').getTime(); // 1704067200000
const endDate = new Date('2024-01-31T23:59:59').getTime(); // 1706745599999
const monthlyLogs = await fetch(`/api/v1/food-logs/user/user123?startDate=${startDate}&endDate=${endDate}`);

// Get logs from last week
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);
const lastWeekLogs = await fetch(`/api/v1/food-logs/user/user123?startDate=${lastWeek.getTime()}`);

// Get logs for today
const today = new Date();
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();
const todayLogs = await fetch(`/api/v1/food-logs/user/user123?startDate=${startOfDay}&endDate=${endOfDay}`);
```

## 📊 **Response Format**

The response format remains the same, but now includes only the food logs within the specified date range:

```json
{
  "success": true,
  "data": [
    {
      "_id": "log_id",
      "user": "user_id",
      "meal": { /* meal details */ },
      "mealType": "breakfast",
      "quantity": 1.5,
      "loggedAt": "2024-01-15T08:30:00Z",
      "notes": "Notes here"
    }
    // ... more logs within date range
  ],
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 50,
    "limit": 10
  }
}
```

## ✅ **Backward Compatibility**

- All existing functionality remains unchanged
- Date parameters are optional
- If no date parameters are provided, all user food logs are returned
- Existing pagination and other query parameters work as before

## 🎯 **Benefits**

1. **Efficient Filtering**: Get only relevant food logs for specific time periods
2. **Better Performance**: Reduced data transfer for date-specific queries
3. **Analytics Support**: Easier to generate reports for specific time ranges
4. **User Experience**: More targeted data retrieval for better UX
5. **Flexible Queries**: Support for various date range scenarios

The date filtering feature is now fully integrated and ready for use! Users can efficiently filter their food logs by date ranges while maintaining all existing functionality.
