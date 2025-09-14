#!/usr/bin/env node

/**
 * Build Test Script
 * 
 * This script tests if the TypeScript build process completes successfully.
 * It runs the build command and validates that the compilation succeeds.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function runBuildTest() {
    console.log('🔧 Starting build test...');
    
    try {
        // Clean the dist directory first
        const distPath = path.join(__dirname, '..', 'dist');
        if (fs.existsSync(distPath)) {
            console.log('🧹 Cleaning existing dist directory...');
            fs.rmSync(distPath, { recursive: true, force: true });
        }
        
        // Run the TypeScript build
        console.log('🏗️  Running TypeScript compilation...');
        execSync('npm run build', { 
            stdio: 'inherit', 
            cwd: path.join(__dirname, '..') 
        });
        
        // Verify that key output files exist
        const expectedFiles = [
            'app.js',
            'config/expressConfig.js',
            'config/mongooseConfig.js'
        ];
        
        console.log('✅ Verifying build artifacts...');
        for (const file of expectedFiles) {
            const filePath = path.join(distPath, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Expected build artifact not found: ${file}`);
            }
        }
        
        console.log('✅ Build test passed! All TypeScript files compiled successfully.');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Build test failed:', error.message);
        process.exit(1);
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    runBuildTest();
}

module.exports = { runBuildTest };