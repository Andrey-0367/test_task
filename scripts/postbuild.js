const fs = require('fs');
const path = require('path');

// 1. Создаем структуру папок
const outPath = path.join(__dirname, '../out');
const nextStaticPath = path.join(__dirname, '../.next/static');
const outStaticPath = path.join(outPath, '_next/static');

if (!fs.existsSync(outPath)) fs.mkdirSync(outPath);
if (!fs.existsSync(outStaticPath)) {
  fs.mkdirSync(outStaticPath, { recursive: true });
}

// 2. Копируем статические файлы
if (fs.existsSync(nextStaticPath)) {
  const copyRecursive = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      fs.statSync(srcPath).isDirectory() 
        ? copyRecursive(srcPath, destPath)
        : fs.copyFileSync(srcPath, destPath);
    });
  };
  copyRecursive(nextStaticPath, outStaticPath);
}

// 3. Создаем необходимые файлы
fs.writeFileSync(path.join(outPath, '_redirects'), '/* /index.html 200');
fs.closeSync(fs.openSync(path.join(outPath, '.nojekyll'), 'w'));

console.log('✅ Postbuild completed');