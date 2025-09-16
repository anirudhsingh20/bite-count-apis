# Epoch Timestamp Update for Date Filtering

## 🕐 **Updated Feature: Epoch Timestamp Support**

The date filtering for `GET /api/v1/food-logs/user/:userId` now uses epoch timestamps instead of ISO date strings for better performance and easier programmatic usage.

## ✨ **Key Changes**

### **Before (ISO Date Strings)**
```http
GET /api/v1/food-logs/user/user123?startDate=2024-01-01&endDate=2024-01-31
```

### **After (Epoch Timestamps)**
```http
GET /api/v1/food-logs/user/user123?startDate=1704067200000&endDate=1706745599999
```

## 🔧 **Technical Benefits**

1. **Performance**: No string parsing required on the server
2. **Precision**: Millisecond-level precision for exact time filtering
3. **Efficiency**: Direct integer comparison instead of date parsing
4. **Consistency**: Matches JavaScript's native `Date.getTime()` method
5. **Timezone Independence**: Epoch timestamps are always UTC

## 📋 **Updated Query Parameters**

- **startDate**: Epoch timestamp in milliseconds (e.g., `1704067200000`)
- **endDate**: Epoch timestamp in milliseconds (e.g., `1706745599999`)
- **page**: Page number (default: 1)
- **limit**: Items per page (default: 200, max: 1000)

## 🚀 **JavaScript Usage Examples**

### **Basic Date Range**
```javascript
// January 2024
const startDate = new Date('2024-01-01').getTime(); // 1704067200000
const endDate = new Date('2024-01-31T23:59:59').getTime(); // 1706745599999
const response = await fetch(`/api/v1/food-logs/user/user123?startDate=${startDate}&endDate=${endDate}`);
```

### **Last 7 Days**
```javascript
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
const response = await fetch(`/api/v1/food-logs/user/user123?startDate=${sevenDaysAgo.getTime()}`);
```

### **Today Only**
```javascript
const today = new Date();
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();
const response = await fetch(`/api/v1/food-logs/user/user123?startDate=${startOfDay}&endDate=${endOfDay}`);
```

### **This Month**
```javascript
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
const response = await fetch(`/api/v1/food-logs/user/user123?startDate=${startOfMonth}&endDate=${endOfMonth}`);
```

## 🔍 **Common Epoch Timestamps**

| Date | Epoch Timestamp | Description |
|------|----------------|-------------|
| 2024-01-01 00:00:00 UTC | 1704067200000 | Start of 2024 |
| 2024-01-31 23:59:59 UTC | 1706745599999 | End of January 2024 |
| 2024-02-01 00:00:00 UTC | 1706745600000 | Start of February 2024 |
| 2024-12-31 23:59:59 UTC | 1735689599999 | End of 2024 |

## ⚠️ **Validation**

- **Format**: Must be valid epoch timestamp (integer)
- **Range**: Must be a valid date when converted
- **Logic**: startDate must be ≤ endDate
- **Error**: Returns 400 Bad Request for invalid timestamps

## 🎯 **Benefits for Developers**

1. **Easier Integration**: Direct use of `Date.getTime()` in JavaScript
2. **Better Performance**: No string parsing overhead
3. **Precise Filtering**: Millisecond-level accuracy
4. **Timezone Safe**: Always UTC-based
5. **Consistent**: Matches standard JavaScript date handling

## ✅ **Backward Compatibility**

- All existing functionality remains unchanged
- Only the date parameter format has changed
- Error messages updated to reflect epoch timestamp requirement
- Documentation updated with new examples

The epoch timestamp update is now fully integrated and provides better performance and easier programmatic usage for date filtering!
