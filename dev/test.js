import {blockchain} from "./blockchain.js";


blockchain.chain.push({
        "index": 1,
        "timestamp": 1634785205123,
        "transactions": [],
        "nonce": 0,
        "hash": "0",
        "previousBlockHash": "0"
    },
    {
        "index": 2,
        "timestamp": 1634785220266,
        "transactions": [],
        "nonce": 18140,
        "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
        "previousBlockHash": "0"
    },
    {
        "index": 3,
        "timestamp": 1634785237101,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "0000",
                "recipient": "6f0b6abb6aef4c36b4c7a14d049e43ec",
                "transactionId": "5f1a1c4edbb442c88e079832cb3e0a0d"
            },
            {
                "amount": 2,
                "sender": "me",
                "recipient": "you",
                "transactionId": "da691757fe754f0bb1282eaaf56b4b23"
            },
            {
                "amount": 2,
                "sender": "me",
                "recipient": "you",
                "transactionId": "b631317afdc3483d9a2ec9afde2db634"
            },
            {
                "amount": 20,
                "sender": "you",
                "recipient": "me",
                "transactionId": "25bad26412c1479e8c66054ff7af6940"
            }
        ],
        "nonce": 353,
        "hash": "00005219581f873cd06a3c7336ba441348e47202169bf434cc46096a95eb7b58",
        "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
    },
    {
        "index": 4,
        "timestamp": 1634785237998,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "0000",
                "recipient": "6f0b6abb6aef4c36b4c7a14d049e43ec",
                "transactionId": "b42badc3b37d4453ab31b0147ca27125"
            }
        ],
        "nonce": 671,
        "hash": "000008e782dfe33a8331b8f751f1639293deedaa14ee785a55eada561ff351bc",
        "previousBlockHash": "00005219581f873cd06a3c7336ba441348e47202169bf434cc46096a95eb7b58"
    },
    {
        "index": 5,
        "timestamp": 1634785248606,
        "transactions": [
            {
                "amount": 12.5,
                "sender": "0000",
                "recipient": "6f0b6abb6aef4c36b4c7a14d049e43ec",
                "transactionId": "039539eb910345d7be19abc2e46576ce"
            },
            {
                "amount": 20,
                "sender": "you",
                "recipient": "he",
                "transactionId": "99ed8995e6d94d9894b7f16421819c94"
            }
        ],
        "nonce": 159938,
        "hash": "00007013049c465179e37ca27f4aff04bbc4360f39e86e87a37d421ba529d667",
        "previousBlockHash": "000008e782dfe33a8331b8f751f1639293deedaa14ee785a55eada561ff351bc"
    })

blockchain.pendingTransactions.push({
        "amount": 20,
        "sender": "she",
        "recipient": "he",
        "transactionId": "15a287cc56c64d7293e5d5beb71d5f53"
    },
    {
        "amount": 20,
        "sender": "she",
        "recipient": "them",
        "transactionId": "1677dc2ee0a54978b19b8d11e96aee77"
    })

console.log(await blockchain.createWallet("test"))

console.log(await blockchain.accessWallet("994245c8af5cb032f74d2da7b5be19ef83d66058a6a7145aee92f3475122badb", "3901123217eed905528183e05a8fa86477c0f214643daa8c79105beaa1f12788117e8446cfaf9cbbfc4b65b5be98a182798b2a612b3d8985fa168f4ef25a5507","test"))


