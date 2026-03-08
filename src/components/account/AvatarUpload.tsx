/**
 * AvatarUpload — clickable avatar with camera overlay, triggers file upload.
 * Uploads to Supabase storage bucket "hotel-images" (public).
 */

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  userId: string;
  avatarUrl?: string | null;
  displayName: string;
  size?: "sm" | "md";
  onUploaded?: (url: string) => void;
}

export default function AvatarUpload({ userId, avatarUrl, displayName, size = "md", onUploaded }: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initials = displayName
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = size === "md" ? "h-20 w-20" : "h-[72px] w-[72px]";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("hotel-images")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("hotel-images")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;

      // Update profile
      await supabase
        .from("user_profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      onUploaded?.(publicUrl);
      toast.success("Photo updated");
    } catch (err: any) {
      toast.error("Upload failed");
      console.error(err);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => fileRef.current?.click()}
      className="relative group cursor-pointer"
    >
      <Avatar className={cn(sizeClasses, "border-2 border-border/40 shadow-sm")}>
        <AvatarImage src={previewUrl || avatarUrl || undefined} alt={displayName} />
        <AvatarFallback className="bg-gradient-to-br from-[#C4714A]/20 to-[#D4A574]/30 text-foreground text-xl font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Camera overlay */}
      <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm group-hover:bg-muted transition-colors">
        {uploading ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : (
          <Camera className="h-3 w-3 text-muted-foreground" />
        )}
      </span>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </button>
  );
}
