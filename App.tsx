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
        
        {/* Header matching the image style */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 md:mb-16 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-[3px] border-yellow-300 shadow-[0_0_25px_rgba(253,224,71,0.6)] bg-white relative z-10 flex-shrink-0">
                <img src="https://res.cloudinary.com/dbyap7mw2/image/upload/v1769950832/457203768_122098176248501397_7041672154476517727_n_1_ib8kcf.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-5xl md:text-6xl font-header font-bold text-yellow-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight" style={{ textShadow: '0 0 10px #b45309' }}>A1K50</h1>
              <div className="flex items-center gap-2 text-pink-300">
                  <span className="text-xl">🌸</span>
                  <p className="text-xl md:text-2xl font-tet text-yellow-100 tracking-wider drop-shadow-md">Chúc Mừng Năm Mới 2026</p>
                  <span className="text-xl">🌸</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
             <div className="hidden md:block text-right">
                <div className="text-yellow-500/80 text-xs font-bold uppercase tracking-[0.2em] mb-1">Hotline Đặt Hàng</div>
                <div className="text-2xl font-bold text-yellow-400 font-mono">0123.456.789</div>
             </div>
          </div>
        </header>

        {/* Store View */}
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            
            {/* Center Tet Decor */}
            <div className="flex justify-center mb-10 relative">
                 <div className="text-center">
                    <div className="inline-block relative">
                         <h2 className="text-[5rem] md:text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-[0_4px_0_#fff] leading-none font-sans" style={{WebkitTextStroke: '2px #ffd700'}}>TẾT</h2>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-4 border-yellow-500/30 rotate-45 rounded-lg -z-10 bg-red-900/20 backdrop-blur-sm"></div>
                    </div>
                    <div className="flex justify-center gap-4 mt-2 font-tet text-yellow-200 text-xl">
                        <span>happy</span><span>•</span><span>new</span><span>•</span><span>year</span>
                    </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 px-2 md:px-0">
              {loading ? (
                <div className="col-span-full text-center py-32">
                    <div className="floating text-7xl mb-6">🧧</div>
                    <p className="text-yellow-200 text-lg animate-pulse">Đang tải cửa hàng...</p>
                </div>
              ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-red-950/40 rounded-3xl border border-yellow-500/20 backdrop-blur-sm">
                      <p className="text-yellow-500/50 text-xl italic mb-4">Cửa hàng đang cập nhật sản phẩm.</p>
                  </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} onClick={() => setSelectedProduct(product)} className="group cursor-pointer hover:-translate-y-2 transition-all duration-300">
                    {/* Card container matching the image: Dark red background, not glass */}
                    <div className="bg-[#3e0e0e] rounded-xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.6)] border border-[#5c1c1c] hover:border-yellow-500/50 hover:shadow-[0_10px_30px_rgba(234,179,8,0.2)] flex flex-col h-full relative">
                        
                        {/* Image Area - Square Aspect */}
                        <div className="aspect-square relative overflow-hidden bg-black/20">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                          
                          {/* Rating Badge - Brown pill style */}
                          <div className="absolute top-3 right-3 bg-[#6b3519] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm border border-white/10 flex items-center gap-1">
                               <i className="fas fa-star text-yellow-400 text-[9px]"></i>
                               <span>{product.ratingCount > 0 ? (product.ratingTotal / product.ratingCount).toFixed(1) : '5.0'}</span>
                          </div>
                          
                          {/* Pink Stamp - Bottom Right */}
                          <div className="absolute bottom-3 right-3 w-6 h-6 bg-[#ff3366] rounded-sm flex items-center justify-center shadow-lg transform rotate-3">
                               <span className="text-white text-[10px] font-serif font-bold">福</span>
                          </div>
                        </div>
                        
                        {/* Content Area - Dark Red */}
                        <div className="p-4 flex flex-col flex-1 relative bg-gradient-to-b from-[#3e0e0e] to-[#2a0808]">
                          {/* Title - White, Uppercase, Serif-like */}
                          <h3 className="text-white font-bold text-sm uppercase mb-3 line-clamp-2 leading-relaxed tracking-wide font-header h-10">
                            {product.name}
                          </h3>
                          
                          <div className="mt-auto pt-2 flex justify-between items-end border-t border-white/5">
                             {/* Price - Yellow */}
                             <div className="flex flex-col">
                                <span className="text-yellow-400 font-bold text-lg font-sans">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price).replace('₫', 'đ')}
                                </span>
                             </div>

                             {/* Cart Button - Circle Yellowish/Brown */}
                             <button className="w-8 h-8 rounded-full bg-[#8c6a28] hover:bg-[#a67c2e] flex items-center justify-center transition-colors shadow-md border border-yellow-500/30 group-active:scale-95">
                                 <i className="fas fa-shopping-cart text-white text-xs"></i>
                             </button>
                          </div>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-yellow-500/20 text-xs border-t border-yellow-900/30 mt-12 bg-black/40 backdrop-blur-md">
          <p>© 2026 A1K50 Store. All rights reserved.</p>
          <p className="mt-1">Chúc Mừng Năm Mới - An Khang Thịnh Vượng</p>
      </footer>
      
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onRate={handleRateProduct} userRating={selectedProduct.ratedBy ? selectedProduct.ratedBy[userUUID] : 0} onOrder={() => setIsOrderModalOpen(true)} />}
      {isOrderModalOpen && selectedProduct && <OrderModal product={selectedProduct} onClose={() => setIsOrderModalOpen(false)} onSubmit={handlePlaceOrder} isSubmitting={isOrdering} />}
    </div>
  );
};

export default App;