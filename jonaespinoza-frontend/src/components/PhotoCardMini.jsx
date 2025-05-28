import React from "react";
import { Link } from "react-router-dom";
import Text from "./Text";

function PhotoCardMini({ id, image, titleKey, textKey }) {
  return (
    <Link
      to={`/fotos/${id}`}
      className="block rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white dark:bg-primary text-black dark:text-white"
    >
      <img src={image} alt="" className="w-full h-56 object-cover" />
      <div className="p-4">
        <Text tKey={titleKey} as="h3" className="text-md font-semibold mb-2" />
        <Text
          tKey={textKey}
          as="p"
          className="text-sm line-clamp-3 leading-snug text-ellipsis overflow-hidden"
        />
      </div>
    </Link>
  );
}

export default PhotoCardMini;
