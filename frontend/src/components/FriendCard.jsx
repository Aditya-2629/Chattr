import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:bg-base-300 hover:shadow-lg transition-all duration-300 group border border-base-300 hover:border-primary/20">
      <div className="card-body p-4 sm:p-5">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-4">
          <div className="avatar">
            <div className="w-12 sm:w-14 rounded-full ring-2 ring-base-300 group-hover:ring-primary/30 transition-all">
              <img src={friend.profilePic} alt={friend.fullName} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg truncate text-base-content">{friend.fullName}</h3>
            <p className="text-sm text-base-content/60">Online</p>
          </div>
        </div>

        {/* LANGUAGE BADGES */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge badge-primary badge-sm sm:badge-md gap-1">
            {getLanguageFlag(friend.nativeLanguage)}
            <span className="hidden sm:inline">Native: </span>{friend.nativeLanguage}
          </span>
          <span className="badge badge-outline badge-sm sm:badge-md gap-1">
            {getLanguageFlag(friend.learningLanguage)}
            <span className="hidden sm:inline">Learning: </span>{friend.learningLanguage}
          </span>
        </div>

        {/* ACTION BUTTON */}
        <Link 
          to={`/messenger/${friend._id}`} 
          className="btn btn-primary w-full gap-2 group-hover:btn-primary group-hover:scale-105 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
