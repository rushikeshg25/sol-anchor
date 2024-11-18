#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::metadata::{
    create_master_edition_v3, create_metadata_accounts_v3,
    mpl_token_metadata::types::{CollectionDetails, Creator, DataV2},
    set_and_verify_sized_collection_item, sign_metadata, CreateMasterEditionV3,
    CreateMetadataAccountsV3, Metadata, MetadataAccount, SetAndVerifySizedCollectionItem,
    SignMetadata,
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};
use switchboard_on_demand::accounts::RandomnessAccountData;
declare_id!("75QZtVPkNxku1hHt9p86rT5pjbkWw8YTsJiD5jZEseXg");

#[constant]
pub const NAME: &str = "Solana Lottery Ticket";
#[constant]
pub const URI: &str = "Token Lottery";
#[constant]
pub const SYMBOL: &str = "TKT";

#[program]
pub mod token_lottery {
    use super::*;
    pub fn Initialize_config(
        ctx: Context<Initialize>,
        start_time: i64,
        end_time: i64,
        ticket_price: u64,
    ) -> Result<()> {
        ctx.accounts.token_lottery.bump = ctx.bumps.token_lottery;
        ctx.accounts.token_lottery.start_time = start_time;
        ctx.accounts.token_lottery.end_time = end_time;
        ctx.accounts.token_lottery.ticket_price = ticket_price;
        ctx.accounts.token_lottery.authority = ctx.accounts.payer.key();
        ctx.accounts.token_lottery.randomness_account = Pubkey::default();
        ctx.accounts.token_lottery.total_tickets = 0;
        ctx.accounts.token_lottery.winner_chosen = false;
        Ok(())
    }

    
    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
    let token_lottery = &mut ctx.accounts.token_lottery;
    let clock = Clock::get()?;

    // Validate lottery is open
    require!(
        clock.unix_timestamp >= token_lottery.start_time
            && clock.unix_timestamp <= token_lottery.end_time,
        ErrorCode::InvalidTime
    );

    // Transfer ticket price from buyer to pot
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.token_lottery.to_account_info(),
            },
        ),
        token_lottery.ticket_price,
    )?;

    // Increment ticket count and assign ticket data
    token_lottery.total_tickets += 1;
    token_lottery.lottery_pot_amount += token_lottery.ticket_price;
    ctx.accounts.ticket.owner = ctx.accounts.payer.key();
    ctx.accounts.ticket.ticket_id = token_lottery.total_tickets;
    ctx.accounts.ticket.lottery = ctx.accounts.token_lottery.key();

    Ok(())
}

pub fn commit_a_winner(ctx: Context<CommitWinner>) -> Result<()> {
    let token_lottery = &mut ctx.accounts.token_lottery;
    let randomness_data = RandomnessAccountData::parse(ctx.accounts.randomness_account_data.data.borrow())?;
    token_lottery.randomness_account = ctx.accounts.randomness_account_data.key();
    Ok(())
}

pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
    let token_lottery = &mut ctx.accounts.token_lottery;
    require!(token_lottery.winner_chosen, ErrorCode::WinnerNotChosen);
    require!(token_lottery.total_tickets == ctx.accounts.ticket.ticket_id, ErrorCode::WinnerNotChosen);

    // Transfer prize amount to winner
    **ctx.accounts.owner.try_borrow_mut_lamports()? += token_lottery.lottery_pot_amount;
    token_lottery.lottery_pot_amount = 0;
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

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub token_lottery: Account<'info, TokenLottery>,
    #[account(mut, has_one = owner)]
    pub ticket: Account<'info, Ticket>,
    pub owner: Signer<'info>,
}


#[derive(Accounts)]
pub struct InitializeLottery<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = collection_mint,
        mint::freeze_authority = collection_mint,
        seeds = [b"collection_mint".as_ref()],
        bump,
    )]
    pub collection_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        seeds = [b"collection_token_account".as_ref()],
        bump,
        token::mint = collection_mint,
        token::authority = collection_token_account
    )]
    pub collection_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        init, 
        payer=payer,
        space=8+std::mem::size_of::<Ticket>())]
    pub ticket: Account<'info, Ticket>,
    #[account(mut)]
    pub token_lottery: Account<'info, TokenLottery>,
}


#[derive(Accounts)]
pub struct  CommitWinner<'info> {
     #[account(mut, has_one = authority)]
    pub token_lottery: Account<'info, TokenLottery>,
    pub authority: Signer<'info>,
    pub randomness_account_data: AccountInfo<'info>,
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

#[account]
pub struct Ticket {
    pub owner: Pubkey,
    pub ticket_id: u64,
    pub lottery: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid randomness account")]
    InvalidRandomnessAccount,
    #[msg("Invalid ticket account")]
    InvalidTicketAccount,
    #[msg("Invalid token lottery account")]
    InvalidTokenLotteryAccount,
    #[msg("Invalid ticket id")]
    InvalidTicketId,
    #[msg("Invalid Lottery time")]
    InvalidTime,
    #[msg("Winner not chosen")]
    WinnerNotChosen,
}