const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.join(__dirname, '../.next/out');
const targetDir = path.join(__dirname, '../out');

try {
  // Создаем папку out если не существует
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Копируем файлы (кросс-платформенная команда)
  if (fs.existsSync(sourceDir)) {
    const command = process.platform === 'win32' 
      ? `xcopy /E /I /Y "${sourceDir}" "${targetDir}"`
      : `cp -r "${sourceDir}/." "${targetDir}/"`;
    
    execSync(command, { stdio: 'inherit' });
  }

  // Создаем необходимые файлы для GitHub Pages
  fs.writeFileSync(path.join(targetDir, '_redirects'), '/* /index.html 200');
  fs.closeSync(fs.openSync(path.join(targetDir, '.nojekyll'), 'w'));

  console.log('✅ Postbuild completed successfully');
} catch (error) {
  console.error('❌ Postbuild failed:', error);
  process.exit(1);
}