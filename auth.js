// Authentication JavaScript
const API_BASE = window.location.origin;

// Show/hide messages
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }
}

function formatApiError(data, fallback) {
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    if (data.details) return `${data.error || fallback}\n${data.details}`;
    return data.error || fallback;
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }
}

// Register functionality
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Clear previous messages
        document.getElementById('errorMessage').classList.remove('show');
        document.getElementById('successMessage').classList.remove('show');
        
        // Validation
        if (password !== confirmPassword) {
            showError('errorMessage', 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            showError('errorMessage', 'Password must be at least 6 characters');
            return;
        }
        
        const btn = document.getElementById('registerBtn');
        btn.disabled = true;
        btn.textContent = 'Creating Account...';
        
        try {
            const response = await fetch(`${API_BASE}/.netlify/functions/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, email: email || null })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccess('successMessage', 'Account created successfully! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showError('errorMessage', formatApiError(data, 'Registration failed'));
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        } catch (error) {
            showError('errorMessage', 'Network error. Please try again.');
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}

// Login functionality
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Clear previous messages
        document.getElementById('errorMessage').classList.remove('show');
        document.getElementById('successMessage').classList.remove('show');
        
        const btn = document.getElementById('loginBtn');
        btn.disabled = true;
        btn.textContent = 'Signing In...';
        
        try {
            const response = await fetch(`${API_BASE}/.netlify/functions/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store token and user info
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('username', data.user.username);
                
                showSuccess('successMessage', 'Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showError('errorMessage', formatApiError(data, 'Login failed'));
                btn.disabled = false;
                btn.textContent = 'Sign In';
            }
        } catch (error) {
            showError('errorMessage', 'Network error. Please try again.');
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });
}

// Forgot Password functionality
if (document.getElementById('forgotPasswordLink')) {
    const forgotModal = document.getElementById('forgotPasswordModal');
    const closeForgotModal = document.getElementById('closeForgotModal');
    const cancelForgot = document.getElementById('cancelForgot');
    const submitForgot = document.getElementById('submitForgot');
    let resetToken = null;
    
    document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        forgotModal.classList.add('active');
    });
    
    closeForgotModal.addEventListener('click', () => {
        forgotModal.classList.remove('active');
        resetForm();
    });
    
    cancelForgot.addEventListener('click', () => {
        forgotModal.classList.remove('active');
        resetForm();
    });
    
    forgotModal.addEventListener('click', (e) => {
        if (e.target.id === 'forgotPasswordModal') {
            forgotModal.classList.remove('active');
            resetForm();
        }
    });
    
    function resetForm() {
        document.getElementById('forgotUsername').value = '';
        document.getElementById('resetToken').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('resetTokenGroup').style.display = 'none';
        document.getElementById('newPasswordGroup').style.display = 'none';
        document.getElementById('forgotErrorMessage').classList.remove('show');
        document.getElementById('forgotSuccessMessage').classList.remove('show');
        submitForgot.textContent = 'Request Reset';
        resetToken = null;
    }
    
    submitForgot.addEventListener('click', async () => {
        const username = document.getElementById('forgotUsername').value.trim();
        const token = document.getElementById('resetToken').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        
        document.getElementById('forgotErrorMessage').classList.remove('show');
        document.getElementById('forgotSuccessMessage').classList.remove('show');
        
        if (!resetToken) {
            // Step 1: Request reset token
            if (!username) {
                showError('forgotErrorMessage', 'Please enter your username');
                return;
            }
            
            submitForgot.disabled = true;
            submitForgot.textContent = 'Requesting...';
            
            try {
                const response = await fetch(`${API_BASE}/.netlify/functions/forgot-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Show token input (in production, this would be sent via email)
                    resetToken = data.resetToken;
                    document.getElementById('resetTokenGroup').style.display = 'block';
                    document.getElementById('newPasswordGroup').style.display = 'block';
                    if (resetToken) {
                        document.getElementById('resetToken').value = resetToken;
                    }
                    showSuccess('forgotSuccessMessage', 'Reset token generated. Please use it to reset your password.');
                    submitForgot.textContent = 'Reset Password';
                } else {
                    showError('forgotErrorMessage', data.error || 'Failed to request reset');
                    submitForgot.disabled = false;
                    submitForgot.textContent = 'Request Reset';
                }
            } catch (error) {
                showError('forgotErrorMessage', 'Network error. Please try again.');
                submitForgot.disabled = false;
                submitForgot.textContent = 'Request Reset';
            }
        } else {
            // Step 2: Reset password with token
            if (!token || !newPassword) {
                showError('forgotErrorMessage', 'Please enter the reset token and new password');
                return;
            }
            
            if (newPassword.length < 6) {
                showError('forgotErrorMessage', 'Password must be at least 6 characters');
                return;
            }
            
            submitForgot.disabled = true;
            submitForgot.textContent = 'Resetting...';
            
            try {
                const response = await fetch(`${API_BASE}/.netlify/functions/reset-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ resetToken: token, newPassword })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showSuccess('forgotSuccessMessage', 'Password reset successfully! Redirecting to login...');
                    setTimeout(() => {
                        forgotModal.classList.remove('active');
                        resetForm();
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showError('forgotErrorMessage', data.error || 'Failed to reset password');
                    submitForgot.disabled = false;
                    submitForgot.textContent = 'Reset Password';
                }
            } catch (error) {
                showError('forgotErrorMessage', 'Network error. Please try again.');
                submitForgot.disabled = false;
                submitForgot.textContent = 'Reset Password';
            }
        }
    });
}

