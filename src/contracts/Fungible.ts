////////////////////////////////////////////////////////////////////////////////
// JESUS is the LORD of ALL
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
//Fungible Token Contract
//  Este contrato define as funcionalidades basicas de um token fungível
//  O emissor monitora cada trasanção do token via assinatura do oraculo do token
////////////////////////////////////////////////////////////

import {
    method, prop, SmartContract, hash256, assert, ByteString,
    PubKey, Sig, hash160, toByteString, Utils, PubKeyHash, slice, reverseByteString
} from 'scrypt-ts'
import { SECP256K1 } from 'scrypt-ts-lib'

export class Fungible extends SmartContract {
    // Stateful property to store counters value.
    @prop()
    readonly tokenType: ByteString; // data.

    @prop()
    readonly oraclePKEC: PubKey; // oracles public Key

    @prop()
    readonly totalSupply: bigint; // data.

    @prop(true)
    alice: PubKeyHash; // alice's public Key
    
    @prop(true)
    thisSupply: bigint; // data.

    @prop(true)
    genesisTX: ByteString; // Branches in which token grew.

    ////////////////////////////////////////////////////
    //Parametros de segurança do Contrato:
    //
    //  Chave do Oraculo: this.oraclePKEC (Configurada na Criação do Token)
    //  Genesis TX - this.genesisTX (Configurada a partir primeira operação do token)
    //
    ////////////////////////////////////////////////////

    constructor(alice: PubKeyHash, totalSupply: bigint, oraclePKEC: PubKey//, tokenType: ByteString//oraclePoint: Point
        ) {            
        super(...arguments);
        this.totalSupply = totalSupply
        this.thisSupply = this.totalSupply

        this.alice = alice;

        this.genesisTX = toByteString('');//Necessário comparar Genesis TX com ''

        //General Purpose Token ECDSA Oracle = 47656e6572616c20507572706f736520546f6b656e204543445341204f7261636c65
        this.tokenType = toByteString('47656e6572616c20507572706f736520546f6b656e204543445341204f7261636c65');

        this.oraclePKEC = oraclePKEC
    }
     

    /**
     * Funcção de aniquilação de unidade do token
     * @param sig 
     * @param pubkey 
     */
    @method()
    public meltUnits( sig: Sig, pubkey: PubKey) {    

        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);
        // build the transation outputs

        let outputs = toByteString('');

        outputs = Utils.buildPublicKeyHashOutput(this.alice, this.ctx.utxo.value);

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }


    /**
     * A função split é usada tanto para tranferencia de unidade quando para divisão de unidade em um mesmo UTXO
     * 
     * Esta operação de split é critica para manter a quantidade de tokens de genesis incorruptível
     * Se os outputs vierem de fora, o contrato perde o controle do numero de tokens
     * 
     * Se tivermos mais de 2 outputs, o script do contrato cresce de forma forma ineficiente
     * O split generico mais eficiente tem somente 2 outputs de contrato
     * 
     * @param sigOracle - assinatura do oraculo do token 
     * @param pbkP2 - cada assinatura feita pelo oraculo usará uma chave publica diferente
     * @param sig 
     * @param pubkey 
     * @param numberOfSendTokens 
     * @param toNewOwner 
     */
    @method()
    public splitUnits(
        sigOracle: ByteString, pbkP2: PubKey,
        sig: Sig, pubkey: PubKey, numberOfSendTokens: bigint, toNewOwner: PubKeyHash
        ) {    

        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        // Cerificação ECDSA com Oraculo
        /////////////////////////////////////////////////////////
            
        let p1 = SECP256K1.pubKey2Point(this.oraclePKEC)
        let p2 = SECP256K1.pubKey2Point(pbkP2)
        let pbkOracle = SECP256K1.point2PubKey(SECP256K1.addPoints(p1, p2))

        assert(this.checkSig(Sig(sigOracle), pbkOracle), `checkSig failed oracle certificate`);

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////
            
        assert( (numberOfSendTokens > 0) && (numberOfSendTokens <= this.thisSupply), `insuficient supply fund!!`);
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);

        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        /////////////////////////////////////////////////////////
        
        if(this.genesisTX === toByteString(''))
        {           
            this.genesisTX = reverseByteString(slice(this.prevouts, 0n, 32n), 32n) + this.tokenType
            console.log('this.genesisTX: ', this.genesisTX )
        }
        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

        // build the transation outputs
        let outputs1 = toByteString('');
        let outputs = toByteString('');

        if(this.thisSupply == numberOfSendTokens)
        {
            this.alice = toNewOwner
            outputs = this.buildStateOutput(this.ctx.utxo.value);
            //Alert Output
            //outputs += Utils.buildPublicKeyHashOutput(hash160(this.alice), 1n);
            outputs += Utils.buildPublicKeyHashOutput(this.alice, 1n);
        }
        else
        {
                  
            this.thisSupply = this.thisSupply - numberOfSendTokens
            outputs1 = this.buildStateOutput(this.ctx.utxo.value);
            
            this.alice = toNewOwner
            this.thisSupply = numberOfSendTokens

            //outputs += this.buildStateOutput(this.ctx.utxo.value);
            outputs = this.buildStateOutput(this.ctx.utxo.value) + outputs1;
            //Alert Output
            //outputs += Utils.buildPublicKeyHashOutput(hash160(this.alice), 1n);
            outputs += Utils.buildPublicKeyHashOutput(this.alice, 1n);

            console.log('CT Ouput 2: ', Utils.buildPublicKeyHashOutput(this.alice, 1n))
        }

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
            console.log('CT Ouput 3: ', this.buildChangeOutput())
        }

        console.log('This prevouts: ', this.prevouts)
        console.log('This Change Ammount: ', this.changeAmount)

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    /**
     * O metodo merge é utilizado para unir unidades do token em dois UTXOs diferentes
     * @param sigOracle 
     * @param pbkP2 
     * @param sig 
     * @param pubkey 
     * @param Supply1 
     * @param Supply2 
     */
    @method()
    public mergeUnits(
        sigOracle: ByteString, pbkP2: PubKey,
        sig: Sig, pubkey: PubKey, 
        Supply1: bigint, Supply2: bigint, 
    ) { 
       
        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        // Cerificação ECDSA com Oraculo
        /////////////////////////////////////////////////////////
            
        let p1 = SECP256K1.pubKey2Point(this.oraclePKEC)
        let p2 = SECP256K1.pubKey2Point(pbkP2)
        let pbkOracle = SECP256K1.point2PubKey(SECP256K1.addPoints(p1, p2))

        console.log('this.changeAmount: ', this.changeAmount)
        console.log('this.buildChangeOutput(): ', this.buildChangeOutput())
        
        assert(this.checkSig(Sig(sigOracle), pbkOracle), `checkSig failed oracle certificate`);

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////
    
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);

        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        // Also a L1 Back to Genesis Solution
        /////////////////////////////////////////////////////////
                
        //Não é possível fazer merge com Genesis TX;
        //Os token não podem vir de cadeias diferentes, este não passaram pelo teste B2G

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

        // build the transation outputs
        let outputs = toByteString('');
        this.thisSupply = Supply1 + Supply2
     
        outputs = this.buildStateOutput(this.ctx.utxo.value);
        outputs += Utils.buildPublicKeyHashOutput(this.alice, this.ctx.utxo.value);

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
}
