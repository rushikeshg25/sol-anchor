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

    /// CHECK: This account will be initialized by the metaplex program
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: This account will be initialized by the metaplex program
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
