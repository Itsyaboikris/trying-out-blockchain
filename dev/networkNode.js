import express from 'express';
import bodyParser from 'body-parser';
import {v4} from 'uuid';
import {blockchain} from './blockchain.js';
import axios from "axios";

const app = express();

const nodeAddress = v4().split('-').join('');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/blockchain', (req, res) => {
    res.status(200).json(blockchain);
});

app.post('/transaction', (req, res) => {
    const {newTransaction} = req.body;

    const blockIdx = blockchain.addTransactionToPendingTransaction(newTransaction);

    res.status(200).json({message: `Transaction will be added in block ${blockIdx}.`})
});

app.post('/transaction/broadcast', (req, res) => {
    const {amount, sender, recipient} = req.body;

    const newTransaction = blockchain.createNewTransaction(amount, sender, recipient);
    blockchain.addTransactionToPendingTransaction(newTransaction);

    const requests = []
    blockchain.networkNodes.forEach( networkNodeUrl => {
        requests.push(axios.post(`${networkNodeUrl}/transaction`, {
            newTransaction
        }))
    });

    Promise.all(requests).then(data => {
        res.status(200).json({message: 'Transaction created and broadcast successfully.'});
    })
});

app.get('/mine', (req, res) => {
    const lastBlock = blockchain.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = {
        transactions: blockchain.pendingTransactions,
        index: lastBlock.index + 1,
    };
    const nonce = blockchain.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = blockchain.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = blockchain.createNewBlock(nonce, previousBlockHash, blockHash);

    const requests = []
    blockchain.networkNodes.forEach( networkNodeUrl => {
        requests.push(axios.post(`${networkNodeUrl}/receive-new-block`, {
            newBlock
        }))
    });

    Promise.all(requests).then(data => {
        const requestsPromise = []
        requestsPromise.push(axios.post(`${blockchain.currentNodeUrl}/transaction/broadcast`, {
            amount: blockchain.reward,
            sender: "0000",
            recipient: nodeAddress
        }));

        return Promise.all(requestsPromise);
    }).then( data => {
        res.status(200).json({message: "New block mined and broadcast successfully", block: newBlock});
    });
});

app.post('/receive-new-block', (req, res) => {
    const {newBlock} = req.body;
    const lastBlock = blockchain.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock.index + 1 === newBlock.index;

    if (correctHash && correctIndex) {
        blockchain.chain.push(newBlock);
        blockchain.pendingTransactions = [];
        res.status(200).json({message:"New block received and accepted", newBlock: newBlock});
    } else {
        res.status(500).json({message:"New block rejected"});
    }
});

app.post('/register-and-broadcast-node', (req, res) => {
    try {
        const {url} = req.body;
        if ((blockchain.networkNodes.indexOf(url) === -1) && (blockchain.currentNodeUrl !== url)) blockchain.networkNodes.push(url);

        const requests = []
        blockchain.networkNodes.forEach( async (ip) => {
            requests.push(
                axios.post(`${ip}/register-node`, {
                    url
                })
            );
        })

        Promise.all(requests).then( data => {
            return axios.post(`${url}/register-node-bulk`, {
                allNetworkNodes: [...blockchain.networkNodes, blockchain.currentNodeUrl]
            })
        }).then(data => {
            res.status(200).json({message: 'New node reqistered with network successfully'});
        })
    } catch (e) {
        res.status(500).send(e)
    }

});

app.post('/register-node', (req, res) => {
    const {url} = req.body;

    const notPresent = blockchain.networkNodes.indexOf(url) === -1;
    const notCurrentNode = blockchain.currentNodeUrl !== url;

    if (notPresent && notCurrentNode) {
        console.log("not here")
        blockchain.networkNodes.push(url);
    }

    res.status(200).json({message:"New node registered successfully."});
});

app.post('/register-node-bulk', (req, res) => {
    const {allNetworkNodes} = req.body;

    allNetworkNodes.forEach( url => {
        const notPresent = blockchain.networkNodes.indexOf(url) === -1;
        const notCurrentNode = blockchain.currentNodeUrl !== url;
        
        if (notPresent && notCurrentNode) {
            blockchain.networkNodes.push(url);
        }
    });

    res.status(200).json({message: "All nodes registered successfully"});
});

app.get('/consensus', (req, res) => {
    const requests = []
    blockchain.networkNodes.forEach( networkNodeUrl => {
        requests.push(axios.get(`${networkNodeUrl}/blockchain`, {
        }));
    });

    Promise.all(requests).then(blockchains => {
        const currentChainLength = blockchain.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;

        blockchains.forEach(blkchn => {
            if (blkchn.data.chain.length > maxChainLength) {
                maxChainLength = blkchn.data.chain.length;
                newLongestChain = blkchn.data.chain;
                newPendingTransactions = blkchn.data.pendingTransactions;
            }
        });

        if (!newLongestChain || (newLongestChain && !blockchain.chainIsValid(newLongestChain))) {
            res.status(200).json({
                message: "Current chain has not been replaced",
                chain: blockchain.chain
            });
        } else if (newLongestChain && blockchain.chainIsValid(newLongestChain)) {
            blockchain.chain = newLongestChain;
            blockchain.pendingTransactions = newPendingTransactions;

            res.status(200).json({
                message: "Current chain has been replaced",
                chain: blockchain.chain
            });
        }
    }).catch(e => console.log(e));
});

app.get('/block/:blockHash', (req, res) => {
    const {blockHash} = req.params;

    let found = blockchain.getBlock(blockHash);

    if (found) {
        res.status(200).json({
            message: "Block found",
            block: found
        })
    } else {
        res.status(500).json({
            message: "Block not found",
            block: null
        })
    }
});

app.get('/transaction/:transactionId', (req, res) => {
    const {transactionId} = req.params;

    let found = blockchain.getTransaction(transactionId);

    if (found) {
        res.status(200).json({
            message: "Transaction found",
            transaction: found.transaction,
            state: found.state
        })
    } else {
        res.status(500).json({
            message: "Transaction not found",
            transaction: null
        })
    }
});

app.get('/address/:address', (req, res) => {
    const {address} = req.params;

    let found = blockchain.getAddressData(address);

    if (found) {
        res.status(200).json({
            message: "Address data found",
            addressTransactions: found. addressTransactions,
            balance: found.balance
        })
    } else {
        res.status(500).json({
            message: "Address data not found",
            addressTransactions: [],
            balance: 0
        })
    }
});

const port = process.argv[2];
app.listen(port, () => console.log(`Server running on port ${port}`));