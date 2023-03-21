const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

async function storeImages(imagesFilePath) {
  const fullImagesPath = path.resolve(imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  let responsesPinata = [];

  console.log("Uploading to Pinata...");
  for (const fileIndex in files) {
    console.log(`Uploading ${fileIndex}...`);
    const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);

    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile);
      responsesPinata.push(response);
    } catch (error) {
      console.log(error);
    }
  }

  return { responsesPinata, files };
}

async function storeTokenUriMetadata(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    console.log(error);
  }

  return null;
}

module.exports = {
  storeImages,
  storeTokenUriMetadata,
};
