// Authentication utilities
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Hash password
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

// Compare password
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Generate reset token
function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Create JWT-like token (simple implementation)
function createToken(userId, username) {
    const payload = {
        userId,
        username,
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Verify token
function verifyToken(token) {
    try {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());
        if (payload.exp && payload.exp > Date.now()) {
            return payload;
        }
        return null;
    } catch (error) {
        return null;
    }
}

module.exports = {
    hashPassword,
    comparePassword,
    generateResetToken,
    createToken,
    verifyToken
};

