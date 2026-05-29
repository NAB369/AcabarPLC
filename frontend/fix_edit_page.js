const fs = require('fs');

const file = 'd:/Test/frontend/app/admin/customers/edit/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The replacement HTML for the documents section
const docsSection = `
        {/* SECTION 5: Supporting Documents */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Supporting Documents</h3>
          </div>
          
          {/* Upload panel */}
          <div style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '12px', backgroundColor: '#fafbfc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Upload size={18} color="var(--primary)" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>Upload / Select a Document</span>
            </div>
            {uploadSuccess && <div style={{ color: 'var(--success-color)', fontSize: '0.875rem', marginBottom: '1rem' }}>✓ Document uploaded successfully</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1.5rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Document Type</label>
                <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="input-field" style={{ marginBottom: 0 }}>
                  {DOC_TYPES.map(d => <option key={d.type} value={d.type}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>File (PDF, JPG, PNG)</label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  ref={fileInputRef}
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  style={{ display: 'block', width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer', backgroundColor: 'white' }}
                />
              </div>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                style={{ height: '46px', padding: '0 2rem', borderRadius: '10px', border: 'none', backgroundColor: uploadFile ? 'var(--primary)' : '#e2e8f0', color: uploadFile ? 'white' : '#94a3b8', fontWeight: '700', fontSize: '0.875rem', cursor: uploadFile ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <Upload size={15} /> {uploading ? 'Uploading...' : 'Add File'}
              </button>
            </div>
          </div>

          {/* Documents table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
              <FolderOpen size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9375rem', fontWeight: '600' }}>Uploaded Documents</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{documents.length} file{documents.length !== 1 ? 's' : ''}</span>
            </div>

            {docsLoading ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : documents.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No documents uploaded yet.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>File Name</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                          {DOC_TYPES.find(d => d.type === doc.type)?.label || doc.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)' }}>
                        {doc.fileName || doc.id}
                      </td>
                      <td>
                        {statusBadge(doc.status)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          title="Remove document"
                          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                          onMouseOut={e  => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'white'; }}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
`;

// Extract before section 5
const startSection = '{/* SECTION 5: Supporting Documents */}';
const endSection = '{/* Submit Actions */}';

const beforePart = content.substring(0, content.indexOf(startSection));
const afterPart = content.substring(content.indexOf(endSection));

fs.writeFileSync(file, beforePart + docsSection + '\n        ' + afterPart);
