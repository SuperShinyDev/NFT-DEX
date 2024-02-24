# Solana NFT Trade Contract

This is a simple smart contract program on Solana blockchain that stores trade offers for a nft-to-nft trade market. It validates trades submitted and transfers NFT ownership upon success.


### Contract Tables

- `offers` table - Trade offers table that stores offers to trade one or more NFTs (the supply) in exchange for one or more other NFTs (the demand). The offers table has the following columns: 
    - `offer_id` - Unique ID of offer.
    - `creator` - The account that created the offer.
    - `created` - Timestamp of offer creation. 
    - `expiration` - The expiration date/time of the offer.
- `offer_supply` table - Stores the ID(s) of the NFT(s) to be supplied in the corresponding offer_id in the `offers` table. Columns:
    - `offer_id` - the offer in the `offers` table that the supply corresponds to.
    - `nft_id` - the ID of the NFT.
- `offer_demand` table - Stores the ID(s) of the NFT(s) to be demanded in the corresponding offer_id of the `offers` table. Columns:
    - `offer_id` - the offer in the `offers` table that the demand corresponds to.
    - `nft_id` - the ID of the NFT.
    - `owner` - the account name of the owner of the NFT.

### Program Functions: 

- `offercreate` - A function that creates new offer on the program `offers` table. The offer is automatically assined a unique `offer_id`, the value of `created` is set to timestamp, and the value of `creator` is set to `account`.  The function requires the following to be passed in function payload: `expiration`(datetime), `supply`{nft_id, nft_id,...}, `demand`{nft_id, nft_id,...}. Each supply is added to the `offer_supply` table and each demand added to the `offer_demand` table. The function should make the following assertions: 
    - Supply NFT ID must exist, else ("NFT ID {ID} does not exist")
    - offer_supply must be owned by offer `creator`. Else ("Account must be owner of NFT {ID} supplied in offer.")
    - offer_demand must not be owned by account. Else "Offer demand cannot be owned by account." 
    - All NFTs in offer_supply and offer_demand tables must have transfer authority given to program (for NFT transfer upon successful trade). Else("NFT ID {ID} must give transfer authority to program to exist in offer.") 
    - Expiration date must be in the future. 


- `offersdelete` - Deletes all offers from offers table and all offer_supply and offer_demand corresponding to that offer. Can submit one or more offer ids. Exmaple payload `offersdelete`{offer_id,offer_id,...}. 
    - assert: Account must be creator of offers ,else "Account must be creator of offer(s) to delete." 


- `offersdelexp` - Delete all offers that have expired for a given number of "days". Example payload is `offersdelexp`{10} which deletes all offers expired for more than 10 days. This should be private function to program.

- `tradecreate` -  Validates trade and transferes NFTs to new owners. The payload of this function should be: `tradecreate`{offer_id,offer_id,...}. This function should be public and anyone can push. Completes NFTs transfers to their new owners if the following assertions pass:
    - Offers provided in payload exist in offers table and are not not expired.
    - All offer supply and demand in offer_ids have proper transfer authority to program account.
    - Each and all offer_demand in offers array is satisfied by one offer_supply that is included in the provided offer_ids all inclusive. Each offer_supply can only be used to satisfy one offer_demand and should not be double-spent. There should be no un-supplied demand or supply without corresponding demand. 
        - Example of valid trade:
            - tradecreate{1,2,3}
                - offer 1
                    - supply 1 
                    - supply 2 
                    - demand 4
                - offer 2
                    - supply 3 
                    - demand 1
                - offer 3
                    - supply 4
                    - demand 2
                    - demand 3
     In the above, every supply in all offers[1,2,3] have a corresponding demand and there are no unmet demands or supply. This meets requirement.
