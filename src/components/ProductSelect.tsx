
import { useMemo } from "react";
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
  showPrices?: boolean;
  predictedPrices?: Record<string, number>;
}

export const ProductSelect: React.FC<ProductSelectProps> = ({
  products,
  onProductSelect,
  selectedProductId,
  placeholder = "Select a product",
  showPrices = true,
  predictedPrices
}) => {
  // Group products by category
  const productsByCategory = useMemo(() => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

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
                {product.name}
                {showPrices && ` ($${product.basePrice.toFixed(2)})`}
                {predictedPrices && predictedPrices[product.id] && ` ($${predictedPrices[product.id].toFixed(2)})`}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ProductSelect;
