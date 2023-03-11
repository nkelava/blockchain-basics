import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { useNotification } from "web3uikit";
import { ethers } from "ethers";

import styles from "@/styles/Raffle.module.css";
import { abi, contractAddresses } from "../constants";

export default function TheRaffleEntrance() {
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const dispatch = useNotification();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
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

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const updateUI = async () => {
    const entranceFeeContract = (await getEntranceFee())?.toString();
    const numberOfPlayers = (await getNumberOfPlayers())?.toString();
    const recentWinner = (await getRecentWinner())?.toString();

    setEntranceFee(entranceFeeContract);
    setNumberOfPlayers(numberOfPlayers);
    setRecentWinner(recentWinner);
  };

  const handleEnter = async () => {
    await enterRaffle({
      onSuccess: handleSuccess,
      onError: (error) => console.log(error),
    });
  };

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNewNotification(tx);
    updateUI();
  };

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Successful!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
  };

  return (
    <div className={styles.raffle}>
      <div className={styles.raffle__greeting}>
        <h1>Welcome to decentralized Raffle!</h1>
      </div>
      {raffleAddress ? (
        <div>
          <div className={styles.raffle__recentWinner}>
            <h3>Recent winner</h3>
            <p>{recentWinner}</p>
          </div>
          <div className={styles.raffle__info}>
            <p>Number of players: {numberOfPlayers}</p>
            <p>
              Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
            </p>
          </div>
          <div className={styles.raffle__inputContainer}>
            <input
              type="text"
              className={styles.raffle__input}
              placeholder="Enter ETH amount..."
            />
            <button
              className={styles.raffle__enterBtn}
              onClick={handleEnter}
              disabled={isLoading || isFetching}
            >
              {isLoading || isFetching ? (
                <span className={styles.raffle__spinner}></span>
              ) : (
                <div>Enter Raffle</div>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>No Raffle Address Detected! </div>
      )}
    </div>
  );
}
