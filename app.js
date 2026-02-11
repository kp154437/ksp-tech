const planList = document.getElementById('planList');
const runList = document.getElementById('runList');
const runState = document.getElementById('runState');
const branch = document.getElementById('branch');
const preview = document.getElementById('preview');
const updated = document.getElementById('updated');

const setUpdated = () => {
  updated.textContent = new Date().toLocaleTimeString();
};

const renderList = (root, items) => {
  root.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.title}</strong><br/>${item.detail}`;
    root.appendChild(li);
  });
};

const mockPlan = [
  { title: 'Milestone 1 — Foundation', detail: 'Set up auth, workspaces, and project model.' },
  { title: 'Milestone 2 — Agent Runtime', detail: 'Create planner/executor with isolated sandbox runner.' },
  { title: 'Milestone 3 — Git Automation', detail: 'Generate branch, commits, and PR from run output.' },
  { title: 'Milestone 4 — Preview Deploy', detail: 'Deploy to provider and post preview URL.' },
];

const mockRun = [
  { title: 'Step 1', detail: 'Planning completed and awaiting approval.' },
  { title: 'Step 2', detail: 'Generated implementation tasks and scaffold changes.' },
  { title: 'Step 3', detail: 'Executed tests and prepared PR summary.' },
];

document.getElementById('planBtn').addEventListener('click', () => {
  renderList(planList, mockPlan);
  runState.textContent = 'planned';
  branch.textContent = 'run/102-emergent-mvp';
  setUpdated();
});

document.getElementById('runBtn').addEventListener('click', () => {
  renderList(runList, mockRun);
  runState.textContent = 'running';
  setTimeout(() => {
    runState.textContent = 'succeeded';
    preview.textContent = 'https://preview.example.dev/run/102';
    setUpdated();
  }, 900);
  setUpdated();
});

document.getElementById('deployBtn').addEventListener('click', () => {
  runState.textContent = 'deploying';
  setTimeout(() => {
    runState.textContent = 'deployed';
    preview.textContent = 'https://app.example.dev';
    setUpdated();
  }, 900);
  setUpdated();
});

setUpdated();
