import dbConnect from '../../../lib/dbConnect';
import Room from '../../../models/Room';

export default async function handler(req, res) {
  await dbConnect();
  try {
    // Only return non-expired rooms
    const now = new Date();
    // Include creator in projection
    const rooms = await Room.find({ expiresAt: { $gt: now } }, 'code name expiresAt creator');
    return res.status(200).json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
