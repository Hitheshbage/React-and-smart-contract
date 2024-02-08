import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [selectedCurrency, setSelectedCurrency] = useState("ETH");
  const [currencyConversionRate, setCurrencyConversionRate] = useState({
    ETH: 1,
    SOL: 100,
    BTC: 0.01,
    MATIC: 1000,
    AVAX: 400,
    ADA: 200,
    DOT: 50
  });
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [showPriceTicker, setShowPriceTicker] = useState(false);
  const [formattedPrices, setFormattedPrices] = useState(null);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balanceBigInt = await atm.getBalance();
      const balanceNumber = ethers.utils.formatEther(balanceBigInt);
      setBalance(balanceNumber);
    }
  };

  const convertBalance = (balance) => {
    // Convert balance to selected currency using conversion rate
    return (balance * currencyConversionRate[selectedCurrency]).toFixed(2);
  };

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  const handleTransactionAmountChange = (event) => {
    setTransactionAmount(parseFloat(event.target.value));
  };

  const deposit = async () => {
    if (atm) {
      const gasLimit = 100000; // You may adjust this value based on your contract's requirements
      const gasPrice = await ethWallet.request({ method: 'eth_gasPrice' });
      
      let tx = await atm.deposit(ethers.utils.parseEther(transactionAmount.toString()), { gasLimit, gasPrice: gasPrice.toString() });
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      const gasLimit = 100000; // You may adjust this value based on your contract's requirements
      const gasPrice = await ethWallet.request({ method: 'eth_gasPrice' });
      
      let tx = await atm.withdraw(ethers.utils.parseEther(transactionAmount.toString()), { gasLimit, gasPrice: gasPrice.toString() });
      await tx.wait();
      getBalance();
    }
  };

  const togglePriceTicker = () => {
    setShowPriceTicker(!showPriceTicker);
    if (!showPriceTicker) {
      formatPrices();
    }
  };

  const formatPrices = () => {
    let formattedPrices = "";
    Object.entries(currencyConversionRate).forEach(([currency, rate]) => {
      formattedPrices += `1 ETH = ${rate} ${currency}\n`;
    });
    setFormattedPrices(formattedPrices);
  };
  

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {convertBalance(balance)} {selectedCurrency}</p>
        <label>Select Currency:</label>
        <select value={selectedCurrency} onChange={handleCurrencyChange}>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="SOL">Solana (SOL)</option>
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="MATIC">Polygon (MATIC)</option>
          <option value="AVAX">Avalanche (AVAX)</option>
          <option value="ADA">Cardano (ADA)</option>
          <option value="DOT">Polkadot (DOT)</option>
          {/* Add more currencies as needed */}
        </select>
        <div>
          <h2>Deposit/Withdraw</h2>
          <label>
            Amount:
            <input type="number" onChange={handleTransactionAmountChange} />
          </label>
          <br />
          <button onClick={deposit}>Deposit</button>
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <button onClick={togglePriceTicker}>{showPriceTicker ? "Hide Prices" : "View Prices"}</button>
        {showPriceTicker && (
          <div>
            <h2>Current Prices:</h2>
            <pre>{formattedPrices}</pre>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
