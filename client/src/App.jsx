import { useEffect, useMemo, useState } from 'react';
import { api } from './api';

const BASE_COMPONENTS = [
  { type: 'text', label: 'Text', defaultData: { content: 'Edit this text' } },
  { type: 'button', label: 'Button', defaultData: { content: 'Primary action', style: { background: '#5b7cfa', color: '#fff' } } },
  { type: 'image', label: 'Image', defaultData: { src: 'https://placehold.co/600x280', alt: 'placeholder' } },
  { type: 'form', label: 'Form', defaultData: {} },
  { type: 'card', label: 'Card', defaultData: { title: 'Card heading', content: 'Describe your feature here.' } },
  { type: 'navbar', label: 'Navbar', defaultData: {} }
];

const id = () => Math.random().toString(36).slice(2, 10);

const createElement = (template) => ({
  id: id(),
  type: template.type,
  ...template.defaultData,
  style: {
    padding: '12px',
    borderRadius: '10px',
    ...(template.defaultData?.style || {})
  }
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const AuthScreen = ({ onAuth }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = isSignup ? await api.signup(form) : await api.login(form);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      onAuth(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1>KSP Builder</h1>
        <p>Create websites & apps without writing code.</p>
        <input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input placeholder="Password" type="password" minLength={6} required value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        {error && <small className="error">{error}</small>}
        <button type="submit" disabled={loading}>{loading ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}</button>
        <button className="ghost" type="button" onClick={() => setIsSignup((v) => !v)}>
          {isSignup ? 'Already have an account? Login' : 'Need an account? Sign up'}
        </button>
      </form>
    </div>
  );
};

const ElementPreview = ({ element, selected, onSelect }) => {
  const style = element.style || {};
  return (
    <div className={`canvas-el ${selected ? 'selected' : ''}`} onClick={() => onSelect(element.id)}>
      {element.type === 'text' && <p style={style}>{element.content}</p>}
      {element.type === 'button' && <button style={style}>{element.content}</button>}
      {element.type === 'image' && <img src={element.src} alt={element.alt || 'asset'} style={{ ...style, width: '100%' }} />}
      {element.type === 'card' && (
        <div style={style}>
          <h3>{element.title}</h3>
          <p>{element.content}</p>
        </div>
      )}
      {element.type === 'form' && (
        <form style={style}>
          <input placeholder="Enter your email" /> <button>Submit</button>
        </form>
      )}
      {element.type === 'navbar' && (
        <nav style={style}>
          <a>Home</a><a>Features</a><a>Pricing</a>
        </nav>
      )}
      {element.type === 'reusable' && (
        <div style={style}><strong>{element.name}</strong><p>{element.content || 'Reusable block'}</p></div>
      )}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [device, setDevice] = useState('desktop');

  const activePage = useMemo(() => {
    if (!activeProject) return null;
    return activeProject.pages.find((p) => p.id === activeProject.currentPageId) || activeProject.pages[0];
  }, [activeProject]);

  const selectedElement = activePage?.elements.find((el) => el.id === selectedElementId) || null;

  const updateProject = (updater, withHistory = true) => {
    setActiveProject((prev) => {
      if (!prev) return prev;
      if (withHistory) setHistory((h) => [...h.slice(-39), clone(prev)]);
      setFuture([]);
      return updater(clone(prev));
    });
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.listProjects();
      setProjects(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  useEffect(() => {
    if (!activeProject?.id) return undefined;
    setStatus('Saving...');
    const t = setTimeout(async () => {
      try {
        await api.saveProject(activeProject.id, { name: activeProject.name, data: activeProject });
        setStatus('All changes saved');
        loadProjects();
      } catch {
        setStatus('Save failed');
      }
    }, 600);

    return () => clearTimeout(t);
  }, [activeProject]);

  const openProject = async (idValue) => {
    setLoading(true);
    try {
      const res = await api.getProject(idValue);
      const data = res.data;
      data.id = res.id;
      data.name = res.name;
      data.currentPageId = data.currentPageId || data.pages[0]?.id;
      setHistory([]);
      setFuture([]);
      setActiveProject(data);
      setSelectedElementId(null);
    } finally {
      setLoading(false);
    }
  };

  const addComponent = (template) => {
    if (!activePage) return;
    updateProject((draft) => {
      const page = draft.pages.find((p) => p.id === draft.currentPageId);
      page.elements.push(createElement(template));
      return draft;
    });
  };

  const patchElement = (patch) => {
    if (!selectedElementId) return;
    updateProject((draft) => {
      const page = draft.pages.find((p) => p.id === draft.currentPageId);
      const el = page.elements.find((e) => e.id === selectedElementId);
      Object.assign(el, patch);
      return draft;
    });
  };

  const patchElementStyle = (key, value) => {
    patchElement({ style: { ...(selectedElement?.style || {}), [key]: value } });
  };

  const uploadAsset = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      updateProject((draft) => {
        draft.assets.push({ id: id(), name: file.name, url: reader.result });
        return draft;
      });
    };
    reader.readAsDataURL(file);
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history.at(-1);
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [clone(activeProject), ...f.slice(0, 39)]);
    setActiveProject(prev);
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h, clone(activeProject)].slice(-39));
    setActiveProject(next);
  };

  const createProject = async () => {
    const name = prompt('Project name?', `Project ${projects.length + 1}`);
    if (!name) return;
    await api.createProject(name);
    await loadProjects();
  };

  const deleteProject = async (projectId) => {
    if (!confirm('Delete project?')) return;
    await api.deleteProject(projectId);
    if (activeProject?.id === projectId) setActiveProject(null);
    await loadProjects();
  };

  const addPage = () => {
    const name = prompt('Page name', 'New Page');
    if (!name) return;
    updateProject((draft) => {
      const page = { id: id(), name, elements: [] };
      draft.pages.push(page);
      draft.currentPageId = page.id;
      return draft;
    });
  };

  const makeReusable = () => {
    if (!selectedElement) return;
    const reusableName = prompt('Reusable component name', `Reusable ${activeProject.reusableComponents.length + 1}`);
    if (!reusableName) return;
    updateProject((draft) => {
      draft.reusableComponents.push({ ...clone(selectedElement), id: id(), name: reusableName });
      return draft;
    });
  };

  const exportProject = async () => {
    if (!activeProject) return;
    const res = await api.exportProject(activeProject.id);
    const file = new Blob([res.files['index.html']], { type: 'text/html' });
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.name.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const publishProject = async () => {
    const res = await api.publishProject(activeProject.id);
    alert(`Published! Share URL: ${res.shareUrl}`);
  };

  const onDrop = (event) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData('component');
    if (!payload) return;
    addComponent(JSON.parse(payload));
  };

  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div className="app-shell">
      <aside className="left-panel">
        <div className="panel-title">
          <h3>Projects</h3>
          <button onClick={createProject}>+ New</button>
        </div>
        {loading && <small>Loading...</small>}
        <div className="project-list">
          {projects.map((project) => (
            <div key={project.id} className={`project-item ${activeProject?.id === project.id ? 'active' : ''}`}>
              <button onClick={() => openProject(project.id)}>{project.name}</button>
              <button className="danger" onClick={() => deleteProject(project.id)}>✕</button>
            </div>
          ))}
        </div>
        <hr />
        <h4>Components</h4>
        {[...BASE_COMPONENTS, ...(activeProject?.reusableComponents || []).map((r) => ({ type: 'reusable', label: `♻ ${r.name}`, defaultData: r }))].map((component) => (
          <div
            key={component.label}
            className="draggable"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('component', JSON.stringify(component))}
            onClick={() => addComponent(component)}
          >
            {component.label}
          </div>
        ))}
        <h4>Assets</h4>
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0])} />
        <div className="assets-grid">
          {activeProject?.assets?.map((asset) => (
            <img key={asset.id} src={asset.url} title={asset.name} onClick={() => selectedElement && patchElement({ src: asset.url })} />
          ))}
        </div>
      </aside>

      <main className="workspace">
        {!activeProject ? (
          <div className="empty-state">
            <h2>Welcome to KSP Builder</h2>
            <p>Create your first project to begin building visually.</p>
          </div>
        ) : (
          <>
            <header className="top-bar">
              <input value={activeProject.name} onChange={(e) => updateProject((d) => ({ ...d, name: e.target.value }))} />
              <div className="toolbar-actions">
                <button onClick={undo} disabled={!history.length}>Undo</button>
                <button onClick={redo} disabled={!future.length}>Redo</button>
                <button onClick={addPage}>+ Page</button>
                <button onClick={() => setDevice((d) => (d === 'desktop' ? 'mobile' : 'desktop'))}>{device === 'desktop' ? 'Desktop' : 'Mobile'}</button>
                <button onClick={exportProject}>Export</button>
                <button onClick={publishProject}>Publish</button>
                <button className="ghost" onClick={() => { localStorage.clear(); setUser(null); }}>Logout</button>
              </div>
              <small>{status}</small>
            </header>

            <div className="pages-tabs">
              {activeProject.pages.map((p) => (
                <button key={p.id} className={activeProject.currentPageId === p.id ? 'active' : ''} onClick={() => updateProject((d) => ({ ...d, currentPageId: p.id }), false)}>{p.name}</button>
              ))}
            </div>

            <section className="canvas-wrap">
              <div className={`canvas ${device}`} onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
                {activePage?.elements.map((element) => (
                  <ElementPreview key={element.id} element={element} selected={selectedElementId === element.id} onSelect={setSelectedElementId} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <aside className="right-panel">
        <h3>Style editor</h3>
        {!selectedElement ? <p>Select a component to customize.</p> : (
          <>
            <label>Content</label>
            <input value={selectedElement.content || ''} onChange={(e) => patchElement({ content: e.target.value })} />
            <label>Title</label>
            <input value={selectedElement.title || ''} onChange={(e) => patchElement({ title: e.target.value })} />
            <label>Text color</label>
            <input type="color" value={selectedElement.style?.color || '#111827'} onChange={(e) => patchElementStyle('color', e.target.value)} />
            <label>Background</label>
            <input type="color" value={selectedElement.style?.background || '#ffffff'} onChange={(e) => patchElementStyle('background', e.target.value)} />
            <label>Padding</label>
            <input value={selectedElement.style?.padding || '12px'} onChange={(e) => patchElementStyle('padding', e.target.value)} />
            <label>Border radius</label>
            <input value={selectedElement.style?.borderRadius || '10px'} onChange={(e) => patchElementStyle('borderRadius', e.target.value)} />
            <label>Shadow</label>
            <input value={selectedElement.style?.boxShadow || ''} onChange={(e) => patchElementStyle('boxShadow', e.target.value)} placeholder="0 8px 24px rgba(...)" />
            <button onClick={makeReusable}>Save as reusable</button>
          </>
        )}
        {activeProject && (
          <>
            <h4>Global styles</h4>
            <label>Font family</label>
            <input value={activeProject.globalStyles.fontFamily} onChange={(e) => updateProject((d) => ({ ...d, globalStyles: { ...d.globalStyles, fontFamily: e.target.value } }))} />
            <label>App background</label>
            <input type="color" value={activeProject.globalStyles.background} onChange={(e) => updateProject((d) => ({ ...d, globalStyles: { ...d.globalStyles, background: e.target.value } }))} />
            <label>Theme primary</label>
            <input type="color" value={activeProject.theme.primary} onChange={(e) => updateProject((d) => ({ ...d, theme: { ...d.theme, primary: e.target.value } }))} />
          </>
        )}
      </aside>
    </div>
  );
};

export default App;
