#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod votingfinaldapp {
    use super::*;

    pub fn initialize(_ctx: Context<InitializePoll>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + Votingfinaldapp::INIT_SPACE,
  payer = payer
  )]
    pub votingfinaldapp: Account<'info, Votingfinaldapp>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct PollAccount {
    #[max_len(32)]
    pub poll_name: String,
    #[max_len(280)]
    pub poll_description: String,
    pub poll_voting_start: u64,
    pub poll_voting_end: u64,
    pub poll_option_index: u64,
}

#[account]
#[derive(InitSpace)]
pub struct CandidateAccount {
    #[max_len(32)]
    pub candidate_name: String,
    pub candidate_votes: u64,
}

#[error_code]
pub enum Error {
    #[msg("Voting has not Started yet")]
    VotingNotStarted,

    #[msg("Voting has ended")]
    VotingEnded,
}
