import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ProjectDetails } from "../lib/types";
import { Image } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ProjectDetailsFormProps {
  initialValues: ProjectDetails;
  onSubmit: (details: ProjectDetails) => void;
  onCancel: () => void;
}

export function ProjectDetailsForm({
  initialValues,
  onSubmit,
  onCancel,
}: ProjectDetailsFormProps) {
  const [formData, setFormData] = useState<ProjectDetails>(initialValues);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Update form data with the file
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full bg-background p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your project name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your project"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            name="category"
            value={formData.category}
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                category: value,
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Web App">Web App</SelectItem>
              <SelectItem value="Mobile App">Mobile App</SelectItem>
              <SelectItem value="Gaming">Gaming</SelectItem>
              <SelectItem value="SaaS">SaaS</SelectItem>
              <SelectItem value="Social Networks">Social Networks</SelectItem>
              <SelectItem value="Tools">Tools</SelectItem>
              <SelectItem value="Ecommerces">Ecommerces</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Project Image</Label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            ref={fileInputRef}
          />
          <div
            className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={triggerFileInput}
          >
            {imagePreview ? (
              <div className="w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-md object-contain"
                />
                <p className="text-sm text-center mt-2 text-muted-foreground">
                  Click to change image
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <Image className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Click to upload an image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG or GIF (max. 2MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </div>
  );
}

// Add default export
export default ProjectDetailsForm;
