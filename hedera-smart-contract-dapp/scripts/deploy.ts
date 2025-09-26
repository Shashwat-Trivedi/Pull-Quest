import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Compile artifact name must match contract name (GitHubIssueStaking)
  const GitHubIssueStaking = await ethers.getContractFactory("GitHubIssueStaking");

  // Pass constructor arg: platformFee (e.g., 250 = 2.5%)
  const contract = await GitHubIssueStaking.deploy(250);

  // Wait for deployment to complete
  const receipt = await contract.deploymentTransaction()?.wait();
  console.log("Transaction hash:", receipt?.hash);

  console.log("✅ Contract deployed at:", await contract.getAddress());
  console.log(
    `🔗 View on HashScan: https://hashscan.io/testnet/contract/${await contract.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
