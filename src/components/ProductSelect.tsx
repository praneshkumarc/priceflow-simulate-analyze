
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Product } from "@/types";

interface ProductSelectProps {
  products: Product[];
  onProductSelect: (productId: string) => void;
  selectedProductId?: string;
  placeholder?: string;
}

export const ProductSelect: React.FC<ProductSelectProps> = ({
  products,
  onProductSelect,
  selectedProductId,
  placeholder = "Select a product"
}) => {
  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <Select
      value={selectedProductId}
      onValueChange={onProductSelect}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(productsByCategory).map(([category, products]) => (
          <SelectGroup key={category}>
            <SelectLabel>{category}</SelectLabel>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} (${(product.basePrice || product.price || 0).toFixed(2)})
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ProductSelect;
