const bookName = document.getElementById("book-name");
const bookPages = document.getElementById("book-pages");
const bookDate = document.getElementById("deadline");
const addBtn = document.getElementById("add-btn");
const alertMessage = document.getElementById("alert-message");
const booksBody = document.querySelector("tbody");
const deleteAllBtn = document.getElementById("delete-all");
const editBtn = document.getElementById("edit-btn");
const filterBtns = document.querySelectorAll(".filter-books"); // اصلاح نام متغیر به filterBtns

let books = JSON.parse(localStorage.getItem("books")) || [];

const saveToLocalStorage = () => {
  localStorage.setItem("books", JSON.stringify(books));
};

const generateId = () => {
  return Math.floor(
    Math.random() * Math.random() * Math.pow(10, 15)
  ).toString();
};

const showAlert = (message, type) => {
  alertMessage.innerHTML = "";
  const alert = document.createElement("p");
  alert.innerText = message;
  alert.classList.add("alert", `alert-${type}`);
  alertMessage.append(alert);

  setTimeout(() => {
    alert.remove();
  }, 2000);
};

const addingTaskHandler = () => {
  const task = bookName.value.trim();
  const pages = parseInt(bookPages.value);
  const deadline = bookDate.value;

  if (task && !isNaN(pages) && pages > 0 && deadline) {
    const book = {
      id: generateId(),
      task,
      pages,
      remainingPages: pages,
      deadline,
      status: false,
      dailyPagesRead: 0,
      completionDate: "",
    };
    books.push(book);
    saveToLocalStorage();
    displayBooks();
    bookName.value = "";
    bookPages.value = "";
    bookDate.value = "";
    showAlert("Your book added successfully!", "success");
  } else {
    showAlert("Please enter valid details for the book.", "error");
  }
};

const displayBooks = (data) => {
  const bookList = data || books;
  booksBody.innerHTML = "";
  if (!bookList.length) {
    booksBody.innerHTML = "<tr><td colspan='6'>No books found!</td></tr>";
    return;
  }

  bookList.forEach((book) => {
    booksBody.innerHTML += `
    <tr>
      <td style="max-width: 180px; word-wrap: break-word; padding: 8px;">${
        book.task
      }</td>
      <td>${book.pages}</td>
      <td>${book.deadline || "Not a certain date!"}</td>
      <td>
        <input type="number" placeholder="Daily read pages" class="daily-pages input" style="display: block; width:90%; margin: 10px auto;" value="${
          book.dailyPagesRead
        }" data-id="${book.id}">
        <button class="add-pages-btn btn" style="display: block; width:90%; margin: 0 auto;" data-id="${
          book.id
        }">add pages</button>
        <span class="remaining-pages" style="display: block; width:100%; margin: 10px auto;">Remaining: ${
          book.remainingPages
        }</span>
      </td>
      <td>
        ${
          book.status
            ? `<span style="color: #1dd31d; display: inline-block; margin-bottom: 5px;font-size:20px; font-weight: bold;">completed at :</span><br><span style="color: #ffa600; font-weight: bold;">${book.completionDate}</span>`
            : `<canvas class="progress-chart" style="height: 70px; margin: 2px auto;" id="chart-${book.id}"></canvas>`
        }
      </td>
      <td>
        <button class="btn" style="display: block; padding: 6px; width:100%; margin-bottom: 20px; font-size: 13px;" onclick="editHandler('${
          book.id
        }')">Edit</button>
        <button onclick="oneItemDeletingHandler('${
          book.id
        }')" class="btn delete-btn" style="display: block; width:100%; padding: 6px; margin-top: 20px; font-size: 13px;">Delete</button>
      </td>
    </tr>
    `;
  });

  updateCharts();
};

const updateCharts = () => {
  books.forEach((book) => {
    const canvas = document.getElementById(`chart-${book.id}`);
    if (canvas) {
      const ctx = canvas.getContext("2d");
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Read", "Remaining"],
          datasets: [
            {
              data: [book.pages - book.remainingPages, book.remainingPages],
              backgroundColor: ["#28a745", "#dc3545"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  });
};

const editHandler = (id) => {
  const book = books.find((book) => book.id === id);

  if (!book) return;

  bookName.value = book.task;
  bookPages.value = book.pages;
  bookDate.value = book.deadline;

  editBtn.style.display = "inline-block";
  addBtn.style.display = "none";
  editBtn.dataset.id = id; // ذخیره آی‌دی کتاب برای استفاده در بروزرسانی
};

const applyEditHandler = () => {
  const id = editBtn.dataset.id;
  const book = books.find((book) => book.id === id);

  if (!book) return;

  book.task = bookName.value;
  book.pages = parseInt(bookPages.value);
  book.remainingPages = book.pages;
  book.deadline = bookDate.value;

  bookName.value = "";
  bookPages.value = "";
  bookDate.value = "";

  editBtn.style.display = "none";
  addBtn.style.display = "inline-block";

  saveToLocalStorage();
  displayBooks();
  showAlert("Book updated successfully!", "success");
};

const deleteAllHandler = () => {
  books = [];
  saveToLocalStorage();
  displayBooks();
  showAlert("Books cleared successfully!", "success");
};

const oneItemDeletingHandler = (id) => {
  books = books.filter((book) => book.id !== id);
  saveToLocalStorage();
  displayBooks();
  showAlert("Book deleted successfully!", "success");
};

const toggleHandler = (id) => {
  const book = books.find((book) => book.id === id);
  const pagesRead = parseInt(prompt("Enter the number of pages read:"));

  if (!isNaN(pagesRead) && pagesRead > 0 && pagesRead <= book.remainingPages) {
    book.remainingPages -= pagesRead;
    if (book.remainingPages === 0) {
      book.status = true;
      book.completionDate = new Date().toLocaleDateString("fa-IR");
    }
    saveToLocalStorage();
    displayBooks();
    showAlert("Book's status and progress updated successfully.", "success");
  } else {
    showAlert("Invalid number of pages read!", "error");
  }
};

const filterHandler = (event) => {
  const filter = event.target.dataset.filter;
  let filteredBooks = books;

  if (filter === "all") {
    filteredBooks = books; // نمایش همه کتاب‌ها
  } else if (filter === "pending") {
    filteredBooks = books.filter((book) => !book.status);
  } else if (filter === "completed") {
    filteredBooks = books.filter((book) => book.status);
  }

  displayBooks(filteredBooks);
};

const addPagesHandler = (id) => {
  const book = books.find((book) => book.id === id);
  if (!book) return;

  const inputField = document.querySelector(`.daily-pages[data-id="${id}"]`);
  const pagesRead = parseInt(inputField.value);

  if (!isNaN(pagesRead) && pagesRead > 0 && pagesRead <= book.remainingPages) {
    book.remainingPages -= pagesRead;
    book.dailyPagesRead = pagesRead;
    if (book.remainingPages === 0) {
      book.status = true;
      const now = new Date();
      book.completionDate = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    }
    inputField.value = ""; // مقدار ورودی را پس از ثبت خالی کن
    saveToLocalStorage();
    displayBooks();
    showAlert("Pages updated successfully!", "success");
  } else {
    showAlert("Invalid number of pages!", "error");
  }
};

editBtn.addEventListener("click", applyEditHandler);
window.addEventListener("load", () => displayBooks());
addBtn.addEventListener("click", addingTaskHandler);
deleteAllBtn.addEventListener("click", deleteAllHandler);
filterBtns.forEach((btn) => btn.addEventListener("click", filterHandler));
booksBody.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    oneItemDeletingHandler(event.target.dataset.id);
  } else if (event.target.classList.contains("toggle-btn")) {
    toggleHandler(event.target.dataset.id);
  } else if (event.target.classList.contains("edit-btn")) {
    editHandler(event.target.dataset.id);
  } else if (event.target.classList.contains("add-pages-btn")) {
    addPagesHandler(event.target.dataset.id);
  }
});

document.querySelectorAll;
