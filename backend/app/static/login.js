document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageContainer = document.getElementById('loginMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // 阻止表单默认提交行为
            messageContainer.style.display = 'none'; // 隐藏旧消息

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (username === '' || password === '') {
                showMessage(messageContainer, '用户名和密码不能为空！', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            try {
                const response = await fetch('/api/login', { // 你的后端登录API端点
                    method: 'POST',
                    body: formData
                });

                // 你的后端在登录成功时直接重定向，这对于 fetch API 来说处理方式不同
                // 如果后端返回的是 302 Redirect，fetch 会自动跟随（如果目标是同源的 GET）
                // 但对于登录后的页面跳转，最好是后端返回一个成功的 JSON，前端再进行跳转。
                // 或者，如果后端强制重定向并且成功了，response.ok 可能为 true，response.url 会是重定向后的 URL
                // 但如果后端 login 成功后返回 200 和 JSON (例如 {"message": "Login successful", "redirect_url": "/dashboard"}) 会更好控制

                if (response.ok) {
                    // 检查是否真的登录成功。由于你的后端直接 redirect,
                    // 如果 fetch 跟随了重定向并且新页面是 200 OK，这里会执行。
                    // 更好的做法是后端返回 JSON。
                    // 假设后端如果登录成功，会设置 session 并最终能访问一个受保护的页面
                    // 我们在这里尝试解析JSON，如果后端在重定向前返回了JSON，则按JSON处理
                    try {
                        const data = await response.json();
                        if (data.message === "Login successful" || response.status === 200 ) { // 假设后端改造后可能返回这样的信息
                             showMessage(messageContainer, '登录成功！正在跳转...', 'success');
                             // 根据后端实际返回的重定向URL或固定URL跳转
                             window.location.href = 'http://localhost:3001'; // 例如跳转到首页或仪表盘
                        } else {
                            showMessage(messageContainer, data.error || '登录失败，请检查用户名或密码。', 'error');
                        }
                    } catch (e) {
                        // 如果响应不是JSON，且 response.ok 为 true，可能发生了重定向
                        // 这通常意味着登录成功，浏览器应该已经被重定向了
                        // 如果没有自动重定向（比如 fetch 的 redirect: 'manual'），则需要前端决定
                        // 对于你的后端 `return redirect(), 200`，response.ok 可能是 true
                        // 但 response.body 可能为空或 HTML，而不是 JSON
                        // 最稳妥的方式是后端 login 接口返回 JSON
                        showMessage(messageContainer, '登录处理中...', 'success');
                        // 这里我们假设如果后端返回 200 且不是明确的 JSON 错误，就尝试刷新或跳转
                        // 实际中，你后端 login 接口最好明确返回 JSON 指示成功和下一步的 URL
                        // 例如: return jsonify({"message": "Login successful", "redirect_to": "/dashboard"}), 200
                        // 然后前端: window.location.href = data.redirect_to;
                        // 因为你的后端是 `return redirect(), 200` 这通常会让浏览器自行跳转如果表单直接提交的话
                        // 通过 fetch，你需要检查 response.url 是否已经是你期望的页面
                        if (response.redirected) {
                            window.location.href = response.url;
                        } else {
                            // 如果后端返回 200 但没有重定向且不是预期的 JSON，可能需要根据实际情况调整
                            // 假设登录成功后后端会将用户导向首页或某个受保护的页面
                            // 这里直接尝试跳转到首页，你可能需要调整目标URL
                            window.location.href = '/'; // 或 '/dashboard.html' 等
                        }
                    }
                } else {
                    // 处理 HTTP 错误状态 (4xx, 5xx)
                    const errorData = await response.json(); // Flask通常会返回JSON错误
                    showMessage(messageContainer, errorData.error || `登录失败 (状态码: ${response.status})`, 'error');
                }
            } catch (error) {
                console.error('登录请求处理出错:', error);
                showMessage(messageContainer, '登录请求失败，请检查网络或联系管理员。', 'error');
            }
        });
    }

    function showMessage(container, message, type) {
        container.textContent = message;
        container.className = `message-feedback ${type}`; // 应用 'error' 或 'success' 类
        container.style.display = 'block';
    }
});