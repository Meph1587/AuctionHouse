import {HardhatUserConfig, task} from 'hardhat/config';
import * as config from './config';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-abi-exporter';
import 'hardhat-contract-sizer';
import '@typechain/hardhat';
import 'solidity-coverage';
import 'hardhat-gas-reporter';

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(await account.getAddress());
    }
});

// Some of the settings should be defined in `./config.js`.
// Go to https://hardhat.org/config/ for the syntax.
const cfg: HardhatUserConfig = {
    solidity: {
        version: '0.8.6',
        settings: {
            optimizer: {
                enabled: false,
                runs: 300,
            },
        },
    },

    

    defaultNetwork: 'hardhat',

    networks: config.networks,
    etherscan: config.etherscan,

    abiExporter: {
        except: ['AuctionToken, WethMock'],
        clear: true,
        flat: false,
    },

    gasReporter: {
        enabled: (process.env.REPORT_GAS) ? true : false,
        gasPrice: 70
    },


    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },

};

export default cfg;
