import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import TheHeader from "@/components/TheHeader";
// import ManualHeader from "@/components/ManualHeader";

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
        <h1>Welcome!</h1>
      </main>
    </div>
  );
}
