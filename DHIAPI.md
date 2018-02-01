# DHI API

DHI provides an API for dapp developers to use special features only available in DHI.

## Note for dapp developers

To make your dapp compatible with other browsers, it is recommended that you check the `dhi` object before you use it:

```js
if(typeof dhi !== 'undefined') {
    ...
}
```

You have three different possibilities to use `web3`:

```js
// 1. simply use it: web3 comes already defined
web3

// 2. optionally use web3 from DHI or load if outside of DHI
if(typeof web3 === 'undefined')
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// 3. always use web3 provided by the dapp ("Web3" won't be supplied by DHI), but the provider from DHI
if(typeof web3 !== 'undefined')
  web3 = new Web3(web3.currentProvider);
else
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
```

## API


- [dhi.platform](#dhiplatform)
- [dhi.requestAccount](#dhirequestaccountcallback)(callback)
- [dhi.menu](#dhimenu)
- [dhi.menu.add](#dhimenuaddid-options-callback)([id,] options, callback)
- [dhi.menu.clear](#dhimenuclear)()
- [dhi.menu.remove](#dhimenuremoveid)(id)
- [dhi.menu.select](#dhimenuselectid)(text)
- [dhi.menu.setBadge](#dhimenusetbadgetext)(text)
- [dhi.menu.update](#dhimenuupdateid--options--callback)(id [, options] [, callback])
- [dhi.sounds](#dhisounds)
- [dhi.sounds.bip](#dhisoundsbip)()
- [dhi.sounds.bloop](#dhisoundsbloop)()
- [dhi.sounds.invite](#dhisoundsinvite)()


### dhi.platform

Returns the current platform, dhi is running on:

- `darwin` (Mac OSX)
- `win32` (Windows)
- `linux` (Linux)


***

### dhi.requestAccount(callback)

Asks the user to provide, or create a new account.

#### Parameters

1. `Function` The callback to be called with the new address as the second parameter.

#### Example

```js
dhi.requestAccount(function(e, address){
    console.log('Added new account', address);
});
```

***

### dhi.menu

Provides functionality to control the sub menu of your dapp, when its added to the sidebar.

***

### dhi.menu.add([id,] options, callback)

Adds/Updates a sub menu entry, which is placed below you dapp button in the sidebar.

#### Parameters

1. `String` **optional** and id string to identify your sub menu entry when updating.
2. `Object` The menu options:
    - `name` (`String`): The name of the sub menu button.
    - `badge` (`String|null`) **optional**: The badge text for the sub menu button, e.g. `50`.
    - `position` (`Number`) **optional**: The position of the submenu button, `1` is on the top.
    - `selected` (`Boolean`) **optional**: Whether or not this sub menu entry is currently selected.
3. `Function` **optional**: The callback to be called when the sub menu entry is clicked.

#### Minimal example

```js
dhi.menu.add({name: 'My account'});
```

#### Full example

```js
dhi.menu.add('tkrzU', {
    name: 'My Meny Entry',
    badge: 50,
    position: 1,
    selected: true
}, function(){
    // Redirect
    window.location = 'http://domain.com/send';
    // Using history pushstate
    history.pushState(null, null, '/my-entry');
    // In Meteor iron:router
    Router.go('/send');
})
```

***

### dhi.menu.clear()

Removes all sub menu entries. You can use this when you reload your app,
to clear up incorrect menu entries, which might have been lost since the last session.

#### Parameters

None

***

### dhi.menu.remove(id)

Removes a sub menu entry.

#### Parameters

1. `String` and id string to identify your sub menu.

***

### dhi.menu.select(id)

Selects the respective sub menu entry.

#### Parameters

1. `String` the sub menu entry identifier.

***

### dhi.menu.setBadge(text)

Sets the main badge of your dapp, right below your dapps menu button.

#### Parameters

1. `String` the string used as the badge text.

***

### dhi.menu.update(id, [, options] [, callback])

Works like `dhi.menu.add()`, but only the `id` parameter is required.

#### Parameters

1. `String` and id string to identify your sub menu entry.
2. `Object` The menu options:
    - `name` (`String`): (optional) The name of the sub menu button.
    - `badge` (`String|null`): (optional) The badge text for the sub menu button, e.g. `50`.
    - `position` (`Number`): (optional) The position of the submenu button, `1` is on the top.
    - `selected` (`Boolean`): (optional) Whether or not this sub menu entry is currently selected.
3. `Function` (optional) The callback to be called when the sub menu entry is clicked.

#### Example

```js
dhi.menu.update('tkrzU', {
    badge: 50,
    position: 2,
})
```

***

### dhi.sounds

Provides a list of sounds.

***

### dhi.sounds.bip()

Makes a bip sound.

#### Parameters

None

***


### dhi.sounds.bloop()

Makes a bloop sound.

#### Parameters

None

***

### dhi.sounds.invite()

Makes an invite sound.

#### Parameters

None

***


