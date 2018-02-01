# How to Contribute

## Issues / Bug reports

**Prior to submitting, please search -and read- _both_ open and closed issues -as _it_ may already exist.**

To help improve DHI (_DHI Wallet_), please include the following:

- What do you run?  (_Binary version from [releases](https://github.com/hotelbyte/distributed-hotel-interface/releases) or a development version from the [commandline](https://github.com/distributed-hotel-interface/dhi#run-dhi)_)
- Which version do you use? (_Check the `VERSION` file in the DHI folder_)
- What OS you're on?

If applicable:

- Log file (Linux: `~/.config/DHI/*.log`, Windows: `%APPDATA%/Roaming/DHI/*.log`, MacOSX: `~/Library/Application Support/DHI/*.log`)
- Screenshot (for GUI related issues)


## Pull Requests

If you want to make a PR please make sure you add a understandable description of what it is you're adding/changing/fixing.

For formatting we use 4 *spaces* as indentation.

If you add any modules or files, please give them a module description and or a class description:

```
/**
The IPC provider backend filter and tunnel all incoming request to the IPC ghbc bridge.

@module ipcProviderBackend
*/

/**
DHI API

Provides an API for all dapps, which specifically targets features from the DHI browser

@class dhi
@constructor
*/
```

