const { storeImages, storeTokenUriMetadata } = require("./uploadToPinata");

const imagesLocation = "./images/randomNft/";
const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
};

async function handleTokenUris() {
  let tokenUris = [];
  const { responsesPinata: imageUploadResponses, files } = await storeImages(imagesLocation);

  for (const imageUploadResponseIndex in imageUploadResponses) {
    const tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;

    console.log(`Uploading ${tokenUriMetadata.name}...`);
    const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata);
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }

  console.log("\nToken URIs uplaod successful!");
  console.log("Token URIs: \n", tokenUris, "\n");
  return tokenUris;
}

module.exports = {
  handleTokenUris,
};
