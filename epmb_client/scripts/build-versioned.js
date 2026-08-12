import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Manifest beolvasása
const manifestPath = path.join(__dirname, '../build-manifest.json');
let manifest = { major: 0, minor: 0, patch: 0, subpatch: 1, build: 0 };

if (fs.existsSync(manifestPath)) {
    try {
        manifest = { ...manifest, ...JSON.parse(fs.readFileSync(manifestPath, 'utf8')) };
    } catch (e) {
        console.warn('[BUILD] Hibás manifest fájl!');
    }
}

// 2. Verzió számítás
const args = process.argv.slice(2);
const vArg = args.find(arg => arg.startsWith('--v='));

if (vArg) {
    const versionString = vArg.split('=')[1];
    const parts = versionString.split('.');

    if (parts[0] && parts[0] !== 'x') manifest.major = parseInt(parts[0], 10);
    if (parts[1] && parts[1] !== 'x') manifest.minor = parseInt(parts[1], 10);
    if (parts[2] && parts[2] !== 'x') manifest.patch = parseInt(parts[2], 10);

    manifest.subpatch = 1;
    manifest.build = 1;
} else {
    manifest.build = (Number(manifest.build) || 0) + 1;
}

const pad = (num, size) => String(num || 0).padStart(size, '0');
const versionFolder = `v${manifest.major}.${manifest.minor}.${manifest.patch}.${pad(manifest.subpatch, 2)}_${pad(manifest.build, 4)}`;

// Manifest elmentése
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

// 3. Cél mappák meghatározása
const baseClientDir = path.resolve(__dirname, '../../../EPMBSER/EPMBSER/client');
const targetDir = path.join(baseClientDir, versionFolder).replace(/\\/g, '/');
const latestDir = path.join(baseClientDir, 'latest').replace(/\\/g, '/');

console.log(`\n[BUILD] Új verzió generálása: ${versionFolder}`);
console.log(`[BUILD] Verziós mappa: ${targetDir}`);
console.log(`[BUILD] Latest mappa:  ${latestDir}\n`);

// Verziós mappa létrehozása, ha nem létezne
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

try {
    // 4. Vite build futtatása a verziózott mappába
    execSync(`npx vite build --outDir "${targetDir}" --emptyOutDir`, {
        stdio: 'inherit'
    });

    // 5. Régi `latest` mappa törlése és az új tartalom átmásolása
    if (fs.existsSync(latestDir)) {
        fs.rmSync(latestDir, { recursive: true, force: true });
    }

    fs.cpSync(targetDir, latestDir, { recursive: true });

    console.log(`\n✅ Sikeres build!`);
    console.log(` ├─ Verziózva: ${targetDir}`);
    console.log(` └─ Frissítve: ${latestDir}`);

    // 6. GitHub Commit & Push automatizálás
    console.log(`\n[GIT] Automatizált Git commit és push indítása...`);

    // Minden változás hozzáadása (a frissült build-manifest.json is bekerül)
    execSync('git add .', { stdio: 'inherit' });

    // Commit készítése a verziószámmal
    execSync(`git commit -m "Build: ${versionFolder}"`, { stdio: 'inherit' });

    // Push a GitHub-ra
    execSync('git push', { stdio: 'inherit' });

    console.log(`\n🚀 Sikeresen commitolva és feltöltve GitHub-ra a következő üzenettel: "Build: ${versionFolder}"`);

} catch (error) {
    // Ha a git commit azért bukik el, mert nem volt semmi változás a kódban, azt külön kezeli
    if (error.message && error.message.includes('nothing to commit')) {
        console.log('\n⚠️ Git warning: Nem volt változás a kódban a commitoláshoz.');
    } else {
        console.error('\n❌ Hiba történt a build vagy a Git művelet során:', error.message || error);
        process.exit(1);
    }
}