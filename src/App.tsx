import { useState } from 'react';

import './App.css';

import PageSC07GPTokenCreateECDSA from "./pages/PageSC07GPTokenCreateECDSA"
import PageSC14GPTokenMeltECDSA from "./pages/PageSC14GPTokenMeltECDSA"
import PageSC09GPTokenSplitECDSA from "./pages/PageSC09GPTokenSplitECDSA"
import PageSC10GPTokenMergeECDSA from "./pages/PageSC10GPTokenMergeECDSA"

import Home from './pages/Home';
import Home00WeBSVmenu from './pages/Home00WeBSVmenu';

import Page01TX from './pages/Page01TX';
import Page03Read from './pages/Page03Read';

function App() {

  const [currentPage, setCurrentPage] = useState<string>('home00WeBSVmenu');
  const [showHomeDropdown, setShowHomeDropdown] = useState<boolean>(false);
  const [showTodoDropdown, setShowTodoDropdown] = useState<boolean>(false);
  const [showSCDropdown, setShowSCDropdown] = useState<boolean>(false);
  const [showGPTECDSADropdown, setShowGPTECDSADropdown] = useState<boolean>(false);
  const [showSendDropdown, setShowSendDropdown] = useState<boolean>(false);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setShowHomeDropdown(false);
    setShowTodoDropdown(false);
    setShowSCDropdown(false);
    setShowSendDropdown(false);
    setShowGPTECDSADropdown(false);
  };


  return (


        <div className="App">

            <nav className="navbar">
              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowHomeDropdown(!showHomeDropdown); 
                                    setShowTodoDropdown(false);setShowSCDropdown(false); 
                                    setShowGPTECDSADropdown(false)}}>
                  Home
                </button>
                {showHomeDropdown && (
                  <div className="dropdown-content">

                    <button className="dropdown-button" onClick={() => handlePageChange('home')}>
                      Access
                    </button>

                    <button className="dropdown-button" onClick={() => handlePageChange('home00WeBSVmenu')}>
                      Reception
                    </button>


                  </div>
                )}
              </div>

              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowTodoDropdown(!showTodoDropdown); 
                                    setShowHomeDropdown(false); setShowSCDropdown(false); 
                                    setShowGPTECDSADropdown(false)}}>
                  Satoshi to Peer
                </button>
                {showTodoDropdown && (
                  <div className="dropdown-content">

                      <button className="dropdown-button" 
                          onClick={() => {setShowSendDropdown(!showSendDropdown); setShowGPTECDSADropdown(false)}}>
                        Send Satoshis
                      </button>
                      {showSendDropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home02')}>
                            p2pkh-p2pkh
                          </button>
                        </div>
                      )}

                    
                  </div>
                )}
              </div>


              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowTodoDropdown(false); 
                                    setShowSCDropdown(!showSCDropdown); setShowHomeDropdown(false);  
                                    setShowGPTECDSADropdown(false)}}>
                  Smart Contracts
                </button>
                {showSCDropdown && (
                  <div className="dropdown-content">

                    <button className="dropdown-button" 
                          onClick={() => {setShowGPTECDSADropdown(!showGPTECDSADropdown)}}>
                        Fungible Token
                    </button>
                    {showGPTECDSADropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken01ECDSA')}>
                            Create
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken10ECDSA')}>
                            Transfer
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken03ECDSA')}>
                            Split
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken04ECDSA')}>
                            Merge
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken09')}>
                            Details
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken08ECDSA')}>
                            Burn
                          </button>
                        </div>
                    )}

                  </div>
                )}  
              </div>

            </nav>

            {currentPage === 'home' && <Home passedData={''}/>}
            {currentPage === 'homeUser' && <Home passedData={'rapido'} />}
            {currentPage === 'home00WeBSVmenu' && <Home00WeBSVmenu />}           

            {currentPage === 'home02' && <Page01TX />}
            {currentPage === 'home04' && <Page03Read passedData={''}/>}

            {currentPage === 'home16f' && <Page03Read passedData={'OLock'}/>}

            {currentPage === 'GPToken01ECDSA' && <PageSC07GPTokenCreateECDSA/>}


            {currentPage === 'GPToken03ECDSA' && <PageSC09GPTokenSplitECDSA passedData={'Split'}/>}

            {currentPage === 'GPToken04ECDSA' && <PageSC10GPTokenMergeECDSA/>}


            {currentPage === 'GPToken08ECDSA' && <PageSC14GPTokenMeltECDSA/>}
            {currentPage === 'GPToken09' && <Page03Read passedData={'GPToken'}/>}

            {currentPage === 'GPToken10ECDSA' && <PageSC09GPTokenSplitECDSA passedData={'Transfer'}/>}

          

        </div>

 

  );
}

export default App;
