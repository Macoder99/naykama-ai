import { Globe, Mail, MessageSquare } from "lucide-react";
import { InstagramIcon, MessengerIcon, WhatsAppIcon } from "@/components/brand-icons";
import { channelMeta, type Channel } from "@/lib/data";
import { cn } from "@/lib/utils";

const icons = {
  whatsapp: WhatsAppIcon,
  email: Mail,
  sms: MessageSquare,
  web: Globe,
  messenger: MessengerIcon,
  instagram: InstagramIcon,
};

export function ChannelIcon({ channel, className }: { channel: Channel; className?: string }) {
  const Icon = icons[channel];
  return <Icon className={cn("h-4 w-4", channelMeta[channel].color, className)} />;
}
