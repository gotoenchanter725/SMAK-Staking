# Staking dashboard
## Set up the Florence net wallet
1. Install the Temple wallet extension on your browser https://templewallet.com/
2. Import the faucet account `tz1asiz9ZzYjzFJxM91gD5JUnimQft8NWn3o` with the `tz1asiz9ZzYjzFJxM91gD5JUnimQft8NWn3o.json` from the config directory.

To do so:
1. Go to your Temple wallet
2. select "Florence Network"
3. Open your settings. 
4. Select "import account"
5. Go to "Faucet file" and drop down the json file.

You're ready to go!

### Required libraries
Node 14 or higher is required to run the originate function. 

#### Install node on MAC
1. Go to https://nodejs.org/en/download/ and choose "macOS Installer".
2. Follow the instructions on the wizard. 
3. Once it is complete, to check that the installation was successful, run:

``` bash
node -v
npm -v
```

#### Install node on Linux
1. Open your terminal, and run:
``` bash
sudo apt update
sudo apt install nodejs npm
```

2. Once it is complete, to check that the installation was successful, run:

``` bash
node -v
npm -v
```


### Install dependencies
1. Go to your project directory
``` bash
cd SmartLink-ICO
```
2. To install the dependencies, run:
``` bash
npm install
```

## Run the project!
To run the project, run `npm run serve` in your terminal

