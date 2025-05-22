import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  blobName: { type: String, required: true },
  roomId: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

export default mongoose.models.File || mongoose.model('File', FileSchema);
