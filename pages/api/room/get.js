// pages/api/room/get.js

import dbConnect from '../../../lib/dbConnect';
import Room from '../../../models/Room';

export default async function handler(req, res) {
  await dbConnect();

  const { code } = req.query;

  try {
    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.status(200).json({ room }); // includes creatorId
  } catch (error) {
    console.error('Error fetching room:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
