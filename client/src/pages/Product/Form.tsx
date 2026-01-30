import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Sidebar } from "../../partials/sidebar";
import Header from "../../partials/headers";
import { IProduct } from "../../interfaces/producto";
import {
  createProduct,
  getProducts,
  updateProduct,
} from "../../services/productService";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

const ProductForm = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct>({
    code: "",
    name: "",
    description: "",
    price: 0,
    units: 0,
    companyCode: "",
    stock: 0,
    minimumStock: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = (await getProducts(id)) as IProduct[];
        if (productsData.length) {
          setProduct(productsData[0]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    if (id) fetchProducts();
  }, []);

  const handleChangeProd = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    switch (id) {
      default:
        setProduct({
          ...product,
          [id]: value,
        });
        break;
    }
  };

  const submitHandlerProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (!product.companyCode) {
        res = await createProduct(product);
      } else {
        res = await updateProduct(product);
      }
      if (!res.ack) {
        notify(res.message ? res.message : "ok");
        setTimeout(() => navigate(`/product`), 1000);
      } else {
        notifyError(res.message ? res.message : "Error");
      }
    } catch (error) {
      notifyError(error ? error.toString() : "Error");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
              <form className="max-w-sm mx-auto">
                <div className="mb-5">
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={product.name}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={handleChangeProd}
                    required
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="code"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Código
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={product.code}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={handleChangeProd}
                    required
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Descripción
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={product.description}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={handleChangeProd}
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="price"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Precio Venta
                  </label>
                  <input
                    type="text"
                    id="price"
                    value={product.price}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    onChange={handleChangeProd}
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="stock"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    value={product.stock}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={handleChangeProd}
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="minimumStock"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Stock Minimo (para alertas)
                  </label>
                  <input
                    type="number"
                    id="minimumStock"
                    value={product.minimumStock}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={handleChangeProd}
                  />
                </div>
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={submitHandlerProduct}
                >
                  Guardar
                </button>
              </form>
            </div>
          </div>
          <Toaster position="bottom-right" />
        </main>
      </div>
    </div>
  );
};

export default ProductForm;
