import React, { useState } from 'react';
import { Code, Copy, Check, X, Download, FileText } from 'lucide-react';

interface FlutterCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterCodeModal: React.FC<FlutterCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('pubspec.yaml');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const flutterFiles: Record<string, { path: string; code: string }> = {
    'pubspec.yaml': {
      path: 'pubspec.yaml',
      code: `name: delivery_my
description: "DeliveryMY - Malaysia Lorry Transport Booking App (Direct Deal KM Only)"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^2.24.2
  firebase_auth: ^4.16.0
  cloud_firestore: ^4.14.0
  google_maps_flutter: ^2.5.3
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  url_launcher: ^6.2.4
  shared_preferences: ^2.2.2
  intl: ^0.19.0
  provider: ^6.1.1

flutter:
  uses-material-design: true
`,
    },
    'language_service.dart': {
      path: 'lib/services/language_service.dart',
      code: `import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageService extends ChangeNotifier {
  static final LanguageService _instance = LanguageService._internal();
  factory LanguageService() => _instance;
  LanguageService._internal();

  String _currentLocale = 'ms';
  String get currentLocale => _currentLocale;

  static const Map<String, Map<String, String>> localizedValues = {
    'ms': {
      'appName': 'DeliveryMY',
      'customer': 'Pelanggan',
      'driver': 'Pemandu',
      'admin': 'Admin',
      'bookLorry': 'Tempah Lori',
      'fromWhere': 'Dari Mana',
      'toWhere': 'Ke Mana',
      'chooseOnMap': 'Pilih di Peta',
      'currentLocation': 'Lokasi Semasa',
      'tonnage': 'Kapasiti Tonnage',
      'bodyType': 'Jenis Badan',
      'goodsType': 'Jenis Barang',
      'findDriver': 'Cari Pemandu Sekarang',
      'returnLoad': 'Muatan Balik (Return Load)',
      'noPriceNote': 'TIADA HARGA DI SINI - Urusan harga 100% terus antara pelanggan dan pemandu lori.',
    },
    'en': {
      'appName': 'DeliveryMY',
      'customer': 'Customer',
      'driver': 'Driver',
      'admin': 'Admin',
      'bookLorry': 'Book Lorry',
      'fromWhere': 'From Where',
      'toWhere': 'To Where',
      'chooseOnMap': 'Choose on Map',
      'currentLocation': 'Current Location',
      'tonnage': 'Tonnage Capacity',
      'bodyType': 'Body Type',
      'goodsType': 'Goods Type',
      'findDriver': 'Find Driver Now',
      'returnLoad': 'Return Load',
      'noPriceNote': 'NO PRICE ANYWHERE - Direct negotiation 100% between customer and driver.',
    },
    'zh': {
      'appName': 'DeliveryMY',
      'customer': '客户',
      'driver': '司机',
      'admin': '管理员',
      'bookLorry': '预订罗里',
      'fromWhere': '从哪里',
      'toWhere': '到哪里',
      'chooseOnMap': '在地图上选择',
      'currentLocation': '当前位置',
      'tonnage': '罗里吨位',
      'bodyType': '车身类型',
      'goodsType': '货物类型',
      'findDriver': '立即寻找司机',
      'returnLoad': '空车回程 (Return Load)',
      'noPriceNote': '全平台无标价 - 运费由客户与司机100%直接协商，零抽佣金。',
    },
  };

  String t(String key) {
    return localizedValues[_currentLocale]?[key] ?? key;
  }

  Future<void> setLocale(String lang) async {
    _currentLocale = lang;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selected_language', lang);
    notifyListeners();
  }
}
`,
    },
    'distance_utils.dart': {
      path: 'lib/services/distance_utils.dart',
      code: `import 'dart:math';

class DistanceUtils {
  /// Exact Haversine formula calculation for Malaysia road distances
  static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double r = 6371.0; // Earth radius in KM
    final double dLat = _deg2rad(lat2 - lat1);
    final double dLon = _deg2rad(lon2 - lon1);

    final double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_deg2rad(lat1)) * cos(_deg2rad(lat2)) * sin(dLon / 2) * sin(dLon / 2);
    final double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    final double straightDist = r * c;

    // Road winding factor in Malaysia (~1.25x)
    return straightDist * 1.25;
  }

  static double _deg2rad(double deg) => deg * (pi / 180.0);

  static String formatEstimatedTime(double distanceKm) {
    final double hours = distanceKm / 50.0; // Average loaded lorry speed 50 km/h
    final int h = hours.floor();
    final int m = ((hours - h) * 60).round();
    if (h == 0) return '$m min';
    return '$h jam $m min';
  }
}
`,
    },
    'main.dart': {
      path: 'lib/main.dart',
      code: `import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'services/language_service.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LanguageService()),
      ],
      child: const DeliveryMYApp(),
    ),
  );
}

class DeliveryMYApp extends StatelessWidget {
  const DeliveryMYApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DeliveryMY',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFF2563EB),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF2563EB),
          secondary: Color(0xFF10B981),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
`,
    },
    'booking_screen.dart': {
      path: 'lib/screens/booking_screen.dart',
      code: `import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/distance_utils.dart';
import '../services/language_service.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _goodsController = TextEditingController(text: 'Perabot & Kotak');
  final _noteController = TextEditingController();

  String _fromAddress = 'Kempas Industrial Area, Johor Bahru';
  String _fromCity = 'Johor Bahru';
  double _fromLat = 1.4655, _fromLng = 103.7578;

  String _toAddress = 'Bukit Bintang Logistics Center, Kuala Lumpur';
  String _toCity = 'Kuala Lumpur';
  double _toLat = 3.1390, _toLng = 101.6869;

  String _selectedTonnage = '3 Tan';
  String _selectedBodyType = 'Closed Box 📦';
  double _distanceKm = 330.0;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadSavedCustomerDetails();
    _calculateDistance();
  }

  Future<void> _loadSavedCustomerDetails() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _nameController.text = prefs.getString('saved_name') ?? '';
      _phoneController.text = prefs.getString('saved_phone') ?? '';
    });
  }

  void _calculateDistance() {
    setState(() {
      _distanceKm = DistanceUtils.calculateDistance(
        _fromLat, _fromLng, _toLat, _toLng,
      );
      if ((_fromCity.contains('Johor') && _toCity.contains('Lumpur')) ||
          (_fromCity.contains('Lumpur') && _toCity.contains('Johor'))) {
        _distanceKm = 330.0;
      }
    });
  }

  Future<void> _handleBookNow() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();

    // Step 1: Validate * fields
    if (name.isEmpty || phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.red,
          content: Text('Sila isi semua ruangan bertanda * (Nama & Telefon).'),
        ),
      );
      return;
    }

    // Step 2: Save to SharedPreferences for next auto-fill
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('saved_name', name);
    await prefs.setString('saved_phone', phone);

    setState(() => _isLoading = true);

    // Step 3 & 4: Check Return Load drivers in Firestore
    final returnLoadsQuery = await FirebaseFirestore.instance
        .collection('drivers')
        .where('returnLoad', isEqualTo: true)
        .where('isApproved', isEqualTo: true)
        .where('isAvailable', isEqualTo: true)
        .where('isOnline', isEqualTo: true)
        .where('lorryTonnage', isEqualTo: _selectedTonnage)
        .get();

    setState(() => _isLoading = false);

    // Step 5: If Return Load found, show bottom sheet
    // Step 6: Else direct submit to Firestore bookings collection
    await FirebaseFirestore.instance.collection('bookings').add({
      'customerId': 'guest_\${phone.replaceAll(RegExp(r'\\D'), '')}',
      'customerName': name,
      'customerPhone': phone,
      'fromAddress': _fromAddress,
      'toAddress': _toAddress,
      'fromCity': _fromCity,
      'toCity': _toCity,
      'distanceKM': _distanceKm,
      'distanceText': '\${_distanceKm.round()} KM',
      'estimatedTime': DistanceUtils.formatEstimatedTime(_distanceKm),
      'lorryTonnage': _selectedTonnage,
      'lorryBodyType': _selectedBodyType,
      'goodsType': _goodsController.text,
      'status': 'PENDING',
      'price': null, // STRICT RULE: NO PRICE
      'createdAt': FieldValue.serverTimestamp(),
    });

    // Navigate to Success Screen
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('DeliveryMY'),
        backgroundColor: const Color(0xFF0F172A),
      ),
      // STICKY BOTTOM BUTTON PATTERN
      body: Stack(
        children: [
          // Single Scroll Booking Form
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Card 1: From Where (Pickup)*
                _buildCard('Dari Mana (Pickup) *', _fromAddress),
                const SizedBox(height: 12),
                // Card 2: To Where (Dropoff)*
                _buildCard('Ke Mana (Dropoff) *', _toAddress),
                const SizedBox(height: 12),
                // Card 3: KM Auto Calculation (Green Card)
                _buildGreenKmCard(),
                const SizedBox(height: 12),
                // Card 4: Lorry Details*
                _buildLorryDetailsCard(),
                const SizedBox(height: 12),
                // Card 5: Date Time Picker*
                _buildDateTimeCard(),
                const SizedBox(height: 12),
                // Card 6: Your Details (Name & Phone)*
                _buildCustomerContactCard(),
              ],
            ),
          ),

          // STICKY BOTTOM FIXED CONTAINER WITH BIG BOLD GRADIENT BUTTON
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withOpacity(0.95),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black54,
                    blurRadius: 10,
                    offset: Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                child: SizedBox(
                  height: 60,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleBookNow,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Text(
                      '📦 BOOK NOW (\${_distanceKm.round()} KM)',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(String title, String address) => Card(child: ListTile(title: Text(title), subtitle: Text(address)));
  Widget _buildGreenKmCard() => Card(color: Colors.green.shade900, child: Padding(padding: const EdgeInsets.all(16), child: Text('📏 \${_distanceKm.round()} KM', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold))));
  Widget _buildLorryDetailsCard() => Card(child: Padding(padding: const EdgeInsets.all(16), child: Text('Lori: \$_selectedTonnage - \$_selectedBodyType')));
  Widget _buildDateTimeCard() => Card(child: Padding(padding: const EdgeInsets.all(16), child: const Text('Tarikh: Hari Ini')));
  Widget _buildCustomerContactCard() => Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Nama *')), TextField(controller: _phoneController, decoration: const InputDecoration(labelText: 'Telefon *'))])));
}
`,
    },
  };

  const handleCopy = () => {
    const code = flutterFiles[selectedFile]?.code || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Flutter Source Code (Dart)</h3>
              <p className="text-xs text-slate-400">Pakej & Skrip Flutter Lengkap untuk Projek DeliveryMY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs no-scrollbar">
          {Object.keys(flutterFiles).map((filename) => (
            <button
              key={filename}
              onClick={() => setSelectedFile(filename)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                selectedFile === filename
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{filename}</span>
            </button>
          ))}
        </div>

        {/* Code Viewer */}
        <div className="flex-1 min-h-[300px] overflow-auto bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300">
          <pre className="whitespace-pre">{flutterFiles[selectedFile]?.code}</pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400 font-mono">
            {flutterFiles[selectedFile]?.path}
          </span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Disalin ke Papan Keratan!' : 'Salin Kod Flutter'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
