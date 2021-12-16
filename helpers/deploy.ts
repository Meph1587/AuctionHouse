import { Contract, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';

export async function deployContract (name: string, args?: Array<any>): Promise<Contract> {
    const factory: ContractFactory = await ethers.getContractFactory(name);
    const ctr: Contract = await factory.deploy(...(args || []));
    await ctr.deployed();

    return ctr;
}

