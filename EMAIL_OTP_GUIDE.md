# Email OTP System Documentation

## Overview
This system provides email-based OTP (One-Time Password) verification for user email addresses. It includes sending OTPs via email and verifying them securely.

## Features
- ✅ Send OTP to user's email address
- ✅ Verify OTP with attempt limiting (max 3 attempts)
- ✅ OTP expiration (10 minutes)
- ✅ Resend OTP functionality
- ✅ Beautiful HTML email templates
- ✅ Development mode with OTP in response
- ✅ Email verification status tracking
- ✅ Clean and secure implementation

## API Endpoints

### 1. Send Email OTP
**POST** `/api/user/email/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "data": {
    "otp": "123456"  // Only in development mode
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "No user found with this email address"
}
```

### 2. Verify Email OTP
**POST** `/api/user/email/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "data": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "emailVerified": true,
    "emailVerifiedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid OTP. 2 attempts remaining."
}
```

### 3. Resend Email OTP
**POST** `/api/user/email/resend-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** Same as send OTP endpoint

## Environment Configuration

Add these variables to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=1X Finance <noreply@1xfinance.com>

# Environment
NODE_ENV=development  # Set to 'production' for production
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
```

## Security Features

1. **OTP Expiration:** 10 minutes
2. **Attempt Limiting:** Maximum 3 attempts per OTP
3. **Rate Limiting:** Prevents spam by checking existing valid OTPs
4. **Email Validation:** Validates email format before sending
5. **Secure Storage:** OTPs are stored in memory (not database)
6. **Auto Cleanup:** Expired OTPs are automatically removed

## Usage Examples

### Frontend Integration

```javascript
// Send OTP
const sendOTP = async (email) => {
  const response = await fetch('/api/user/email/send-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  });
  return await response.json();
};

// Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch('/api/user/email/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp })
  });
  return await response.json();
};

// Resend OTP
const resendOTP = async (email) => {
  const response = await fetch('/api/user/email/resend-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  });
  return await response.json();
};
```

### cURL Examples

```bash
# Send OTP
curl -X POST http://localhost:3000/api/user/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Verify OTP
curl -X POST http://localhost:3000/api/user/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'

# Resend OTP
curl -X POST http://localhost:3000/api/user/email/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## Error Handling

The system handles various error scenarios:

- **Invalid email format**
- **User not found**
- **Email already verified**
- **OTP expired**
- **Too many attempts**
- **Invalid OTP**
- **SMTP configuration errors**

## Development vs Production

### Development Mode
- OTP is included in API response for testing
- Detailed error messages
- Console logging enabled

### Production Mode
- OTP is never returned in API response
- Generic error messages for security
- Minimal logging

## Database Changes

The user model now includes:
- `emailVerified: boolean` - Email verification status
- `emailVerifiedAt: Date` - Timestamp when email was verified

## Testing

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test with a registered user:**
   ```bash
   # First, register a user
   curl -X POST http://localhost:3000/api/user/register \
     -H "Content-Type: application/json" \
     -d '{"fullName": "Test User", "phoneNumber": "+1234567890", "email": "test@example.com", "password": "password123"}'
   
   # Then send OTP
   curl -X POST http://localhost:3000/api/user/email/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

## Troubleshooting

### Common Issues

1. **"Failed to send OTP"**
   - Check SMTP configuration
   - Verify email credentials
   - Check network connectivity

2. **"No user found with this email address"**
   - User must be registered first
   - Check email spelling

3. **"Email is already verified"**
   - User's email is already verified
   - Check user status in database

4. **"OTP has expired"**
   - OTP is valid for 10 minutes only
   - Request a new OTP

5. **"Too many failed attempts"**
   - User exceeded 3 attempts
   - Request a new OTP

## Security Considerations

1. **Never log OTPs in production**
2. **Use secure SMTP credentials**
3. **Implement rate limiting at API level**
4. **Monitor for suspicious activity**
5. **Regularly clean up expired OTPs**

## Support

For issues or questions, please check:
1. Environment configuration
2. SMTP provider settings
3. Network connectivity
4. User registration status
