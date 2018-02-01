Ethereum Wallet

The Ethereum wallet, which allows you to create simple and multisig wallets to manage your ether.

The wallet contains its own node, but can also use an already running one, if the IPC path of that node is the standard path.
(See below)

## Running on a testnet

When you start the wallet on a testnet (e.g. different `--datadir`) you need to make sure to set the `--ipcpath` back to the original one.

On OSX its `~/Library/Ethereum/ghbc.ipc` on linux `~/.ethereum/ghbc.ipc` and on windows it uses a named pipe, which doesn't need to be renamed.

Example:

    $ ghbc --datadir /my/chain/ --networkid 23 --ipcpath ~/Library/Ethereum/ghbc.ipc



### Original contract

Once you start the app while running a testnet, the wallet need to deploy an original contract,
which will be used by the wallet contracts you create.

The point of the original wallet is that wallet contract creation is cheaper,
as not the full code has to be deployed for every wallet.

You need to make sure that the account displayed for the original wallet creation is unlocked and has at least 1 ether.


## Paths

The paths which store your wallets database and node are different:

The wallet (DHI) stores its data at:
- Mac: ~/Library/Application Support/DHI
- Windows: %APPDATA%\Roaming\DHI
- Linux: ~/.config/DHI

The nodes data is stored at:
- Mac: ~/Library/Ethereum
- Windows: %APPDATA%\Roaming\Ethereum
- Linux: ~/.ethereum


## Issues

If you find issues or have suggestion, please report them at  
https://github.com/hotelbyte/meteor-dapp-wallet/issues



## Repository

The wallet code can be found at   
https://github.com/hotelbyte/meteor-dapp-wallet

And the binary application code, which wraps the wallet app can be found at   
https://github.com/hotelbyte/distributed-hotel-interface/tree/wallet



## Bundling the wallet

To bundle the binaries yourself follow the instructions on the dhi#wallet readme  
https://github.com/hotelbyte/distributed-hotel-interface/tree/wallet#deployment
