import formidable from 'formidable';
import fs from 'fs';
import { BlobServiceClient } from '@azure/storage-blob';
import File from '../../models/File'; // adjust path as needed
import dbConnect from '../../lib/dbConnect'; // adjust path as needed
export const config = {
  api: {
    bodyParser: false,
  },
};

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'your-container-name'; // create this in Azure Portal Blob Storage section

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    try {
      // Get file info
      const file = files.file; // assuming form field name is 'file'
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Connect to Azure Blob Storage
      const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
      const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

      // Ensure container exists (create if not)
      const createContainerResponse = await containerClient.createIfNotExists();

      // Create a block blob client
      const blobName = file.originalFilename; // you can rename if needed
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Read file as stream
      const fileStream = fs.createReadStream(file.filepath);

      // Upload file
      await blockBlobClient.uploadStream(fileStream);

      // Respond with blob URL
      const blobUrl = blockBlobClient.url;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours TTL

      await dbConnect();

      const fileDoc = await File.create({
        blobName,
        roomId: fields.roomId, // assume roomId is sent as part of form fields
        url: blobUrl,
        expiresAt,
      });

      res.status(200).json({ message: 'File uploaded to Azure Blob Storage', url: blobUrl });
    } catch (uploadErr) {
      console.error('Upload error:', uploadErr);
      res.status(500).json({ message: 'Error uploading file to Azure' });
    }
  });
}
