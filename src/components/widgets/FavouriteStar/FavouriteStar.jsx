import { useState } from "react";

function FavouriteStar() {
  const [isFavourite, setIsFavourite] = useState(false);

  return (
    <span
      className="star"
      tabIndex={0}
      style={{ outline: "none" }}
      onClick={() => setIsFavourite(fav => !fav)}
      onKeyPress={e => { if (e.key === 'Enter') setIsFavourite(fav => !fav); }}
      aria-label={isFavourite ? "Unfavourite" : "Favourite"}
      role="button"
    >
      {isFavourite ? (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#589ec4" stroke="#589ec4" strokeWidth="2">
          <polygon points="12 2 15 8.6 22 9.7 17 14.3 18.2 21.1 12 17.8 5.8 21.1 7 14.3 2 9.7 9 8.6 12 2"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" stroke="#589ec4" strokeWidth="2">
          <polygon points="12 2 15 8.6 22 9.7 17 14.3 18.2 21.1 12 17.8 5.8 21.1 7 14.3 2 9.7 9 8.6 12 2"/>
        </svg>
      )}
    </span>
  );
}
export default FavouriteStar;