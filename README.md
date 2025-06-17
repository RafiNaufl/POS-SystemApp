# Aplikasi Point of Sale (POS) untuk Penjualan Makanan

Aplikasi Point of Sale (POS) yang lengkap dan modern untuk bisnis penjualan makanan, dibangun menggunakan Next.js 14 dengan TypeScript dan Tailwind CSS.

## 🚀 Fitur Utama

### 📊 Dashboard
- Overview penjualan harian
- Statistik produk dan transaksi
- Monitoring stok rendah
- Navigasi cepat ke semua fitur

### 💰 Sistem Kasir
- Interface kasir yang intuitif
- Pencarian produk real-time
- Filter berdasarkan kategori
- Keranjang belanja dengan kalkulasi otomatis
- Multiple metode pembayaran (Tunai, Kartu, E-Wallet)
- Sistem voucher dan promosi otomatis
- Member points dan loyalty program
- Cetak struk otomatis

### 🍔 Manajemen Produk
- CRUD produk lengkap
- Upload gambar produk
- Manajemen stok
- Kategori produk
- Status aktif/nonaktif
- Filter dan pencarian

### 📂 Manajemen Kategori
- Tambah, edit, hapus kategori
- Validasi kategori yang sedang digunakan
- Statistik produk per kategori

### 📈 Laporan Penjualan
- Grafik tren penjualan
- Distribusi penjualan per kategori
- Produk terlaris
- Export laporan (JSON)
- Filter berdasarkan periode

### 📋 Riwayat Transaksi
- Daftar semua transaksi
- Filter berdasarkan status, metode pembayaran, tanggal
- Detail transaksi lengkap
- Cetak ulang struk
- Pencarian transaksi

### 👥 Manajemen Pengguna
- Sistem role (Admin, Manager, Kasir)
- CRUD pengguna
- Aktivasi/deaktivasi akun
- Tracking login terakhir

### 🎟️ Sistem Voucher
- Buat dan kelola voucher diskon
- Voucher berdasarkan persentase atau nominal
- Minimum pembelian dan batas penggunaan
- Validasi voucher real-time
- Tracking penggunaan voucher

### 🎯 Sistem Promosi
- Promosi "Beli X Gratis Y"
- Promosi diskon berdasarkan kategori
- Promosi minimum pembelian
- Kombinasi multiple promosi
- Kalkulasi diskon otomatis

### 👤 Manajemen Member
- Registrasi member dengan nomor telepon
- Sistem poin reward
- Tukar poin dengan diskon
- Tracking aktivitas member
- Laporan member dan poin

## 🛠️ Teknologi yang Digunakan

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM (PostgreSQL/MySQL/SQLite)
- **Authentication**: NextAuth.js
- **Icons**: Heroicons
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📦 Instalasi

### Prasyarat
- Node.js 18+ 
- npm atau yarn
- Database (PostgreSQL/MySQL/SQLite)

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd POS-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit file `.env.local` dan sesuaikan dengan konfigurasi Anda:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/pos_db"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # JWT
   JWT_SECRET="your-jwt-secret"
   
   # App Settings
   APP_NAME="POS Makanan"
   APP_VERSION="1.0.0"
   TAX_RATE="0.1"
   CURRENCY="IDR"
   ```

4. **Setup database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed database dengan data sample
   npx prisma db seed
   ```

5. **Jalankan aplikasi**
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

6. **Buka aplikasi**
   Akses aplikasi di `http://localhost:3000`

## 🗄️ Struktur Database

### User
- id, email, name, password, role, createdAt, updatedAt

### Category
- id, name, description, createdAt, updatedAt

### Product
- id, name, description, price, stock, image, categoryId, isActive, createdAt, updatedAt

### Transaction
- id, userId, subtotal, tax, total, paymentMethod, status, voucherCode, voucherDiscount, promoDiscount, pointsUsed, pointsEarned, memberPhone, createdAt, updatedAt

### TransactionItem
- id, transactionId, productId, quantity, price, total

### Member
- id, phone, name, email, points, totalSpent, createdAt, updatedAt

### Voucher
- id, code, name, type, value, minPurchase, maxUses, usedCount, isActive, validFrom, validTo, createdAt, updatedAt

### Promotion
- id, name, type, value, minPurchase, buyQuantity, getQuantity, categoryId, isActive, validFrom, validTo, createdAt, updatedAt

## 🎯 Penggunaan

### Login Default
- **Admin**: admin@pos.com / password
- **Kasir**: kasir@pos.com / password

### Workflow Kasir
1. Login ke sistem
2. Pilih menu "Kasir" dari dashboard
3. (Opsional) Input nomor telepon member untuk poin
4. Pilih produk dari daftar atau gunakan pencarian
5. Atur quantity di keranjang
6. (Opsional) Gunakan voucher diskon
7. (Opsional) Gunakan poin member untuk diskon
8. Sistem otomatis menerapkan promosi yang berlaku
9. Pilih metode pembayaran
10. Proses pembayaran
11. Cetak struk dengan detail diskon dan poin

### Manajemen Produk
1. Akses menu "Produk"
2. Tambah produk baru dengan informasi lengkap
3. Upload gambar produk
4. Set kategori dan harga
5. Kelola stok

### Laporan
1. Akses menu "Laporan"
2. Pilih periode laporan
3. Analisis grafik penjualan
4. Export data untuk analisis lebih lanjut

### Manajemen Voucher
1. Akses menu "Voucher"
2. Buat voucher baru dengan kode unik
3. Set tipe diskon (persentase/nominal)
4. Tentukan minimum pembelian dan batas penggunaan
5. Set periode berlaku voucher
6. Aktivasi/deaktivasi voucher

### Manajemen Promosi
1. Akses menu "Promosi"
2. Pilih tipe promosi (Buy X Get Y, Diskon Kategori, dll)
3. Set parameter promosi (quantity, diskon, kategori)
4. Tentukan minimum pembelian jika diperlukan
5. Set periode berlaku promosi
6. Aktivasi/deaktivasi promosi

### Manajemen Member
1. Akses menu "Member"
2. Registrasi member baru dengan nomor telepon
3. Lihat detail poin dan riwayat transaksi member
4. Monitor aktivitas dan total pengeluaran member
5. Kelola sistem poin reward

## 🔧 Konfigurasi

### Pengaturan Pajak
Ubah nilai `TAX_RATE` di file `.env.local` (contoh: 0.1 untuk 10%)

### Mata Uang
Ubah nilai `CURRENCY` di file `.env.local` (contoh: "IDR", "USD")

### Sistem Poin Member
Konfigurasi sistem poin di file `.env.local`:
```env
POINTS_PER_RUPIAH="1"     # 1 poin per 1000 rupiah
POINT_VALUE="1000"        # 1 poin = 1000 rupiah diskon
```

### Upload Gambar
Konfigurasi penyimpanan gambar di `next.config.js`

## 📱 Responsive Design

Aplikasi ini fully responsive dan dapat digunakan di:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Keamanan

- Authentication dengan NextAuth.js
- Password hashing dengan bcrypt
- JWT token untuk session management
- Role-based access control
- Input validation dan sanitization
- CSRF protection

## 🚀 Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Connect repository di Vercel
3. Set environment variables
4. Deploy

### Docker
```bash
# Build image
docker build -t pos-app .

# Run container
docker run -p 3000:3000 pos-app
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Jika Anda memiliki pertanyaan atau membutuhkan bantuan:
- Email: support@pos-app.com
- Documentation: [Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

## 🔄 Changelog

### v2.0.0 (2024-01-22)
- 🎟️ Sistem voucher lengkap dengan validasi
- 🎯 Sistem promosi multi-tipe (Buy X Get Y, Diskon Kategori)
- 👤 Manajemen member dengan sistem poin reward
- 💰 Integrasi voucher dan promosi di kasir
- 📊 Laporan voucher dan member
- 🔧 Konfigurasi sistem poin yang fleksibel
- 🎨 UI/UX improvements untuk semua fitur baru

### v1.0.0 (2024-01-21)
- ✨ Initial release
- 🎯 Complete POS functionality
- 📊 Dashboard and reporting
- 👥 User management
- 🍔 Product and category management
- 💰 Transaction processing

## 🎯 Roadmap

- [x] ~~Customer management~~ ✅ **Completed (Member System)**
- [x] ~~Loyalty program~~ ✅ **Completed (Points System)**
- [ ] Mobile app (React Native)
- [ ] Inventory management
- [ ] Multi-store support
- [ ] Advanced analytics
- [ ] Integration with payment gateways
- [ ] Barcode scanning
- [ ] Kitchen display system
- [ ] Online ordering integration
- [ ] WhatsApp notifications
- [ ] Advanced voucher features (referral codes)
- [ ] Seasonal promotions
- [ ] Member tier system

---

**Dibuat dengan ❤️ untuk bisnis makanan Indonesia**