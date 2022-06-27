import * as anchor from "@project-serum/anchor";
import * as token from "@solana/spl-token"
import {PublicKey} from "@solana/web3.js";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

module.exports = {
    findAssociatedTokenAddress,
    findMetaplexMetadataAddress,
    findMetaplexMasterEditionAddress,
    TOKEN_METADATA_PROGRAM_ID,
};

async function findAssociatedTokenAddress(walletAddress:PublicKey, tokenMintAddress:PublicKey) {

    return (await PublicKey.findProgramAddress(
        [
            walletAddress.toBuffer(),
            token.TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ],
        token.ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];
}

async function findMetaplexMetadataAddress(mint:PublicKey) {
    return (await PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    ))[0];
}

async function findMetaplexMasterEditionAddress(mint:PublicKey) {
    return (await PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
        ],
        TOKEN_METADATA_PROGRAM_ID
    ))[0];
}