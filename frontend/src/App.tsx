import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import { connectMetamask } from './utils/connectMetamask'
import Layout from './pages/Layout/Layout';
import Manager from './pages/Manager/Manager';
import FundId from './pages/FundId/FundId';
import CreateFund from './pages/CreateFund/CreateFund';
import DashboardId from './pages/DashboardId/DashboardId';
import FundsList from './pages/FundsList/FundsList';
import Investor from './pages/Investor/Investor';
import SuccessInvestment from './pages/SuccessInvestment/SuccessInvestment';
import SuccessFund from './pages/SuccessFund/SuccessFund';
import Proposals from './pages/Proposals/Proposals';
import CreateProposal from './pages/CreateProposal/CreateProposal';

function App() {

  //handle Metamask wallet connection
  const [isMetamaskInstalled, setIsMetamaskInstalled] = React.useState<boolean>(false);
  const [account, setAccount] = React.useState<string | null>(null);
  const [provider, setProvider] = React.useState<any>(null);
  const [signer, setSigner] = React.useState<any>(null);

  React.useEffect(() => {
    if ((window as any).ethereum) {
      //check if Metamask wallet is installed
      setIsMetamaskInstalled(true);
      setAccount((window as any).ethereum.selectedAddress);
    }
  }, []);

  async function connectWallet(): Promise<void> {
    const connection = await connectMetamask();
    setAccount(connection?.address);
    setProvider(connection?.web3Provider);
    setSigner(connection?.web3Signer);
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Layout
              isMetamaskInstalled={isMetamaskInstalled}
              connectWallet={connectWallet}
              account={account}
              signer={signer}
            />
          }>
            <Route path="/" element={<Home />} />
            <Route path="/fundslist" element={<FundsList />} />
            <Route path="/fundslist/:id" element={
              <FundId
                account={account}
                provider={provider}
                signer={signer}
              />} 
            />
            <Route path="/successinvestment" element={<SuccessInvestment />} />
            <Route path="/manager" element={
              <Manager 
                account={account}
                provider={provider}
                signer={signer}
              />} 
              />
            <Route path="/manager/:id" element={
              <DashboardId 
                account={account}
                signer={signer}
              />} 
            />
            <Route path="/successfund" element={<SuccessFund />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/create-proposal" element={<CreateProposal />} />
            <Route path="/investor" element={<Investor />} />
            <Route path="/create-fund" element={
              <CreateFund
              isMetamaskInstalled={isMetamaskInstalled}
              account={account}
              signer={signer}
              />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App