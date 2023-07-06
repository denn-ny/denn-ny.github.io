const books = [];
const RENDER_EVENT = 'render-bookshelf';
const STORAGE_KEY = 'BOOKSHELF';

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('input-book');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  };

  const checkbox = document.getElementById('inputBookIsCompleted');
  checkbox.addEventListener('click', function () {
    let buttonText = 'Belum selesai dibaca';
    if (checkbox.checked) {
      buttonText = 'Sudah selesai dibaca';
    }
    document.getElementById('button-text').innerText = buttonText;
  });

  const searchBtn = document.getElementById('search-btn');
  searchBtn.addEventListener('click', function (event) {
    event.preventDefault();
    const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
    const bookList = document.querySelectorAll('.bookItem > h3');
    
    for (const book of bookList) {
      if (searchBook !== '') {
        if (searchBook !== book.innerText.toLowerCase()) {
          book.parentElement.style.display = 'none';
        } else {
          book.parentElement.style.display = 'block';
        };
      } else {
        book.parentElement.style.display = 'block';
      };
    };
  });
});

function addBook() {
  const checkBox = document.getElementById('inputBookIsCompleted');

  const generatedID = generateID();
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = parseInt(document.getElementById('inputBookYear').value);
  const isBookCompleted = checkBox.checked;

  const bookObject = genenrateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isBookCompleted);
  books.unshift(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

function generateID() {
  return + new Date();
};

function genenrateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
};

function makeBook(bookObject) {
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = bookObject.title;
  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = 'Penulis: ' + bookObject.author;
  const bookYear = document.createElement('p');
  bookYear.innerText = 'Tahun: ' + bookObject.year;
  
  const deleteButton = document.createElement('button');
  deleteButton.classList.add('red');
  deleteButton.innerText = 'Hapus buku';

  deleteButton.addEventListener('click', function () {
    if (deleteEvent()) {
      removeBook(bookObject.id);
    };
  })

  const action = document.createElement('div');
  action.classList.add('action');
  action.append(deleteButton);

  const bookItem = document.createElement('article');
  bookItem.classList.add('bookItem');
  bookItem.append(bookTitle, bookAuthor, bookYear, action);
  bookItem.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const completededReading = document.createElement('button');
    completededReading.classList.add('green')
    completededReading.innerText = 'Belum selesai dibaca';

    completededReading.addEventListener('click', function () {
      undoBookFromCompleted(bookObject.id);
    });

    action.insertBefore(completededReading, deleteButton);
  } else {
    const uncompletedReading = document.createElement('button');
    uncompletedReading.classList.add('green')
    uncompletedReading.innerText = 'Selesai dibaca';

    uncompletedReading.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    })

    action.insertBefore(uncompletedReading, deleteButton);
  }

  return bookItem;
};

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) {
    return;
  };
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId)
  if (bookTarget == null) {
    return;
  }
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId)
  if (bookTarget == null) {
    return;
  }
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id == bookId) {
      return bookItem;
    }
  }
  return null;
}

function saveData() {
  if (isStorageExist) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
  } else {
    return true;
  };
};

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData)

  if (data !== null) {
    for (const book of data) {
      books.unshift(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function deleteEvent () {
  return confirm('Apakah anda yakin ingin menghapus buku?');
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleted = document.getElementById('incompleted-bookshelf-list');
  incompleted.innerHTML = '';

  const completed = document.getElementById('completed-bookshelf-list');
  completed.innerHTML = '';

  for (const book of books) {
    const bookItem = makeBook(book);
    if (!book.isComplete) {
      incompleted.append(bookItem);
    } else {
      completed.append(bookItem);
    };
  }
});