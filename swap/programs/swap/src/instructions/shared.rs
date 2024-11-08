use anchor_lang::prelude::*;
use anchor_spl::token_interface::TokenAccount;

pub fn transfer_tokens<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
) -> Result<()> {
    Ok(())
}
