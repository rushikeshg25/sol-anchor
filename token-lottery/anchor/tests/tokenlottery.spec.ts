import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { TokenLottery } from "../target/types/token_lottery";

describe("tokenlottery", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.Tokenlottery as Program<TokenLottery>;

  it("Initialize Tokenlottery", async () => {
    await program.methods
      .initializeConfig(
        new anchor.BN(0),
        new anchor.BN(19999999999),
        new anchor.BN(1000)
      )
      .rpc();
  });
});
