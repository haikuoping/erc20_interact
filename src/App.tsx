import { useState } from "react";
import "./App.css";
import Web3 from "web3";
import abi from "../build/contracts/QKCToken.json";

function App() {
  const [count, setCount] = useState(false);
  const [contractAddress, setContractAddress] = useState(
    "0xc764a335a818b0e05F9266Cb4Ab34569cc3114E6"
  );
  const [walletData, setWalletData] = useState({
    ChainId: 0,
    BlockNumber: 0,
    BlockTimeStamp: "",
    CurrentAccount: "",
    CurrentBalances: "",
  });
  const connected=async()=>{

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCount(true)
  }

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        connected();
        const x = new Web3(window.ethereum);
        const account = await x.eth.getAccounts();
        const balance = await x.eth.getBalance(account[0]);
        const block = await x.eth.getBlockNumber();
        const chainID = await x.eth.getChainId();
        const blockTime = (await x.eth.getBlock(block)).timestamp;
        setWalletData({
          ...walletData,
          CurrentBalances: balance,
          BlockNumber: block,
          ChainId: chainID,
          CurrentAccount: account[0],
          BlockTimeStamp: blockTime.toString(),
        });
      } catch (error: any) {
        if (error.code === 4001) {
          alert("user denied account access");
        }
      }
    }
  };
  const [readERC20, setReadERC20] = useState({
    symbol: "",
    totalSupply: "",
    balance: "",
  });
  const readContract = async () => {
    connectWallet();


    const x = new Web3(window.ethereum);

    //@ts-ignores
    const b = new x.eth.Contract(abi.abi, contractAddress);
    if (await b.methods.balanceOf(walletData.CurrentAccount).call()) {

      window.ethereum.request({
        method: "eth_requestAccounts",
      });
    }
    const symbol = await b.methods.symbol().call();

    const totalSupply = await b.methods._totalSupply().call();

    const balance = await b.methods.balanceOf(walletData.CurrentAccount).call();

    setReadERC20({ symbol, totalSupply, balance });
  };

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [tx, setTx] = useState({
    estimateGas: 0,
    gasPrice: "",
    tx: "",
  });

  const transfer = async () => {
    connected();

    const x = new Web3(window.ethereum);
    //@ts-ignores
    const instance = new x.eth.Contract(abi.abi, contractAddress);
    const transferData = instance.methods
      .transfer(toAddress, amount)
      .encodeABI();

    const estimateGas = await x.eth.estimateGas({
      to: contractAddress,
      data: transferData,
      from: walletData.CurrentAccount,
      value: "0x0",
    });
    const gasPrice = await x.eth.getGasPrice();
    const nonce = await x.eth.getTransactionCount(walletData.CurrentAccount);
    const rawTx = {
      from: walletData.CurrentAccount,
      to: contractAddress,
      nonce: nonce,
      gasPrice,
      gas: estimateGas * 2,
      value: "0x0",
      data: transferData,
      chainId: walletData.ChainId,
    };
    setTx({ ...tx, estimateGas, gasPrice });
    await x.eth
      .sendTransaction(rawTx)
      .on("transactionHash", (e) => setTx({ ...tx, tx: e }));
  };
  const [burn, setBurn] = useState(0);
  const [mint, setMint] = useState(0);
  const onBurn = async () => {
    await connected();

    const x = new Web3(window.ethereum);
    //@ts-ignores
    const instance = new x.eth.Contract(abi.abi, contractAddress);

    const a = await instance.methods
      .burn(burn)
      .send({ from: walletData.CurrentAccount });
    console.log("Burn coin: " + a);
  };
  const onMint = async () => {
    await connected();

    const x = new Web3(window.ethereum);
    //@ts-ignores
    const instance = new x.eth.Contract(abi.abi, contractAddress);
    const a = await instance.methods
      .mint(walletData.CurrentAccount, mint)
      .send({ from: walletData.CurrentAccount });

    console.log("Mint coin: " + a);
  };
  return (
    <div className="App">
      <button onClick={connectWallet}>Connect Wallet</button>
      {count?
      <>
      <div
        style={{
          border: "1px solid lightblue",
          borderRadius: 12,
          padding: 12,
          margin: 12,
        }}
      >
        {Object.keys(walletData).map((t) => (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              minWidth: 500,
            }}
            key={t}
          >
            <>{t}:</>
            <div> {walletData[t]}</div>
          </div>
        ))}
      </div>
      <button onClick={readContract}>Read</button>
      <input
        className="input"
        style={{ margin: 12, minWidth: 400 }}
        type="text"
        defaultValue={"0xc764a335a818b0e05F9266Cb4Ab34569cc3114E6"}
        onChange={(e) => setContractAddress(e.currentTarget.value)}
      />
      <div
        style={{
          border: "1px solid lightblue",
          borderRadius: 12,
          padding: 12,
          margin: 12,
        }}
      >
        {Object.keys(readERC20).map((t) => (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              minWidth: 500,
            }}
            key={t}
          >
            <>{t}:</>
            <div> {readERC20[t]}</div>
          </div>
        ))}
      </div>
      <div>
        <button onClick={transfer}>transfer</button>
        &nbsp;&nbsp;&nbsp;toAddress
        <input
          type="text"
          style={{ margin: 12 }}
          className="input"
          onChange={(e) => setToAddress(e.currentTarget.value)}
        />
        Amount{" "}
        <input
          type="text"
          style={{ margin: 12 }}
          className="input"
          onChange={(e) => setAmount(Number(e.currentTarget.value))}
        />
        <div
          style={{
            border: "1px solid lightblue",
            borderRadius: 12,
            padding: 12,
            margin: 12,
          }}
        >
          {Object.keys(tx).map((t) => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                minWidth: 500,
              }}
              key={t}
            >
              <>{t}:</>
              <div> {tx[t]}</div>
            </div>
          ))}
        </div>
        <button onClick={onBurn}>Burn</button>
        <input
          onChange={(e) => setBurn(Number(e.currentTarget.value))}
          style={{ margin: 12 }}
          type="text"
          className="input"
        />
        <button onClick={onMint}>Mint</button>
        <input
          onChange={(e) => setMint(Number(e.currentTarget.value))}
          style={{ margin: 12 }}
          type="text"
          className="input"
        />
        
      </div>
      </>

      :null}
      
    </div>
    
  );
}

export default App;
