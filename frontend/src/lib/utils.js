import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTime(date) {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInMs = now - messageDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return messageDate.toLocaleDateString();
}

export function formatMessageTime(date) {
  const messageDate = new Date(date);
  const now = new Date();
  const isToday = messageDate.toDateString() === now.toDateString();

  if (isToday) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = messageDate.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateGradientFromName(name) {
  const colors = [
    "from-blue-400 to-blue-600",
    "from-green-400 to-green-600",
    "from-purple-400 to-purple-600",
    "from-pink-400 to-pink-600",
    "from-indigo-400 to-indigo-600",
    "from-red-400 to-red-600",
    "from-yellow-400 to-yellow-600",
    "from-teal-400 to-teal-600",
  ];

  const index = name.length % colors.length;
  return colors[index];
}

export function isImageFile(filename) {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".svg",
    ".webp",
  ];
  const extension = filename.toLowerCase().split(".").pop();
  return imageExtensions.includes(`.${extension}`);
}

export function isVideoFile(filename) {
  const videoExtensions = [
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".m4v",
  ];
  const extension = filename.toLowerCase().split(".").pop();
  return videoExtensions.includes(`.${extension}`);
}

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function truncateText(text, maxLength = 30) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getFileIcon(filename) {
  const extension = filename.toLowerCase().split(".").pop();

  const iconMap = {
    // Documents
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    txt: "📄",
    rtf: "📄",

    // Spreadsheets
    xls: "📊",
    xlsx: "📊",
    csv: "📊",

    // Presentations
    ppt: "📊",
    pptx: "📊",

    // Archives
    zip: "🗜️",
    rar: "🗜️",
    "7z": "🗜️",

    // Images
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    bmp: "🖼️",
    svg: "🖼️",

    // Videos
    mp4: "🎥",
    avi: "🎥",
    mov: "🎥",
    wmv: "🎥",

    // Audio
    mp3: "🎵",
    wav: "🎵",
    flac: "🎵",

    // Code
    js: "💻",
    jsx: "💻",
    ts: "💻",
    tsx: "💻",
    html: "💻",
    css: "💻",
    json: "💻",
    xml: "💻",
  };

  return iconMap[extension] || "📎";
}

export function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getContrastColor(theme) {
  const darkThemes = [
    "dark",
    "night",
    "coffee",
    "dracula",
    "synthwave",
    "halloween",
    "forest",
    "black",
    "luxury",
  ];
  return darkThemes.includes(theme) ? "text-white" : "text-black";
}

export function isOnline(lastSeen) {
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = (now - lastSeenDate) / (1000 * 60);
  return diffInMinutes <= 5; // Consider online if seen within 5 minutes
}

export function getOnlineStatus(lastSeen) {
  if (isOnline(lastSeen)) return "Online";

  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMs = now - lastSeenDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;
  if (diffInHours < 24) return `Last seen ${diffInHours}h ago`;
  if (diffInDays < 7) return `Last seen ${diffInDays}d ago`;

  return `Last seen ${lastSeenDate.toLocaleDateString()}`;
}

export function generateChatWallpaper(theme) {
  const wallpapers = {
    light: "bg-gradient-to-br from-slate-50 to-slate-100",
    dark: "bg-gradient-to-br from-slate-900 to-slate-800",
    cupcake: "bg-gradient-to-br from-pink-50 to-purple-100",
    bumblebee: "bg-gradient-to-br from-yellow-50 to-orange-100",
    emerald: "bg-gradient-to-br from-emerald-50 to-teal-100",
    corporate: "bg-gradient-to-br from-blue-50 to-indigo-100",
    synthwave: "bg-gradient-to-br from-purple-900 to-pink-800",
    retro: "bg-gradient-to-br from-orange-100 to-red-200",
    cyberpunk: "bg-gradient-to-br from-cyan-900 to-purple-900",
    valentine: "bg-gradient-to-br from-pink-100 to-red-200",
    halloween: "bg-gradient-to-br from-orange-900 to-black",
    garden: "bg-gradient-to-br from-green-50 to-lime-100",
    forest: "bg-gradient-to-br from-green-900 to-emerald-800",
    aqua: "bg-gradient-to-br from-cyan-50 to-blue-100",
    lofi: "bg-gradient-to-br from-gray-100 to-slate-200",
    pastel: "bg-gradient-to-br from-purple-50 to-pink-100",
    fantasy: "bg-gradient-to-br from-purple-100 to-pink-200",
    wireframe: "bg-gradient-to-br from-white to-gray-100",
    black: "bg-gradient-to-br from-black to-gray-900",
    luxury: "bg-gradient-to-br from-yellow-900 to-orange-900",
    dracula: "bg-gradient-to-br from-purple-900 to-pink-900",
    cmyk: "bg-gradient-to-br from-cyan-100 to-magenta-100",
    autumn: "bg-gradient-to-br from-orange-100 to-red-200",
    business: "bg-gradient-to-br from-gray-100 to-blue-100",
    acid: "bg-gradient-to-br from-lime-200 to-yellow-300",
    lemonade: "bg-gradient-to-br from-yellow-100 to-lime-200",
    night: "bg-gradient-to-br from-slate-900 to-blue-900",
    coffee: "bg-gradient-to-br from-amber-900 to-orange-900",
    winter: "bg-gradient-to-br from-blue-100 to-cyan-200",
    dim: "bg-gradient-to-br from-gray-800 to-slate-700",
    nord: "bg-gradient-to-br from-slate-600 to-blue-800",
    sunset: "bg-gradient-to-br from-orange-200 to-red-300",
  };

  return wallpapers[theme] || wallpapers.light;
}

export function capitialize(text) {
  if (!text) return "";
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
