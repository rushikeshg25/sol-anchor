#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod basic {
    use super::*;
    pub fn Initialize_config(
        ctx: Context<Initialize>,
        start_time: i64,
        end_time: i64,
        ticket_price: u64,
    ) -> Result<()> {
        *ctx.accounts.token_lottery = TokenLottery {
            winner: 0,
            winner_chosen: false,
            start_time,
            end_time,
            lottery_pot_amount: 0,
            total_tickets: 0,
            ticket_price,
            authority: ctx.accounts.payer.key(),
            randomness_account: Pubkey::default(),
            bump: ctx.bumps.token_lottery,
        };
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        payer=payer,
        space=8+TokenLottery::INIT_SPACE,
        seeds=[b"token_lottery".as_ref()],
        bump
    )]
    pub token_lottery: Account<'info, TokenLottery>,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct TokenLottery {
    pub bump: u8,
    pub winner: u64,
    pub winner_chosen: bool,
    pub start_time: i64,
    pub end_time: i64,
    pub lottery_pot_amount: u64,
    pub total_tickets: u64,
    pub ticket_price: u64,
    pub authority: Pubkey,
    pub randomness_account: Pubkey,
}
