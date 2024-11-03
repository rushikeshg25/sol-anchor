// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SocialmediadappIDL from '../target/idl/socialmediadapp.json'
import type { Socialmediadapp } from '../target/types/socialmediadapp'

// Re-export the generated IDL and type
export { Socialmediadapp, SocialmediadappIDL }

// The programId is imported from the program IDL.
export const SOCIALMEDIADAPP_PROGRAM_ID = new PublicKey(SocialmediadappIDL.address)

// This is a helper function to get the Socialmediadapp Anchor program.
export function getSocialmediadappProgram(provider: AnchorProvider) {
  return new Program(SocialmediadappIDL as Socialmediadapp, provider)
}

// This is a helper function to get the program ID for the Socialmediadapp program depending on the cluster.
export function getSocialmediadappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Socialmediadapp program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return SOCIALMEDIADAPP_PROGRAM_ID
  }
}
