#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

const ANCHOR_DISCRIMINATOR: usize = 8;

#[program]
pub mod tokenvesting {
    use super::*;

    pub fn create_vesting_account(ctx: Context<CreateVestingAccount>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateVestingAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct VestingAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub treasury_token_account: Pubkey,
    #[max_len(50)]
    pub company_name: String,
    pub treasury_bump: u8,
    pub bump: u8,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct EmployeeAccount {
    pub beneficiary: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub total_amount: i64,
    pub total_withdrawal: i64,
    pub cliff_time: i64,
    pub vesting_account: Pubkey,
    pub bump: u8,
}
