#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod cruddapp {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        msg!("Journal Entry Created");
        msg!("Title: {}", title);
        msg!("Message: {}", message);
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())
    }

    pub fn update_journal_entry(
        ctx: Context<UpdateEntry>,
        _title: String,
        message: String,
    ) -> Result<()> {
        msg!("Journal Entry Updated");
        msg!("Title: {}", _title);
        msg!("Message: {}", message);
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;
        Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, _title: String) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct CreateEntry<'info> {
    #[account(
      init,
      payer = owner,
      space=8+JournalEntryState::INIT_SPACE,
      seeds=[title.as_bytes(),owner.key().as_ref()],
      bump
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
      mut,
      realloc=8+JournalEntryState::INIT_SPACE,
      realloc::zero=true,
      realloc::payer=owner,
      seeds=[title.as_bytes(),owner.key().as_ref()],
      bump)]
    pub journal_entry: Account<'info, JournalEntryState>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
      mut,
      realloc=8+JournalEntryState::INIT_SPACE,
      realloc::zero=true,
      realloc::payer=owner,
      seeds=[title.as_bytes(),owner.key().as_ref()],
      bump)]
    pub journal_entry: Account<'info, JournalEntryState>,
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    #[max_len(32)]
    pub title: String,
    #[max_len(32)]
    pub message: String,
}
