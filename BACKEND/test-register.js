const axios = require('axios');

async function testRegister() {
  try {
    const response = await axios.post('http://localhost:5000/api/v1/auth/register', {
      name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      experienceLevel: 'fresher',
      preferredRole: 'Full Stack Developer'
    });

    console.log('✅ Registration successful!');
    console.log('User:', response.data.data.user);
    console.log('Token received:', !!response.data.data.accessToken);
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
  }
}

testRegister();