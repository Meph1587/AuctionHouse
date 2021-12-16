import {DeployConfig} from "./define-0-deploy-config";
import {deployContract} from "../../helpers/deploy"

import {
    QuestAchievements, QuestTools
} from "../../typechain";
export async function deployTools(c: DeployConfig): Promise<DeployConfig> {

    console.log(`\n --- DEPLOY QUEST ACHIEVEMENTS ---`);

    const questAchievements = await deployContract('QuestAchievements') as QuestAchievements;
    console.log(`QuestAchievements deployed to: ${questAchievements.address.toLowerCase()}`);
    c.achievements = questAchievements;

    console.log(`npx hardhat verify --network rinkeby ${questAchievements.address}`)
    

    console.log(`\n --- DEPLOY TOOLS ---`);
    

    const questTools = await deployContract('QuestTools') as QuestTools;
    console.log(`QuestTools deployed to: ${questTools.address.toLowerCase()}`);
    c.tools = questTools;
    console.log(`npx hardhat verify --network rinkeby ${questTools.address}`)


    await questTools.initialize(c.wethAddr, c.storageAddr, c.wizardsAddr);
    console.log(`QuestTools Initialized`);



    return c;
}


