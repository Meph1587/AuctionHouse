
import {deployConfig} from "./deployment/define-0-deploy-config";
import {connectContracts} from "./deployment/define-1-connect-contracts";
import {deployTools} from "./deployment/define-2-deploy-tools";
import {deployQuests} from "./deployment/define-3-deploy-quests";
import {mintQuests} from "./deployment/define-4-mint-quests";


deployConfig(process.env.DEPLOYER_ADDRESS)
.then(c => connectContracts(c))
.then(c => deployTools(c))
.then(c => deployQuests(c))
//.then(c => mintQuests(c))
.catch(error => {
    console.error(error);
    process.exit(1);
});


