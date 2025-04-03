
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataService } from '@/services/dataService';
import { SmartphoneProduct } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Check, Smartphone } from 'lucide-react';

const ProductAdditionTab: React.FC = () => {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [inventory, setInventory] = useState<number>(10);
  const [color, setColor] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Get all available models from existing products
    const products = dataService.getAllProducts();
    const models = [...new Set(products.map(p => p.name.split(' ').slice(1).join(' ')))];
    setAvailableModels(models);
  }, []);
  
  const handleAddProduct = () => {
    if (!selectedModel) {
      toast({
        title: "Model Required",
        description: "Please select a model from the list.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Find products with this model name
      const allProducts = dataService.getAllProducts();
      const matchingProducts = allProducts.filter(p => 
        p.name.split(' ').slice(1).join(' ').toLowerCase() === selectedModel.toLowerCase()
      );
      
      if (matchingProducts.length === 0) {
        toast({
          title: "Model Not Found",
          description: "The selected model could not be found in the dataset.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Use the first matching product as template
      const templateProduct = matchingProducts[0] as SmartphoneProduct;
      
      // Calculate competitor price as average of existing price and competitor price
      const competitorPrices = dataService.getCompetitorPrices(templateProduct.id);
      const avgCompetitorPrice = dataService.getAverageCompetitorPrice(templateProduct.id);
      const newCompetitorPrice = (templateProduct.basePrice + avgCompetitorPrice) / 2;
      
      // Create new product with modified attributes but same specifications
      const newProduct: SmartphoneProduct = {
        id: `product-${Date.now()}`,
        name: `${color || templateProduct.specifications.color || 'New'} ${selectedModel}`,
        basePrice: templateProduct.basePrice,
        category: templateProduct.category,
        inventory: inventory,
        cost: templateProduct.cost,
        seasonality: templateProduct.seasonality,
        specifications: {
          ...templateProduct.specifications,
          color: color || templateProduct.specifications.color
        }
      };
      
      // Add the new product to the dataService
      dataService.addNewProduct(newProduct, newCompetitorPrice);
      
      toast({
        title: "Product Added Successfully",
        description: `Added ${newProduct.name} to the product database`,
        variant: "default"
      });
      
      // Reset form
      setSelectedModel('');
      setInventory(10);
      setColor('');
      
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add the product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-app-blue-500" />
            <CardTitle>Add New Product</CardTitle>
          </div>
          <CardDescription>
            Add new products based on existing models in your dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Select Model</Label>
              <Select 
                value={selectedModel} 
                onValueChange={setSelectedModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                You can only add products based on models that exist in your dataset
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory Quantity</Label>
              <Input
                id="inventory"
                type="number"
                min="1"
                value={inventory}
                onChange={(e) => setInventory(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color Variant (Optional)</Label>
              <Input
                id="color"
                placeholder="e.g., Midnight Black, Rose Gold"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleAddProduct} 
              disabled={loading || !selectedModel} 
              className="w-full"
            >
              {loading ? "Adding Product..." : "Add Product"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductAdditionTab;
