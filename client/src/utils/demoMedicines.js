export const demoMedicines = Array.from({ length: 120 }, (_, index) => {
  const categories = [
    "Tablets",
    "Syrup",
    "Antibiotics",
    "Supplements",
    "Injections",
  ];
  const companies = [
    "ABC Pharma",
    "XYZ Labs",
    "MediCare",
    "Wellness Pharma",
    "Nova Health",
  ];
  const medicineImages = [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=900&q=80",
  ];
  const names = [
    "Paracetamol 500mg",
    "Amoxicillin 250mg",
    "Cough Syrup 100ml",
    "Vitamin D3 Capsules",
    "Metformin 500mg",
    "Azithromycin 250mg",
    "Omeprazole 20mg",
    "Calcium Tablets",
    "Salbutamol Inhaler",
    "Ibuprofen 400mg",
  ];

  const category = categories[index % categories.length];
  const company = companies[index % companies.length];
  const name = `${names[index % names.length]} ${index + 1}`;
  const stock = (index % 10) * 40 + 50;
  const purchasePrice = 8 + (index % 7) * 3;
  const sellingPrice = purchasePrice + 4 + (index % 5);

  return {
    _id: `demo-${index + 1}`,
    name,
    company,
    category,
    image: medicineImages[index % medicineImages.length],
    batchNo: `BATCH-${String(index + 1).padStart(3, "0")}`,
    purchasePrice,
    sellingPrice,
    stock,
    minimumStock: 20 + (index % 4) * 10,
    expiryDate: new Date(Date.now() + (index % 12) * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  };
});
