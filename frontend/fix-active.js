const fs = require('fs');
let code = fs.readFileSync('d:\\\\AcabarPlc\\\\frontend\\\\app\\\\admin\\\\layout.tsx', 'utf8');

code = code.replace(/className="sidebar-link"\s+style=\{navItemStyle\((.*?)\)\}/g, 'className={`sidebar-link ${($1) ? "active" : ""}`} style={navItemStyle($1)}');

code = code.replace(/className="sidebar-link"\s+onClick=\{\(\) => setIsAccountingOpen/g, 'className={`sidebar-link ${pathname?.startsWith("/admin/accounting") || pathname?.startsWith("/admin/period") ? "active" : ""}`} onClick={() => setIsAccountingOpen');

fs.writeFileSync('d:\\\\AcabarPlc\\\\frontend\\\\app\\\\admin\\\\layout.tsx', code);
