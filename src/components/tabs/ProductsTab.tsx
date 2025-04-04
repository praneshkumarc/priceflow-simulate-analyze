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
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import SpecificationDropdown from '@/components/SpecificationDropdown';
import { 
  PROCESSOR_OPTIONS,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  DISPLAY_HZ_OPTIONS,
  CAMERA_MP_OPTIONS,
  BATTERY_CAPACITY_OPTIONS,
  OS_OPTIONS,
  COLOR_OPTIONS
} from '@/constants/productSpecifications';
import { useAuth } from '@/contexts/AuthContext';
import { useProductSelection } from '@/hooks/use-product-selection';

const ProductsTab: React.FC = () => {
  const { userAddedProducts, loading: productsLoading, addUserProduct } = useProductSelection();
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
    const dataset = dataService.getDataset();
    setDataset(dataset || []);
    
    setProducts(userAddedProducts);
    
    if (dataset && dataset.length > 0) {
      const brands = [...new Set(dataset.map(item => item.Brand))];
      
      const allModels = [...new Set(dataset.map(item => item.Model))];
      const limitedModels = allModels.slice(0, 20);
      
      const categories = [...new Set(dataset.map(item => item.Category))];
      
      setUniqueBrands(brands);
      setUniqueModels(limitedModels);
      setUniqueCategories(categories);
    }
  }, [userAddedProducts]);

  useEffect(() => {
    if (selectedBrand && dataset) {
      const models = [...new Set(dataset
        .filter(item => item.Brand === selectedBrand)
        .map(item => item.Model))];
      setFilteredModels(models.slice(0, 20));
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
      battery: BATTERY_CAPACITY_OPTIONS[0],
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
        
        if (matchingSpecs) {
          form.setValue("storage", matchingSpecs.Storage);
          form.setValue("ram", matchingSpecs.RAM);
          form.setValue("processor", matchingSpecs["Processor Type"]);
          form.setValue("display", matchingSpecs["Display Hz"]);
          form.setValue("camera", matchingSpecs["Camera MP"]);
          form.setValue("battery", matchingSpecs["Battery Capacity"]);
          form.setValue("os", matchingSpecs.OS || OS_OPTIONS[0]);
          form.setValue("color", matchingSpecs.Color || COLOR_OPTIONS[0]);
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
        description: "Please login to add products",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    const specsMatch = verifySpecifications(values);
    
    if (!specsMatch) {
      toast({
        title: "Specifications Error",
        description: "Specifications do not match existing products",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    
    const productData: Omit<Product, 'id'> = {
      name: `${values.brand} ${values.model}`,
      basePrice: Number(values.price),
      category: values.category,
      inventory: values.stock,
      cost: Number(values.price) * 0.7,
      seasonality: values.seasonalEffect / 10,
      specifications: {
        model: values.model,
        storage: values.storage,
        ram: values.ram,
        processor: values.processor,
        displayHz: values.display,
        cameraMp: values.camera,
        batteryCapacity: values.battery,
        os: values.os,
        color: values.color,
        monthOfSale: values.month,
        seasonalEffect: values.seasonalEffect,
        demandLevel: values.demandLevel,
        yearOfSale: values.yearOfSale
      }
    };
    
    const newProduct = await addUserProduct(productData);
    
    if (newProduct) {
      setLoading(false);
      setShowAddForm(false);
      form.reset();
    } else {
      setLoading(false);
    }
  };

  const verifySpecifications = (values: z.infer<typeof formSchema>) => {
    const matchingProducts = dataset.filter(item => 
      item.Brand === values.brand && item.Model === values.model);
    
    if (matchingProducts.length === 0) return true;
    
    const specs = matchingProducts[0].Specifications;
    
    if (!STORAGE_OPTIONS.includes(values.storage as any)) return false;
    if (!RAM_OPTIONS.includes(values.ram as any)) return false;
    if (!PROCESSOR_OPTIONS.includes(values.processor as any)) return false;
    if (!DISPLAY_HZ_OPTIONS.includes(values.display as any)) return false;
    if (!CAMERA_MP_OPTIONS.includes(values.camera as any)) return false;
    if (!BATTERY_CAPACITY_OPTIONS.includes(values.battery as any)) return false;
    if (values.os && !OS_OPTIONS.includes(values.os as any)) return false;
    if (values.color && !COLOR_OPTIONS.includes(values.color as any)) return false;
    
    return true;
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
            {user ? 'Manage and add your products to your inventory' : 'Please login to manage your products'}
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
          disabled={!user}
        >
          {showAddForm ? "Cancel" : <><Plus className="h-4 w-4" /> Add Product</>}
        </Button>
      </div>

      {!user && (
        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You need to be logged in to manage your products.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <SpecificationDropdown
                      control={form.control}
                      name="storage"
                      label="Storage"
                      options={STORAGE_OPTIONS}
                    />
                    
                    <SpecificationDropdown
                      control={form.control}
                      name="ram"
                      label="RAM"
                      options={RAM_OPTIONS}
                    />
                    
                    <SpecificationDropdown
                      control={form.control}
                      name="processor"
                      label="Processor"
                      options={PROCESSOR_OPTIONS}
                    />
                    
                    <SpecificationDropdown
                      control={form.control}
                      name="display"
                      label="Display Hz"
                      options={DISPLAY_HZ_OPTIONS}
                    />
                    
                    <SpecificationDropdown
                      control={form.control}
                      name="camera"
                      label="Camera MP"
                      options={CAMERA_MP_OPTIONS}
                    />
                    
                    <SpecificationDropdown
                      control={form.control}
                      name="battery"
                      label="Battery Capacity"
                      options={BATTERY_CAPACITY_OPTIONS}
                    />
                    
                    <SpecificationDropdown
                      control={form.control}
                      name="os"
                      label="OS"
                      options={OS_OPTIONS}
                    />
                    
                    <SpecificationDropdown
                      control={form.control}
                      name="color"
                      label="Color"
                      options={COLOR_OPTIONS}
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
        {productsLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {products.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>
                    {product.category} - ${product.basePrice.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Stock:</span> {product.inventory}
                    </div>
                    <div>
                      <span className="font-medium">Cost:</span> ${product.cost.toFixed(2)}
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
                  {user ? "Click the \"Add Product\" button to add your first product." 
                       : "Please login to add and manage your products."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsTab;
