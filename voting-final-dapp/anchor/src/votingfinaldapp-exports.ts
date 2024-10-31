// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VotingfinaldappIDL from '../target/idl/votingfinaldapp.json'
import type { Votingfinaldapp } from '../target/types/votingfinaldapp'

// Re-export the generated IDL and type
export { Votingfinaldapp, VotingfinaldappIDL }

// The programId is imported from the program IDL.
export const VOTINGFINALDAPP_PROGRAM_ID = new PublicKey(VotingfinaldappIDL.address)

// This is a helper function to get the Votingfinaldapp Anchor program.
export function getVotingfinaldappProgram(provider: AnchorProvider) {
  return new Program(VotingfinaldappIDL as Votingfinaldapp, provider)
}

// This is a helper function to get the program ID for the Votingfinaldapp program depending on the cluster.
export function getVotingfinaldappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Votingfinaldapp program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return VOTINGFINALDAPP_PROGRAM_ID
  }
}
