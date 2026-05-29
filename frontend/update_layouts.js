const fs = require('fs');

const formJsx = `      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* SECTION 1: Identity & Institutional */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <User size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Identity Information</h3>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>CID No</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div 
                    onClick={handleToggleAutoGenerate}
                    style={{
                      width: '32px', height: '18px', borderRadius: '18px',
                      backgroundColor: autoGenerateCid ? 'var(--primary)' : '#cbd5e1',
                      position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'white',
                      position: 'absolute', top: '2px', left: autoGenerateCid ? '16px' : '2px',
                      transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: autoGenerateCid ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }} onClick={handleToggleAutoGenerate}>Auto</span>
                </div>
              </label>
              <div style={{ position: 'relative' }}>
                <input name="cid" type="text" className="input-field" placeholder="CID Number" value={formData.cid} onChange={handleChange} disabled={autoGenerateCid} />
                {generatingCid && <div className="animate-spin" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', border: '2px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">គោត្តនាម</label>
                <input name="khmerLastName" type="text" className="input-field" placeholder="គោល" value={formData.khmerLastName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">នាម</label>
                <input name="khmerFirstName" type="text" className="input-field" placeholder="ចំណាប់" value={formData.khmerFirstName} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">English First Name</label>
                <input required name="firstName" type="text" className="input-field" placeholder="e.g. Chamnab" value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">English Last Name</label>
                <input required name="lastName" type="text" className="input-field" placeholder="e.g. KOL" value={formData.lastName} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">National ID</label>
                <input name="nationalId" type="text" className="input-field" placeholder="ID Number" value={formData.nationalId} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Passport</label>
                <input name="passport" type="text" className="input-field" placeholder="Passport Number" value={formData.passport} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Family Book Reference</label>
              <input name="familyBook" type="text" className="input-field" placeholder="Ref #" value={formData.familyBook} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: 0 }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Gender</label>
                <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender...</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Date of Birth</label>
                <input required name="dob" type="date" className="input-field" value={formData.dob} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Building size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Institutional Alignment</h3>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Assigned Branch</label>
              <select required name="branchId" className="input-field" value={formData.branchId} onChange={handleChange}>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name} ({branch.code})</option>
                ))}
              </select>
            </div>
          </div>
          
        </div>

        {/* SECTION 2: Contact & Residence */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Phone size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Contact & Residence</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Primary Phone</label>
              <input required name="phone" type="tel" className="input-field" placeholder="+855 ..." value={formData.phone} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Email Address</label>
              <input name="email" type="email" className="input-field" placeholder="example@mail.com" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <label className="input-label" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" />
              Residential Address Details
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Province / City</label>
                <select name="province" className="input-field" value={formData.province} onChange={handleChange} required>
                  <option value="">Select Province / City</option>
                  <optgroup label="Capital City">
                    <option value="Phnom Penh">Phnom Penh</option>
                  </optgroup>
                  <optgroup label="Provinces">
                    <option value="Banteay Meanchey">Banteay Meanchey</option>
                    <option value="Battambang">Battambang</option>
                    <option value="Kampong Cham">Kampong Cham</option>
                    <option value="Kampong Chhnang">Kampong Chhnang</option>
                    <option value="Kampong Speu">Kampong Speu</option>
                    <option value="Kampong Thom">Kampong Thom</option>
                    <option value="Kampot">Kampot</option>
                    <option value="Kandal">Kandal</option>
                    <option value="Kep">Kep</option>
                    <option value="Koh Kong">Koh Kong</option>
                    <option value="Kratie">Kratie</option>
                    <option value="Mondulkiri">Mondulkiri</option>
                    <option value="Oddar Meanchey">Oddar Meanchey</option>
                    <option value="Pailin">Pailin</option>
                    <option value="Preah Sihanouk">Preah Sihanouk</option>
                    <option value="Preah Vihear">Preah Vihear</option>
                    <option value="Pursat">Pursat</option>
                    <option value="Ratanakiri">Ratanakiri</option>
                    <option value="Siem Reap">Siem Reap</option>
                    <option value="Stung Treng">Stung Treng</option>
                    <option value="Svay Rieng">Svay Rieng</option>
                    <option value="Takeo">Takeo</option>
                    <option value="Tbong Khmum">Tbong Khmum</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>District</label>
                <select name="district" className="input-field" value={formData.district} onChange={handleChange} required disabled={!formData.province}>
                  <option value="">Select District</option>
                  {(CAMBODIA_DISTRICTS[formData.province] || []).map(d => (
                    <option key={d.code} value={d.name}>
                      [{d.code}] {d.name} ({d.khmer})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Commune</label>
                <select name="commune" className="input-field" value={formData.commune} onChange={handleChange} disabled={!formData.district}>
                  <option value="">Select Commune</option>
                  {(CAMBODIA_COMMUNES[formData.district] || []).map(c => (
                    <option key={c.code} value={c.name}>
                      [{c.code}] {c.name} ({c.khmer})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Village</label>
                <select name="village" className="input-field" value={formData.village} onChange={handleChange} disabled={!formData.commune}>
                  <option value="">Select Village</option>
                  {(CAMBODIA_VILLAGES[\`\${formData.district}_\${formData.commune}\`] || []).map(v => (
                    <option key={v.code} value={v.name}>
                      [{v.code}] {v.name} ({v.khmer})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              <div>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>House #</label>
                <input name="houseNo" type="text" className="input-field" placeholder="House #" value={formData.houseNo} onChange={handleChange} />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Road or Street</label>
                <input name="street" type="text" className="input-field" placeholder="Road or Street" value={formData.street} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Employment & Business */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Briefcase size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Employment & Business</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Occupation</label>
              <input name="occupation" type="text" className="input-field" placeholder="e.g. Sales Manager" value={formData.occupation} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Employer Name</label>
              <input name="employerName" type="text" className="input-field" placeholder="e.g. ACME Corp" value={formData.employerName} onChange={handleChange} />
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Business Information</label>
            <textarea name="businessInfo" rows={2} className="input-field" placeholder="Details about owned business or trade" value={formData.businessInfo} onChange={handleChange}></textarea>
          </div>
        </div>

        {/* SECTION 4: Co-Borrower & Guarantor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Co-borrower Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <UserCheck size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Co-borrower Details</h3>
            </div>

            <div className="input-group">
              <label className="input-label">Co-borrower Full Name</label>
              <input name="coBorrowerName" type="text" className="input-field" placeholder="e.g. Sok Ken" value={formData.coBorrowerName} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label className="input-label">Co-borrower Phone Number</label>
              <input name="coBorrowerPhone" type="tel" className="input-field" placeholder="+855 ..." value={formData.coBorrowerPhone} onChange={handleChange} />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Co-borrower National ID</label>
              <input name="coBorrowerNationalId" type="text" className="input-field" placeholder="ID Number" value={formData.coBorrowerNationalId} onChange={handleChange} />
            </div>
          </div>

          {/* Guarantor Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Users size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Guarantor Details</h3>
            </div>

            <div className="input-group">
              <label className="input-label">Guarantor Full Name</label>
              <input name="guarantorName" type="text" className="input-field" placeholder="e.g. Sophorn Kol" value={formData.guarantorName} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Guarantor Phone</label>
                <input name="guarantorPhone" type="tel" className="input-field" placeholder="+855 ..." value={formData.guarantorPhone} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Relationship</label>
                <input name="guarantorRelationship" type="text" className="input-field" placeholder="e.g. Sibling, Parent" value={formData.guarantorRelationship} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0, marginTop: '1.5rem' }}>
              <label className="input-label">Guarantor National ID</label>
              <input name="guarantorNationalId" type="text" className="input-field" placeholder="ID Number" value={formData.guarantorNationalId} onChange={handleChange} />
            </div>
          </div>
        </div>

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
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  style={{ display: 'block', width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer', backgroundColor: 'white' }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddFile}
                disabled={!uploadFile}
                style={{ height: '46px', padding: '0 2rem', borderRadius: '10px', border: 'none', backgroundColor: uploadFile ? 'var(--primary)' : '#e2e8f0', color: uploadFile ? 'white' : '#94a3b8', fontWeight: '700', fontSize: '0.875rem', cursor: uploadFile ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <Upload size={15} /> Add File
              </button>
            </div>
          </div>

          {/* Documents table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
              <FolderOpen size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9375rem', fontWeight: '600' }}>Selected Documents</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{files.length} file{files.length !== 1 ? 's' : ''}</span>
            </div>

            {files.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No documents selected yet.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>File Name</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(doc => (
                    <tr key={doc.type}>
                      <td>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                          {DOC_TYPES.find(d => d.type === doc.type)?.label || doc.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)' }}>
                        {doc.file.name}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => removeFile(doc.type)}
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

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Link href="/admin/customers/accounts" style={{ textDecoration: 'none' }}>
            <button type="button" className="btn btn-secondary" style={{ padding: '1rem 2rem', height: '56px' }}>
              Discard
            </button>
          </Link>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              padding: '1rem 3rem', 
              fontSize: '1.125rem', 
              height: '56px',
              backgroundColor: 'var(--foreground)',
              color: 'white',
              border: 'none',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
            disabled={loading}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--foreground)'}
          >
            {loading ? 'Processing...' : (
              <>
                <Save size={20} />
                Complete Registration
              </>
            )}
          </button>
        </div>
      </form>`;

const file1 = 'd:/Test/frontend/app/admin/customers/new/page.tsx';
let content1 = fs.readFileSync(file1, 'utf8');
const start1 = content1.indexOf('<form onSubmit={handleSubmit}');
const end1 = content1.lastIndexOf('</form>') + 7;
content1 = content1.substring(0, start1) + formJsx + content1.substring(end1);
fs.writeFileSync(file1, content1);

// Now do the same for edit/[id]/page.tsx
const file2 = 'd:/Test/frontend/app/admin/customers/edit/[id]/page.tsx';
let content2 = fs.readFileSync(file2, 'utf8');
const start2 = content2.indexOf('<form onSubmit={handleSubmit}');
const end2 = content2.lastIndexOf('</form>') + 7;

// Replace 'Complete Registration' with 'Save Changes' for the edit page
let formJsxEdit = formJsx.replace('Complete Registration', 'Save Changes');

content2 = content2.substring(0, start2) + formJsxEdit + content2.substring(end2);
fs.writeFileSync(file2, content2);
