const hre = require("hardhat");

async function main() {
  console.log("Deploying CertificateVerification contract...");

  // Get the contract factory
  const CertificateVerification = await hre.ethers.getContractFactory("CertificateVerification");
  
  // Deploy the contract
  const certificateVerification = await CertificateVerification.deploy();
  
  await certificateVerification.waitForDeployment();

  const address = await certificateVerification.getAddress();

  console.log("CertificateVerification deployed to:", address);
  console.log("Network:", hre.network.name);
  
  // Wait for a few block confirmations
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await certificateVerification.deploymentTransaction().wait(6);
    console.log("Confirmed!");
  }

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deploymentTime: new Date().toISOString()
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
