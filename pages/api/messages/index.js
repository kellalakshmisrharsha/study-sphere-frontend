import dbConnect from '../../../lib/dbConnect';
import Message from '../../../models/Message';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { roomId, sender, content } = req.body;

    try {
      const newMessage = await Message.create({ roomId, sender, content });
      return res.status(201).json(newMessage);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to store message' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
