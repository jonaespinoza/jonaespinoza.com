import React from "react";

function ChatButton({ onClick = () => {} }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg"
    >
      Chat
    </button>
  );
}

export default ChatButton;
