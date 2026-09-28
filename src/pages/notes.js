import { escapeHtml } from '../components/task-item.js';
import { formatDateTime } from '../utils/dates.js';
import { openModal, confirmDialog } from '../components/modal.js';
import { buildNoteForm, readNoteForm } from '../components/task-form.js';
import { createNote } from '../models/note.js';

export function renderNotes(container, ctx) {
  const { data, createNoteRecord, updateNoteRecord, deleteNoteRecord, toast } = ctx;
  let search = '';

  function render() {
    let notes = Object.values(data.notes);
    if (search) {
      const q = search.toLowerCase();
      notes = notes.filter((n) => [n.title, n.content].join(' ').toLowerCase().includes(q));
    }
    notes.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

    container.innerHTML = `
      <div class="page-toolbar">
        <input type="search" class="input" id="note-search" placeholder="Search notes…" value="${escapeHtml(search)}" />
        <button type="button" class="btn btn--primary" id="note-new">New Note</button>
      </div>
      <div class="notes-grid" id="notes-list"></div>
    `;

    container.querySelector('#note-search').addEventListener('input', (e) => {
      search = e.target.value;
      render();
    });
    container.querySelector('#note-new').addEventListener('click', () => openEditor(null));

    const list = container.querySelector('#notes-list');
    if (!notes.length) {
      list.innerHTML = '<p class="empty-state">No notes yet. Capture ideas or meeting notes here.</p>';
      return;
    }
    for (const note of notes) {
      const card = document.createElement('article');
      card.className = 'note-card card';
      const proj = note.projectId ? data.projects[note.projectId]?.name : null;
      card.innerHTML = `
        <h3>${escapeHtml(note.title || 'Untitled')}</h3>
        ${proj ? `<p class="muted">Project: ${escapeHtml(proj)}</p>` : ''}
        <pre class="note-card__body">${escapeHtml(note.content)}</pre>
        <p class="muted note-card__meta">Updated ${formatDateTime(note.updatedAt)}</p>
        <button type="button" class="btn btn--secondary btn--sm">Edit</button>
      `;
      card.querySelector('button').addEventListener('click', () => openEditor(note.id));
      list.appendChild(card);
    }
  }

  function openEditor(id) {
    const note = id ? data.notes[id] : createNote({});
    const form = buildNoteForm(note);
    if (!id) {
      const field = document.createElement('label');
      field.className = 'field';
      field.innerHTML = `<span class="field__label">Project</span><select class="input" name="projectId"><option value="">None</option>${Object.values(data.projects).map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select>`;
      form.appendChild(field);
    }
    let dirty = false;
    form.addEventListener('input', () => {
      dirty = true;
    });
    openModal({
      title: id ? 'Edit note' : 'New note',
      content: form,
      dirtyCheck: () => dirty,
      footer: (foot, { close }) => {
        const cancel = document.createElement('button');
        cancel.className = 'btn btn--secondary';
        cancel.textContent = 'Cancel';
        const save = document.createElement('button');
        save.className = 'btn btn--primary';
        save.textContent = 'Save';
        cancel.addEventListener('click', close);
        save.addEventListener('click', async () => {
          const values = readNoteForm(form);
          const projectId = form.querySelector('[name="projectId"]')?.value || note.projectId || null;
          try {
            if (id) await updateNoteRecord(id, { ...values, projectId: projectId || null });
            else await createNoteRecord({ ...values, projectId: projectId || null });
            dirty = false;
            close();
            render();
          } catch (e) {
            toast?.(e.message, 'error');
          }
        });
        foot.append(cancel);
        if (id) {
          const del = document.createElement('button');
          del.className = 'btn btn--danger';
          del.textContent = 'Delete';
          del.addEventListener('click', async () => {
            const ok = await confirmDialog({ title: 'Delete note', message: 'Delete this note?', confirmLabel: 'Delete', danger: true });
            if (ok) {
              await deleteNoteRecord(id);
              close();
              render();
            }
          });
          foot.append(del);
        }
        foot.append(save);
      },
    });
  }

  render();
}
