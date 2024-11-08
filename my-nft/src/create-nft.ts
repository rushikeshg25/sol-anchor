import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  airdropIfRequired,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

async function createNftMain() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const user = await getKeypairFromFile();
  await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL
  );

  const umi = createUmi(connection.rpcEndpoint);
  umi.use(mplTokenMetadata());

  const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(umiUser));

  const collectionAddress = publicKey(
    "Gn9CTWjwWHGgHfDEUXEeTW93i7bFNVBp96iqtsNva2rX"
  );

  const mint = generateSigner(umi);

  const transaction = await createNft(umi, {
    mint,
    name: "Rushikesh NFT",
    uri: "https://raw.githubusercontent.com/rushikeshg25/sol-anchor/refs/heads/master/my-nft/token.json",
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
      key: collectionAddress,
      verified: false,
    },
  });

  await transaction.sendAndConfirm(umi);

  const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
  console.log(createdNft);
}
createNftMain();
