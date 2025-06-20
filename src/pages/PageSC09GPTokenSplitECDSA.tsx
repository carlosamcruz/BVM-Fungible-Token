import { useRef, FC, useState} from 'react';

import '../App.css';

import { DefaultProvider, MethodCallOptions, sha256, toHex, PubKey, bsv, TestWallet, toByteString, buildPublicKeyHashScript, findSig, SignatureResponse, PubKeyHash, ContractTransaction, reverseByteString, int2ByteString, hash256, SmartContract } from "scrypt-ts";
import { Fungible } from "../contracts/Fungible";

import {homepvtKey, homenetwork, compState, feeService, utxoFeeAdd1} from './Home';
import { listUnspent, getSpentOutput, oracleWoC} from '../services/mProviders';
import { sleep, scriptUxtoSize, hexToLittleEndian, utxoDataUpdata, hexToBytes } from "../services/myUtils";
import { SECP256K1 } from 'scrypt-ts-lib';

//const provider = new DefaultProvider({network: bsv.Networks.testnet});
const provider = new DefaultProvider({network: homenetwork});
let Alice: TestWallet

let txlink2 = ""
//const privateKey = bsv.PrivateKey.fromHex("79342a4c317817a80a298fe116147a74e4e90912a4f321e588a4db67204e29b0", bsv.Networks.testnet)  
//let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork) 

interface props1 {
  passedData: string;
}

//function PageSC09GPTokenSplit() {
const PageSC09GPTokenSplit: FC<props1> = (props) => {  
//const  deployACT: FC = () => {  

  const [deployedtxid, setdeptxid] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const txid = useRef<any>(null);
  const txidPrvStt = useRef<any>(null);
  const tokenIndex = useRef<any>(null);
  const nTokenSend = useRef<any>('0');
  const receiverPBK = useRef<any>(null);

  const [binaryData2, setbinaryData2] = useState<Uint8Array>(new Uint8Array());
  //sCriptType deve ser ajustado para identificar cada tipo de script
  //preferencialmente no momento que o script for arquivado
  const downloadBinaryFileData = () => {
    // Create a Blob from the binary data
    const blob = new Blob([binaryData2]);

    console.log("File Size: ", binaryData2?.byteLength)

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MyArchive'+ '.' + 'txt'; // Specify the desired file name with the correct extension

    // Programmatically trigger a click event on the anchor element
    a.click();

    // Clean up the URL object and remove the anchor element
    URL.revokeObjectURL(url);
    a.remove();
  };


  const interact = async (amount: any) => {
    setdeptxid("Wait!!!")

    //Para evitar o problema:  Should connect to a livenet provider
    //Bypassar o provider externo e const
    let provider = new DefaultProvider({network: homenetwork});

    if((txid.current.value.length === 64 || txidPrvStt.current.value.length === 64) 
      && ((parseInt(nTokenSend.current.value, 10) > 0) || props.passedData === 'Transfer' )
      &&((receiverPBK.current.value).length > 10)
      //&&((receiverPBK.current.value).length === 66 || (receiverPBK.current.value).length === 130)
      //&&((receiverPBK.current.value).substring(0,2) === '02' || (receiverPBK.current.value).substring(0,2) === '03' || (receiverPBK.current.value).substring(0,2) === '04')
      )
    {


      let posNew1 = 0 // Output Index of the Contract in the Current State TX

      if(tokenIndex.current.value === '1' )
      {
        posNew1 = 1
      }

      ////////////////////////////////////////////////
      //
      //  Configuração da Parte 2 da Chave Publica do Oraculo
      //    Revisar para o estado anterior
      ////////////////////////////////////////////////

      let keyDerivation = reverseByteString(txid.current.value, 32n) + int2ByteString(BigInt(posNew1), 4n) 
      let pvtkeyPart2 = BigInt('0x' + sha256(keyDerivation))//bsv.crypto.BN.fromString(sha256(signatures[0]))       
      let pvtkeyTotal = ((pvtkeyPart2) % SECP256K1.n).toString(16)
        
      while(pvtkeyTotal.length < 64)
      {
        pvtkeyTotal = '0' + pvtkeyTotal
      }
        
      let privateKeyP2 = bsv.PrivateKey.fromHex(pvtkeyTotal, homenetwork); 
      privateKeyP2.compAdd(false);
      privateKeyP2 = bsv.PrivateKey.fromHex(pvtkeyTotal, homenetwork);
              
      let pubKeyP2 = bsv.PublicKey.fromPrivateKey(privateKeyP2) // Parte 2 da Chave Publica do Oraculo
      
      ////////////////////////////////////////////////
      ////////////////////////////////////////////////


      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork)
      
      privateKey.compAdd(compState);

      privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork)

      Alice = new TestWallet(privateKey, provider)
  
      try {
  
        const signer = Alice
        //const balance = 1000
  
  
        //Linha necessária nesta versão
        //O signee deve ser connectado
        await signer.connect(provider)
  
        //const message = toByteString('hello world', true)
        let tx = new bsv.Transaction
        //////////////////////////////////////////////////////
        //Jesus is the Lord
        //////////////////////////////////////////////////////
            
        let txidSplit
        if(txid.current.value.length === 64)
        {
              tx = await provider.getTransaction(txid.current.value)
              txidSplit = txid.current.value
        }
        else if(txidPrvStt.current.value.length === 64)
        {
              let currentStateTXID = txidPrvStt.current.value
              let stxos = await getSpentOutput(currentStateTXID, 0, homenetwork)
        
              while(stxos[0].inputIndex !== -1)
              {
                currentStateTXID = stxos[0].txId;
        
                await sleep(500);
        
                stxos = await getSpentOutput(currentStateTXID, 0, homenetwork)
                //console.log("TX Output ", i, " spent on:", stxos[0].txId)
                console.log("Input:", stxos[0].inputIndex)
              }
        
              tx = await provider.getTransaction(currentStateTXID)
              txidSplit = currentStateTXID
        
        }
      
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////        
 
    
        console.log('Current State TXID: ', tx.id)
  
        //const instance = Helloworld02.fromTx(tx, 0)

        //let instance2 = GeneralToken.fromTx(tx, posNew1)
        let instance2 = Fungible.fromTx(tx, posNew1)
        //Inform to the system the right output index of the contract and its sequence
        tx.pvTxIdx(tx.id, posNew1, sha256(tx.outputs[posNew1].script.toHex()))
    
        let pbkey = bsv.PublicKey.fromPrivateKey(privateKey)

        let numberOfSendTokens = instance2.thisSupply;

        if(props.passedData === 'Split')
        {
          numberOfSendTokens = BigInt(parseInt(nTokenSend.current.value, 10))
        }
        //let numberOfSendTokens = 3n
        //let toNewOwner = PubKey(toHex(pbkeyBob))

        //let toNewOwner = PubKey(receiverPBK.current.value)
        let toNewOwner = PubKeyHash(toHex(bsv.Address.fromString(receiverPBK.current.value).hashBuffer))



        ////////////////////////////////////////////////////////
        //Para o calculo da Taxa de Serviço
        ////////////////////////////////////////////////////////
        let utxoFeeFlag = false;

        if(feeService > 0)
          utxoFeeFlag = true

        let utxoFee =  new bsv.Transaction().addOutput(new bsv.Transaction.Output({
          //script: buildPublicKeyHashScript(hash160(instance2.alice)),
          //script: buildPublicKeyHashScript(instance2.alice),
          script: buildPublicKeyHashScript(PubKeyHash(toHex(bsv.Address.fromString(utxoFeeAdd1).hashBuffer))),
          satoshis: feeService
        }))

        //Tamanho do script formatado
        let out1size = scriptUxtoSize(utxoFee.outputs[0].script.toHex()) 
        let tokenSats = (utxoFee.outputs[0].satoshis).toString(16);
        //console.log("Sat STR 0: ", tokenSats)
        while(tokenSats.length < 16)
        {
          tokenSats = '0' + tokenSats
        }

        //console.log("Token Sat: ", hexToLittleEndian(tokenSats))

        let utxo2Fee = hexToLittleEndian(tokenSats) + out1size + utxoFee.outputs[0].script.toHex()

        if(!utxoFeeFlag)
        {
          utxo2Fee = '';
        }

        //console.log("UTXO Fee: ", utxo2Fee)
        
        ////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////



        const balance = instance2.balance
        const nextInstance = instance2.next()
       
        await instance2.connect(signer)


        //instance2.bindTxBuilder('split', async function () {
        //Esta amarrado a instancia Pai.
        instance2.bindTxBuilder(
          'splitUnits',         
          (
            current: Fungible,
            options: MethodCallOptions<Fungible>,
            ...args: any
          ): Promise<ContractTransaction> => 
        {          

          const changeAddress = bsv.Address.fromPrivateKey(privateKey)

          //Alert Address
          //const alertAddress = bsv.Address.fromPublicKey(bsv.PublicKey.fromString(receiverPBK.current.value))

          const alertAddress = bsv.Address.fromString(receiverPBK.current.value)
     
          const unsignedTx: bsv.Transaction = new bsv.Transaction()
          .addInputFromPrevTx(tx, posNew1)

          /////////////////////////////////////////////////////////
          //Jesus is the Lord!!!
          //
          // solução para quebrar UTXO replicado
          /////////////////////////////////////////////////////////
          if(instance2.genesisTX === '')
          {
            nextInstance.genesisTX = tx.id + instance2.tokenType
            console.log('this.genesisTX Ext: ', nextInstance.genesisTX )
          }
          //nextInstance.nTxThisBranch = nextInstance.nTxThisBranch + 1n 
          //nextInstance.prevUtxo = toHex(unsignedTx.prevouts()) 


          if(nextInstance.thisSupply === numberOfSendTokens)
          {
              nextInstance.alice = toNewOwner

              unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: nextInstance.lockingScript,
                  satoshis: balance,
              }))
              //})).change(changeAddress)

              //Alert Address
              unsignedTx.addOutput(new bsv.Transaction.Output({
                script: bsv.Script.buildPublicKeyHashOut(alertAddress),
                satoshis: 1,
              })).change(changeAddress)
          }
          else
          {                               
              nextInstance.thisSupply = nextInstance.thisSupply - numberOfSendTokens

              let prvLockingScript = nextInstance.lockingScript;
             
              nextInstance.alice = toNewOwner
              nextInstance.thisSupply = numberOfSendTokens

              unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: nextInstance.lockingScript,
                  satoshis: balance,
              }))

              unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: prvLockingScript,
                  satoshis: balance,
              }))

              //})).change(changeAddress)

              //Alert Address
              unsignedTx.addOutput(new bsv.Transaction.Output({
                script: bsv.Script.buildPublicKeyHashOut(alertAddress),
                satoshis: 1,
              })).change(changeAddress)
          }            
              
          return Promise.resolve({
              tx: unsignedTx,
              atInputIndex: 0,
              nexts: [
              ]
          });              
        });

        
        /////////////////////////////////////////////////////////////////
        // Jesus is the Lord
        //  Oracle
        /////////////////////////////////////////////////////////////////

        let txid01 = txidSplit
        let index01 = posNew1
        let txid02 = '00'
        let index02 = 0
        let networkOc = 'test'
  
        if(homenetwork !== bsv.Networks.testnet)
        {
          networkOc = 'main'
        }
  

        //Dummy Sig for FEE Calculations
        let sigOracle = toByteString('3047022300000026ecfbba3be4b8727e5eb7cfda955907bfe9788c5453847da76d84d6b41d50ae022071a713ba84465a30aaa51b2e0f2880b9f38d46e158fd6ef472f0c33fd57275e741')

        console.log('Pub Key: ', toHex(pbkey))
        console.log('Pub Key Oracle P2: ', toHex(pubKeyP2))

        const partialTx = await instance2.methods.splitUnits(//rSig, 
          sigOracle, PubKey(toHex(pubKeyP2)),
          (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
          numberOfSendTokens,
          toNewOwner,
          { multiContractCall: true, } as MethodCallOptions<Fungible>
        )

        let primgHash =  ''

        //////////////////////////////////////////////////////////////////
        //  Contexto Dummy
        //    Para Criar a Preimage
        //////////////////////////////////////////////////////////////////

        SmartContract.dummyFlagOff() //Erros nos tests mostraram necessário
        { //const { tx: callTx, nexts } = await SmartContract.multiContractCall(
          const { tx: callTxDummy, nexts } = await SmartContract.multiContractCallDummy(
            partialTx,
            signer,
          )

          //Se não fizer o broadcast 

          primgHash =  (hash256(toHex(callTxDummy.inputs[0].getPreimage(callTxDummy,0))))
          console.log('preimage: ', hash256(toHex(callTxDummy.inputs[0].getPreimage(callTxDummy,0))))
          console.log('preimage: ', (toHex(callTxDummy.inputs[0].getPreimage(callTxDummy,0))))


          console.log("hashvouts Dummy: ", callTxDummy.outputs)
          console.log("TX Dummy: ", toHex(callTxDummy).substring(toHex(callTxDummy).length - 200))
          //console.log("vouts 0 hash: ", sha256(toHex(callTxDummy.outputs[0].script.toHex())))
          //console.log("vouts 1 sc: ", toHex(callTxDummy.outputs[1].script.toHex()))
          //console.log("vouts 1 sc: ", toHex(callTxDummy.outputs[1].script.toHex()))

          for(let i = 2; i < callTxDummy.outputs.length; i++ )
          {
            console.log("vouts "+ i + " sc: ", toHex(callTxDummy.outputs[i].script.toHex()))

          }


        }

        const witnessServer = 'https://oracle01.vercel.app/v1'

        const responseECDSA = await oracleWoC(`${witnessServer}/certifyECDSA/${txid01}/${index01}/${primgHash}/${networkOc}`)
        
        console.log('Response Oracle: ', (responseECDSA[0].sigDER))

        //Assinatura do Oraculo

        sigOracle = toByteString(responseECDSA[0].sigDER)

        const partialTx2 = await instance2.methods.splitUnits(//rSig, 
          sigOracle, PubKey(toHex(pubKeyP2)),
          (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
          numberOfSendTokens,
          toNewOwner,      
          { multiContractCall: true, } as MethodCallOptions<Fungible>
        )
        
        ////////////////////////////////////////
        //Jesus is the Lord
        //Versão para Oraculo ECDSA
        ////////////////////////////////////////      

        //const { tx: callTx, nexts, raw } = await SmartContract.multiContractCallV2(
        const txRsult = await SmartContract.multiContractCallV2(  
          partialTx2,
          signer,
        )    

        //SmartContract.dummyFlagOff()

        let callTx = new bsv.Transaction(txRsult)

        console.log('\nTX Flag 52: ', toHex(callTx))

        console.log( 'TXOUT: ', (callTx))
        console.log( 'TXID: ', callTx.id)
    
        if(homenetwork === bsv.Networks.mainnet )
        {
          txlink2 = "https://whatsonchain.com/tx/" + callTx.id;
        }
        else if (homenetwork === bsv.Networks.testnet )
        {
          txlink2 = "https://test.whatsonchain.com/tx/" + callTx.id;
        }
        setLinkUrl(txlink2);
    
        setdeptxid(callTx.id)

        if(callTx.id.length === 64)
        {
          
          let finalUTXOs = await listUnspent(bsv.Address.fromPrivateKey(privateKey), homenetwork)

          //GPToken === 103
          let myJsonStrUTXOs2 = utxoDataUpdata(toHex(callTx), callTx.id, finalUTXOs, 103) 
            
          //console.log('my UTXOs Json String 222: ', myJsonStrUTXOs2)

          setbinaryData2(hexToBytes(toByteString(myJsonStrUTXOs2, true)))

        }
      
      } 
      catch (e) {
        console.error(props.passedData + ' fails', e)
        alert(props.passedData + ' fails')
        setdeptxid("")
      }
    }
    else
    {
      alert('Wrong TXID Format / or Number to Split / of SEC Format')
      setdeptxid("Try Again!!!")
    }
  };

  return (
    <div className="App">
        <header className="App-header">

        <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>   
          Fungible Token - {props.passedData}
          
        </h2>

        {
          props.passedData === 'Split'?
            <a href='https://medium.com/@cktcracker/splitting-gptoken-436300829af8' target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '14px', paddingBottom: '20px', color: 'yellow' }}>
              Instructions of Use
            </a>
          :
          <a href='https://medium.com/@cktcracker/transfer-gptoken-c31a7e61cd54' target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '14px', paddingBottom: '20px', color: 'yellow' }}>
            Instructions of Use
          </a>
        }

       
        <div>

          <div style={{ textAlign: 'center' , paddingBottom: '20px' }}>
                
                <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                  >Inform Current or Previous State TXID:  
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={txid} type="hex" name="PVTKEY1" min="1" placeholder="current state" />
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={txidPrvStt} type="hex" name="PVTKEY1" min="1" placeholder="pevious state (optional)" />
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={tokenIndex} type="number" name="PVTKEY1" min="1" placeholder="0 or 1 (0 default)" />
                </label>     
          </div>

          {
            props.passedData === 'Split'?

            <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                  <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                  > 
                      <input ref={nTokenSend} type="number" name="PVTKEY1" min="1" placeholder="n token to split (min 1)" />
                  </label>     
            </div>
            :
            ''
          }

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={receiverPBK} type="hex" name="PVTKEY1" min="1" placeholder="Receiver Address" />
                </label>     
          </div>


          <div style={{ textAlign: 'center' }}>     
                <button className="insert" onClick={interact}
                    style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
                >{props.passedData} </button>
          </div>

        </div>


        {
          deployedtxid.length === 64?
          
         /* <button onClick={handleCopyClick}>Copy to ClipBoard</button> */

          <div>
          <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '20px' }}>
            <p className="responsive-label" style={{ fontSize: '12px' }}>TXID: {deployedtxid} </p>
          </div>
          <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
            <p className="responsive-label" style={{ fontSize: '12px' }}>TX link: {' '} 
                <a href={linkUrl} target="_blank" style={{ fontSize: '12px', color: 'cyan'}}>
                {linkUrl}</a></p>
          </div>
          <div style={{ display: 'inline-block', textAlign: 'center'}}>
              
              <button className="insert" onClick={downloadBinaryFileData}
                  style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
              >Updata MyData</button>

          </div>
        </div>
          
          
          :

          <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '20px' }}>
          <p className="responsive-label" style={{ fontSize: '12px' }}>{deployedtxid} </p>
        </div>
          
        }                  

      </header>
    </div>
  );
}

export default PageSC09GPTokenSplit;
