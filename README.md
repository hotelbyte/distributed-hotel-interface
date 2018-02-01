# DHI Browser<sup>beta</sup>

[![Join the chat at https://gitter.im/hotelbyte/DHI](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/hotelbyte/DHI?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status master branch](https://travis-ci.org/hotelbyte/distributed-hotel-interface.svg?branch=master)](https://travis-ci.org/hotelbyte/distributed-hotel-interface)


The DHI browser is the tool of choice to browse and use Ðapps.

For the DHI API see the [MISTAPI.md](MISTAPI.md).

Please note that this repository is the Electron host for the Dapp HotelByte Foundation located here: 

- Wallet, https://github.com/hotelbyte/meteor-dapp-wallet
- DHM, (Distributed Hotel Manager), https://github.com/hotelbyte/distributed-hotel-manager
- DBE (Distributed Booking Experience), https://github.com/hotelbyte/distributed-booking-experience

## Help and troubleshooting

Please check the [DHI troubleshooting guide](https://github.com/hotelbyte/distributed-hotel-interface/wiki).

Or the [Gitter Channel](https://gitter.im/hotelbyte/DHI), to connect with the community for instant help.

## Installation

If you want to install the app from a pre-built version on the [release page](https://github.com/hotelbyte/DHI/releases),
you can simply run the executeable after download.

For updating simply download the new version and copy it over the old one (keep a backup of the old one if you want to be sure).

#### Config folder
The data folder for DHI is stored in other places:

- Windows `%APPDATA%\DHI`
- macOS `~/Library/Application\ Support/DHI`
- Linux `~/.config/DHI`


## Development

For development, a Meteor server will need to be started to assist with live reload and CSS injection.
Once a DHI version is released the Meteor frontend part is bundled using the `meteor-build-client` npm package to create pure static files.

### Dependencies

To run DHI in development you need:

- [Node.js](https://nodejs.org) `v8.x` (use the prefered installation method for your OS)
- [Meteor](https://www.meteor.com/install) javascript app framework
- [Yarn](https://yarnpkg.com/) package manager
- [Electron](http://electron.atom.io/) `v1.7.10` cross platform desktop app framework
- [Gulp](http://gulpjs.com/) build and automation system

Install the latter ones via:

    $ curl https://install.meteor.com/ | sh
    $ curl -o- -L https://yarnpkg.com/install.sh | bash
    $ yarn global add electron@1.7.10
    $ yarn global add gulp

### Initialisation

Now you're ready to initialise DHI for development:

    $ git clone https://github.com/hotelbyte/distributed-hotel-interface.git
    $ cd distributed-hotel-interface
    $ yarn

To update DHI in the future, run:

    $ cd distributed-hotel-interface
    $ git pull
    $ yarn

### Run DHI

For development we start the interface with a Meteor server for autoreload etc.
*Start the interface in a separate terminal window:*

    $ cd distributed-hotel-interface/interface && meteor

In the original window you can then start DHI with:

    $ cd distributed-hotel-interface
    $ yarn dev:electron

*NOTE: client-binaries (e.g. [ghbc](https://github.com/hotelbyte/go-hotelbyte)) specified in [clientBinaries.json](https://github.com/hotelbyte/distributed-hotel-interface/blob/master/clientBinaries.json) will be checked during every startup and downloaded if out-of-date, binaries are stored in the [config folder](#config-folder)*

*NOTE: use `--help` to display available options, e.g. `--loglevel debug` (or `trace`) for verbose output*

### Run the Wallet only

Start the wallet app for development, *in a separate terminal window:*

    $ cd distributed-hotel-interface/interface && meteor

    // and in another terminal

    $ cd my/path/meteor-dapp-wallet/app && meteor --port 3050

In the original window you can then start DHI using wallet mode:

    $ cd distributed-hotel-interface
    $ yarn dev:electron --mode wallet


### Connecting to node via HTTP instead of IPC

This is useful if you have a node running on another machine, though note that
it's less secure than using the default IPC method.

```bash
$ yarn dev:electron --rpc http://localhost:30199
```


### Passing options to Ghbc

You can pass command-line options directly to Ghbc by prefixing them with `--node-` in
the command-line invocation:

```bash
$ yarn dev:electron --mode dhi --node-rpcport 19343 --node-networkid 2
```

The `--rpc` DHI option is a special case. If you set this to an IPC socket file
path then the `--ipcpath` option automatically gets set, i.e.:

```bash
$ yarn dev:electron --rpc /my/ghbc.ipc
```

...is the same as doing...


```bash
$ yarn dev:electron --rpc /my/ghbc.ipc --node-ipcpath /my/ghbc.ipc
```

### Creating a local private net

See this guide to quickly set up a local private network on your computer, thanks to Everton Fraga!:
https://gist.github.com/evertonfraga/9d65a9f3ea399ac138b3e40641accf23


### Using DHI with a privatenet

To run a private network you will need to set the IPC path, network id and data
folder:

```bash
$ yarn dev:electron --rpc ~/Library/Ethereum/ghbc.ipc --node-networkid 1234 --node-datadir ~/Library/Ethereum/privatenet
```

_NOTE: since `ipcpath` is also a DHI option you do not need to also include a
`--node-ipcpath` option._

You can also launch `ghbc` separately with the same options prior starting
DHI.


### Deployment

Our build system relies on [gulp](http://gulpjs.com/) and [electron-builder](https://github.com/electron-userland/electron-builder/).

#### Dependencies

[meteor-build-client](https://github.com/frozeman/meteor-build-client) bundles the [meteor](https://www.meteor.com/)-based interface. Install it via:

    $ npm install -g meteor-build-client

Furthermore cross-platform builds require additional [`electron-builder` dependencies](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#linux). On macOS those are:

    // windows deps
    $ brew install wine --without-x11 mono makensis

    // linux deps
    $ brew install gnu-tar libicns graphicsmagick xz

#### Generate packages

To generate the binaries for DHI run:

    $ gulp

To generate the HotelByte Wallet (this will pack the one Ðapp from https://github.com/hotelbyte/meteor-dapp-wallet):

    $ gulp --wallet

The generated binaries will be under `dist_dhi/release` or `dist_wallet/release`.


#### Options

##### platform

To build binaries for specific platforms (default: all available) use the following flags:

    // on mac
    $ gulp --win --linux --mac

    // on linux
    $ gulp --win --linux

    // on win
    $ gulp --win

##### walletSource

With the `walletSource` you can specify the Wallet branch to use, default is `master`:

    $ gulp --wallet --walletSource develop


Options are:

- `master`
- `develop`
- `local` Will try to build the wallet from [dhi/]../meteor-dapp-wallet/app

*Note: applicable only when combined with `--wallet`*

#### skipTasks

When building a binary, you can optionally skip some tasks — generally for testing purposes.

  $ gulp --mac --skipTasks=bundling-interface,release-dist

#### Checksums

Spits out the MD5 checksums of distributables.

It expects installer/zip files to be in the generated folders e.g. `dist_dhi/release`

    $ gulp checksums [--wallet]


## Testing

Tests are ran using [Spectron](https://github.com/electron/spectron/), a webdriver.io runner built for Electron.

First make sure to build DHI with:

    $ gulp

Then run the tests:

    $ gulp test

*Note: Integration tests are not yet supported on Windows.*
