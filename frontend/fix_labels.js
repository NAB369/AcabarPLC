const fs = require('fs');

function fixLabels(file) {
  let content = fs.readFileSync(file, 'utf8');

  const replacements = [
    {
      from: '<div>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>Province / City</label>',
      to: '<div className="input-group" style={{ marginBottom: 0 }}>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>Province / City</label>'
    },
    {
      from: '<div>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>District</label>',
      to: '<div className="input-group" style={{ marginBottom: 0 }}>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>District</label>'
    },
    {
      from: '<div>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>Commune</label>',
      to: '<div className="input-group" style={{ marginBottom: 0 }}>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>Commune</label>'
    },
    {
      from: '<div>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>Village</label>',
      to: '<div className="input-group" style={{ marginBottom: 0 }}>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>Village</label>'
    },
    {
      from: '<div>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>House #</label>',
      to: '<div className="input-group" style={{ marginBottom: 0 }}>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>House #</label>'
    },
    {
      from: '<div>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>Road or Street</label>',
      to: '<div className="input-group" style={{ marginBottom: 0 }}>\\n                <label className="input-label" style={{ fontSize: \\'0.8125rem\\', color: \\'var(--text-muted)\\' }}>Road or Street</label>'
    }
  ];

  for (const r of replacements) {
    content = content.replace(r.from, r.to);
  }

  fs.writeFileSync(file, content);
}

fixLabels('d:/Test/frontend/app/admin/customers/new/page.tsx');
fixLabels('d:/Test/frontend/app/admin/customers/edit/[id]/page.tsx');
