import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { TheHeader, TheRaffleEntrance } from "@/components";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div>
      <Head>
        <title>Smart Contract Raffle</title>
        <meta name="description" content="Our Smart Contract Raffle" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <ManualHeader /> */}
      <main className={styles.main}>
        <TheHeader />
        <TheRaffleEntrance />
      </main>
    </div>
  );
}
