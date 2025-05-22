// components/ChatMessage.jsx

export default function ChatMessage({ message }) {
  if (message.type === 'file') {
    const isImage = message.fileType.startsWith('image/');
    return (
      <div className="chat-message file-message">
        <strong>{message.sender} sent a file:</strong>
        <div>
          {isImage ? (
            <img
              src={message.fileUrl}
              alt={message.fileName}
              style={{ maxWidth: '200px', borderRadius: '8px' }}
            />
          ) : (
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
              📎 {message.fileName}
            </a>
          )}
        </div>
       
      </div>
    );
  }

  // fallback for text messages
  return (
    <div className="chat-message text-message">
      <strong>{message.sender}:</strong> {message.text}
    </div>
  );
}
