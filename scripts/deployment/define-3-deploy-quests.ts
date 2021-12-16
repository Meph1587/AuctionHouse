import {DeployConfig} from "./define-0-deploy-config";
import {deployContract} from "../../helpers/deploy"

export async function deployQuests(c: DeployConfig): Promise<DeployConfig> {

    console.log(`\n --- DEPLOY QUESTS ---`);


    const baseQuest = await deployContract('BaseQuest');
    console.log(`BaseQuest deployed to: ${baseQuest.address.toLowerCase()}`);
    console.log(`npx hardhat verify --network rinkeby ${baseQuest.address}`)

    await baseQuest.initialize(c.tools.address,c.owner, c.achievements.address);
    console.log(`BaseQuest Initialized`);


    const loreQuest = await deployContract('LoreQuest');
    console.log(`LoreQuest deployed to: ${loreQuest.address.toLowerCase()}`);
    console.log(`npx hardhat verify --network rinkeby ${loreQuest.address}`)

    await loreQuest.initialize(c.tools.address,c.owner, c.achievements.address);
    console.log(`LoreQuest Initialized`);

    return c;
}


