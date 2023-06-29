import 'hardhat-typechain'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import '@matterlabs/hardhat-zksync-solc'
import '@matterlabs/hardhat-zksync-verify'
import { subtask } from 'hardhat/config'
import * as path from 'path'
import { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } from 'hardhat/builtin-tasks/task-names'

const NFT_DESCRIPTOR_PATH = 'contracts/libraries/NFTDescriptor.sol'
const NFT_DESCRIPTOR_NAME = 'NFTDescriptor'
const CONTRACTS_USES_NFT_DESCRIPTOR = [
  'NonfungibleTokenPositionDescriptor.sol',
  'test/NFTDescriptorTest.sol',
]

subtask(
  TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS,
  async (_, { config }, runSuper) => {
    const paths = await runSuper()

    if (config.zksolc.settings.libraries !== undefined) {
      if (config.zksolc.settings.libraries[NFT_DESCRIPTOR_PATH] !== undefined) {
        if (config.zksolc.settings.libraries[NFT_DESCRIPTOR_PATH][NFT_DESCRIPTOR_NAME] !== undefined) {
          return paths;
        }
      }
    }
    return paths
      .filter((solidityFilePath: any) => {
        const relativePath = path.relative(config.paths.sources, solidityFilePath)
        return !CONTRACTS_USES_NFT_DESCRIPTOR.includes(relativePath)
      })
  }
)

export default {
  networks: {
    zkSyncLocalhost: {
      url: 'http://localhost:3050',
      ethNetwork: 'http://localhost:8545',
      zksync: true,
    },
    zkSyncTestnet: {
      url: 'https://testnet.era.zksync.dev',
      ethNetwork: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      zksync: true,
      verifyURL: 'https://zksync2-testnet-explorer.zksync.dev/contract_verification'
    },
    zkSyncMainnet: {
      url: 'https://mainnet.era.zksync.io',
      ethNetwork: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      zksync: true,
      verifyURL: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification'
    },
  },
  defaultNetwork: 'zkSyncLocalhost',
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
        runs: 1_000_000,
      },
      metadata: {
        bytecodeHash: 'none',
      },
    },
  },
  zksolc: {
    version: "1.3.12",
    compilerSource: "binary",
    settings: {
      metadata: {
        bytecodeHash: 'none',
      },
    },
  },
  mocha: {
    timeout: 100000000
  },
}
