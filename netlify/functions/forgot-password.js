// Forgot password - generate reset token
const { query } = require('./utils/db');
const { generateResetToken } = require('./utils/auth');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { username } = JSON.parse(event.body);

        if (!username) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Username is required' })
            };
        }

        // Find user
        const result = await query(
            'SELECT id, username, email FROM users WHERE username = $1',
            [username]
        );

        // Always return success (security: don't reveal if user exists)
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const resetToken = generateResetToken();
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour

            await query(
                'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
                [resetToken, expiresAt, user.id]
            );

            // In production, send email with reset link
            // For now, we'll return the token (in production, send via email)
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'If the username exists, a password reset link has been sent.',
                    // In production, remove this token from response
                    resetToken: resetToken // Only for development/testing
                })
            };
        }

        // Return same message even if user doesn't exist (security)
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'If the username exists, a password reset link has been sent.'
            })
        };
    } catch (error) {
        console.error('Forgot password error:', error);
        if (error && error.code === 'MISSING_DATABASE_URL') {
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: error.message })
            };
        }
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

