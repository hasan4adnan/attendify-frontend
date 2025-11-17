'use client';

import React, { useState } from 'react';

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
};

const initialStudents: Student[] = [
  { id: 1, firstName: 'Ahmet', lastName: 'Yılmaz', studentNumber: '1001' },
  { id: 2, firstName: 'Ayşe', lastName: 'Demir', studentNumber: '1002' },
  { id: 3, firstName: 'Mehmet', lastName: 'Kaya', studentNumber: '1003' },
];

const Students = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState<{ open: boolean, student?: Student }>({ open: false });
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editStudentNumber, setEditStudentNumber] = useState('');
  const [notification, setNotification] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // NEW STATE: Delete modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, student?: Student }>({
    open: false,
  });

  // NEW STATE: Detail modal
  const [detailModal, setDetailModal] = useState<{ open: boolean, student?: Student }>({
    open: false,
  });

  // Add Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !studentNumber) return;

    setStudents([
      ...students,
      {
        id: students.length + 1,
        firstName,
        lastName,
        studentNumber,
      },
    ]);

    setFirstName('');
    setLastName('');
    setStudentNumber('');

    setNotification({ show: true, message: 'Öğrenci başarıyla eklendi!' });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  // Open Edit Modal
  const openEditModal = (student: Student) => {
    setEditFirstName(student.firstName);
    setEditLastName(student.lastName);
    setEditStudentNumber(student.studentNumber);
    setEditModal({ open: true, student });
  };

  // Save Edit
  const handleEditSave = () => {
    if (!editModal.student) return;

    setStudents(students.map(s =>
      s.id === editModal.student!.id
        ? { ...s, firstName: editFirstName, lastName: editLastName, studentNumber: editStudentNumber }
        : s
    ));

    setEditModal({ open: false });

    setNotification({ show: true, message: 'Öğrenci bilgileri güncellendi!' });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  // Search + Pagination
  const filteredStudents = students.filter(s =>
    s.firstName.toLowerCase().includes(search.toLowerCase()) ||
    s.lastName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentNumber.includes(search)
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Title + Tabs */}
      <div className="w-full border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] px-0 md:px-8 pt-8 pb-0 flex flex-col gap-0">
        <div className="flex flex-col items-center gap-2 px-6 md:px-0">
          <h2 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Öğrenciler
          </h2>
          <p className="text-base mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Sınıfınızdaki öğrencileri ekleyin ve yönetin.
          </p>
          <div className="flex gap-2 border-b border-[var(--border-primary)] justify-center">
            <button
              className={`px-4 py-2 text-base font-medium border-b-2 transition-all duration-200 focus:outline-none 
                ${activeTab === 'list' ? 'border-[#0046FF] text-[#0046FF]' : 'border-transparent text-[var(--text-secondary)] hover:text-[#0046FF]'}`}
              onClick={() => setActiveTab('list')}
            >
              Öğrenci Listesi
            </button>

            <button
              className={`px-4 py-2 text-base font-medium border-b-2 transition-all duration-200 focus:outline-none 
                ${activeTab === 'add' ? 'border-[#0046FF] text-[#0046FF]' : 'border-transparent text-[var(--text-secondary)] hover:text-[#0046FF]'}`}
              onClick={() => setActiveTab('add')}
            >
              Öğrenci Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        {/* ADD TAB */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddStudent} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow p-8 max-w-2xl mx-auto animate-fadeIn">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  İsim
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onFocus={() => setFocused('firstName')}
                  onBlur={() => setFocused(null)}
                  required
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-[#0046FF]/30 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: focused === 'firstName' ? '#0046FF' : 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Öğrenci adı"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Soyisim
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  onFocus={() => setFocused('lastName')}
                  onBlur={() => setFocused(null)}
                  required
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-[#0046FF]/30 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: focused === 'lastName' ? '#0046FF' : 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Öğrenci soyadı"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Öğrenci No
                </label>
                <input
                  type="text"
                  value={studentNumber}
                  onChange={e => setStudentNumber(e.target.value)}
                  onFocus={() => setFocused('studentNumber')}
                  onBlur={() => setFocused(null)}
                  required
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-[#0046FF]/30 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: focused === 'studentNumber' ? '#0046FF' : 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Öğrenci numarası"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-8 w-full py-3 px-6 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 transition-all duration-300"
            >
              Öğrenci Ekle
            </button>
          </form>
        )}

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow p-8 animate-fadeIn">

            {/* Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Öğrenci ara..."
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#0046FF]/20 text-[var(--text-primary)]"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-quaternary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
              <table className="min-w-full divide-y divide-[var(--border-primary)]">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">İsim</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Soyisim</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Öğrenci No</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">İşlem</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-primary)]">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-tertiary)] text-base">
                        Kayıtlı öğrenci bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map(student => (
                      <tr
                        key={student.id}
                        className="hover:bg-[#f4f7fd]/40 transition-colors cursor-pointer"
                        onClick={() => setDetailModal({ open: true, student })}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--text-primary)] font-medium">{student.firstName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--text-primary)]">{student.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--text-primary)]">{student.studentNumber}</td>

                        <td className="px-6 py-4 whitespace-nowrap text-center flex items-center gap-3 justify-center">

                          {/* Edit */}
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(student); }}
                            className="px-3 py-1.5 rounded-lg bg-[#0046FF]/10 text-[#0046FF] font-semibold text-xs hover:bg-[#0046FF]/20 transition-all border border-transparent hover:border-[#0046FF]"
                          >
                            Düzenle
                          </button>

                          {/* Delete */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, student }); }}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 font-semibold text-xs hover:bg-red-500/20 transition-all border border-transparent hover:border-red-500"
                          >
                            Sil
                          </button>

                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`w-9 h-9 flex items-center justify-center rounded-full border text-base font-semibold transition-all duration-200 
                    ${currentPage === page
                        ? 'bg-[#0046FF] text-white border-[#0046FF] scale-110 shadow'
                        : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:bg-[#0046FF]/10 hover:text-[#0046FF]'
                      }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-xl p-8 w-full max-w-md animate-fadeIn">

            <h3 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
              Öğrenci Bilgilerini Düzenle
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>İsim</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={e => setEditFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-tertiary)] focus:ring-2 focus:ring-[#0046FF]/20 focus:outline-none text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Soyisim</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={e => setEditLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-tertiary)] focus:ring-2 focus:ring-[#0046FF]/20 focus:outline-none text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Öğrenci No</label>
                <input
                  type="text"
                  value={editStudentNumber}
                  onChange={e => setEditStudentNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-tertiary)] focus:ring-2 focus:ring-[#0046FF]/20 focus:outline-none text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8">
              <button
                className="px-5 py-2 rounded-lg border border-[var(--border-primary)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
                onClick={() => setEditModal({ open: false })}
              >
                Vazgeç
              </button>

              <button
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold shadow hover:shadow-lg focus:ring-2 focus:ring-[#0046FF] transition-all"
                onClick={handleEditSave}
              >
                Kaydet
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-xl p-8 w-full max-w-md animate-fadeIn">

            <h3 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
              Bu öğrenciyi silmek istediğinize emin misiniz?
            </h3>

            <p className="text-center mb-6 text-[var(--text-secondary)] text-base">
              {deleteModal.student?.firstName} {deleteModal.student?.lastName} – {deleteModal.student?.studentNumber}
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] bg-transparent hover:bg-[var(--bg-tertiary)] transition-all"
                onClick={() => setDeleteModal({ open: false })}
              >
                Hayır
              </button>

              <button
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold shadow hover:shadow-lg transition-all"
                onClick={() => {
                  setStudents(students.filter(s => s.id !== deleteModal.student!.id));
                  setDeleteModal({ open: false });
                  setNotification({ show: true, message: 'Öğrenci silindi!' });
                  setTimeout(() => setNotification({ show: false, message: '' }), 2000);
                }}
              >
                Evet
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-xl p-8 w-full max-w-md animate-fadeIn">

            <h3
              className="text-xl font-bold mb-6 text-center"
              style={{ color: 'var(--text-primary)' }}
            >
              Öğrenci Özeti
            </h3>

            <div className="space-y-4">
              <p className="text-[var(--text-primary)]">
                <span className="font-semibold text-[var(--text-secondary)]">Adı:</span> {detailModal.student?.firstName}
              </p>

              <p className="text-[var(--text-primary)]">
                <span className="font-semibold text-[var(--text-secondary)]">Soyadı:</span> {detailModal.student?.lastName}
              </p>

              <p className="text-[var(--text-primary)]">
                <span className="font-semibold text-[var(--text-secondary)]">Öğrenci No:</span> {detailModal.student?.studentNumber}
              </p>
            </div>

            <div className="flex justify-center mt-8">
              <button
                className="px-5 py-2 rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
                onClick={() => setDetailModal({ open: false })}
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      {notification.show && (
        <div className="fixed left-6 bottom-6 z-50 animate-fadeIn">
          <div className="px-6 py-4 rounded-xl shadow-lg bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold text-base">
            {notification.message}
          </div>
        </div>
      )}

    </div>
  );
};

export default Students;
