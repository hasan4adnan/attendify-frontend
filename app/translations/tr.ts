export const translations = {
  // Common
  common: {
    next: 'İleri',
    back: 'Geri',
    submit: 'Gönder',
    cancel: 'İptal',
    continue: 'Devam Et',
    loading: 'Yükleniyor...',
  },

  // Login Page
  login: {
    title: 'Tekrar hoş geldiniz',
    subtitle: 'Attendify\'a devam etmek için giriş yapın',
    emailLabel: 'E-posta adresi',
    emailPlaceholder: 'isim@sirket.com',
    passwordLabel: 'Şifre',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'Unuttunuz mu?',
    signIn: 'Giriş yap',
    newToAttendify: 'Attendify\'a yeni misiniz?',
    createAccount: 'Hesap oluştur',
    termsAndPrivacy: 'Giriş yaparak ',
    termsOfService: 'Hizmet Şartlarımızı',
    and: ' ve ',
    privacyPolicy: 'Gizlilik Politikamızı',
    agreeToTerms: ' kabul etmiş olursunuz',
  },

  // Signup Page
  signup: {
    welcome: 'Attendify\'a Hoş Geldiniz',
    introDescription: 'Güçlü ve sezgisel platformumuzla katılım yönetiminizi kolaylaştırın. İş akışlarını basitleştirmek için Attendify\'ı kullanan binlerce organizasyona katılın.',
    whatYouGet: 'Neler alacaksınız:',
    benefit1: 'Gerçek zamanlı katılım takibi',
    benefit2: 'Otomatik raporlar ve analitik',
    benefit3: 'Güvenli ve güvenilir platform',
    
    // Email slide
    emailTitle: 'Hadi başlayalım',
    emailSubtitle: 'Hesabınızı oluşturmak için e-posta adresinizi girin',
    
    // Name slide
    nameTitle: 'Bize kendinizden bahsedin',
    nameSubtitle: 'Size nasıl hitap edelim?',
    firstNameLabel: 'Ad',
    firstNamePlaceholder: 'Ahmet',
    lastNameLabel: 'Soyad',
    lastNamePlaceholder: 'Yılmaz',
    
    // Password slide
    passwordTitle: 'Şifre oluşturun',
    passwordSubtitle: 'Hesabınızı güvence altına almak için güçlü bir şifre seçin',
    passwordLabel: 'Şifre',
    passwordPlaceholder: '••••••••',
    confirmPasswordLabel: 'Şifreyi Onayla',
    confirmPasswordPlaceholder: '••••••••',
    passwordMinLength: 'Şifre en az 8 karakter olmalıdır',
    passwordsDoNotMatch: 'Şifreler eşleşmiyor',
    
    // Verification slide
    verificationTitle: 'E-postanızı doğrulayın',
    verificationSubtitle: 'E-postanıza bir doğrulama kodu gönderdik ',
    verificationSubtitleEnd: 'Lütfen aşağıya girin.',
    verificationCodeLabel: 'Doğrulama Kodu',
    verificationCodePlaceholder: '000000',
    didntReceiveCode: 'Kodu almadınız mı?',
    resend: 'Yeniden Gönder',
    completeSignUp: 'Kayıt Olmayı Tamamla',
    
    // Common
    step: 'Adım',
    of: '/',
    alreadyHaveAccount: 'Zaten hesabınız var mı?',
    signIn: 'Giriş yap',
  },

  // Branding
  branding: {
    tagline: 'Güçlü ve sezgisel platformumuzla katılım yönetiminizi kolaylaştırın.',
    uptime: 'Çalışma Süresi',
    users: 'Kullanıcı',
  },

  // Dashboard
  dashboard: {
    title: 'Kontrol Paneli',
    searchPlaceholder: 'Ara...',
    todayAttendance: 'Bugünün Katılımı',
    totalStudents: 'Toplam Öğrenci',
    activeSessions: 'Aktif Oturumlar',
    attendanceRate: 'Katılım Oranı',
    attendanceOverview: 'Katılım Genel Bakış',
    attendanceDistribution: 'Katılım Dağılımı',
    generateReport: 'Rapor Oluştur',
    menu: {
      dashboard: 'Kontrol Paneli',
      students: 'Öğrenciler',
      attendance: 'Katılım',
      reports: 'Raporlar',
      settings: 'Ayarlar',
      logout: 'Çıkış',
    },
  },

  // Students Page
  students: {
    title: 'Öğrenciler',
    subtitle: 'Sınıfınızdaki öğrencileri ekleyin ve yönetin',
    studentList: 'Öğrenci Listesi',
    addStudent: 'Öğrenci Ekle',
    searchPlaceholder: 'Öğrenci ara...',
    firstName: 'İsim',
    lastName: 'Soyisim',
    studentNumber: 'Öğrenci No',
    firstNamePlaceholder: 'Öğrenci adı',
    lastNamePlaceholder: 'Öğrenci soyadı',
    studentNumberPlaceholder: 'Öğrenci numarası',
    actions: 'İşlem',
    edit: 'Düzenle',
    delete: 'Sil',
    noStudentsFound: 'Kayıtlı öğrenci bulunamadı',
    addStudentButton: 'Öğrenci Ekle',
    editStudentTitle: 'Öğrenci Bilgilerini Düzenle',
    deleteStudentTitle: 'Bu öğrenciyi silmek istediğinize emin misiniz?',
    studentDetails: 'Öğrenci Özeti',
    name: 'Adı',
    studentNum: 'Öğrenci No',
    cancel: 'Vazgeç',
    save: 'Kaydet',
    close: 'Kapat',
    yes: 'Evet',
    no: 'Hayır',
    studentAdded: 'Öğrenci başarıyla eklendi!',
    studentUpdated: 'Öğrenci bilgileri güncellendi!',
    studentDeleted: 'Öğrenci silindi!',
  },
};

export type TranslationKey = keyof typeof translations;

