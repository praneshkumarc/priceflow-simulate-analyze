
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { dataService } from '@/services/dataService';
import { SmartphoneInputData, Product } from '@/types';
import { Loader2, Plus, Package, Check } from 'lucide-react';
import { 
  Form, 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define dropdown options for specifications
const PROCESSOR_OPTIONS = ["A15 Bionic", "A16 Bionic", "A17 Pro"];
const RAM_OPTIONS = ["4GB", "6GB", "8GB"];
const STORAGE_OPTIONS = ["128GB", "256GB", "512GB"];
const DISPLAY_HZ_OPTIONS = [60, 120];
const CAMERA_MP_OPTIONS = [12, 48];
const BATTERY_OPTIONS = ["2018mAh", "3349mAh", "4323mAh"];
const OS_OPTIONS = ["iOS 15", "iOS 16", "iOS 17"];
const COLOR_OPTIONS = ["Midnight", "Silver", "Black Titanium", "Space Black", "Blue Titanium"];

const ProductsTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataset, setDataset] = useState<SmartphoneInputData[]>([]);
  const [uniqueBrands, setUniqueBrands] = useState<string[]>([]);
  const [uniqueModels, setUniqueModels] = useState<string[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [filteredModels, setFilteredModels] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [matchingSpecs, setMatchingSpecs] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const dataset = dataService.getDataset();
      
      // Get products for current user only
      let userProducts;
      if (user) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id);
            
          if (error) throw error;
          userProducts = data;
        } catch (error) {
          console.error('Error fetching user products:', error);
          userProducts = [];
        }
      } else {
        userProducts = dataService.getAllProducts();
      }
      
      setDataset(dataset || []);
      setProducts(userProducts || []);
      
      if (dataset && dataset.length > 0) {
        // Get unique models instead of all entries
        const brands = [...new Set(dataset.map(item => item.Brand))];
        const models = [...new Set(dataset.map(item => item.Model))];
        const categories = [...new Set(dataset.map(item => item.Category))];
        
        setUniqueBrands(brands);
        setUniqueModels(models);
        setUniqueCategories(categories);
      }
    };
    
    fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedBrand && dataset) {
      const models = [...new Set(dataset
        .filter(item => item.Brand === selectedBrand)
        .map(item => item.Model))];
      setFilteredModels(models);
    } else {
      setFilteredModels(uniqueModels);
    }
  }, [selectedBrand, dataset, uniqueModels]);

  useEffect(() => {
    if (selectedModel && dataset) {
      const matchingProduct = dataset.find(item => item.Model === selectedModel);
      if (matchingProduct) {
        setMatchingSpecs(matchingProduct.Specifications);
      } else {
        setMatchingSpecs(null);
      }
    } else {
      setMatchingSpecs(null);
    }
  }, [selectedModel, dataset]);

  const formSchema = z.object({
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    price: z.string().min(1, "Price is required"),
    stock: z.number().min(1, "Stock must be at least 1"),
    category: z.string().min(1, "Category is required"),
    storage: z.string().min(1, "Storage is required"),
    ram: z.string().min(1, "RAM is required"),
    processor: z.string().min(1, "Processor is required"),
    display: z.number().min(1, "Display refresh rate is required"),
    camera: z.number().min(1, "Camera resolution is required"),
    battery: z.string().min(1, "Battery capacity is required"),
    os: z.string().optional(),
    color: z.string().optional(),
    month: z.string().min(1, "Month is required"),
    seasonalEffect: z.number().min(1, "Seasonal effect is required"),
    demandLevel: z.number().min(1, "Demand level is required"),
    yearOfSale: z.number().min(2000, "Year must be valid")
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      price: "",
      stock: 1,
      category: "",
      storage: STORAGE_OPTIONS[0],
      ram: RAM_OPTIONS[0],
      processor: PROCESSOR_OPTIONS[0],
      display: DISPLAY_HZ_OPTIONS[0],
      camera: CAMERA_MP_OPTIONS[0],
      battery: BATTERY_OPTIONS[0],
      os: OS_OPTIONS[0],
      color: COLOR_OPTIONS[0],
      month: "January",
      seasonalEffect: 5,
      demandLevel: 5,
      yearOfSale: new Date().getFullYear()
    }
  });

  useEffect(() => {
    if (selectedModel && selectedBrand && matchingSpecs) {
      const matchingProduct = dataset.find(item => item.Model === selectedModel);
      
      if (matchingProduct) {
        form.setValue("brand", matchingProduct.Brand);
        form.setValue("model", matchingProduct.Model);
        form.setValue("price", matchingProduct.Price.toString());
        form.setValue("stock", matchingProduct.Stock || 10);
        form.setValue("category", matchingProduct.Category);
        
        // Set defaults for spec dropdowns from matching product when available
        if (matchingSpecs) {
          // For each spec, check if the value exists in our options, otherwise use default
          const storage = matchingSpecs.Storage;
          form.setValue("storage", STORAGE_OPTIONS.includes(storage) ? storage : STORAGE_OPTIONS[0]);
          
          const ram = matchingSpecs.RAM;
          form.setValue("ram", RAM_OPTIONS.includes(ram) ? ram : RAM_OPTIONS[0]);
          
          const processor = matchingSpecs["Processor Type"];
          form.setValue("processor", PROCESSOR_OPTIONS.includes(processor) ? processor : PROCESSOR_OPTIONS[0]);
          
          const display = matchingSpecs["Display Hz"];
          form.setValue("display", DISPLAY_HZ_OPTIONS.includes(display) ? display : DISPLAY_HZ_OPTIONS[0]);
          
          const camera = matchingSpecs["Camera MP"];
          form.setValue("camera", CAMERA_MP_OPTIONS.includes(camera) ? camera : CAMERA_MP_OPTIONS[0]);
          
          const battery = matchingSpecs["Battery Capacity"];
          form.setValue("battery", BATTERY_OPTIONS.includes(battery) ? battery : BATTERY_OPTIONS[0]);
          
          const os = matchingSpecs.OS;
          form.setValue("os", OS_OPTIONS.includes(os) ? os : OS_OPTIONS[0]);
          
          const color = matchingSpecs.Color;
          form.setValue("color", COLOR_OPTIONS.includes(color) ? color : COLOR_OPTIONS[0]);
        }
        
        if (matchingProduct["Month of Sale"]) {
          form.setValue("month", matchingProduct["Month of Sale"]);
        }
        if (matchingProduct["Seasonal Effect"]) {
          form.setValue("seasonalEffect", matchingProduct["Seasonal Effect"]);
        }
        if (matchingProduct["Demand Level"]) {
          form.setValue("demandLevel", matchingProduct["Demand Level"]);
        }
        if (matchingProduct.year_of_sale) {
          form.setValue("yearOfSale", matchingProduct.year_of_sale);
        }
      }
    }
  }, [selectedModel, selectedBrand, matchingSpecs, form, dataset]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to add products",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the product data
      const newProduct: SmartphoneInputData = {
        Brand: values.brand,
        Model: values.model,
        Price: values.price,
        "Original Price": values.price,
        Stock: values.stock,
        Category: values.category,
        Specifications: {
          Storage: values.storage,
          RAM: values.ram,
          "Processor Type": values.processor,
          "Display Hz": values.display,
          "Camera MP": values.camera,
          "Battery Capacity": values.battery,
          OS: values.os || undefined,
          Color: values.color || undefined
        },
        "Month of Sale": values.month,
        "Seasonal Effect": values.seasonalEffect,
        "Demand Level": values.demandLevel,
        year_of_sale: values.yearOfSale
      };
      
      // Save to local dataService
      const product = dataService.addProduct(newProduct);
      
      // Also save to Supabase for the current user
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: `${values.brand} ${values.model}`,
          category: values.category,
          price: parseFloat(values.price),
          sku: `${values.brand.substring(0, 3)}-${values.model.replace(/\s+/g, '')}-${Date.now().toString().substring(8)}`,
          seasonality: values.seasonalEffect.toString(),
          demand: values.demandLevel.toString(),
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Update the products list with the new Supabase data
      setProducts(prevProducts => [...prevProducts, data]);
      
      toast({
        title: "Product Added",
        description: `Successfully added ${values.brand} ${values.model}`,
      });
      
      setShowAddForm(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error Adding Product",
        description: error.message || "Failed to add the product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage and add products to your inventory
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          {showAddForm ? "Cancel" : <><Plus className="h-4 w-4" /> Add Product</>}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>
              Fill in the details to add a new product. Select a brand and model to auto-fill specifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Select 
                    value={selectedBrand} 
                    onValueChange={(value) => {
                      setSelectedBrand(value);
                      setSelectedModel("");  // Reset model when brand changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueBrands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                    disabled={!selectedBrand}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedBrand ? "Select Model" : "Select Brand First"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredModels.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {matchingSpecs && (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <div className="flex items-center gap-2 mb-2 text-green-700">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Specifications Found</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Specifications for this model have been pre-filled. You can proceed with adding the product.
                  </p>
                </div>
              )}
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter price" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter stock quantity" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {uniqueCategories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="storage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Storage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STORAGE_OPTIONS.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RAM</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select RAM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RAM_OPTIONS.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="processor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Processor</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Processor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROCESSOR_OPTIONS.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="display"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Hz</FormLabel>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Display Hz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DISPLAY_HZ_OPTIONS.map(option => (
                                <SelectItem key={option} value={option.toString()}>{option} Hz</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="camera"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Camera MP</FormLabel>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Camera MP" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CAMERA_MP_OPTIONS.map(option => (
                                <SelectItem key={option} value={option.toString()}>{option} MP</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="battery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Battery Capacity</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Battery" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BATTERY_OPTIONS.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="os"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OS</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select OS" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {OS_OPTIONS.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COLOR_OPTIONS.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month of Sale</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Month" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {months.map(month => (
                                <SelectItem key={month} value={month}>{month}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="seasonalEffect"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seasonal Effect (1-10)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="demandLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Demand Level (1-10)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="yearOfSale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Sale</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="2000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Product
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Add Product
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription>
                {product.category} - ${product.basePrice?.toFixed(2) || parseFloat(product.price.toString()).toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Stock:</span> {product.inventory || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Cost:</span> ${product.cost?.toFixed(2) || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {products.length === 0 && (
          <div className="col-span-full text-center py-10">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No Products Added</h3>
            <p className="text-muted-foreground">
              Click the "Add Product" button to add your first product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsTab;
