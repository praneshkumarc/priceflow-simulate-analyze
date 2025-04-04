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

  useEffect(() => {
    const dataset = dataService.getDataset();
    const allProducts = dataService.getAllProducts();
    
    setDataset(dataset || []);
    setProducts(allProducts);
    
    if (dataset && dataset.length > 0) {
      const brands = [...new Set(dataset.map(item => item.Brand))];
      const models = [...new Set(dataset.map(item => item.Model))];
      const categories = [...new Set(dataset.map(item => item.Category))];
      
      setUniqueBrands(brands);
      setUniqueModels(models);
      setUniqueCategories(categories);
    }
  }, []);

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
      storage: "",
      ram: "",
      processor: "",
      display: 60,
      camera: 12,
      battery: "",
      os: "",
      color: "",
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
          form.setValue("os", matchingSpecs.OS || "");
          form.setValue("color", matchingSpecs.Color || "");
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
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
    
    const existingProductData = dataset.find(item => item.Model === values.model);
    if (existingProductData && existingProductData["Competitor Price"]) {
      const currentPrice = parseFloat(values.price);
      const competitorPrice = existingProductData["Competitor Price"];
      const newCompetitorPrice = (currentPrice + competitorPrice) / 2;
      
      newProduct["Competitor Price"] = newCompetitorPrice;
    }
    
    dataService.addProduct(newProduct);
    
    toast({
      title: "Product Added",
      description: `Successfully added ${values.brand} ${values.model}`,
    });
    
    setProducts(dataService.getAllProducts());
    setLoading(false);
    setShowAddForm(false);
    form.reset();
  };

  const verifySpecifications = (values: z.infer<typeof formSchema>) => {
    const matchingProducts = dataset.filter(item => 
      item.Brand === values.brand && item.Model === values.model);
    
    if (matchingProducts.length === 0) return true;
    
    const specs = matchingProducts[0].Specifications;
    
    return (
      specs.Storage === values.storage &&
      specs.RAM === values.ram &&
      specs["Processor Type"] === values.processor &&
      specs["Display Hz"] === values.display &&
      specs["Camera MP"] === values.camera &&
      specs["Battery Capacity"] === values.battery &&
      (specs.OS === values.os || (!specs.OS && !values.os)) &&
      (specs.Color === values.color || (!specs.Color && !values.color))
    );
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
                          <FormControl>
                            <Input placeholder="e.g. 128GB" {...field} />
                          </FormControl>
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
                          <FormControl>
                            <Input placeholder="e.g. 8GB" {...field} />
                          </FormControl>
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
                          <FormControl>
                            <Input placeholder="e.g. A15 Bionic" {...field} />
                          </FormControl>
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
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 120" 
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
                      name="camera"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Camera MP</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 12" 
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
                      name="battery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Battery Capacity</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 4000mAh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="os"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OS (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. iOS 16" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Midnight Black" {...field} />
                          </FormControl>
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
              Click the "Add Product" button to add your first product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsTab;
