import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, contractAddress } from "./consts.js";

async function connect() {
  if (connected) return;

  if (typeof window.ethereum !== "undefined") {
    try {
      console.log("Connecting to a wallet...");
      await window.ethereum.request({ method: "eth_requestAccounts" });

      connected = true;
      connectBtn.innerHTML = "Connected";
      console.log("Wallet connected...");
    } catch (error) {
      console.log(error);
    }
  } else {
    alert("Ooops, Metamask is not installed! Please, install it.");
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmation/s.`
      );
      resolve();
    });
  });
}

async function fund() {
  const amount = document.getElementById("amount-inp").value;
  const ethAmount = ethers.utils.parseEther(amount);

  if (typeof window.ethereum !== "undefined") {
    console.log("Sending funds...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.fund({ value: ethAmount });

      await listenForTransactionMine(transactionResponse, provider);
      alert(`Success! You funded ${ethers.utils.formatEther(ethAmount)} ETH.`);
      console.log("Transaction completed.");
    } catch (error) {
      console.log(error.message);
    }
  } else {
    alert(
      "Ooops, Metamask is not installed or connected!\nPlease make sure you have Metamask installed and connected."
    );
  }
}

async function withdraw(ethAmount) {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing funds...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();

      await listenForTransactionMine(transactionResponse, provider);
      alert("Success! You withdrew all the funds.");
      console.log("Withdraw completed.");
    } catch (error) {
      console.log(error.message);
    }
  } else {
    alert(
      "Ooops, Metamask is not installed or connected!\nPlease make sure you have Metamask installed and connected."
    );
  }
}

async function getBalance(ethAmount) {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);

    alert(`Contract balance is: ${ethers.utils.formatEther(balance)} ETH`);
  } else {
    alert(
      "Ooops, Metamask is not installed or connected!\nPlease make sure you have Metamask installed and connected."
    );
  }
}

const connectBtn = document.getElementById("connect-btn");
const balanceBtn = document.getElementById("balance-btn");
const fundBtn = document.getElementById("fund-btn");
const withdrawBtn = document.getElementById("withdraw-btn");
let connected = false;

connectBtn.onclick = connect;
balanceBtn.onclick = getBalance;
fundBtn.onclick = fund;
withdrawBtn.onclick = withdraw;
