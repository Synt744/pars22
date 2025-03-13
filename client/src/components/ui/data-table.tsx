import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  FilterX, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Copy,
  Trash2,
  Tag,
  DollarSign,
  Star
} from "lucide-react";
import { ScrapedProduct } from "@shared/schema";

interface DataTableProps {
  products: ScrapedProduct[];
  total: number;
  loading: boolean;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSearch: (term: string) => void;
  onDelete: (id: number) => void;
  onCategoryFilter: (category: string) => void;
  onPriceFilter: (range: string) => void;
}

export function DataTable({
  products,
  total,
  loading,
  pageSize,
  currentPage,
  onPageChange,
  onSearch,
  onDelete,
  onCategoryFilter,
  onPriceFilter
}: DataTableProps) {
  const [searchValue, setSearchValue] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };
  
  const totalPages = Math.ceil(total / pageSize);
  const showingFrom = (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, total);
  
  const renderProductIcon = (product: ScrapedProduct) => {
    const category = product.category?.toLowerCase() || '';
    
    if (category.includes('electronics')) return <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><Star className="h-5 w-5 text-gray-500" /></div>;
    if (category.includes('kitchen')) return <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><DollarSign className="h-5 w-5 text-gray-500" /></div>;
    if (category.includes('art')) return <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><Tag className="h-5 w-5 text-gray-500" /></div>;
    
    // Default icon
    return <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><Tag className="h-5 w-5 text-gray-500" /></div>;
  };
  
  const renderRatingStars = (rating: string | null) => {
    if (!rating) return null;
    
    const ratingNum = parseFloat(rating);
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {Array(5).fill(0).map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <span key={i} className="relative">
                <Star className="h-3 w-3 text-gray-300" />
                <Star className="absolute top-0 left-0 h-3 w-3 overflow-hidden fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
              </span>
            );
          } else {
            return <Star key={i} className="h-3 w-3 text-gray-300" />;
          }
        })}
      </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-3 py-2"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="inline-flex items-center">
                <Tag className="h-4 w-4 mr-1.5 text-gray-500" />
                Category
                <ChevronRight className="h-4 w-4 ml-1 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCategoryFilter('Electronics')}>
                Electronics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCategoryFilter('Home & Kitchen')}>
                Home & Kitchen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCategoryFilter('Art & Crafts')}>
                Art & Crafts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCategoryFilter('')}>
                <FilterX className="h-4 w-4 mr-2" />
                Clear Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="inline-flex items-center">
                <DollarSign className="h-4 w-4 mr-1.5 text-gray-500" />
                Price
                <ChevronRight className="h-4 w-4 ml-1 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPriceFilter('0-25')}>
                Under $25
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriceFilter('25-50')}>
                $25 to $50
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriceFilter('50-100')}>
                $50 to $100
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriceFilter('100+')}>
                $100 and above
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriceFilter('')}>
                <FilterX className="h-4 w-4 mr-2" />
                Clear Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state
              Array(5).fill(0).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <Search className="h-8 w-8 mb-2" />
                    <p className="text-sm">No products found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Products data
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      {renderProductIcon(product)}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{product.price}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900 dark:text-gray-100 mr-1">{product.rating}</div>
                      {renderRatingStars(product.rating)}
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-1">({product.reviewCount})</div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {product.category && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-800">
                        {product.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline" className={product.inStock ? 
                      "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-800" : 
                      "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-800"
                    }>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {product.productUrl && (
                        <Button variant="ghost" size="icon" onClick={() => window.open(product.productUrl!, '_blank')}>
                          <ExternalLink className="h-4 w-4 text-gray-500 hover:text-primary" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4 text-gray-500 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="px-4 py-3 border-t border-gray-200 dark:border-border flex items-center justify-between">
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{total > 0 ? showingFrom : 0}</span> to <span className="font-medium">{showingTo}</span> of <span className="font-medium">{total}</span> results
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
