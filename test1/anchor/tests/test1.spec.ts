import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Test1} from '../target/types/test1'

describe('test1', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Test1 as Program<Test1>

  const test1Keypair = Keypair.generate()

  it('Initialize Test1', async () => {
    await program.methods
      .initialize()
      .accounts({
        test1: test1Keypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([test1Keypair])
      .rpc()

    const currentCount = await program.account.test1.fetch(test1Keypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Test1', async () => {
    await program.methods.increment().accounts({ test1: test1Keypair.publicKey }).rpc()

    const currentCount = await program.account.test1.fetch(test1Keypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Test1 Again', async () => {
    await program.methods.increment().accounts({ test1: test1Keypair.publicKey }).rpc()

    const currentCount = await program.account.test1.fetch(test1Keypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Test1', async () => {
    await program.methods.decrement().accounts({ test1: test1Keypair.publicKey }).rpc()

    const currentCount = await program.account.test1.fetch(test1Keypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set test1 value', async () => {
    await program.methods.set(42).accounts({ test1: test1Keypair.publicKey }).rpc()

    const currentCount = await program.account.test1.fetch(test1Keypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the test1 account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        test1: test1Keypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.test1.fetchNullable(test1Keypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
