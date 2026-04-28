// Deployment script for SportShieldNFT contract
// Run with: npx hardhat run scripts/deploy.js --network polygonMumbai

const hre = require("hardhat");

async function main() {
  console.log("Deploying SportShieldNFT to Polygon Mumbai Testnet...");
  
  // Get platform wallet from environment or use deployer
  const platformWallet = process.env.PLATFORM_WALLET || (await hre.ethers.getSigners())[0].address;
  
  console.log("Platform wallet:", platformWallet);

  // Deploy contract
  const SportShieldNFT = await hre.ethers.getContractFactory("SportShieldNFT");
  const contract = await SportShieldNFT.deploy(platformWallet);
  
  await contract.deployed();
  
  console.log("SportShieldNFT deployed to:", contract.address);
  
  // Verify contract on Polygonscan
  if (process.env.POLYGONSCAN_API_KEY) {
    try {
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: [platformWallet],
      });
      console.log("Contract verified on Polygonscan");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: "polygonMumbai",
    contractAddress: contract.address,
    deployer: (await hre.ethers.getSigners())[0].address,
    platformWallet: platformWallet,
    deployedAt: new Date().toISOString(),
    chainId: 80001
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return contract.address;
}

main()
  .then((address) => {
    console.log("\nDeployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });