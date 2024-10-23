#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod voting {
    use super::*;

    pub fn inititalize_poll(
        ctx: Context<InititalizePoll>,
        poll_id: u32,
        poll_start_time: u64,
        poll_end_time: u64,
    ) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id:u64)]
pub struct InititalizePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space=8+Poll::INIT_SPACE,
        seeds=[poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub poll: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(280)]
    pub description: String,
    pub poll_start_time: u64,
    pub poll_end_time: u64,
    pub candidate_amount: u64,
}
