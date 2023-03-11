import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { ethers } from "ethers";

import styles from "@/styles/Raffle.module.css";
import { abi, contractAddresses } from "../constants";

export default function TheRaffleEntrance() {
  let [entranceFee, setEntranceFee] = useState("0");
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const { runContractFunction: enterRaffle } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  useEffect(() => {
    if (isWeb3Enabled) {
      async function updateUI() {
        const entranceFeeContract = (await getEntranceFee())?.toString();
        setEntranceFee(entranceFeeContract);
      }

      updateUI();
    }
  }, [isWeb3Enabled]);

  async function enter() {
    await enterRaffle();
  }

  return (
    <div className={styles.raffle}>
      <h1>Welcome to decentralized Raffle!</h1>
      {raffleAddress ? (
        <div className={styles.raffle__inputContainer}>
          <p>
            Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          </p>
          <input
            type="text"
            className={styles.raffle__input}
            placeholder="Enter ETH amount..."
          />
          <button className={styles.raffle__enterBtn} onClick={enter}>
            Enter Raffle
          </button>
        </div>
      ) : (
        <div>No Raffle Address Detected! </div>
      )}
    </div>
  );
}
