// Check authentication and role
        function checkAuth() {
            const isLoggedIn = localStorage.getItem('siae_is_logged_in');
            const role = localStorage.getItem('siae_user_role');

            if (isLoggedIn !== 'true') {
                window.location.href = '../public/login.html';
                return false;
            }

            // Only professionals can access this page
            if (role === 'admin') {
                window.location.href = 'dashboard.html';
                return false;
            }

            return true;
        }

        function switchTab(tabName) {
            // Update tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.closest('.tab-btn').classList.add('active');

            // Update content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('tab-' + tabName).classList.add('active');
        }

        function openNewOccurrenceModal() {
            openModal('newOccurrenceModal');
        }

        function openShareModal(occurrenceId) {
            openModal('shareModal');
        }

        function saveOccurrence() {
            closeModal('newOccurrenceModal');
            showNotification('Ocorrencia salva com sucesso!', 'success');
        }

        function confirmShare() {
            closeModal('shareModal');
            showNotification('Ocorrencia compartilhada com sucesso!', 'success');
        }

        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
            document.body.style.overflow = '';
        }

        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = 'notification notification-' + type;
            notification.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">x</button>`;
            notification.style.cssText = 'position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: var(--radius-md); background: var(--surface); box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 12px; z-index: 300; animation: slideUp 0.3s ease; border-left: 4px solid var(' + (type === 'success' ? '--success' : '--danger') + ');';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }

        function handleLogout() {
            localStorage.removeItem('siae_is_logged_in');
            localStorage.removeItem('siae_user_role');
            window.location.href = '../public/login.html';
        }

        // Initialize
        if (checkAuth()) {
            // Check for action param to open new occurrence modal
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('action') === 'new') {
                openNewOccurrenceModal();
            }
        }

