// import functionalities
import React, { useEffect, useState } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";

// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

// create a provider interface (hint: think of this as an object) to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>; // New disconnect method
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description gets Phantom provider, if it exists
 */
const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

function App() {
  // create state variable for the provider
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );

  // create state variable for the wallet key
  const [walletKey, setWalletKey] = useState<string | undefined>(undefined);

  // this is the function that runs whenever the component updates (e.g., render, refresh)
  useEffect(() => {
    const provider = getProvider();

    // if the phantom provider exists, set this as the provider
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  /**
   * @description prompts the user to connect wallet if it exists.
   * This function is called when the connect wallet button is clicked
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    // checks if phantom wallet exists
    if (solana) {
      try {
        // connects wallet and returns response which includes the wallet public key
        const response = await solana.connect();
        console.log("wallet account ", response.publicKey.toString());
        // update walletKey to be the public key
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  /**
   * @description disconnects the current Phantom wallet instance
   */
  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    // checks if phantom wallet exists
    if (solana) {
      try {
        // disconnect the wallet
        await solana.disconnect();
        // clear the walletKey state
        setWalletKey(undefined);
      } catch (err) {
        console.error("Error disconnecting wallet", err);
      }
    }
  };

  // HTML code for the app
  return (
    <div className="App min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex ">
        <h2 className="text-2xl font-bold p-4 rounded bg-blue-500 text-white">
          Connect to Phantom Wallet
        </h2>
        {provider && walletKey && (
          <button
            className="text-xl font-bold p-4 rounded bg-red-500 text-white float-right"
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        )}
        {provider && !walletKey && (
          <button
            className="text-xl font-bold p-4 rounded bg-green-500 text-white"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
        {provider && walletKey && (
          <p className="mt-4">Connected account: {walletKey}</p>
        )}
      </div>

      {!provider && (
        <p className="mt-8">
          No provider found. Install{" "}
          <a href="https://phantom.app/" className="text-blue-500">
            Phantom Browser extension
          </a>
        </p>
      )}
    </div>
  );
}

export default App;
