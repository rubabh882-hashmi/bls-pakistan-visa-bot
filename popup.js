// Monitoring and Notification Logic

const getCurrentDateTime = () => {
    const date = new Date();
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const logUserLogin = (username) => {
    console.log(`Current User's Login: ${username}`);
};

// Example Usage
console.log(`Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): ${getCurrentDateTime()}`);
logUserLogin('rubabh882-hashmi');