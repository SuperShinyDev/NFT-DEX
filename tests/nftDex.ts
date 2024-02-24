import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { NftDex } from "../target/types/nft_dex";
import { createMint, TOKEN_PROGRAM_ID, mintTo, getAssociatedTokenAddress, createAssociatedTokenAccount, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { PublicKey, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { deserializeUnchecked } from "borsh";
export * from './borsh';
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import axios from "axios";

const provider = anchor.Provider.env();

const nftDexOwner_secretKey = "[70,6,174,137,190,208,221,25,79,24,75,219,162,214,121,147,221,195,156,252,43,30,101,22,137,93,171,46,255,235,13,210,255,86,115,87,205,68,144,61,87,171,118,135,82,84,38,18,212,68,141,169,50,84,123,203,158,31,171,18,57,76,100,0]";

const nftDexTradeSignAccount_privateKey = "ypVPJNjVaQj9DbsKaZLtAwMEiUKAuxLGmMzRHMRXEvJzjWcDi6z2yzaRaj8stFUSKAt3f2U5Sfyd1H9gWPfPxXp";

const user_a_wallet_private_key = "3wwVDR7y8tcugLRrvjHGuxZPog1hzvC9WzjRUE5DDdYahVU95vbWpRXeVzGqyZwEpgB5KZ7EQznhojqiSTsxHEaS";
const user_b_wallet_private_key = "5XfarJA7adZMAiaTHxxYgFqXbvK2cVaDigtJaA8GeW31CixpFhAfW5XMg6UDD5LriDYaHrc75hc7LrA9cmjeXzFt";
const user_c_wallet_private_key = "J6qF11JnQHyfdKgwf1JBj1iSryyiy3fLoH8Rj71hcfyXXPLWz86CysHQkbKoxe3VJ2iAP4Q5EknstG69LvJtz29";

const quickNodeDevnetConnectionURL = "https://silent-winter-yard.solana-devnet.discover.quiknode.pro/721d7314dba4869109aee96c37dda02c616cc3bb/";

interface offerItemType {
    offer_account_address: PublicKey;
    owner: string;
    used_nfts: {
        nft_address: string;
        action: "supply" | "demand"
    }[];
    timestamp: number;
    created: number;
    expiration: number;
    bump: number;
}

const getOfferCreateAccounts = async (programId: PublicKey) => {

    let offers_list: offerItemType[] = [];

    const offer_create_accounts = await provider.connection.getProgramAccounts(
        programId,
        {
            dataSlice: {
                offset: 8,
                length: 377
            }
            ,
            filters: [
                {
                    dataSize: 385
                },
                {
                    memcmp: {
                        offset: 0,
                        bytes: ""
                    }
                }
            ]
        }
    );
    console.log("Offer Create Accounts:", offer_create_accounts.length);

    offer_create_accounts.forEach((account, i) => {

        const each_offer_create_account = account.account;

        class AccoundData {
            constructor(data) {
                Object.assign(this, data);
            }
        }

        const dataSchema = new Map([
            [
                AccoundData,
                {
                    kind: "struct",
                    fields: [
                        ["wallet_id", "Pubkey"],
                        ["supply_1", "Pubkey"],
                        ["supply_2", "Pubkey"],
                        ["supply_3", "Pubkey"],
                        ["supply_4", "Pubkey"],
                        ["supply_5", "Pubkey"],
                        ["demand_1", "Pubkey"],
                        ["demand_2", "Pubkey"],
                        ["demand_3", "Pubkey"],
                        ["demand_4", "Pubkey"],
                        ["demand_5", "Pubkey"],
                        ["timestamp", "u64"],
                        ["created", "u64"],
                        ["expiration", "u64"],
                        ["bump", "u8"]
                    ],
                },
            ],
        ]);

        const accountData = deserializeUnchecked(dataSchema, AccoundData, each_offer_create_account.data);

        let offerItem: offerItemType = {
            offer_account_address: account.pubkey,
            owner: accountData["wallet_id"].toBase58(),
            used_nfts: [],
            timestamp: Number(accountData["timestamp"]),
            created: Number(accountData["created"]),
            expiration: Number(accountData["expiration"]),
            bump: accountData["bump"]
        }

        if (accountData["supply_1"].toString() != programId.toBase58()) offerItem.used_nfts.push({
            nft_address: accountData["supply_1"].toString(),
            action: "supply"
        });
        if (accountData["supply_2"].toString() != programId.toBase58()) offerItem.used_nfts.push({
            nft_address: accountData["supply_2"].toString(),
            action: "supply"
        });
        if (accountData["supply_3"].toString() != programId.toBase58()) offerItem.used_nfts.push({
            nft_address: accountData["supply_3"].toString(),
            action: "supply"
        });
        if (accountData["supply_4"].toString() != programId.toBase58()) offerItem.used_nfts.push({
            nft_address: accountData["supply_4"].toString(),
            action: "supply"
        });
        if (accountData["supply_5"].toString() != programId.toBase58()) offerItem.used_nfts.push({
            nft_address: accountData["supply_5"].toString(),
            action: "supply"
        });
        if (accountData["demand_1"].toString() != programId.toBase58()) offerItem.used_nfts.push({
            nft_address: accountData["demand_1"].toString(),
            action: "demand"
        });
        if (accountData["demand_2"].toString() != programId.toBase58()) offerItem.used_nfts.push({
            nft_address: accountData["demand_2"].toString(),
            action: "demand"
        });
        if (accountData["demand_3"].toString() != programId.toBase58()) offerItem.used_nfts.push({
            nft_address: accountData["demand_3"].toString(),
            action: "demand"
        });
        if (accountData["demand_4"].toString() != programId.toBase58()) offerItem.used_nfts.push({
            nft_address: accountData["demand_4"].toString(),
            action: "demand"
        });
        if (accountData["demand_5"].toString() != programId.toBase58()) offerItem.used_nfts.push({
            nft_address: accountData["demand_5"].toString(),
            action: "demand"
        });

        offers_list.push(offerItem);
    });

    offers_list.sort((a, b) => (b.timestamp - a.timestamp));

    return offers_list;
};

describe("nftDex", async () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.Provider.env());
    const program = anchor.workspace.NftDex as Program<NftDex>;
    const payer = anchor.web3.Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(nftDexOwner_secretKey))
    );
    let nftDexTradeSignAccount_secretKey = bs58.decode(nftDexTradeSignAccount_privateKey);
    const nftDexTradeSignAccount = anchor.web3.Keypair.fromSecretKey(nftDexTradeSignAccount_secretKey);
    // Expiration DateTime
    let datetime = new Date().getTime() + 24 * 3600 * 1000;

    let nft_addresses: anchor.web3.PublicKey[] = [];

    interface offerType {
        nft_supply_ids: anchor.web3.PublicKey[],
        nft_demand_ids: anchor.web3.PublicKey[],
        supply_user: anchor.web3.Keypair
    }

    let offers: offerType[] = [];

    const user_a_wallet = anchor.web3.Keypair.fromSecretKey(bs58.decode(user_a_wallet_private_key))
    const user_b_wallet = anchor.web3.Keypair.fromSecretKey(bs58.decode(user_b_wallet_private_key))
    const user_c_wallet = anchor.web3.Keypair.fromSecretKey(bs58.decode(user_c_wallet_private_key))

    const user_wallets = [user_a_wallet, user_b_wallet, user_c_wallet];

    const nftOwnUsers = [
        user_a_wallet,
        user_c_wallet,
        user_a_wallet,
        user_b_wallet,
        user_b_wallet,
    ];

    let nftIds = [];

    it("FetchNFTsFromWallets", async () => {
        for (let i = 0; i < user_wallets.length; i++) {

            const response = await axios.post(quickNodeDevnetConnectionURL,
                {
                    method: 'qn_fetchNFTs',
                    params: {
                        wallet: user_wallets[i].publicKey.toBase58(),
                        omitFields: ["provenance", "traits", "network", "description", "chain"]
                    }
                }
            );

            const _nftIds = response.data.result.assets.map(account => {
                return new PublicKey(account.tokenAddress);
            });

            if (i == 0 && _nftIds.length < 2) {
                console.log("There should be at least 2 NFTs in user_a_wallet");
                return;
            }
            if (i == 1 && _nftIds.length < 2) {
                console.log("There should be at least 2 NFTs in user_b_wallet");
                return;
            }
            if (i == 2 && _nftIds.length < 1) {
                console.log("There should be at least 1 NFT in user_c_wallet");
                return;
            }

            nftIds.push(_nftIds);
        }

        nft_addresses = [
            nftIds[0][0],
            nftIds[2][0],
            nftIds[0][1],
            nftIds[1][0],
            nftIds[1][1],
        ];

    });

    it("SetActive", async () => {
        for (let i = 0; i < nft_addresses.length; i++) {
            const user_nft_token_address = await getAssociatedTokenAddress(
                nft_addresses[i],
                nftOwnUsers[i].publicKey
            );
            const tx = await program.rpc.setActive({
                accounts: {
                    nftMint: nft_addresses[i],
                    userNftAccount: user_nft_token_address,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    user: nftOwnUsers[i].publicKey,
                    owner: provider.wallet.publicKey
                },
                signers: [
                    nftOwnUsers[i]
                ]
            });
            console.log("Set Active NFT_", nft_addresses[i].toBase58(), " Transaction:", tx);
        }
    });

    it("SetInactive", async () => {

        let user_nft_token_address: PublicKey;
        try {
            user_nft_token_address = await getAssociatedTokenAddress(
                nft_addresses[4],
                nftOwnUsers[4].publicKey
            );
        }
        catch (err) {
            throw (err);
        }
        const tx = await program.rpc.setInactive({
            accounts: {
                nftMint: nft_addresses[4],
                userNftAccount: user_nft_token_address,
                tokenProgram: TOKEN_PROGRAM_ID,
                user: nftOwnUsers[4].publicKey,
                owner: provider.wallet.publicKey
            },
            signers: [
                nftOwnUsers[4]
            ]
        });
        console.log("Set Inactive NFT_", nft_addresses[4].toBase58(), " Transaction:", tx);

        const offers_list = await getOfferCreateAccounts(program.programId);

        let offersDeleteRelatedInactiveNFTsTransaction = new anchor.web3.Transaction();

        offers_list.forEach((offer: offerItemType, i) => {
            if (offer.used_nfts.find((nft) => nft.nft_address == nft_addresses[4].toBase58())) {
                offersDeleteRelatedInactiveNFTsTransaction.add(
                    program.instruction.offerDelete({
                        accounts: {
                            offerCreate: offer.offer_account_address,
                            payer: provider.wallet.publicKey
                        }
                    })
                );
            }
        });

        const delete_offers_tx = await provider.send(offersDeleteRelatedInactiveNFTsTransaction);

        console.log("Offers related to inactive NFTs were Deleted! tx:", delete_offers_tx);
    });

    it("OffersAllDelete", async () => {

        const offers_list = await getOfferCreateAccounts(program.programId);

        for (let i = 0; i < offers_list.length; i++) {
            const tx = await program.rpc.offerDelete({
                accounts: {
                    offerCreate: offers_list[i].offer_account_address,
                    payer: provider.wallet.publicKey
                }
            });
            console.log(`Successed! tx: ${i + 1} : `, tx);
        }
    });


    it("OfferCreate!", async () => {

        // Offer 1 (user_a): supply 1, supply 3, demand 2
        // Offer 2 (user_b): supply 4, demand 1,
        // Offer 3 (user_c): supply 2, demand 3, demand 4

        // Offer 4 (user_a): supply 3, demand 2 
        // Offer 5 (user_b): supply 4, demand 2 
        // Offer 6 (user_c): supply 2, demand 4 

        offers = [
            {
                nft_supply_ids: [nft_addresses[0], nft_addresses[2]],
                nft_demand_ids: [nft_addresses[1]],
                supply_user: user_a_wallet
            },
            {
                nft_supply_ids: [nft_addresses[3]],
                nft_demand_ids: [nft_addresses[0]],
                supply_user: user_b_wallet
            },
            {
                nft_supply_ids: [nft_addresses[1]],
                nft_demand_ids: [nft_addresses[2], nft_addresses[3]],
                supply_user: user_c_wallet
            },
            {
                nft_supply_ids: [nft_addresses[2]],
                nft_demand_ids: [nft_addresses[1]],
                supply_user: user_a_wallet
            },
            {
                nft_supply_ids: [nft_addresses[3]],
                nft_demand_ids: [nft_addresses[1]],
                supply_user: user_b_wallet
            },
            {
                nft_supply_ids: [nft_addresses[1]],
                nft_demand_ids: [nft_addresses[3]],
                supply_user: user_c_wallet
            }
        ];

        offers.forEach((offer) => {
            for (let i = 0; i < 5; i++) {
                if (!offer.nft_supply_ids[i]) offer.nft_supply_ids[i] = program.programId;
                if (!offer.nft_demand_ids[i]) offer.nft_demand_ids[i] = program.programId;
            }
        });

        let activatedNFTAccounts = [];

        for (let i = 0; i < user_wallets.length; i++) {
            let activatedNFTAccounts_user = await provider.connection.getParsedProgramAccounts(
                TOKEN_PROGRAM_ID,
                {
                    filters: [
                        {
                            dataSize: 165
                        },
                        {
                            memcmp: {
                                offset: 76,
                                bytes: provider.wallet.publicKey.toBase58()
                            },
                        },
                        {
                            memcmp: {
                                offset: 32,
                                bytes: user_wallets[i].publicKey.toBase58()
                            }
                        }
                    ]
                }
            );
            activatedNFTAccounts = activatedNFTAccounts.concat(activatedNFTAccounts_user);
        }

        let activated_nfts = [];

        activatedNFTAccounts.forEach((account, i) => {
            activated_nfts.push({ nft_address: account.account.data["parsed"]["info"]["mint"], owner: account.account.data["parsed"]["info"]["owner"] });
        });

        let nfts_activated: boolean = true, nft_supply_offer_creator: boolean = true, nft_demand_offer_creator: boolean = true;

        for (let i = 0; i < offers.length; i++) {

            // Check Supply NFT's transfer Authority.

            offers[i].nft_supply_ids.forEach((supply_nft) => {

                if (supply_nft == program.programId) return;

                const target_nft = activated_nfts.find((nft_in_marketplace) => nft_in_marketplace.nft_address == supply_nft.toBase58());

                if (!target_nft) {
                    console.log(`NFT ID ${supply_nft} must give transfer authority to NFTDEX to exist in offer`);
                    nfts_activated = false;
                }

                // Check the Owner of Supply NFTs

                if (target_nft.owner != offers[i].supply_user.publicKey.toBase58()) {
                    console.log("target_nft.owner:", target_nft.owner, offers[i].supply_user.publicKey.toBase58());
                    console.log(`Account must be owner of NFT ${supply_nft} supplied in offer.`);
                    nft_supply_offer_creator = false;
                }

            });

            // Check Demand NFT's transfer Authority.

            offers[i].nft_demand_ids.forEach((demand_nft) => {

                if (demand_nft == program.programId) return;

                const target_nft = activated_nfts.find((nft_in_marketplace) => nft_in_marketplace.nft_address == demand_nft.toBase58());

                if (!target_nft) {
                    console.log(`NFT ID ${demand_nft} must give transfer authority to NFTDEX to exist in offer`);
                    nfts_activated = false;
                }

                // Check the Owner of Demand NFTs

                if (target_nft.owner == offers[i].supply_user.publicKey.toBase58()) {
                    console.log(`Account must not be owner of NFT ${demand_nft} demanded in offer.`);
                    nft_demand_offer_creator = false;
                }
            });

            let current_timestamp = new Date().getTime();

            let offer_create_account = await anchor.web3.PublicKey.findProgramAddress(
                [
                    program.programId.toBuffer(),
                    anchor.utils.bytes.utf8.encode('offer_create'),
                    anchor.utils.bytes.utf8.encode(current_timestamp.toString())
                ], program.programId);

            if (!nfts_activated || !nft_supply_offer_creator || !nft_demand_offer_creator) break;

            if (i == 5) datetime -= 2 * 3600 * 1000;

            // Check Expiration Date is later than Current Time.

            if (datetime < current_timestamp) {
                console.log("Expiration must be later than offer creation date");
                break;
            }

            const tx = await program.rpc.offerCreate(
                new anchor.BN(datetime),
                new anchor.BN(current_timestamp),
                offers[i].nft_supply_ids,
                offers[i].nft_demand_ids,
                offer_create_account[1],
                {
                    accounts: {
                        offerCreate: offer_create_account[0],
                        user: offers[i].supply_user.publicKey,
                        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                        payer: provider.wallet.publicKey,
                        systemProgram: anchor.web3.SystemProgram.programId
                    },
                    signers: [
                        offers[i].supply_user,
                        payer
                    ]
                }
            );
            console.log("Offer_", (i + 1), "_:", offer_create_account[0].toBase58(), " Successed! Transaction signature", tx);

        }

    });

    it("OfferDelete", async () => {

        const offers_list = await getOfferCreateAccounts(program.programId);

        // const user_wallet = user_wallets.find((wallet) => wallet.publicKey == offers_list[4].offer_account_address );

        if (user_a_wallet.publicKey != offers_list[4].offer_account_address) {
            console.log("Account must be creator of offer(s) to delete.");
            return;
        }

        const tx = await program.rpc.offerDeleteByUser({
            accounts: {
                offerCreate: offers_list[4].offer_account_address,
                payer: provider.wallet.publicKey,
                user: user_a_wallet.publicKey
            },
            signers: [
                user_a_wallet,
                payer
            ]
        });
        console.log("Successed! tx:", tx);

    });

    it("OfferDeleteExp", async () => {

        const offers_list = await getOfferCreateAccounts(program.programId);

        for (let i = 0; i < offers_list.length; i++) {
            if (offers_list[i].expiration < datetime + 3600 * 1000) {
                const tx = await program.rpc.offerDelete({
                    accounts: {
                        offerCreate: offers_list[i].offer_account_address,
                        payer: provider.wallet.publicKey
                    }
                });
                console.log("Successed! tx:", tx, "  --------->   ", i);
            }
        }
    });


    it("TradeCreate", async () => {

        const offers_list = await getOfferCreateAccounts(program.programId);

        let supply_nfts = [], demand_nfts = [];

        // Offer 1 , 2 , 3

        for (let i = 0; i < 3; i++) {
            offers_list[i].used_nfts.forEach((nftObj) => {
                if (nftObj.action == "supply") {
                    supply_nfts.push({
                        nft_address: nftObj.nft_address,
                        owner: offers_list[i].owner
                    })
                }
                if (nftObj.action == "demand") {
                    demand_nfts.push({
                        nft_address: nftObj.nft_address,
                        owner: offers_list[i].owner
                    })
                }
            });
        }

        if (demand_nfts.length != supply_nfts.length) {
            console.log("Supply and Demand NFTs count are different!");
            return;
        }
        supply_nfts.forEach((nftObj, i) => {
            const demand_nftObj = demand_nfts.filter((demand_nftObj: { nft_address: string, owner: string }) => demand_nftObj.nft_address == nftObj.nft_address);
            supply_nfts[i].newOwner = demand_nftObj[0].owner;
        })

        const transaction = new Transaction();

        for (let i = 0; i < supply_nfts.length; i++) {
            const nftObj = supply_nfts[i];

            const user_nft_token_account = await getAssociatedTokenAddress(
                new PublicKey(nftObj.nft_address),
                new PublicKey(nftObj.owner)
            );

            const new_user_nft_token_account = await getOrCreateAssociatedTokenAccount(
                provider.connection,
                payer,
                new PublicKey(nftObj.nft_address),
                new PublicKey(nftObj.newOwner),
            );

            transaction.add(
                program.instruction.tradeCreate({
                    accounts: {
                        userNftAccount: user_nft_token_account,
                        newUserNftAccount: new_user_nft_token_account.address,
                        nftMint: new PublicKey(nftObj.nft_address),
                        tokenProgram: TOKEN_PROGRAM_ID,
                        owner: provider.wallet.publicKey,
                        tradeCreateSigner: nftDexTradeSignAccount.publicKey
                    },
                    signers: [
                        nftDexTradeSignAccount,
                        payer
                    ]
                })
            );
        }

        const tx = await provider.connection.sendTransaction(transaction, [payer, nftDexTradeSignAccount]);

        console.log("Trade Successed! tx:", tx);

        const transactionDeleteOffersTradeDone = new anchor.web3.Transaction();

        for (let i = 0; i < 3; i++) {
            transactionDeleteOffersTradeDone.add(
                program.instruction.offerDelete({
                    accounts: {
                        offerCreate: offers_list[i].offer_account_address,
                        payer: provider.wallet.publicKey
                    }
                })
            );
        }

        const tx1 = await provider.send(transactionDeleteOffersTradeDone);

        console.log("Offers Deleted after Trade! tx:", tx1);

    });
});