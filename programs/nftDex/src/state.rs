use anchor_lang::prelude::*;

#[account]
pub struct OfferCreateAccount {
    pub wallet_id: Pubkey,
    pub supply_1: Pubkey,
    pub supply_2: Pubkey,
    pub supply_3: Pubkey,
    pub supply_4: Pubkey,
    pub supply_5: Pubkey,
    pub demand_1: Pubkey,
    pub demand_2: Pubkey,
    pub demand_3: Pubkey,
    pub demand_4: Pubkey,
    pub demand_5: Pubkey,
    pub timestamp: i64,
    pub created: i64,
    pub expiration: i64,
    pub bump: u8
}