import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

interface ImagePlaceholderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ImagePlaceholder({ size = "md", className = "" }: ImagePlaceholderProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-32 h-32"
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 flex items-center justify-center rounded ${className}`}>
      <FontAwesomeIcon icon={faImage} className="text-gray-400" />
    </div>
  );
} 