import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { catalogService } from '../services/catalogService';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'motion/react';

export const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subcategory = searchParams.get('sub');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceFilters, setPriceFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        catalogService.getProducts(categoryName, subcategory || undefined, priceFilters),
        catalogService.getCategories()
      ]);
      setProducts(prodData);
      setCategories(catData);
      setLoading(false);
      setCurrentPage(1);
    };
    fetchData();
  }, [categoryName, subcategory, priceFilters]);

  const categoryInfo = categories.find((c) => c.name.toLowerCase() === categoryName?.toLowerCase());

  const handlePriceFilterChange = (range: string) => {
    setPriceFilters(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const clearFilters = () => {
    setPriceFilters([]);
    navigate(`/category/${categoryName}`);
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div id={`category-page-${categoryName}`} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 category-container">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 id="category-title" className="text-4xl font-bold tracking-tight text-zinc-900 capitalize">
            {categoryName === 'all' ? 'All Collections' : categoryName}
          </h1>
          {subcategory && (
            <p id="subcategory-indicator" className="text-zinc-500 mt-2">
              Showing results for <span className="text-zinc-900 font-medium capitalize">{subcategory}</span>
            </p>
          )}
        </div>
        {(priceFilters.length > 0 || subcategory) && (
          <button 
            onClick={clearFilters}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-4 cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside id="category-sidebar" className="w-full lg:w-64 space-y-8 sidebar-filters">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Subcategories</h3>
            <ul className="space-y-2">
              {categoryInfo?.subcategories.map((sub) => (
                <li key={sub}>
                  <Link
                    to={`/category/${categoryName}?sub=${sub.toLowerCase()}`}
                    className={cn(
                      "text-sm transition-colors cursor-pointer",
                      subcategory?.toLowerCase() === sub.toLowerCase() ? "text-zinc-900 font-bold" : "text-zinc-600 hover:text-zinc-900"
                    )}
                  >
                    {sub}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Price Range</h3>
            <div className="space-y-2">
              {[
                { label: 'Under $50', value: 'under-50' },
                { label: '$50 - $100', value: '50-100' },
                { label: '$100 - $500', value: '100-500' },
                { label: 'Over $500', value: 'over-500' },
              ].map((range) => (
                <label key={range.value} className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-zinc-300 cursor-pointer text-zinc-900 focus:ring-zinc-900"
                    checked={priceFilters.includes(range.value)}
                    onChange={() => handlePriceFilterChange(range.value)}
                  /> 
                  {range.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div id="category-product-grid" className="flex-1 flex flex-col">
          {loading ? (
            <div className="text-center py-20">Loading products...</div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-auto flex justify-center items-center gap-2 py-8 border-t border-zinc-100">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-10 h-10 rounded-full text-sm font-medium transition-colors cursor-pointer",
                          currentPage === page ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-zinc-50 rounded-3xl">
              <p className="text-zinc-500">No products found in this category.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 text-sm font-bold underline underline-offset-4 cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

