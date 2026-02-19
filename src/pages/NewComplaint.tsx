import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LeafletMap } from "@/components/LeafletMap";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { classifyComplaint } from "@/lib/classifyComplaint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, ImagePlus, MapPin, Send } from "lucide-react";

export default function NewComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const classification = description.length > 3 ? classifyComplaint(description) : null;

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPos([lat, lng]);
    setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        setSelectedPos([lat, lng]);
        setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setShowLocationOptions(false);
        setDetectingLocation(false);
        toast.success("Current location added");
      },
      () => {
        setDetectingLocation(false);
        toast.error("Unable to fetch current location");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("Image is too large. Please select an image up to 1 MB.");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read the selected image"));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const result = classifyComplaint(description);
    setLoading(true);
    let imageUrl: string | null = null;

    if (imageFile) {
      try {
        imageUrl = await fileToDataUrl(imageFile);
      } catch (err) {
        setLoading(false);
        toast.error(err instanceof Error ? err.message : "Failed to process image");
        return;
      }
    }

    const { error } = await supabase.from("complaints").insert({
      user_id: user.id,
      title,
      description,
      location,
      latitude: selectedPos?.[0] ?? null,
      longitude: selectedPos?.[1] ?? null,
      category: result.category,
      priority: result.priority,
      status: "Pending",
      image_url: imageUrl,
    });

    setLoading(false);
    if (error) {
      toast.error(`Failed to submit complaint: ${error.message}`);
    } else {
      toast.success(`Complaint submitted! Classified as ${result.category} (${result.priority} priority)`);
      navigate("/complaints");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Submit New Complaint</h1>
          <p className="text-sm text-muted-foreground">Our AI engine will automatically classify and prioritize your complaint</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">Complaint Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief title of your complaint" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    rows={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-image">Add Image</Label>
                  <Input
                    id="complaint-image"
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()}>
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                  {imageFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {imageFile.name}
                    </p>
                  )}
                  {imagePreviewUrl && (
                    <img
                      src={imagePreviewUrl}
                      alt="Complaint preview"
                      className="h-40 w-full rounded-md object-cover border"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        onFocus={() => setShowLocationOptions(true)}
                        onBlur={() => setTimeout(() => setShowLocationOptions(false), 120)}
                        placeholder="Click on map or type location"
                        required
                      />
                    </div>
                    {showLocationOptions && (
                      <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-md p-1">
                        <button
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={handleUseCurrentLocation}
                          disabled={detectingLocation}
                          className="w-full text-left text-sm px-3 py-2 rounded hover:bg-muted disabled:opacity-60"
                        >
                          {detectingLocation ? "Fetching current location..." : "Use current location"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {classification && (
              <Card className="shadow-card border-accent/30 animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent">AI Classification Engine</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <Badge variant="secondary" className="mt-1">{classification.category}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Priority</p>
                      <div className="mt-1">
                        <PriorityBadge priority={classification.priority} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full gradient-accent text-accent-foreground" disabled={loading}>
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Submitting..." : "Submit Complaint"}
            </Button>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Select Location on Map</CardTitle>
            </CardHeader>
            <CardContent>
              <LeafletMap
                onClick={handleMapClick}
                selectedPosition={selectedPos}
                zoom={5}
                className="h-[450px] w-full rounded-lg"
              />
              {selectedPos && (
                <p className="text-xs text-muted-foreground mt-2">
                  📍 Selected: {selectedPos[0].toFixed(4)}, {selectedPos[1].toFixed(4)}
                </p>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
