// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import Test1IDL from '../target/idl/test1.json'
import type { Test1 } from '../target/types/test1'

// Re-export the generated IDL and type
export { Test1, Test1IDL }

// The programId is imported from the program IDL.
export const TEST1_PROGRAM_ID = new PublicKey(Test1IDL.address)

// This is a helper function to get the Test1 Anchor program.
export function getTest1Program(provider: AnchorProvider) {
  return new Program(Test1IDL as Test1, provider)
}

// This is a helper function to get the program ID for the Test1 program depending on the cluster.
export function getTest1ProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Test1 program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return TEST1_PROGRAM_ID
  }
}
