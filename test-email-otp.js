/**
 * Test script for Email OTP functionality
 * Run this after starting the server to test the email OTP endpoints
 */

const BASE_URL = 'http://localhost:3000/api/user';

// Test data
const testUser = {
  fullName: 'Test User',
  phoneNumber: '+1234567890',
  email: 'test@example.com',
  password: 'password123'
};

const testEmail = 'test@example.com';

async function testEmailOTP() {
  console.log('🧪 Testing Email OTP System...\n');

  try {
    // Step 1: Register a user
    console.log('1️⃣ Registering test user...');
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const registerResult = await registerResponse.json();
    if (registerResult.success) {
      console.log('✅ User registered successfully');
    } else {
      console.log('ℹ️ User might already exist:', registerResult.message);
    }

    // Step 2: Send Email OTP
    console.log('\n2️⃣ Sending email OTP...');
    const sendOTPResponse = await fetch(`${BASE_URL}/email/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const sendOTPResult = await sendOTPResponse.json();
    console.log('📧 Send OTP Result:', sendOTPResult);
    
    if (sendOTPResult.success) {
      console.log('✅ OTP sent successfully');
      
      // In development mode, OTP is returned in response
      if (sendOTPResult.data && sendOTPResult.data.otp) {
        console.log('🔑 OTP (Development):', sendOTPResult.data.otp);
        
        // Step 3: Verify Email OTP
        console.log('\n3️⃣ Verifying email OTP...');
        const verifyOTPResponse = await fetch(`${BASE_URL}/email/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: testEmail, 
            otp: sendOTPResult.data.otp 
          })
        });
        
        const verifyOTPResult = await verifyOTPResponse.json();
        console.log('✅ Verify OTP Result:', verifyOTPResult);
        
        if (verifyOTPResult.success) {
          console.log('🎉 Email verification successful!');
          console.log('📊 User data:', verifyOTPResult.data);
        }
      } else {
        console.log('ℹ️ Check your email for the OTP (Production mode)');
      }
    }

    // Step 4: Test resend OTP
    console.log('\n4️⃣ Testing resend OTP...');
    const resendOTPResponse = await fetch(`${BASE_URL}/email/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const resendOTPResult = await resendOTPResponse.json();
    console.log('📧 Resend OTP Result:', resendOTPResult);

    // Step 5: Test error cases
    console.log('\n5️⃣ Testing error cases...');
    
    // Test with invalid email
    const invalidEmailResponse = await fetch(`${BASE_URL}/email/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email' })
    });
    const invalidEmailResult = await invalidEmailResponse.json();
    console.log('❌ Invalid email test:', invalidEmailResult.message);

    // Test with non-existent user
    const nonExistentResponse = await fetch(`${BASE_URL}/email/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com' })
    });
    const nonExistentResult = await nonExistentResponse.json();
    console.log('❌ Non-existent user test:', nonExistentResult.message);

    console.log('\n🎯 Email OTP testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEmailOTP();
