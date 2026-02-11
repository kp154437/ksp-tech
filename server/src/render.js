const styleObjToString = (style = {}) =>
  Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${value}`)
    .join(';');

const renderElement = (element) => {
  const style = styleObjToString(element.style || {});
  switch (element.type) {
    case 'text':
      return `<p style="${style}">${element.content || 'Text block'}</p>`;
    case 'button':
      return `<button style="${style}">${element.content || 'Click me'}</button>`;
    case 'image':
      return `<img src="${element.src || 'https://placehold.co/600x300'}" alt="${element.alt || 'image'}" style="${style}" />`;
    case 'form':
      return `<form style="${style}"><input placeholder="Your email"/><button>Submit</button></form>`;
    case 'card':
      return `<div style="${style}"><h3>${element.title || 'Card title'}</h3><p>${element.content || 'Card content'}</p></div>`;
    case 'navbar':
      return `<nav style="${style}"><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></nav>`;
    default:
      return `<div style="${style}">${element.content || 'Custom component'}</div>`;
  }
};

export const renderProjectHtml = (project) => {
  const pages = project.pages || [];
  const firstPage = pages[0] || { name: 'Home', elements: [] };
  const global = project.globalStyles || {};
  const globalCss = `
    body { margin:0; padding:0; font-family:${global.fontFamily || 'Inter, Arial, sans-serif'}; background:${global.background || '#f5f7fb'}; color:${global.color || '#0f172a'}; }
    * { box-sizing:border-box; }
    nav { display:flex; gap:12px; padding:12px; background:rgba(15,23,42,.08); }
    a { color:inherit; text-decoration:none; }
    main { max-width:1000px; margin:0 auto; padding:24px; display:flex; flex-direction:column; gap:14px; }
    button { border:none; border-radius:8px; padding:10px 14px; cursor:pointer; }
    input { padding:10px; border:1px solid #ddd; border-radius:8px; margin-right:8px; }
  `;

  return `<!doctype html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${project.name}</title><style>${globalCss}</style></head><body><main data-page="${firstPage.name}">${firstPage.elements.map(renderElement).join('')}</main></body></html>`;
};
