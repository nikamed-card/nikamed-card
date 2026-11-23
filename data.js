// Публичные демонстрационные данные интерфейса. Реальные контакты сотрудников в этом файле не хранятся.
// Подключается обычным <script src="data.js"> (работает и с file://), отдаёт window.NIKAMED.
// Реальные данные компании (юр. лицо, адрес головного офиса, телефоны) — с nikamed.ru.
// Остальные площадки (склад, шоурум, региональные офисы) — демо-значения: замените на актуальные адреса.
(() => {
  const photo = id => `https://images.unsplash.com/photo-${id}?w=640&h=640&fit=crop&crop=faces&auto=format&q=80`;

  const company = {
    name: 'Никамед',
    legalName: 'ООО «НИКАМЕД»',
    tagline: 'Крупнейший поставщик качественных ортопедических изделий и компрессионного трикотажа',
    positioning: 'B2B-эксперт: поставки ортопедических изделий для медицинских организаций, ортопедических салонов и аптечных сетей',
    site: 'https://www.nikamed.ru/',
    catalogUrl: 'https://www.nikamed.ru/catalogueproducts/',
    wholesalePhones: ['+7 (495) 609-63-33', '+7 (495) 609-63-86'], // дирекция по оптовым продажам
  };

  // Детерминированный генератор, чтобы цифры не прыгали между перезагрузками
  const rng = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

  // Площадки компании (ключ salons сохранён для совместимости с HTML: там это «место работы сотрудника»).
  // Города оставлены прежними: на них завязаны часовые пояса в card.html.
  const salons = [
    { id: 'msk-office',    name: 'Никамед Москва (офис)',    city: 'Москва',          address: 'Бумажный пр-д, 14, стр. 2', zip: '127015', hours: [9, 18] },
    { id: 'msk-warehouse', name: 'Никамед Москва (склад)',   city: 'Москва',          address: 'Кутузовский проспект, 24, склад А',     hours: [8, 19] },
    { id: 'msk-showroom',  name: 'Никамед Москва (шоурум)',  city: 'Москва',          address: 'Ходынский бульвар, 4, БЦ «Авиапарк»',   hours: [10, 19] },
    { id: 'spb-office',    name: 'Никамед Санкт-Петербург',  city: 'Санкт-Петербург', address: 'Невский проспект, 88',                  hours: [9, 18] },
    { id: 'ekb-office',    name: 'Никамед Екатеринбург',     city: 'Екатеринбург',    address: 'ул. Малышева, 5',                       hours: [9, 18] },
    { id: 'kzn-office',    name: 'Никамед Казань',           city: 'Казань',          address: 'ул. Баумана, 44',                       hours: [9, 18] },
  ];

  // ФИО на визитке: «Имя Отчество Фамилия». Храним три поля, name — готовая строка для показа.
  // splitName разбирает строку из демо-данных и старых записей: 2 слова — имя и фамилия, 3+ — с отчеством.
  const splitName = str => {
    const w = String(str || '').trim().split(/\s+/).filter(Boolean);
    if (w.length < 2) return { firstName: w[0] || '', middleName: '', lastName: '' };
    return { firstName: w[0], middleName: w.slice(1, -1).join(' '), lastName: w[w.length - 1] };
  };
  const fullName = p => [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
  const withName = e => {
    const parts = e.firstName || e.lastName ? { firstName: e.firstName || '', middleName: e.middleName || '', lastName: e.lastName || '' } : splitName(e.name);
    return { ...e, ...parts, name: fullName(parts) };
  };

  // Реальные сотрудники (staff: true) — данные из подписей писем. Рабочий телефон общий, у каждого свой добавочный.
  // WhatsApp и Telegram не указаны — плитки на визитке скрыты, включаются в админке.
  // Если такой сотрудник раньше был добавлен вручную в админке, та запись заменяется этой (см. «Замена» ниже).
  const OFFICE = '+7 (495) 609-63-86';
  // Реальные сотрудники загружаются только из Supabase employee_cards; в публичном JS контактов нет.
  const staff = [];

  // Демо-сотрудники (вымышленные). status: active | paused | draft
  const employees = [
    ...staff,
    { id: 'anna-sokolova',      name: 'Анна Сергеевна Соколова',      role: 'Руководитель направления ортопедических изделий', salon: 'msk-office',    photo: photo('1559839734-2b71ea197ec2'),    status: 'active', scans: 2814, experience: 14, tags: ['Ортезы и бандажи', 'Тендерные поставки', 'Обучение персонала'] },
    { id: 'sergey-volkov',      name: 'Сергей Викторович Волков',      role: 'Коммерческий директор',                           salon: 'msk-office',    photo: photo('1472099645785-5658abf4ff4e'),    status: 'active', scans: 3106, experience: 27, tags: ['Дистрибуция', 'Ключевые клиенты'] },
    { id: 'dmitry-orlov',       name: 'Дмитрий Андреевич Орлов',      role: 'Менеджер по работе с медицинскими организациями', salon: 'msk-office',    photo: photo('1612349317150-e413f6a5b16d'),    status: 'active', scans: 1967, experience: 9,  tags: ['Госзакупки 44-ФЗ', 'Поставки в стационары'] },
    { id: 'yulia-fedorova',     name: 'Юлия Игоревна Фёдорова',      role: 'Менеджер по работе с ортопедическими салонами',  salon: 'msk-showroom',  photo: photo('1580489944761-15a19d654956'),    status: 'active', scans: 1533, experience: 6,  tags: ['Подбор ассортимента', 'Компрессионный трикотаж'] },
    { id: 'olga-morozova',      name: 'Ольга Николаевна Морозова',     role: 'Руководитель шоурума',                            salon: 'msk-showroom',  photo: photo('1573497019940-1c28c88b4f3e'),    status: 'active', scans: 986,  experience: 11, tags: ['Демонстрация продукции', 'Партнёрские программы'] },
    { id: 'mikhail-lebedev',    name: 'Михаил Петрович Лебедев',     role: 'Эксперт по ортопедической обуви', salon: 'msk-showroom', photo: photo('1599566150163-29194dcaad36'), status: 'active', scans: 1188, experience: 8,  tags: ['Ортопедическая обувь', 'Стельки'] },
    { id: 'elena-vasilieva',    name: 'Елена Владимировна Васильева',    role: 'Менеджер по развитию клиентов',                   salon: 'spb-office',    photo: photo('1594824476967-48c8b964273f'),    status: 'active', scans: 1402, experience: 10, tags: ['Подология', 'Расходные материалы'] },
    { id: 'artem-pavlov',       name: 'Артём Олегович Павлов',       role: 'Специалист по обучению и реабилитационным решениям', salon: 'spb-office', photo: photo('1612531386530-97286d97c2d2'),    status: 'paused', scans: 612,  experience: 7,  tags: ['Реабилитационное оборудование', 'Семинары для клиентов'] },
    { id: 'alexey-kozlov',      name: 'Алексей Михайлович Козлов',     role: 'Региональный менеджер',                           salon: 'spb-office',    photo: photo('1560250097-0b93528c311a'),    status: 'active', scans: 1054, experience: 12, tags: ['Дилерская сеть', 'B2B-партнёрства'] },
    { id: 'irina-kuznetsova',   name: 'Ирина Александровна Кузнецова',    role: 'Менеджер по ортопедическим стелькам и обуви',     salon: 'ekb-office',    photo: photo('1438761681033-6461ffad8d80'),    status: 'active', scans: 1245, experience: 8,  tags: ['Индивидуальные стельки', 'Ортопедическая обувь'] },
    { id: 'daria-popova',       name: 'Дарья Дмитриевна Попова',       role: 'Менеджер по продажам',                            salon: 'ekb-office',    photo: photo('1544005313-94ddf0286df2'),    status: 'draft',  scans: 0,    experience: 1,  tags: ['Подбор изделий'] },
    { id: 'ekaterina-novikova', name: 'Екатерина Павловна Новикова', role: 'Менеджер по детской ортопедии',                   salon: 'kzn-office',    photo: photo('1629909613654-28e377c37b09'),    status: 'active', scans: 874,  experience: 5,  tags: ['Детская ортопедия', 'Тендеры'] },
    { id: 'nikita-smirnov',     name: 'Никита Алексеевич Смирнов',     role: 'Менеджер по партнёрским программам',                    salon: 'kzn-office',    photo: photo('1500648767791-00dcc994a43e'), status: 'active', scans: 721,  experience: 3,  tags: ['Партнёрские программы', 'Дилерская сеть'] },
    { id: 'maxim-egorov',       name: 'Максим Евгеньевич Егоров',      role: 'Менеджер по работе с аптечными сетями',                  salon: 'msk-office',    photo: photo('1607990281513-2c110a25bd8c'), status: 'paused', scans: 338,  experience: 2,  tags: ['Аптечные сети', 'Компрессионный трикотаж'] },
  ].map((e, j) => {
    if (e.staff) return { ...withName(e), spark: Array(14).fill(0) };
    const i = j - staff.length; // нумерация демо-данных прежняя: телефоны и графики не меняются
    const r = rng(i + 7);
    const n = String(i + 1).padStart(2, '0');
    const tgNick = 'nikamed_' + e.id.split('-')[1];
    return {
      ...withName(e),
      phone: `+7 900 000-${n}-${String(10 + i * 3).padStart(2, '0')}`,
      whatsapp: `7900000${n}${String(10 + i * 3).padStart(2, '0')}`, // для https://wa.me/<номер>
      telegram: tgNick,                                            // для https://t.me/<ник>
      spark: Array.from({ length: 14 }, (_, d) => Math.round((e.scans / 30) * (0.55 + r() * 0.9) * (d % 7 >= 5 ? 1.3 : 1))),
    };
  });

  // 30 дней сканирований, последний элемент — сегодня
  const r = rng(42);
  const scansDaily = Array.from({ length: 30 }, (_, d) => {
    const weekday = (d + 2) % 7; // 0 = понедельник
    return Math.round(520 * (weekday >= 5 ? 1.35 : 1) * (0.82 + r() * 0.36) * (1 + d * 0.006));
  });

  // Тепловая карта: 7 дней недели × 24 часа, пики в обед и вечером
  const heatmap = Array.from({ length: 7 }, (_, day) => Array.from({ length: 24 }, (_, h) => {
    if (h < 9 || h > 22) return Math.round(r() * 3);
    const peak = Math.exp(-((h - 13) ** 2) / 8) * 0.8 + Math.exp(-((h - 19) ** 2) / 6);
    return Math.round((18 + 70 * peak) * (day >= 5 ? 1.3 : 1) * (0.8 + r() * 0.4));
  }));

  // ---------- Визитки, созданные и изменённые в админке ----------
  // Локальное хранилище оставлено только для демонстрационных записей интерфейса. Реальные QR-карточки читаются из Supabase.
  const LS_KEY = 'nikamed.cards.v1';
  const EDITABLE = ['firstName', 'middleName', 'lastName', 'role', 'salon', 'phone', 'whatsapp', 'telegram', 'workPhone', 'workExt', 'email', 'photo', 'experience', 'tags', 'status'];
  const baseIds = new Set(employees.map(e => e.id));
  let store = { upserts: {}, removed: [] };
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY));
    if (s && typeof s === 'object') store = { upserts: s.upserts || {}, removed: Array.isArray(s.removed) ? s.removed : [] };
  } catch { /* приватный режим или битые данные — работаем на демо-данных */ }

  const digits = p => String(p || '').replace(/\D/g, '');
  // Новый сотрудник: без сканирований и истории, но со всеми полями, которые ждут страницы
  const normalize = u => withName({
    photo: null, status: 'draft', scans: 0, experience: 0, tags: [], telegram: '',
    ...u, whatsapp: u.whatsapp ?? digits(u.phone), spark: Array(14).fill(0), // '' — WhatsApp нет; старые записи без поля — мобильный
  });
  // Замена: визитка, созданная вручную в админке для сотрудника, который теперь есть в staff
  // (тот же id или те же имя и фамилия), удаляется — показываем новую. Демо-тёзки не трогаем.
  const key = e => { const p = e.firstName || e.lastName ? e : splitName(e.name); return `${p.firstName} ${p.lastName}`.toLowerCase().replace(/ё/g, 'е'); };
  const staffKeys = new Set(staff.map(e => key(withName(e))));
  const STAFF_ADDED = Date.parse('2026-10-21T00:00:00+03:00'); // заменяем только записи, созданные до появления staff
  let replaced = false;
  Object.values(store.upserts).forEach(u => {
    if (u && u.createdAt && u.createdAt < STAFF_ADDED && (baseIds.has(u.id) || staffKeys.has(key(u)))) { delete store.upserts[u.id]; replaced = true; }
  });

  store.removed.forEach(id => { const i = employees.findIndex(e => e.id === id); if (i >= 0) employees.splice(i, 1); });
  Object.values(store.upserts).forEach(u => {
    if (!u || !u.id) return;
    const i = employees.findIndex(e => e.id === u.id);
    if (i >= 0) employees[i] = withName({ ...employees[i], ...(u.firstName || u.lastName ? {} : splitName(u.name)), ...u });
    else employees.unshift(normalize(u)); // новые — сверху списка, последние добавленные первыми
  });

  function persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(store)); return true; } catch { return false; }
  }
  if (replaced) persist();
  // Сохраняет нового или изменённого сотрудника. false — хранилище недоступно/переполнено (правка живёт до перезагрузки)
  // at — позиция вставки в списке (для «Вернуть» после удаления)
  function saveEmployee(e, at = 0) {
    const rec = { id: e.id };
    EDITABLE.forEach(k => { if (e[k] !== undefined) rec[k] = e[k]; });
    rec.name = fullName(rec);
    if (!baseIds.has(e.id)) rec.createdAt = store.upserts[e.id]?.createdAt || e.createdAt || Date.now();
    store.upserts[e.id] = rec;
    store.removed = store.removed.filter(id => id !== e.id);
    const i = employees.findIndex(x => x.id === e.id);
    if (i >= 0) Object.assign(employees[i], withName(rec));
    else employees.splice(Math.min(at, employees.length), 0, { ...normalize(rec), ...(e.spark ? { scans: e.scans, spark: e.spark } : {}) });
    return persist();
  }
  function removeEmployee(id) {
    delete store.upserts[id];
    if (baseIds.has(id) && !store.removed.includes(id)) store.removed.push(id);
    const i = employees.findIndex(e => e.id === id);
    if (i >= 0) employees.splice(i, 1);
    return persist();
  }
  const isIdFree = id => !baseIds.has(id) && !employees.some(e => e.id === id);
  const hasLocalChanges = () => Object.keys(store.upserts).length > 0 || store.removed.length > 0;
  function resetLocal() { try { localStorage.removeItem(LS_KEY); } catch {} }

  const NIKAMED = {
    company,
    salons,
    employees,
    salon: id => salons.find(s => s.id === id),
    employee: id => employees.find(e => e.id === id),
    saveEmployee, removeEmployee, isIdFree, hasLocalChanges, resetLocal, fullName, splitName,
    isCustom: id => !baseIds.has(id),

    admin: { name: 'Мария Гончарова', role: 'Руководитель HR', photo: photo('1573496359142-b8d87734a5a2') },

    stats: {
      paperSaved: 45000,       // листов бумаги (отказ от печатных визиток)
      activeQr: 1240,
      scansMonth: scansDaily.reduce((a, b) => a + b, 0), scansDelta: 12.4, // % к прошлому месяцу
      bookings: 612, bookingsDelta: 8.1,    // запросов на встречу и консультацию с визиток
      contactsSaved: 4870,                  // скачиваний vCard
    },
    scansDaily,
    channels: [ // доля сканирований по каналам
      { key: 'qr', label: 'QR-код', share: 0.62 },
      { key: 'nfc', label: 'NFC-метка', share: 0.23 },
      { key: 'link', label: 'Ссылка', share: 0.15 },
    ],
    heatmap,

    // ESG: оценки на основе средних отраслевых коэффициентов
    esg: {
      paperSheets: 45000,
      goalSheets: 60000,         // цель на 2026 год
      co2Kg: 225,                // ~5 г CO₂e на лист A4
      trees: 5.4,                // ~8 300 листов на дерево
      waterLiters: 450000,       // ~10 л воды на лист
      monthly: [1800, 2100, 2600, 3100, 3500, 3900, 4300, 4700, 5200, 5600, 6000, 7200], // окт 2025 → сен 2026
    },

    notifications: [
      { icon: 'qr-code',          text: 'Ольга Николаевна Морозова выпустила 25 QR-кодов для шоурума «Никамед Москва»', time: '5 мин назад', unread: true },
      { icon: 'trending-up',      text: 'Всплеск сканирований: «Санкт-Петербург» +38% за сутки',              time: '1 ч назад',   unread: true },
      { icon: 'user-round-check', text: 'Профиль Дарьи Дмитриевны Поповой ждёт модерации',                              time: '3 ч назад',   unread: true },
      { icon: 'leaf',             text: 'ESG-отчёт за сентябрь готов к выгрузке',                            time: 'вчера',       unread: false },
    ],
  };

  window.NIKAMED = NIKAMED;
})();
