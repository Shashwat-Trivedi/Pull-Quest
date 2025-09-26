import { ethers } from "hardhat";

async function main() {
  const contractAddr = "0xA225Bc6090C031BE0FD031A868a4ed479eDE5E63";

  // Load ABI + attach
  const MyContract = await ethers.getContractFactory("MyContract");
  const contract = MyContract.attach(contractAddr);

  // Subscribe to all events
  contract.on("*", (...args) => {
    const event = args[args.length - 1]; // last argument is Event object
    console.log(`📢 Event: ${event.event}`, event.args);
  });

  console.log("Listening for events...");

  // Keep process alive
  process.stdin.resume();
}

main().catch(console.error);
