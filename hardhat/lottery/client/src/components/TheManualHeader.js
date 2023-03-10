import { useEffect } from "react";
import { useMoralis } from "react-moralis";

export default function TheManualHeader() {
  const {
    enableWeb3,
    isWeb3Enabled,
    isWeb3EnableLoading,
    deactivateWeb3,
    account,
    Moralis,
  } = useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (
      typeof window !== "undefined" &&
      window.localStorage.getItem("connected")
    ) {
      enableWeb3();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
      }
    });
  }, []);

  const connect = async () => {
    const resp = await enableWeb3();

    if (resp !== "undefined") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("connected", "injected");
      }
    }
  };

  return (
    <div>
      {account ? (
        <div>
          Connected to {account.slice(0, 6)}...
          {account.slice(account.length - 4)}
        </div>
      ) : (
        <button onClick={connect} disabled={isWeb3EnableLoading}>
          Connect
        </button>
      )}
    </div>
  );
}
