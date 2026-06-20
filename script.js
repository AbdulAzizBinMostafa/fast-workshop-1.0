const scriptURL = "https://script.google.com/macros/s/AKfycbwetA7Ieq0FWNxsCkwZFN_CRY4olvucVEzPjzHv41APqRIBD2P9SBb7vcCBaa8-7M-q/exec";

const products = [
  { name: "Mini Fast Mobil Chula", code: "FMC001", price: 3999 },
  { name: "Medium Fast Mobil Chula", code: "FMC002", price: 4999 },
  { name: "Big Fast Mobil Chula", code: "FMC003", price: 6999 },
];

const banglaCurrency = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const banglaNumber = new Intl.NumberFormat("bn-BD", {
  useGrouping: false,
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#orderForm");
  const productSelect = document.querySelector("#productSelect");
  const productCode = document.querySelector("#productCode");
  const quantity = document.querySelector("#quantity");
  const paymentMethod = document.querySelector("#paymentMethod");
  const paymentExtra = document.querySelector("#paymentExtra");
  const transactionId = document.querySelector("#transactionId");
  const totalInput = document.querySelector("#orderTotal");
  const totalView = document.querySelector("#orderTotalView");
  const status = document.querySelector("#formStatus");
  const submitButton = form.querySelector("button[type='submit']");
  const stickyOrder = document.querySelector(".sticky-order");
  const currentYear = document.querySelector("#currentYear");

  currentYear.textContent = banglaNumber.format(new Date().getFullYear());

  // Keep product code and total synced with the selected product.
  function updateOrderSummary() {
    const selectedOption = productSelect.selectedOptions[0];
    const price = Number(selectedOption?.dataset.price || 0);
    const selectedQuantity = Math.max(Number(quantity.value || 1), 1);
    const total = price * selectedQuantity;

    productCode.value = selectedOption?.dataset.code || "";
    totalInput.value = total ? total.toString() : "";
    totalView.textContent = banglaCurrency.format(total);
  }

  function setStatus(message, type = "") {
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  }

  function togglePaymentFields() {
    const needsTransaction = ["bKash", "Nagad"].includes(paymentMethod.value);
    paymentExtra.hidden = !needsTransaction;
    transactionId.required = needsTransaction;

    if (!needsTransaction) {
      transactionId.value = "";
    }
  }

  function selectProductForOrder(code) {
    const product = products.find((item) => item.code === code);
    if (!product) return;

    productSelect.value = product.name;
    updateOrderSummary();
    document.querySelector("#order").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function buildPayload() {
    const formData = new FormData(form);
    formData.append("Submitted At", new Date().toISOString());
    return formData;
  }

  productSelect.addEventListener("change", updateOrderSummary);
  quantity.addEventListener("input", updateOrderSummary);
  paymentMethod.addEventListener("change", togglePaymentFields);

  document.querySelectorAll("[data-order-product]").forEach((button) => {
    button.addEventListener("click", () => selectProductForOrder(button.dataset.orderProduct));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!scriptURL || scriptURL === "YOUR_GOOGLE_SCRIPT_URL") {
      setStatus("Google Apps Script URL যুক্ত করলে অর্ডার সরাসরি Google Sheet-এ জমা হবে।", "error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "অর্ডার পাঠানো হচ্ছে...";

    try {
      const payload = buildPayload();

      // Static hosts and Apps Script commonly use no-cors form posts.
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });

      form.reset();
      togglePaymentFields();
      updateOrderSummary();
      setStatus(
        "ধন্যবাদ! আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে। আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবে।",
        "success"
      );
    } catch (error) {
      setStatus(error.message || "দুঃখিত, অর্ডার পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "অর্ডার নিশ্চিত করুন";
    }
  });

  if ("IntersectionObserver" in window && stickyOrder) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        stickyOrder.classList.toggle("is-hidden", entry.isIntersecting);
      },
      { threshold: 0.12 }
    );

    observer.observe(document.querySelector("#order"));
  }

  updateOrderSummary();
  togglePaymentFields();
});
