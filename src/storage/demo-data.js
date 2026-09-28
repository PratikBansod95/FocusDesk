import { createProject } from '../models/project.js';
import { createTask } from '../models/task.js';
import { createNote } from '../models/note.js';

/** Clearly labeled sample data for exploration only. */
export function buildDemoData() {
  const now = new Date();
  const iso = (offsetDays) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };

  const p1 = createProject({
    name: '[Demo] Website Redesign',
    description: 'Sample project — refresh marketing site and component library.',
    status: 'active',
    startDate: iso(-14),
    deadline: iso(21),
    color: '#4f6ef7',
    category: 'IT',
  });
  const p2 = createProject({
    name: '[Demo] API Migration',
    description: 'Sample project — move legacy endpoints to REST v2.',
    status: 'active',
    startDate: iso(-7),
    deadline: iso(45),
    color: '#10b981',
    category: 'Backend',
  });

  const tasks = {};
  const add = (t) => {
    tasks[t.id] = t;
    return t;
  };

  add(
    createTask({
      title: '[Demo] Draft homepage wireframes',
      projectId: p1.id,
      status: 'completed',
      priority: 'high',
      dueDate: iso(-2),
    })
  );
  add(
    createTask({
      title: '[Demo] Review accessibility checklist',
      projectId: p1.id,
      status: 'in_progress',
      priority: 'medium',
      dueDate: iso(0),
      tags: ['a11y'],
    })
  );
  add(
    createTask({
      title: '[Demo] Fix overdue auth bug',
      projectId: p2.id,
      status: 'blocked',
      priority: 'urgent',
      dueDate: iso(-3),
      tags: ['security'],
    })
  );
  add(
    createTask({
      title: '[Demo] Document OpenAPI schema',
      projectId: p2.id,
      status: 'todo',
      priority: 'low',
      dueDate: iso(5),
    })
  );
  add(
    createTask({
      title: '[Demo] Standalone inbox task',
      projectId: null,
      status: 'todo',
      priority: 'medium',
      dueDate: iso(2),
    })
  );

  const n1 = createNote({
    title: '[Demo] Meeting notes',
    content: 'Sample note content.\n\n- Discussed sprint goals\n- Blocked on design review',
    projectId: p1.id,
  });

  return {
    projects: { [p1.id]: p1, [p2.id]: p2 },
    tasks,
    notes: { [n1.id]: n1 },
    activity: [
      {
        id: 'demo_act_1',
        type: 'project_created',
        entityId: p1.id,
        entityType: 'project',
        message: 'Demo project created: Website Redesign',
        createdAt: now.toISOString(),
      },
    ],
    meta: { hasSeenWelcome: true, demoLoaded: true },
  };
}

export function removeDemoData(data) {
  const isDemo = (name) => typeof name === 'string' && name.includes('[Demo]');
  const projects = {};
  const tasks = {};
  const notes = {};
  for (const [id, p] of Object.entries(data.projects || {})) {
    if (!isDemo(p.name)) projects[id] = p;
  }
  for (const [id, t] of Object.entries(data.tasks || {})) {
    if (!isDemo(t.title)) tasks[id] = t;
  }
  for (const [id, n] of Object.entries(data.notes || {})) {
    if (!isDemo(n.title)) notes[id] = n;
  }
  const projectIds = new Set(Object.keys(projects));
  for (const [id, t] of Object.entries(tasks)) {
    if (t.projectId && !projectIds.has(t.projectId)) {
      tasks[id] = { ...t, projectId: null };
    }
  }
  return {
    ...data,
    projects,
    tasks,
    notes,
    activity: (data.activity || []).filter((a) => !a.message?.includes('[Demo]')),
    meta: { ...data.meta, demoLoaded: false },
  };
}
