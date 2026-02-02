import React, { useState, useEffect } from 'react';
import { ref, push, onValue, update, set } from 'firebase/database';
import { database } from './firebase';
import Background from './components/Background';
import ProductModal from './components/ProductModal';
import OrderModal from './components/OrderModal';
import { Product } from './types';

const App = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UUID for rating
  const [userUUID] = useState(() => {
    let uuid = localStorage.getItem('user_uuid');
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem('user_uuid', uuid);
    }
    return uuid;
  });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  // Fetch Data
  useEffect(() => {
    const productsRef = ref(database, 'products');

    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const productList: Product[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          productList.push({ 
            id: key, 
            ratingTotal: 0,
            ratingCount: 0,
            ratedBy: {},
            ...data[key] 
          });
        });
      }
      setProducts(productList.reverse());
      setLoading(false);
    });
  }, []);

  const handleRateProduct = async (product: Product, stars: number) => {
    if (product.ratedBy && product.ratedBy[userUUID]) return;
    const currentTotal = product.ratingTotal || 0;
    const currentCount = product.ratingCount || 0;
    const updates: any = {};
    updates[`products/${product.id}/ratingTotal`] = currentTotal + stars;
    updates[`products/${product.id}/ratingCount`] = currentCount + 1;
    updates[`products/${product.id}/ratedBy/${userUUID}`] = stars;
    
    await update(ref(database), updates);
    
    if (selectedProduct && selectedProduct.id === product.id) {
        setSelectedProduct({
            ...selectedProduct, 
            ratingTotal: currentTotal + stars,
            ratingCount: currentCount + 1,
            ratedBy: { ...selectedProduct.ratedBy, [userUUID]: stars }
        });
    }
  };

  const handlePlaceOrder = async (orderData: any) => {
    if (!selectedProduct) return;
    setIsOrdering(true);
    try {
      await set(push(ref(database, 'orders')), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImage: selectedProduct.imageUrl,
        unitPrice: selectedProduct.price,
        quantity: orderData.quantity,
        totalPrice: orderData.totalPrice,
        customerName: orderData.name,
        phone: orderData.phone,
        address: orderData.address,
        status: 'pending',
        timestamp: Date.now()
      });
      setIsOrderModalOpen(false);
      setSelectedProduct(null);
      alert('Đặt hàng thành công! Đơn hàng đang chờ xử lý.');
    } catch (error) {
      console.error(error);
      alert('Lỗi đặt hàng, vui lòng thử lại.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-yellow-500 selection:text-red-900 text-yellow-50">
      <Background />
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-16 gap-6">
          <div className="flex items-center gap-5 group cursor-default">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] floating bg-red-800 relative z-10">
                <img src="https://res.cloudinary.com/dbyap7mw2/image/upload/v1769950832/457203768_122098176248501397_7041672154476517727_n_1_ib8kcf.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-header font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 text-glow drop-shadow-md tracking-tight">A1K50</h1>
              <p className="text-lg md:text-xl font-tet text-yellow-400 tracking-wider mt-1">🌸  Chúc Mừng Năm Mới 2026 🌸</p>
            </div>
          </div>
        </header>

        {/* Store View */}
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            
            <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-header text-yellow-200 mb-2">Sản Phẩm Tết 2026</h2>
                <div className="h-1 w-24 bg-yellow-500 mx-auto rounded-full opacity-60"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {loading ? (
                <div className="col-span-full text-center py-32">
                    <div className="floating text-7xl mb-6">🧧</div>
                    <p className="text-yellow-200 text-lg animate-pulse">Đang tải cửa hàng...</p>
                </div>
              ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-red-950/20 rounded-3xl border border-yellow-500/10">
                      <p className="text-yellow-500/50 text-xl italic mb-4">Cửa hàng đang cập nhật sản phẩm.</p>
                  </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} onClick={() => setSelectedProduct(product)} className="glass-panel rounded-2xl overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(251,191,36,0.15)] border border-yellow-500/10 hover:border-yellow-400/50 flex flex-col h-full bg-[#2a0a0a]">
                    <div className="aspect-[4/3] relative overflow-hidden bg-white/5 p-4 flex items-center justify-center">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-lg"/>
                      
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-bold border border-yellow-500/30 shadow-lg">
                           <span className="text-yellow-400">★</span> 
                           <span className="text-yellow-100">{product.ratingCount > 0 ? (product.ratingTotal / product.ratingCount).toFixed(1) : '5.0'}</span>
                      </div>
                      
                      {/* Decorative Tag */}
                      <div className="absolute top-3 left-3">
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md">Hot</span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1 relative">
                      <div className="absolute -top-8 right-4 text-3xl group-hover:animate-bounce drop-shadow-lg transition-all opacity-0 group-hover:opacity-100">🧧</div>
                      
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 text-yellow-50 font-header leading-tight min-h-[3rem]">{product.name}</h3>
                      
                      <div className="mt-auto pt-4 border-t border-yellow-500/10 flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-xs text-yellow-500/60 line-through">{(product.price * 1.2).toLocaleString()}đ</span>
                            <span className="font-bold text-xl text-yellow-400 text-glow">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-yellow-500 text-red-900 flex items-center justify-center hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/50 hover:scale-110 active:scale-90">
                            <i className="fas fa-cart-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
      
      
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onRate={handleRateProduct} userRating={selectedProduct.ratedBy ? selectedProduct.ratedBy[userUUID] : 0} onOrder={() => setIsOrderModalOpen(true)} />}
      {isOrderModalOpen && selectedProduct && <OrderModal product={selectedProduct} onClose={() => setIsOrderModalOpen(false)} onSubmit={handlePlaceOrder} isSubmitting={isOrdering} />}
    </div>
  );
};

export default App;