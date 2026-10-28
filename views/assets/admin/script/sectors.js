import Sector from '../../_common/classes/Sector.js';
import SectorService from '../../_common/classes/SectorService.js';
import Toast from '../../_common/prototypes/Toast.js';
import FormControllerPrototype from '../../_common/prototypes/FormControllerPrototype.js';
const sectorService = new SectorService();

const toast = Object.create(Toast);
const formController = Object.create(FormControllerPrototype);
function checkAuth() {
    const token = localStorage.getItem('token');
    const enrollment = localStorage.getItem('enrollment');

    if (!token) {
        window.location.href = '../public/login.html';
        return false;
    }


    // if (enrollment !== 'admin') {
    //     window.location.href = '../app/dashboard.html'; 
    //     return false;
    // } 
    return true;
}


function configurarEventos() {
    const sectorForm = document.getElementById("sectorForm");

    formController.inicializar(sectorForm);

    document.getElementById('btnNovoSetor').addEventListener('click', () => {
        const modal = document.getElementById('sectorModal');

        modal.removeAttribute('data-id');

        document.querySelector('.modal-title').textContent = 'Novo Setor';
        document.querySelector('.modal-subtitle').textContent =
            'Cadastre uma nova área de atuação';

      formController.limpar();

        openModal('sectorModal');
    });

    document.getElementById('btnFecharModal').addEventListener('click', () => {
        closeModal('sectorModal');
    });

    document.getElementById('btnCancelar').addEventListener('click', () => {
        closeModal('sectorModal');
    });

    document.getElementById('sectorForm').addEventListener('submit', (event) => {
        event.preventDefault();
        saveSector();
    });

    document.getElementById('btnLogout').addEventListener('click', () => {
        handleLogout();
    });
}


function openModal(id) { document.getElementById(id).classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('active'); document.body.style.overflow = ''; }
function renderSector(sector) {
    const grid = document.getElementById('sectorsGrid');

    const card = document.createElement('div');
    card.className = 'card';
    card.style.padding = '20px';

    card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="
                width: 44px;
                height: 44px;
                border-radius: 12px;
                background: var(--primary-container);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg viewBox="0 0 24 24"
                     fill="none"
                     stroke="var(--primary)"
                     stroke-width="2"
                     width="22"
                     height="22">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
            </div>

            <div>
                <div style="font-weight: 700; font-size: 15px;">
                    ${sector.name}
                </div>
                <span class="badge badge-primary" style="font-size: 10px;">
                    SETOR
                </span>
            </div>
        </div>

        <p style="
            font-size: 13px;
            color: var(--text-muted);
            margin-bottom: 16px;
        ">
            ${sector.description || 'Sem descrição.'}
        </p>

        <div style="
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        ">
            <button
                type="button"
                class="btn btn-ghost btn-sm btn-editar-setor"
            >
                Editar
            </button>

            <button
                type="button"
                class="btn btn-ghost btn-sm btn-excluir-setor"
            >
                Excluir
            </button>
        </div>
    `;

    const btnEditar = card.querySelector('.btn-editar-setor');
    const btnExcluir = card.querySelector('.btn-excluir-setor');

    btnEditar.addEventListener('click', () => {
        editarSetor(sector);
    });

    btnExcluir.addEventListener('click', () => {
        excluirSetor(sector);
    });

    grid.appendChild(card);
}
async function excluirSetor(sector) {
    const confirmar = confirm(
        `Deseja realmente excluir o setor "${sector.name}"?`
    );

    if (!confirmar) {
        return;
    }

    try {
        await sectorService.remove(sector.id);

        await carregarSetores();

    } catch (error) {
        console.error('Erro ao excluir setor:', error);
        alert('Não foi possível excluir o setor.');
    }
}


function editarSetor(sector) {
    document.querySelector('.modal-title').textContent = 'Editar Setor';
    document.querySelector('.modal-subtitle').textContent =
        'Atualize os dados do setor';

    document.getElementById('sectorName').value = sector.name;
    document.getElementById('sectorDesc').value = sector.description || '';

    document.getElementById('sectorModal').dataset.id = sector.id;

    openModal('sectorModal');
}
async function carregarSetores() {
    try {
        const resposta = await sectorService.list();

        const setores = resposta.data ?? resposta;

        console.log('Resposta da API:', resposta);
        console.table(setores);
        const grid = document.getElementById('sectorsGrid');
        grid.innerHTML = '';

        setores.forEach((dados) => {
            const sector = new Sector(dados);
            renderSector(sector);
        });

    } catch (error) {
        console.error('Erro ao carregar setores:', error);
        alert('Não foi possível carregar os setores.');
    }
}


async function saveSector() {
    const id = document.getElementById('sectorModal').dataset.id;
    const dados = formController.obterDados();
    const sector = new Sector({
        id: id || null,
        ...dados
    });

    try {
        const resposta = id
            ? await sectorService.update(id, sector.toJSON())
            : await sectorService.create(sector.toJSON());

        toast.mostrarResposta(resposta);


        closeModal('sectorModal');

        formController.limpar();

        document.getElementById('sectorModal').removeAttribute('data-id');

        await carregarSetores();

    } catch (error) {
        toast.mostrar(error.message, "error");
        console.error('Erro ao salvar setor:', error);
        alert('Não foi possível salvar o setor.');
    }
}
// function editSector(name) { alert('Editar setor: ' + name); }
function handleLogout() { localStorage.clear(); window.location.href = '../public/login.html'; }
if (checkAuth()) {
    carregarSetores();
    configurarEventos();
}

