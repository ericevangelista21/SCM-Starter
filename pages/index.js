import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [shoePrice, setshoePrice] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(1);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
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

    const accounts = await ethWallet.request({
      method: "eth_requestAccounts",
    });
    handleAccount(accounts[0]);

    // Once the wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = useCallback(() => {
    if (ethWallet) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      const atmContract = new ethers.Contract(
        contractAddress,
        atmABI,
        signer
      );

      setATM(atmContract);
    }
  }, [ethWallet]);

  const getBalance = async () => {
    if (atm) {
      try {
        const currentBalance = await atm.getBalance();
        console.log("Current Balance:", currentBalance.toNumber());
        setBalance(currentBalance.toNumber());
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const deposit = async (amount) => {
    if (atm) {
      try {
        let tx = await atm.deposit(amount);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error in deposit transaction:", error.message);
        alert(`Failed to deposit: ${error.message}`);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(withdrawalAmount);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error in withdraw transaction:", error.message);
        alert(`Failed to withdraw: ${error.message}`);
      }
    }
  };

  const buyShoe = useCallback(async () => {
    if (atm && shoePrice) {
      try {
        let tx = await atm.buyShoe(shoePrice);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error in buyShoe transaction:", error.message);
        alert(`Failed to buy ticket: ${error.message}`);
      }
    }
  }, [atm, shoePrice]);

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this Plane.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>NIKE - 100 ETH</p>
        <p>ADIDAS - 80 ETH</p>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <label>Select Shoe Brand:</label>
          <div className="input-container">
            <select
              value={shoePrice}
              onChange={(e) => setshoePrice(e.target.value)}
            >
              <option value="nike">Nike</option>
              <option value="adidas">Adidas</option>
            </select>
            <button onClick={buyShoe}>Buy</button>
          </div>
        </div>
    
        <div>
          <label>Deposit Amount (ETH):</label>
          <div className="input-container">
            <input
              type="number"
              min="0"
              step="0.1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <button onClick={() => deposit(depositAmount)}>Deposit</button>
          </div>
        </div>
        <div>
          <label>Withdrawal Amount (ETH):</label>
          <div className="input-container">
            <input
              type="number"
              min="1"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
            />
            <button onClick={withdraw}>Withdraw</button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    getATMContract();
  }, [getATMContract]);

  return (
    <main className="container">
      <header>
        <img
          src="https://t3.ftcdn.net/jpg/01/30/14/60/360_F_130146011_64algBC3Kz91zzdht7qeW2fEnUipEtwB.jpg"
          alt="Metacrafters Logo"
          style={{ width: "50%", display: "block", margin: "0 auto" }}
        />
        <h1>Welcome to Shoe Express!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          margin: 50px;
          padding: 50px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: white;
          max-width: 950px;
          margin: auto;
          font-family: 'Helvetica';
          color: black;
        }
  
        label {
          display: block;
          margin-bottom: 5px;
        }
  
        select,
        input {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
  
        .input-container {
          display: flex;
          justify-content: space-between;
        }

        button {
          background-color: #4caf50;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px;
        }
  
        button:hover {
          background-color: #45a049;
        }
      `}</style>
    </main>
  );
}
