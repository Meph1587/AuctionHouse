import {DeployConfig} from "./define-0-deploy-config";
import {deployContract} from "../../helpers/deploy"

import {QuestAchievements} from '../../typechain';
import { randomInt } from "crypto";

import{ethers} from "hardhat"
import { base64, formatBytes32String } from "ethers/lib/utils";
import { fromAscii, fromUtf8, toUtf8 } from "ethjs-util";

export async function mintQuests(c: DeployConfig): Promise<DeployConfig> {

    console.log(`\n --- MINT CUSTOM QUESTS ---`);

    let user = (await ethers.getSigners())[0]

    let token = c.achievements as QuestAchievements;

    await token.setMintingAllowance(user.address, true)
    console.log(`Minting Allowance set`)

    await token.mint(user.address, 
        "The Forging of the Forgotten Quests at the Codemancer Castle",
        "Mephistopheles",
        0,
        86400 *63,
        false
    )
    console.log(`Id 0 minted`)

    for(let i=1; i<15; i++){
        await token.connect(user).mint(user.address, 
            "The Forging of the Forgotten Quests at the Codemancer Castle",
            "A Generous Wizard",
            0,
            86400 * 3,
            false
        )
    }

    for(let i=0; i < 15; i++){
        let data = await token.tokenURI(i)
        console.log("\n",i, data)
    }

    console.log(`\n --- MINT RANDOM QUESTS ---`);

    for(let i=15; i<30; i++){
        await token.connect(user).mint(user.address, 
            await token.getName(i),
            "Alessar of the Keep",
            randomInt(1800),
            86400 * 3,
            i%5==0
        )
    }

    for(let i=15; i < 30; i++){
        let data = await token.tokenURI(i)
        console.log("\n",i, data)
    }

    return c;
}


