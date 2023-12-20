import React, { useState } from "react";
import {
  Connection,
  Keypair,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";

const App = () => {
  const [account, setAccount] = useState<any>(null);
  const [connectedWallet, setConnectedWallet] = useState(null);

  const createNewAccount = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Generate a new keypair
    const newAccount: any = Keypair.generate();

    // Airdrop 2 SOL to the new account
    await connection.requestAirdrop(newAccount.publicKey, 2 * LAMPORTS_PER_SOL);

    console.log("New account created:", newAccount.publicKey.toBase58());
    setAccount(newAccount);
  };

  const connectToPhantomWallet = async () => {
    const { solana }: any = window;

    if (solana) {
      try {
        const response = await solana.connect();
        console.log("Connected to Phantom Wallet");
        setConnectedWallet(response.publicKey.toString());
      } catch (err) {
        console.error("Error connecting to Phantom Wallet", err);
      }
    }
  };

  // const transferToNewWallet = async () => {
  //   const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  //   if (!account || !connectedWallet) {
  //     console.error("Account or connected wallet is not set.");
  //     return;
  //   }

  //   // Create a transaction to transfer 1 SOL
  //   const transaction = new Transaction().add(
  //     SystemProgram.transfer({
  //       fromPubkey: account.publicKey,
  //       toPubkey: new Keypair().publicKey, // Placeholder for the connected wallet
  //       lamports: LAMPORTS_PER_SOL / 100, // 1 SOL
  //     })
  //   );

  //   // Sign and confirm the transaction
  //   const signature = await sendAndConfirmTransaction(connection, transaction, [
  //     account,
  //   ]);

  //   console.log("Transfer completed. Signature:", signature);
  // };

  const transferToNewWallet = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    if (!account || !connectedWallet) {
      console.error("Account or connected wallet is not set.");
      return;
    }

    // Encode the transfer instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: account.publicKey,
        toPubkey: new PublicKey(connectedWallet),
        lamports: LAMPORTS_PER_SOL / 100, // 1 SOL
      })
    );

    // Sign and confirm the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      account,
    ]);

    console.log("Transfer completed. Signature:", signature);
  };

  return (
    <div className="bg-blue-300">
      <button className="" onClick={createNewAccount}>
        Create New Solana Account
      </button>
      <button onClick={connectToPhantomWallet}>
        Connect to Phantom Wallet
      </button>
      <button onClick={transferToNewWallet}>Transfer to New Wallet</button>

      <div>
        {account && <p>New account created: {account.publicKey.toBase58()}</p>}
        {connectedWallet && (
          <p>Connected to Phantom Wallet: {connectedWallet}</p>
        )}
      </div>
    </div>
  );
};

export default App;
