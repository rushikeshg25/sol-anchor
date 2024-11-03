import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Socialmediadapp} from '../target/types/socialmediadapp'

describe('socialmediadapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Socialmediadapp as Program<Socialmediadapp>

  const socialmediadappKeypair = Keypair.generate()

  it('Initialize Socialmediadapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        socialmediadapp: socialmediadappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([socialmediadappKeypair])
      .rpc()

    const currentCount = await program.account.socialmediadapp.fetch(socialmediadappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Socialmediadapp', async () => {
    await program.methods.increment().accounts({ socialmediadapp: socialmediadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.socialmediadapp.fetch(socialmediadappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Socialmediadapp Again', async () => {
    await program.methods.increment().accounts({ socialmediadapp: socialmediadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.socialmediadapp.fetch(socialmediadappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Socialmediadapp', async () => {
    await program.methods.decrement().accounts({ socialmediadapp: socialmediadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.socialmediadapp.fetch(socialmediadappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set socialmediadapp value', async () => {
    await program.methods.set(42).accounts({ socialmediadapp: socialmediadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.socialmediadapp.fetch(socialmediadappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the socialmediadapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        socialmediadapp: socialmediadappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.socialmediadapp.fetchNullable(socialmediadappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
