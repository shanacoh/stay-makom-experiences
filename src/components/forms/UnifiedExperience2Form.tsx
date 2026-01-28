import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Save, Rocket, X, Upload, Loader2, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "@/components/ui/rich-text-editor";
import NightsRangeSelector from "@/components/experience/NightsRangeSelector";
import { generateSlug } from "@/lib/utils";
import { Experience2AddonsManager } from "@/components/admin/Experience2AddonsManager";

const experience2Schema = z.object({
  title: z.string().min(1, "English title is required"),
  title_he: z.string().optional(),
  subtitle: z.string().optional(),
  subtitle_he: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  long_copy: z.string().min(100, "English description must be at least 100 characters"),
  long_copy_he: z.string().optional(),
  min_nights: z.number().min(1).max(8).optional(),
  max_nights: z.number().min(1).max(8).optional(),
  min_party: z.number().min(1).max(100),
  max_party: z.number().min(1).max(100),
  cancellation_policy: z.string().optional(),
  cancellation_policy_he: z.string().optional(),
  hotel_id: z.string().min(1, "Hotel is required"),
  seo_title_en: z.string().optional(),
  seo_title_he: z.string().optional(),
  seo_title_fr: z.string().optional(),
  meta_description_en: z.string().optional(),
  meta_description_he: z.string().optional(),
  meta_description_fr: z.string().optional(),
  og_title_en: z.string().optional(),
  og_title_he: z.string().optional(),
  og_title_fr: z.string().optional(),
  og_description_en: z.string().optional(),
  og_description_he: z.string().optional(),
  og_description_fr: z.string().optional(),
  og_image: z.string().optional(),
});

type Experience2FormData = z.infer<typeof experience2Schema>;

interface UnifiedExperience2FormProps {
  hotelId?: string;
  hotelName?: string;
  onClose?: () => void;
  experienceId?: string;
}

export function UnifiedExperience2Form({
  hotelId: propHotelId,
  hotelName,
  onClose,
  experienceId,
}: UnifiedExperience2FormProps) {
  const queryClient = useQueryClient();
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [createdExperienceId, setCreatedExperienceId] = useState<string | null>(null);
  
  // Use either the prop experienceId or the newly created one
  const currentExperienceId = experienceId || createdExperienceId;

  // Fetch hotels2
  const { data: hotels } = useQuery({
    queryKey: ["admin-hotels2-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels2")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("status", "published")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing experience
  const { data: existingExperience, isLoading: isLoadingExperience } = useQuery({
    queryKey: ["experience2", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences2")
        .select("*")
        .eq("id", experienceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!experienceId,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<Experience2FormData>({
    resolver: zodResolver(experience2Schema),
    defaultValues: {
      title: "",
      title_he: "",
      subtitle: "",
      subtitle_he: "",
      category_id: "",
      long_copy: "",
      long_copy_he: "",
      hotel_id: propHotelId || "",
      min_nights: 1,
      max_nights: 4,
      min_party: 2,
      max_party: 4,
      cancellation_policy: "",
      cancellation_policy_he: "",
      seo_title_en: "",
      seo_title_he: "",
      seo_title_fr: "",
      meta_description_en: "",
      meta_description_he: "",
      meta_description_fr: "",
      og_title_en: "",
      og_title_he: "",
      og_title_fr: "",
      og_description_en: "",
      og_description_he: "",
      og_description_fr: "",
      og_image: "",
    },
  });

  const longCopy = watch("long_copy");
  const longCopyHe = watch("long_copy_he");
  const minNights = watch("min_nights");
  const maxNights = watch("max_nights");
  const title = watch("title");

  // Pre-fill form when editing
  useEffect(() => {
    if (existingExperience) {
      setValue("title", existingExperience.title || "");
      setValue("title_he", existingExperience.title_he || "");
      setValue("subtitle", existingExperience.subtitle || "");
      setValue("subtitle_he", existingExperience.subtitle_he || "");
      setValue("category_id", existingExperience.category_id || "", { shouldValidate: true });
      setValue("long_copy", existingExperience.long_copy || "");
      setValue("long_copy_he", existingExperience.long_copy_he || "");
      setValue("min_nights", existingExperience.min_nights || 1);
      setValue("max_nights", existingExperience.max_nights || 4);
      setValue("min_party", existingExperience.min_party || 2);
      setValue("max_party", existingExperience.max_party || 4);
      setValue("hotel_id", existingExperience.hotel_id || propHotelId || "");
      setValue("cancellation_policy", existingExperience.cancellation_policy || "");
      setValue("cancellation_policy_he", existingExperience.cancellation_policy_he || "");
      setValue("seo_title_en", existingExperience.seo_title_en || "");
      setValue("seo_title_he", existingExperience.seo_title_he || "");
      setValue("seo_title_fr", existingExperience.seo_title_fr || "");
      setValue("meta_description_en", existingExperience.meta_description_en || "");
      setValue("meta_description_he", existingExperience.meta_description_he || "");
      setValue("meta_description_fr", existingExperience.meta_description_fr || "");
      setValue("og_title_en", existingExperience.og_title_en || "");
      setValue("og_title_he", existingExperience.og_title_he || "");
      setValue("og_title_fr", existingExperience.og_title_fr || "");
      setValue("og_description_en", existingExperience.og_description_en || "");
      setValue("og_description_he", existingExperience.og_description_he || "");
      setValue("og_description_fr", existingExperience.og_description_fr || "");
      setValue("og_image", existingExperience.og_image || "");
      
      if (existingExperience.hero_image) {
        setHeroImagePreview(existingExperience.hero_image);
      }
      if (existingExperience.photos && Array.isArray(existingExperience.photos)) {
        setGalleryPreviews(existingExperience.photos);
      }
    }
  }, [existingExperience, setValue, propHotelId]);

  // Image upload handlers
  const handleHeroImageChange = (file: File | null) => {
    setHeroImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setHeroImagePreview(null);
    }
  };

  const handleGalleryImagesChange = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 8 - galleryImages.length);
    setGalleryImages((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("experience-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("experience-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveDraft = async (data: Experience2FormData) => {
    setIsSaving(true);
    try {
      let heroImageUrl = existingExperience?.hero_image || "";
      if (heroImage) {
        heroImageUrl = await uploadImage(heroImage, "hero");
      }

      const photoUrls = galleryPreviews.filter(url => url.startsWith('http'));
      for (const img of galleryImages) {
        const url = await uploadImage(img, "gallery");
        photoUrls.push(url);
      }

      const experienceData = {
        title: data.title,
        title_he: data.title_he || null,
        subtitle: data.subtitle || null,
        subtitle_he: data.subtitle_he || null,
        category_id: data.category_id,
        long_copy: data.long_copy || null,
        long_copy_he: data.long_copy_he || null,
        min_nights: data.min_nights,
        max_nights: data.max_nights,
        min_party: data.min_party,
        max_party: data.max_party,
        base_price: 0, // Price is managed via addons
        currency: "ILS",
        base_price_type: "per_person" as const,
        hotel_id: data.hotel_id,
        cancellation_policy: data.cancellation_policy || null,
        cancellation_policy_he: data.cancellation_policy_he || null,
        hero_image: heroImageUrl || null,
        photos: photoUrls,
        status: "draft" as const,
        slug: currentExperienceId ? existingExperience?.slug : generateSlug(title),
        seo_title_en: data.seo_title_en || null,
        seo_title_he: data.seo_title_he || null,
        seo_title_fr: data.seo_title_fr || null,
        meta_description_en: data.meta_description_en || null,
        meta_description_he: data.meta_description_he || null,
        meta_description_fr: data.meta_description_fr || null,
        og_title_en: data.og_title_en || null,
        og_title_he: data.og_title_he || null,
        og_title_fr: data.og_title_fr || null,
        og_description_en: data.og_description_en || null,
        og_description_he: data.og_description_he || null,
        og_description_fr: data.og_description_fr || null,
        og_image: data.og_image || null,
      };

      if (currentExperienceId) {
        const { error } = await supabase
          .from("experiences2")
          .update(experienceData)
          .eq("id", currentExperienceId);
        if (error) throw error;
        toast.success("Draft saved successfully");
      } else {
        const { data: insertedData, error } = await supabase
          .from("experiences2")
          .insert([experienceData])
          .select("id")
          .single();
        if (error) throw error;
        setCreatedExperienceId(insertedData.id);
        toast.success("Draft created! You can now add price addons.");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-experiences2"] });
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (data: Experience2FormData) => {
    setIsSaving(true);
    try {
      let heroImageUrl = existingExperience?.hero_image || "";
      if (heroImage) {
        heroImageUrl = await uploadImage(heroImage, "hero");
      }

      const photoUrls = galleryPreviews.filter(url => url.startsWith('http'));
      for (const img of galleryImages) {
        const url = await uploadImage(img, "gallery");
        photoUrls.push(url);
      }

      const experienceData = {
        title: data.title,
        title_he: data.title_he || null,
        subtitle: data.subtitle || null,
        subtitle_he: data.subtitle_he || null,
        category_id: data.category_id,
        long_copy: data.long_copy || null,
        long_copy_he: data.long_copy_he || null,
        min_nights: data.min_nights,
        max_nights: data.max_nights,
        min_party: data.min_party,
        max_party: data.max_party,
        base_price: 0, // Price is managed via addons
        currency: "ILS",
        base_price_type: "per_person" as const,
        hotel_id: data.hotel_id,
        cancellation_policy: data.cancellation_policy || null,
        cancellation_policy_he: data.cancellation_policy_he || null,
        hero_image: heroImageUrl || null,
        photos: photoUrls,
        status: "published" as const,
        slug: currentExperienceId ? existingExperience?.slug : generateSlug(title),
        seo_title_en: data.seo_title_en || null,
        seo_title_he: data.seo_title_he || null,
        seo_title_fr: data.seo_title_fr || null,
        meta_description_en: data.meta_description_en || null,
        meta_description_he: data.meta_description_he || null,
        meta_description_fr: data.meta_description_fr || null,
        og_title_en: data.og_title_en || null,
        og_title_he: data.og_title_he || null,
        og_title_fr: data.og_title_fr || null,
        og_description_en: data.og_description_en || null,
        og_description_he: data.og_description_he || null,
        og_description_fr: data.og_description_fr || null,
        og_image: data.og_image || null,
      };

      if (currentExperienceId) {
        const { error } = await supabase
          .from("experiences2")
          .update(experienceData)
          .eq("id", currentExperienceId);
        if (error) throw error;
        toast.success("Published successfully");
      } else {
        const { data: insertedData, error } = await supabase
          .from("experiences2")
          .insert([experienceData])
          .select("id")
          .single();
        if (error) throw error;
        setCreatedExperienceId(insertedData.id);
        toast.success("Published successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-experiences2"] });
      onClose?.();
    } catch (error: any) {
      console.error("Publish error:", error);
      toast.error(error.message || "Failed to publish");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!experienceId) throw new Error("No experience ID");
      const { error } = await supabase
        .from("experiences2")
        .delete()
        .eq("id", experienceId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Experience deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-experiences2"] });
      onClose?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete experience");
    },
  });

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };

  const onInvalidSubmit = (errors: Record<string, any>) => {
    console.error("Form validation errors:", errors);
    
    const fieldNames: Record<string, string> = {
      title: "Title (EN)",
      category_id: "Category",
      long_copy: "Description (EN)",
      hotel_id: "Hotel",
      min_party: "Min Party Size",
      max_party: "Max Party Size",
    };
    
    const errorFields = Object.keys(errors).map(field => fieldNames[field] || field);
    
    if (errorFields.length > 0) {
      toast.error(`Please fill required fields: ${errorFields.join(", ")}`);
    }
    
    const firstErrorField = Object.keys(errors)[0];
    const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                    document.getElementById(firstErrorField);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const canPublish = title && longCopy && longCopy.length >= 100;

  if (isLoadingExperience) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handlePublish, onInvalidSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onClose && (
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Experiences 2
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {experienceId ? "Edit Experience 2" : "Create New Experience 2"}
              </h1>
              {hotelName && <p className="text-sm text-muted-foreground">Hotel: {hotelName}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleSubmit(handleSaveDraft, onInvalidSubmit)} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button type="submit" disabled={!canPublish || isSaving}>
              <Rocket className="h-4 w-4 mr-2" />
              Publish
            </Button>
            {experienceId && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details in English and Hebrew</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* English Column */}
              <div className="space-y-4">
                <div className="font-medium text-sm text-muted-foreground">English Version</div>
                
                <div>
                  <Label htmlFor="title">Title (EN) *</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtitle (EN)</Label>
                  <Input id="subtitle" {...register("subtitle")} />
                </div>

                <div>
                  <Label htmlFor="long_copy">Description (EN) * (min 100 characters)</Label>
                  <Controller
                    name="long_copy"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        content={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Describe the experience in English..."
                      />
                    )}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.long_copy && (
                      <p className="text-sm text-destructive">{errors.long_copy.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground ml-auto">
                      {longCopy?.length || 0} / 100 characters minimum
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="cancellation_policy">Cancellation Policy (EN)</Label>
                  <Input id="cancellation_policy" {...register("cancellation_policy")} />
                </div>
              </div>

              {/* Hebrew Column */}
              <div className="space-y-4">
                <div className="font-medium text-sm text-muted-foreground">Hebrew Version (עברית)</div>
                
                <div>
                  <Label htmlFor="title_he">Title (HE)</Label>
                  <Input id="title_he" {...register("title_he")} dir="rtl" className="bg-hebrew-input" />
                </div>

                <div>
                  <Label htmlFor="subtitle_he">Subtitle (HE)</Label>
                  <Input id="subtitle_he" {...register("subtitle_he")} dir="rtl" className="bg-hebrew-input" />
                </div>

                <div>
                  <Label htmlFor="long_copy_he">Description (HE)</Label>
                  <Controller
                    name="long_copy_he"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        content={field.value || ''}
                        onChange={field.onChange}
                        placeholder="תאר את החוויה בעברית..."
                        dir="rtl"
                      />
                    )}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {longCopyHe?.length || 0} characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="cancellation_policy_he">Cancellation Policy (HE)</Label>
                  <Input id="cancellation_policy_he" {...register("cancellation_policy_he")} dir="rtl" className="bg-hebrew-input" />
                </div>
              </div>
            </div>

            {/* Hotel & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hotel_id">Hotel *</Label>
                <Select
                  value={watch("hotel_id") || ""}
                  onValueChange={(value) => setValue("hotel_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels?.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hotel_id && (
                  <p className="text-sm text-destructive mt-1">{errors.hotel_id.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category_id">Category *</Label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category_id && (
                  <p className="text-sm text-destructive mt-1">{errors.category_id.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images & Media</CardTitle>
            <CardDescription>Upload hero image and gallery photos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Hero Image</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                {heroImagePreview && (
                  <img src={heroImagePreview} alt="Hero preview" className="w-full h-64 object-cover rounded-lg mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleHeroImageChange(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label>Gallery Images (up to 8)</Label>
              <div className="grid grid-cols-4 gap-4">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {galleryPreviews.length < 8 && (
                  <label className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleGalleryImagesChange(e.target.files)}
                    />
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacity */}
        <Card>
          <CardHeader>
            <CardTitle>Capacity & Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <NightsRangeSelector
                minValue={minNights}
                maxValue={maxNights}
                onMinChange={(value) => setValue("min_nights", value)}
                onMaxChange={(value) => setValue("max_nights", value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_party">Min Participants *</Label>
                <Input
                  id="min_party"
                  type="number"
                  min="1"
                  {...register("min_party", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="max_party">Max Participants *</Label>
                <Input
                  id="max_party"
                  type="number"
                  min="1"
                  {...register("max_party", { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addons Section */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Ajouts de prix</CardTitle>
            <CardDescription>
              Configurez les commissions, prix par nuit et taxes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Experience2AddonsManager
              experienceId={currentExperienceId}
              disabled={isSaving}
            />
          </CardContent>
        </Card>

        {/* SEO Section */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>SEO Configuration</CardTitle>
            <CardDescription>
              Configure SEO metadata for search engines and social media sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* English Column */}
              <div className="space-y-4">
                <div className="bg-background p-2 rounded">
                  <h4 className="font-medium text-sm">English SEO</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_title_en">SEO Title</Label>
                  <Input
                    id="seo_title_en"
                    {...register("seo_title_en")}
                    placeholder="Displayed in browser tab and Google results"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: Max ~60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description_en">Meta Description</Label>
                  <Textarea
                    id="meta_description_en"
                    {...register("meta_description_en")}
                    placeholder="Shown in Google search results"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: Max ~155 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_title_en">Open Graph Title</Label>
                  <Input
                    id="og_title_en"
                    {...register("og_title_en")}
                    placeholder="Title when shared on social media"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_description_en">Open Graph Description</Label>
                  <Textarea
                    id="og_description_en"
                    {...register("og_description_en")}
                    placeholder="Description when shared on social media"
                    rows={3}
                  />
                </div>
              </div>

              {/* Hebrew Column */}
              <div className="space-y-4">
                <div className="bg-background p-2 rounded">
                  <h4 className="font-medium text-sm">Hebrew SEO (עברית)</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_title_he">כותרת SEO</Label>
                  <Input
                    id="seo_title_he"
                    {...register("seo_title_he")}
                    placeholder="כותרת עבור גוגל וכרטיסייה"
                    dir="rtl"
                    className="bg-hebrew-input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Max ~60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description_he">תיאור Meta</Label>
                  <Textarea
                    id="meta_description_he"
                    {...register("meta_description_he")}
                    placeholder="תיאור עבור תוצאות גוגל"
                    rows={3}
                    dir="rtl"
                    className="bg-hebrew-input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Max ~155 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_title_he">כותרת Open Graph</Label>
                  <Input
                    id="og_title_he"
                    {...register("og_title_he")}
                    placeholder="כותרת עבור שיתוף ברשתות חברתיות"
                    dir="rtl"
                    className="bg-hebrew-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_description_he">תיאור Open Graph</Label>
                  <Textarea
                    id="og_description_he"
                    {...register("og_description_he")}
                    placeholder="תיאור עבור שיתוף ברשתות חברתיות"
                    rows={3}
                    dir="rtl"
                    className="bg-hebrew-input"
                  />
                </div>
              </div>

              {/* French Column */}
              <div className="space-y-4">
                <div className="bg-background p-2 rounded">
                  <h4 className="font-medium text-sm">French SEO (Français)</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_title_fr">Titre SEO</Label>
                  <Input
                    id="seo_title_fr"
                    {...register("seo_title_fr")}
                    placeholder="Titre pour Google et l'onglet"
                  />
                  <p className="text-xs text-muted-foreground">
                    Max ~60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description_fr">Description Meta</Label>
                  <Textarea
                    id="meta_description_fr"
                    {...register("meta_description_fr")}
                    placeholder="Description pour les résultats Google"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Max ~155 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_title_fr">Titre Open Graph</Label>
                  <Input
                    id="og_title_fr"
                    {...register("og_title_fr")}
                    placeholder="Titre pour les réseaux sociaux"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_description_fr">Description Open Graph</Label>
                  <Textarea
                    id="og_description_fr"
                    {...register("og_description_fr")}
                    placeholder="Description pour les réseaux sociaux"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* OG Image - Shared */}
            <div className="space-y-2">
              <Label htmlFor="og_image">Open Graph Image</Label>
              <Input
                id="og_image"
                {...register("og_image")}
                placeholder="Image URL for social media sharing"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1200x630px. Leave empty to use hero image.
              </p>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the experience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
