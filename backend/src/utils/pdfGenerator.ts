import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Booking } from '../types';

// Type untuk booking dengan relasi lengkap
type BookingWithDetails = Booking & {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    faculty?: string;
    created_at: string;
  };
  room: {
    id: string;
    name: string;
    building: string;
    capacity: number;
  };
};

export function generateBookingPDF(booking: BookingWithDetails, res: Response): void {
  const doc = new PDFDocument({ 
    size: 'A4',
    margins: { top: 60, bottom: 60, left: 60, right: 60 }
  });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=booking-${booking.id}.pdf`
  );

  // Pipe PDF to response
  doc.pipe(res);

  // Colors
  const primaryColor = '#1e3a8a'; // Dark blue
  const secondaryColor = '#64748b'; // Slate gray
  const accentColor = '#10b981'; // Green for approved

  // ============================================================
  // HEADER SECTION
  // ============================================================
  
  // Top border line
  doc.rect(60, 60, 475, 3)
     .fill(primaryColor);

  doc.moveDown(0.5);

  // Title
  doc.fontSize(24)
     .font('Times-Bold')
     .fillColor(primaryColor)
     .text('BUKTI PEMINJAMAN RUANGAN', { align: 'center' })
     .moveDown(0.3);

  // Subtitle
  doc.fontSize(11)
     .font('Times-Roman')
     .fillColor(secondaryColor)
     .text('Sistem Informasi Peminjaman Ruangan', { align: 'center' })
     .text('Universitas/Institusi', { align: 'center' })
     .moveDown(0.5);

  // Horizontal line
  doc.moveTo(60, doc.y)
     .lineTo(535, doc.y)
     .strokeColor('#e5e7eb')
     .lineWidth(1)
     .stroke();

  doc.moveDown(1);

  // Status Badge
  const statusText = booking.status === 'approved' ? 'DISETUJUI' : booking.status.toUpperCase();
  const statusColor = booking.status === 'approved' ? accentColor : '#f59e0b';
  
  doc.fontSize(12)
     .font('Times-Bold')
     .fillColor(statusColor)
     .text(statusText, { align: 'center' })
     .moveDown(1.5);

  // ============================================================
  // BOOKING INFORMATION SECTION
  // ============================================================

  doc.fontSize(13)
     .font('Times-Bold')
     .fillColor(primaryColor)
     .text('I. INFORMASI PEMINJAMAN')
     .moveDown(0.5);

  const infoStartY = doc.y;
  const leftCol = 80;
  const rightCol = 320;
  const labelWidth = 140;
  const valueWidth = 200;

  // Left Column
  doc.fontSize(10)
     .font('Times-Roman')
     .fillColor('#374151');

  // ID Booking
  doc.text('Nomor Booking', leftCol, infoStartY, { width: labelWidth, continued: false });
  doc.font('Times-Bold')
     .fillColor('#111827')
     .text(`: ${booking.id}`, leftCol + labelWidth, infoStartY, { width: valueWidth });

  // Tanggal
  doc.font('Times-Roman')
     .fillColor('#374151')
     .text('Tanggal Peminjaman', leftCol, doc.y + 12, { width: labelWidth, continued: false });
  doc.font('Times-Bold')
     .fillColor('#111827')
     .text(`: ${formatDate(booking.date)}`, leftCol + labelWidth, doc.y, { width: valueWidth });

  // Waktu
  doc.font('Times-Roman')
     .fillColor('#374151')
     .text('Waktu', leftCol, doc.y + 12, { width: labelWidth, continued: false });
  doc.font('Times-Bold')
     .fillColor('#111827')
     .text(`: ${booking.start_time} - ${booking.end_time} WIB`, leftCol + labelWidth, doc.y, { width: valueWidth });

  // Durasi
  const duration = calculateDuration(booking.start_time, booking.end_time);
  doc.font('Times-Roman')
     .fillColor('#374151')
     .text('Durasi', leftCol, doc.y + 12, { width: labelWidth, continued: false });
  doc.font('Times-Bold')
     .fillColor('#111827')
     .text(`: ${duration}`, leftCol + labelWidth, doc.y, { width: valueWidth });

  doc.moveDown(2);

  // ============================================================
  // ROOM INFORMATION SECTION
  // ============================================================

  doc.fontSize(13)
     .font('Times-Bold')
     .fillColor(primaryColor)
     .text('II. INFORMASI RUANGAN', 60)
     .moveDown(0.5);

  const roomStartY = doc.y;

  doc.fontSize(10)
     .font('Times-Roman')
     .fillColor('#374151');

  // Nama Ruangan
  doc.text('Nama Ruangan', leftCol, roomStartY, { width: labelWidth, continued: false });
  doc.font('Times-Bold')
     .fillColor('#111827')
     .text(`: ${booking.room.name}`, leftCol + labelWidth, roomStartY, { width: valueWidth });

  // Gedung
  doc.font('Times-Roman')
     .fillColor('#374151')
     .text('Gedung/Lokasi', leftCol, doc.y + 12, { width: labelWidth, continued: false });
  doc.font('Times-Bold')
     .fillColor('#111827')
     .text(`: ${booking.room.building}`, leftCol + labelWidth, doc.y, { width: valueWidth });

  // Kapasitas
  doc.font('Times-Roman')
     .fillColor('#374151')
     .text('Kapasitas', leftCol, doc.y + 12, { width: labelWidth, continued: false });
  doc.font('Times-Bold')
     .fillColor('#111827')
     .text(`: ${booking.room.capacity} orang`, leftCol + labelWidth, doc.y, { width: valueWidth });

  doc.moveDown(2);

  // ============================================================
  // PURPOSE SECTION
  // ============================================================

  doc.fontSize(13)
     .font('Times-Bold')
     .fillColor(primaryColor)
     .text('III. CATATAN PEMINJAMAN', 60)
     .moveDown(0.5);

  doc.fontSize(10)
     .font('Times-Roman')
     .fillColor('#111827')
     .text(booking.purpose || 'Tidak ada catatan.', 80, doc.y, { 
       width: 455,
       align: 'justify',
       lineGap: 3
     });

  doc.moveDown(2);

  // ============================================================
  // BORROWER INFORMATION SECTION
  // ============================================================

  doc.fontSize(13)
     .font('Times-Bold')
     .fillColor(primaryColor)
     .text('IV. INFORMASI PEMINJAM', 60)
     .moveDown(0.5);

  const borrowerStartY = doc.y;

  doc.fontSize(10)
     .font('Times-Roman')
     .fillColor('#374151');

  // Nama
  doc.text('Nama Lengkap', leftCol, borrowerStartY, { width: labelWidth, continued: false });
  doc.font('Times-Bold')
     .fillColor('#111827')
     .text(`: ${booking.user.name}`, leftCol + labelWidth, borrowerStartY, { width: valueWidth });

  // Email
  doc.font('Times-Roman')
     .fillColor('#374151')
     .text('Email', leftCol, doc.y + 12, { width: labelWidth, continued: false });
  doc.font('Times-Bold')
     .fillColor('#111827')
     .text(`: ${booking.user.email}`, leftCol + labelWidth, doc.y, { width: valueWidth });

  // Role
  doc.font('Times-Roman')
     .fillColor('#374151')
     .text('Status', leftCol, doc.y + 12, { width: labelWidth, continued: false });
  doc.font('Times-Bold')
     .fillColor('#111827')
     .text(`: ${capitalizeRole(booking.user.role)}`, leftCol + labelWidth, doc.y, { width: valueWidth });

  // Faculty (if exists)
  if (booking.user.faculty) {
    doc.font('Times-Roman')
       .fillColor('#374151')
       .text('Fakultas/Organisasi', leftCol, doc.y + 12, { width: labelWidth, continued: false });
    doc.font('Times-Bold')
       .fillColor('#111827')
       .text(`: ${booking.user.faculty}`, leftCol + labelWidth, doc.y, { width: valueWidth });
  }

  doc.moveDown(2);

  // ============================================================
  // INSTRUCTIONS SECTION
  // ============================================================

  doc.fontSize(13)
     .font('Times-Bold')
     .fillColor(primaryColor)
     .text('V. KETENTUAN PEMINJAMAN', 60)
     .moveDown(0.5);

  doc.fontSize(10)
     .font('Times-Roman')
     .fillColor('#374151');

  const instructions = [
    'Peminjam wajib menunjukkan bukti peminjaman ini kepada petugas untuk pengambilan kunci.',
    'Kunci ruangan dapat diambil di bagian administrasi 15 menit sebelum waktu peminjaman.',
    'Peminjam bertanggung jawab atas kebersihan dan kerapian ruangan selama dan setelah penggunaan.',
    'Kunci wajib dikembalikan maksimal 15 menit setelah waktu peminjaman berakhir.',
    'Kerusakan atau kehilangan fasilitas ruangan menjadi tanggung jawab peminjam.',
  ];

  instructions.forEach((instruction, index) => {
    doc.text(`${index + 1}. ${instruction}`, 80, doc.y, { 
      width: 455,
      align: 'justify',
      lineGap: 3
    });
    doc.moveDown(0.5);
  });

  doc.moveDown(1);

  // ============================================================
  // SIGNATURE SECTION
  // ============================================================

  const signatureY = doc.y + 20;

  // Left signature (Peminjam)
  doc.fontSize(10)
     .font('Times-Roman')
     .fillColor('#374151')
     .text('Peminjam,', 80, signatureY);

  doc.moveDown(3);

  doc.font('Times-Bold')
     .fillColor('#111827')
     .text('(                                        )', 80, doc.y);
  
  doc.font('Times-Italic')
     .fontSize(9)
     .fillColor('#6b7280')
     .text('Nama & Tanda Tangan', 80, doc.y + 5);

  // Right signature (Petugas)
  doc.fontSize(10)
     .font('Times-Roman')
     .fillColor('#374151')
     .text('Petugas Administrasi,', 340, signatureY);

  doc.font('Times-Bold')
     .fillColor('#111827')
     .text('(                                        )', 340, signatureY + 60);
  
  doc.font('Times-Italic')
     .fontSize(9)
     .fillColor('#6b7280')
     .text('Nama & Tanda Tangan', 340, signatureY + 65);

  // ============================================================
  // FOOTER SECTION
  // ============================================================

  // Bottom border line
  doc.rect(60, doc.page.height - 80, 475, 1)
     .fill('#e5e7eb');

  // Footer text
  doc.fontSize(8)
     .font('Times-Italic')
     .fillColor('#9ca3af')
     .text(
       `Dicetak pada: ${new Date().toLocaleString('id-ID', { 
         dateStyle: 'long', 
         timeStyle: 'medium' 
       })}`,
       60,
       doc.page.height - 70,
       { align: 'center', width: 475 }
     );

  doc.fontSize(8)
     .font('Times-Bold')
     .fillColor('#6b7280')
     .text(
       'Dokumen ini sah sebagai bukti peminjaman ruangan',
       60,
       doc.page.height - 55,
       { align: 'center', width: 475 }
     );

  // Finalize PDF
  doc.end();
}

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const hours = Math.floor(diffHours);
  const minutes = Math.round((diffHours - hours) * 60);
  
  if (minutes === 0) {
    return `${hours} jam`;
  }
  return `${hours} jam ${minutes} menit`;
}

function capitalizeRole(role: string): string {
  const roleMap: Record<string, string> = {
    'mahasiswa': 'Mahasiswa',
    'dosen': 'Dosen',
    'organisasi': 'Organisasi',
    'admin': 'Administrator'
  };
  return roleMap[role] || role;
}
