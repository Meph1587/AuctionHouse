import {DeployConfig} from "./define-0-deploy-config";
import {Contract} from "ethers";

import {
    Grimoire as GR,
} from "../../typechain";

let Grimoire = require("wizard-storage/abi/Grimoire.json")
let ERC20 = require("../../abi/ERC20.json")
let ERC721 = require("../../abi/ERC721.json")

export async function connectContracts(c: DeployConfig): Promise<DeployConfig> {
    console.log(`\n --- CONNECT WIZARD STORAGE ---`);

    const grimoire = new Contract(
        c.storageAddr,
        Grimoire,
        c.ownerAcc
    ) as GR
    c.storage = grimoire
    console.log(`Grimoire connected at: ${grimoire.address.toLowerCase()}`);

    const weth = new Contract(
        c.wethAddr,
        ERC20,
        c.ownerAcc
    )
    c.weth = weth
    console.log(`ETH connected at: ${grimoire.address.toLowerCase()}`);

    const wizards = new Contract(
        c.wizardsAddr,
        Grimoire,
        c.ownerAcc
    ) as GR
    c.wizards = wizards
    console.log(`Wizards connected at: ${grimoire.address.toLowerCase()}`);

    return c;
}


