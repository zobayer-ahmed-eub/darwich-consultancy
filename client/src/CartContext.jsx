import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
const Ctx=createContext(null);
export function CartProvider({children}){
  const [items,setItems]=useState(()=>{try{return JSON.parse(localStorage.getItem('darwich_cart')||'[]')}catch{return []}});
  useEffect(()=>localStorage.setItem('darwich_cart',JSON.stringify(items)),[items]);
  const add=p=>setItems(xs=>{const found=xs.find(x=>x.id===p.id);const price=Number(p.sale_price)>0?Number(p.sale_price):Number(p.price||0);if(found)return xs.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x);return [...xs,{id:p.id,name:p.name,slug:p.slug,image:p.image||'',price,price_unit:p.price_unit||'consultation',qty:1}]});
  const update=(id,qty)=>setItems(xs=>xs.map(x=>x.id===id?{...x,qty:Math.max(1,Number(qty)||1)}:x));
  const remove=id=>setItems(xs=>xs.filter(x=>x.id!==id));
  const clear=()=>setItems([]);
  const subtotal=useMemo(()=>items.reduce((a,x)=>a+Number(x.price||0)*Number(x.qty||1),0),[items]);
  const count=useMemo(()=>items.reduce((a,x)=>a+Number(x.qty||1),0),[items]);
  return <Ctx.Provider value={{items,add,update,remove,clear,subtotal,count}}>{children}</Ctx.Provider>
}
export const useCart=()=>useContext(Ctx);
