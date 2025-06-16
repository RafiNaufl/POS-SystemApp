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
- id, userId, subtotal, tax, total, paymentMethod, status, createdAt, updatedAt

### TransactionItem
- id, transactionId, productId, quantity, price, total

## 🎯 Penggunaan

### Login Default
- **Admin**: admin@pos.com / password
- **Kasir**: kasir@pos.com / password

### Workflow Kasir
1. Login ke sistem
2. Pilih menu "Kasir" dari dashboard
3. Pilih produk dari daftar atau gunakan pencarian
4. Atur quantity di keranjang
5. Pilih metode pembayaran
6. Proses pembayaran
7. Cetak struk

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

## 🔧 Konfigurasi

### Pengaturan Pajak
Ubah nilai `TAX_RATE` di file `.env.local` (contoh: 0.1 untuk 10%)

### Mata Uang
Ubah nilai `CURRENCY` di file `.env.local` (contoh: "IDR", "USD")

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

### v1.0.0 (2024-01-21)
- ✨ Initial release
- 🎯 Complete POS functionality
- 📊 Dashboard and reporting
- 👥 User management
- 🍔 Product and category management
- 💰 Transaction processing

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Inventory management
- [ ] Customer management
- [ ] Loyalty program
- [ ] Multi-store support
- [ ] Advanced analytics
- [ ] Integration with payment gateways
- [ ] Barcode scanning
- [ ] Kitchen display system
- [ ] Online ordering integration

---

**Dibuat dengan ❤️ untuk bisnis makanan Indonesia**