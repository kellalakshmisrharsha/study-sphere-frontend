import { nanoid } from 'nanoid';
import dbConnect from '../../../lib/dbConnect';
import Room from '../../../models/Room';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { username, roomcode, password } = req.body;
    if (!username || !roomcode) {
      return res.status(400).json({ message: 'Username and room code are required' });
    }

    try {
      // Normalize code case
      const normalizedCode = roomcode.toUpperCase();
      console.log('Joining room with code:', normalizedCode);

      const room = await Room.findOne({ code: normalizedCode });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      // Check password if set
      if (room.password) {
        if (!password || password !== room.password) {
          return res.status(403).json({ message: 'Room password is incorrect' });
        }
      }

      if (!room.members.includes(username)) {
        room.members.push(username);
        await room.save();
      }

      return res.status(200).json({
        message: 'User joined successfully',
        room: {
          id: room._id,
          code: room.code,
          members: room.members,
          link: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/room/${room.code}`,
        },
      });
    } catch (error) {
      console.error('Error joining room:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
