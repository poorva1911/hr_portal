document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.auth-tab');
    const form = document.getElementById('auth-form');
    const signupFields = document.getElementById('signup-fields');
    const authBtn = document.getElementById('auth-btn');
    const btnText = authBtn.querySelector('.btn-text');
    const loader = document.getElementById('auth-loader');
    const errorMsg = document.getElementById('error-msg');
    
    let isLoginMode = true;

    // Check if implicitly logged in
    const token = localStorage.getItem('token');
    if (token) {
        const role = localStorage.getItem('role');
        window.location.href = role === 'hr' ? '/hr.html' : '/candidate.html';
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            isLoginMode = tab.dataset.mode === 'login';
            
            if (isLoginMode) {
                signupFields.classList.add('hidden');
                btnText.textContent = 'Login';
            } else {
                signupFields.classList.remove('hidden');
                btnText.textContent = 'Create Account';
            }
            errorMsg.style.display = 'none';
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.getElementById('role').value;

        if (!username || !password) return;

        authBtn.disabled = true;
        loader.classList.remove('hidden');
        errorMsg.style.display = 'none';

        const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
        const payload = isLoginMode ? { username, password } : { username, password, role };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            if (isLoginMode) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('username', data.username);
                window.location.href = data.role === 'hr' ? '/hr.html' : '/candidate.html';
            } else {
                // Auto login after signup
                const loginRes = await fetch(`/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const loginData = await loginRes.json();
                localStorage.setItem('token', loginData.token);
                localStorage.setItem('role', loginData.role);
                localStorage.setItem('username', loginData.username);
                window.location.href = loginData.role === 'hr' ? '/hr.html' : '/candidate.html';
            }
        } catch (err) {
            errorMsg.textContent = err.message;
            errorMsg.style.display = 'block';
        } finally {
            authBtn.disabled = false;
            loader.classList.add('hidden');
        }
    });
});
