# Unique Code Generator Documentation

## Overview

The Unique Code Generator is a comprehensive utility system that generates unique codes with the format **[A-Z][0-9]{4}** (one alphabet followed by 4 digits). It ensures uniqueness by checking both in-memory cache and database records, preventing duplicate codes.

## Features

- ✅ **Format**: One alphabet (A-Z) + 4 digits (0-9)
- ✅ **Database Verification**: Checks Firestore for existing codes
- ✅ **In-Memory Caching**: Prevents duplicates within the same session
- ✅ **Collision Prevention**: Automatic retry with new codes if duplicates found
- ✅ **Multiple Code Generation**: Generate multiple unique codes at once
- ✅ **Custom Configuration**: Configurable prefix, length, and collection
- ✅ **Error Handling**: Graceful fallback mechanisms
- ✅ **TypeScript Support**: Full type safety and IntelliSense

## Code Format Examples

```
A1234
B5678
C9012
D3456
E7890
```

## Usage

### Basic Usage

```typescript
import { UniqueCodeGenerator } from '../utils/uniqueCodeGenerator';

// Generate a single unique code
const code = await UniqueCodeGenerator.generateUniqueCode({
  prefix: 'QT',
  collectionName: 'quotations',
  fieldName: 'quoteNumber'
});
// Result: "QT-A1234"
```

### Predefined Functions

```typescript
import { 
  generateQuotationCode,
  generateInvoiceCode,
  generateTicketCode,
  generateCustomerCode,
  generateProjectCode
} from '../utils/uniqueCodeGenerator';

// Generate quotation code
const quotationCode = await generateQuotationCode();
// Result: "QT-A1234"

// Generate invoice code
const invoiceCode = await generateInvoiceCode();
// Result: "INV-B5678"

// Generate ticket code
const ticketCode = await generateTicketCode();
// Result: "TKT-C9012"
```

### Multiple Code Generation

```typescript
// Generate 5 unique codes at once
const codes = await UniqueCodeGenerator.generateMultipleUniqueCodes({
  prefix: 'TEST',
  collectionName: 'test',
  fieldName: 'code'
}, 5);
// Result: ["TEST-A1234", "TEST-B5678", "TEST-C9012", "TEST-D3456", "TEST-E7890"]
```

### Custom Configuration

```typescript
const customCode = await UniqueCodeGenerator.generateUniqueCode({
  prefix: 'CUST',
  collectionName: 'users',
  fieldName: 'customerCode',
  length: 6  // Custom length: A123456
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | string | `''` | Prefix to add before the code |
| `collectionName` | string | Required | Firestore collection name |
| `fieldName` | string | Required | Field name to check for uniqueness |
| `length` | number | `4` | Number of digits in the code |

## Implementation Details

### Database Verification

The generator performs real-time checks against Firestore:

```typescript
// Checks if code exists in database
const exists = await checkCodeExists('quotations', 'quoteNumber', 'QT-A1234');
```

### In-Memory Caching

Prevents duplicate generation within the same session:

```typescript
// Add to cache
UniqueCodeGenerator.usedCodes.add('QT-A1234');

// Check cache
const isUsed = UniqueCodeGenerator.usedCodes.has('QT-A1234');
```

### Collision Prevention

If a duplicate is found, the generator automatically retries:

```typescript
let attempts = 0;
const maxAttempts = 100;

while (attempts < maxAttempts) {
  const code = generateCode();
  if (!existsInDatabase(code) && !existsInCache(code)) {
    return code;
  }
  attempts++;
}
```

## Error Handling

### Graceful Fallbacks

```typescript
try {
  const uniqueCode = await generateQuotationCode();
  // Use unique code
} catch (error) {
  console.error('Error generating unique code:', error);
  // Fallback to timestamp-based code
  const fallbackCode = `QT-${Date.now()}`;
}
```

### Maximum Attempts

If unable to generate a unique code after 100 attempts, throws an error:

```typescript
throw new Error(`Unable to generate unique code after ${maxAttempts} attempts`);
```

## Utility Functions

### Code Validation

```typescript
// Validate code format
const isValid = UniqueCodeGenerator.validateCodeFormat('A1234', 4);
// Returns: true

const isInvalid = UniqueCodeGenerator.validateCodeFormat('AB123', 4);
// Returns: false
```

### Cache Management

```typescript
// Clear cache
UniqueCodeGenerator.clearCache();

// Get cached codes
const cachedCodes = UniqueCodeGenerator.getCachedCodes();
```

## Integration Examples

### React Component Integration

```typescript
const AdminQuotations: React.FC = () => {
  const openModal = async (quotation: Quotation | null = null) => {
    if (!quotation) {
      try {
        const uniqueQuoteNumber = await generateQuotationCode();
        const newQuotation = {
          quoteNumber: uniqueQuoteNumber,
          // ... other fields
        };
        setCurrentQuotation(newQuotation);
      } catch (error) {
        // Fallback to old method
        const fallbackCode = `QT-${Date.now()}`;
        // ...
      }
    }
    setIsModalOpen(true);
  };
};
```

### Service Integration

```typescript
// In database service
export const createQuotation = async (quotationData: QuotationData) => {
  const uniqueCode = await generateQuotationCode();
  
  const quotation = {
    ...quotationData,
    quoteNumber: uniqueCode,
    createdAt: serverTimestamp()
  };
  
  return await addDoc(collection(db, 'quotations'), quotation);
};
```

## Testing

### Test Component

A comprehensive test component is available at `components/admin/UniqueCodeTest.tsx`:

- Generate different types of codes
- Test custom configurations
- Validate code formats
- Test multiple code generation
- Monitor cache status

### Manual Testing

```typescript
// Test single code generation
const code1 = await generateQuotationCode();
const code2 = await generateQuotationCode();
console.log(code1 !== code2); // Should be true

// Test format validation
console.log(UniqueCodeGenerator.validateCodeFormat(code1)); // Should be true
```

## Performance Considerations

### Database Queries

- Each code generation performs one Firestore query
- Queries are optimized with proper indexing
- Consider batch operations for multiple codes

### Memory Usage

- In-memory cache grows with usage
- Cache is cleared on page refresh
- Use `clearCache()` for memory management

### Concurrent Generation

- Thread-safe for concurrent requests
- Database-level uniqueness ensures no conflicts
- Cache prevents race conditions

## Security Considerations

### Code Predictability

- Random alphabet and digits prevent prediction
- No sequential patterns
- Sufficient entropy for uniqueness

### Database Access

- Proper Firestore security rules required
- Read-only access for code verification
- No sensitive data in generated codes

## Troubleshooting

### Common Issues

1. **"Unable to generate unique code"**
   - Check Firestore connection
   - Verify collection and field names
   - Ensure proper permissions

2. **Slow code generation**
   - Check Firestore performance
   - Consider database indexing
   - Monitor network latency

3. **Format validation errors**
   - Verify code length parameter
   - Check alphabet/digit generation
   - Ensure proper regex patterns

### Debug Mode

```typescript
// Enable debug logging
console.log('Generated code:', code);
console.log('Cache status:', UniqueCodeGenerator.getCachedCodes());
console.log('Database check result:', exists);
```

## Future Enhancements

- [ ] Batch code generation optimization
- [ ] Redis caching for multi-instance deployments
- [ ] Code expiration and cleanup
- [ ] Analytics and usage tracking
- [ ] Custom alphabet sets
- [ ] Code reservation system

## Changelog

### Version 1.0.0
- Initial implementation
- Basic unique code generation
- Database verification
- In-memory caching
- TypeScript support
- Comprehensive error handling
