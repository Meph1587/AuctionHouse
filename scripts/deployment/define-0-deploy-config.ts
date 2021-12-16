import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import {BigNumber, Contract, Signer} from "ethers";
import { impersonateAccount, getAccount} from "../../helpers/accounts";


import {
    QuestAchievements,
    WizardsMock,
    Grimoire,
    QuestTools
} from "../../typechain";

export async function deployConfig(owner:string): Promise<DeployConfig> {

    const storageAddr = '0x11398bf5967cd37bc2482e0f4e111cb93d230b05'

    const wethAddr = '0x11398bf5967cd37bc2482e0f4e111cb93d230b05'

    const wizardsAddr = '0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42'


    let account;
    try{
        account = await getAccount(owner)
    }catch{
        account = await impersonateAccount(owner)
    }
    return new DeployConfig(owner, account, storageAddr, wethAddr, wizardsAddr)
}

export class DeployConfig {
    public owner: string;
    public ownerAcc: Signer;
    public storage?: Grimoire;
    public storageAddr: string;
    public weth?: Contract;
    public wethAddr: string;
    public wizards?: Contract;
    public wizardsAddr: string;
    public merkleTree?: any;
    public achievements?: QuestAchievements;
    public tools?:QuestTools;

    constructor(owner: string, ownerAcc: Signer, storageAddr:string, wethAddr:string, wizardsAddr:string)
        {
            this.owner = owner;
            this.ownerAcc = ownerAcc ;
            this.storageAddr = storageAddr;
            this.wethAddr = wethAddr;
            this.wizardsAddr = wizardsAddr;
        }
}