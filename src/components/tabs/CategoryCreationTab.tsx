
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { dataService } from '@/services/dataService';
import { Category } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tag, TagsIcon, Plus } from 'lucide-react';

const CategoryCreationTab: React.FC = () => {
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryDescription, setCategoryDescription] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Available specification attributes
  const availableAttributes = [
    { id: 'storage', label: 'Storage' },
    { id: 'ram', label: 'RAM' },
    { id: 'processor', label: 'Processor Type' },
    { id: 'display', label: 'Display Hz' },
    { id: 'camera', label: 'Camera MP' },
    { id: 'battery', label: 'Battery Capacity' },
    { id: 'os', label: 'OS' },
    { id: 'color', label: 'Color' }
  ];
  
  useEffect(() => {
    // Load existing categories
    const existingCategories = dataService.getAllCategories();
    setCategories(existingCategories);
  }, []);
  
  const handleAttributeToggle = (attribute: string) => {
    setSelectedAttributes(prev => {
      if (prev.includes(attribute)) {
        return prev.filter(attr => attr !== attribute);
      } else {
        return [...prev, attribute];
      }
    });
  };
  
  const handleCreateCategory = () => {
    if (!categoryName) {
      toast({
        title: "Category Name Required",
        description: "Please enter a name for the category.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedAttributes.length === 0) {
      toast({
        title: "Attributes Required",
        description: "Please select at least one attribute for the category.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create new category
      const newCategory: Category = {
        id: `category-${Date.now()}`,
        name: categoryName,
        description: categoryDescription || `Category for ${categoryName} products`,
        pricingRules: selectedAttributes.map(attr => ({
          id: `rule-${Date.now()}-${attr}`,
          name: `${attr} Rule`,
          description: `Rule based on ${attr}`,
          formula: `product.specifications.${attr}`
        }))
      };
      
      // Add the new category to the dataService
      dataService.addCategory(newCategory);
      
      // Refresh categories list
      const updatedCategories = dataService.getAllCategories();
      setCategories(updatedCategories);
      
      toast({
        title: "Category Created Successfully",
        description: `Created new category: ${categoryName}`,
        variant: "default"
      });
      
      // Reset form
      setCategoryName('');
      setCategoryDescription('');
      setSelectedAttributes([]);
      
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Failed to create the category. Please try again.",
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
            <TagsIcon className="h-5 w-5 text-app-blue-500" />
            <CardTitle>Create New Category</CardTitle>
          </div>
          <CardDescription>
            Create categories based on product specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Premium Smartphones"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description (Optional)</Label>
              <Input
                id="categoryDescription"
                placeholder="e.g., High-end smartphones with premium features"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Base Category On</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableAttributes.map((attr) => (
                  <div key={attr.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`attr-${attr.id}`}
                      checked={selectedAttributes.includes(attr.id)}
                      onCheckedChange={() => handleAttributeToggle(attr.id)}
                    />
                    <label
                      htmlFor={`attr-${attr.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {attr.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleCreateCategory} 
              disabled={loading || !categoryName || selectedAttributes.length === 0} 
              className="w-full"
            >
              {loading ? "Creating Category..." : "Create Category"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>Categories for product organization</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Attributes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {category.pricingRules.map(rule => (
                          <span key={rule.id} className="bg-muted text-xs px-2 py-1 rounded">
                            {rule.name.replace(' Rule', '')}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No categories created yet. Create your first category above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryCreationTab;
