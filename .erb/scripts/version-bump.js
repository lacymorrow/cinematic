const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootPackagePath = path.join(__dirname, '..', '..', 'package.json');
const appPackagePath = path.join(
	__dirname,
	'..',
	'..',
	'release',
	'app',
	'package.json',
);

function updateVersion(type) {
	// Update root package.json
	execSync(`npm version ${type} --no-git-tag-version`);

	// Read the new version from root package.json
	const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
	const newVersion = rootPackage.version;

	// Update app package.json
	const appPackage = JSON.parse(fs.readFileSync(appPackagePath, 'utf8'));
	appPackage.version = newVersion;
	fs.writeFileSync(appPackagePath, JSON.stringify(appPackage, null, 2));

	console.log(`Version bumped to ${newVersion}`);

	// Stage changes
	execSync('git add package.json release/app/package.json');

	// Commit changes
	execSync(`git commit -m "Bump version to ${newVersion}"`);
}

const versionType = process.argv[2];
if (!['patch', 'minor', 'major'].includes(versionType)) {
	console.error('Please specify version type: patch, minor, or major');
	process.exit(1);
}

updateVersion(versionType);
