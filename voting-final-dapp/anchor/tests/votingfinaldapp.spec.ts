import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Votingfinaldapp} from '../target/types/votingfinaldapp'

describe('votingfinaldapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Votingfinaldapp as Program<Votingfinaldapp>

  const votingfinaldappKeypair = Keypair.generate()

  it('Initialize Votingfinaldapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        votingfinaldapp: votingfinaldappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([votingfinaldappKeypair])
      .rpc()

    const currentCount = await program.account.votingfinaldapp.fetch(votingfinaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Votingfinaldapp', async () => {
    await program.methods.increment().accounts({ votingfinaldapp: votingfinaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingfinaldapp.fetch(votingfinaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Votingfinaldapp Again', async () => {
    await program.methods.increment().accounts({ votingfinaldapp: votingfinaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingfinaldapp.fetch(votingfinaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Votingfinaldapp', async () => {
    await program.methods.decrement().accounts({ votingfinaldapp: votingfinaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingfinaldapp.fetch(votingfinaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set votingfinaldapp value', async () => {
    await program.methods.set(42).accounts({ votingfinaldapp: votingfinaldappKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingfinaldapp.fetch(votingfinaldappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the votingfinaldapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        votingfinaldapp: votingfinaldappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.votingfinaldapp.fetchNullable(votingfinaldappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
