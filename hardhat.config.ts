import 'hardhat-typechain'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import 'hardhat-watcher'
import '@matterlabs/hardhat-zksync-solc'
import { subtask } from 'hardhat/config'
import { ZkSolcConfig } from '@matterlabs/hardhat-zksync-solc/dist/src/types'
import * as path from 'path'
import { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } from 'hardhat/builtin-tasks/task-names'

const CONTRACTS_USES_LIBRARIES = [
  'NonfungibleTokenPositionDescriptor.sol',
  'test/NFTDescriptorTest.sol',
];

let zksolc_config: ZkSolcConfig = {
  version: "1.3.8",
  compilerSource: "binary",
  settings: {},
};

if(process.env.NFT_DESCRIPTOR_ADDRESS) {
  zksolc_config.settings.libraries = {
    "contracts/libraries/NFTDescriptor.sol": {
      NFTDescriptor: process.env.NFT_DESCRIPTOR_ADDRESS,
    },
  }
} else {
  subtask(
      TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS,
      async (_, { config }, runSuper) => {
        const paths = await runSuper();

        return paths
            .filter((solidityFilePath: any) => {
              const relativePath = path.relative(config.paths.sources, solidityFilePath);
              return !CONTRACTS_USES_LIBRARIES.includes(relativePath);
            })
      }
  );
}

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    arbitrum: {
      url: `http://localhost:8547`,
      gas: 8000000,
    },
    zkSyncTestnet: {
      url: "https://testnet.era.zksync.dev",
      ethNetwork: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      zksync: true,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    version: '0.7.6',
    settings: {
      optimizer: {
        enabled: true,
        // will be ignored by zksolc
        runs: 1_000_000,
      },
      metadata: {
        bytecodeHash: 'none',
      },
    },
  },
  zksolc: zksolc_config,
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },
}
