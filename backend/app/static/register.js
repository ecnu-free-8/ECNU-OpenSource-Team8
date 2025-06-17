document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const messageContainer = document.getElementById('registerMessage');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // 阻止表单默认提交行为

            // 清除之前的错误信息
            clearErrors();
            messageContainer.style.display = 'none';

            const username = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim(); // 前端有邮箱字段
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            let isValid = true;

            // 前端验证 (与后端验证规则保持一致或更严格)
            if (username === '') {
                displayError('usernameError', '用户名不能为空');
                isValid = false;
            } else if (username.length > 20) {
                displayError('usernameError', '用户名不能超过20个字符');
                isValid = false;
            }

            if (email === '') {
                displayError('emailError', '邮箱不能为空');
                isValid = false;
            } else if (!isValidEmail(email)) {
                displayError('emailError', '请输入有效的邮箱地址');
                isValid = false;
            }
            // 注意：你的后端注册逻辑目前没有处理 email 字段。

            if (password === '') {
                displayError('passwordError', '密码不能为空');
                isValid = false;
            } else if (password.length > 20) {
                displayError('passwordError', '密码不能超过20个字符');
                isValid = false;
            } else if (password.length < 3) { // 假设一个最小长度，可以根据你的后端调整
                displayError('passwordError', '密码长度不能少于3位');
                isValid = false;
            }


            if (confirmPassword === '') {
                displayError('confirmPasswordError', '请再次输入密码');
                isValid = false;
            } else if (password !== confirmPassword) {
                displayError('confirmPasswordError', '两次输入的密码不一致');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            // 如果后端也需要处理 email，则添加:
            // formData.append('email', email);

            try {
                const response = await fetch('/register', { // 你的后端注册API端点
                    method: 'POST',
                    body: formData
                });

                const data = await response.json(); // Flask总是返回JSON

                if (response.status === 201) { // HTTP 201 Created (来自你的后端)
                    showMessage(messageContainer, data.message || '注册成功！正在跳转到登录页面...', 'success');
                    setTimeout(() => {
                        window.location.href = 'login'; // 跳转到登录页
                    }, 2000); // 延迟2秒跳转
                } else { // 处理其他错误状态 (例如 400 Bad Request)
                    showMessage(messageContainer, data.error || `注册失败 (状态码: ${response.status})`, 'error');
                    // 可以根据后端返回的具体错误信息，定位到特定字段
                    if (data.error && data.error.toLowerCase().includes('username already exists')) {
                        displayError('usernameError', '该用户名已被注册');
                    }
                    if (data.error && data.error.toLowerCase().includes('username and password cannot be empty')) {
                        if(username === '') displayError('usernameError', '用户名不能为空');
                        if(password === '') displayError('passwordError', '密码不能为空');
                    }
                     if (data.error && data.error.toLowerCase().includes('username and password must be less than 20 characters')) {
                        if(username.length > 20) displayError('usernameError', '用户名不能超过20个字符');
                        if(password.length > 20) displayError('passwordError', '密码不能超过20个字符');
                    }
                }
            } catch (error) {
                console.error('注册请求处理出错:', error);
                showMessage(messageContainer, '注册请求失败，请检查网络或联系管理员。', 'error');
            }
        });
    }

    function displayError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block'; // 确保错误消息可见
        }
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(function(element) {
            element.textContent = '';
            element.style.display = 'none'; // 隐藏错误消息
        });
        if (messageContainer) { // 清除通用消息
            messageContainer.textContent = '';
            messageContainer.style.display = 'none';
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showMessage(container, message, type) {
        container.textContent = message;
        container.className = `message-feedback ${type}`;
        container.style.display = 'block';
    }
});