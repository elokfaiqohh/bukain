import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePackages } from "../contexts/PackagesContext";
import { checkoutPackage } from "../utils/api";

export default function PackageDetails() {
  const { id } = useParams();
  const { recommendations, selectedPackageId, setSelectedPackageId } =
    usePackages();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (id && id !== selectedPackageId) {
      setSelectedPackageId(id);
    }
  }, [id, selectedPackageId, setSelectedPackageId]);

  const handleCheckout = async () => {
    if (!item) return;
    setIsCheckingOut(true);
    try {
      const payload = {
        packageId: item.id,
        restaurantId: item.restaurantId,
        price: Number(item.totalPrice || 0),
        name: item.name
      };
      const response = await checkoutPackage(payload);
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl; // Redirect the user to the payment page
      }
    } catch (error) {
      console.error("Checkout failed", error);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const item = recommendations?.find((pkg) => pkg.id === id);

  if (!item) {
    return (
      <div className="max-w-4xl px-4 py-20 mx-auto text-center">
        <p className="text-lg font-semibold text-grey-900">Package not found</p>
        <p className="mt-2 text-sm text-grey-600">
          Try generating recommendations first.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 mt-6 text-sm font-semibold text-white rounded-full bg-bukain-green hover:bg-bukain-green/90"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const totalPrice = Number(item.totalPrice || 0);

  const coverImage =
    item.items?.[0]?.img ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBt6j50Ly5ejYGb_kjH9gsJJp2zDWDWc18FkytK-KYBhiK9a5S739_nVjmVb8dyuJ0lkW_uYkKP9Np5886LdGTc8xyFplnBh1CAokNnG_Qd8xv22DJcHwgMCvHO0ZDNt9d0L6aogQzRy20Q7e_vyO06XzgCHSDkYjoVCJfMaemiq36hs9U9brIzdjC3lCYOkytyBQxQ-nJl_in5nWSkuwjL4uaHAI4Kseb4VZ6BOqs0l8AAplJQuQNLS6wCboETkdUCgBODp0dBNNg";

  return (
    <div className="bg-background-light dark:bg-background-dark text-grey-900 dark:text-grey-100 font-display">
      <div className="relative flex flex-col w-full min-h-screen overflow-x-hidden">
        <div className="flex flex-col h-full grow">
          {/* Navigation */}
          <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 -mb-12 dark:bg-background-dark/80">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 transition rounded-full hover:bg-primary/20 bg-primary/10 text-bukain-green"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="text-lg font-bold tracking-tight">
                Package Details
              </h2>
            </div>
          </header>

          <main className="flex-1 w-full max-w-2xl mx-auto">
            {/* Hero Image */}
            <div className="p-4">
              <div
                className="w-full aspect-[4/3] bg-center bg-no-repeat bg-cover rounded-xl shadow-sm"
                style={{
                  backgroundImage: `url("${coverImage}")`,
                }}
              />
            </div>

            {/* Info Section */}
            <div className="px-6 py-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-extrabold tracking-tight text-bukain-green">
                    {item.name}
                  </h1>

                  <div className="px-2 py-1 text-xs font-bold rounded text-bukain-green bg-primary">
                    PACKAGE
                  </div>
                </div>

                <p className="flex items-center gap-1 text-lg font-medium text-bukain-green/70">
                  <span className="text-sm material-symbols-outlined">
                    restaurant
                  </span>
                  {item.restaurantName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-white border shadow-sm dark:bg-grey-800 rounded-xl border-primary/5">
                  <p className="text-xs font-bold tracking-wider uppercase text-grey-500 dark:text-grey-400">
                    Estimated Pickup
                  </p>
                  <p className="text-lg font-bold text-bukain-green">
                    17:30 - 18:00
                  </p>
                </div>

                <div className="p-4 bg-white border shadow-sm dark:bg-grey-800 rounded-xl border-primary/5">
                  <p className="text-xs font-bold tracking-wider uppercase text-grey-500 dark:text-grey-400">
                    Price
                  </p>
                  <p className="text-lg font-bold text-bukain-green">
                    Rp{totalPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>

            {/* Package Content */}
            <div className="px-6 mt-8">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold">
                <span className="material-symbols-outlined text-bukain-green">
                  inventory_2
                </span>
                Package Items
              </h3>

              <div className="space-y-3">
                {item.items?.map((food, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-white border dark:bg-grey-800 rounded-xl border-primary/5"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-bukain-green">
                      <span className="material-symbols-outlined">
                        restaurant_menu
                      </span>
                    </div>
                    <span className="flex-1 font-medium">{food.name}</span>
                    <span className="text-sm font-bold text-bukain-green">
                      Rp{Number(food.price).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="px-6 mt-8">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold">
                <span className="material-symbols-outlined text-bukain-green">
                  location_on
                </span>
                Pickup Location
              </h3>

              <div className="relative w-full h-48 overflow-hidden border shadow-inner rounded-xl bg-grey-200 border-primary/10">
                <div
                  className="absolute inset-0 bg-center bg-cover"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPm17D4639FHYhbze6taWwSG3G7WjfszLk1vBtjeEK3BkwlbM4y7elXCrssH7Cqp1bL8BrrmV3kzTemaC15OIPmhzXF7LuNgBX709bwFiQXIGkfdAcCKCOn6GVOS4zEZG6ISbp_Ed-IwRNj28mBTs8Fl1uPU448KPHbaa15VOalJgxZc0Mvww0ChzFoQKNDSI_HMsgNqZjEWH1MkwOCZiApl4YWJljlof_klJ-mQymGtlVHfNB5poAzhxu95Z-WcJBn8uZ1EkxlAg')",
                  }}
                />

                <div className="absolute inset-0 bg-primary/10"></div>

                <div className="absolute -trangrey-x-1/2 -trangrey-y-1/2 top-1/2 left-1/2">
                  <div className="p-2 text-white rounded-full shadow-lg bg-primary ring-4 ring-white">
                    <span className="block material-symbols-outlined">
                      restaurant
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm italic text-grey-600 dark:text-grey-400">
                Jl. Senopati No. 12, Kebayoran Baru, Jakarta Selatan. Green
                building, 1st Floor.
              </p>
            </div>

            {/* Bottom Action Bar */}
            <div className="sticky bottom-0 left-0 right-0 z-50 p-6 my-12 border-t rounded-lg bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-primary/10">
              <div className="flex items-center justify-between max-w-2xl gap-6 mx-auto">
                <div className="flex flex-col">
                  <p className="text-xs font-bold uppercase text-grey-500">
                    Total Payment
                  </p>
                  <p className="text-2xl font-extrabold text-bukain-green">
                    Rp{totalPrice.toLocaleString("id-ID")}
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="flex items-center justify-center flex-1 gap-2 text-lg font-bold text-white transition-colors shadow-lg bg-bukain-green h-14 rounded-xl shadow-primary/20 hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                  {!isCheckingOut && (
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  )}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
