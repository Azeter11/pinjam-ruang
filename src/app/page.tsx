import Link from 'next/link';
import { Building2, Users, Clock, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Clock, title: 'Peminjaman Real-time', desc: 'Cek ketersediaan dan pesan ruangan secara langsung tanpa antri.' },
  { icon: Shield, title: 'Persetujuan Terstruktur', desc: 'Sistem approval admin yang transparan dan cepat.' },
  { icon: Users, title: 'Multi Pengguna', desc: 'Mendukung mahasiswa, dosen, dan organisasi kampus.' },
  { icon: Building2, title: 'Berbagai Ruangan', desc: 'Kelas, aula, lab, studio—semua dalam satu platform.' },
];

const stats = [
  { label: 'Ruangan Tersedia', value: '50+' },
  { label: 'Pengguna Aktif', value: '2.000+' },
  { label: 'Peminjaman Berhasil', value: '10.000+' },
  { label: 'Tingkat Kepuasan', value: '98%' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Pinjam Ruang</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Smart Campus Room Booking System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Pinjam Ruangan Kampus{' '}
            <span className="text-blue-600">Lebih Mudah</span>
          </h1>

          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10">
            Platform digital untuk peminjaman ruangan kampus secara real-time.
            Cepat, transparan, dan terintegrasi untuk seluruh sivitas akademika.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-200"
            >
              Pinjam Sekarang
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors"
            >
              Sudah Punya Akun?
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-blue-200 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Kenapa Pinjam Ruang?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Solusi modern untuk masalah klasik peminjaman ruangan kampus.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">{f.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Cara Kerja</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Daftar & Masuk', desc: 'Buat akun dengan email kampus Anda.' },
              { step: '02', title: 'Pilih Ruangan', desc: 'Cari ruangan yang tersedia sesuai kebutuhan.' },
              { step: '03', title: 'Ajukan Peminjaman', desc: 'Isi form dengan jadwal dan keperluan penggunaan.' },
              { step: '04', title: 'Tunggu Persetujuan', desc: 'Admin akan mereview dan memberi konfirmasi cepat.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap mulai meminjam ruangan?
          </h2>
          <p className="text-blue-100 mb-8">
            Bergabung dengan ribuan pengguna yang sudah mempercayai Pinjam Ruang.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg"
          >
            Mulai Gratis
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 size={12} className="text-white" />
          </div>
          <span className="font-semibold text-gray-700">Pinjam Ruang</span>
        </div>
        <p>© 2024 Smart Campus System. All rights reserved.</p>
      </footer>
    </div>
  );
}
