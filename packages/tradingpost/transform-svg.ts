import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const svgDir = path.join(__dirname, 'src', 'assets');
const outputDir = path.join(__dirname, 'src', 'assets', 'components');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

execSync(`npx @svgr/cli --typescript --out-dir ${outputDir} ${svgDir}`);
