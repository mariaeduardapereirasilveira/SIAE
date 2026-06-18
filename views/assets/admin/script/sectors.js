function checkAuth() { if (localStorage.getItem('siae_is_logged_in') !== 'true') { window.location.href = '../public/login.html'; return false; } const role = localStorage.getItem('siae_user_role'); if (role !== 'admin') { window.location.href = '../app/dashboard.html'; return false; } return true; }
        function openModal(id) { document.getElementById(id).classList.add('active'); document.body.style.overflow = 'hidden'; }
        function closeModal(id) { document.getElementById(id).classList.remove('active'); document.body.style.overflow = ''; }

        function saveSector() {
            const name = document.getElementById('sectorName').value;
            const acronym = document.getElementById('sectorAcronym').value.toUpperCase();
            const color = document.getElementById('sectorColor').value;
            const desc = document.getElementById('sectorDesc').value;
            if (name && acronym) {
                const grid = document.getElementById('sectorsGrid');
                const card = document.createElement('div');
                card.className = 'card';
                card.style.cssText = 'padding: 20px; cursor: pointer;';
                card.setAttribute('onclick', `editSector('${name}')`);
                const badgeClass = color === '#EF5350' ? 'badge-danger' : (color === '#7C4DFF' ? 'badge-info' : (color === '#26A69A' ? 'badge-success' : 'badge-primary'));
                card.innerHTML = `<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;"><div style="width: 44px; height: 44px; border-radius: 12px; background: ${color}20; display: flex; align-items: center; justify-content: center;"><svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" width="22" height="22"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div><div><div style="font-weight: 700; font-size: 15px;">${name}</div><span class="badge ${badgeClass}" style="font-size: 10px;">${acronym}</span></div></div><p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">${desc || 'Setor de atuacao.'}</p><div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);"><span>0 profissionais</span><span>0 atendimentos/mes</span></div>`;
                grid.appendChild(card);
                closeModal('sectorModal');
                document.getElementById('sectorName').value = '';
                document.getElementById('sectorAcronym').value = '';
                document.getElementById('sectorDesc').value = '';
            }
        }

        function editSector(name) { alert('Editar setor: ' + name); }
        function handleLogout() { localStorage.clear(); window.location.href = '../public/login.html'; }
        checkAuth();

