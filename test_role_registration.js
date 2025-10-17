// TEST SCRIPT FOR ROLE SELECTION
// Run this after database table is created

const testRegister = async (roleType) => {
    const testData = {
        name: `Test ${roleType}`,
        email: `test${roleType.toLowerCase()}@example.com`,
        password: "password123",
        role: roleType
    };

    try {
        const response = await fetch('http://localhost:8000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log(`✅ ${roleType} Registration SUCCESS:`, result);
        } else {
            console.log(`❌ ${roleType} Registration FAILED:`, result);
        }
    } catch (error) {
        console.log(`❌ ${roleType} Registration ERROR:`, error.message);
    }
};

// Test all roles
const runTests = async () => {
    console.log('🚀 Testing Role Selection Feature...\n');
    
    await testRegister('USER');
    await testRegister('TENANT'); 
    await testRegister('ADMIN');
    
    console.log('\n✅ Role Selection Tests Completed!');
};

// Run tests
runTests();
