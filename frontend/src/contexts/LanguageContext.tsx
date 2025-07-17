import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language, Translation } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Translation> = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      reservations: 'Reservations',
      tables: 'Tables',
      customers: 'Customers',
      reports: 'Reports',
      workingHours: 'Working Hours',
      tableManagement: 'Table Management'
    },
    areas: {
      bar: 'Bar Area',
      inside: 'Inside Dining',
      outside: 'Outside Patio'
    },
    reservation: {
      newReservation: 'New Reservation',
      editReservation: 'Edit Reservation',
      customerName: 'Customer Name',
      phoneNumber: 'Phone Number',
      email: 'Email Address',
      partySize: 'Party Size',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      specialRequests: 'Special Requests',
      confirmReservation: 'Confirm Reservation',
      cancelReservation: 'Cancel Reservation',
      searchReservations: 'Search reservations...',
      reservationSummary: 'Reservation Summary',
      totalCapacity: 'Total Capacity',
      noReservationsFound: 'No reservations found',
      adjustFilters: 'Try adjusting your search or filters'
    },
    table: {
      available: 'Available',
      reserved: 'Reserved',
      occupied: 'Occupied',
      maintenance: 'Maintenance',
      capacity: 'Capacity',
      selectTables: 'Selected Tables',
      tableManagement: 'Table Management',
      addTable: 'Add Table',
      editTable: 'Edit Table',
      deleteTable: 'Delete Table',
      tableName: 'Table Name',
      minCapacity: 'Min Capacity',
      maxCapacity: 'Max Capacity',
      position: 'Position',
      adjustable: 'Adjustable',
      active: 'Active',
      inactive: 'Inactive',
      activate: 'Activate',
      deactivate: 'Deactivate',
      noTablesConfigured: 'No tables configured',
      clickAddTable: 'Click "Add Table" to get started',
      dragToReposition: 'Drag tables to reposition them',
      exportTables: 'Export Tables',
      loadSampleTables: 'Load Sample Tables'
    },
    time: {
      hours: 'hours',
      minutes: 'minutes',
      from: 'From',
      to: 'To',
      today: 'Today',
      tomorrow: 'Tomorrow',
      openTime: 'Open Time',
      closeTime: 'Close Time',
      workingHours: 'Working Hours',
      timeSlot: 'Time Slot',
      noAvailableTimes: 'No available times',
      restaurantClosed: 'Restaurant is closed'
    },
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      create: 'Create',
      update: 'Update',
      close: 'Close',
      open: 'Open',
      submit: 'Submit',
      reset: 'Reset',
      clear: 'Clear',
      copy: 'Copy',
      copyToAllDays: 'Copy to all days'
    },
    status: {
      confirmed: 'Confirmed',
      seated: 'Seated',
      completed: 'Completed',
      cancelled: 'Cancelled',
      noShow: 'No Show',
      allStatus: 'All Status',
      allDates: 'All Dates'
    },
    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      signInRequired: 'Sign In Required',
      signInWithGoogle: 'Sign in with Google',
      signingIn: 'Signing in...',
      authenticationRequired: 'Authentication Required',
      adminAccessRequired: 'Admin Access Required',
      accessDenied: 'Access Denied',
      adminAuthRequired: 'Administrator authentication is required to access Table Management features.',
      pleaseSignIn: 'Please sign in to continue.',
      contactAdmin: 'Please contact your system administrator to request access to Table Management features.',
      signedInAs: 'You are signed in as',
      adminPrivileges: 'but you don\'t have administrator privileges for this feature.',
      administrator: 'Administrator',
      secureAuth: 'We use Google OAuth for secure sign-in. Your credentials are never stored on our servers.',
      setupRequired: 'Setup Required',
      googleClientIdNotConfigured: 'Google Client ID not configured',
      invalidClientIdFormat: 'Invalid Google Client ID format',
      emailNotVerified: 'Email not verified',
      signInFailed: 'Sign-in failed',
      authenticationFailed: 'Authentication failed. Please try again.'
    },
    config: {
      restaurantConfiguration: 'Restaurant Configuration',
      generalSettings: 'General Settings',
      restaurantName: 'Restaurant Name',
      timeSlotDuration: 'Time Slot Duration',
      reservationDuration: 'Reservation Duration',
      advanceBooking: 'Advance Booking',
      workingHours: 'Working Hours',
      configurationSaved: 'Configuration saved successfully!',
      failedToSave: 'Failed to save configuration. Please try again.',
      loadingConfiguration: 'Loading configuration...',
      saveConfiguration: 'Save Configuration',
      saving: 'Saving...',
      minutes: 'minutes',
      week: 'week',
      weeks: 'weeks',
      month: 'month',
      months: 'months'
    },
    dashboard: {
      todaysReservations: 'Today\'s Reservations',
      totalGuests: 'Total Guests',
      confirmedReservations: 'Confirmed',
      occupiedTables: 'Occupied Tables',
      upcomingReservations: 'Upcoming Reservations',
      noUpcomingReservations: 'No upcoming reservations',
      guests: 'guests'
    },
    messages: {
      reservationCreated: 'Reservation created successfully',
      reservationUpdated: 'Reservation updated successfully',
      reservationCancelled: 'Reservation cancelled',
      reservationDeleted: 'Reservation deleted',
      noTablesAvailable: 'No tables available for selected time',
      conflictDetected: 'Conflict detected with existing reservation',
      tablesSaved: 'Tables saved successfully',
      tablesCleared: 'Tables cleared successfully',
      defaultPasswordSet: '',
      passwordVerified: 'Password verified successfully',
      invalidPassword: 'Invalid password',
      databaseError: 'Database error',
      configurationCreated: 'Default restaurant configuration created',
      selectDate: 'Selected date is not available for booking',
      noAvailableTimeSlots: 'No available time slots for this date'
    },
    password: {
      enterPassword: 'Enter Password',
      administratorPassword: 'Administrator Password',
      enterPasswordPlaceholder: 'Enter password',
      defaultPassword: 'Default Password',
      storedInDatabase: '(stored in database)',
      accessRequired: 'Access to Table Management requires administrator privileges. Please enter the password to continue.',
      verifying: 'Verifying...',
      access: 'Access'
    },
    forms: {
      required: 'Required',
      optional: 'Optional',
      person: 'person',
      people: 'people',
      selectArea: 'Select Seating Area',
      adjustableCapacity: 'Adjustable capacity',
      xPosition: 'X Position',
      yPosition: 'Y Position'
    },
    errors: {
      missingRequiredFields: 'Missing required fields',
      failedToCreate: 'Failed to create',
      failedToUpdate: 'Failed to update',
      failedToDelete: 'Failed to delete',
      failedToLoad: 'Failed to load',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
      serverError: 'Server error',
      networkError: 'Network error',
      unknownError: 'Unknown error occurred'
    },
    common: {
      loading: 'Loading...',
      noData: 'No data available',
      refresh: 'Refresh',
      retry: 'Retry',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      home: 'Home',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy',
      terms: 'Terms',
      version: 'Version',
      copyright: 'Copyright',
      allRightsReserved: 'All rights reserved'
    }
  },
  he: {
    nav: {
      dashboard: 'לוח בקרה',
      reservations: 'הזמנות',
      tables: 'שולחנות',
      customers: 'לקוחות',
      reports: 'דוחות',
      workingHours: 'שעות פעילות',
      tableManagement: 'ניהול שולחנות'
    },
    areas: {
      bar: 'אזור הבר',
      inside: 'אזור פנימי',
      outside: 'מרפסת חיצונית'
    },
    reservation: {
      newReservation: 'הזמנה חדשה',
      editReservation: 'עריכת הזמנה',
      customerName: 'שם הלקוח',
      phoneNumber: 'מספר טלפון',
      email: 'כתובת אימייל',
      partySize: 'מספר אורחים',
      date: 'תאריך',
      time: 'שעה',
      duration: 'משך זמן',
      specialRequests: 'בקשות מיוחדות',
      confirmReservation: 'אישור הזמנה',
      cancelReservation: 'ביטול הזמנה',
      searchReservations: 'חיפוש הזמנות...',
      reservationSummary: 'סיכום הזמנה',
      totalCapacity: 'קיבולת כוללת',
      noReservationsFound: 'לא נמצאו הזמנות',
      adjustFilters: 'נסה לשנות את החיפוש או הסינון'
    },
    table: {
      available: 'זמין',
      reserved: 'מוזמן',
      occupied: 'תפוס',
      maintenance: 'תחזוקה',
      capacity: 'קיבולת',
      selectTables: 'שולחנות נבחרים',
      tableManagement: 'ניהול שולחנות',
      addTable: 'הוסף שולחן',
      editTable: 'ערוך שולחן',
      deleteTable: 'מחק שולחן',
      tableName: 'שם השולחן',
      minCapacity: 'קיבולת מינימלית',
      maxCapacity: 'קיבולת מקסימלית',
      position: 'מיקום',
      adjustable: 'ניתן להתאמה',
      active: 'פעיל',
      inactive: 'לא פעיל',
      activate: 'הפעל',
      deactivate: 'בטל הפעלה',
      noTablesConfigured: 'לא הוגדרו שולחנות',
      clickAddTable: 'לחץ על "הוסף שולחן" כדי להתחיל',
      dragToReposition: 'גרור שולחנות כדי לשנות מיקום',
      exportTables: 'ייצא שולחנות',
      loadSampleTables: 'טען שולחנות לדוגמה'
    },
    time: {
      hours: 'שעות',
      minutes: 'דקות',
      from: 'מ',
      to: 'עד',
      today: 'היום',
      tomorrow: 'מחר',
      openTime: 'שעת פתיחה',
      closeTime: 'שעת סגירה',
      workingHours: 'שעות פעילות',
      timeSlot: 'משבצת זמן',
      noAvailableTimes: 'אין זמנים זמינים',
      restaurantClosed: 'המסעדה סגורה'
    },
    days: {
      monday: 'יום שני',
      tuesday: 'יום שלישי',
      wednesday: 'יום רביעי',
      thursday: 'יום חמישי',
      friday: 'יום שישי',
      saturday: 'יום שבת',
      sunday: 'יום ראשון'
    },
    actions: {
      save: 'שמור',
      cancel: 'ביטול',
      delete: 'מחק',
      edit: 'ערוך',
      confirm: 'אישור',
      search: 'חפש',
      filter: 'סנן',
      export: 'ייצא',
      create: 'צור',
      update: 'עדכן',
      close: 'סגור',
      open: 'פתח',
      submit: 'שלח',
      reset: 'איפוס',
      clear: 'נקה',
      copy: 'העתק',
      copyToAllDays: 'העתק לכל הימים'
    },
    status: {
      confirmed: 'מאושר',
      seated: 'מושב',
      completed: 'הושלם',
      cancelled: 'בוטל',
      noShow: 'לא הגיע',
      allStatus: 'כל הסטטוסים',
      allDates: 'כל התאריכים'
    },
    auth: {
      signIn: 'התחבר',
      signOut: 'התנתק',
      signInRequired: 'נדרשת התחברות',
      signInWithGoogle: 'התחבר עם Google',
      signingIn: 'מתחבר...',
      authenticationRequired: 'נדרש אימות',
      adminAccessRequired: 'נדרשת גישת מנהל',
      accessDenied: 'הגישה נדחתה',
      adminAuthRequired: 'נדרש אימות מנהל כדי לגשת לתכונות ניהול השולחנות.',
      pleaseSignIn: 'אנא התחבר כדי להמשיך.',
      contactAdmin: 'אנא פנה למנהל המערכת כדי לבקש גישה לתכונות ניהול השולחנות.',
      signedInAs: 'מחובר כ',
      adminPrivileges: 'אך אין לך הרשאות מנהל לתכונה זו.',
      administrator: 'מנהל',
      secureAuth: 'אנו משתמשים ב-Google OAuth לכניסה מאובטחת. הפרטים שלך לא נשמרים בשרתים שלנו.',
      setupRequired: 'נדרשת הגדרה',
      googleClientIdNotConfigured: 'Google Client ID לא מוגדר',
      invalidClientIdFormat: 'פורמט Google Client ID לא תקין',
      emailNotVerified: 'האימייל לא מאומת',
      signInFailed: 'ההתחברות נכשלה',
      authenticationFailed: 'האימות נכשל. אנא נסה שוב.'
    },
    config: {
      restaurantConfiguration: 'הגדרות המסעדה',
      generalSettings: 'הגדרות כלליות',
      restaurantName: 'שם המסעדה',
      timeSlotDuration: 'משך משבצת זמן',
      reservationDuration: 'משך הזמנה',
      advanceBooking: 'הזמנה מראש',
      workingHours: 'שעות פעילות',
      configurationSaved: 'ההגדרות נשמרו בהצלחה!',
      failedToSave: 'שמירת ההגדרות נכשלה. אנא נסה שוב.',
      loadingConfiguration: 'טוען הגדרות...',
      saveConfiguration: 'שמור הגדרות',
      saving: 'שומר...',
      minutes: 'דקות',
      week: 'שבוע',
      weeks: 'שבועות',
      month: 'חודש',
      months: 'חודשים'
    },
    dashboard: {
      todaysReservations: 'הזמנות היום',
      totalGuests: 'סך האורחים',
      confirmedReservations: 'מאושרות',
      occupiedTables: 'שולחנות תפוסים',
      upcomingReservations: 'הזמנות קרובות',
      noUpcomingReservations: 'אין הזמנות קרובות',
      guests: 'אורחים'
    },
    messages: {
      reservationCreated: 'ההזמנה נוצרה בהצלחה',
      reservationUpdated: 'ההזמנה עודכנה בהצלחה',
      reservationCancelled: 'ההזמנה בוטלה',
      reservationDeleted: 'ההזמנה נמחקה',
      noTablesAvailable: 'אין שולחנות זמינים בזמן הנבחר',
      conflictDetected: 'זוהה קונפליקט עם הזמנה קיימת',
      tablesSaved: 'השולחנות נשמרו בהצלחה',
      tablesCleared: 'השולחנות נוקו בהצלחה',
      defaultPasswordSet: '',
      passwordVerified: 'הסיסמה אומתה בהצלחה',
      invalidPassword: 'סיסמה שגויה',
      databaseError: 'שגיאת מסד נתונים',
      configurationCreated: 'הגדרות ברירת מחדל של המסעדה נוצרו',
      selectDate: 'התאריך הנבחר לא זמין להזמנה',
      noAvailableTimeSlots: 'אין משבצות זמן זמינות לתאריך זה'
    },
    password: {
      enterPassword: 'הזן סיסמה',
      administratorPassword: 'סיסמת מנהל',
      enterPasswordPlaceholder: 'הזן סיסמה',
      defaultPassword: 'סיסמת ברירת מחדל',
      storedInDatabase: '(שמורה במסד הנתונים)',
      accessRequired: 'גישה לניהול שולחנות דורשת הרשאות מנהל. אנא הזן את הסיסמה כדי להמשיך.',
      verifying: 'מאמת...',
      access: 'גישה'
    },
    forms: {
      required: 'חובה',
      optional: 'אופציונלי',
      person: 'אדם',
      people: 'אנשים',
      selectArea: 'בחר אזור ישיבה',
      adjustableCapacity: 'קיבולת ניתנת להתאמה',
      xPosition: 'מיקום X',
      yPosition: 'מיקום Y'
    },
    errors: {
      missingRequiredFields: 'חסרים שדות חובה',
      failedToCreate: 'יצירה נכשלה',
      failedToUpdate: 'עדכון נכשל',
      failedToDelete: 'מחיקה נכשלה',
      failedToLoad: 'טעינה נכשלה',
      notFound: 'לא נמצא',
      unauthorized: 'לא מורשה',
      forbidden: 'אסור',
      serverError: 'שגיאת שרת',
      networkError: 'שגיאת רשת',
      unknownError: 'אירעה שגיאה לא ידועה'
    },
    common: {
      loading: 'טוען...',
      noData: 'אין נתונים זמינים',
      refresh: 'רענן',
      retry: 'נסה שוב',
      back: 'חזור',
      next: 'הבא',
      previous: 'הקודם',
      home: 'בית',
      settings: 'הגדרות',
      help: 'עזרה',
      about: 'אודות',
      contact: 'צור קשר',
      privacy: 'פרטיות',
      terms: 'תנאים',
      version: 'גרסה',
      copyright: 'זכויות יוצרים',
      allRightsReserved: 'כל הזכויות שמורות'
    }
  },
  ru: {
    nav: {
      dashboard: 'Панель управления',
      reservations: 'Бронирования',
      tables: 'Столики',
      customers: 'Клиенты',
      reports: 'Отчёты',
      workingHours: 'Рабочие часы',
      tableManagement: 'Управление столиками'
    },
    areas: {
      bar: 'Барная зона',
      inside: 'Внутренний зал',
      outside: 'Летняя терраса'
    },
    reservation: {
      newReservation: 'Новое бронирование',
      editReservation: 'Редактировать бронирование',
      customerName: 'Имя клиента',
      phoneNumber: 'Номер телефона',
      email: 'Адрес электронной почты',
      partySize: 'Количество гостей',
      date: 'Дата',
      time: 'Время',
      duration: 'Продолжительность',
      specialRequests: 'Особые пожелания',
      confirmReservation: 'Подтвердить бронирование',
      cancelReservation: 'Отменить бронирование',
      searchReservations: 'Поиск бронирований...',
      reservationSummary: 'Сводка бронирования',
      totalCapacity: 'Общая вместимость',
      noReservationsFound: 'Бронирования не найдены',
      adjustFilters: 'Попробуйте изменить поиск или фильтры'
    },
    table: {
      available: 'Свободен',
      reserved: 'Забронирован',
      occupied: 'Занят',
      maintenance: 'Обслуживание',
      capacity: 'Вместимость',
      selectTables: 'Выбранные столики',
      tableManagement: 'Управление столиками',
      addTable: 'Добавить столик',
      editTable: 'Редактировать столик',
      deleteTable: 'Удалить столик',
      tableName: 'Название столика',
      minCapacity: 'Мин. вместимость',
      maxCapacity: 'Макс. вместимость',
      position: 'Позиция',
      adjustable: 'Регулируемый',
      active: 'Активный',
      inactive: 'Неактивный',
      activate: 'Активировать',
      deactivate: 'Деактивировать',
      noTablesConfigured: 'Столики не настроены',
      clickAddTable: 'Нажмите "Добавить столик" для начала',
      dragToReposition: 'Перетащите столики для изменения позиции',
      exportTables: 'Экспорт столиков',
      loadSampleTables: 'Загрузить образцы столиков'
    },
    time: {
      hours: 'часов',
      minutes: 'минут',
      from: 'с',
      to: 'до',
      today: 'Сегодня',
      tomorrow: 'Завтра',
      openTime: 'Время открытия',
      closeTime: 'Время закрытия',
      workingHours: 'Рабочие часы',
      timeSlot: 'Временной слот',
      noAvailableTimes: 'Нет доступного времени',
      restaurantClosed: 'Ресторан закрыт'
    },
    days: {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье'
    },
    actions: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      confirm: 'Подтвердить',
      search: 'Поиск',
      filter: 'Фильтр',
      export: 'Экспорт',
      create: 'Создать',
      update: 'Обновить',
      close: 'Закрыть',
      open: 'Открыть',
      submit: 'Отправить',
      reset: 'Сброс',
      clear: 'Очистить',
      copy: 'Копировать',
      copyToAllDays: 'Копировать на все дни'
    },
    status: {
      confirmed: 'Подтверждён',
      seated: 'Размещён',
      completed: 'Завершён',
      cancelled: 'Отменён',
      noShow: 'Не явился',
      allStatus: 'Все статусы',
      allDates: 'Все даты'
    },
    auth: {
      signIn: 'Войти',
      signOut: 'Выйти',
      signInRequired: 'Требуется вход',
      signInWithGoogle: 'Войти через Google',
      signingIn: 'Вход...',
      authenticationRequired: 'Требуется аутентификация',
      adminAccessRequired: 'Требуется доступ администратора',
      accessDenied: 'Доступ запрещён',
      adminAuthRequired: 'Требуется аутентификация администратора для доступа к функциям управления столиками.',
      pleaseSignIn: 'Пожалуйста, войдите для продолжения.',
      contactAdmin: 'Пожалуйста, обратитесь к системному администратору для запроса доступа к функциям управления столиками.',
      signedInAs: 'Вы вошли как',
      adminPrivileges: 'но у вас нет прав администратора для этой функции.',
      administrator: 'Администратор',
      secureAuth: 'Мы используем Google OAuth для безопасного входа. Ваши учётные данные никогда не сохраняются на наших серверах.',
      setupRequired: 'Требуется настройка',
      googleClientIdNotConfigured: 'Google Client ID не настроен',
      invalidClientIdFormat: 'Неверный формат Google Client ID',
      emailNotVerified: 'Email не подтверждён',
      signInFailed: 'Вход не удался',
      authenticationFailed: 'Аутентификация не удалась. Пожалуйста, попробуйте снова.'
    },
    config: {
      restaurantConfiguration: 'Конфигурация ресторана',
      generalSettings: 'Общие настройки',
      restaurantName: 'Название ресторана',
      timeSlotDuration: 'Продолжительность временного слота',
      reservationDuration: 'Продолжительность бронирования',
      advanceBooking: 'Предварительное бронирование',
      workingHours: 'Рабочие часы',
      configurationSaved: 'Конфигурация успешно сохранена!',
      failedToSave: 'Не удалось сохранить конфигурацию. Пожалуйста, попробуйте снова.',
      loadingConfiguration: 'Загрузка конфигурации...',
      saveConfiguration: 'Сохранить конфигурацию',
      saving: 'Сохранение...',
      minutes: 'минут',
      week: 'неделя',
      weeks: 'недель',
      month: 'месяц',
      months: 'месяцев'
    },
    dashboard: {
      todaysReservations: 'Сегодняшние бронирования',
      totalGuests: 'Всего гостей',
      confirmedReservations: 'Подтверждённые',
      occupiedTables: 'Занятые столики',
      upcomingReservations: 'Предстоящие бронирования',
      noUpcomingReservations: 'Нет предстоящих бронирований',
      guests: 'гостей'
    },
    messages: {
      reservationCreated: 'Бронирование успешно создано',
      reservationUpdated: 'Бронирование успешно обновлено',
      reservationCancelled: 'Бронирование отменено',
      reservationDeleted: 'Бронирование удалено',
      noTablesAvailable: 'Нет свободных столиков на выбранное время',
      conflictDetected: 'Обнаружен конфликт с существующим бронированием',
      tablesSaved: 'Столики успешно сохранены',
      tablesCleared: 'Столики успешно очищены',
      defaultPasswordSet: '',
      passwordVerified: 'Пароль успешно проверен',
      invalidPassword: 'Неверный пароль',
      databaseError: 'Ошибка базы данных',
      configurationCreated: 'Создана конфигурация ресторана по умолчанию',
      selectDate: 'Выбранная дата недоступна для бронирования',
      noAvailableTimeSlots: 'Нет доступных временных слотов для этой даты'
    },
    password: {
      enterPassword: 'Введите пароль',
      administratorPassword: 'Пароль администратора',
      enterPasswordPlaceholder: 'Введите пароль',
      defaultPassword: 'Пароль по умолчанию',
      storedInDatabase: '(сохранён в базе данных)',
      accessRequired: 'Доступ к управлению столиками требует прав администратора. Пожалуйста, введите пароль для продолжения.',
      verifying: 'Проверка...',
      access: 'Доступ'
    },
    forms: {
      required: 'Обязательно',
      optional: 'Необязательно',
      person: 'человек',
      people: 'человек',
      selectArea: 'Выберите зону размещения',
      adjustableCapacity: 'Регулируемая вместимость',
      xPosition: 'Позиция X',
      yPosition: 'Позиция Y'
    },
    errors: {
      missingRequiredFields: 'Отсутствуют обязательные поля',
      failedToCreate: 'Не удалось создать',
      failedToUpdate: 'Не удалось обновить',
      failedToDelete: 'Не удалось удалить',
      failedToLoad: 'Не удалось загрузить',
      notFound: 'Не найдено',
      unauthorized: 'Не авторизован',
      forbidden: 'Запрещено',
      serverError: 'Ошибка сервера',
      networkError: 'Ошибка сети',
      unknownError: 'Произошла неизвестная ошибка'
    },
    common: {
      loading: 'Загрузка...',
      noData: 'Нет доступных данных',
      refresh: 'Обновить',
      retry: 'Повторить',
      back: 'Назад',
      next: 'Далее',
      previous: 'Предыдущий',
      home: 'Главная',
      settings: 'Настройки',
      help: 'Помощь',
      about: 'О программе',
      contact: 'Контакты',
      privacy: 'Конфиденциальность',
      terms: 'Условия',
      version: 'Версия',
      copyright: 'Авторские права',
      allRightsReserved: 'Все права защищены'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get saved language from localStorage
    const saved = localStorage.getItem('preferred-language');
    if (saved && ['en', 'he', 'ru'].includes(saved)) {
      return saved as Language;
    }
    
    // Try to detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('he')) return 'he';
    if (browserLang.startsWith('ru')) return 'ru';
    return 'en';
  });

  const isRTL = language === 'he';

  useEffect(() => {
    // Save language preference
    localStorage.setItem('preferred-language', language);
    
    // Set document direction and language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update page title based on language
    const titles = {
      en: 'ReserveFlow - Restaurant Reservation Management',
      he: 'ReserveFlow - מערכת ניהול הזמנות למסעדה',
      ru: 'ReserveFlow - Система управления бронированием ресторана'
    };
    document.title = titles[language];
  }, [isRTL, language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let current: any = translations[language];
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English if translation not found
        let fallback: any = translations.en;
        for (const fallbackKey of keys) {
          if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
            fallback = fallback[fallbackKey];
          } else {
            return key; // Return key if even English translation not found
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    return typeof current === 'string' ? current : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};