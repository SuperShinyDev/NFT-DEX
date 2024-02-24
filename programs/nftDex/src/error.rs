use anchor_lang::prelude::*;

#[error_code]
pub enum NFTDEXError {
    #[msg("Account must be creator of offers to delete")]
    OfferNotCreator,
    #[msg("Account must be owner of offer table to delete")]
    OfferNotOwner,
    #[msg("The provided NFT token account is not owned by the provided owner")]
    OfferSupplyNotOwner,
    #[msg("Account must be owner of NFT supplied in offer.")]
    OfferDemandOwner,
    #[msg("Offer demand cannot be owned by account.")]
    OfferExpirationError,
    #[msg("Expiration date must be in the future.")]
    InvalidNFTOwner,
    #[msg("The provided NFT token account is not for the NFT mint")]
    InvalidNFTAccountMint,
    #[msg("The provided NFT token account does not have the token")]
    NFTAccountEmpty,
    #[msg("The offer Id is not exist or expired")]
    OfferIDORExpirationError,
    #[msg("Is not validated")]
    OfferNotValidate,
    #[msg("NFT is not exist in the account")]
    NFTNotExist
}