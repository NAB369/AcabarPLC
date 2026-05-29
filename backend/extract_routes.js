const fs = require('fs');
const path = require('path');

const endpoints = {};

function parseController(content) {
  let controllerRoute = '';
  // match @Controller('something') or @Controller("something")
  const controllerMatch = content.match(/@Controller\(['"]([^'"]+)['"]\)/);
  if (controllerMatch) {
    controllerRoute = '/' + controllerMatch[1];
  }

  const methods = [];
  const routeRegex = /@(Get|Post|Put|Patch|Delete)\(['"]?([^'"]*)['"]?\)/g;
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    let route = match[2];
    if (route && !route.startsWith('/')) route = '/' + route;
    methods.push({ method, path: controllerRoute + (route || '') });
  }
  return methods;
}

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) continue;
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      searchDir(p);
    } else if (p.endsWith('.controller.ts')) {
      const content = fs.readFileSync(p, 'utf8');
      const routes = parseController(content);
      if (routes.length > 0) {
        endpoints[path.basename(p)] = routes;
      }
    }
  }
}

searchDir('d:/Test/backend/src');
console.log(JSON.stringify(endpoints, null, 2));
