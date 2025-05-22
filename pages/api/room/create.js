// pages/api/room/create.js

import dbConnect from '../../../lib/dbConnect';
import Room from '../../../models/Room';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { username, expiryHours, password } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    let expiresAt = null;
    if (expiryHours && !isNaN(Number(expiryHours)) && Number(expiryHours) > 0) {
      expiresAt = new Date(Date.now() + Number(expiryHours) * 60 * 60 * 1000);
    }

    const code = nanoid(6).toUpperCase();

    try {
      const newRoom = await Room.create({
        code,
        creator: username, // corrected field name
        members: [username],
        expiresAt,
        password: password || undefined,
      });

      return res.status(201).json({ message: 'Room created', room: newRoom });
    } catch (err) {
      console.error('Error creating room:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
