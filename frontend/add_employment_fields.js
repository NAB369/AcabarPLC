const fs = require('fs');

const employmentJsx = `        {/* SECTION 3: Employment & Business */}
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Business Type</label>
              <select name="businessType" className="input-field" value={formData.businessType} onChange={handleChange}>
                <option value="">Select Type...</option>
                <option value="NGO">NGO</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Trade & Commerce">Trade & Commerce</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Businessman">Businessman</option>
                <option value="Government Body">Government Body</option>
                <option value="Transportation">Transportation</option>
                <option value="Construction">Construction</option>
                <option value="Household/Family">Household/Family</option>
                <option value="Student">Student</option>
                <option value="Office Worker">Office Worker</option>
                <option value="Services">Services</option>
                <option value="Dresser">Dresser</option>
                <option value="Seller">Seller</option>
                <option value="Washing Car Worker">Washing Car Worker</option>
                <option value="Government Officer">Government Officer</option>
                <option value="Noodle Seller">Noodle Seller</option>
                <option value="Vegetables Seller">Vegetables Seller</option>
                <option value="Cake Seller">Cake Seller</option>
                <option value="Rice Seller">Rice Seller</option>
                <option value="Groceries Seller">Groceries Seller</option>
                <option value="Factory Worker">Factory Worker</option>
                <option value="Fisherman">Fisherman</option>
                <option value="Rice Soup Seller">Rice Soup Seller</option>
                <option value="Construction Worker">Construction Worker</option>
                <option value="Taxi Moto">Taxi Moto</option>
                <option value="Rent Generator">Rent Generator</option>
                <option value="Farmer">Farmer</option>
                <option value="Veterinarian">Veterinarian</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Income Bracket</label>
              <select name="incomeBracket" className="input-field" value={formData.incomeBracket} onChange={handleChange}>
                <option value="">Select Bracket...</option>
                <option value="Unknown">Unknown</option>
                <option value="<= 50 USD">&lt;= 50 USD</option>
                <option value="51~200 USD">51~200 USD</option>
                <option value="201~500 USD">201~500 USD</option>
                <option value="501~1000 USD">501~1000 USD</option>
                <option value=">1,000 USD">&gt;1,000 USD</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Dependent / Income Maker</label>
              <select name="dependentCount" className="input-field" value={formData.dependentCount} onChange={handleChange}>
                <option value="">Select Amount...</option>
                <option value="0">0</option>
                <option value="1~2">1~2</option>
                <option value="3~4">3~4</option>
                <option value="5~6">5~6</option>
                <option value="7~8">7~8</option>
                <option value=">8">&gt;8</option>
              </select>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Business Information</label>
            <textarea name="businessInfo" rows={2} className="input-field" placeholder="Details about owned business or trade" value={formData.businessInfo} onChange={handleChange}></textarea>
          </div>
        </div>`;

function replaceSection(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  const startMarker = '{/* SECTION 3: Employment & Business */}';
  const endMarker = '{/* SECTION 4: Co-Borrower & Guarantor */}';
  
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const newContent = content.substring(0, startIdx) + employmentJsx + '\\n\\n        ' + content.substring(endIdx);
    fs.writeFileSync(file, newContent);
  } else {
    console.log("Could not find markers in " + file);
  }
}

replaceSection('d:/Test/frontend/app/admin/customers/new/page.tsx');
replaceSection('d:/Test/frontend/app/admin/customers/edit/[id]/page.tsx');

// Also update state initialization in both files
function updateState(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('businessType:')) {
    content = content.replace(
      "businessInfo: '', coBorrowerName:",
      "businessInfo: '', businessType: '', incomeBracket: '', dependentCount: '', coBorrowerName:"
    );
    // and for edit form where it might fetch data
    content = content.replace(
      "businessInfo:         customerData.businessInfo  || '',",
      "businessInfo:         customerData.businessInfo  || '',\\n          businessType:         customerData.businessType  || '',\\n          incomeBracket:        customerData.incomeBracket || '',\\n          dependentCount:       customerData.dependentCount || '',"
    );
    fs.writeFileSync(file, content);
  }
}

updateState('d:/Test/frontend/app/admin/customers/new/page.tsx');
updateState('d:/Test/frontend/app/admin/customers/edit/[id]/page.tsx');

