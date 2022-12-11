# proficlient
Small Node.js app that automatically claims free prizes from [the Profi app](https://www.profi.ro/loialitate) with multiple accounts.

###  Usage
Clone the repository, install the dependencies and then create a file named `usernames.json` with the following format
```js
[ // array containing username groups
    [ // first username group
        "password", // the first element is the password that will be used for the usernames below
        "407xxxxxxxx", // the usernames are the accounts' full phone numbers, but without the plus sign
        "407yyyyyyyy",
        "407zzzzzzzz",
        // ...
    ],
    
    [ // if not all the accounts use the same password, you can add a username group for every password
        // same format used in the first username group
        // ...
    ],
    
    // obviously, you can have username groups with only one username
    ["otherPassword", "407wwwwwwww"]
]
```

### Issues
For any errors you get, please try checking if the username and password is correct because this app doesn't check much. Otherwise, [create an issue](https://github.com/alextusinean/proficlient/issues/new).
