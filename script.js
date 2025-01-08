// 전역 변수
let currentBookId = null;
let currentSortOption = 'title';
let isAscending = true;
let currentChapterSortOption = 'title';
let isChapterAscending = true;
let isEditingChapter = false;
let editingChapterId = null;
let isEditingBook = false;
let editingBookId = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 새 책 추가 버튼
    const addBookBtn = document.getElementById('addBook');
    addBookBtn.onclick = addBook;

    // 책 목록 정렬
    const sortOption = document.getElementById('sortOption');
    const sortDirection = document.getElementById('sortDirection');
    
    sortOption.addEventListener('change', (e) => {
        currentSortOption = e.target.value;
        displayBooks();
    });
    
    sortDirection.addEventListener('click', () => {
        isAscending = !isAscending;
        sortDirection.textContent = isAscending ? '▲' : '▼';
        displayBooks();
    });

    // 챕터 정렬
    const chapterSortOption = document.getElementById('chapterSortOption');
    const chapterSortDirection = document.getElementById('chapterSortDirection');
    
    chapterSortOption.addEventListener('change', (e) => {
        currentChapterSortOption = e.target.value;
        displayChapters();
    });
    
    chapterSortDirection.addEventListener('click', () => {
        isChapterAscending = !isChapterAscending;
        chapterSortDirection.textContent = isChapterAscending ? '▲' : '▼';
        displayChapters();
    });

    // 새 챕터 추가 버튼
    const addChapterBtn = document.getElementById('addChapter');
    addChapterBtn.addEventListener('click', addChapter);

    // 초기 책 목록 표시
    displayBooks();

    // 모든 date 타입 입력 필드에 대해 이벤트 리스너 추가
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // 값이 변경될 때마다 형식 변환
        input.addEventListener('change', (e) => {
            const fullDate = e.target.value; // YYYY-MM-DD
            if (fullDate) {
                const shortDate = fullDate.substring(2); // YY-MM-DD
                // value는 원래 형식(YYYY-MM-DD)을 유지
                // 표시되는 부분만 변경
                input.dataset.displayValue = shortDate;
            }
        });
    });
});

// 책 관련 함수들
function addBook() {
    if (!isEditingBook) {
        const title = document.getElementById('bookTitle').value.trim();
        const publisher = document.getElementById('publisher').value.trim();
        const publishYear = document.getElementById('publishYear').value.trim();

        if (!title || !publisher || !publishYear) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        const books = JSON.parse(localStorage.getItem('books')) || [];
        const newBook = {
            id: 'book_' + Date.now(),
            title,
            publisher,
            publishYear,
            chapters: []
        };

        books.push(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        
        resetBookForm();
        displayBooks();
    }
}

function displayBooks() {
    const bookListContainer = document.getElementById('bookListContainer');
    const books = JSON.parse(localStorage.getItem('books')) || [];
    
    if (books.length === 0) {
        bookListContainer.innerHTML = '<div class="empty-message">등록된 책이 없습니다.</div>';
        return;
    }

    // 정렬
    const sortedBooks = [...books].sort((a, b) => {
        let valueA, valueB;
        
        if (currentSortOption === 'progress') {
            valueA = calculateProgress(a);
            valueB = calculateProgress(b);
        } else {
            valueA = String(a[currentSortOption]).toLowerCase();
            valueB = String(b[currentSortOption]).toLowerCase();
        }
        
        if (isAscending) {
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
            return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
        }
    });

    bookListContainer.innerHTML = sortedBooks.map(book => `
        <div class="book-item" onclick="selectBook('${book.id}')">
            <div>${book.title}</div>
            <div>${book.publisher}</div>
            <div>${book.publishYear}</div>
            <div>${calculateProgress(book)}%</div>
            <div class="manage-buttons">
                <button class="edit-btn" onclick="editBook('${book.id}', event)">수정</button>
                <button class="delete-btn" onclick="deleteBook('${book.id}', event)">삭제</button>
            </div>
        </div>
    `).join('');
}

// 진도율 계산
function calculateProgress(book) {
    if (!book.chapters || book.chapters.length === 0) return 0;
    const completed = book.chapters.filter(ch => ch.completed).length;
    return Math.round((completed / book.chapters.length) * 100);
}

// 책 선택
function selectBook(bookId) {
    currentBookId = bookId;
    const chapterManagement = document.getElementById('chapterManagement');
    chapterManagement.style.display = 'block';
    
    // 선택된 책의 제목 표시
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const selectedBook = books.find(book => book.id === bookId);
    if (selectedBook) {
        const chapterTitle = document.querySelector('#chapterManagement h2');
        chapterTitle.textContent = `학습 목차 관리 : ${selectedBook.title}`;
    }
    
    displayChapters();
}

// 책 수정
function editBook(bookId, event) {
    event.stopPropagation();
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const book = books.find(b => b.id === bookId);
    
    if (!book) return;
    
    // 수정 모드 설정
    isEditingBook = true;
    editingBookId = bookId;
    
    // 폼에 현재 값 설정
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('publisher').value = book.publisher;
    document.getElementById('publishYear').value = book.publishYear;
    
    // 버튼 텍스트 변경
    const addButton = document.getElementById('addBook');
    addButton.textContent = '책 수정';
    addButton.onclick = () => updateBook();
}

function updateBook() {
    if (!isEditingBook || !editingBookId) return;
    
    const title = document.getElementById('bookTitle').value.trim();
    const publisher = document.getElementById('publisher').value.trim();
    const publishYear = document.getElementById('publishYear').value.trim();

    if (!title || !publisher || !publishYear) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    const books = JSON.parse(localStorage.getItem('books')) || [];
    const bookIndex = books.findIndex(book => book.id === editingBookId);
    
    if (bookIndex !== -1) {
        // 기존 책 정보 업데이트
        books[bookIndex] = {
            ...books[bookIndex],  // 기존 속성(chapters 등) 유지
            title,
            publisher,
            publishYear
        };
        
        localStorage.setItem('books', JSON.stringify(books));
        
        // 상태 초기화
        isEditingBook = false;
        editingBookId = null;
        
        // 입력 폼 초기화
        resetBookForm();
        
        // 목록 갱신
        displayBooks();
    }
}

// 책 삭제
function deleteBook(bookId, event) {
    event.stopPropagation();
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const filteredBooks = books.filter(book => book.id !== bookId);
    localStorage.setItem('books', JSON.stringify(filteredBooks));
    
    if (currentBookId === bookId) {
        document.getElementById('chapterManagement').style.display = 'none';
        currentBookId = null;
    }
    
    displayBooks();
}

// 책터 관리 관련 함수들 추가
function editChapter(chapterId) {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const book = books.find(book => book.id === currentBookId);
    
    if (!book || !book.chapters) return;
    
    const chapter = book.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;
    
    // 수정 모드 설정
    isEditingChapter = true;
    editingChapterId = chapterId;
    
    // 폼에 현재 값 설정
    document.getElementById('chapterTitle').value = chapter.title;
    document.getElementById('chapterPage').value = chapter.page || '';
    document.getElementById('plannedStartDate').value = chapter.plannedStartDate;
    document.getElementById('plannedEndDate').value = chapter.plannedEndDate;
    document.getElementById('actualStartDate').value = chapter.actualStartDate || '';
    document.getElementById('actualEndDate').value = chapter.actualEndDate || '';
    
    // 버튼 텍스트 변경
    const addButton = document.getElementById('addChapter');
    addButton.textContent = '목차 수정';
    addButton.onclick = () => updateChapter();
}

function updateChapter() {
    if (!isEditingChapter || !editingChapterId) return;
    
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const bookIndex = books.findIndex(book => book.id === currentBookId);
    
    if (bookIndex === -1) return;
    
    const title = document.getElementById('chapterTitle').value.trim();
    const page = document.getElementById('chapterPage').value.trim();
    const plannedStartDate = document.getElementById('plannedStartDate').value;
    const plannedEndDate = document.getElementById('plannedEndDate').value;
    const actualStartDate = document.getElementById('actualStartDate').value;
    const actualEndDate = document.getElementById('actualEndDate').value;

    if (!title || !plannedStartDate || !plannedEndDate) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }

    // 해당 챕터 찾기
    const chapterIndex = books[bookIndex].chapters.findIndex(ch => ch.id === editingChapterId);
    
    if (chapterIndex === -1) return;
    
    // 챕터 업데이트
    books[bookIndex].chapters[chapterIndex] = {
        id: editingChapterId,
        title,
        page,
        plannedStartDate,
        plannedEndDate,
        actualStartDate,
        actualEndDate,
        completed: books[bookIndex].chapters[chapterIndex].completed
    };

    // 저장
    localStorage.setItem('books', JSON.stringify(books));
    
    // 상태 초기화
    isEditingChapter = false;
    editingChapterId = null;
    
    // 폼 초기화
    resetChapterForm();
    
    // 목차 목록 갱신
    displayChapters();
}

function deleteChapter(chapterId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const bookIndex = books.findIndex(book => book.id === currentBookId);
    
    if (bookIndex !== -1) {
        books[bookIndex].chapters = books[bookIndex].chapters.filter(
            chapter => chapter.id !== chapterId
        );
        localStorage.setItem('books', JSON.stringify(books));
        displayChapters();
    }
}

function toggleChapterComplete(chapterId) {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const book = books.find(book => book.id === currentBookId);
    
    if (book && book.chapters) {
        const chapter = book.chapters.find(ch => ch.id === chapterId);
        if (chapter) {
            chapter.completed = !chapter.completed;
            localStorage.setItem('books', JSON.stringify(books));
            displayChapters();
            displayBooks(); // 진도율 업데이트를 위해 책 목록도 갱신
        }
    }
}

function sortChapters(chapters, sortOption, ascending) {
    return chapters.sort((a, b) => {
        let valueA, valueB;
        
        switch(sortOption) {
            case 'title':
                valueA = a.title;
                valueB = b.title;
                break;
            case 'plannedStartDate':
                valueA = a.plannedStartDate;
                valueB = b.plannedStartDate;
                break;
            case 'actualStartDate':
                valueA = a.actualStartDate || '';
                valueB = b.actualStartDate || '';
                break;
            case 'status':
                valueA = getStatusText(a);
                valueB = getStatusText(b);
                break;
            default:
                valueA = a.title;
                valueB = b.title;
        }
        
        if (ascending) {
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
            return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
        }
    });
}

// 챕터 관련 함수들
function addChapter() {
    // 수정 모드가 아닐 때만 새로운 챕터 추가
    if (!isEditingChapter) {
        const title = document.getElementById('chapterTitle').value.trim();
        const page = document.getElementById('chapterPage').value.trim();
        const plannedStartDate = document.getElementById('plannedStartDate').value;
        const plannedEndDate = document.getElementById('plannedEndDate').value;
        const actualStartDate = document.getElementById('actualStartDate').value;
        const actualEndDate = document.getElementById('actualEndDate').value;

        if (!title || !plannedStartDate || !plannedEndDate) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        const books = JSON.parse(localStorage.getItem('books')) || [];
        const bookIndex = books.findIndex(book => book.id === currentBookId);

        if (bookIndex !== -1) {
            if (!books[bookIndex].chapters) {
                books[bookIndex].chapters = [];
            }

            const newChapter = {
                id: 'chapter_' + Date.now(),
                title,
                page,
                plannedStartDate,
                plannedEndDate,
                actualStartDate,
                actualEndDate,
                completed: false
            };

            books[bookIndex].chapters.push(newChapter);
            localStorage.setItem('books', JSON.stringify(books));
            
            resetChapterForm();
            displayChapters();
        }
    }
}

function displayChapters() {
    const chapterListContainer = document.getElementById('chapterListContainer');
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const book = books.find(book => book.id === currentBookId);

    if (!book || !book.chapters || book.chapters.length === 0) {
        chapterListContainer.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">등록된 학습 목차가 없습니다.</td>
            </tr>`;
        return;
    }

    // 정렬 적용
    const sortedChapters = sortChapters([...book.chapters], currentChapterSortOption, isChapterAscending);

    chapterListContainer.innerHTML = sortedChapters.map(chapter => `
        <tr>
            <td>${chapter.title} ${chapter.page ? `(page ${chapter.page})` : ''}</td>
            <td>${formatDate(chapter.plannedStartDate)} ~ ${formatDate(chapter.plannedEndDate)}</td>
            <td>${chapter.actualStartDate ? 
                `${formatDate(chapter.actualStartDate)} ~ ${formatDate(chapter.actualEndDate)}` : 
                '- ~ -'}</td>
            <td>
                <span class="status-btn ${getStatusClass(chapter)}">
                    ${getStatusText(chapter)}
                </span>
            </td>
            <td>
                <div class="manage-buttons">
                    <button class="edit-btn" onclick="editChapter('${chapter.id}')">수정</button>
                    <button class="delete-btn" onclick="deleteChapter('${chapter.id}')">삭제</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 유틸리티 함수들
function calculateProgress(book) {
    if (!book.chapters || book.chapters.length === 0) return 0;
    const completed = book.chapters.filter(ch => ch.completed).length;
    return Math.round((completed / book.chapters.length) * 100);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return dateString.substring(2);
}

function getStatusClass(chapter) {
    const status = getStatusText(chapter);
    switch(status) {
        case '완료':
            return 'completed';
        case '진행중':
            return 'in-progress';
        default:
            return 'planned';
    }
}

function getStatusText(chapter) {
    // 시�템의 현재 날짜 사용
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // 시간을 00:00:00으로 설정
    
    // 날짜 문자열을 Date 객체로 변환
    const actualStartDate = chapter.actualStartDate ? new Date(chapter.actualStartDate + 'T00:00:00') : null;
    const actualEndDate = chapter.actualEndDate ? new Date(chapter.actualEndDate + 'T00:00:00') : null;
    
    // 날짜 비교
    if (actualEndDate && actualEndDate <= today) {
        return '완료';
    } else if (actualStartDate && actualStartDate <= today && (!actualEndDate || actualEndDate > today)) {
        return '진행중';
    } else {
        return '수행전';
    }
}

function resetChapterForm() {
    document.getElementById('chapterTitle').value = '';
    document.getElementById('chapterPage').value = '';
    document.getElementById('plannedStartDate').value = '';
    document.getElementById('plannedEndDate').value = '';
    document.getElementById('actualStartDate').value = '';
    document.getElementById('actualEndDate').value = '';
    
    // 버튼 상태 초기화
    const addButton = document.getElementById('addChapter');
    addButton.textContent = '새로운 목차 추가';
    addButton.onclick = addChapter;
    
    // 수정 모드 초기화
    isEditingChapter = false;
    editingChapterId = null;
}

// 책 입력 폼 초기화 함수
function resetBookForm() {
    document.getElementById('bookTitle').value = '';
    document.getElementById('publisher').value = '';
    document.getElementById('publishYear').value = '';
    
    // 버튼 상태 초기화
    const addButton = document.getElementById('addBook');
    addButton.textContent = '새로운 책 추가';
    addButton.onclick = addBook;
    
    // 수정 모드 초기화
    isEditingBook = false;
    editingBookId = null;
}

