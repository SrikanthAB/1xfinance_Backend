/**
 * Test script for Forgot Password functionality
 * Run this after starting the server to test the forgot password endpoints
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

async function testForgotPassword() {
  console.log('🔐 Testing Forgot Password System...\n');

  try {
    // Step 1: Register a user (if not exists)
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

    // Step 2: Forgot Password - Send OTP
    console.log('\n2️⃣ Sending forgot password OTP...');
    const forgotPasswordResponse = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const forgotPasswordResult = await forgotPasswordResponse.json();
    console.log('📧 Forgot Password Result:', forgotPasswordResult);
    
    if (forgotPasswordResult.success) {
      console.log('✅ Password reset OTP sent successfully');
      
      // In development mode, OTP is returned in response
      if (forgotPasswordResult.data && forgotPasswordResult.data.otp) {
        console.log('🔑 OTP (Development):', forgotPasswordResult.data.otp);
        
        // Step 3: Verify Password Reset OTP
        console.log('\n3️⃣ Verifying password reset OTP...');
        const verifyOTPResponse = await fetch(`${BASE_URL}/verify-password-reset-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: testEmail, 
            otp: forgotPasswordResult.data.otp 
          })
        });
        
        const verifyOTPResult = await verifyOTPResponse.json();
        console.log('✅ Verify OTP Result:', verifyOTPResult);
        
        if (verifyOTPResult.success && verifyOTPResult.data && verifyOTPResult.data.token) {
          console.log('🎉 Password reset OTP verified successfully!');
          console.log('🔑 Reset Token:', verifyOTPResult.data.token);
          
          // Step 4: Reset Password
          console.log('\n4️⃣ Resetting password...');
          const resetPasswordResponse = await fetch(`${BASE_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: testEmail,
              token: verifyOTPResult.data.token,
              newPassword: 'newpassword123'
            })
          });
          
          const resetPasswordResult = await resetPasswordResponse.json();
          console.log('✅ Reset Password Result:', resetPasswordResult);
          
          if (resetPasswordResult.success) {
            console.log('🎉 Password reset successfully!');
            console.log('📊 User data:', resetPasswordResult.data);
            
            // Step 5: Test login with new password
            console.log('\n5️⃣ Testing login with new password...');
            const loginResponse = await fetch(`${BASE_URL}/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                emailOrPhone: testEmail,
                password: 'newpassword123'
              })
            });
            
            const loginResult = await loginResponse.json();
            console.log('✅ Login with new password:', loginResult);
            
            if (loginResult.success) {
              console.log('🎉 Login successful with new password!');
            }
          }
        }
      } else {
        console.log('ℹ️ Check your email for the password reset OTP (Production mode)');
      }
    }

    // Step 6: Test resend password reset OTP
    console.log('\n6️⃣ Testing resend password reset OTP...');
    const resendOTPResponse = await fetch(`${BASE_URL}/resend-password-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const resendOTPResult = await resendOTPResponse.json();
    console.log('📧 Resend OTP Result:', resendOTPResult);

    // Step 7: Test error cases
    console.log('\n7️⃣ Testing error cases...');
    
    // Test with invalid email
    const invalidEmailResponse = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email' })
    });
    const invalidEmailResult = await invalidEmailResponse.json();
    console.log('❌ Invalid email test:', invalidEmailResult.message);

    // Test with non-existent user
    const nonExistentResponse = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com' })
    });
    const nonExistentResult = await nonExistentResponse.json();
    console.log('❌ Non-existent user test:', nonExistentResult.message);

    // Test reset password with invalid token
    const invalidTokenResponse = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail,
        token: 'invalid-token',
        newPassword: 'newpassword123'
      })
    });
    const invalidTokenResult = await invalidTokenResponse.json();
    console.log('❌ Invalid token test:', invalidTokenResult.message);

    console.log('\n🎯 Forgot Password testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testForgotPassword();
