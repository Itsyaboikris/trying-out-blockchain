# Trying Out Blockchain

Javascript project on blockchain technology. It allows for creating new blocks, hashing and mining blocks.
It also supports transactions and proof of work and uses express js to access these function via rest api endpoints.

Running Locally 🖥️
1. Clone repo using the following command:
    ```shell script
    git clone <url> 
    ```
2. cd in project directory
4. Install dependencies
    ```shell script
    npm install
    ```
5. Run project 🎉
    ```shell script
    npm start
    ```

## Build Steps ⚙

This project was built with NodeJs -v 14.xx. Packages used includes:

    1. Body-parser 3.7.1
    2. Axios ^0.23.1
    3. Nodemon ^2.0.13
    4. Noble-ed25519 ^1.2.6
    5. sha256 ^0.2.0
    6. uuid ^8.3.2
    
The code for this project can be found in the following files:

- `blockchain.js`- BlockChain Logic
- `networkNode.js`- API  (Endpoints)
- `utils.js`- Utility Functions
- `test.js`- Test File