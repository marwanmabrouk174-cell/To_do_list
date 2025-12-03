// ===========================
// 1. اختيار العناصر من الـ DOM
// ===========================
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const taskCountSpan = document.querySelector('.task-count');
const filterBtns = document.querySelectorAll('.filter-btn');
// نحتاج لاختيار الفورم نفسه لمنع تحديث الصفحة عند الضغط على Enter
const inputForm = document.querySelector('.input-section');


// ===========================
// 2. حالة التطبيق (State)
// ===========================
// مصفوفة لتخزين جميع المهام ككائنات (Objects)
let tasks = [];
// متغير لتتبع الفلتر الحالي (الكل، نشطة، مكتملة)
let currentFilter = 'all';


// ===========================
// 3. دوال التشغيل الأساسية
// ===========================

// دالة لتحميل المهام المحفوظة عند فتح الصفحة
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        // تحويل النص المحفوظ إلى مصفوفة جافاسكريبت
        tasks = JSON.parse(storedTasks);
    } else {
        // إذا لم توجد مهام محفوظة، نبدأ بمصفوفة فارغة
        tasks = []; 
    }
    renderTasks();
}

// دالة لحفظ المصفوفة الحالية في التخزين المحلي للمتصفح
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// الدالة الرئيسية: تقوم برسم (عرض) المهام على الشاشة بناءً على البيانات
function renderTasks() {
    // 1. مسح القائمة الحالية المعروضة في الـ HTML
    todoList.innerHTML = '';

    // 2. تصفية المهام حسب الفلتر المختار
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    // 3. إنشاء عناصر HTML لكل مهمة في القائمة المصفاة
    filteredTasks.forEach(task => {
        // إنشاء عنصر li
        const li = document.createElement('li');
        li.classList.add('todo-item');
        // إضافة كلاس 'completed' إذا كانت المهمة مكتملة ليظهر الخط المشطوب
        if (task.completed) {
            li.classList.add('completed');
        }
        // تخزين معرف المهمة (ID) داخل عنصر الـ HTML للرجوع إليه لاحقاً
        li.setAttribute('data-id', task.id);

        // بناء الهيكل الداخلي للـ li (مطابق لما صممناه في HTML/CSS)
        li.innerHTML = `
            <label class="checkbox-container">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn">🗑️</button>
        `;

        // إضافة العنصر الجديد إلى القائمة في الصفحة
        todoList.appendChild(li);
    });

    // 4. تحديث عداد المهام المتبقية
    updateTaskCount();
}

// دالة تحديث العداد أسفل القائمة
function updateTaskCount() {
    // حساب عدد المهام غير المكتملة فقط
    const activeTasksCount = tasks.filter(task => !task.completed).length;
    taskCountSpan.textContent = `متبقي ${activeTasksCount} مهام`;
}


// ===========================
// 4. التعامل مع الأحداث (Event Handlers)
// ===========================

// إضافة مهمة جديدة
function addTask(event) {
    event.preventDefault(); // منع إعادة تحميل الصفحة عند إرسال الفورم

    const taskText = todoInput.value.trim(); // الحصول على النص وإزالة المسافات الزائدة

    // التحقق من أن الحقل ليس فارغاً
    if (taskText === "") return;

    // إنشاء كائن مهمة جديد
    const newTask = {
        id: Date.now(), // استخدام الوقت الحالي كمعرف فريد
        text: taskText,
        completed: false // المهمة الجديدة تكون غير مكتملة افتراضياً
    };

    // إضافة المهمة للمصفوفة
    tasks.push(newTask);
    
    // مسح حقل الإدخال
    todoInput.value = '';
    
    // حفظ التغييرات وإعادة رسم القائمة
    saveTasksToLocalStorage();
    renderTasks();
}

// التعامل مع النقر داخل القائمة (للحذف أو تغيير الحالة)
// نستخدم تقنية "Event Delegation" بالاستماع على الأب (todoList)
todoList.addEventListener('click', (event) => {
    const target = event.target;
    // العثور على أقرب عنصر أب هو (li.todo-item) لمعرفة أي مهمة تم النقر عليها
    const itemElement = target.closest('.todo-item');

    if (!itemElement) return; // إذا تم النقر خارج نطاق المهمة

    // الحصول على معرف المهمة من الـ data-id الذي وضعناه سابقاً
    const taskId = Number(itemElement.getAttribute('data-id'));

    // أ) إذا كان العنصر الذي تم نقره هو زر الحذف
    if (target.classList.contains('delete-btn')) {
        // نقوم بإنشاء مصفوفة جديدة لا تحتوي على المهمة ذات هذا المعرف
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasksToLocalStorage();
        renderTasks();
    }
    
    // ب) إذا كان العنصر الذي تم نقره هو صندوق الاختيار (Checkbox)
    else if (target.tagName === 'INPUT' && target.type === 'checkbox') {
        // نقوم بتعديل حالة الإتمام للمهمة المحددة (عكس الحالة الحالية)
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasksToLocalStorage();
        renderTasks();
    }
});


// التعامل مع أزرار الفلاتر
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // إزالة كلاس النشط من الزر السابق
        document.querySelector('.filter-btn.active').classList.remove('active');
        // إضافة كلاس النشط للزر الذي تم نقره
        btn.classList.add('active');

        // تحديد نوع الفلتر بناءً على النص المكتوب في الزر
        const filterText = btn.textContent;
        if (filterText === 'نشطة') {
            currentFilter = 'active';
        } else if (filterText === 'مكتملة') {
            currentFilter = 'completed';
        } else {
            currentFilter = 'all';
        }
        
        // إعادة رسم القائمة بناءً على الفلتر الجديد
        renderTasks();
    });
});


// الاستماع لحدث إرسال الفورم (يعمل عند الضغط على الزر أو زر Enter)
inputForm.addEventListener('submit', addTask);

// ===========================
// 5. تشغيل التطبيق عند البداية
// ===========================
// استدعاء دالة التحميل عند فتح الصفحة لأول مرة
loadTasks();
