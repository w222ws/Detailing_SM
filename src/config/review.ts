export const REVIEW_PATH = '/review';

export const reviewPage = {
  phrases: [
    ['Тачка блищить?', 'Розкажи про це!'],
    ['Хлопці старались', 'Напиши пару слів!'],
    ['Ти їдеш, я ні', 'Хоч відгук кинь'],
    ['Відгук — і вільний', 'Жартую, Майже)'],
  ] as const,

  catTag: 'Карбон СМ-ович · менеджер з відгуків',

  chooseLabel: 'Залиш відгук',

  backLabel: 'На головну',

  pageLinkLabel: 'Сторінка для відгуків',
} as const;
