let tasks = JSON.parse(localStorage.getItem('pocitacove_siete_ulohy')) || [];

if (localStorage.getItem('dark_mode') === 'true' || (!localStorage.getItem('dark_mode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    document.getElementById('theme-icon').className = 'fa-solid fa-sun';
}

function saveToStorage() {
    localStorage.setItem('pocitacove_siete_ulohy', JSON.stringify(tasks));
    renderTasks();
    updateStats();
}

function toggleDarkMode() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('dark_mode', isDark);
    document.getElementById('theme-icon').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function toggleDropdown() {
    document.getElementById('settings-dropdown').classList.toggle('hidden');
}

window.addEventListener('click', function(e) {
    if (!e.target.closest('.relative')) {
        document.getElementById('settings-dropdown').classList.add('hidden');
    }
});

function updateStats() {
    document.getElementById('stat-total').innerText = tasks.length;
    document.getElementById('stat-done').innerText = tasks.filter(t => t.status === 'Hotovo').length;
    document.getElementById('stat-progress').innerText = tasks.filter(t => t.status === 'Rozpracované').length;
    document.getElementById('stat-repeat').innerText = tasks.filter(t => t.status === 'Na zopakovanie').length;
}

function renderTasks(filteredTasks = null) {
    const container = document.getElementById('tasks-container');
    const emptyState = document.getElementById('empty-state');
    const dataToRender = filteredTasks || tasks;

    container.innerHTML = '';

    if (dataToRender.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    dataToRender.forEach(task => {
        let statusColor = 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        if (task.status === 'Hotovo') {
            statusColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        } else if (task.status === 'Na zopakovanie') {
            statusColor = 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        }

        const tagsHtml = task.tags ? task.tags.split(',').map(tag => `<span class="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">#${tag.trim()}</span>`).join('') : '';

        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group';
        card.innerHTML = `
            <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-semibold px-2.5 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-lg">Počítačové siete</span>
                    <span class="text-xs font-medium px-2.5 py-1 rounded-lg border ${statusColor}">${task.status}</span>
                </div>
                <div class="mb-2">
                    ${task.number ? `<span class="text-xs font-bold text-slate-400 mr-1">#${task.number}</span>` : ''}
                    <h4 onclick="openDetailModal('${task.id}')" class="font-bold text-slate-900 dark:text-white text-base hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition line-clamp-2">${task.title}</h4>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 font-mono mb-4 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">${task.content}</p>
                <div class="flex flex-wrap gap-1 mb-2">${tagsHtml}</div>
            </div>
            <div class="px-6 py-3 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <button onclick="openDetailModal('${task.id}')" class="text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center space-x-1">
                    <span>Otvoriť detail</span><i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
                <div class="flex items-center space-x-2">
                    <button onclick="editTask('${task.id}')" class="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 transition" title="Upraviť">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="deleteTask('${task.id}')" class="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 transition" title="Zmazať">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterTasks() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const status = document.getElementById('filter-status').value;

    const filtered = tasks.filter(task => {
        const matchesQuery = task.title.toLowerCase().includes(query) || 
                             task.content.toLowerCase().includes(query) || 
                             (task.tags && task.tags.toLowerCase().includes(query)) ||
                             (task.number && task.number.toLowerCase().includes(query));
        const matchesStatus = status === '' || task.status === status;

        return matchesQuery && matchesStatus;
    });

    renderTasks(filtered);
}

function openModal() {
    document.getElementById('task-id').value = '';
    document.getElementById('task-form').reset();
    document.getElementById('modal-title').innerText = 'Nová úloha - Počítačové siete';
    document.getElementById('task-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('task-modal').classList.add('hidden');
}

function saveTask(e) {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const status = document.getElementById('task-status').value;
    const title = document.getElementById('task-title').value;
    const number = document.getElementById('task-number').value;
    const tags = document.getElementById('task-tags').value;
    const content = document.getElementById('task-content').value;

    if (id) {
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { id, status, title, number, tags, content };
        }
    } else {
        const newTask = {
            id: Date.now().toString(),
            status, title, number, tags, content
        };
        tasks.unshift(newTask);
    }

    saveToStorage();
    closeModal();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('task-id').value = task.id;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-number').value = task.number || '';
    document.getElementById('task-tags').value = task.tags || '';
    document.getElementById('task-content').value = task.content;

    document.getElementById('modal-title').innerText = 'Upraviť úlohu';
    document.getElementById('task-modal').classList.remove('hidden');
}

function deleteTask(id) {
    if (confirm('Chceš zmazať túto otázku zo sietí?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToStorage();
        filterTasks();
    }
}

function openDetailModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('detail-title').innerText = task.title;
    document.getElementById('detail-number').innerText = task.number || '-';
    document.getElementById('detail-number-wrapper').style.display = task.number ? 'block' : 'none';
    document.getElementById('detail-content').innerText = task.content;

    let statusColor = 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    if (task.status === 'Hotovo') statusColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (task.status === 'Na zopakovanie') statusColor = 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    
    document.getElementById('detail-status-badge').innerHTML = `<span class="px-2.5 py-1 rounded-lg border font-medium ${statusColor}">${task.status}</span>`;

    const tagsContainer = document.getElementById('detail-tags-container');
    tagsContainer.innerHTML = task.tags ? task.tags.split(',').map(tag => `<span class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">#${tag.trim()}</span>`).join('') : '';

    document.getElementById('detail-modal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pocitacove_siete_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toggleDropdown();
}

function importData(event) {
    const fileReader = new FileReader();
    if (event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = function(e) {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    tasks = importedTasks;
                    saveToStorage();
                } else {
                    alert('Neplatný súbor.');
                }
            } catch (error) {
                alert('Chyba pri načítaní súboru.');
            }
        };
    }
    toggleDropdown();
}

renderTasks();
updateStats();
