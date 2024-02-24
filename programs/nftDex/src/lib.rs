use anchor_lang::prelude::*;

pub mod error;
pub mod state;
// pub mod validation;

use error::*;
use state::*;

// use solana_client::{
//     rpc_client::RpcClient
//   };

// use solana_sdk::commitment_config::CommitmentConfig;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, Approve};

const OFFER_CREATE_ACCOUT_PREFIX: &[u8] = b"offer_create";

declare_id!("E9spGMFBST72sJHsgUFhMCDUSZ9RsT56S6UVof1krMzd");

#[program]
pub mod nft_dex {
    use super::*;

    pub fn set_active(ctx: Context<SetActiveNFT>) -> Result<()> {
        let user_nft_account = &mut ctx.accounts.user_nft_account;
        let token_program = &mut ctx.accounts.token_program;
        let user = &mut ctx.accounts.user;
        let owner = &mut ctx.accounts.owner;

        let approve_accounts = Approve {
            to: user_nft_account.to_account_info(),
            delegate: owner.to_account_info(),
            authority: user.to_account_info()
        };

        let approve_ctx = CpiContext::new(token_program.to_account_info(), approve_accounts);

        token::approve(approve_ctx, 1)?;

        Ok(())
    }

    pub fn set_inactive(ctx: Context<SetInactiveNFT>) -> Result<()> {
        let user_nft_account = &mut ctx.accounts.user_nft_account;
        let token_program = &mut ctx.accounts.token_program;
        let user = &mut ctx.accounts.user;
        let owner = &mut ctx.accounts.owner;

        let approve_accounts = Approve {
            to: user_nft_account.to_account_info(),
            delegate: user.to_account_info(),
            authority: owner.to_account_info()
        };

        let approve_ctx = CpiContext::new(token_program.to_account_info(), approve_accounts);

        token::approve(approve_ctx, 1)?;

        Ok(())
    }

    pub fn offer_create(
        ctx: Context<OfferCreate>,
        datetime: i64,
        timestamp: i64,
        nft_supply_ids: Vec<Pubkey>,
        nft_demand_ids: Vec<Pubkey>,
        bump: u8
    ) -> Result<()> {
        let offer_create = &mut ctx.accounts.offer_create;
        let user = &mut ctx.accounts.user;
        let clock = &ctx.accounts.clock;
        
        // for supply_nft in &nft_supply_ids {
        //     if *supply_nft != user.to_account_info().key() {
        //         let account = connection.get_account(&supply_nft).unwrap();
        //         if account.owner != user.to_account_info().key() {
        //             return Err(NFTDEXError::OfferSupplyNotOwner.into());
        //         }
        //     }
        // }

        // for demand_nft in &nft_demand_ids {
        //     if *demand_nft != user.to_account_info().key() {
        //         let account = connection.get_account(&demand_nft).unwrap();
        //         if account.owner == user.to_account_info().key() {
        //             return Err(NFTDEXError::OfferDemandOwner.into());
        //         }
        //     }
        // }

        // if datetime < timestamp {
        //     return Err(NFTDEXError::OfferExpirationError.into());
        // }

        offer_create.wallet_id = user.to_account_info().key();
        offer_create.supply_1 = nft_supply_ids[0];
        offer_create.supply_2 = nft_supply_ids[1];
        offer_create.supply_3 = nft_supply_ids[2];
        offer_create.supply_4 = nft_supply_ids[3];
        offer_create.supply_5 = nft_supply_ids[4];
        offer_create.demand_1 = nft_demand_ids[0];
        offer_create.demand_2 = nft_demand_ids[1];
        offer_create.demand_3 = nft_demand_ids[2];
        offer_create.demand_4 = nft_demand_ids[3];
        offer_create.demand_5 = nft_demand_ids[4];
    
        offer_create.timestamp = timestamp;
        offer_create.created = clock.unix_timestamp;
        offer_create.expiration = datetime;
        offer_create.bump = bump;

        Ok(())
    }

    pub fn offer_delete_by_user(
        ctx: Context<OfferDeleteByUser>
    ) -> Result<()> {
        let offer_create = &mut ctx.accounts.offer_create;
        let payer = &mut ctx.accounts.payer;

        let starting_lamports = payer.to_account_info().lamports();
        **payer.to_account_info().lamports.borrow_mut() = starting_lamports
            .checked_add(offer_create.to_account_info().lamports())
            .unwrap();
        **offer_create.to_account_info().lamports.borrow_mut() = 0;

        let binding = offer_create.to_account_info();
        let mut offer_create_data = binding.data.borrow_mut();
        offer_create_data.fill(0);

        Ok(())
    }

    pub fn offer_delete(
        ctx: Context<OfferDelete>
    ) -> Result<()> {
        let offer_create = &mut ctx.accounts.offer_create;
        let payer = &mut ctx.accounts.payer;

        let starting_lamports = payer.to_account_info().lamports();
        **payer.to_account_info().lamports.borrow_mut() = starting_lamports
            .checked_add(offer_create.to_account_info().lamports())
            .unwrap();
        **offer_create.to_account_info().lamports.borrow_mut() = 0;

        let binding = offer_create.to_account_info();
        let mut offer_create_data = binding.data.borrow_mut();
        offer_create_data.fill(0);

        Ok(())
    }

    pub fn trade_create(
        ctx: Context<TradeCreate>
    ) -> Result<()> {

        let user_nft_account = &mut ctx.accounts.user_nft_account;
        let new_user_nft_account = &mut ctx.accounts.new_user_nft_account;
        let token_program = &ctx.accounts.token_program;
        let owner = &mut ctx.accounts.owner;

        let transfer_accounts = Transfer {
            from: user_nft_account.to_account_info(),
            to: new_user_nft_account.to_account_info(),
            authority: owner.to_account_info()
        };

        let transfer_ctx = CpiContext::new(
            token_program.to_account_info(),
            transfer_accounts
        );

        token::transfer(
            transfer_ctx,
            1
        )?;

        Ok(())

    }

}

#[derive(Accounts)]
pub struct SetActiveNFT<'info> {
    
    pub nft_mint: Box<Account<'info, Mint>>,

    /// CHECK:` This is the common account
    #[account(mut, signer)]
    pub user: AccountInfo<'info>,

    /// CHECK:` This is the common account
    #[account(mut, signer)]
    pub owner: AccountInfo<'info>,

    /// The token account from the owner
    #[account(
        mut,
        constraint = user_nft_account.mint == nft_mint.key() @ NFTDEXError::InvalidNFTAccountMint,
        constraint = user_nft_account.amount == 1 @ NFTDEXError::NFTAccountEmpty,
    )]
    pub user_nft_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SetInactiveNFT<'info> {

    pub nft_mint: Box<Account<'info, Mint>>,

    /// The token account from the owner
    #[account(
        mut,
        constraint = user_nft_account.mint == nft_mint.key() @ NFTDEXError::InvalidNFTAccountMint,
        constraint = user_nft_account.amount == 1 @ NFTDEXError::NFTAccountEmpty,
    )]
    pub user_nft_account: Account<'info, TokenAccount>,
    
    /// CHECK:` This is the common account.
    #[account(mut, signer)]
    pub owner: AccountInfo<'info>,

    /// CHECK:` This is the common account.
    #[account(mut)]
    pub user: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(
    datetime: i64,
    timestamp: i64,
    nft_supply_ids: Vec<Pubkey>,
    nft_demand_ids: Vec<Pubkey>,
    bump: u8
)]
pub struct OfferCreate<'info> {
    /// The offer account
    #[account(
        init,
        payer = payer,
        seeds=[&id().to_bytes(), OFFER_CREATE_ACCOUT_PREFIX, timestamp.to_string().as_str().as_ref()],
        bump,
        space= 8 + 8 * 3 + 32 * 11 + 1
    )]
    pub offer_create: Account<'info, OfferCreateAccount>,
    
    /// CHECK:` This is the common account.
    #[account(mut, signer)]
    pub user: AccountInfo<'info>,

    /// CHECK:` This is the common account.
    #[account(mut, signer)]
    pub payer: AccountInfo<'info>,

    pub clock: Sysvar<'info, Clock>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OfferDelete<'info> {
    /// The offer account
    #[account(mut)]
    pub offer_create: Account<'info, OfferCreateAccount>,

    /// CHECK:` This is the common account.
    #[account(mut)]
    pub payer: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct OfferDeleteByUser<'info> {
    /// The offer account
    #[account(mut)]
    pub offer_create: Account<'info, OfferCreateAccount>,

    /// CHECK:` This is the common account.
    #[account(mut)]
    pub payer: AccountInfo<'info>,

    /// CHECK:` This is the common account.
    #[account(mut)]
    pub user: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TradeCreate<'info> {

    pub nft_mint: Box<Account<'info, Mint>>,

    /// The token account from the owner
    #[account(
        mut,
        constraint = user_nft_account.mint == nft_mint.key() @ NFTDEXError::InvalidNFTAccountMint,
        constraint = user_nft_account.amount == 1 @ NFTDEXError::NFTAccountEmpty,
    )]
    pub user_nft_account: Account<'info, TokenAccount>,

    /// The token account from the owner
    #[account(mut)]
    pub new_user_nft_account: Account<'info, TokenAccount>,

    /// CHECK:` This is the common account.
    #[account(mut, signer)]
    pub owner: AccountInfo<'info>,

    /// CHECK:` This is the common account.
    #[account(mut, signer)]
    pub trade_create_signer: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,

}
