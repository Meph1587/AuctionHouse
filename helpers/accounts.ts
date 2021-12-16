import {ethers, network} from 'hardhat';
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Signer } from 'ethers';

export async function getAccount(accountAddressToSearch: string): Promise<SignerWithAddress> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    for (let signer of signers) {
        const signerAddress: string = await signer.getAddress();
        if (signerAddress === accountAddressToSearch) {
            return signer;
        }
    }
    throw new Error('Could not find the required address in the Signers');
}

export async function impersonateAccount(accountAddressToSearch: string): Promise<Signer> {
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [accountAddressToSearch]}
      )
    const signer = await ethers.provider.getSigner(accountAddressToSearch)
    return signer;
   
}