import { Files } from "lucide-react";
import { toast } from "./ui/use-toast";

interface CopyProps {
  data: string;
  info: string;
  title: string;
}

export default function Copy({ data, info, title }: CopyProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(data);

    toast({
      title,
      description: `${info} copied to clipboard.`,
      duration: 2000,
      className: "bg-[#EFEFEF] text-gray-700"
    });
  };

  return (
    <button className="cursor-pointer" onClick={handleCopy}>
      <Files size={16} />
    </button>
  );
}
