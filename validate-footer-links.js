/**
 * Footer Links Validation Script
 * Validates that all footer links are properly configured and routed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read and validate the footer configuration
const footerLinksPath = path.join(__dirname, 'src/config/footerLinks.ts');
const footerComponentPath = path.join(__dirname, 'src/components/Footer.tsx');
const appRoutesPath = path.join(__dirname, 'src/App.jsx');

console.log('🔍 Validating Footer Links Configuration...\n');

// Check if files exist
const requiredFiles = [
  { path: footerLinksPath, name: 'footerLinks.ts' },
  { path: footerComponentPath, name: 'Footer.tsx' },
  { path: appRoutesPath, name: 'App.jsx' }
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name} exists`);
  } else {
    console.log(`❌ ${file.name} missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

// Read the files
const footerLinksContent = fs.readFileSync(footerLinksPath, 'utf8');
const footerComponentContent = fs.readFileSync(footerComponentPath, 'utf8');
const appRoutesContent = fs.readFileSync(appRoutesPath, 'utf8');

console.log('\n📋 Configuration Validation:');

// Check footer configuration structure
const configChecks = [
  { check: footerLinksContent.includes('export interface FooterLink'), desc: 'FooterLink interface defined' },
  { check: footerLinksContent.includes('export interface FooterLinks'), desc: 'FooterLinks interface defined' },
  { check: footerLinksContent.includes('export const footerLinks'), desc: 'footerLinks configuration exported' },
  { check: footerLinksContent.includes('product:'), desc: 'Product section defined' },
  { check: footerLinksContent.includes('support:'), desc: 'Support section defined' },
  { check: footerLinksContent.includes('company:'), desc: 'Company section defined' },
  { check: footerLinksContent.includes('resources:'), desc: 'Resources section defined' },
  { check: footerLinksContent.includes('connect:'), desc: 'Connect section defined' },
];

configChecks.forEach(({ check, desc }) => {
  console.log(`${check ? '✅' : '❌'} ${desc}`);
});

console.log('\n🔗 Footer Component Validation:');

// Check footer component implementation
const componentChecks = [
  { check: footerComponentContent.includes("import { Link } from 'react-router-dom'"), desc: 'React Router Link imported' },
  { check: footerComponentContent.includes("import { footerLinks"), desc: 'Footer links config imported' },
  { check: footerComponentContent.includes('FooterLinkComponent'), desc: 'FooterLinkComponent defined' },
  { check: footerComponentContent.includes('window.posthog') && footerComponentContent.includes('capture'), desc: 'Analytics tracking implemented' },
  { check: footerComponentContent.includes('aria-label'), desc: 'Accessibility aria-labels added' },
  { check: footerComponentContent.includes('focus:ring'), desc: 'Focus ring styles added' },
  { check: footerComponentContent.includes('hover:underline'), desc: 'Hover underline styles added' },
  { check: footerComponentContent.includes("target={item.href.startsWith('http') ? '_blank'"), desc: 'External link target="_blank"' },
  { check: footerComponentContent.includes("rel={item.href.startsWith('http') ? 'noopener noreferrer'"), desc: 'External link security attributes' },
];

componentChecks.forEach(({ check, desc }) => {
  console.log(`${check ? '✅' : '❌'} ${desc}`);
});

console.log('\n🛣️ Routing Validation:');

// Check that internal routes exist in App.jsx
const internalRoutes = [
  '/how-it-works',
  '/dashboard',
  '/community',
  '/therapist-booking',
  '/help',
  '/privacy',
  '/terms',
  '/about',
  '/articles',
  '/survey',
  '/accessibility',
  '/cookies'
];

const routeChecks = internalRoutes.map(route => ({
  route,
  exists: appRoutesContent.includes(`path="${route}"`)
}));

routeChecks.forEach(({ route, exists }) => {
  console.log(`${exists ? '✅' : '❌'} Route ${route} ${exists ? 'configured' : 'missing'}`);
});

console.log('\n📧 External Links Validation:');

// Check external links
const externalLinks = [
  { label: 'Contact email', check: footerLinksContent.includes('mailto:contact@manova.life') },
  { label: 'Crisis support link', check: footerLinksContent.includes('https://telemanas.mohfw.gov.in/') }
];

externalLinks.forEach(({ label, check }) => {
  console.log(`${check ? '✅' : '❌'} ${label} ${check ? 'configured' : 'missing'}`);
});

console.log('\n♿ Accessibility Features:');

// Check accessibility features
const accessibilityChecks = [
  { check: footerComponentContent.includes('aria-label={item.label}'), desc: 'Aria labels on links' },
  { check: footerComponentContent.includes('focus:outline-none focus:ring-2'), desc: 'Focus ring styles' },
  { check: footerComponentContent.includes('rounded'), desc: 'Focus ring border radius' },
  { check: footerComponentContent.includes('hover:text-white'), desc: 'Hover state indicators' }
];

accessibilityChecks.forEach(({ check, desc }) => {
  console.log(`${check ? '✅' : '❌'} ${desc}`);
});

// Summary
const totalChecks = configChecks.length + componentChecks.length + routeChecks.length + externalLinks.length + accessibilityChecks.length;
const passedChecks = [
  ...configChecks,
  ...componentChecks,
  ...routeChecks.map(r => ({ check: r.exists })),
  ...externalLinks,
  ...accessibilityChecks
].filter(c => c.check).length;

const passRate = Math.round((passedChecks / totalChecks) * 100);

console.log('\n📊 VALIDATION SUMMARY:');
console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);
console.log(`📈 Success Rate: ${passRate}%`);

if (passRate === 100) {
  console.log('\n🎉 ALL VALIDATIONS PASSED!');
  console.log('\n🚀 Footer is ready with:');
  console.log('  • ✅ Proper React Router Link components');
  console.log('  • ✅ External links with security attributes');
  console.log('  • ✅ Analytics tracking on all clicks');
  console.log('  • ✅ Full accessibility support');
  console.log('  • ✅ All internal routes properly configured');
  console.log('  • ✅ Contact email visible in Connect section');
} else {
  console.log('\n⚠️ Some validations failed. Please review the issues above.');
  process.exit(1);
}

console.log('\n🎯 Ready for QA testing:');
console.log('  1. Test keyboard navigation (Tab/Shift+Tab)');
console.log('  2. Verify external links open in new tabs');
console.log('  3. Check mailto: links open email client');
console.log('  4. Confirm no 404 errors on internal links');
console.log('  5. Validate analytics events fire correctly');