const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const fs = require('fs');

async function generateWallets(count) {
    const wallets = [];
    for (let i = 0; i < count; i++) {
        // Generate a 24-word mnemonic (256 bits of entropy)
        const mnemonic = bip39.generateMnemonic(256);

        // Derive a seed from the mnemonic
        const seed = await bip39.mnemonicToSeed(mnemonic);

        // Generate a Bitcoin key pair
        const network = bitcoin.networks.bitcoin;
        const root = bitcoin.bip32.fromSeed(seed, network);
        
        // Derive the first account's node (m/44'/0'/0'/0/0)
        const child = root.derivePath("m/44'/0'/0'/0/0");

        // Get the public key and create a P2WPKH (segwit) address
        const { address } = bitcoin.payments.p2wpkh({ 
            pubkey: child.publicKey,
            network
        });

        // Save wallet info
        wallets.push({
            address: address,
            privateKey: child.privateKey.toString('hex'),
            mnemonic
        });
    }

    return wallets;
}

async function main() {
    const walletCount = 50; // Number of wallets to generate
    const wallets = await generateWallets(walletCount);

    // Save wallets to a file
    const outputFileName = 'bitcoin_wallets.json';
    fs.writeFileSync(outputFileName, JSON.stringify(wallets, null, 2));

    console.log(`Generated ${walletCount} wallets and saved to ${outputFileName}`);
}

main().catch(console.error);
