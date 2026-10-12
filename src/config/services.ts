/**
 * ПОСЛУГИ І ЦІНИ — розділ #services.
 * Чистий прайс-лист: назва, короткий опис, ціна. Без категорій і перемикачів —
 * вони не додавали користі, тільки займали місце.
 * Ціни в доларах — за курсом НБУ на день звернення (матеріали імпортні).
 */

export interface Service {
  id: string;
  title: string;
  /** Короткий рядок під назвою — що саме робимо */
  summary: string;
  currency: 'UAH' | 'USD';
  /** Відсутня, якщо individual: true */
  priceFrom?: number;
  /** Ціну не називаємо наперед — лише після огляду */
  individual?: boolean;
  /** Найчастіше беруть разом із покриттям — позначаємо окремо */
  featured?: boolean;
}

export const services: Service[] = [
  {
    id: 'wash',
    title: 'Детейлінг-мийка авто',
    summary:
      'Ручна мийка хімією детейлінг-класу — без щіток, що лишають мікросколи',
    currency: 'UAH',
    priceFrom: 1300,
  },
  {
    id: 'technical',
    title: 'Технічний детейлінг',
    summary: 'Моторний відсік, диски, арки та інші важкодоступні зони',
    currency: 'USD',
    priceFrom: 300,
  },
  {
    id: 'polish',
    title: 'Полірування авто',
    summary:
      'Прибираємо павутинку та матовість, повертаємо глибину кольору лаку',
    currency: 'USD',
    priceFrom: 200,
  },
  {
    id: 'interior',
    title: 'Хімчистка салону автомобіля',
    summary: 'Тканина, шкіра, пластик і стеля — без запахів і старих плям',
    currency: 'UAH',
    priceFrom: 8000,
  },
  {
    id: 'graphene',
    title: 'Графенове покриття',
    summary: 'Міцніший і довговічніший захист лаку, ніж класична кераміка',
    currency: 'USD',
    priceFrom: 300,
    featured: true,
  },
  {
    id: 'ceramic',
    title: 'Керамічне покриття',
    summary: 'Глибокий блиск і гідрофобний захист лаку на роки',
    currency: 'USD',
    priceFrom: 300,
    featured: true,
  },
  {
    id: 'ppf',
    title: 'Антигравійна плівка',
    summary: 'Фізичний захист кузова від сколів, піску та дрібних ударів',
    currency: 'USD',
    individual: true,
  },
  {
    id: 'antichrome',
    title: 'Антихром на авто',
    summary: 'Хромовані елементи — у матовий чорний або колір кузова',
    currency: 'UAH',
    individual: true,
  },
];

export const priceDisclaimer =
  'Ціни орієнтовні для будь-якого авто — точну суму називаємо після огляду.';
