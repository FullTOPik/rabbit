const Rabbit = require("./rabbit");

const rabbit = new Rabbit();

const books = [
  { id: 1, book: "Война и мир" },
  { id: 2, book: "Другая книга" },
  { id: 3, book: "Третья книгаы" },
];

const authors = [
  { id: 1, book: "Толстой" },
  { id: 2, book: "Лермонтов" },
  { id: 3, book: "Пушкин" },
];

rabbit.addHandler("book", (data) => {
  const { id } = data;
  const book = books.find((currentBook) => currentBook.id === Number(id));

  console.log("book>>>>", book);

  return book;
});

rabbit.addHandler("author", (data) => {
  const { id } = data;
  const author = authors.find(
    (currentAuthor) => currentAuthor.id === Number(id)
  );

  console.log("author>>>>", author);

  return author;
});

rabbit.startService().catch(console.error);
