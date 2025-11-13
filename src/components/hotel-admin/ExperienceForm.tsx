import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Rocket, Plus, X, Upload, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import NightsRangeSelector from "@/components/experience/NightsRangeSelector";

const experienceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(100, "Description must be at least 100 characters"),
  min_nights: z.number().min(1).max(8).optional(),
  max_nights: z.number().min(1).max(8).optional(),
  min_party: z.number().min(1).max(100),
  max_party: z.number().min(1).max(100),
  cancellation_policy: z.string().optional(),
  base_price: z.number().min(0.01, "Price must be greater than 0"),
  currency: z.string(),
  base_price_type: z.enum(["per_booking", "per_person"]),
  always_available: z.boolean(),
  internal_notes: z.string().optional(),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

interface ExperienceFormProps {
  hotelId: string;
  hotelName: string;
  onClose?: () => void;
  experienceId?: string;
}

export function ExperienceForm({
  hotelId,
  hotelName,
  onClose,
  experienceId,
}: ExperienceFormProps) {
  const queryClient = useQueryClient();
  const [includes, setIncludes] = useState<string[]>([]);
  const [newInclude, setNewInclude] = useState("");
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "pending" | "published">("draft");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      min_nights: 1,
      max_nights: 4,
      min_party: 2,
      max_party: 4,
      currency: "ILS",
      base_price_type: "per_person",
      always_available: true,
    },
  });

  const alwaysAvailable = watch("always_available");
  const basePrice = watch("base_price");
  const title = watch("title");
  const description = watch("description");
  const minNights = watch("min_nights") || 1;
  const maxNights = watch("max_nights") || 4;

  const canPublish =
    title &&
    description?.length >= 100 &&
    heroImagePreview &&
    basePrice > 0;

  const addIncludeItem = () => {
    if (newInclude.trim()) {
      setIncludes([...includes, newInclude.trim()]);
      setNewInclude("");
    }
  };

  const removeInclude = (index: number) => {
    setIncludes(includes.filter((_, i) => i !== index));
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryImages([...galleryImages, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${path}-${Date.now()}.${fileExt}`;
      const filePath = `${hotelId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("experience-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("experience-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSaveDraft = async (data: ExperienceFormData) => {
    setIsSaving(true);
    try {
      // Upload hero image
      let heroImageUrl = null;
      if (heroImage) {
        heroImageUrl = await uploadImage(heroImage, "hero");
        if (!heroImageUrl) {
          toast.error("Failed to upload hero image");
          return;
        }
      }

      // Upload gallery images
      const galleryUrls: string[] = [];
      for (const image of galleryImages) {
        const url = await uploadImage(image, "gallery");
        if (url) galleryUrls.push(url);
      }

      // Create experience record
      const slug = generateSlug(data.title);
      const experienceData = {
        hotel_id: hotelId,
        title: data.title,
        subtitle: data.subtitle || null,
        category: data.category,
        long_copy: data.description,
        min_nights: data.min_nights,
        max_nights: data.max_nights,
        min_party: data.min_party,
        max_party: data.max_party,
        cancellation_policy: data.cancellation_policy || null,
        base_price: data.base_price,
        currency: data.currency,
        base_price_type: data.base_price_type,
        hero_image: heroImageUrl,
        photos: galleryUrls.length > 0 ? galleryUrls : null,
        includes: includes.length > 0 ? includes : null,
        slug: `${slug}-${Date.now()}`,
        status: "draft" as const,
      };

      const { error } = await supabase.from("experiences").insert(experienceData as any);

      if (error) throw error;

      toast.success("Experience saved as draft");
      queryClient.invalidateQueries({ queryKey: ["hotel-experiences", hotelId] });
      
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("Failed to save experience");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (data: ExperienceFormData) => {
    if (!canPublish) {
      toast.error("Please fill all required fields before publishing");
      return;
    }
    setIsSaving(true);
    try {
      // Upload hero image
      let heroImageUrl = null;
      if (heroImage) {
        heroImageUrl = await uploadImage(heroImage, "hero");
        if (!heroImageUrl) {
          toast.error("Failed to upload hero image");
          return;
        }
      }

      // Upload gallery images
      const galleryUrls: string[] = [];
      for (const image of galleryImages) {
        const url = await uploadImage(image, "gallery");
        if (url) galleryUrls.push(url);
      }

      // Create experience record
      const slug = generateSlug(data.title);
      const experienceData = {
        hotel_id: hotelId,
        title: data.title,
        subtitle: data.subtitle || null,
        category: data.category,
        long_copy: data.description,
        min_nights: data.min_nights,
        max_nights: data.max_nights,
        min_party: data.min_party,
        max_party: data.max_party,
        cancellation_policy: data.cancellation_policy || null,
        base_price: data.base_price,
        currency: data.currency,
        base_price_type: data.base_price_type,
        hero_image: heroImageUrl,
        photos: galleryUrls.length > 0 ? galleryUrls : null,
        includes: includes.length > 0 ? includes : null,
        slug: `${slug}-${Date.now()}`,
        status: "pending" as const,
      };

      const { error } = await supabase.from("experiences").insert(experienceData as any);

      if (error) throw error;

      setStatus("pending");
      toast.success("Experience submitted for approval");
      queryClient.invalidateQueries({ queryKey: ["hotel-experiences", hotelId] });
      
      if (onClose) onClose();
    } catch (error) {
      console.error("Error publishing experience:", error);
      toast.error("Failed to publish experience");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-sans text-4xl font-bold mb-2">
            {experienceId ? "Edit Experience" : "Create a new experience"}
          </h1>
          <p className="text-muted-foreground">
            Define your experience details, images, pricing, and availability.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSubmit(handleSaveDraft)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save as Draft
          </Button>
          <Button
            onClick={handleSubmit(handlePublish)}
            disabled={!canPublish || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            Publish
          </Button>
        </div>
      </div>

      <form className="space-y-6">
        {/* Bloc 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              General information displayed on the public Staymakom listing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Experience Title *</Label>
              <Input
                id="title"
                placeholder="e.g., A Taste of Slowness"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                placeholder="e.g., Farm-to-table dinner & wellness retreat"
                {...register("subtitle")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="romantic">Romantic</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="nature">Nature</SelectItem>
                    <SelectItem value="culinary">Culinary</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <Label>Linked Hotel</Label>
                <Input value={hotelName} disabled />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description * (min 100 characters)</Label>
              <Textarea
                id="description"
                placeholder="What you'll do during this experience..."
                rows={6}
                {...register("description")}
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
                <p className="text-sm text-muted-foreground ml-auto">
                  {description?.length || 0} / 100 characters minimum
                </p>
              </div>
            </div>

            <div className="mb-4">
              <NightsRangeSelector
                minValue={minNights}
                maxValue={maxNights}
                onMinChange={(value) => setValue("min_nights", value)}
                onMaxChange={(value) => setValue("max_nights", value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_party">Min participants *</Label>
                <Input
                  id="min_party"
                  type="number"
                  min="1"
                  {...register("min_party", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="max_party">Max participants *</Label>
                <Input
                  id="max_party"
                  type="number"
                  min="1"
                  {...register("max_party", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
              <Select
                onValueChange={(value) => setValue("cancellation_policy", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible (72h before)</SelectItem>
                  <SelectItem value="moderate">Moderate (7 days before)</SelectItem>
                  <SelectItem value="strict">Strict (14 days before)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bloc 2: Images & Media */}
        <Card>
          <CardHeader>
            <CardTitle>Images & Media</CardTitle>
            <CardDescription>Upload images to showcase your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Hero Image * (Main image)</Label>
              <input
                type="file"
                id="hero-image-input"
                accept="image/*"
                onChange={handleHeroImageChange}
                className="hidden"
              />
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer mt-2"
                onClick={() => document.getElementById('hero-image-input')?.click()}
              >
                {heroImagePreview ? (
                  <div className="relative">
                    <img 
                      src={heroImagePreview} 
                      alt="Hero preview" 
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroImage(null);
                        setHeroImagePreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </>
                )}
              </div>
              {!heroImagePreview && (
                <p className="text-sm text-destructive mt-1">Hero image is required</p>
              )}
            </div>

            <div>
              <Label>Gallery (6-8 images)</Label>
              <input
                type="file"
                id="gallery-images-input"
                accept="image/*"
                multiple
                onChange={handleGalleryImagesChange}
                className="hidden"
              />
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer mt-2"
                onClick={() => document.getElementById('gallery-images-input')?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload multiple images
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag to reorder images
                </p>
              </div>
              
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={preview} 
                        alt={`Gallery ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bloc 3: What's Included */}
        <Card>
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
            <CardDescription>Define what is included in the experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Includes</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="e.g., Private yoga class"
                  value={newInclude}
                  onChange={(e) => setNewInclude(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIncludeItem())}
                />
                <Button type="button" onClick={addIncludeItem} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {includes.map((item, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeInclude(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloc 4: Extras (Add-ons) */}
        <Card>
          <CardHeader>
            <CardTitle>Extras (Add-ons)</CardTitle>
            <CardDescription>
              Link optional extras to this experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Link Existing Extras
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              You can create and manage extras in the Extras section
            </p>
          </CardContent>
        </Card>

        {/* Bloc 5: Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Define your experience pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_price">Base Price *</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("base_price", { valueAsNumber: true })}
                />
                {errors.base_price && (
                  <p className="text-sm text-destructive mt-1">{errors.base_price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  defaultValue="ILS"
                  onValueChange={(value) => setValue("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ILS">ILS (₪)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Pricing Type</Label>
              <Select
                defaultValue="per_person"
                onValueChange={(value: any) => setValue("base_price_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_booking">Fixed per booking</SelectItem>
                  <SelectItem value="per_person">Per person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {basePrice > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Will display as: <span className="font-semibold text-foreground">
                    From {basePrice} {watch("currency")} {watch("base_price_type") === "per_person" ? "per person" : "per booking"}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bloc 6: Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>Define when this experience is available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Always Available</Label>
                <p className="text-sm text-muted-foreground">
                  This experience is available year-round
                </p>
              </div>
              <Switch
                checked={alwaysAvailable}
                onCheckedChange={(checked) => setValue("always_available", checked)}
              />
            </div>

            {!alwaysAvailable && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" />
                  </div>
                </div>

                <div>
                  <Label>Available Days</Label>
                  <div className="flex gap-2 mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Max Sessions per Day</Label>
                  <Input type="number" min="1" defaultValue="1" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bloc 7: Status & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Internal Notes</CardTitle>
            <CardDescription>Manage experience status and internal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label>Current Status</Label>
                <p className="text-sm mt-1">
                  <Badge variant={status === "published" ? "default" : "secondary"}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Created: {new Date().toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last modified: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <Textarea
                id="internal_notes"
                placeholder="Notes visible only to hotel staff..."
                rows={3}
                {...register("internal_notes")}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="outline">
                Archive
              </Button>
              <Button type="button" variant="destructive">
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
