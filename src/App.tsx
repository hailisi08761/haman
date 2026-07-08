import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Wand2, 
  Plus, 
  Trash2, 
  RotateCcw, 
  FileText, 
  User, 
  Building, 
  CreditCard, 
  Settings, 
  Check, 
  Loader2, 
  AlertCircle,
  Sparkles,
  Search,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Database,
  Calculator,
  RefreshCw,
  PlusCircle,
  Info,
  Users,
  Globe
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { BUILT_IN_CATALOG, CatalogProduct } from './builtInCatalog';

// Types for our Proforma Invoice / Commercial Invoice Data
interface Product {
  id: string;
  pic_name: string;
  size_mm: string;
  package_size: string;
  nw: string;
  gw: string;
  hs_code: string;
  qty: number;
  fob_usd: number;
  unit?: string;
}

interface BankInfo {
  beneficiaryBank: string;
  beneficiaryBankAddress: string;
  swiftCode: string;
  accountNumber: string;
  sellerCompany: string;
  sellerAddress: string;
}

// CRM Data Structures
interface CrmCustomer {
  id: string;
  companyName: string;
  address: string;
  contactPerson?: string;
  email?: string;
  country?: string;
}

interface CrmProfile {
  id: string;
  profileName: string;
  sellerName: string;
  sellerAddress: string;
  beneficiaryBank: string;
  beneficiaryBankAddress: string;
  swiftCode: string;
  accountNumber: string;
  packing: string;
  depositPercent: number;
  balancePercent: number;
  remarks: string[];
}

const DEFAULT_CUSTOMERS: CrmCustomer[] = [
  {
    id: 'c1',
    companyName: 'GIGA DOO Bosnia and Hercegovina',
    address: 'Dzemala Bijedica 199 Sarajevo',
    contactPerson: 'Adnan Kovac',
    email: 'adnan@giga-doo.ba',
    country: 'Germany'
  },
  {
    id: 'c2',
    companyName: 'GARDEN DECOR LTD United Kingdom',
    address: 'Unit 4B, Croft Industrial Estate, Bromborough, Wirral, CH62 3PT',
    contactPerson: 'Sarah Jenkins',
    email: 'sarah@gardendecor.co.uk',
    country: 'United Kingdom'
  },
  {
    id: 'c3',
    companyName: 'OUTDOOR LIVING INC United States',
    address: '1420 Celebration Blvd, Suite 200, Celebration, FL 34747',
    contactPerson: 'Michael Chang',
    email: 'm.chang@outdoorliving.com',
    country: 'USA'
  }
];

const currencySymbols: Record<string, string> = { USD: '$', GBP: '£', EUR: '€' };

const tradeTermLabels: Record<string, { zh: string; en: string }> = {
  FOB: { zh: '离岸合计 TOTAL FOB', en: 'TOTAL FOB' },
  EXW: { zh: '出厂合计 TOTAL EXW', en: 'TOTAL EXW' },
  CIF: { zh: '到岸合计 TOTAL CIF', en: 'TOTAL CIF' },
  CFR: { zh: '成本加运费 TOTAL CFR', en: 'TOTAL CFR' },
  DDP: { zh: '完税交货 TOTAL DDP', en: 'TOTAL DDP' },
  DAP: { zh: '目的地交货 TOTAL DAP', en: 'TOTAL DAP' },
  FCA: { zh: '货交承运人 TOTAL FCA', en: 'TOTAL FCA' },
  CPT: { zh: '运至合计 TOTAL CPT', en: 'TOTAL CPT' }
};

const DEFAULT_PROFILES: CrmProfile[] = [
  {
    id: 'p1',
    profileName: 'Shandong Haman (Main USD Account)',
    sellerName: 'Shandong Haman Metal Products CO.,Ltd',
    sellerAddress: 'No. 01 Workshop, West Side, North of Ganjiang Road, Jiuzhou Subdistrict, High-tech Zone, Liaocheng City, Shandong Province, P.R.China',
    beneficiaryBank: 'BANK OF RIZHAO LIAOCHENG BR',
    beneficiaryBankAddress: '86 Dongchang East Road, Liaocheng Shandong China',
    swiftCode: 'RZCBCNBDLC1',
    accountNumber: '810120114621200093',
    packing: 'Standard seaworthy package: wooden pallet, customize cartons available.',
    depositPercent: 30,
    balancePercent: 70,
    remarks: [
      'The price is valid for 10 days.',
      'The production lead time is 40-50 working days.'
    ]
  },
  {
    id: 'p2',
    profileName: 'Haman HK International Trade',
    sellerName: 'Haman (Hong Kong) Metal Products Limited',
    sellerAddress: 'Room 1502, 15/F, Lucky Centre, 165-171 Wan Chai Road, Wan Chai, Hong Kong',
    beneficiaryBank: 'HSBC HONG KONG',
    beneficiaryBankAddress: '1 Queen\'s Road Central, Hong Kong',
    swiftCode: 'HSBCHKHHXXX',
    accountNumber: '848-123456-838',
    packing: 'Heavy-duty wooden crates, plastic wrap protection.',
    depositPercent: 50,
    balancePercent: 50,
    remarks: [
      'Price validity: 15 days from current date.',
      'Ready to ship within 30 days.'
    ]
  }
];

const CHINESE_KEYWORDS_MAP: Record<string, string[]> = {
  '屏风': ['screen'],
  '花箱': ['planter', 'box'],
  '花盆': ['planter'],
  '种植箱': ['planter'],
  '边缘': ['edging'],
  '草坪': ['edging'],
  '园林': ['edging', 'planter', 'screen'],
  '空调': ['ac', 'conditioner'],
  '空调罩': ['ac', 'conditioner'],
  '火炉': ['firepit'],
  '火盆': ['firepit'],
  '碳钢': ['carbon steel'],
  '耐候钢': ['weathering steel'],
  '不锈钢': ['stainless steel'],
  '铝': ['alu', 'aluminum'],
  '高': ['tall'],
  '厚': ['thickness'],
  '组装': ['assembly'],
};

function matchesQuery(text: string, query: string): boolean {
  if (!query) return true;
  const cleanQuery = query.toLowerCase().trim();
  const cleanText = text.toLowerCase();
  
  if (cleanText.includes(cleanQuery)) return true;
  
  for (const [zhKey, enKeywords] of Object.entries(CHINESE_KEYWORDS_MAP)) {
    if (cleanQuery.includes(zhKey)) {
      if (enKeywords.some(kw => cleanText.includes(kw))) {
        return true;
      }
    }
  }
  return false;
}

// Initial products - 5 Case Products (fully translated, pristine layout)
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    pic_name: 'Decorative Metal Screen (0.8mm)',
    size_mm: 'Material: Carbon steel\nPanel thickness: 0.8mm\nAssembly size: 1800 * 1200 * 400mm',
    package_size: '128*66*11cm',
    nw: '16.2KG',
    gw: '18.8KG',
    hs_code: '7326909000',
    qty: 100,
    fob_usd: 25.00,
    unit: 'set'
  },
  {
    id: '2',
    pic_name: 'Metal Screen with Planter Box (1.5mm)',
    size_mm: 'Material: Carbon steel\nPanel thickness: 1.5mm\nAssembly size: 1800 * 1200 * 400mm\nPlanter box base included',
    package_size: '128.5*67.5*17.5cm',
    nw: '26KG',
    gw: '29KG',
    hs_code: '7326909000',
    qty: 80,
    fob_usd: 38.00,
    unit: 'set'
  },
  {
    id: '3',
    pic_name: 'Tall Metal Planter Column',
    size_mm: 'Material: Weathering steel\nThickness: 1.0mm\nSize: 710 * 300 * 710mm',
    package_size: '84*42*13.5cm',
    nw: '15KG',
    gw: '16.5KG',
    hs_code: '7326909000',
    qty: 150,
    fob_usd: 18.00,
    unit: 'pcs'
  },
  {
    id: '4',
    pic_name: 'Serrated Interlocking Edging Set',
    size_mm: 'Material: Steel plate\nSingle size: 4.5 * 40 inch (approx. 115 * 1016mm)\nThickness: 1.5mm\nIncludes: 11 anchors\nPackage: 10pcs per pack',
    package_size: '105*16*5cm',
    nw: 'N/A',
    gw: '9.4KG',
    hs_code: '7326909000',
    qty: 300,
    fob_usd: 12.00,
    unit: 'pcs'
  },
  {
    id: '5',
    pic_name: 'Alu Air Conditioner Cover M',
    size_mm: 'Size: 915 * 915 * 1130mm\nMaterial: 0.8mm Aluminum + Powder coated finish\nPackage: 1 set',
    package_size: '121*81*13cm',
    nw: '29KG',
    gw: '31KG',
    hs_code: '7326909000',
    qty: 50,
    fob_usd: 55.00,
    unit: 'set'
  }
];

const DEFAULT_BANK_INFO: BankInfo = {
  beneficiaryBank: 'BANK OF RIZHAO LIAOCHENG BR',
  beneficiaryBankAddress: '86 Dongchang East Road, Liaocheng Shandong China',
  swiftCode: 'RZCBCNBDLC1',
  accountNumber: '810120114621200093',
  sellerCompany: 'Shandong Haman Metal Products CO.,Ltd',
  sellerAddress: 'No. 01 Workshop, West Side, North of Ganjiang Road, Jiuzhou Subdistrict, High-tech Zone, Liaocheng City, Shandong Province, P.R.China'
};

// Beautiful Shopify WebP Image Logo with transparent/seamless background
const HamanLogoComponent = ({ className = "h-12 w-auto", isInInvoice = false }: { className?: string, isInInvoice?: boolean }) => (
  <div className="flex items-center gap-2 shrink-0">
    <img 
      src="https://cdn.shopify.com/s/files/1/0983/0088/7321/files/JUmfVs7SygKHYDta.webp?v=1783472389" 
      alt="HAMAN Logo" 
      className={`${className} object-contain max-h-[50px] bg-transparent`} 
      referrerPolicy="no-referrer"
    />
    {!isInInvoice && (
      <span className="text-[#0066b2] font-black text-xl tracking-[0.2em] font-sans leading-none">HAMAN</span>
    )}
  </div>
);

// OKLCH & OKLAB to sRGB conversion formulas for html2canvas compatibility
function oklchToRgb(l: number, c: number, h: number, alpha: number = 1): string {
  // Convert Hue to radians
  const hRad = (isNaN(h) ? 0 : h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  return oklabToRgb(l, a, b, alpha);
}

function oklabToRgb(l: number, a: number, b: number, alpha: number = 1): string {
  // OKLAB to LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l_cube = l_ * l_ * l_;
  const m_cube = m_ * m_ * m_;
  const s_cube = s_ * s_ * s_;

  // LMS to linear sRGB
  const r = 4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
  const g = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
  const b_ = -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.7076147010 * s_cube;

  // sRGB gamma correction helper
  const gamma = (val: number) => {
    return val <= 0.0031308
      ? 12.92 * val
      : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };

  const r255 = Math.max(0, Math.min(255, Math.round(gamma(r) * 255)));
  const g255 = Math.max(0, Math.min(255, Math.round(gamma(g) * 255)));
  const b255 = Math.max(0, Math.min(255, Math.round(gamma(b_) * 255)));

  if (alpha === 1) {
    return `rgb(${r255}, ${g255}, ${b255})`;
  } else {
    return `rgba(${r255}, ${g255}, ${b255}, ${alpha})`;
  }
}

function parseOklchAndOklab(str: string): string {
  if (!str) return str;
  let result = str;

  if (result.includes('oklch')) {
    result = result.replace(/oklch\(\s*([0-9.]+%?)\s+([-0-9.]+)\s+([-0-9.]+)(?:deg|rad|turn)?(?:\s*\/\s*([0-9.]+%?))?\s*\)/g, (match, lVal, cVal, hVal, aVal) => {
      let l = parseFloat(lVal);
      if (lVal.endsWith('%')) {
        l = l / 100;
      }
      const c = parseFloat(cVal);
      const h = parseFloat(hVal);
      
      let alpha = 1;
      if (aVal) {
        let a = parseFloat(aVal);
        if (aVal.endsWith('%')) {
          a = a / 100;
        }
        alpha = a;
      }

      return oklchToRgb(l, c, h, alpha);
    });
  }

  if (result.includes('oklab')) {
    result = result.replace(/oklab\(\s*([0-9.]+%?)\s+([-0-9.]+)\s+([-0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)/g, (match, lVal, aVal, bVal, alphaVal) => {
      let l = parseFloat(lVal);
      if (lVal.endsWith('%')) {
        l = l / 100;
      }
      const a = parseFloat(aVal);
      const b = parseFloat(bVal);
      
      let alpha = 1;
      if (alphaVal) {
        let al = parseFloat(alphaVal);
        if (alphaVal.endsWith('%')) {
          al = al / 100;
        }
        alpha = al;
      }

      return oklabToRgb(l, a, b, alpha);
    });
  }

  return result;
}

export default function App() {
  // Auto date formatting helper (Requirement 2)
  const getFormattedDate = (date: Date = new Date()) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  // Document Type State: Proforma Invoice (PI) or Commercial Invoice (CI)
  const [documentType, setDocumentType] = useState<'PI' | 'CI'>(() => {
    return (localStorage.getItem('haman_doc_type') as 'PI' | 'CI') || 'PI';
  });

  // Export currency state (Requirement 4)
  const [currency, setCurrency] = useState<'USD' | 'GBP' | 'EUR'>(() => {
    return (localStorage.getItem('haman_currency') as 'USD' | 'GBP' | 'EUR') || 'USD';
  });

  // Dynamic Trade Term (Incoterms) selection (FOB, EXW, CIF, etc.)
  const [tradeTerm, setTradeTerm] = useState<string>(() => {
    return localStorage.getItem('haman_trade_term') || 'FOB';
  });

  // Destination Country Compliance state (Requirement 3)
  const [destinationCountry, setDestinationCountry] = useState<string>(() => {
    return localStorage.getItem('haman_destination_country') || 'USA';
  });

  // Language State: 'zh' (Chinese) or 'en' (English)
  const [language, setLanguage] = useState<'zh' | 'en'>(() => {
    return (localStorage.getItem('haman_language') as 'zh' | 'en') || 'zh';
  });

  // Shipping marks state (CI specific)
  const [shippingMarks, setShippingMarks] = useState(() => localStorage.getItem('haman_shipping_marks') || 'N/M');
  // Port of Loading state (CI specific)
  const [portOfLoading, setPortOfLoading] = useState(() => localStorage.getItem('haman_port_of_loading') || 'QINGDAO, CHINA');
  // Port of Destination state (CI specific)
  const [portOfDestination, setPortOfDestination] = useState(() => localStorage.getItem('haman_port_of_destination') || 'SARAJEVO, BOSNIA');

  // Master Product Database State
  const [productsDb, setProductsDb] = useState<Product[]>(() => {
    const saved = localStorage.getItem('haman_products_db');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Selected Product IDs for active inclusion
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('haman_selected_product_ids');
    return saved ? JSON.parse(saved) : ['1', '2', '3', '4', '5'];
  });

  // Invoice Metadata States
  const [referenceNo, setReferenceNo] = useState(() => localStorage.getItem('haman_ref_no') || 'HM20260714');
  const [enquiryDate, setEnquiryDate] = useState(() => localStorage.getItem('haman_enquiry_date') || getFormattedDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)));
  const [quotationDate, setQuotationDate] = useState(() => localStorage.getItem('haman_quotation_date') || getFormattedDate());
  
  // Buyer & Seller States
  const [buyerName, setBuyerName] = useState(() => localStorage.getItem('haman_buyer_name') || 'GIGA DOO Bosnia and Hercegovina');
  const [buyerAddress, setBuyerAddress] = useState(() => localStorage.getItem('haman_buyer_address') || 'Dzemala Bijedica 199 Sarajevo');
  const [sellerName, setSellerName] = useState(() => localStorage.getItem('haman_seller_name') || 'Shandong Haman Metal Products CO.,Ltd');
  const [sellerAddress, setSellerAddress] = useState(() => localStorage.getItem('haman_seller_address') || 'No. 01 Workshop, West Side, North of Ganjiang Road, Jiuzhou Subdistrict, High-tech Zone, Liaocheng City, Shandong Province, P.R.China');

  // Other Details
  const [packing, setPacking] = useState(() => localStorage.getItem('haman_packing') || 'Standard seaworthy package: wooden pallet, customize cartons available.');
  const [totalCbm, setTotalCbm] = useState(() => localStorage.getItem('haman_total_cbm') || 'N/M');
  const [totalWeight, setTotalWeight] = useState(() => localStorage.getItem('haman_total_weight') || 'N/M');
  const [depositPercent, setDepositPercent] = useState(() => Number(localStorage.getItem('haman_deposit_percent')) || 30);
  const [balancePercent, setBalancePercent] = useState(() => Number(localStorage.getItem('haman_balance_percent')) || 70);
  const [remarks, setRemarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('haman_remarks');
    return saved ? JSON.parse(saved) : [
      'The price is valid for 10 days.',
      'The production lead time is 40-50 working days.'
    ];
  });

  // Bank Info
  const [bankInfo, setBankInfo] = useState<BankInfo>(() => {
    const saved = localStorage.getItem('haman_bank_info');
    return saved ? JSON.parse(saved) : DEFAULT_BANK_INFO;
  });

  // Auto Calculations Toggle state
  const [autoCalculateMeta, setAutoCalculateMeta] = useState<boolean>(() => {
    const saved = localStorage.getItem('haman_auto_calculate_meta');
    return saved === 'true';
  });

  // CRM States
  const [crmCustomers, setCrmCustomers] = useState<CrmCustomer[]>(() => {
    const saved = localStorage.getItem('haman_crm_customers');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
  });

  const [crmProfiles, setCrmProfiles] = useState<CrmProfile[]>(() => {
    const saved = localStorage.getItem('haman_crm_profiles');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
  });

  // Form states for adding CRM entities
  const [newCustomer, setNewCustomer] = useState<Omit<CrmCustomer, 'id'>>({
    companyName: '',
    address: '',
    contactPerson: '',
    email: ''
  });

  const [newProfile, setNewProfile] = useState<Omit<CrmProfile, 'id'>>({
    profileName: '',
    sellerName: 'Shandong Haman Metal Products CO.,Ltd',
    sellerAddress: 'No. 01 Workshop, West Side, North of Ganjiang Road, Jiuzhou Subdistrict, High-tech Zone, Liaocheng City, Shandong Province, P.R.China',
    beneficiaryBank: '',
    beneficiaryBankAddress: '',
    swiftCode: '',
    accountNumber: '',
    packing: 'Standard seaworthy package: wooden pallet.',
    depositPercent: 30,
    balancePercent: 70,
    remarks: ['The price is valid for 10 days.', 'The production lead time is 45 days.']
  });

  // State for Built-in Catalog Search
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Active Tab in Editor
  const [activeTab, setActiveTab] = useState<'database' | 'ai' | 'meta' | 'bank' | 'crm'>('database');

  // AI Parser state
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');


  // Exporting status
  const [isExporting, setIsExporting] = useState<'pdf' | 'image' | 'excel' | null>(null);

  // Search filter for product database
  const [searchQuery, setSearchQuery] = useState('');

  // State for manual product form
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    pic_name: 'Firepit (Model X)',
    size_mm: 'Material: Corten Steel\nThickness: 3.0mm\nDiameter: 800mm\nColor: Rusty brown',
    package_size: '840*840*180mm',
    nw: '15.5KG',
    gw: '17.2KG',
    hs_code: '7326909000',
    qty: 100,
    fob_usd: 25.00
  });

  const previewRef = useRef<HTMLDivElement>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('haman_products_db', JSON.stringify(productsDb));
  }, [productsDb]);

  useEffect(() => {
    localStorage.setItem('haman_selected_product_ids', JSON.stringify(selectedProductIds));
  }, [selectedProductIds]);

  useEffect(() => {
    localStorage.setItem('haman_doc_type', documentType);
  }, [documentType]);

  useEffect(() => {
    localStorage.setItem('haman_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('haman_destination_country', destinationCountry);
  }, [destinationCountry]);

  useEffect(() => {
    localStorage.setItem('haman_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('haman_trade_term', tradeTerm);
  }, [tradeTerm]);

  useEffect(() => {
    localStorage.setItem('haman_shipping_marks', shippingMarks);
  }, [shippingMarks]);

  useEffect(() => {
    localStorage.setItem('haman_port_of_loading', portOfLoading);
  }, [portOfLoading]);

  useEffect(() => {
    localStorage.setItem('haman_port_of_destination', portOfDestination);
  }, [portOfDestination]);

  useEffect(() => {
    localStorage.setItem('haman_crm_customers', JSON.stringify(crmCustomers));
  }, [crmCustomers]);

  useEffect(() => {
    localStorage.setItem('haman_crm_profiles', JSON.stringify(crmProfiles));
  }, [crmProfiles]);

  useEffect(() => {
    localStorage.setItem('haman_ref_no', referenceNo);
    localStorage.setItem('haman_enquiry_date', enquiryDate);
    localStorage.setItem('haman_quotation_date', quotationDate);
    localStorage.setItem('haman_buyer_name', buyerName);
    localStorage.setItem('haman_buyer_address', buyerAddress);
    localStorage.setItem('haman_seller_name', sellerName);
    localStorage.setItem('haman_seller_address', sellerAddress);
    localStorage.setItem('haman_packing', packing);
    localStorage.setItem('haman_total_cbm', totalCbm);
    localStorage.setItem('haman_total_weight', totalWeight);
    localStorage.setItem('haman_deposit_percent', depositPercent.toString());
    localStorage.setItem('haman_balance_percent', balancePercent.toString());
    localStorage.setItem('haman_remarks', JSON.stringify(remarks));
    localStorage.setItem('haman_bank_info', JSON.stringify(bankInfo));
    localStorage.setItem('haman_auto_calculate_meta', autoCalculateMeta.toString());
  }, [referenceNo, enquiryDate, quotationDate, buyerName, buyerAddress, sellerName, sellerAddress, packing, totalCbm, totalWeight, depositPercent, balancePercent, remarks, bankInfo, autoCalculateMeta]);

  // Derived Products currently shown on the PI (the ones selected/checked)
  const activeProducts = productsDb.filter(p => selectedProductIds.includes(p.id));

  // Dynamic calculations for selected products
  const grandTotal = activeProducts.reduce((sum, p) => sum + (p.qty * p.fob_usd), 0);
  const depositAmount = (grandTotal * depositPercent) / 100;
  const balanceAmount = (grandTotal * balancePercent) / 100;

  // Real-time automatic dimension & weight parse calculations
  const autoMetaValues = React.useMemo(() => {
    let totalCbmVal = 0;
    let totalNwVal = 0;
    let totalGwVal = 0;
    let totalQtyVal = 0;

    activeProducts.forEach(p => {
      totalQtyVal += p.qty;

      // 1. Calculate CBM
      // Extract numbers like 640*640*165
      const sizeMatch = p.package_size.match(/([\d.]+)\s*[\*xX]\s*([\d.]+)\s*[\*xX]\s*([\d.]+)/);
      if (sizeMatch) {
        const d1 = parseFloat(sizeMatch[1]);
        const d2 = parseFloat(sizeMatch[2]);
        const d3 = parseFloat(sizeMatch[3]);
        
        // Assume mm if > 150, else cm
        const isMm = d1 > 150 || d2 > 150 || d3 > 150;
        const divider = isMm ? 1000 : 100;
        
        const lengthM = d1 / divider;
        const widthM = d2 / divider;
        const heightM = d3 / divider;
        
        const itemCbm = lengthM * widthM * heightM * p.qty;
        totalCbmVal += itemCbm;
      }

      // 2. Calculate Net Weight
      const nwMatch = p.nw.match(/([\d.]+)/);
      if (nwMatch) {
        const nwNum = parseFloat(nwMatch[1]);
        totalNwVal += nwNum * p.qty;
      }

      // 3. Calculate Gross Weight
      const gwMatch = p.gw.match(/([\d.]+)/);
      if (gwMatch) {
        const gwNum = parseFloat(gwMatch[1]);
        totalGwVal += gwNum * p.qty;
      }
    });

    return {
      cbm: totalCbmVal > 0 ? `${totalCbmVal.toFixed(3)} CBM` : 'N/M',
      weight: totalGwVal > 0 ? `GW: ${totalGwVal.toFixed(1)} KGS / NW: ${totalNwVal.toFixed(1)} KGS` : 'N/M',
      totalQty: totalQtyVal,
      totalNw: totalNwVal > 0 ? `${totalNwVal.toFixed(1)} KGS` : 'N/M',
      totalGw: totalGwVal > 0 ? `${totalGwVal.toFixed(1)} KGS` : 'N/M'
    };
  }, [activeProducts]);

  // Live Sync auto calculation into preview inputs
  useEffect(() => {
    if (autoCalculateMeta && activeProducts.length > 0) {
      setTotalCbm(autoMetaValues.cbm);
      setTotalWeight(autoMetaValues.weight);
    }
  }, [autoMetaValues, autoCalculateMeta, activeProducts.length]);

  // Country-specific HS Code Mapping (Requirement 3)
  const COUNTRY_HS_CODE_MAPPING: Record<string, Record<string, string>> = {
    'Germany': {
      '7326909000': '7326.90.90.10',
      'default': '7326.90.90.10'
    },
    'United Kingdom': {
      '7326909000': '7326.90.90.00',
      'default': '7326.90.90.00'
    },
    'USA': {
      '7326909000': '7326.90.86.88',
      'default': '7326.90.86.88'
    },
    'France': {
      '7326909000': '7326.90.90.15',
      'default': '7326.90.90.15'
    }
  };

  const getCountryHsCode = (baseHsCode: string, country: string): string => {
    const cleanBase = (baseHsCode || '7326909000').replace(/[^0-9]/g, '');
    const mapping = COUNTRY_HS_CODE_MAPPING[country];
    if (mapping) {
      if (mapping[cleanBase]) return mapping[cleanBase];
      if (mapping['default']) return mapping['default'];
    }
    // Fallback logic
    if (country === 'Germany') {
      return cleanBase.slice(0, 4) + '.' + cleanBase.slice(4, 8) + '.10';
    } else if (country === 'United Kingdom') {
      return cleanBase.slice(0, 4) + '.' + cleanBase.slice(4, 8) + '.00';
    } else if (country === 'USA') {
      return cleanBase.slice(0, 4) + '.' + cleanBase.slice(4, 6) + '.' + cleanBase.slice(6, 10);
    } else if (country === 'France') {
      return cleanBase.slice(0, 4) + '.' + cleanBase.slice(4, 8) + '.15';
    }
    return baseHsCode;
  };

  // Format currency helper (Requirement 4)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency, // USD, GBP, or EUR
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // Check / Uncheck products
  const handleToggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllProducts = () => {
    setSelectedProductIds(productsDb.map(p => p.id));
  };

  const handleClearAllSelections = () => {
    setSelectedProductIds([]);
  };

  // Add Product to database and automatically check it
  const handleAddProductToDb = () => {
    const newId = Date.now().toString();
    const item: Product = {
      ...newProduct,
      id: newId
    };
    setProductsDb(prev => [item, ...prev]);
    setSelectedProductIds(prev => [...prev, newId]);
    
    // Reset manual form with beautiful default
    setNewProduct({
      pic_name: 'Firepit (New Model)',
      size_mm: 'Material: Carbon steel\nThickness: 2.5mm\nAssembly size: 700*700*280mm',
      package_size: '740*740*165mm',
      nw: '12.5KG',
      gw: '14.0KG',
      hs_code: '7326909000',
      qty: 100,
      fob_usd: 22.00
    });
  };

  // Add Product from the searchable built-in database catalog
  const handleAddFromCatalog = (catItem: CatalogProduct) => {
    const newId = `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const product: Product = {
      id: newId,
      pic_name: catItem.pic_name,
      size_mm: catItem.size_mm,
      package_size: catItem.package_size,
      nw: catItem.nw,
      gw: catItem.gw,
      hs_code: catItem.hs_code,
      qty: 100, // Default qty
      fob_usd: 0 // Default empty, user will double click or type price
    };
    
    setProductsDb(prev => [product, ...prev]);
    setSelectedProductIds(prev => [...prev, newId]);
  };

  // Delete product from master database
  const handleDeleteProductFromDb = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要从产品库中删除此款产品吗？')) {
      setProductsDb(prev => prev.filter(p => p.id !== id));
      setSelectedProductIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  // Direct cell editing in master list
  const handleProductCellChange = (id: string, field: keyof Product, value: any) => {
    setProductsDb(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  // Call server-side API to parse raw text with Gemini
  const handleAiParse = async () => {
    if (!aiInput.trim()) {
      setAiError('请先输入产品的各类数据描述文本');
      return;
    }

    setIsParsing(true);
    setAiError('');
    setAiSuccessMsg('');

    try {
      const response = await fetch('/api/parse-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawText: aiInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '解析失败，请检查服务器连接或 API key');
      }

      if (data.success && Array.isArray(data.products)) {
        if (data.products.length === 0) {
          setAiError('AI 未能识别到任何有效的产品行，请确认输入的格式。');
        } else {
          const mapped: Product[] = data.products.map((p: any, index: number) => ({
            id: (Date.now() + index).toString(),
            pic_name: p.pic_name || 'Firepit',
            size_mm: p.size_mm || '',
            package_size: p.package_size || '',
            nw: p.nw || '',
            gw: p.gw || '',
            hs_code: p.hs_code || '7326909000',
            qty: Number(p.qty) || 100,
            fob_usd: Number(p.fob_usd) || 0.00
          }));

          setProductsDb(prev => [...mapped, ...prev]);
          // Auto select newly parsed products
          const parsedIds = mapped.map(item => item.id);
          setSelectedProductIds(prev => [...prev, ...parsedIds]);
          
          setAiSuccessMsg(`成功由 AI 智能解析并添加了 ${mapped.length} 款新产品至账单！`);
          setAiInput('');
        }
      } else {
        throw new Error('解析格式错误');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || '系统发生错误，请稍后再试');
    } finally {
      setIsParsing(false);
    }
  };

  // Preset raw text for AI demo
  const loadAiTestPreset = () => {
    setAiInput(`客户询盘需求：
外形尺寸为1000*1000*450mm的八角形耐候钢火盆50套，
材质用 Corten Steel 耐候钢板，厚度是 3.0mm，
外箱包装规格大约：1050*1050*220mm，
单只净重大约 19.5KG，毛重 22.0KG 左右。
HS CODE使用默认的7326909000即可。
单套 FOB 价格请做 39 美金一张单。`);
  };

  // Reset Master products list and database back to initial
  const handleResetTemplate = () => {
    if (window.confirm('您确定要重置产品库与所有抬头信息吗？重置后将恢复默认示例数据。')) {
      setReferenceNo('HM20260714');
      setEnquiryDate('Jul,14,2026');
      setQuotationDate('Jul,14,2026');
      setBuyerName('GIGA DOO Bosnia and Hercegovina');
      setBuyerAddress('Dzemala Bijedica 199 Sarajevo');
      setSellerName('Shandong Haman Metal Products CO.,Ltd');
      setSellerAddress('No. 01 Workshop, West Side, North of Ganjiang Road, Jiuzhou Subdistrict, High-tech Zone, Liaocheng City, Shandong Province, P.R.China');
      setProductsDb(INITIAL_PRODUCTS);
      setSelectedProductIds(['1', '2', '3', '4', '5']);
      setPacking('Standard seaworthy package: wooden pallet, customize cartons available.');
      setTotalCbm('N/M');
      setTotalWeight('N/M');
      setDepositPercent(30);
      setBalancePercent(70);
      setRemarks([
        'The price is valid for 10 days.',
        'The production lead time is 40-50 working days.'
      ]);
      setBankInfo(DEFAULT_BANK_INFO);
      setAutoCalculateMeta(false);
      localStorage.clear();
    }
  };

  // 1. Export as HIGH RESOLUTION PDF (A4 Layout)
  const handleExportPDF = async () => {
    const element = previewRef.current;
    if (!element) return;

    setIsExporting('pdf');
    const todayStr = getFormattedDate();
    setQuotationDate(todayStr);

    // Dynamic style injection to hide Item Photo column and optimize layout spacing during export
    const styleTag = document.createElement('style');
    styleTag.id = 'temp-export-style';
    styleTag.innerHTML = `
      .col-item-photo { display: none !important; }
      #pi-print-area { padding: 24px !important; }
      #pi-print-area table th, #pi-print-area table td { padding-top: 4px !important; padding-bottom: 4px !important; }
      #pi-print-area .mt-8 { margin-top: 16px !important; }
      #pi-print-area .mb-4 { margin-bottom: 8px !important; }
      #pi-print-area .pb-5 { padding-bottom: 12px !important; }
      #pi-print-area .mb-5 { margin-bottom: 12px !important; }
    `;
    document.head.appendChild(styleTag);

    try {
      // Allow React to re-render in export mode so inputs become flat read-only text spans
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Prepare canvas with scale: 2 for premium print resolution
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('pi-print-area');
          if (clonedElement) {
            // Convert OKLCH color strings for html2canvas compatibility
            const elements = [clonedElement, ...Array.from(clonedElement.getElementsByTagName('*'))];
            elements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const computed = window.getComputedStyle(htmlEl);
              const properties = [
                'backgroundColor',
                'color',
                'borderTopColor',
                'borderRightColor',
                'borderBottomColor',
                'borderLeftColor',
                'borderColor',
                'fill',
                'stroke',
                'outlineColor',
                'textDecorationColor'
              ];
              properties.forEach((prop) => {
                const val = computed[prop as any];
                if (val && (val.includes('oklch') || val.includes('oklab'))) {
                  const converted = parseOklchAndOklab(val);
                  if (converted !== val) {
                    (htmlEl.style as any)[prop] = converted;
                  }
                }
              });
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const invoiceNo = referenceNo || 'UNNAMED';
      pdf.save('Proforma_Invoice_' + invoiceNo + '.pdf');
    } catch (err) {
      console.error(err);
      alert('导出 PDF 账单失败，请重试');
    } finally {
      styleTag.remove();
      setIsExporting(null);
    }
  };

  // 2. Export as HIGH-RESOLUTION PNG Image
  const handleExportImage = async () => {
    const element = previewRef.current;
    if (!element) return;

    setIsExporting('image');
    const todayStr = getFormattedDate();
    setQuotationDate(todayStr);

    // Dynamic style injection to hide Item Photo column and optimize layout spacing during export
    const styleTag = document.createElement('style');
    styleTag.id = 'temp-export-style';
    styleTag.innerHTML = `
      .col-item-photo { display: none !important; }
      #pi-print-area { padding: 24px !important; }
      #pi-print-area table th, #pi-print-area table td { padding-top: 4px !important; padding-bottom: 4px !important; }
      #pi-print-area .mt-8 { margin-top: 16px !important; }
      #pi-print-area .mb-4 { margin-bottom: 8px !important; }
      #pi-print-area .pb-5 { padding-bottom: 12px !important; }
      #pi-print-area .mb-5 { margin-bottom: 12px !important; }
    `;
    document.head.appendChild(styleTag);

    try {
      // Allow React to re-render in export mode so inputs become flat read-only text spans
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('pi-print-area');
          if (clonedElement) {
            // Convert OKLCH color strings for html2canvas compatibility
            const elements = [clonedElement, ...Array.from(clonedElement.getElementsByTagName('*'))];
            elements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const computed = window.getComputedStyle(htmlEl);
              const properties = [
                'backgroundColor',
                'color',
                'borderTopColor',
                'borderRightColor',
                'borderBottomColor',
                'borderLeftColor',
                'borderColor',
                'fill',
                'stroke',
                'outlineColor',
                'textDecorationColor'
              ];
              properties.forEach((prop) => {
                const val = computed[prop as any];
                if (val && (val.includes('oklch') || val.includes('oklab'))) {
                  const converted = parseOklchAndOklab(val);
                  if (converted !== val) {
                    (htmlEl.style as any)[prop] = converted;
                  }
                }
              });
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      const invoiceNo = referenceNo || 'UNNAMED';
      link.download = 'Invoice_' + invoiceNo + '.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('导出图片失败，请重试');
    } finally {
      styleTag.remove();
      setIsExporting(null);
    }
  };

  // 3. Export as Structured EXCEL (.xlsx) Spreadsheet via Backend Python Template Engine
  const handleExportExcel = async () => {
    setIsExporting('excel');
    
    // Strong asynchronous wait mechanism to ensure front-end State and component data are completely synchronized
    await new Promise((resolve) => setTimeout(resolve, 300));

    const todayStr = getFormattedDate();
    setQuotationDate(todayStr);
    try {
      const activeProductsMapped = activeProducts.map(p => ({
        ...p,
        hs_code: getCountryHsCode(p.hs_code, destinationCountry)
      }));

      const payload = {
        buyerName,
        buyerAddress,
        referenceNo,
        date: todayStr,
        products: activeProductsMapped,
        documentType,
        shippingMarks,
        portOfLoading,
        portOfDestination,
        packing,
        totalCbm,
        totalWeight,
        depositPercent,
        balancePercent,
        depositAmount,
        balanceAmount,
        grandTotal,
        remarks,
        bankInfo,
        currency,
        destinationCountry
      };

      const response = await fetch('/api/export-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (errorData.details ? `${errorData.error}: ${errorData.details}` : '导出失败'));
      }

      const resData = await response.json();
      if (resData.success && resData.downloadUrl) {
        const link = document.createElement('a');
        link.href = resData.downloadUrl;
        link.download = resData.fileName || `Invoice_${referenceNo}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('服务器没有返回有效的下载链接');
      }
    } catch (err: any) {
      console.error('Excel generation error:', err);
      alert(language === 'zh' 
        ? `导出 Excel 失败: ${err.message}` 
        : `Failed to export Excel: ${err.message}`
      );
    } finally {
      setIsExporting(null);
    }
  };

  // Master product search filter
  const filteredProductsDb = productsDb.filter(p => 
    matchesQuery(p.pic_name + ' ' + p.size_mm, searchQuery)
  );

  // Filtered built-in database catalog
  const filteredCatalog = React.useMemo(() => {
    return BUILT_IN_CATALOG.filter(item => {
      const matchesSearch = matchesQuery(item.pic_name + ' ' + item.size_mm, catalogSearchQuery);
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [catalogSearchQuery, selectedCategory]);

  const catalogCategories = ['All', 'Metal Screen', 'Screen Planter', 'Planter', 'Garden Edging', 'AC Cover', 'Firepit'];

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 flex flex-col font-sans" id="root-viewport">
      {/* Upper Navigation Bar */}
      <header className="bg-white border-b border-[#e1e4e8] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tight text-slate-900">
              {language === 'zh' ? '哈曼外贸发票生成系统' : 'Haman Invoice System'}
            </h1>
          </div>

          {/* Segmented Document Type Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 ml-2 shadow-inner">
            <button
              onClick={() => setDocumentType('PI')}
              className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer ${
                documentType === 'PI'
                  ? 'bg-[#1a1a1a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={language === 'zh' ? "切换到 形式发票 (PROFORMA INVOICE) 模式" : "Switch to Proforma Invoice (PI) mode"}
            >
              {language === 'zh' ? '形式发票 (PI)' : 'Proforma (PI)'}
            </button>
            <button
              onClick={() => setDocumentType('CI')}
              className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer ${
                documentType === 'CI'
                  ? 'bg-[#1a1a1a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={language === 'zh' ? "切换到 商业发票 (COMMERCIAL INVOICE) 模式" : "Switch to Commercial Invoice (CI) mode"}
            >
              {language === 'zh' ? '商业发票 (CI)' : 'Commercial (CI)'}
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 ml-2 shadow-inner">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer ${
                language === 'zh'
                  ? 'bg-[#1a1a1a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇨🇳 中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#1a1a1a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>

        {/* Global Export Options */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetTemplate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 text-slate-700 cursor-pointer"
            title={language === 'zh' ? "恢复初始数据库及账单抬头样式" : "Restore initial template database"}
            id="btn-reset-template"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-600" />
            {language === 'zh' ? '重置模板' : 'Reset Template'}
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* Excel Export */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting !== null}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            id="btn-export-excel"
            title={language === 'zh' ? "导出为真实行、列及求和结构的 Excel 表格" : "Export to structured Excel spreadsheet"}
          >
            {isExporting === 'excel' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1a1a1a]" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            )}
            {language === 'zh' ? '导出 Excel' : 'Export Excel'}
          </button>

          {/* Image Export */}
          <button
            onClick={handleExportImage}
            disabled={isExporting !== null}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            id="btn-export-image"
            title={language === 'zh' ? "将账单页面保存为 PNG 格式高清图片" : "Save billing preview as high-res PNG image"}
          >
            {isExporting === 'image' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1a1a1a]" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
            )}
            {language === 'zh' ? '导出图片' : 'Export PNG'}
          </button>

          {/* PDF Export */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting !== null}
            className="flex items-center gap-2 px-5 py-2 text-xs font-black bg-[#1a1a1a] hover:bg-[#2c2c2c] text-white rounded-lg transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-50 cursor-pointer"
            id="btn-export-pdf"
            title={language === 'zh' ? "导出符合 A4 标准打印尺寸的矢量 PDF 发票账单" : "Export standard print-ready A4 PDF document"}
          >
            {isExporting === 'pdf' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                {language === 'zh' ? '正在生成 PDF...' : 'Generating PDF...'}
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 text-white animate-bounce" />
                <span>{language === 'zh' ? '一键导出 A4 PDF' : 'Export A4 PDF'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden bg-[#f4f6f8] p-4 gap-4 items-stretch">
        
        {/* Left Side: Sidebar Control Panel */}
        <aside className="w-full lg:w-[440px] bg-white border border-[#e1e4e8] rounded-xl flex flex-col h-full z-10 shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          
          {/* Tab Selection */}
          <div className="flex border-b border-[#e1e4e8] bg-white sticky top-0 z-10">
            <button
              onClick={() => setActiveTab('database')}
              className={`flex-1 py-3.5 px-1 text-[11px] font-bold border-b-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                activeTab === 'database' 
                  ? 'border-[#1a1a1a] text-[#1a1a1a] bg-slate-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
              id="tab-btn-database"
            >
              <Database className="h-4 w-4" />
              <span>{language === 'zh' ? '规格库' : 'Product DB'}</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-3.5 px-1 text-[11px] font-bold border-b-2 transition-all flex flex-col items-center gap-1.5 relative cursor-pointer ${
                activeTab === 'ai' 
                  ? 'border-[#1a1a1a] text-[#1a1a1a] bg-slate-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
              id="tab-btn-ai"
            >
              <span className="absolute top-1.5 right-3 w-1.5 h-1.5 bg-[#1a1a1a] rounded-full animate-ping"></span>
              <Wand2 className="h-4 w-4 text-[#1a1a1a]" />
              <span>{language === 'zh' ? 'AI 解析' : 'AI Assistant'}</span>
            </button>
            <button
              onClick={() => setActiveTab('meta')}
              className={`flex-1 py-3.5 px-1 text-[11px] font-bold border-b-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                activeTab === 'meta' 
                  ? 'border-[#1a1a1a] text-[#1a1a1a] bg-slate-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
              id="tab-btn-meta"
            >
              <Settings className="h-4 w-4" />
              <span>{language === 'zh' ? '抬头备注' : 'Header Info'}</span>
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex-1 py-3.5 px-1 text-[11px] font-bold border-b-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                activeTab === 'bank' 
                  ? 'border-[#1a1a1a] text-[#1a1a1a] bg-slate-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
              id="tab-btn-bank"
            >
              <CreditCard className="h-4 w-4" />
              <span>{language === 'zh' ? '收款银行' : 'Bank'}</span>
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className={`flex-1 py-3.5 px-1 text-[11px] font-bold border-b-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                activeTab === 'crm' 
                  ? 'border-[#1a1a1a] text-[#1a1a1a] bg-slate-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
              id="tab-btn-crm"
            >
              <Users className="h-4 w-4" />
              <span>{language === 'zh' ? '客户库' : 'CRM'}</span>
            </button>
          </div>

          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" id="sidebar-tab-content">
            
            {/* 1. MASTER PRODUCT SELECTION AND MANAGEMENT */}
            {activeTab === 'database' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Search Built-in Catalog */}
                <div className="bg-[#f8fafc] border border-[#e1e4e8] rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <Search className="h-4 w-4 text-slate-600" />
                      从内置规格库导入产品 (30+ 规格数据)
                    </h3>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="在规格库中搜索产品型号/尺寸..."
                        value={catalogSearchQuery}
                        onChange={(e) => setCatalogSearchQuery(e.target.value)}
                        className="w-full bg-white border border-[#e1e4e8] text-slate-900 pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#1a1a1a]"
                      />
                    </div>
                    {/* Category Selector */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-white border border-[#e1e4e8] text-slate-900 px-2 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#1a1a1a] cursor-pointer"
                    >
                      {catalogCategories.map(cat => (
                        <option key={cat} value={cat}>{cat === 'All' ? '全部品类' : cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Results Container */}
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {filteredCatalog.map((item, idx) => {
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e1e4e8] hover:bg-slate-50 transition-all text-xs gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 block truncate">{item.pic_name}</span>
                            <span className="text-[10px] text-slate-500 block truncate font-mono">{item.size_mm.replace(/\n/g, ' | ')}</span>
                          </div>
                          <button
                            onClick={() => handleAddFromCatalog(item)}
                            className="px-2.5 py-1 text-[10px] font-black bg-[#1a1a1a] hover:bg-[#2c2c2c] text-white rounded transition-colors shrink-0 flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            导入
                          </button>
                        </div>
                      );
                    })}
                    {filteredCatalog.length === 0 && (
                      <div className="text-center py-4 text-[11px] text-slate-400 italic">
                        未找到对应的内置产品规格。
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#f8fafc] border border-[#e1e4e8] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                      <Calculator className="h-3.5 w-3.5 text-slate-600" />
                      已添加产品 & 物流参数求和系统
                    </span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700 font-medium">
                      <input 
                        type="checkbox" 
                        checked={autoCalculateMeta}
                        onChange={(e) => setAutoCalculateMeta(e.target.checked)}
                        className="rounded border-gray-300 text-[#1a1a1a] focus:ring-0 w-3.5 h-3.5"
                      />
                      自动对齐总重和总立方
                    </label>
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                    在下方<strong>勾选或取消勾选产品</strong>，右侧账单中的所有产品参数、规格尺寸、以及总金额、订金等信息将<strong>智能自动对齐并刷新计算</strong>！
                  </p>
                </div>

                {/* Search & Actions Bar */}
                <div className="space-y-2.5">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="搜索产品库中的名称或规格参数..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-[#e1e4e8] text-slate-900 pl-9 pr-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-[#1a1a1a]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600">
                      产品库 ({productsDb.length} 款) • 已选择 {selectedProductIds.length} 款
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleSelectAllProducts}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2 py-1 rounded cursor-pointer font-bold transition-all"
                      >
                        一键全选
                      </button>
                      <button
                        onClick={handleClearAllSelections}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2 py-1 rounded cursor-pointer font-bold transition-all"
                      >
                        清空选择
                      </button>
                    </div>
                  </div>
                </div>

                {/* Master Database List */}
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {filteredProductsDb.map((p, index) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div 
                        key={p.id}
                        onClick={() => handleToggleProductSelection(p.id)}
                        className={`border rounded-xl p-3 transition-all cursor-pointer flex gap-3 items-start relative ${
                          isSelected 
                            ? 'bg-[#f8fafc] border-[#1a1a1a] shadow-sm' 
                            : 'bg-white border-[#e1e4e8] hover:border-slate-350'
                        }`}
                      >
                        {/* Checkbox Icon */}
                        <div className="mt-0.5 shrink-0 text-[#1a1a1a]">
                          {isSelected ? (
                            <CheckSquare className="h-4.5 w-4.5 fill-slate-900/5" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-slate-300" />
                          )}
                        </div>

                        {/* Product Meta details */}
                        <div className="flex-1 min-w-0 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-slate-900 text-xs truncate">
                              {p.pic_name}
                            </span>
                            <button
                              onClick={(e) => handleDeleteProductFromDb(p.id, e)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors shrink-0 cursor-pointer"
                              title="从产品库中彻底删除该项"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Editable Cells inside control drawer */}
                          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                            <div>
                              <span className="text-slate-500 font-medium block">品名描述 (Pic Show)</span>
                              <input
                                type="text"
                                value={p.pic_name}
                                onChange={(e) => handleProductCellChange(p.id, 'pic_name', e.target.value)}
                                className="w-full bg-white border border-[#e1e4e8] px-1.5 py-1 rounded text-slate-950 mt-0.5 focus:border-[#1a1a1a] focus:outline-none font-medium"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium block">海关编码 (HS Code)</span>
                              <input
                                type="text"
                                value={p.hs_code}
                                onChange={(e) => handleProductCellChange(p.id, 'hs_code', e.target.value)}
                                className="w-full bg-white border border-[#e1e4e8] px-1.5 py-1 rounded text-slate-950 mt-0.5 focus:border-[#1a1a1a] focus:outline-none font-mono font-medium"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium block">数量 (Qty/set)</span>
                              <input
                                type="number"
                                value={p.qty}
                                onChange={(e) => handleProductCellChange(p.id, 'qty', Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-white border border-[#e1e4e8] px-1.5 py-1 rounded text-slate-950 mt-0.5 focus:border-[#1a1a1a] focus:outline-none font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium block">{tradeTerm} 单价 ({currency})</span>
                              <input
                                type="number"
                                step="0.01"
                                value={p.fob_usd}
                                onChange={(e) => handleProductCellChange(p.id, 'fob_usd', Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white border border-[#e1e4e8] px-1.5 py-1 rounded text-slate-950 mt-0.5 focus:border-[#1a1a1a] focus:outline-none font-extrabold text-emerald-700"
                              />
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-500 font-medium block">产品规格及组装尺寸 (Size mm)</span>
                              <textarea
                                value={p.size_mm}
                                onChange={(e) => handleProductCellChange(p.id, 'size_mm', e.target.value)}
                                className="w-full bg-white border border-[#e1e4e8] px-1.5 py-1 rounded text-slate-950 mt-0.5 focus:border-[#1a1a1a] focus:outline-none text-[10px] font-mono h-12 resize-none leading-normal font-medium"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium block">包装规格 (Package Size)</span>
                              <input
                                type="text"
                                value={p.package_size}
                                onChange={(e) => handleProductCellChange(p.id, 'package_size', e.target.value)}
                                className="w-full bg-white border border-[#e1e4e8] px-1.5 py-1 rounded text-slate-950 mt-0.5 focus:border-[#1a1a1a] focus:outline-none font-mono font-medium"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium block">净重 / 毛重 (NW / GW)</span>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={p.nw}
                                  onChange={(e) => handleProductCellChange(p.id, 'nw', e.target.value)}
                                  className="w-1/2 bg-white border border-[#e1e4e8] px-1 py-1 rounded text-slate-950 mt-0.5 focus:border-[#1a1a1a] focus:outline-none text-center font-medium"
                                  placeholder="NW"
                                />
                                <input
                                  type="text"
                                  value={p.gw}
                                  onChange={(e) => handleProductCellChange(p.id, 'gw', e.target.value)}
                                  className="w-1/2 bg-white border border-[#e1e4e8] px-1 py-1 rounded text-slate-950 mt-0.5 focus:border-[#1a1a1a] focus:outline-none text-center font-medium"
                                  placeholder="GW"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredProductsDb.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      未找到对应产品。
                    </div>
                  )}
                </div>

                {/* Add New Product to Master list manually */}
                <div className="bg-[#f8fafc] border border-[#e1e4e8] rounded-xl p-4 space-y-3 shadow-sm">
                  <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <PlusCircle className="h-4 w-4 text-[#1a1a1a]" />
                    添加新产品至产品库
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="col-span-2">
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">产品品名 / 型号</label>
                      <input
                        type="text"
                        value={newProduct.pic_name}
                        onChange={(e) => setNewProduct({ ...newProduct, pic_name: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-medium"
                        placeholder="例: Firepit (Model C)"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">规格参数与细节描述 (Size Specs)</label>
                      <textarea
                        value={newProduct.size_mm}
                        onChange={(e) => setNewProduct({ ...newProduct, size_mm: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 h-14 font-mono text-[10.5px] font-medium"
                        placeholder="换行分隔。例:&#10;Material: Carbon steel&#10;Thickness: 3.0mm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">包装规格 (Package)</label>
                      <input
                        type="text"
                        value={newProduct.package_size}
                        onChange={(e) => setNewProduct({ ...newProduct, package_size: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-medium"
                        placeholder="例: 840*840*180mm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">海关编码 (HS Code)</label>
                      <input
                        type="text"
                        value={newProduct.hs_code}
                        onChange={(e) => setNewProduct({ ...newProduct, hs_code: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-mono font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">净重 (NW)</label>
                      <input
                        type="text"
                        value={newProduct.nw}
                        onChange={(e) => setNewProduct({ ...newProduct, nw: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-medium"
                        placeholder="例: 14.5KG"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">毛重 (GW)</label>
                      <input
                        type="text"
                        value={newProduct.gw}
                        onChange={(e) => setNewProduct({ ...newProduct, gw: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-medium"
                        placeholder="例: 16.5KG"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">数量 (Qty/set)</label>
                      <input
                        type="number"
                        value={newProduct.qty}
                        onChange={(e) => setNewProduct({ ...newProduct, qty: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">离岸单价 (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.fob_usd}
                        onChange={(e) => setNewProduct({ ...newProduct, fob_usd: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-bold text-emerald-700"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddProductToDb}
                    className="w-full py-2 bg-[#1a1a1a] hover:bg-[#2c2c2c] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer mt-2 shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    保存并选中该产品
                  </button>
                </div>
              </div>
            )}

            {/* 2. AI INTELLIGENT PARSER */}
            {activeTab === 'ai' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-[#f8fafc] border border-[#e1e4e8] rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      智能开单解析
                    </h3>
                    <button
                      onClick={loadAiTestPreset}
                      className="text-[10px] text-slate-600 hover:text-[#1a1a1a] hover:underline cursor-pointer font-bold transition-all"
                    >
                      加载测试文本
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    您可以从微信聊天、报价单草稿、邮件中<strong>复制任何乱序、中英文夹杂的产品数据</strong>粘贴在下方。AI 将自动分析提取参数、包装、单价等并将其对齐录入。
                  </p>

                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className="w-full h-36 bg-white border border-[#e1e4e8] rounded-lg p-2.5 text-xs text-slate-950 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none placeholder-slate-400 leading-relaxed font-sans font-medium"
                    placeholder="例如: 想要添加一款八角火盆，50个，FOB单价39美元，规格是1000*1000*450mm，耐候钢材质，厚度3.0mm，外包装105*105*22公分，毛重22公斤，净重19.5..."
                    id="ai-text-input"
                  />

                  {aiError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2 font-medium">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{aiError}</span>
                    </div>
                  )}

                  {aiSuccessMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-start gap-2 font-medium">
                      <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>{aiSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    onClick={handleAiParse}
                    disabled={isParsing}
                    className="w-full py-2 bg-[#1a1a1a] hover:bg-[#2c2c2c] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    id="btn-ai-parse"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                        AI 正在提取产品参数...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5 text-white" />
                        分析并录入到产品库
                      </>
                    )}
                  </button>
                </div>

                <div className="border border-[#e1e4e8] rounded-lg p-3 text-xs bg-[#f8fafc] space-y-1 text-slate-600 font-medium">
                  <span className="font-semibold text-slate-800 block">💡 识别字段包括：</span>
                  <p>• 品名与分类 (Pic show)</p>
                  <p>• 详细规格、厚度、尺寸 (Size mm)</p>
                  <p>• 包装尺寸 (Package size)</p>
                  <p>• 净重/毛重 (NW/GW) 与 FOB 美金单价</p>
                </div>
              </div>
            )}

            {/* 3. INVOICE HEADERS & TERMS METADATA */}
            {activeTab === 'meta' && (
              <div className="space-y-4 animate-fadeIn">
                {/* 国际化贸易结算配置 (Global Trade Settings) */}
                <div className="bg-[#f8fafc] border border-blue-100 rounded-xl p-4 space-y-3.5 shadow-sm ring-2 ring-blue-500/5">
                  <h3 className="text-xs font-black text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <Globe className="h-4 w-4 text-blue-600" />
                    国际化贸易结算配置 (Global Trade Settings)
                  </h3>
                  
                  <div className="space-y-3.5 text-xs">
                    {/* Destination Country for compliance */}
                    <div>
                      <span className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        🌍 1. 出口目的国 (Destination Country - HS Code Compliant):
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'Germany', name: '德国 Germany', flag: '🇩🇪', hs: '7326.90.90.10' },
                          { id: 'United Kingdom', name: '英国 UK', flag: '🇬🇧', hs: '7326.90.90.00' },
                          { id: 'USA', name: '美国 USA', flag: '🇺🇸', hs: '7326.90.86.88' },
                          { id: 'France', name: '法国 France', flag: '🇫🇷', hs: '7326.90.90.15' }
                        ].map(c => {
                          const isSelected = destinationCountry === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => setDestinationCountry(c.id)}
                              className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-[52px] ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500' 
                                  : 'border-slate-200 bg-white hover:border-slate-400'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-[10.5px] text-slate-800">
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                              </div>
                              <div className="text-[9px] font-mono text-slate-500 scale-95 origin-left">
                                HS: {c.hs}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Export Currency selector */}
                    <div>
                      <span className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        💱 2. 结算货种 (Export Billing Currency):
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'USD', name: '美元 USD', symbol: '$' },
                          { id: 'GBP', name: '英镑 GBP', symbol: '£' },
                          { id: 'EUR', name: '欧元 EUR', symbol: '€' }
                        ].map(curr => {
                          const isSelected = currency === curr.id;
                          return (
                            <button
                              key={curr.id}
                              onClick={() => setCurrency(curr.id as 'USD' | 'GBP' | 'EUR')}
                              className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-0.5 ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500 font-bold text-blue-700' 
                                  : 'border-slate-200 bg-white hover:border-slate-400 text-slate-600'
                              }`}
                            >
                              <span className="text-lg font-black leading-none">{curr.symbol}</span>
                              <span className="text-[9px] uppercase tracking-wider">{curr.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Trade Terms (Incoterms) selector */}
                    <div>
                      <span className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        🌐 3. 国际贸易条款 (Trade Terms / Incoterms):
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'FOB', name: '离岸 FOB', desc: 'Free On Board' },
                          { id: 'EXW', name: '出厂 EXW', desc: 'Ex Works' },
                          { id: 'CIF', name: '到岸 CIF', desc: 'Cost Insurance Freight' },
                          { id: 'CFR', name: '运费 CFR', desc: 'Cost & Freight' },
                          { id: 'DDP', name: '完税 DDP', desc: 'Delivered Duty Paid' },
                          { id: 'DAP', name: '交货 DAP', desc: 'Delivered At Place' },
                          { id: 'FCA', name: '承运 FCA', desc: 'Free Carrier' },
                          { id: 'CPT', name: '运至 CPT', desc: 'Carriage Paid To' }
                        ].map(term => {
                          const isSelected = tradeTerm === term.id;
                          return (
                            <button
                              key={term.id}
                              onClick={() => setTradeTerm(term.id)}
                              title={term.desc}
                              className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-0.5 ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500 font-bold text-blue-700' 
                                  : 'border-slate-200 bg-white hover:border-slate-400 text-slate-600'
                              }`}
                            >
                              <span className="text-xs font-black leading-none">{term.id}</span>
                              <span className="text-[8.5px] tracking-tight">{term.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8fafc] border border-[#e1e4e8] rounded-xl p-4 space-y-3.5 shadow-sm">
                  <h3 className="text-xs font-black text-slate-800 border-b border-[#e1e4e8] pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <FileText className="h-4 w-4 text-slate-600" />
                    PI 单据基础元数据
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PI 账单编号 (Reference No.)</label>
                      <input
                        type="text"
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                        className="w-full text-xs bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">询盘日期 (Enquiry Date)</label>
                        <input
                          type="text"
                          value={enquiryDate}
                          onChange={(e) => setEnquiryDate(e.target.value)}
                          className="w-full text-xs bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">报价日期 (Quotation Date)</label>
                        <input
                          type="text"
                          value={quotationDate}
                          onChange={(e) => setQuotationDate(e.target.value)}
                          className="w-full text-xs bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buyer & Seller Info */}
                <div className="bg-[#f8fafc] border border-[#e1e4e8] rounded-xl p-4 space-y-3.5 shadow-sm">
                  <h3 className="text-xs font-black text-slate-800 border-b border-[#e1e4e8] pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <User className="h-4 w-4 text-slate-600" />
                    买卖双方信息 (Buyer & Seller)
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">买家公司名称 (Buyer Name)</label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">买家收件地址 (Buyer Address)</label>
                      <input
                        type="text"
                        value={buyerAddress}
                        onChange={(e) => setBuyerAddress(e.target.value)}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">卖家公司名称 (Seller Name)</label>
                      <input
                        type="text"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">卖家注册地址 (Seller Address)</label>
                      <textarea
                        value={sellerAddress}
                        onChange={(e) => setSellerAddress(e.target.value)}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 h-16 resize-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional packing, deposit ratios and remarks */}
                <div className="bg-[#f8fafc] border border-[#e1e4e8] rounded-xl p-4 space-y-3.5 shadow-sm">
                  <h3 className="text-xs font-black text-slate-800 border-b border-[#e1e4e8] pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <Settings className="h-4 w-4 text-slate-600" />
                    物流包装、订金比例与条款
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">包装描述 (Packing)</label>
                      <input
                        type="text"
                        value={packing}
                        onChange={(e) => setPacking(e.target.value)}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">总立方数 (Total CBM)</label>
                        <input
                          type="text"
                          value={totalCbm}
                          disabled={autoCalculateMeta}
                          onChange={(e) => setTotalCbm(e.target.value)}
                          className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 disabled:opacity-50 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">货品总重 (Total Weight)</label>
                        <input
                          type="text"
                          value={totalWeight}
                          disabled={autoCalculateMeta}
                          onChange={(e) => setTotalWeight(e.target.value)}
                          className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 disabled:opacity-50 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">预付订金比例 (Deposit %)</label>
                        <input
                          type="number"
                          value={depositPercent}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            setDepositPercent(val);
                            setBalancePercent(100 - val);
                          }}
                          className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">发货前尾款比例 (Balance %)</label>
                        <input
                          type="number"
                          value={balancePercent}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            setBalancePercent(val);
                            setDepositPercent(100 - val);
                          }}
                          className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">备注条款一</label>
                      <input
                        type="text"
                        value={remarks[0]}
                        onChange={(e) => setRemarks([e.target.value, remarks[1]])}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">备注条款二</label>
                      <input
                        type="text"
                        value={remarks[1]}
                        onChange={(e) => setRemarks([remarks[0], e.target.value])}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. BANK INFORMATION */}
            {activeTab === 'bank' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-[#f8fafc] border border-[#e1e4e8] rounded-xl p-4 space-y-3.5 shadow-sm">
                  <h3 className="text-xs font-black text-slate-800 border-b border-[#e1e4e8] pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <CreditCard className="h-4 w-4 text-slate-600" />
                    出口结汇账户 (Bank Swift Routes)
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">收款银行名称 (BENEFICIARY BANK)</label>
                      <input
                        type="text"
                        value={bankInfo.beneficiaryBank}
                        onChange={(e) => setBankInfo({ ...bankInfo, beneficiaryBank: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">银行营业地址 (BANK ADDRESS)</label>
                      <input
                        type="text"
                        value={bankInfo.beneficiaryBankAddress}
                        onChange={(e) => setBankInfo({ ...bankInfo, beneficiaryBankAddress: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">银行 SWIFT 联行号</label>
                      <input
                        type="text"
                        value={bankInfo.swiftCode}
                        onChange={(e) => setBankInfo({ ...bankInfo, swiftCode: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">结汇收款账号 (ACCOUNT NUMBER)</label>
                      <input
                        type="text"
                        value={bankInfo.accountNumber}
                        onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">受益人/收款企业名称 (BENEFICIARY NAME)</label>
                      <input
                        type="text"
                        value={bankInfo.sellerCompany}
                        onChange={(e) => setBankInfo({ ...bankInfo, sellerCompany: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">受益企业注册地址 (BENEFICIARY ADDRESS)</label>
                      <textarea
                        value={bankInfo.sellerAddress}
                        onChange={(e) => setBankInfo({ ...bankInfo, sellerAddress: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 h-16 resize-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. CRM CUSTOMER & TERMS TEMPLATE MANAGEMENT */}
            {activeTab === 'crm' && (
              <div className="space-y-4 animate-fadeIn text-xs text-slate-700 font-medium">
                {/* Customer Section */}
                <div className="bg-[#f8fafc] border border-[#e1e4e8] rounded-xl p-4 space-y-3.5 shadow-sm">
                  <h3 className="text-xs font-black text-slate-800 border-b border-[#e1e4e8] pb-2 flex items-center justify-between uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-slate-600" />
                      客户库管理 (Customer Directory)
                    </span>
                  </h3>
                  
                  {/* Select Customer */}
                  <div className="space-y-2">
                    <label className="block text-slate-600 font-bold">快速选择客户应用到买方抬头：</label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {crmCustomers.map(cust => (
                        <div key={cust.id} className="p-2.5 rounded-lg bg-white border border-[#e1e4e8] hover:border-slate-400 flex justify-between items-center gap-2 transition-all">
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-slate-900 block truncate">{cust.companyName}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{cust.address}</span>
                          </div>
                          <button
                            onClick={() => {
                              setBuyerName(cust.companyName);
                              setBuyerAddress(cust.address);
                            }}
                            className="px-2 py-1 text-[10px] font-black bg-[#1a1a1a] hover:bg-[#2c2c2c] text-white rounded transition-colors shrink-0 cursor-pointer"
                          >
                            应用抬头
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Customer Form */}
                  <div className="border-t border-[#e1e4e8] pt-3.5 space-y-2.5">
                    <span className="font-bold text-slate-800 block">➕ 录入新客户资料</span>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="客户公司名称 (Buyer Company Name)"
                        value={newCustomer.companyName}
                        onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-medium"
                      />
                      <input
                        type="text"
                        placeholder="客户收货地址 (Delivery Address)"
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="联系人 (Contact Person)"
                          value={newCustomer.contactPerson || ''}
                          onChange={(e) => setNewCustomer({ ...newCustomer, contactPerson: e.target.value })}
                          className="bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                        />
                        <input
                          type="email"
                          placeholder="邮箱 (Email)"
                          value={newCustomer.email || ''}
                          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                          className="bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!newCustomer.companyName || !newCustomer.address) {
                            alert('请输入完整的客户公司名称及送货地址');
                            return;
                          }
                          const cust: CrmCustomer = {
                            id: `cust_${Date.now()}`,
                            companyName: newCustomer.companyName,
                            address: newCustomer.address,
                            contactPerson: newCustomer.contactPerson,
                            email: newCustomer.email
                          };
                          setCrmCustomers([...crmCustomers, cust]);
                          setNewCustomer({ companyName: '', address: '', contactPerson: '', email: '' });
                        }}
                        className="w-full py-2 bg-[#1a1a1a] hover:bg-[#2c2c2c] text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        添加至客户库
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seller & Bank Terms Template Section */}
                <div className="bg-[#f8fafc] border border-[#e1e4e8] rounded-xl p-4 space-y-3.5 shadow-sm">
                  <h3 className="text-xs font-black text-slate-800 border-b border-[#e1e4e8] pb-2 flex items-center justify-between uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-slate-600" />
                      出口预设模板 (Company Presets)
                    </span>
                  </h3>

                  {/* Select Preset */}
                  <div className="space-y-2">
                    <label className="block text-slate-600 font-bold">快速套用公司条款及结汇账户：</label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {crmProfiles.map(prof => (
                        <div key={prof.id} className="p-2.5 rounded-lg bg-white border border-[#e1e4e8] hover:border-slate-400 flex justify-between items-center gap-2 transition-all">
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-slate-900 block truncate">{prof.profileName}</span>
                            <span className="text-[10px] text-slate-500 block truncate font-mono">{prof.beneficiaryBank} • SWIFT: {prof.swiftCode}</span>
                          </div>
                          <button
                            onClick={() => {
                              setSellerName(prof.sellerName);
                              setSellerAddress(prof.sellerAddress);
                              setBankInfo({
                                beneficiaryBank: prof.beneficiaryBank,
                                beneficiaryBankAddress: prof.beneficiaryBankAddress,
                                swiftCode: prof.swiftCode,
                                accountNumber: prof.accountNumber,
                                sellerCompany: prof.sellerName,
                                sellerAddress: prof.sellerAddress
                              });
                              setPacking(prof.packing);
                              setDepositPercent(prof.depositPercent);
                              setBalancePercent(prof.balancePercent);
                              setRemarks(prof.remarks);
                            }}
                            className="px-2 py-1 text-[10px] font-black bg-slate-100 hover:bg-slate-250 text-slate-800 border border-slate-300 rounded transition-colors shrink-0 cursor-pointer"
                          >
                            套用配置
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Preset Form */}
                  <div className="border-t border-[#e1e4e8] pt-3.5 space-y-2.5">
                    <span className="font-bold text-slate-800 block">➕ 新建我方出口模板</span>
                    <div className="space-y-2 text-xs">
                      <input
                        type="text"
                        placeholder="出口方模板名称 (如: 哈曼备用USD账户)"
                        value={newProfile.profileName}
                        onChange={(e) => setNewProfile({ ...newProfile, profileName: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-medium"
                      />
                      <input
                        type="text"
                        placeholder="收款银行名称 (BENEFICIARY BANK)"
                        value={newProfile.beneficiaryBank}
                        onChange={(e) => setNewProfile({ ...newProfile, beneficiaryBank: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-950 font-medium"
                      />
                      <input
                        type="text"
                        placeholder="银行 SWIFT 联行号"
                        value={newProfile.swiftCode}
                        onChange={(e) => setNewProfile({ ...newProfile, swiftCode: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                      />
                      <input
                        type="text"
                        placeholder="结汇收款账号 (ACCOUNT NUMBER)"
                        value={newProfile.accountNumber}
                        onChange={(e) => setNewProfile({ ...newProfile, accountNumber: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                      />
                      <input
                        type="text"
                        placeholder="物流包装条款 (Packing)"
                        value={newProfile.packing}
                        onChange={(e) => setNewProfile({ ...newProfile, packing: e.target.value })}
                        className="w-full bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="预付订金%"
                          value={newProfile.depositPercent}
                          onChange={(e) => setNewProfile({ ...newProfile, depositPercent: parseInt(e.target.value) || 0, balancePercent: 100 - (parseInt(e.target.value) || 0) })}
                          className="bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                        />
                        <input
                          type="number"
                          placeholder="尾款比例%"
                          value={newProfile.balancePercent}
                          onChange={(e) => setNewProfile({ ...newProfile, balancePercent: parseInt(e.target.value) || 0, depositPercent: 100 - (parseInt(e.target.value) || 0) })}
                          className="bg-white border border-[#e1e4e8] rounded px-2.5 py-1.5 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] focus:outline-none text-slate-900 font-medium"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!newProfile.profileName || !newProfile.beneficiaryBank || !newProfile.accountNumber) {
                            alert('请输入模板名称、银行名称及账号');
                            return;
                          }
                          const prof: CrmProfile = {
                            id: `prof_${Date.now()}`,
                            profileName: newProfile.profileName,
                            sellerName: newProfile.sellerName,
                            sellerAddress: newProfile.sellerAddress,
                            beneficiaryBank: newProfile.beneficiaryBank,
                            beneficiaryBankAddress: newProfile.beneficiaryBankAddress || 'Liaocheng Shandong China',
                            swiftCode: newProfile.swiftCode,
                            accountNumber: newProfile.accountNumber,
                            packing: newProfile.packing,
                            depositPercent: newProfile.depositPercent,
                            balancePercent: newProfile.balancePercent,
                            remarks: newProfile.remarks
                          };
                          setCrmProfiles([...crmProfiles, prof]);
                          setNewProfile({
                            profileName: '',
                            sellerName: 'Shandong Haman Metal Products CO.,Ltd',
                            sellerAddress: 'No. 01 Workshop, West Side, North of Ganjiang Road, Jiuzhou Subdistrict, High-tech Zone, Liaocheng City, Shandong Province, P.R.China',
                            beneficiaryBank: '',
                            beneficiaryBankAddress: '',
                            swiftCode: '',
                            accountNumber: '',
                            packing: 'Standard seaworthy package: wooden pallet.',
                            depositPercent: 30,
                            balancePercent: 70,
                            remarks: ['The price is valid for 10 days.', 'The production lead time is 45 days.']
                          });
                        }}
                        className="w-full py-2 bg-[#1a1a1a] hover:bg-[#2c2c2c] text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        添加至我方预设模板
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: Proforma Invoice Document Live Preview (Scrollable Screen) */}
        <main className="flex-1 overflow-auto bg-[#f4f6f8] p-6 relative select-text" id="preview-viewport-main">
          
          {/* Centering wrapper that allows full scrollability without covering content on smaller viewports */}
          <div className="min-w-[1000px] mx-auto flex flex-col items-center justify-start gap-4">
            
            {/* Quick interactive checklist strip above the canvas sheet */}
            <div className="w-[1000px] bg-white border border-[#e1e4e8] p-3.5 rounded-xl shadow-sm shrink-0">
              <div className="flex items-center gap-2 mb-2 text-xs font-black text-slate-800 uppercase tracking-wide">
                <Database className="h-4 w-4 text-[#1a1a1a]" />
                <span>📋 快速勾选/排除产品库的商品（实时对齐并生成 PI 账单）：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {productsDb.map((p, idx) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleToggleProductSelection(p.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-sm font-bold' 
                          : 'bg-white border-[#e1e4e8] text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <span className="truncate max-w-[120px]">{p.pic_name}</span>
                      <span className="text-[10px] font-extrabold text-emerald-700">${p.fob_usd}</span>
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-white" />
                      ) : (
                        <span className="h-3 w-3 rounded-full border border-slate-300 shrink-0"></span>
                      )}
                    </button>
                  );
                })}
                {productsDb.length === 0 && (
                  <span className="text-xs text-slate-500 italic">暂无产品，请点击左侧添加或使用 AI 录入</span>
                )}
              </div>
            </div>

            <div className="w-[1000px] text-[11px] text-slate-600 text-left flex items-center gap-1 pointer-events-none font-medium">
              <Info className="h-3.5 w-3.5 text-[#1a1a1a]" />
              <span>下方黄色高亮格支持直接在发票页面内<strong>双击/点击实时修改文字</strong>，会自动对齐和保存</span>
            </div>

          {/* Paper Canvas Sheet */}
          <div 
            ref={previewRef}
            className="w-[1000px] bg-white text-black p-8 shadow-2xl relative border border-slate-300 font-sans leading-normal shrink-0" 
            id="pi-print-area"
            style={{ minHeight: '1414px' }} /* Standard A4 ratio visual guide */
          >
            {/* Elegant Header with Document title right */}
            <div className="flex justify-between items-start border-b-2 border-black pb-5 mb-5">
              <div className="space-y-2">
                <div className="text-[11px] text-slate-600 font-sans leading-relaxed mt-1 max-w-[450px]">
                  <p className="font-bold text-black text-xs">{sellerName}</p>
                  <p>{sellerAddress}</p>
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <h2 className="text-3xl font-black tracking-wider text-slate-900 uppercase">
                  {documentType === 'PI' 
                    ? (language === 'zh' ? '形式发票 PROFORMA INVOICE' : 'PROFORMA INVOICE') 
                    : (language === 'zh' ? '商业发票 COMMERCIAL INVOICE' : 'COMMERCIAL INVOICE')}
                </h2>
                <div className="pt-2 text-xs text-slate-800 space-y-1">
                  <div className="flex justify-end gap-1 font-bold">
                    <span>{documentType === 'PI' ? 'PI REFERENCE NO:' : 'CI REFERENCE NO:'}</span>
                    {isExporting ? (
                      <span className="font-mono font-black text-xs text-black">{referenceNo}</span>
                    ) : (
                      <input
                        type="text"
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                        className="w-28 text-right bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded transition-all font-mono font-black"
                        id="preview-ref-no-input"
                      />
                    )}
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <span className="text-slate-500">Quotation Date:</span>
                    {isExporting ? (
                      <span className="font-bold text-xs text-black">{quotationDate}</span>
                    ) : (
                      <input
                        type="text"
                        value={quotationDate}
                        onChange={(e) => setQuotationDate(e.target.value)}
                        className="w-24 text-right bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded transition-all font-bold"
                      />
                    )}
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <span className="text-slate-500">Enquiry Date:</span>
                    {isExporting ? (
                      <span className="font-bold text-xs text-black">{enquiryDate}</span>
                    ) : (
                      <input
                        type="text"
                        value={enquiryDate}
                        onChange={(e) => setEnquiryDate(e.target.value)}
                        className="w-24 text-right bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded transition-all font-bold"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer Company Block */}
            <div className="border border-black p-3.5 rounded-lg mb-4 text-xs bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-wider mb-1.5 text-[11.5px] border-b border-slate-200 pb-1">
                {language === 'zh' ? '买方详细信息 Buyer Details (收货人):' : 'Buyer Details (Consignee):'}
              </h3>
              <div className="grid grid-cols-5 gap-2 leading-relaxed">
                <div className="col-span-1 font-bold text-slate-500">Company Name:</div>
                <div className="col-span-4">
                  {isExporting ? (
                    <span className="font-black text-xs text-black">{buyerName}</span>
                  ) : (
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded font-black text-xs"
                      id="preview-buyer-name-input"
                    />
                  )}
                </div>

                <div className="col-span-1 font-bold text-slate-500">Delivery Address:</div>
                <div className="col-span-4">
                  {isExporting ? (
                    <span className="text-xs text-black whitespace-pre-wrap">{buyerAddress}</span>
                  ) : (
                    <input
                      type="text"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded text-xs"
                      id="preview-buyer-address-input"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* CI Special Headers: Shipping Marks, Port of Loading, Port of Destination */}
            {documentType === 'CI' && (
              <div className="border border-black p-3 rounded-lg mb-4 text-xs bg-slate-50/50 grid grid-cols-3 gap-4">
                <div>
                  <span className="block font-bold text-slate-500 uppercase text-[9px] tracking-wider mb-1">
                    {language === 'zh' ? '运输唛头 Shipping Marks:' : 'Shipping Marks:'}
                  </span>
                  {isExporting ? (
                    <span className="font-bold text-[11px] text-black">{shippingMarks}</span>
                  ) : (
                    <input
                      type="text"
                      value={shippingMarks}
                      onChange={(e) => setShippingMarks(e.target.value)}
                      className="w-full bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded font-bold text-[11px]"
                    />
                  )}
                </div>
                <div>
                  <span className="block font-bold text-slate-500 uppercase text-[9px] tracking-wider mb-1">
                    {language === 'zh' ? '启运港 Port of Loading:' : 'Port of Loading:'}
                  </span>
                  {isExporting ? (
                    <span className="font-bold text-[11px] text-black">{portOfLoading}</span>
                  ) : (
                    <input
                      type="text"
                      value={portOfLoading}
                      onChange={(e) => setPortOfLoading(e.target.value)}
                      className="w-full bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded font-bold text-[11px]"
                    />
                  )}
                </div>
                <div>
                  <span className="block font-bold text-slate-500 uppercase text-[9px] tracking-wider mb-1">
                    {language === 'zh' ? '目的港 Port of Destination:' : 'Port of Destination:'}
                  </span>
                  {isExporting ? (
                    <span className="font-bold text-[11px] text-black">{portOfDestination}</span>
                  ) : (
                    <input
                      type="text"
                      value={portOfDestination}
                      onChange={(e) => setPortOfDestination(e.target.value)}
                      className="w-full bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded font-bold text-[11px]"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Products Spreadsheet Table - PARAMETERS AUTO ALIGN */}
            <div className="overflow-x-auto">
              <table 
                className="w-full table-fixed border-collapse border border-black text-[11px] font-sans"
                style={{ tableLayout: 'fixed', width: '100%', wordBreak: 'break-word' }}
              >
                <thead>
                  <tr className="bg-slate-100 text-center font-bold text-black border-b border-black">
                    <th style={{ width: '4%' }} className="p-1.5 border-r border-black">{language === 'zh' ? '唛头 N/M' : 'N/M'}</th>
                    <th style={{ width: '12%' }} className="p-1.5 border-r border-black col-item-photo">{language === 'zh' ? '产品实物图 Item Photo' : 'Item Photo'}</th>
                    <th style={{ width: '12%' }} className="p-1.5 border-r border-black col-pic-show">{language === 'zh' ? '产品品名 Pic show' : 'Pic show'}</th>
                    <th style={{ width: '18%' }} className="p-1.5 border-r border-black">{language === 'zh' ? '材质尺寸 Size(mm)' : 'Size(mm)'}</th>
                    <th style={{ width: '10%' }} className="p-1.5 border-r border-black">{language === 'zh' ? '外箱尺寸 Package size' : 'Package size'}</th>
                    <th style={{ width: '10%' }} className="p-1.5 border-r border-black">{language === 'zh' ? '净重/毛重 N.W/G.W' : 'N.W/G.W'}</th>
                    <th style={{ width: '8%' }} className="p-1.5 border-r border-black">{language === 'zh' ? '海关编码 HS code' : 'HS code'}</th>
                    <th style={{ width: '6%' }} className="p-1.5 border-r border-black">{language === 'zh' ? '数量 Qty' : 'Qty'}</th>
                    <th style={{ width: '10%' }} className="p-1.5 border-r border-black">{language === 'zh' ? `单价 ${tradeTerm} ${currency}` : `${tradeTerm} ${currency}`}</th>
                    <th style={{ width: '10%' }} className="p-1.5">{language === 'zh' ? '合计 Total' : 'Total'}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProducts.map((p, index) => (
                    <tr key={p.id} className="border-b border-black align-middle hover:bg-slate-50/50 transition-colors">
                      {/* Index aligned contiguously */}
                      <td style={{ width: '4%' }} className="text-center p-1.5 font-bold border-r border-black text-slate-800">
                        {index + 1}
                      </td>

                      {/* 实物图渲染列 */}
                      <td style={{ width: '12%' }} className="p-1.5 border-r border-black text-center align-middle bg-white col-item-photo">
                        <div className="flex flex-col items-center justify-center gap-1 select-none pointer-events-none text-slate-400">
                          <ImageIcon className="h-5 w-5 text-slate-300" />
                          <span className="text-[9px] font-bold tracking-wider uppercase">Item Photo</span>
                        </div>
                      </td>

                      {/* Pic show (Title) */}
                      <td style={{ width: '12%' }} className="p-1.5 border-r border-black font-semibold text-center leading-tight col-pic-show">
                        {isExporting ? (
                          <span className="font-bold text-xs text-black">{p.pic_name}</span>
                        ) : (
                          <input
                            type="text"
                            value={p.pic_name}
                            onChange={(e) => handleProductCellChange(p.id, 'pic_name', e.target.value)}
                            className="w-full text-center bg-yellow-50/60 hover:bg-yellow-100 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded py-0.5 font-bold text-xs"
                          />
                        )}
                      </td>

                      {/* Size Specifications - aligned and aligned perfectly */}
                      <td style={{ width: '18%' }} className="p-2 border-r border-black text-left whitespace-pre-wrap leading-normal text-slate-800 font-sans">
                        {isExporting ? (
                          <div className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-slate-800">{p.size_mm}</div>
                        ) : (
                          <textarea
                            value={p.size_mm}
                            onChange={(e) => handleProductCellChange(p.id, 'size_mm', e.target.value)}
                            className="w-full bg-yellow-50/60 hover:bg-yellow-100 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 rounded py-0.5 min-h-[50px] font-mono text-[10px] leading-relaxed"
                            style={{ height: 'auto', minHeight: '65px' }}
                          />
                        )}
                      </td>

                      {/* Package size */}
                      <td style={{ width: '10%' }} className="p-1.5 border-r border-black text-center font-mono text-[10px]">
                        {isExporting ? (
                          <span className="font-mono text-[10px] text-black">{p.package_size}</span>
                        ) : (
                          <input
                            type="text"
                            value={p.package_size}
                            onChange={(e) => handleProductCellChange(p.id, 'package_size', e.target.value)}
                            className="w-full text-center bg-yellow-50/60 hover:bg-yellow-100 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded py-0.5"
                          />
                        )}
                      </td>

                      {/* Stacked N.W and G.W Column to completely prevent layout squeeze */}
                      <td style={{ width: '10%' }} className="p-1.5 border-r border-black text-center font-semibold">
                        <div className="flex flex-col gap-1 items-center justify-center">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-slate-400">N:</span>
                            {isExporting ? (
                              <span className="font-mono text-[10px] text-black">{p.nw}</span>
                            ) : (
                              <input
                                type="text"
                                value={p.nw}
                                onChange={(e) => handleProductCellChange(p.id, 'nw', e.target.value)}
                                className="w-12 text-center bg-yellow-50/60 hover:bg-yellow-100 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded py-0.5 text-[10px]"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-slate-400">G:</span>
                            {isExporting ? (
                              <span className="font-mono text-[10px] text-black">{p.gw}</span>
                            ) : (
                              <input
                                type="text"
                                value={p.gw}
                                onChange={(e) => handleProductCellChange(p.id, 'gw', e.target.value)}
                                className="w-12 text-center bg-yellow-50/60 hover:bg-yellow-100 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded py-0.5 text-[10px]"
                              />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* HS Code - Country Compliant (Requirement 3) */}
                      <td style={{ width: '8%' }} className="p-1.5 border-r border-black text-center font-mono">
                        {isExporting ? (
                          <span className="font-mono text-[10px] text-black">{getCountryHsCode(p.hs_code, destinationCountry)}</span>
                        ) : (
                          <input
                            type="text"
                            value={getCountryHsCode(p.hs_code, destinationCountry)}
                            onChange={(e) => handleProductCellChange(p.id, 'hs_code', e.target.value)}
                            className="w-full text-center bg-yellow-50/60 hover:bg-yellow-100 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded py-0.5 text-[10px]"
                          />
                        )}
                      </td>

                      {/* Qty & Unit Selection (Requirement 4) */}
                      <td style={{ width: '6%' }} className="p-1.5 border-r border-black text-center font-bold">
                        {isExporting ? (
                          <span className="font-bold text-xs text-black">{p.qty} {p.unit || 'set'}</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <input
                              type="number"
                              value={p.qty}
                              onChange={(e) => handleProductCellChange(p.id, 'qty', Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full text-center bg-yellow-50/60 hover:bg-yellow-100 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded py-0.5 font-bold"
                            />
                            <select
                              value={p.unit || 'set'}
                              onChange={(e) => handleProductCellChange(p.id, 'unit', e.target.value)}
                              className="text-[9px] font-medium bg-slate-100 hover:bg-slate-200 border-0 focus:ring-1 focus:ring-blue-400 text-slate-700 rounded px-1 py-0.5 outline-none text-center cursor-pointer w-full"
                            >
                              <option value="set">set</option>
                              <option value="pcs">pcs</option>
                              <option value="ctn">ctn</option>
                              <option value="kg">kg</option>
                            </select>
                          </div>
                        )}
                      </td>

                      {/* FOB [Currency] (Requirement 4) */}
                      <td style={{ width: '10%' }} className="p-1.5 border-r border-black text-center font-bold text-amber-700">
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="text-slate-500 font-bold">{currencySymbols[currency]}</span>
                          {isExporting ? (
                            <span className="font-bold text-black">{p.fob_usd.toFixed(2)}</span>
                          ) : (
                            <input
                              type="number"
                              step="0.01"
                              value={p.fob_usd}
                              onChange={(e) => handleProductCellChange(p.id, 'fob_usd', Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-12 text-center bg-yellow-50/60 hover:bg-yellow-100 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-0.5 rounded py-0.5 font-bold"
                            />
                          )}
                        </div>
                      </td>

                      {/* Row Total */}
                      <td style={{ width: '10%' }} className="p-1.5 text-center font-black text-slate-900">
                        {formatCurrency(p.qty * p.fob_usd)}
                      </td>
                    </tr>
                  ))}

                  {activeProducts.length === 0 && (
                    <tr>
                      <td colSpan={isExporting ? 9 : 10} className="text-center p-12 text-slate-400 italic bg-slate-50 no-products-cell">
                        {language === 'zh' 
                          ? '目前未勾选任何产品。请在上方或左侧列表中勾选需要加入发票的产品，相关规格、重量及金额将自动刷新。' 
                          : 'No products currently selected. Please select products from the left to include them in this invoice.'}
                      </td>
                    </tr>
                  )}

                  {/* Grand Total Row (10 column safe) */}
                  <tr className="border-t border-b-2 border-black font-extrabold bg-slate-100">
                    <td colSpan={isExporting ? 6 : 7} className="border-r border-black grand-total-spacer"></td>
                    <td colSpan={2} className="text-right p-2.5 uppercase text-xs tracking-wide border-r border-black pr-3">
                      {language === 'zh' 
                        ? `${tradeTermLabels[tradeTerm]?.zh || `合计 TOTAL ${tradeTerm}`} ${currency}:` 
                        : `${tradeTermLabels[tradeTerm]?.en || `TOTAL ${tradeTerm}`} ${currency}:`}
                    </td>
                    <td className="text-center p-2.5 bg-yellow-50 text-xs font-black text-slate-950 font-mono">
                      {formatCurrency(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer terms block (Packing / Total Weight / Payment) */}
            <div className="grid grid-cols-5 border-l border-r border-b border-black text-xs mt-1">
              
              {/* Packing Block */}
              <div className="col-span-5 flex border-b border-black bg-white">
                <div className="w-28 font-bold bg-slate-100 p-2 border-r border-black shrink-0 flex items-center">{language === 'zh' ? '包装条款 Packing' : 'Packing'}</div>
                <div className="flex-1 p-2 flex items-center bg-white text-black">
                  {isExporting ? (
                    <span className="text-xs text-black">{packing}</span>
                  ) : (
                    <input
                      type="text"
                      value={packing}
                      onChange={(e) => setPacking(e.target.value)}
                      className="w-full bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 rounded py-0.5 font-sans"
                    />
                  )}
                </div>
              </div>

              {/* Details & Total CBM Block */}
              <div className="col-span-4 border-r border-black flex flex-col justify-between min-h-[95px] bg-white">
                <div className="flex border-b border-black flex-1 bg-white text-black">
                  <div className="w-28 font-bold bg-slate-100 p-2 border-r border-black shrink-0 flex items-center">{language === 'zh' ? '货运参数 Shipping' : 'Shipping Meta'}</div>
                  <div className="flex-1 p-2 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 font-bold shrink-0">{language === 'zh' ? '总箱体体积 CBM:' : 'Total volume CBM:'}</span>
                      {isExporting ? (
                        <span className="font-mono font-bold text-xs text-black">{totalCbm}</span>
                      ) : (
                        <input
                          type="text"
                          value={totalCbm}
                          onChange={(e) => setTotalCbm(e.target.value)}
                          className="bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded font-mono font-bold w-48"
                        />
                      )}
                      {autoCalculateMeta && !isExporting && (
                        <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                          {language === 'zh' ? 'AI 智能对齐计算' : 'AI Sync Active'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 font-bold shrink-0">{language === 'zh' ? '总净重/总毛重:' : 'Total gross/net weight:'}</span>
                      {isExporting ? (
                        <span className="font-mono font-bold text-xs text-black">{totalWeight}</span>
                      ) : (
                        <input
                          type="text"
                          value={totalWeight}
                          onChange={(e) => setTotalWeight(e.target.value)}
                          className="bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded font-mono font-bold w-80"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Remarks Row */}
                <div className="flex flex-1 items-stretch bg-white text-black">
                  <div className="w-28 font-bold bg-slate-100 p-2 border-r border-black shrink-0 flex items-center">{language === 'zh' ? '备注条款 Remarks' : 'Remarks'}</div>
                  <div className="flex-1 p-2 text-[11px] space-y-1 bg-white">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-800 shrink-0">1、</span>
                      {isExporting ? (
                        <span className="text-xs text-black">{remarks[0]}</span>
                      ) : (
                        <input
                          type="text"
                          value={remarks[0]}
                          onChange={(e) => setRemarks([e.target.value, remarks[1]])}
                          className="w-full bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-800 shrink-0">2、</span>
                      {isExporting ? (
                        <span className="text-xs text-black">{remarks[1]}</span>
                      ) : (
                        <input
                          type="text"
                          value={remarks[1]}
                          onChange={(e) => setRemarks([remarks[0], e.target.value])}
                          className="w-full bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 rounded"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Split Section or CI Info */}
              {documentType === 'PI' ? (
                <div className="col-span-1 flex flex-col items-center justify-center p-3 text-center min-h-[95px] bg-slate-50/50">
                  <span className="font-bold uppercase text-[9px] tracking-wider text-slate-500 block mb-2 leading-none">Payment Terms</span>
                  <div className="space-y-2 text-[11px]">
                    <p className="leading-tight font-medium text-slate-800">
                      <span className="text-blue-600 font-extrabold text-xs">{depositPercent}%</span> deposit:
                      <strong className="block text-[11.5px] font-black text-slate-950 mt-0.5">{formatCurrency(depositAmount)}</strong>
                    </p>
                    <p className="font-bold text-slate-400 text-[10px] leading-none">+</p>
                    <p className="leading-tight font-medium text-slate-800">
                      <span className="text-blue-600 font-extrabold text-xs">{balancePercent}%</span> balance:
                      <strong className="block text-[11.5px] font-black text-slate-950 mt-0.5">{formatCurrency(balanceAmount)}</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="col-span-1 flex flex-col items-center justify-center p-3 text-center min-h-[95px] bg-slate-50/50">
                  <span className="font-bold uppercase text-[9px] tracking-wider text-amber-700 block mb-2 leading-none">Shipping Mark</span>
                  <div className="text-[11px] font-black text-slate-900 break-words w-full uppercase">
                    {shippingMarks}
                  </div>
                </div>
              )}
            </div>

            {/* Conditional Bank Accounts (PI) vs Cargo Summary (CI) */}
            {documentType === 'PI' ? (
              <div className="border border-black p-4 mt-2 text-xs bg-white">
                <h3 className="font-black text-slate-950 underline uppercase tracking-wider text-[11.5px] mb-2.5 flex items-center gap-1.5">
                  <span>BANKING PATHWAYS FOR SETTLEMENT (银行收款路径):</span>
                </h3>
                
                <div className="space-y-1.5 font-mono text-[11px] text-slate-900 leading-normal">
                  <div className="flex">
                    <span className="font-bold w-52 shrink-0">BENEFICIARY BANK:</span>
                    {isExporting ? (
                      <span className="font-mono font-bold text-xs text-black">{bankInfo.beneficiaryBank}</span>
                    ) : (
                      <input
                        type="text"
                        value={bankInfo.beneficiaryBank}
                        onChange={(e) => setBankInfo({ ...bankInfo, beneficiaryBank: e.target.value })}
                        className="flex-1 bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 rounded font-black text-slate-950"
                      />
                    )}
                  </div>

                  <div className="flex">
                    <span className="font-bold w-52 shrink-0">BENEFICIARY BANK ADDRESS:</span>
                    {isExporting ? (
                      <span className="font-mono text-xs text-black">{bankInfo.beneficiaryBankAddress}</span>
                    ) : (
                      <input
                        type="text"
                        value={bankInfo.beneficiaryBankAddress}
                        onChange={(e) => setBankInfo({ ...bankInfo, beneficiaryBankAddress: e.target.value })}
                        className="flex-1 bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 rounded"
                      />
                    )}
                  </div>

                  <div className="flex">
                    <span className="font-bold w-52 shrink-0">SWIFT CODE (SWIFT):</span>
                    {isExporting ? (
                      <span className="font-mono font-bold text-xs text-black">{bankInfo.swiftCode}</span>
                    ) : (
                      <input
                        type="text"
                        value={bankInfo.swiftCode}
                        onChange={(e) => setBankInfo({ ...bankInfo, swiftCode: e.target.value })}
                        className="flex-1 bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 rounded font-black text-slate-950"
                      />
                    )}
                  </div>

                  <div className="flex">
                    <span className="font-bold w-52 shrink-0">ACCOUNT NUMBER:</span>
                    {isExporting ? (
                      <span className="font-mono font-bold text-xs text-black">{bankInfo.accountNumber}</span>
                    ) : (
                      <input
                        type="text"
                        value={bankInfo.accountNumber}
                        onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                        className="flex-1 bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 rounded font-black text-slate-950"
                      />
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="border-t border-dashed border-slate-300 pt-2.5 mt-2.5 font-sans flex">
                    <span className="font-bold w-52 shrink-0 text-slate-500">BENEFICIARY NAME:</span>
                    {isExporting ? (
                      <span className="font-bold text-xs text-black uppercase">{bankInfo.sellerCompany}</span>
                    ) : (
                      <input
                        type="text"
                        value={bankInfo.sellerCompany}
                        onChange={(e) => setBankInfo({ ...bankInfo, sellerCompany: e.target.value })}
                        className="flex-1 bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 rounded font-black text-slate-950 uppercase"
                      />
                    )}
                  </div>

                  {/* Company Address */}
                  <div className="font-sans text-[10.5px] text-slate-600 flex leading-normal">
                    <span className="font-bold w-52 shrink-0 text-slate-500">BENEFICIARY ADDRESS:</span>
                    {isExporting ? (
                      <span className="text-xs text-slate-600 leading-normal whitespace-pre-wrap">{bankInfo.sellerAddress}</span>
                    ) : (
                      <textarea
                        value={bankInfo.sellerAddress}
                        onChange={(e) => setBankInfo({ ...bankInfo, sellerAddress: e.target.value })}
                        className="flex-1 bg-yellow-50 hover:bg-yellow-100/80 focus:bg-white text-black focus:outline-none focus:ring-1 focus:ring-blue-400 px-1 rounded py-0.5 resize-none h-12"
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Cargo clearance summary shown strictly in CI Mode */
              <div className="border border-black p-4 mt-2 text-xs bg-white space-y-2">
                <h3 className="font-black text-slate-950 underline uppercase tracking-wider text-[11px] mb-2">
                  CARGO & PACKAGING DECLARATION (货物运输与海关清关要素声明):
                </h3>
                <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                  <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
                    <span className="block text-slate-500 text-[9px] uppercase font-bold">{language === 'zh' ? '总件数/总箱数:' : 'Total Packages:'}</span>
                    <span className="text-[13px] font-black text-slate-950">{autoMetaValues.totalQty} PKGS / CTNS</span>
                  </div>
                  <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
                    <span className="block text-slate-500 text-[9px] uppercase font-bold">{language === 'zh' ? '总净重 (Total Net Weight):' : 'Total Net Weight:'}</span>
                    <span className="text-[13px] font-black text-slate-950">{autoMetaValues.totalNw}</span>
                  </div>
                  <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
                    <span className="block text-slate-500 text-[9px] uppercase font-bold">{language === 'zh' ? '总毛重 (Total Gross Weight):' : 'Total Gross Weight:'}</span>
                    <span className="text-[13px] font-black text-slate-950">{autoMetaValues.totalGw}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Seal / Sign block */}
            <div className="mt-8 flex justify-between text-xs font-sans px-1 pt-6">
              <div className="space-y-1.5">
                <p className="font-bold uppercase text-slate-700 text-[10px] tracking-wider">Accepted by Buyer:</p>
                <div className="w-52 border-b border-slate-400 h-10"></div>
                <p className="text-slate-500 text-[10px]">Authorized Signature & Stamp</p>
              </div>
              <div className="space-y-1.5 text-right">
                <p className="font-bold uppercase text-slate-700 text-[10px] tracking-wider">Issued by Seller:</p>
                <div className="flex flex-col items-end relative">
                  <div className="w-52 border-b border-slate-400 h-10"></div>
                </div>
                <p className="text-slate-500 text-[10px]">Shandong Haman Metal Products CO.,Ltd</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      </div>
    </div>
  );
}
