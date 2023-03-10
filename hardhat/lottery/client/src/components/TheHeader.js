import { ConnectButton } from "web3uikit";
import styles from "@/styles/Header.module.css";

export default function TheHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.header__brand}>Decentralized Raffle</div>
      <ConnectButton
        moralisAuth={false}
        className={styles.header__connectBtn}
      />
    </div>
  );
}
