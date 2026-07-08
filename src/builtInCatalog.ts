export interface CatalogProduct {
  pic_name: string;
  category: string;
  size_mm: string;
  package_size: string;
  nw: string;
  gw: string;
  hs_code: string;
}

export const BUILT_IN_CATALOG: CatalogProduct[] = [
  // 1. METAL SCREEN
  {
    category: "Metal Screen",
    pic_name: "Decorative Metal Screen (0.8mm)",
    size_mm: "Material: Carbon steel\nPanel thickness: 0.8mm\nAssembly size: 1800 * 1200 * 400mm",
    package_size: "128*66*11cm",
    nw: "16.2KG",
    gw: "18.8KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Screen",
    pic_name: "Decorative Metal Screen (1.5mm)",
    size_mm: "Material: Carbon steel\nPanel thickness: 1.5mm\nAssembly size: 1800 * 1200 * 400mm",
    package_size: "128*66*11cm",
    nw: "25KG",
    gw: "27.6KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Screen",
    pic_name: "Decorative Metal Screen Narrow (0.8mm)",
    size_mm: "Material: Carbon steel\nPanel thickness: 0.8mm\nAssembly size: 1800 * 900 * 400mm",
    package_size: "102*66*12cm",
    nw: "13.5KG",
    gw: "15.3KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Screen",
    pic_name: "Decorative Metal Screen Narrow (1.5mm)",
    size_mm: "Material: Carbon steel\nPanel thickness: 1.5mm\nAssembly size: 1800 * 900 * 400mm",
    package_size: "102*66*12cm",
    nw: "20.2KG",
    gw: "22KG",
    hs_code: "7326909000"
  },

  // 2. Metal screen with planter box
  {
    category: "Screen Planter",
    pic_name: "Metal Screen with Planter Box (0.8mm)",
    size_mm: "Material: Carbon steel\nPanel thickness: 0.8mm\nAssembly size: 1800 * 1200 * 400mm\nPlanter box base included",
    package_size: "128.5*67.5*17.5cm",
    nw: "19KG",
    gw: "22KG",
    hs_code: "7326909000"
  },
  {
    category: "Screen Planter",
    pic_name: "Metal Screen with Planter Box (1.5mm)",
    size_mm: "Material: Carbon steel\nPanel thickness: 1.5mm\nAssembly size: 1800 * 1200 * 400mm\nPlanter box base included",
    package_size: "128.5*67.5*17.5cm",
    nw: "26KG",
    gw: "29KG",
    hs_code: "7326909000"
  },
  {
    category: "Screen Planter",
    pic_name: "Metal Screen Narrow with Planter (0.8mm)",
    size_mm: "Material: Carbon steel\nPanel thickness: 0.8mm\nAssembly size: 1800 * 900 * 400mm\nPlanter box base included",
    package_size: "96*66*15cm",
    nw: "16KG",
    gw: "18KG",
    hs_code: "7326909000"
  },
  {
    category: "Screen Planter",
    pic_name: "Metal Screen Narrow with Planter (1.5mm)",
    size_mm: "Material: Carbon steel\nPanel thickness: 1.5mm\nAssembly size: 1800 * 900 * 400mm\nPlanter box base included",
    package_size: "96*66*15cm",
    nw: "23KG",
    gw: "25KG",
    hs_code: "7326909000"
  },

  // 3. Metal planter box & planter box base
  {
    category: "Metal Planter",
    pic_name: "Tall Metal Planter Column",
    size_mm: "Material: Weathering steel\nThickness: 1.0mm\nSize: 710 * 300 * 710mm",
    package_size: "84*42*13.5cm",
    nw: "15KG",
    gw: "16.5KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Metal Planter Box (400mm)",
    size_mm: "Material: Weathering steel\nThickness: 1.2mm\nSize: 400 * 400 * 430mm",
    package_size: "45*45*15.5cm",
    nw: "10.2KG",
    gw: "11.2KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Metal Planter Box (500mm)",
    size_mm: "Material: Weathering steel\nThickness: 1.2mm\nSize: 500 * 500 * 530mm",
    package_size: "55*55*15.5cm",
    nw: "15.4KG",
    gw: "16.4KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Metal Planter Box (600mm)",
    size_mm: "Material: Weathering steel\nThickness: 1.2mm\nSize: 600 * 600 * 630mm",
    package_size: "66.5*64*15.5cm",
    nw: "21.6KG",
    gw: "22.6KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Trough Planter Box",
    size_mm: "Material: Weathering steel\nThickness: 1.2mm\nSize: 810 * 400 * 400mm",
    package_size: "84*47*12.5cm",
    nw: "19.2KG",
    gw: "20.2KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Square Planter Heavy Duty (1.5mm)",
    size_mm: "Material: Weathering steel\nThickness: 1.5mm\nSize: 500 * 500 * 500mm",
    package_size: "53.5*52.5*16.5cm",
    nw: "17.6KG",
    gw: "18.3KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Long Low Rectangular Planter (1.5mm)",
    size_mm: "Material: Weathering steel\nThickness: 1.5mm\nSize: 800 * 300 * 400mm",
    package_size: "83*44.5*13cm",
    nw: "16.5KG",
    gw: "17.7KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Long Low Planter Extra Thick (2.0mm)",
    size_mm: "Material: Weathering steel\nThickness: 2.0mm\nSize: 800 * 305 * 400mm",
    package_size: "83.5*9*47cm",
    nw: "18KG",
    gw: "19KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Planter Column Accent (2.0mm)",
    size_mm: "Material: Weathering steel\nThickness: 2.0mm\nSize: 300 * 300 * 600mm",
    package_size: "64*35*11cm",
    nw: "13.7KG",
    gw: "14.7KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Large Square Planter Cube (1.2mm)",
    size_mm: "Material: Weathering steel\nThickness: 1.2mm\nSize: 600 * 600 * 600mm",
    package_size: "64.5*64.5*19cm",
    nw: "20.4KG",
    gw: "21.9KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Medium Rectangular Planter",
    size_mm: "Material: Weathering steel\nThickness: 1.2mm\nSize: 387 * 260 * 762mm",
    package_size: "80*40.5*18cm",
    nw: "13.3KG",
    gw: "14.7KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Grand Rectangular Planter High",
    size_mm: "Material: Weathering steel\nThickness: 1.2mm\nSize: 900 * 820 * 300mm",
    package_size: "93.5*84.5*12cm",
    nw: "24.8KG",
    gw: "27.3KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Planter Shelf Divider",
    size_mm: "Material: Weathering steel\nThickness: 1.2mm\nSize: 900 * 300 * 820mm",
    package_size: "93*84*9cm",
    nw: "24.8KG",
    gw: "27.3KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Trundle Round Plant Stand S",
    size_mm: "Material: 1.5mm galvanized steel plate\nDiameter: 250mm * Height: 65mm\nAccessories: 2 brake wheels, 2 universal wheels\nPackage: 2pcs per box",
    package_size: "28*28*11cm",
    nw: "2.4KG",
    gw: "2.8KG",
    hs_code: "7326909000"
  },
  {
    category: "Metal Planter",
    pic_name: "Trundle Round Plant Stand M",
    size_mm: "Material: 1.5mm galvanized steel plate\nDiameter: 300mm * Height: 65mm\nAccessories: 2 brake wheels, 2 universal wheels\nPackage: 2pcs per box",
    package_size: "33*33*11cm",
    nw: "2.7KG",
    gw: "3.1KG",
    hs_code: "7326909000"
  },

  // 4. Garden & Landscape edging
  {
    category: "Landscape Edging",
    pic_name: "Straight Metal Garden Edging",
    size_mm: "Material: Galvanized steel plate\nSize: L1060 * H150mm\nPackage: 5pcs per set",
    package_size: "109*18*4cm",
    nw: "4.9KG",
    gw: "5.2KG",
    hs_code: "7326909000"
  },
  {
    category: "Landscape Edging",
    pic_name: "Serrated Interlocking Edging Set",
    size_mm: "Material: Steel plate\nSingle size: 4.5 * 40 inch (approx. 115 * 1016mm)\nThickness: 1.5mm\nIncludes: 11 anchors\nPackage: 10pcs per pack",
    package_size: "105*16*5cm",
    nw: "N/A",
    gw: "9.4KG",
    hs_code: "7326909000"
  },
  {
    category: "Landscape Edging",
    pic_name: "Heavy Duty Border Edging 8-Inch",
    size_mm: "Material: Steel plate\nSingle size: 8 * 40 inch (approx. 203 * 1016mm)\nThickness: 1.5mm\nIncludes: 2 pairs of gloves\nPackage: 6pcs per pack",
    package_size: "108*23*4.5cm",
    nw: "N/A",
    gw: "9.9KG",
    hs_code: "7326909000"
  },
  {
    category: "Landscape Edging",
    pic_name: "Spiked Steel Edging Solo (1.5mm)",
    size_mm: "Material: Steel plate\nSingle size: 150 * 1075mm\nSpike height: 80mm\nThickness: 1.5mm",
    package_size: "110*16.5*4cm",
    nw: "N/A",
    gw: "5.7KG",
    hs_code: "7326909000"
  },
  {
    category: "Landscape Edging",
    pic_name: "Spiked Steel Edging Set M",
    size_mm: "Material: Steel plate\nSingle size: 160 * 1061mm\nSpike height: 80mm\nThickness: 1.5mm\nPackage: 5pcs per pack",
    package_size: "109*17*4cm",
    nw: "N/A",
    gw: "5.8KG",
    hs_code: "7326909000"
  },
  {
    category: "Landscape Edging",
    pic_name: "Spiked Steel Edging Set L",
    size_mm: "Material: Steel plate\nSingle size: 195 * 1075mm\nSpike height: 80mm\nThickness: 1.5mm\nPackage: 5pcs per pack",
    package_size: "109*21*4cm",
    nw: "N/A",
    gw: "8.3KG",
    hs_code: "7326909000"
  },
  {
    category: "Landscape Edging",
    pic_name: "Easy-Snap Slot Edging 15cm",
    size_mm: "Material: Galvanized steel plate\nSingle size: 150 * 1050mm\nThickness: 0.7mm\nQuick snap-lock connectors",
    package_size: "108*18*4cm",
    nw: "N/A",
    gw: "5.3KG",
    hs_code: "7326909000"
  },
  {
    category: "Landscape Edging",
    pic_name: "Easy-Snap Slot Edging 18cm",
    size_mm: "Material: Galvanized steel plate\nSingle size: 180 * 1050mm\nThickness: 0.7mm\nQuick snap-lock connectors",
    package_size: "108*21*5cm",
    nw: "N/A",
    gw: "10.9KG",
    hs_code: "7326909000"
  },

  // 5. Fence
  {
    category: "Fence",
    pic_name: "Insert-Type Premium Wooden Fence L",
    size_mm: "Size: H1530 * W960mm\nGround clearance: 428mm\nMaterial: 12mm Fir wood + 1.0mm Aluminum brackets\nPackage: 1 piece",
    package_size: "99*24*11.5cm",
    nw: "5.6KG",
    gw: "6.5KG",
    hs_code: "7326909000"
  },
  {
    category: "Fence",
    pic_name: "Insert-Type Premium Wooden Fence M",
    size_mm: "Size: H1200 * W1920mm\nGround clearance: 280mm\nMaterial: 12mm Fir wood + 1.0mm Aluminum brackets\nPackage: 2 pieces",
    package_size: "110*27*12.5cm",
    nw: "8.2KG",
    gw: "9.1KG",
    hs_code: "7326909000"
  },
  {
    category: "Fence",
    pic_name: "Insert-Type Premium Wooden Fence S",
    size_mm: "Size: H1060 * W2880mm\nGround clearance: 228mm\nMaterial: 12mm Fir wood + 1.0mm Aluminum brackets\nPackage: 3 pieces",
    package_size: "113*44*11cm",
    nw: "12.95KG",
    gw: "13.2KG",
    hs_code: "7326909000"
  },
  {
    category: "Fence",
    pic_name: "Flat-Top Wooden Fence S",
    size_mm: "Size: H1520 * W900mm\nMaterial: 14mm Fir wood + 1.2mm Aluminum frame\nPackage: 1 piece",
    package_size: "152*27*12.5cm",
    nw: "10.3KG",
    gw: "11.1KG",
    hs_code: "7326909000"
  },
  {
    category: "Fence",
    pic_name: "Flat-Top Wooden Fence M",
    size_mm: "Size: H1520 * W1800mm\nMaterial: 14mm Fir wood + 1.2mm Aluminum frame\nPackage: 2 pieces",
    package_size: "152*27*22.5cm",
    nw: "18.5KG",
    gw: "19.2KG",
    hs_code: "7326909000"
  },
  {
    category: "Fence",
    pic_name: "Alu Air Conditioner Cover L",
    size_mm: "Size: 1070 * 1070 * 1140mm\nMaterial: 0.8mm Aluminum + Powder coated finish\nPackage: 1 set",
    package_size: "118*59*14cm",
    nw: "30KG",
    gw: "32.5KG",
    hs_code: "7326909000"
  },
  {
    category: "Fence",
    pic_name: "Alu Air Conditioner Cover M",
    size_mm: "Size: 915 * 915 * 1130mm\nMaterial: 0.8mm Aluminum + Powder coated finish\nPackage: 1 set",
    package_size: "121*81*13cm",
    nw: "29KG",
    gw: "31KG",
    hs_code: "7326909000"
  },
  {
    category: "Fence",
    pic_name: "Alu Air Conditioner Cover S",
    size_mm: "Size: 1170 * 570 * 900mm\nMaterial: 0.8mm Aluminum + Powder coated finish\nPackage: 1 set",
    package_size: "105*77*13cm",
    nw: "21.3KG",
    gw: "23.8KG",
    hs_code: "7326909000"
  },

  // 6. METAL RAISED GARDEN BED
  {
    category: "Raised Garden Bed",
    pic_name: "Round Raised Garden Bed 1FT",
    size_mm: "Size: 600 * 430/2 * 1FT\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: White / Black / Sage Green / Wood grain\nPackage: 3 sets per carton",
    package_size: "56*23*34cm",
    nw: "11.1KG",
    gw: "12.2KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Round Raised Garden Bed 1.5FT (2-Set)",
    size_mm: "Size: 600 * 430/2 * 1.5FT\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: White / Black / Sage Green / Wood grain\nPackage: 2 sets per carton",
    package_size: "56.5*52*17cm",
    nw: "10.7KG",
    gw: "12.1KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Round Raised Garden Bed 1.5FT (3-Set)",
    size_mm: "Size: 600 * 430/2 * 1.5FT\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: White / Black / Sage Green / Wood grain\nPackage: 3 sets per carton",
    package_size: "55*50*17cm",
    nw: "16KG",
    gw: "17.33KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Large Oval Raised Garden Bed 1.5FT",
    size_mm: "Size: 1200 * 430/4 * 1.5FT\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: White / Black / Sage Green / Wood grain\nPackage: 1 set per carton",
    package_size: "76.5*51*15cm",
    nw: "10.2KG",
    gw: "12.06KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Rectangular Raised Garden Bed 1FT",
    size_mm: "Size: 1200 * 600 * 280/4*2 * 1FT\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: White / Black / Sage Green\nPackage: 2 sets per carton",
    package_size: "72*40*8.5cm",
    nw: "13.7KG",
    gw: "14.95KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Rectangular Raised Garden Bed 1.5FT",
    size_mm: "Size: 1200 * 600 * 430/4*2 * 1.5FT\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: White / Black / Sage Green\nPackage: 2 sets per carton",
    package_size: "73*55*9cm",
    nw: "20.4KG",
    gw: "22.15KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Long Rectangular Raised Bed 1FT",
    size_mm: "Size: 1800 * 90 * 280/6*3 * 1FT\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: White / Black / Sage Green\nPackage: 2 sets per carton",
    package_size: "59.5*40*9cm",
    nw: "21.4KG",
    gw: "22.86KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Grand raised Garden Bed 2FT",
    size_mm: "Size: 2400 * 1200 * 600mm * 2FT\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: Custom colors\nPackage: 1 set per carton",
    package_size: "125*61.7*8cm",
    nw: "19.5KG",
    gw: "20.44KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Oval Raised Bed with Supports",
    size_mm: "Size: 1200 * 600 * 600mm\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: Green / Black / Custom\nPackage: 1 set per carton",
    package_size: "61*49*16cm",
    nw: "11.9KG",
    gw: "12.7KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Low Oval Raised Garden Bed S",
    size_mm: "Size: 1200 * 600 * 280mm\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: Green / Black / Custom\nPackage: 1 set per carton",
    package_size: "37*31*10cm",
    nw: "4KG",
    gw: "5KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Low Oval Raised Garden Bed L",
    size_mm: "Size: 2400 * 1200 * 280mm\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: Green / Black / Custom\nPackage: 1 set per carton",
    package_size: "55*31*12cm",
    nw: "8.4KG",
    gw: "9.5KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Elevated Planter with Mesh Tray",
    size_mm: "Size: 1200 * 600 * 280mm with leg stand\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: Green / Black / Custom\nPackage: 1 set per carton",
    package_size: "128*67*9cm",
    nw: "15.9KG",
    gw: "18.4KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Elevated Planter Cart S",
    size_mm: "Size: 1200 * 450 * 800mm\nThickness: 0.6mm\nMaterial: Galvanized steel\nColor option: Green / Black / Silver\nPackage: 1 set per carton",
    package_size: "122*32*7cm",
    nw: "13.6KG",
    gw: "14.5KG",
    hs_code: "7326909000"
  },
  {
    category: "Raised Garden Bed",
    pic_name: "Elevated Planter Cart Heavy Duty",
    size_mm: "Size: 1200 * 450 * 800mm\nThickness: 0.8mm\nMaterial: Galvanized steel\nColor option: Green / Black\nPackage: 1 set per carton",
    package_size: "110*32*11cm",
    nw: "9.5KG",
    gw: "11KG",
    hs_code: "7326909000"
  },

  // 7. LAMP POST
  {
    category: "Lamp Post",
    pic_name: "Weathering Steel Lamp Pillar",
    size_mm: "Material: Weathering steel / Corten steel\nThickness: 1.5mm\nIntegrated laser cut custom graphic panels\nSize: 130 * 130 * 520mm",
    package_size: "13*13*52cm",
    nw: "2.7KG",
    gw: "3KG",
    hs_code: "7326909000"
  },
  {
    category: "Lamp Post",
    pic_name: "Modern Metal Lamp Column",
    size_mm: "Material: Steel plate\nThickness: 0.6mm\nColor: Black / Anthracite\nSize: 210 * 210 * 950mm",
    package_size: "98.5*23*23cm",
    nw: "5.2KG",
    gw: "7.6KG",
    hs_code: "7326909000"
  },
  {
    category: "Lamp Post",
    pic_name: "Solar Holiday Silhouette Lamp Post",
    size_mm: "Material: Steel plate / Weathering steel\nThickness: 0.5mm\nSolar powered, 1 LED bulb (25LM warm white)\nBattery: 3.7V 1200MA\nCharging: 6-8h, auto light sensing",
    package_size: "16*16*59.5cm",
    nw: "1.5KG",
    gw: "1.7KG",
    hs_code: "7326909000"
  },
  {
    category: "Lamp Post",
    pic_name: "Solar Flame Lawn Lantern M",
    size_mm: "Material: 201 Stainless steel\nThickness: 0.5mm\nSolar powered, 1 LED flame light\nBattery: 3.7V 1200MA\nCharging: 6-8h, auto light sensing",
    package_size: "18.5*18.5*42cm",
    nw: "0.4KG",
    gw: "0.5KG",
    hs_code: "7326909000"
  },
  {
    category: "Lamp Post",
    pic_name: "Metal Staker Rods Slim",
    size_mm: "Size: 31.5 * 0.5 * 24\"/33\"\nSteel tube: 0.8mm\nPack quantity: 30pcs per pack",
    package_size: "35*36*32cm",
    nw: "5.1KG",
    gw: "8.2KG",
    hs_code: "7326909000"
  },
  {
    category: "Lamp Post",
    pic_name: "Metal Staker Garden Support",
    size_mm: "Size: W23 * H30.5/36\"\nSteel tube: 0.8mm\nPack quantity: 30pcs per pack",
    package_size: "27*39*32cm",
    nw: "5KG",
    gw: "6.7KG",
    hs_code: "7326909000"
  }
];
