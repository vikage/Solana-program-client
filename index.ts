import * as anchor from "@project-serum/anchor";
import * as spltoken from "@solana/spl-token";
import {PublicKey, Keypair} from "@solana/web3.js";
import {Transaction} from "@solana/web3.js";
const utils = require("./utils.ts");

anchor.setProvider(anchor.AnchorProvider.env());
const idl = JSON.parse(
    require("fs").readFileSync("/Users/thanhvu/Documents/anchor_project/solana-contract/target/idl/contract.json", "utf8")
);

const programId = new PublicKey("FUXDcaRXknWTgt5cPcKwidTss5ZNW1kVCGGRfb6EQVXN");
const program = new anchor.Program(idl, programId);
let keypairData = require("fs").readFileSync("/Users/thanhvu/.config/solana/id2.json");
let keypairJson = JSON.parse(keypairData);
const keypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(keypairJson));

async function createKeypairFromFile(filePath: String) {
    const secretKeyString = require("fs").readFileSync(filePath, 'utf8');
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
}

async function transferSol() {
    const receiver = anchor.web3.Keypair.generate();
// Execute the RPC.
    let lamports = new anchor.BN(1_000_000_000);
    const tx = await program.rpc.reward(lamports, {
        accounts: {
            signer: keypair.publicKey,
            receiver: receiver.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [keypair]
    });

    console.log("Your transaction signature", tx);
}

async function transferSplToken() {
    const receiver = new PublicKey("32A6MJN9UqUnFLJiZXuPwD8QJBYDRQMrzAVVNoMeTrXT");
    const source = new PublicKey("7eLgtxh83BvfsmWxsZ8TXyhtV5s6dPUXJd7aNUiYHgEC");

    let amount = new anchor.BN(1_100_000_000);

    let txSignature = program.rpc.transferSplToken(amount, {
        accounts: {
            authority: keypair.publicKey,
            sourceAccount: source,
            tokenProgram: spltoken.TOKEN_PROGRAM_ID,
            receiverAccount: receiver,
        },
    });

    console.log("Your transaction signature", txSignature);
}

async function transferSplTokenToWallet() {
    const receiver = new PublicKey("DRrtArnqqcogPRw2J26H3ffAy7sS5ATw3sRashqDGLEL");
    const sourceWallet = new PublicKey("2gPe68HDt6dPE9Ftth5CgP3wrc7ryteJriPQYPmi7Xc3");
    const mint = new PublicKey("3GWsMY8REuofBM4fsa9h3mJSkLtJRzSCJJDvjKdSMMXg");

    let amount = new anchor.BN(100_000_000);

    const sourceAssociatedToken = await utils.findAssociatedTokenAddress(sourceWallet, mint);
    console.log("Source associated token: " + sourceAssociatedToken);

    const destinationAssociatedToken = await utils.findAssociatedTokenAddress(receiver, mint);
    console.log("Destination associated token: " + destinationAssociatedToken);

    let instructions = [];
    try {
        const destinationAssociatedTokenAccountInfo = await spltoken.getAccount(anchor.getProvider().connection, destinationAssociatedToken);
        console.log("Destination associated token account info: " + destinationAssociatedTokenAccountInfo);
    } catch (e) {
        let createAccountInstruction = spltoken.createAssociatedTokenAccountInstruction(keypair.publicKey, destinationAssociatedToken, receiver, mint);
        instructions.push(createAccountInstruction);
        console.log("Will create associated token account: " + destinationAssociatedToken);
    }

    const txSignature = await program.rpc.transferSplToken2(amount, {
        accounts: {
            authority: keypair.publicKey,
            sourceAccount: sourceAssociatedToken,
            tokenProgram: spltoken.TOKEN_PROGRAM_ID,
            receiverAccount: destinationAssociatedToken,
        },
        instructions: instructions,
        signers: [keypair]
    });

    console.log("Your transaction signature", txSignature);
}

async function transferSplTokenToWallet2() {
    const receiverWallet = new PublicKey("GrmruBF5iqURLNEUBxFeRAJ2EjXqqb1aNNKj4Pz5xqeM");
    const sourceWallet = new PublicKey("2gPe68HDt6dPE9Ftth5CgP3wrc7ryteJriPQYPmi7Xc3");
    const mint = new PublicKey("3GWsMY8REuofBM4fsa9h3mJSkLtJRzSCJJDvjKdSMMXg");

    let amount = new anchor.BN(100_000_000);

    const sourceAssociatedToken = await utils.findAssociatedTokenAddress(sourceWallet, mint);
    console.log("Source associated token: " + sourceAssociatedToken);

    const destinationAssociatedToken = await utils.findAssociatedTokenAddress(receiverWallet, mint);
    console.log("Destination associated token: " + destinationAssociatedToken);

    let instructions = [];
    instructions.push(program.instruction.createAssociatedTokenAccount2({
        accounts: {
            token: destinationAssociatedToken,
            mint: mint,
            payer: keypair.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            owner: receiverWallet,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: spltoken.TOKEN_PROGRAM_ID,
            associatedTokenProgram: spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
        }
    }));

    const txSignature = await program.rpc.transferSplToken2(amount, {
        accounts: {
            authority: keypair.publicKey,
            sourceAccount: sourceAssociatedToken,
            tokenProgram: spltoken.TOKEN_PROGRAM_ID,
            receiverAccount: destinationAssociatedToken,
        },
        instructions: instructions,
        signers: [keypair]
    });

    console.log("Your transaction signature", txSignature);
}

async function transferSplTokenToWalletMultiTransaction() {
    const receiver = new PublicKey("DRrtArnqqcogPRw2J26H3ffAy7sS5ATw3sRashqDGLEL");
    const sourceWallet = new PublicKey("2gPe68HDt6dPE9Ftth5CgP3wrc7ryteJriPQYPmi7Xc3");
    const mint = new PublicKey("3GWsMY8REuofBM4fsa9h3mJSkLtJRzSCJJDvjKdSMMXg");

    let amount = new anchor.BN(100_000_000);

    const sourceAssociatedToken = await utils.findAssociatedTokenAddress(sourceWallet, mint);
    console.log("Source associated token: " + sourceAssociatedToken);

    const destinationAssociatedToken = await utils.findAssociatedTokenAddress(receiver, mint);
    console.log("Destination associated token: " + destinationAssociatedToken);

    let instructions = [];
    const tx = new Transaction();

    try {
        const destinationAssociatedTokenAccountInfo = await spltoken.getAccount(anchor.getProvider().connection, destinationAssociatedToken);
        console.log("Destination associated token account info: " + destinationAssociatedTokenAccountInfo);
    } catch (e) {
        let createAccountInstruction = spltoken.createAssociatedTokenAccountInstruction(keypair.publicKey, destinationAssociatedToken, receiver, mint);
        instructions.push(createAccountInstruction);
        console.log("Will create associated token account: " + destinationAssociatedToken);
        tx.add(createAccountInstruction);
    }

    let transferIntruction = program.instruction.transferSplToken2(amount, {
        accounts: {
            authority: keypair.publicKey,
            sourceAccount: sourceAssociatedToken,
            tokenProgram: spltoken.TOKEN_PROGRAM_ID,
            receiverAccount: destinationAssociatedToken,
        },
        signers: [keypair],
    });

    tx.add(transferIntruction);

    try {
        let txSignature = await (program.provider.sendAndConfirm && program.provider.sendAndConfirm(tx, [keypair]));
        console.log("Your transaction signature", txSignature);
    } catch (e) {
        console.log("Error + ", e);
    }
}

async function createAssociatedToken() {
    const receiverWallet = new PublicKey("BS3eUGsphg7rahQ3nAskdnAdnvoBKNP6pusQW73JjwQK");
    const mint = new PublicKey("3GWsMY8REuofBM4fsa9h3mJSkLtJRzSCJJDvjKdSMMXg");

    const tokenAccount = await utils.findAssociatedTokenAddress(receiverWallet, mint);
    console.log("Associated token account: " + tokenAccount);

    let tx = await program.rpc.createAssociatedTokenAccount({
        accounts: {
            token: tokenAccount,
            mint: mint,
            payer: keypair.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            owner: receiverWallet,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: spltoken.TOKEN_PROGRAM_ID,
            associatedTokenProgram: spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
        }
    })

    console.log("Your transaction signature ", tx);
}

async function createNFT() {
    const mintKeypair = anchor.web3.Keypair.generate();
    const wallet = keypair.publicKey;
    const collectionKeyPair = await createKeypairFromFile("/Users/thanhvu/.config/solana/collection.json");
    const collectionPubKey = new PublicKey("BphtLL5hE1JxcktvLRp7Nt8mNbDwC8ez7kEjtMQLuSpg");
    const collectionMetadataAccount = await utils.findMetaplexMetadataAddress(collectionPubKey);
    const collectionMasterEditionAccount = await utils.findMetaplexMasterEditionAddress(collectionPubKey);

    const associatedTokenProgram = await utils.findAssociatedTokenAddress(wallet, mintKeypair.publicKey);

    const metadataAccount = await utils.findMetaplexMetadataAddress(mintKeypair.publicKey);
    const masterEditionAccount = await utils.findMetaplexMasterEditionAddress(mintKeypair.publicKey);

    let transaction = new Transaction();
    let title = "HIT Logo 6";
    let uri = "https://dn0vy9kj7ix52.cloudfront.net/static_metadata/hit-logo.json"
    let symbol = "HIT";

    transaction.add(
        program.instruction.createNft(title, uri, symbol, collectionPubKey, {
            accounts: {
                payer: keypair.publicKey,
                mint: mintKeypair.publicKey,
                tokenAccount: associatedTokenProgram,
                metadata: metadataAccount,
                masterEdition: masterEditionAccount,
                mintAuthority: keypair.publicKey,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: spltoken.TOKEN_PROGRAM_ID,
                tokenMetadataProgram: utils.TOKEN_METADATA_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                associatedTokenProgram: spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
            },
        })
    );

    transaction.add(
        program.instruction.verifyNftCollection({
            accounts: {
                payer: keypair.publicKey,
                metadata: metadataAccount,
                mintAuthority: keypair.publicKey,
                collectionMint: collectionPubKey,
                collectionMetadata: collectionMetadataAccount,
                collectionMasterEdition: collectionMasterEditionAccount,
                tokenMetadataProgram: utils.TOKEN_METADATA_PROGRAM_ID,
            },
        })
    );

    console.log("Payer: ", keypair.publicKey.toBase58());
    console.log("Mint: ", mintKeypair.publicKey.toBase58());
    console.log("Collection: ", collectionPubKey.toBase58());
    console.log("Token account: ", associatedTokenProgram.toBase58());
    console.log("Metadata address: ", metadataAccount.toBase58());
    console.log("Master edition address: ", masterEditionAccount.toBase58());

    try {
        if (program.provider.sendAndConfirm != undefined) {
            let txSignature = await (program.provider.sendAndConfirm && program.provider.sendAndConfirm(transaction, [keypair, mintKeypair]));
            console.log("Your transaction signature", txSignature);
        }
    } catch (e) {
        console.log("Error + ", e);
    }
}

// transferSol();
// transferSplToken();
// getAssociatedTokenAccount();
// transferSplTokenToWallet();
// createAssociatedToken();
// transferSplTokenToWallet2();
createNFT();