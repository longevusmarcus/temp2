import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, Plus, Trash2, Upload, Image, MapPin } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const ManualPurchaseCreator = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "iamchokaofficial@gmail.com",
    projectName: "My Project",
    developerName: "My Name",
    description: "Project description",
    websiteUrl: "https://example.com",
    blockSize: "medium",
    category: "Web App",
    thumbnailUrl: "",
  });

  const [locations, setLocations] = useState<{ x: number; y: number }[]>([
    { x: 50, y: 50 },
  ]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pixelBlocks, setPixelBlocks] = useState<any[]>([]);
  const [gridSize, setGridSize] = useState({ width: 1000, height: 1000 });
  const [viewportSize, setViewportSize] = useState({ width: 600, height: 400 });
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [mapScale, setMapScale] = useState(0.5);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Get Supabase client
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch existing pixel blocks to show on the map
  useEffect(() => {
    const fetchPixelBlocks = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPixelBlocks(data || []);
      } catch (err) {
        console.error("Error fetching pixel blocks:", err);
      }
    };

    fetchPixelBlocks();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const getBlockDimensions = (blockSize: string) => {
    switch (blockSize) {
      case "small":
        return { width: 10, height: 10 };
      case "medium":
        return { width: 20, height: 20 };
      case "large":
        return { width: 50, height: 50 };
      default:
        return { width: 20, height: 20 };
    }
  };

  const getRandomColor = () => {
    const colors = [
      "#ff5588",
      "#5588ff",
      "#44cc88",
      "#ffaa22",
      "#33ccff",
      "#ff33cc",
      "#cc33ff",
      "#33ffcc",
      "#ffcc33",
      "#3366ff",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      // Store the image URL
      const imageUrl = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: imageUrl,
      }));
      console.log(
        "Image uploaded and set to thumbnailUrl:",
        imageUrl.substring(0, 50) + "...",
      );
    };
    reader.readAsDataURL(file);
  };

  const addLocation = (x = 0, y = 0) => {
    setLocations([...locations, { x, y }]);
    setSelectedLocation(locations.length);
  };

  const removeLocation = (index: number) => {
    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
    if (selectedLocation === index) {
      setSelectedLocation(null);
    } else if (selectedLocation !== null && selectedLocation > index) {
      setSelectedLocation(selectedLocation - 1);
    }
  };

  const updateLocation = (index: number, field: "x" | "y", value: number) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);
  };

  // Map interaction handlers
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / mapScale - mapOffset.x);
    const y = Math.floor((e.clientY - rect.top) / mapScale - mapOffset.y);

    // Check if we're selecting an existing location
    const clickedLocationIndex = locations.findIndex((loc) => {
      const dimensions = getBlockDimensions(formData.blockSize);
      return (
        x >= loc.x &&
        x < loc.x + dimensions.width &&
        y >= loc.y &&
        y < loc.y + dimensions.height
      );
    });

    if (clickedLocationIndex >= 0) {
      setSelectedLocation(clickedLocationIndex);
    } else {
      // Add new location at click position
      addLocation(x, y);
    }
  };

  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Middle mouse button (wheel) or right click for panning
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / mapScale;
      const dy = (e.clientY - dragStart.y) / mapScale;
      setMapOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMapMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom in or out
    const newScale = Math.max(0.1, Math.min(2, mapScale * delta));
    setMapScale(newScale);
  };

  // Reset map view
  const resetMapView = () => {
    setMapScale(0.5);
    setMapOffset({ x: 0, y: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locations.length === 0) {
      setError("Please add at least one location");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Creating project...");

    try {
      // First create a checkout record
      const checkoutId = `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const dimensions = getBlockDimensions(formData.blockSize);

      // Create checkout record
      const { error: checkoutError } = await supabase
        .from("polar_checkouts")
        .insert({
          checkout_id: checkoutId,
          email: formData.email,
          status: "completed",
          processed: true,
          processed_at: new Date().toISOString(),
          metadata: {
            projectName: formData.projectName,
            developerName: formData.developerName,
            description: formData.description,
            websiteUrl: formData.websiteUrl,
            blockSize: formData.blockSize,
            locations: locations,
            category: formData.category,
            thumbnailUrl: formData.thumbnailUrl,
          },
        });

      if (checkoutError) throw checkoutError;

      // Create project records for each location
      for (const location of locations) {
        const { error: projectError } = await supabase.from("projects").insert({
          project_name: formData.projectName,
          developer_name: formData.developerName,
          description: formData.description,
          website_url: formData.websiteUrl,
          x: location.x,
          y: location.y,
          width: dimensions.width,
          height: dimensions.height,
          color: getRandomColor(),
          category: formData.category,
          email: formData.email,
          thumbnail_url: formData.thumbnailUrl || null,
        });

        if (projectError) throw projectError;
      }

      setStatus(`Successfully created ${locations.length} project(s)!`);
      // Reset form after successful creation
      if (locations.length > 1) {
        setLocations([{ x: 50, y: 50 }]);
      }
      setImagePreview(null);
    } catch (err: any) {
      setError(`Error creating project: ${err.message}`);
      console.error("Error creating project:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Manual Purchase Creator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Email</label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">Block Size</label>
              <Select
                value={formData.blockSize}
                onValueChange={(value) =>
                  handleSelectChange("blockSize", value)
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="small">Small (10×10)</SelectItem>
                  <SelectItem value="medium">Medium (20×20)</SelectItem>
                  <SelectItem value="large">Large (50×50)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Project Name</label>
            <Input
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Developer Name</label>
            <Input
              name="developerName"
              value={formData.developerName}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Website URL</label>
            <Input
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger
                  value="map"
                  className="data-[state=active]:bg-purple-900/30"
                >
                  Visual Map
                </TabsTrigger>
                <TabsTrigger
                  value="coordinates"
                  className="data-[state=active]:bg-purple-900/30"
                >
                  Coordinates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300 font-medium">
                      Click on the map to add locations
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={resetMapView}
                        variant="outline"
                        size="sm"
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        Reset View
                      </Button>
                      <Button
                        type="button"
                        onClick={() => addLocation()}
                        variant="outline"
                        size="sm"
                        className="bg-purple-900/30 border-purple-700 hover:bg-purple-800/30"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Location
                      </Button>
                    </div>
                  </div>

                  <div
                    className="relative w-full h-[400px] overflow-hidden bg-gray-950 border border-gray-800 rounded-md cursor-crosshair"
                    onClick={handleMapClick}
                    onMouseDown={handleMapMouseDown}
                    onMouseMove={handleMapMouseMove}
                    onMouseUp={handleMapMouseUp}
                    onMouseLeave={handleMapMouseUp}
                    onWheel={handleMapWheel}
                    onContextMenu={(e) => e.preventDefault()} // Prevent context menu on right click
                  >
                    <div
                      className="absolute grid grid-cols-[repeat(100,10px)] grid-rows-[repeat(100,10px)] gap-[1px]"
                      style={{
                        transform: `scale(${mapScale}) translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                        transformOrigin: "0 0",
                        width: `${gridSize.width}px`,
                        height: `${gridSize.height}px`,
                      }}
                    >
                      {/* Grid background */}
                      <div className="absolute inset-0 bg-gray-900 opacity-50 pointer-events-none" />

                      {/* Existing pixel blocks */}
                      {pixelBlocks.map((block) => {
                        const style = {
                          left: `${block.x}px`,
                          top: `${block.y}px`,
                          width: `${block.width}px`,
                          height: `${block.height}px`,
                          backgroundColor: block.color || "#6d28d9",
                        };
                        return (
                          <div
                            key={block.id}
                            className="absolute rounded-sm opacity-70"
                            style={style}
                            title={`${block.project_name} (${block.x},${block.y})`}
                          />
                        );
                      })}

                      {/* Selected locations */}
                      {locations.map((location, index) => {
                        const dimensions = getBlockDimensions(
                          formData.blockSize,
                        );
                        const style = {
                          left: `${location.x}px`,
                          top: `${location.y}px`,
                          width: `${dimensions.width}px`,
                          height: `${dimensions.height}px`,
                          backgroundColor:
                            selectedLocation === index ? "#f43f5e" : "#8b5cf6",
                          opacity: selectedLocation === index ? 0.8 : 0.5,
                          zIndex: selectedLocation === index ? 10 : 5,
                        };
                        return (
                          <div
                            key={`location-${index}`}
                            className="absolute rounded-sm flex items-center justify-center"
                            style={style}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLocation(index);
                            }}
                          >
                            <div className="text-white text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Map controls overlay */}
                    <div className="absolute bottom-3 right-3 bg-gray-900/80 p-2 rounded-md text-xs text-gray-300">
                      <div>Zoom: {Math.round(mapScale * 100)}%</div>
                      <div>Middle-click or right-click to pan</div>
                      <div>Scroll to zoom</div>
                    </div>
                  </div>

                  {/* Selected location details */}
                  {selectedLocation !== null && (
                    <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-purple-300">
                          Selected Location #{selectedLocation + 1}
                        </h4>
                        <Button
                          type="button"
                          onClick={() => removeLocation(selectedLocation)}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="text-xs text-gray-400">
                            X Position
                          </label>
                          <Input
                            type="number"
                            value={locations[selectedLocation].x}
                            onChange={(e) =>
                              updateLocation(
                                selectedLocation,
                                "x",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="bg-gray-800 border-gray-700 h-8 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">
                            Y Position
                          </label>
                          <Input
                            type="number"
                            value={locations[selectedLocation].y}
                            onChange={(e) =>
                              updateLocation(
                                selectedLocation,
                                "y",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="bg-gray-800 border-gray-700 h-8 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="coordinates" className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300 font-medium">
                      Locations (Coordinates)
                    </label>
                    <Button
                      type="button"
                      onClick={() => addLocation()}
                      variant="outline"
                      size="sm"
                      className="bg-purple-900/30 border-purple-700 hover:bg-purple-800/30"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Location
                    </Button>
                  </div>

                  {locations.map((location, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded-md border ${selectedLocation === index ? "bg-purple-900/30 border-purple-700" : "bg-gray-800/50 border-gray-700"}`}
                      onClick={() => setSelectedLocation(index)}
                    >
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-400">
                            X Position
                          </label>
                          <Input
                            type="number"
                            value={location.x}
                            onChange={(e) =>
                              updateLocation(
                                index,
                                "x",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="bg-gray-800 border-gray-700 h-8 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">
                            Y Position
                          </label>
                          <Input
                            type="number"
                            value={location.y}
                            onChange={(e) =>
                              updateLocation(
                                index,
                                "y",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="bg-gray-800 border-gray-700 h-8 mt-1"
                          />
                        </div>
                      </div>
                      {locations.length > 1 && (
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLocation(index);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Project Image</label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Image</span>
                </label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {imagePreview && (
                <div className="relative w-full max-w-xs p-2 bg-gray-800/50 border border-gray-700 rounded-md">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-32 object-contain rounded"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, thumbnailUrl: "" }));
                    }}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {!imagePreview && (
                <div className="flex items-center justify-center w-full max-w-xs h-24 bg-gray-800/30 border border-dashed border-gray-700 rounded-md">
                  <div className="flex flex-col items-center text-gray-500">
                    <Image className="h-8 w-8 mb-1" />
                    <span className="text-xs">No image selected</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
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

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}

          {status && (
            <div className="p-3 bg-green-900/30 border border-green-700 rounded-md text-green-200 text-sm">
              {status}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Create Purchase Manually"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualPurchaseCreator;
