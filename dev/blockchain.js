import sha256 from "sha256";
import {v4} from "uuid";
import * as ed from 'noble-ed25519';
import {toHexString} from "./utils.js";

const currentNodeUrl = process.argv[3];

class Blockchain{
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];

        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = [];

        this.difficulty = 4;
        this.reward = 100;

        this.createNewBlock(0, '0', '0')
    }

    createNewBlock = (nonce, previousBlockHash, hash) => {
        const newBlock = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash
        };

        this.pendingTransactions = [];
        this.chain.push(newBlock);

        return newBlock;
    }

    getLastBlock = () => {
        return this.chain[this.chain.length - 1];
    }

    createNewTransaction = (amount, sender, recipient) => {
        const newTransaction = {
            amount,
            sender,
            recipient,
            transactionId: v4().split('-').join('')
        };

        return newTransaction;
    }

    addTransactionToPendingTransaction = (transactionObj) => {
        this.pendingTransactions.push(transactionObj);
        return this.getLastBlock().index + 1;
    }

    getTransaction= (transactionId) => {
        let found = null;

        for(let i = 0; i < this.chain.length; i++) {
            for(let j = 0; j < this.chain[i].transactions.length; j++) {
                if (this.chain[i].transactions[j].transactionId === transactionId) {
                    found = {transaction:this.chain[i].transactions[j], state: 'processed'};
                    break;
                }
            }
        }

        for(let i = 0; i < this.pendingTransactions.length; i++) {
            if (this.pendingTransactions[i].transactionId === transactionId) {
                found = {transaction:this.pendingTransactions[i], state: 'pending'};
                break;
            }
        }

        return found;
    }

    hashBlock = (prevBlockHash, currentBlockData, nonce) => {
        const data = prevBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(data);

        return hash;
    }

    getBlock = (blockHash) => {
        let found = null;

        for(let i = 0; i < this.chain.length; i++) {
            if (this.chain[i].hash === blockHash) {
                found = this.chain[i];
                break;
            }
        }

        return found;
    }

    getAddressData = (address) => {
        let addressTransactions = [];
        let balance = 0;

        for(let i = 0; i < this.chain.length; i++) {
            for(let j = 0; j < this.chain[i].transactions.length; j++) {
                if (this.chain[i].transactions[j].sender === address) {
                    addressTransactions.push(this.chain[i].transactions[j]);
                    balance -= this.chain[i].transactions[j].amount;
                }

                if (this.chain[i].transactions[j].recipient === address) {
                    addressTransactions.push(this.chain[i].transactions[j]);
                    balance += this.chain[i].transactions[j].amount;
                }
            }
        }

        return {addressTransactions, balance};
    }

    proofOfWork = (previousBlockHash, currentBlockData) => {
        let nonce = 0;
        let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

        while (hash.toString().substr(0,this.difficulty) !== '0000') {
            nonce++;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        }

        return nonce;
    }

    chainIsValid = (blockchain) => {
        let validChain = true;

        for (let i =1; i < blockchain.length; i++) {
            const currentBlock = blockchain[i];
            const previousBlock = blockchain[i - 1];
            const blockHash = this.hashBlock(
                previousBlock.hash,
                {
                    transactions: currentBlock.transactions,
                    index: currentBlock.index
                },
                currentBlock.nonce
            );

            if (blockHash.substr(0, 4) !== '0000') {
                validChain = false;
                break;
            }

            if (currentBlock.previousBlockHash !== previousBlock.hash) {
                validChain = false;
                break;
            }
        }

        const genesisBlock = blockchain[0];
        const correctNonce = genesisBlock.nonce === 0;
        const correctPrevHash = genesisBlock.previousBlockHash === '0';
        const correctHash = genesisBlock.hash === '0';
        const correctTransactions = genesisBlock.transactions.length === 0;

        if (!correctNonce || ! correctHash || ! correctPrevHash || !correctTransactions) {
            validChain = false;
        }

        return validChain;
    }

    createWallet = async (key) => {
        const privateKey = await ed.utils.randomPrivateKey(); // 32-byte Uint8Array or string.

        const publicKey = await ed.getPublicKey(toHexString(privateKey));
        const signature = await ed.sign(key, toHexString(privateKey));
        const isSigned = await ed.verify(signature, key, publicKey);


        return {publicKey: publicKey, privateKey: signature, signed: isSigned}
    }

    accessWallet = async (publicKey, privateKey, password) => {
        return await ed.verify(privateKey, password, publicKey);
    }
}

export const blockchain = new Blockchain();