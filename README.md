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

## 🌐 Live Demo

**🚀 Aplikasi sudah live dan dapat diakses di:**
- **Production**: https://pos-system-jygwq094r-naufal-rafis-projects.vercel.app
- **Preview**: https://pos-system-cm0yd0yn5-naufal-rafis-projects.vercel.app

### Login Demo
- **Admin**: admin@pos.com / password
- **Kasir**: kasir@pos.com / password

## 📦 Instalasi

### Prasyarat
- Node.js 18+ 
- npm atau yarn
- Vercel account (untuk deployment)
- Prisma Accelerate database (cloud database)

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd pos-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit file `.env` dan sesuaikan dengan konfigurasi Anda:
   ```env
   # Database (Prisma Accelerate)
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your-api-key"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Xendit Configuration (Payment Gateway)
   XENDIT_SECRET_KEY="your-xendit-secret-key"
   XENDIT_PUBLIC_KEY="your-xendit-public-key"
   XENDIT_WEBHOOK_TOKEN="your-webhook-token"
   ```

4. **Setup database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Seed database dengan data sample
   npx tsx prisma/seed.ts
   ```

5. **Jalankan aplikasi**
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

6. **Buka aplikasi**
   Akses aplikasi di `http://localhost:3000`

### Deployment ke Vercel

1. **Link project ke Vercel**
   ```bash
   vercel link
   ```

2. **Set environment variables di Vercel Dashboard**
   - `DATABASE_URL`: Prisma Accelerate connection string
   - `NEXTAUTH_URL`: Production URL (https://your-app.vercel.app)
   - `NEXTAUTH_SECRET`: Random secret key
   - `XENDIT_SECRET_KEY`: Xendit secret key
   - `XENDIT_PUBLIC_KEY`: Xendit public key
   - `XENDIT_WEBHOOK_TOKEN`: Xendit webhook token

3. **Deploy ke production**
   ```bash
   vercel --prod
   ```

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

### Status Deployment Saat Ini
✅ **Aplikasi sudah berhasil di-deploy ke Vercel dengan konfigurasi berikut:**
- **Database**: Prisma Accelerate (Cloud PostgreSQL)
- **Authentication**: NextAuth.js dengan secret yang aman
- **Payment Gateway**: Xendit integration
- **Environment**: Production-ready

### Vercel (Recommended) ✅ **DEPLOYED**
1. ✅ Repository sudah terhubung ke Vercel
2. ✅ Environment variables sudah dikonfigurasi:
   - `DATABASE_URL`: Prisma Accelerate connection
   - `NEXTAUTH_URL`: Production URL
   - `NEXTAUTH_SECRET`: Secure secret key
   - `XENDIT_*`: Payment gateway configuration
3. ✅ Database migrations berhasil dijalankan
4. ✅ Database seeding completed
5. ✅ Production deployment active

**Live URLs:**
- Production: https://pos-system-jygwq094r-naufal-rafis-projects.vercel.app
- Preview: https://pos-system-cm0yd0yn5-naufal-rafis-projects.vercel.app

### Manual Deployment (Jika diperlukan)
```bash
# Deploy preview
vercel

# Deploy production
vercel --prod
```

### Docker (Alternative)
```bash
# Build image
docker build -t pos-app .

# Run container
docker run -p 3000:3000 pos-app
```

### Database Setup (Cloud)
✅ **Database sudah dikonfigurasi dengan:**
- **Provider**: Prisma Accelerate
- **Type**: PostgreSQL (Cloud)
- **Status**: Connected and migrated
- **Seeding**: Completed with sample data

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

### v2.1.0 (2025-01-19) ✅ **CURRENT VERSION**
- 🚀 **Production deployment ke Vercel berhasil**
- 🗄️ **Migrasi database ke Prisma Accelerate (Cloud PostgreSQL)**
- 🔐 **NextAuth.js secret configuration untuk production**
- 💳 **Xendit payment gateway integration**
- 🌐 **Live demo tersedia dengan URL production dan preview**
- 📦 **Database seeding dengan sample data lengkap**
- 🔧 **Environment variables production-ready**
- 📋 **Updated README dengan deployment status**

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