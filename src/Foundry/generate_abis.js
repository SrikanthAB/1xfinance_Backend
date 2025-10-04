const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create abis directory if it doesn't exist
const abisDir = path.join(__dirname, 'abis');
if (!fs.existsSync(abisDir)) {
  fs.mkdirSync(abisDir, { recursive: true });
}

// Find all .sol files in the src directory
function findSolFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findSolFiles(fullPath));
    } else if (file.endsWith('.sol')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

const srcDir = path.join(__dirname, 'src');
const solFiles = findSolFiles(srcDir);

console.log(`Found ${solFiles.length} Solidity files to process...\n`);

// Process each Solidity file
solFiles.forEach((file, index) => {
  const contractName = path.basename(file, '.sol');
  console.log(`[${index + 1}/${solFiles.length}] Generating ABI for ${contractName}...`);
  
  try {
    // Run solc to generate ABI
    const command = `solc --abi "${file}" --overwrite -o "${abisDir}"`;
    execSync(command, { stdio: 'pipe' });
    
    // Find the generated ABI file
    const abiFile = path.join(abisDir, `${contractName}.abi`);
    
    if (fs.existsSync(abiFile)) {
      console.log(`  ✓ Successfully generated ABI for ${contractName}`);
    } else {
      console.log(`  ⚠️  No ABI generated for ${contractName} (contract might be abstract or interface)`);
    }
  } catch (error) {
    console.error(`  ✗ Error generating ABI for ${contractName}:`, error.message);
  }
});

console.log('\nABI generation complete. Check the abis directory for the generated files.');
