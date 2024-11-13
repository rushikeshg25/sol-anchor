import { Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BankrunProvider } from "anchor-bankrun";
import { createMint, TOKEN_PROGRAM_ID, mintTo } from "@solana/spl-token";
import { BN, Program } from "@coral-xyz/anchor";
import IDL from "../target/idl/tokenvesting.json";

import {
  startAnchor,
  Clock,
  BanksClient,
  ProgramTestContext,
} from "solana-bankrun";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { Vesting } from "anchor/target/types/vesting";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

describe("bankrun Vesting Contract tests", () => {
  const companyName = "Company";
  let beneficiary: Keypair;
  let vestingAccountKey: PublicKey;
  let treasuryTokenAccount: PublicKey;
  let employeeAccount: PublicKey;
  let provider: BankrunProvider;
  let program: Program<Vesting>;
  let banksClient: BanksClient;
  let employer: Keypair;
  let mint: PublicKey;
  let beneficiaryProvider: BankrunProvider;
  let program2: Program<Vesting>;
  let context: ProgramTestContext;
  beforeAll(async () => {
    beneficiary = new anchor.web3.Keypair();
    context = await startAnchor(
      "",
      [{ name: "vesting", programId: new PublicKey(IDL.address) }],
      [
        {
          address: beneficiary.publicKey,
          info: {
            lamports: 1_000_000_000,
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: false,
          },
        },
      ]
    );
    provider = new BankrunProvider(context);
    anchor.setProvider(provider);
    program = new Program<Vesting>(IDL as Vesting, provider);
    banksClient = context.banksClient;
    employer = provider.wallet.payer;

    //@ts-ignore
    mint = await createMint(banksClient, employer, employer.publicKey, null, 2);

    beneficiaryProvider = new BankrunProvider(context);
    beneficiaryProvider.wallet = new NodeWallet(beneficiary);

    program2 = new Program<Vesting>(IDL as Vesting, beneficiaryProvider);

    //PDA
    [vestingAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(companyName)],
      program.programId
    );

    [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting_treasury"), Buffer.from(companyName)],
      program.programId
    );

    [employeeAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee_vesting"),
        beneficiary.publicKey.toBuffer(),
        vestingAccountKey.toBuffer(),
      ],
      program.programId
    );
  });

  it("create vesting Account", async () => {
    const tx = await program.methods
      .createVestingAccount(companyName)
      .accounts({
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        signer: employer.publicKey,
      })
      .rpc({ commitment: "confirmed" });
  });

  it("should fund the treasury token account", async () => {
    const amount = 10_000 * 10 ** 9;
    const mintTx = await mintTo(
      //@ts-ignore
      banksClient,
      employer,
      mint,
      treasuryTokenAccount,
      employer,
      amount
    );
    console.log("Mint to Treasury Transaction Signature:", mintTx);
  });

  it("create Employee Account", async () => {
    const tx2 = await program.methods
      .createEmployeeVesting(new BN(0), new BN(100), new BN(100), new BN(0))
      .accounts({
        beneficiary: beneficiary.publicKey,
        vestingAccount: vestingAccountKey,
      })
      .rpc({ commitment: "confirmed" });
    console.log("Employee account", employeeAccount.toBase58());
  });

  // it("Employee can claim tokens", async () => {
  //   await new Promise((resolve) => setTimeout(resolve, 1000));

  //   const currentClock = await banksClient.getClock();
  //   context.setClock(
  //     new Clock(
  //       currentClock.slot,
  //       currentClock.epochStartTimestamp,
  //       currentClock.epoch,
  //       currentClock.leaderScheduleEpoch,
  //       1000n
  //     )
  //   );

  //   const tx3 = await program2.methods
  //     .claimTokens(companyName)
  //     .accounts({
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     })
  //     .rpc({ commitment: "confirmed" });
  //   console.log("Claim Tokens transaction signature", tx3);
  // });
});
