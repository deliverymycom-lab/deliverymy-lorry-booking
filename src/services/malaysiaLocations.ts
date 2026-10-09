export interface MalaysianLocation {
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  popularPlaces?: string[];
}

export const MALAYSIAN_CITIES: MalaysianLocation[] = [
  {
    name: 'Johor Bahru (JB)',
    city: 'Johor Bahru',
    state: 'Johor',
    lat: 1.4655,
    lng: 103.7578,
    popularPlaces: ['Kempas', 'Larkin', 'Tebrau', 'Pasir Gudang', 'Skudai', 'Senai Airport']
  },
  {
    name: 'Kuala Lumpur (KL)',
    city: 'Kuala Lumpur',
    state: 'Wilayah Persekutuan',
    lat: 3.1390,
    lng: 101.6869,
    popularPlaces: ['Bukit Bintang', 'Cheras', 'Kepong', 'Sentul', 'Bangsar', 'Wangsa Maju']
  },
  {
    name: 'Shah Alam / Klang (Selangor)',
    city: 'Shah Alam',
    state: 'Selangor',
    lat: 3.0738,
    lng: 101.5183,
    popularPlaces: ['Port Klang', 'Subang Jaya', 'Petaling Jaya', 'Puchong', 'Klang Utara']
  },
  {
    name: 'Penang (George Town / Butterworth)',
    city: 'Penang',
    state: 'Pulau Pinang',
    lat: 5.4141,
    lng: 100.3288,
    popularPlaces: ['Bayan Lepas FTZ', 'Butterworth', 'Bukit Mertajam', 'Perai Industrial']
  },
  {
    name: 'Ipoh',
    city: 'Ipoh',
    state: 'Perak',
    lat: 4.5975,
    lng: 101.0901,
    popularPlaces: ['Menglembu', 'Bercham', 'Simpang Pulai', 'Tasek Industrial']
  },
  {
    name: 'Melaka',
    city: 'Melaka',
    state: 'Melaka',
    lat: 2.1896,
    lng: 102.2501,
    popularPlaces: ['Ayer Keroh', 'Batu Berendam', 'Cheng Industrial', 'Alor Gajah']
  },
  {
    name: 'Kuantan',
    city: 'Kuantan',
    state: 'Pahang',
    lat: 3.8077,
    lng: 103.3260,
    popularPlaces: ['Gebeng Industrial Port', 'Semambu', 'Indera Mahkota', 'Gambang']
  },
  {
    name: 'Seremban',
    city: 'Seremban',
    state: 'Negeri Sembilan',
    lat: 2.7258,
    lng: 101.9424,
    popularPlaces: ['Senawang Industrial', 'Nilai 3 Wholesale', 'Bandar Enstek']
  },
  {
    name: 'Batu Pahat',
    city: 'Batu Pahat',
    state: 'Johor',
    lat: 1.8548,
    lng: 102.9325,
    popularPlaces: ['Tongkang Pechah', 'Sri Gading', 'Parit Raja']
  },
  {
    name: 'Alor Setar',
    city: 'Alor Setar',
    state: 'Kedah',
    lat: 6.1248,
    lng: 100.3678,
    popularPlaces: ['Mergong Industrial', 'Jitra', 'Kuala Kedah']
  },
  {
    name: 'Kota Bharu',
    city: 'Kota Bharu',
    state: 'Kelantan',
    lat: 6.1254,
    lng: 102.2381,
    popularPlaces: ['Pengkalan Chepa', 'Wakaf Bharu', 'Kubang Kerian']
  },
  {
    name: 'Kuala Terengganu',
    city: 'Kuala Terengganu',
    state: 'Terengganu',
    lat: 5.3117,
    lng: 103.1324,
    popularPlaces: ['Gong Badak Industrial', 'Chukai Kemaman', 'Marang']
  }
];

export const TONNAGE_OPTIONS = [
  '1 Tan',
  '1.5 Tan',
  '3 Tan',
  '5 Tan',
  '8 Tan',
  '10 Tan',
  '12 Tan',
  '16 Tan',
  '20 Tan Treler',
  '40 Tan Treler'
];

export const BODY_TYPE_OPTIONS = [
  'Canvas / Kanvas 🎪 / 帆布篷布',
  'Closed Box 📦 / Kotak Tertutup / 封闭厢式',
  'Open Lorry 🚛 / Lori Kargo Terbuka / 开放式',
  'Curtain Sider 🚚 / Sider Tirai / 侧帘布式',
  'Towing Service 🛻🚗 / Lori Tunda / 拖车服务',
  'Crane Lorry 🏗️ / Lori Kren / 吊车',
  'Tipper 🚜 / Lori Tipper / 自卸车',
  'Tanker 🛢️ / Lori Tangki / 罐车',
  'Container Lorry 20ft/40ft 📦📦 / Lori Kontena / 货柜集装箱',
  'Pickup 🛻 / Lori Pickup / 皮卡',
  'Refrigerated Frozen 🧊 / Sejuk Beku / 冷藏车',
  'Low Loader 🚜 / Tunda Rendah / 低平板',
  '20 Feet Long / 20 Kaki / 20尺',
  '40 Feet Long / 40 Kaki / 40尺'
];

export interface LorryBodyMeta {
  key: string;
  titleMs: string;
  titleEn: string;
  titleZh: string;
  descMs: string;
  descEn: string;
  descZh: string;
  featureBadgeMs: string;
  featureBadgeEn: string;
  featureBadgeZh: string;
  recommendedForMs: string;
  recommendedForEn: string;
  recommendedForZh: string;
}

export const LORRY_BODY_METAS: Record<string, LorryBodyMeta> = {
  canvas: {
    key: 'canvas',
    titleMs: 'Canvas / Kanvas (Kalis Air)',
    titleEn: 'Canvas / Tarpaulin Lorry',
    titleZh: '帆布篷布罗里 (防雨防晒)',
    descMs: 'Badan lori berbingkai besi dilapisi kain kanvas tebal kalis air dan tali pengikat selamat. Sangat popular di Malaysia kerana fleksibel untuk memuat kargo tinggi.',
    descEn: 'Heavy-duty waterproof tarpaulin cover with sturdy steel cage and tied ropes. Very popular in Malaysia for flexible high-volume cargo loading.',
    descZh: '加厚防水防晒帆布篷布与高强铁架结构，四边强力绳索固定。大马最热门车身，装卸货灵活方便。',
    featureBadgeMs: '🌧️ Kalis Air & Fleksibel',
    featureBadgeEn: '🌧️ Weatherproof & Versatile',
    featureBadgeZh: '🌧️ 防水防晒·装载灵活',
    recommendedForMs: 'Perabot rumah, barangan am, palet kargo, mesin kilang',
    recommendedForEn: 'Furniture, general cargo, pallets, machinery',
    recommendedForZh: '家具搬运、普货托盘、商业货物、五金器械'
  },
  closed: {
    key: 'closed',
    titleMs: 'Closed Box (Kotak Tertutup Aluminium)',
    titleEn: 'Closed Aluminium Box',
    titleZh: '封闭式铝制厢式 (防盗防雨)',
    descMs: 'Badan kotak aluminium tegar dengan pintu belakang berengsel dan kunci keselamatan. 100% perlindungan maksimum daripada hujan lebat, habuk dan kecurian.',
    descEn: 'Solid rigid aluminium box container with heavy-duty rear lock doors. 100% weatherproof and anti-theft security for valuable cargo.',
    descZh: '全封闭铝合金硬壳厢体，后置加固防盗门锁。100%全天候防暴雨、防尘、防盗防掉落。',
    featureBadgeMs: '🔒 100% Selamat & Kalis Cuaca',
    featureBadgeEn: '🔒 100% Secure & Weatherproof',
    featureBadgeZh: '🔒 严密防盗·100%防雨',
    recommendedForMs: 'Elektronik, barangan berharga, kotak dokumen, tekstil & e-dagang',
    recommendedForEn: 'Electronics, valuable goods, documents, retail & e-commerce',
    recommendedForZh: '电子电器、高价值货物、文件箱、电商百货'
  },
  open: {
    key: 'open',
    titleMs: 'Open Lorry (Kargo Terbuka / Kayu)',
    titleEn: 'Open Wooden / Steel Cargo',
    titleZh: '开放式平板/木板斗',
    descMs: 'Lantai rata dengan pagar tepi kayu/keluli yang boleh diturunkan. Sesuai untuk muatan kren dari atas atau kargo terlebih dimensi.',
    descEn: 'Flatbed cargo body with drop-down side gates. Ideal for overhead crane loading and oversized building materials.',
    descZh: '开敞式车厢配活动围栏，方便吊车从上方或侧面快速吊装大型货物。',
    featureBadgeMs: '🏗️ Muatan Kren & Kargo Lebar',
    featureBadgeEn: '🏗️ Crane & Overhead Loading',
    featureBadgeZh: '🏗️ 支持吊机·超宽装载',
    recommendedForMs: 'Besi binaan, kayu balak, paip, jentera berat',
    recommendedForEn: 'Construction steel, timber, pipes, heavy machinery',
    recommendedForZh: '建筑钢材、木料、水管建材、重型工程部件'
  },
  curtain: {
    key: 'curtain',
    titleMs: 'Curtain Sider (Sider Tirai Slaid)',
    titleEn: 'Curtain Sider / Tautliner',
    titleZh: '侧拉帘布厢式 (快速叉车装卸)',
    descMs: 'Tirai sisi yang boleh ditarik dibuka sepenuhnya untuk memudahkan pemunggahan menggunakan forklift dari tepi dengan pantas.',
    descEn: 'Sliding side curtains allow full access for rapid side forklift loading of pallets.',
    descZh: '两侧帘布可整幅滑动拉开，叉车无需排队即可从车身两侧直接快速铲装托盘。',
    featureBadgeMs: '⚡ Pemuatan Forklift Pantas',
    featureBadgeEn: '⚡ Fast Side Forklift Access',
    featureBadgeZh: '⚡ 叉车侧装·效率翻倍',
    recommendedForMs: 'Kargo palet kilang bersaiz besar, minuman, tin bungkusan',
    recommendedForEn: 'Factory palletized goods, beverages, bulk FMCG',
    recommendedForZh: '工厂托盘整票快运、饮料快消品、原料包装'
  },
  tipper: {
    key: 'tipper',
    titleMs: 'Tipper (Lori Angkat / Pasir)',
    titleEn: 'Hydraulic Tipper Truck',
    titleZh: '液压自卸翻斗车',
    descMs: 'Dilengkapi ram hidraulik untuk mengangkat badan lori dan membuang muatan curah seperti pasir, batu dan tanah dengan pantas.',
    descEn: 'Hydraulic lifting bed for rapid dumping of bulk materials like sand, aggregates, and soil.',
    descZh: '配备强力液压举升顶，快速倾卸沙石、泥土与散装建筑矿料。',
    featureBadgeMs: '🚜 Pembuangan Curah Automatik',
    featureBadgeEn: '🚜 Automatic Dump Hydraulics',
    featureBadgeZh: '🚜 液压自卸·散货专用',
    recommendedForMs: 'Pasir, batu kerikil, tanah projek, sisa pembinaan',
    recommendedForEn: 'Sand, gravel, soil, construction aggregates',
    recommendedForZh: '黄沙、碎石、泥土工程、建筑废料'
  },
  refrigerated: {
    key: 'refrigerated',
    titleMs: 'Refrigerated (Sejuk Beku / Chiller)',
    titleEn: 'Refrigerated Chiller & Freezer',
    titleZh: '冷藏冷冻恒温车 (0°C至-18°C)',
    descMs: 'Kotak penebat haba tinggi dilengkapi unit penyejuk udara untuk mengekalkan suhu rendah sepanjang perjalanan.',
    descEn: 'Thermal insulated container with high-power chiller/freezer unit to maintain strict cold-chain temperatures.',
    descZh: '加厚聚氨酯保温厢体配专业冷机，保持全程稳定低温冷链，保鲜冷冻。',
    featureBadgeMs: '🧊 Suhu Terkawal (Chiller/Freezer)',
    featureBadgeEn: '🧊 Controlled Cold Chain',
    featureBadgeZh: '🧊 全程恒温·冷链保鲜',
    recommendedForMs: 'Daging beku, makanan laut, sayur buah, ais krim, ubat-ubatan',
    recommendedForEn: 'Frozen meat, seafood, fruits/veggies, ice cream, pharmaceuticals',
    recommendedForZh: '冷冻生鲜海鲜、肉类、果蔬乳品、冷冻食品、医药制品'
  },
  pickup: {
    key: 'pickup',
    titleMs: 'Pickup 4x4 / Lori Kecil 1 Tan',
    titleEn: 'Pickup 4x4 / 1 Ton Utility',
    titleZh: '皮卡 / 1吨轻巧型小货车',
    descMs: 'Kenderaan pantas dan lincah, mudah masuk ke kawasan sempit, kondominium, atau laluan desa.',
    descEn: 'Agile and fast for small items, quick urban deliveries, and low-clearance residential areas.',
    descZh: '灵巧敏捷，方便进出市区狭窄街道、公寓地库限高区域或乡村小路。',
    featureBadgeMs: '⚡ Cepat & Mudah Masuk Kondominium',
    featureBadgeEn: '⚡ Agile & Low-Clearance Ready',
    featureBadgeZh: '⚡ 穿街走巷·敏捷送达',
    recommendedForMs: 'Pakej kecil, beberapa kotak, barangan studio, penghantaran segera',
    recommendedForEn: 'Small packages, few boxes, studio moves, express dispatch',
    recommendedForZh: '少量包裹、小型搬家、紧急样品加急配送'
  },
  towing: {
    key: 'towing',
    titleMs: 'Towing Service / Lori Tunda (Kereta Rosak & Kemalangan)',
    titleEn: 'Towing Service & Breakdown Recovery (Tilt Flatbed)',
    titleZh: '拖车救援服务 (道路救援·平板/托举拖车)',
    descMs: 'Lori tunda berhidraulik penuh dengan platform landai (tilt flatbed) dan tali sawat penarik winch untuk menunda kereta rosak atau kemalangan dengan selamat tanpa merosakkan bumper.',
    descEn: 'Heavy-duty hydraulic slide-bed tilt flatbed tow truck with motorized winch cable and wheel-lift cradle for safe breakdown and accident recovery.',
    descZh: '全液压滑移倾斜平板拖车，带大拉力绞盘钢缆与轮托抱胎臂，无损拖运抛锚故障车、事故车、低趴跑车。',
    featureBadgeMs: '🛻 Tunda 24 Jam & Tilt Flatbed',
    featureBadgeEn: '🛻 24/7 Breakdown Tilt Bed Recovery',
    featureBadgeZh: '🛻 24小时救援·全落地平板',
    recommendedForMs: 'Kereta rosak tepi jalan, kereta kemalangan, kereta mewah, jentera kilang kecil',
    recommendedForEn: 'Breakdown vehicles, accident recovery, luxury cars, machinery',
    recommendedForZh: '路面抛锚抛车、事故拖运、豪华跑车、小型工程机械'
  },
  crane: {
    key: 'crane',
    titleMs: 'Crane Lorry / Lori Kren (Lori Bersama Kren Boom Hiab)',
    titleEn: 'Crane Lorry / Hiab Mounted Knuckle-Boom Truck',
    titleZh: '随车吊机罗里 (自带起重折臂 Hiab)',
    descMs: 'Lori kargo tugas berat dilengkapi kren boom teleskopik berhidraulik di belakang kabin. Boleh memuat dan memunggah jentera berat sendiri tanpa sewa kren luar.',
    descEn: 'Heavy-duty cargo truck with articulated hydraulic knuckle-boom crane behind cab. Self-loads and unloads heavy industrial equipment and structures.',
    descZh: '重型底盘随车配装高强折叠伸缩臂液压吊机，自装自卸工业重型货物，无需现场额外租用吊车。',
    featureBadgeMs: '🏗️ Muatan Kren Angkat Sendiri',
    featureBadgeEn: '🏗️ Self-Loading Heavy Lift (Hiab)',
    featureBadgeZh: '🏗️ 随车起吊·无需外租吊机',
    recommendedForMs: 'Genset elektrik, jentera kilang, tiang besi, precast konkrit, transformer',
    recommendedForEn: 'Generators, factory machinery, steel beams, precast concrete, transformers',
    recommendedForZh: '发电机组、工业机床设备、重型工字钢、水泥预制件、变压器'
  },
  tanker: {
    key: 'tanker',
    titleMs: 'Tanker / Lori Tangki (Kargo Cecair Pukal)',
    titleEn: 'Liquid Tanker Truck / Bulk Tank',
    titleZh: '液体罐式罗里 (油罐/化学品/食品液体)',
    descMs: 'Tangki silinder keluli tahan karat kalis bocor dengan petak baffle anti-goncangan, pam tekanan dan injap keselamatan untuk cecair industri dan bahan bakar.',
    descEn: 'Sealed stainless steel or aluminium cylindrical vessel with surge baffle bulkheads and discharge pumps for fuel, water, and industrial liquids.',
    descZh: '高密封不锈钢/铝合金圆柱体罐车，内置防波涌隔板与高压输送泵，专业运送油品、工业净水及液体原料。',
    featureBadgeMs: '🛢️ Cecair Pukal & Kalis Bocor',
    featureBadgeEn: '🛢️ Bulk Liquids & Certified Tank',
    featureBadgeZh: '🛢️ 散装液体·防浪防漏',
    recommendedForMs: 'Minyak diesel, air bersih pukal, minyak sawit mentah (CPO), cecair industri',
    recommendedForEn: 'Diesel fuel, bulk water, crude palm oil (CPO), industrial liquid',
    recommendedForZh: '柴油、工业/工程净水、散装棕榈油、化工液体'
  },
  container: {
    key: 'container',
    titleMs: 'Container Lorry (Treler Kontena 20ft / 40ft)',
    titleEn: 'Container Haulier / ISO Trailer 20ft & 40ft',
    titleZh: '集装箱集装柜挂车 (20尺 / 40尺 ISO 标箱)',
    descMs: 'Kepala treler prime mover berkuasa tinggi menarik treler rangka chassis dengan kunci twist-locks untuk mengangkut kontena perkapalan pelabuhan antarabangsa.',
    descEn: 'High-torque prime mover tractor hauling skeletal trailer chassis with heavy twist-locks for standard 20ft and 40ft ISO sea freight containers.',
    descZh: '重型牵引车头牵引多轴骨架半挂车，四角防脱转锁牢固锁紧标准 20 尺或 40 尺进出口集装箱。',
    featureBadgeMs: '📦📦 Pelabuhan & Kontena Perkapalan',
    featureBadgeEn: '📦📦 Port Haulage & ISO Container',
    featureBadgeZh: '📦📦 码头提还柜·干线集装箱',
    recommendedForMs: 'Import / eksport pelabuhan, kargo gudang, pelepasan kastam kontena',
    recommendedForEn: 'Port import/export, customs bonded shipping, warehousing cargo',
    recommendedForZh: '码头海运集装箱进出口、保税区转运、大型工厂外贸整箱货'
  },
  container20: {
    key: 'container20',
    titleMs: '20 Feet Long / 20 Kaki Kontena (Standard 20ft TEU)',
    titleEn: '20 Feet ISO Container Trailer (20ft TEU)',
    titleZh: '20 尺标准货柜 / 20 尺集装箱半挂车 (20ft TEU)',
    descMs: 'Treler rangka kontena kompak 20 kaki dengan 4 pengunci twist-lock berat. Direka khas untuk kargo padat dan berat seperti galian, jubin, bijirin, jentera padat atau barangan kilang berat (muatan sehingga ~24 tan).',
    descEn: 'Compact 20ft skeletal semi-trailer fitted with 4 corner twist-locks. Purpose-built for heavy, dense cargo such as tile, machinery, metals, grains or heavy goods with maximum road weight rating.',
    descZh: '20尺紧凑型骨架半挂车，配4组重型旋转集装箱锁具。专用于装载瓷砖、五金重构件、大米粮食等重物密度货物（限重约24吨以内）。',
    featureBadgeMs: '📦 20ft TEU / Kargo Berat & Padat',
    featureBadgeEn: '📦 20ft TEU / Dense Heavy Cargo',
    featureBadgeZh: '📦 20尺标箱·高载重重货利器',
    recommendedForMs: 'Bahan mentah berat, jubin, perkakasan besi, galian, kargo kilang berat',
    recommendedForEn: 'Heavy materials, ceramic tiles, steel hardware, minerals, heavy factory parts',
    recommendedForZh: '瓷砖建材、金属配件、工业重货、化工原料、高密度整箱货'
  },
  container40: {
    key: 'container40',
    titleMs: '40 Feet Long / 40 Kaki Kontena (High Cube / 40ft FEU)',
    titleEn: '40 Feet Long ISO Trailer (40ft FEU / High Cube)',
    titleZh: '40 尺超长货柜 / 40 尺大型集装箱半挂车 (40ft FEU)',
    descMs: 'Treler rangka panjang 40 kaki 3-gandar dengan panjang kargo 12.2 meter. Sesuai untuk kargo isipadu besar seperti perabot, perkakas elektrik, pakaian pukal, barangan eksport dan kargo am volum tinggi.',
    descEn: 'Extra-long 40ft 3-axle skeletal chassis spanning 12.2 meters in length. Ideal for high-volume, bulk goods such as furniture, electrical appliances, apparel, and large commercial consumer shipments.',
    descZh: '40尺三轴加长特种骨架半挂车（车厢净长约12.2米）。专用于大体积、轻泡及大批量货物如家具、大型家电、服装纺织品、跨境电商外贸整柜货物。',
    featureBadgeMs: '📦📦 40ft FEU / Isipadu Muatan Maksimum (12.2m)',
    featureBadgeEn: '📦📦 40ft FEU / Maximum Cargo Volume (12.2m)',
    featureBadgeZh: '📦📦 40尺大柜·超大容积空间',
    recommendedForMs: 'Perabot pukal, barangan elektrik & elektronik, kotak e-dagang, eksport tekstil',
    recommendedForEn: 'Bulk furniture, consumer electronics, e-commerce pallets, textile exports',
    recommendedForZh: '成套家具、家电音响、跨境电商托盘货、轻工业大体积出口品'
  },
  lowloader: {
    key: 'lowloader',
    titleMs: 'Low Loader / Treler Tunda Rendah (Jentera Berat & Jengkaut)',
    titleEn: 'Low Loader Heavy Haulage (Excavator & Bulldozer)',
    titleZh: '低平板重型特种车 (挖机·钩机·压路机·工程机械)',
    descMs: 'Treler berlantai rendah (drop deck) dengan tanjakan belakang lipat berkuasa tinggi, khas untuk memuat jengkaut (excavator), jentolak (bulldozer), jentera pembinaan dan muatan industri bersaiz lampau.',
    descEn: 'Heavy multi-axle drop-deck lowbed semi-trailer with hydraulic fold-down loading ramps, engineered for transporting excavators, bulldozers, road rollers and oversized construction machinery.',
    descZh: '多轴超低底盘凹梁特种半挂平板车，配重载折叠爬梯跳板，专用于运送挖掘机、推土机、压路机等超重超高超宽大型工程机械设备。',
    featureBadgeMs: '🚜 Muatan Berat & Jentera Industri (Jengkaut)',
    featureBadgeEn: '🚜 Heavy Equipment & Excavator Haulage',
    featureBadgeZh: '🚜 超低重心·特种重机托运',
    recommendedForMs: 'Jengkaut (excavator), jentolak, paving machine, jentera binaan besar, jentera kilang berat',
    recommendedForEn: 'Excavators, bulldozers, piling rigs, road pavers, oversize machinery',
    recommendedForZh: '挖掘机、推土机、压路机、打桩机、超限特重工业机械'
  }
};

export const OPERATING_CITIES = [
  'Kuala Lumpur',
  'Selangor',
  'Johor Bahru',
  'Penang',
  'Ipoh',
  'Kuantan',
  'Melaka',
  'Seremban',
  'Batu Pahat',
  'Alor Setar',
  'Kota Bharu',
  'Kuala Terengganu',
  'Kuching',
  'Kota Kinabalu'
];
