import { ethers } from "hardhat";
import { BuyMeACoffee } from "../typechain-types";

type MemoType = {
  timestamp: string;
  name: string;
  from: string;
  message: string;
};

// Returns a Ether balance of a given address
async function getBalance(address: string) {
  const balanceBigInt = await ethers.provider.getBalance(address);

  return ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balance for a list of balances
async function printBalances(addresses: Array<string>) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Log the memos stored on-chain from coffee purchases
async function printMemos(memos: BuyMeACoffee.MemoStructOutput[]) {
  for (const memo of memos) {
    const timestamps = memo.timestamps;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(
      `At ${timestamps}, ${tipper} (${tipperAddress} said: "${message}")`
    );
  }
}

async function main() {
  // Get example accounts
  const [owner, tipper, tipper2, tipper3] = await ethers.getSigners();

  // Get the contract to deploy
  const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();

  // Deploy the contract
  await buyMeACoffee.deployed();
  console.log("BuyMeACoffee deployed to ", buyMeACoffee.address);

  // Check balances before the coffee purchase
  const addresses = [owner.address, tipper.address, buyMeACoffee.address];
  console.log("==== start ====");
  await printBalances(addresses);

  // Buy the owner a few coffees
  const tip = { value: ethers.utils.parseEther("1") };
  await buyMeACoffee.connect(tipper).buyCoffee("John", "You're the best!", tip);
  await buyMeACoffee
    .connect(tipper2)
    .buyCoffee("Angel", "You're the best!", tip);
  await buyMeACoffee
    .connect(tipper3)
    .buyCoffee("David", "You're the best!", tip);

  // Check balances after the coffee purchase
  console.log("==== bought coffee ====");
  await printBalances(addresses);

  // Withdraw
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balances after withdrawal
  console.log("==== withdrawTips ====");
  await printBalances(addresses);

  // Checkout the memos
  console.log("==== memos ====");
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
