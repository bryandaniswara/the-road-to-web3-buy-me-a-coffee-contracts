import { AlchemyProvider } from "@ethersproject/providers";
import { ethers } from "hardhat";
import abi from "../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json";

async function getBalance(provider: AlchemyProvider, address: string) {
  const balanceBigInt = await provider.getBalance(address);
  return ethers.utils.formatEther(balanceBigInt);
}

async function main() {
  // Get the contract that has been deployed to Goerli
  const contractAddress = process.env.DEPLOYED_CONTRACT as string;
  const contractABI = abi.abi;

  // Get the node connection and wallet connection
  const provider = new ethers.providers.AlchemyProvider(
    "goerli",
    process.env.GOERLY_API_KEY
  );

  // Get the private key
  const PRIVATE_KEY: string = process.env.PRIVATE_KEY as string;

  // Ensure that signer is the SAME address as the original contract deployer,
  // or else this script will fail with an error.
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  // Instantiate connected contract.
  const buyMeACoffee = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  // Check starting balance
  console.log(
    "current balance of owner: ",
    await getBalance(provider, signer.address),
    "ETH"
  );
  const contractBalance = await getBalance(provider, buyMeACoffee.address);
  console.log("current balance of contract: ", contractBalance, "ETH");

  // Withdraw funds if there are funds to withdraw.
  if (contractBalance !== "0.0") {
    console.log("withrawing funds...");
    const widthdrawTxn = await buyMeACoffee.withdrawTips();
    await widthdrawTxn.wait();
  } else {
    console.log("no funds to withdraw!");
  }

  // Check ending balance
  console.log(
    "current balance of owner: ",
    await getBalance(provider, signer.address),
    "ETH"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
