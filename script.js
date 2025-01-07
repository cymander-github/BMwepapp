// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 폼 요소 가져오기
    const bookForm = document.getElementById('bookForm');
    
    // 폼 제출 이벤트 처리
    bookForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 기본 제출 동작 방지
        
        // 입력값 가져오기
        const bookData = {
            title: document.getElementById('bookTitle').value,
            publisher: document.getElementById('publisher').value,
            publishYear: document.getElementById('publishYear').value
        };
        
        // 데이터를 로컬 스토리지에 저장
        localStorage.setItem('bookData', JSON.stringify(bookData));
        
        // 폼 리셋 제거 (bookForm.reset() 제거)
    });

    // 학습 진도 관리 처리
    const addRowButton = document.getElementById('addRow');
    const studyTableBody = document.getElementById('studyTableBody');

    // 새로운 목차 추가 버튼 클릭 처리
    addRowButton.addEventListener('click', function() {
        const newRow = document.createElement('div');
        newRow.className = 'study-row';
        newRow.innerHTML = `
            <input type="text" class="chapter-input" placeholder="새 목차 입력" maxlength="100" lang="ko">
            <div class="date-group">
                <input type="date" class="date-input">
                <span>~</span>
                <input type="date" class="date-input">
            </div>
            <div class="date-group">
                <input type="date" class="date-input">
                <span>~</span>
                <input type="date" class="date-input">
            </div>
        `;
        
        document.querySelector('.study-container').appendChild(newRow);
    });

    // 날짜 입력 이벤트 리스너 제거 (알림 메시지 제거)
    document.removeEventListener('change', function(){});
});
