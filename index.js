document.addEventListener("DOMContentLoaded", function(){
    const navItems = document.querySelectorAll(".nav-item"); 

    const savedPage = localStorage.getItem('activePage');
    
    if (savedPage) {
        navItems.forEach(nav => nav.classList.remove("active"));
        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active");
        });
        
        const savedNavItem = document.querySelector(`[data-page="${savedPage}"]`);
        const savedTargetPage = document.getElementById(savedPage);
        
        if (savedNavItem && savedTargetPage) {
            savedNavItem.classList.add("active");
            savedTargetPage.classList.add("active");
        } else {
            document.querySelector('[data-page="dashboard-page"]').classList.add("active");
            document.getElementById("dashboard-page").classList.add("active");
            localStorage.setItem('activePage', 'dashboard-page');
        }
    }

    navItems.forEach(item => {
        item.addEventListener("click", function(e){
            e.preventDefault(); 

            const pageId = this.getAttribute("data-page");
            
            navItems.forEach(nav => nav.classList.remove("active")); 
            this.classList.add("active"); 

            document.querySelectorAll(".page").forEach(page => {
                page.classList.remove("active"); 
            }); 

            const targetPage = document.getElementById(pageId); 
            if(targetPage){
                targetPage.classList.add("active"); 
                localStorage.setItem('activePage', pageId);
            }
        }); 
    });
});

function getLocalDateStr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const today = new Date();
const todayStr = getLocalDateStr(today); 

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = getLocalDateStr(tomorrow); 

const dateDisplay = document.querySelector(".date-display"); 
const greeting = document.getElementById("greeting"); 

function updateDateTime(){
    const date = new Date(); 
    const time = date.getHours(); 
    
    if(time >=5 && time < 12){
        greeting.textContent = "Good Morning"; 
    } else if(time >=12 && time < 17)
        greeting.textContent = "Good Afternoon"; 
    else {
        greeting.textContent = "Good Evening"
    }

    const options = {
        weekday: 'long', 
        month: 'long',  
        day: 'numeric'   
    };
    const formattedDate = date.toLocaleDateString('en-US', options);
    dateDisplay.textContent = formattedDate; 
}


let tasksBadge = document.querySelector(".tasks-card .badge");
let tasksList = document.getElementById("dashboardTasks"); 
let goToTaskPage;
let tasksPageLink;

let taskTitle = document.getElementById("task-title"); 
let taskDueDate = document.getElementById("due-date");
let taskNotes = document.getElementById("task-notes");

let saveTaskBtn = document.getElementById("save-task");
let cancelTaskForm = document.getElementById("cancel-form");
let tasksForm = document.querySelector(".add-task-form"); 

let addTaskBtn = document.getElementById("add-task-btn"); 
let taskList = document.getElementById("tasks-table"); 
let tasksFound = document.getElementById("tasks-found");
let taskCount = document.querySelector(".task-count"); 

let tableHeader = document.getElementById("tasks-table-header"); 
let rowsContainer = document.getElementById("task-rows-container"); 

let noTasksState = document.getElementById("no-tasks");
let noTasksStateDashboard = document.getElementById("no-tasks-dashboard");
let filters = document.querySelectorAll(".filter-btn");

let allBtn = document.querySelector('[data-filter="all"]');
let pendingBtn = document.querySelector('[data-filter="pending"]');
let completedBtn = document.querySelector('[data-filter="completed"]');

let tasks = []; 
let currentFilterBtn = "all"; 

function clearForm(){
    taskTitle.value = ""; 
    taskDueDate.value = ""; 
    taskNotes.value = "";
}

function addTask(Title, dueDate, notes){
    if(Title.trim() === "" || dueDate === "")
        return;
    
    const task = {
        id: Date.now(), 
        title: Title,
        date: dueDate,  
        note: notes, 
        completed: false
    }; 

    tasks.push(task); 

    saveTasks();
    renderTasks(); 
    renderDashboardTasks(); 
    clearForm(); 
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTasksCount();
    noTasks();
    renderDashboardTasks();
}

function updateTasksCount() {
  const filteredCount = filterTasks(currentFilterBtn).length;
  const totalCount = tasks.length; 

  tasksFound.textContent = `${filteredCount} task${filteredCount !== 1 ? 's' : ''} found`;
  taskCount.textContent = `(${totalCount})`;
}

function noTasks() {
  const filteredTasks = filterTasks(currentFilterBtn);
  if (filteredTasks.length === 0) {
    noTasksState.classList.remove("hidden");
    tableHeader.classList.add("hidden");
  } else {
    noTasksState.classList.add("hidden");
    tableHeader.classList.remove("hidden");
  }
}

function sortTasksByDate(taskArray){
    return taskArray.sort((a, b)=> {
        if(a.completed && !b.completed)
            return 1; 
        if(!a.completed && b.completed)
            return -1; 

        if(a.date < b.date)
            return -1; 
        if(a.date > b.date)
            return 1; 
        return 0; 
    })
}

function filterTasks(filter) {
    let filteredTasks; 
  switch (filter) {
    case "pending":
      filteredTasks = tasks.filter((task) => !task.completed);
      break; 
    case "completed":
      filteredTasks = tasks.filter((task) => task.completed);
      break; 
    default:
      filteredTasks = tasks;
      break; 
  }
  return sortTasksByDate(filteredTasks); 
}

function renderTasks(){
    const filteredTasks = filterTasks(currentFilterBtn); 
    rowsContainer.innerHTML = ""; 

    filteredTasks.forEach((task)=>{

        const row = document.createElement("div");
        row.classList.add("task-row"); 
        if(task.completed)
            row.classList.add("completed"); 

        const colStatus = document.createElement("div"); 
        colStatus.classList.add("col-status"); 
        const checkbox = document.createElement("div"); 
        checkbox.classList.add("checkbox"); 
        if(task.completed)
            checkbox.classList.add("checked"); 
        checkbox.addEventListener("click", (e) => {
            e.stopPropagation();
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });
        colStatus.appendChild(checkbox); 

        const colTask = document.createElement("div"); 
        colTask.classList.add("col-task"); 
        const span = document.createElement("span"); 
        if(task.completed){
            span.style.textDecoration = "line-through";  
        }
        span.textContent = task.title; 
        colTask.appendChild(span); 

        const colNotes = document.createElement("div"); 
        colNotes.classList.add("col-notes"); 
        const notesSpan = document.createElement("span"); 
        notesSpan.classList.add("notes-preview"); 
        notesSpan.textContent = task.note || "-"; 
        colNotes.appendChild(notesSpan); 

        const colDue = document.createElement("div"); 
        colDue.classList.add("col-due"); 
        const dueSpan = document.createElement("span"); 
        dueSpan.classList.add("due-badge"); 

        if (task.date === todayStr) {
            dueSpan.textContent = "Today";
            dueSpan.classList.add("today"); 
            dueSpan.style.fontWeight = 500; 
        } else if (task.date === tomorrowStr) {
            dueSpan.textContent = "Tomorrow";
            dueSpan.classList.add("tomorrow"); 
            dueSpan.style.fontWeight = 500; 

        } else {
            const date = new Date(task.date);
            dueSpan.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        colDue.appendChild(dueSpan); 

        const colDelete = document.createElement("div"); 
        colDelete.classList.add("col-delete"); 
        const deleteSpan = document.createElement("button"); 
        deleteSpan.classList.add("delete-task-btn"); 
        deleteSpan.innerHTML = '<i class="fas fa-trash"></i>'; 
        deleteSpan.addEventListener("click", () => deleteTask(task.id)); 
        colDelete.appendChild(deleteSpan); 

        row.appendChild(colStatus);
        row.appendChild(colTask); 
        row.appendChild(colNotes); 
        row.appendChild(colDue); 
        row.appendChild(colDelete); 

        rowsContainer.appendChild(row); 
    });

    noTasks(); 
}

function renderDashboardTasks(){
    const pendingTasks = filterTasks("pending"); 
    const dashboardTasks = pendingTasks.slice(0,4); 
    tasksList.innerHTML = ""; 

    tasksBadge.textContent = pendingTasks.length; 

    if(dashboardTasks.length === 0 ){
        noTasksStateDashboard.classList.remove("hidden");
        return; 
    }else{
        noTasksStateDashboard.classList.add("hidden"); 
    }

    dashboardTasks.forEach(task => {
        const taskDashboard = document.createElement("div"); 
        taskDashboard.classList.add("task-item"); 
        
        const taskCheckDashboard = document.createElement("div"); 
        taskCheckDashboard.classList.add("task-check"); 
        const taskCheckboxDashboard = document.createElement("div"); 
        taskCheckboxDashboard.classList.add("checkbox"); 
        if(task.completed){
            taskCheckboxDashboard.classList.add("checked"); 
        }
        
        taskCheckboxDashboard.addEventListener("click", (e) => {
            e.stopPropagation();
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
            renderDashboardTasks(); 
        });

        const taskSpanDashboard = document.createElement("span"); 
        taskSpanDashboard.textContent = task.title; 
        if(task.completed){
            taskSpanDashboard.style.textDecoration = "line-through";  
        }

        const dueSpanDashboard = document.createElement("span"); 
        dueSpanDashboard.classList.add("task-due"); 

        if (task.date === todayStr) {
            dueSpanDashboard.textContent = "Today";
            dueSpanDashboard.classList.add("today"); 
            dueSpanDashboard.style.fontWeight = 500; 
        } else if (task.date === tomorrowStr) {
            dueSpanDashboard.textContent = "Tomorrow";
            dueSpanDashboard.classList.add("tomorrow"); 
            dueSpanDashboard.style.fontWeight = 500; 

        } else {
            const date = new Date(task.date);
            dueSpanDashboard.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        taskCheckDashboard.appendChild(taskCheckboxDashboard); 
        taskCheckDashboard.appendChild(taskSpanDashboard); 

        taskDashboard.appendChild(taskCheckDashboard); 
        taskDashboard.appendChild(dueSpanDashboard); 

        tasksList.appendChild(taskDashboard); 
    });
}

function deleteTask(id) {
        tasks = tasks.filter((task) => task.id !== id);
        saveTasks();
        renderTasks();
        renderDashboardTasks(); 
}

function loadTasks() {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) 
        tasks = JSON.parse(storedTasks);
    renderTasks();
    renderDashboardTasks(); 
}


function setActiveFilter(filter) {
  currentFilterBtn = filter;
  
  if (filter === "all") {
    allBtn.classList.add("active");
    pendingBtn.classList.remove("active");
    completedBtn.classList.remove("active");
  } else if (filter === "pending") {
    allBtn.classList.remove("active");
    pendingBtn.classList.add("active");
    completedBtn.classList.remove("active");
  } else { 
    allBtn.classList.remove("active");
    pendingBtn.classList.remove("active");
    completedBtn.classList.add("active");
  }
  
  renderTasks();
  renderDashboardTasks(); 
  updateTasksCount(); 
}



let examCount = document.querySelector(".exam-count"); 
let examsFound = document.getElementById("exams-found");
let addExamBtn = document.getElementById("add-exam-btn"); 

let examsForm = document.querySelector(".add-exam-form"); 
let examList = document.getElementById("exams-table"); 
let noExamsState = document.getElementById("no-exams");
let examsTableHeader = document.getElementById("exams-table-header"); 
let examsRowsContainer = document.getElementById("exam-rows-container"); 

let examfilters = document.querySelectorAll(".filter-btn");
let upcomingBtn = document.querySelector('[data-filter="upcoming"]');
let pastBtn = document.querySelector('[data-filter="past"]');

let examSubject = document.getElementById("exam-subject"); 
let examDate = document.getElementById("exam-date");
let examTime = document.getElementById("exam-time");
let examLocation = document.getElementById("exam-location");
let examType = document.getElementById("exam-type");
let examNotes = document.getElementById("exam-notes");

let saveExamBtn = document.getElementById("save-exam");
let cancelExamForm = document.getElementById("cancel-exam");

let examsBadge = document.querySelector(".exam-card .badge");
let examsList = document.getElementById("dashboardExams"); 
let noExamsStateDashboard = document.getElementById("no-exams-dashboard");
let goToExamPage;
let examsPageLink;

let exams = []; 
let currentExamFilterBtn = "upcoming"; 
let examID = null; 

function clearExamForm(){
    examSubject.value = ""; 
    examDate.value = ""; 
    examTime.value = "";
    examLocation.value = "";
    examType.value = ""; 
    examNotes.value = "";
}

function addExam(subject, due, place, timing, types, notes){
    if(subject.trim() === "" || due === "" || types === "" || types === "disabled selected")
        return;
    
    const exam = {
        id: Date.now(), 
        title: subject,
        date: due,  
        location: place, 
        time: timing, 
        type: types, 
        note: notes, 
    }; 

    exams.push(exam); 

    saveExams();
    renderExams(); 
    renderDashboardExams(); 
    clearExamForm(); 
}

function saveExams() {
    localStorage.setItem("exams", JSON.stringify(exams));
    updateExamsCount();
    noExams();
    renderDashboardExams();
}

function loadExams() {
    const storedExams = localStorage.getItem("exams");
    if (storedExams) 
        exams = JSON.parse(storedExams);
    renderExams();
    renderDashboardExams(); 
}

function updateExamsCount() {
    const filteredCount = filterExams(currentExamFilterBtn).length;
    const totalCount = exams.length; 

    examsFound.textContent = `${filteredCount} exam${filteredCount !== 1 ? 's' : ''} found`;
    examCount.textContent = `(${totalCount})`;
    }

function noExams() {
    const filteredExams = filterExams(currentExamFilterBtn);
    if (filteredExams.length === 0) {
        noExamsState.classList.remove("hidden");
        examsTableHeader.classList.add("hidden");
    } else {
        noExamsState.classList.add("hidden");
        examsTableHeader.classList.remove("hidden");
    }
}

function sortExamsByDate(examArray){
    return examArray.sort((a, b)=> {
        if(a.date < b.date)
            return -1; 
        if(a.date > b.date)
            return 1; 
        return 0; 
    })
}

function filterExams(filter) {
    let filteredExams; 
  switch (filter) {
        case "upcoming":
            filteredExams = exams.filter((exam) => exam.date >= todayStr);
            break; 
        case "past":
            filteredExams = exams.filter((exam) => exam.date < todayStr);
            break; 
        default: 
            filteredExams = exams; 
            break; 
  }
  return sortExamsByDate(filteredExams); 
}

function calculateDaysLeft(examDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [year, month, day] = examDate.split('-');
    const exam = new Date(year, month - 1, day);
    exam.setHours(0, 0, 0, 0);

    const differenceInmilliSeconds = exam - today; 
    const differenceInDays = Math.round(differenceInmilliSeconds / (1000 * 60 * 60 * 24));
    return differenceInDays;
}

function renderExams(){
    const filteredExams = filterExams(currentExamFilterBtn); 
    examsRowsContainer.innerHTML = ""; 

    filteredExams.forEach((exam)=>{
        const examRow = document.createElement("div"); 
        examRow.classList.add("exam-row"); 

        const examMain = document.createElement("div"); 
        examMain.classList.add("exam-main"); 

        const subjectExam = document.createElement("div"); 
        subjectExam.classList.add("col-subject"); 
            
        const examSubjectTitle = document.createElement("strong"); 
        examSubjectTitle.textContent = exam.title; 
        const examTypeSpan = document.createElement("span"); 
        examTypeSpan.classList.add("exam-type-badge");
        examTypeSpan.textContent = exam.type;  
        subjectExam.appendChild(examSubjectTitle); 
        subjectExam.appendChild(examTypeSpan);

        const examDate = document.createElement("div"); 
        examDate.classList.add("col-date"); 
        examDate.textContent = exam.date;  

        const examDaysLeft = document.createElement("div"); 
        examDaysLeft.classList.add("col-days"); 

        const days = calculateDaysLeft(exam.date);

        if (days === 0) {
            examDaysLeft.textContent = "Today";
            examDaysLeft.classList.add("today"); 
            examDaysLeft.style.fontWeight = 500; 
        } else if (days === 1) {
            examDaysLeft.textContent = "Tomorrow";
            examDaysLeft.classList.add("tomorrow"); 
            examDaysLeft.style.fontWeight = 500; 
        } else if(days < 0){
            examDaysLeft.textContent = `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`;
        } else {
            examDaysLeft.textContent = `${days} day${days !== 1 ? 's' : ''} left`;
        }

        const examActions = document.createElement("div"); 
        examActions.classList.add("col-actions"); 

        const examEditBtn = document.createElement("button"); 
        examEditBtn.classList.add("edit-btn"); 
        examEditBtn.innerHTML = '<i class="fas fa-edit"></i>';  
        examEditBtn.addEventListener("click", (e) => {
            e.stopPropagation();  
            editExam(exam);      
        });

        const examCancelBtn = document.createElement("button"); 
        examCancelBtn.classList.add("delete-btn");
        examCancelBtn.innerHTML = '<i class="fas fa-trash"></i>';  
        examCancelBtn.addEventListener("click", () => deleteExam(exam.id)); 
        examActions.appendChild(examEditBtn); 
        examActions.appendChild(examCancelBtn);

        const examExpanded = document.createElement("div"); 
        examExpanded.classList.add("exam-expanded"); 
        examExpanded.classList.add("hidden"); 
        examMain.addEventListener("click", () => {
            examExpanded.classList.toggle("hidden");
        });

        const examTime = document.createElement("div"); 
        examTime.classList.add("expanded-detail"); 
        if(exam.time !== "")
            examTime.innerHTML = `<i class="fas fa-clock"></i> ${exam.time}`;   
        else{
            examTime.innerHTML = `<i class="fas fa-clock"></i> To be determined`;   
        }

        const examLocation = document.createElement("div"); 
        examLocation.classList.add("expanded-detail"); 
        if(exam.location.trim() !== "")
            examLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${exam.location}`;  
        else {
            examLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> To be determined`;  
        }

        const examNotes = document.createElement("div"); 
        examNotes.classList.add("expanded-detail"); 
        if(exam.note.trim() !== "")
            examNotes.innerHTML = `<i class="fas fa-sticky-note"></i> ${exam.note}`;  
        else {
            examNotes.innerHTML = `<i class="fas fa-sticky-note"></i> No Notes`;  
        }

        examExpanded.appendChild(examTime);
        examExpanded.appendChild(examLocation);
        examExpanded.appendChild(examNotes);

        examMain.appendChild(subjectExam); 
        examMain.appendChild(examDate); 
        examMain.appendChild(examDaysLeft); 
        examMain.appendChild(examActions); 

        examRow.appendChild(examMain); 
        examRow.appendChild(examExpanded); 

        examsRowsContainer.appendChild(examRow);
    });
    noExams(); 
}

function renderDashboardExams(){
    const upcomingExams = filterExams("upcoming"); 
    const dashboardExams = upcomingExams.slice(0,3); 
    examsList.innerHTML = ""; 

    examsBadge.textContent = upcomingExams.length; 

    if(dashboardExams.length === 0 ){
        noExamsStateDashboard.classList.remove("hidden");
        return; 
    }else{
        noExamsStateDashboard.classList.add("hidden"); 
    }

    dashboardExams.forEach(exam => {
        const examDashboard = document.createElement("div"); 
        examDashboard.classList.add("exam-item"); 
        const daysLeft = calculateDaysLeft(exam.date);
        if(daysLeft <=2 && daysLeft >=0)
            examDashboard.classList.add("urgent"); 

        const examInfo = document.createElement("div"); 
        examInfo.classList.add("exam-info");
        
        const examSubjectDashboard = document.createElement("h4"); 
        examSubjectDashboard.textContent = exam.title;

        const examDateDashboard = document.createElement("p"); 
        examDateDashboard.classList.add("exam-date");
        const dateObj = new Date(exam.date); 
        const options = { weekday: "short", month: "short", day: "numeric" };
        examDateDashboard.textContent = dateObj.toLocaleDateString("en-US", options);

        examInfo.appendChild(examSubjectDashboard); 
        examInfo.appendChild(examDateDashboard); 
        
        const examCountdown = document.createElement("div"); 
        examCountdown.classList.add("countdown");
        
        const examDaysSpan = document.createElement("span"); 
        examDaysSpan.classList.add("days");

        if (daysLeft === 0) {
            examDaysSpan.textContent = "Today";
            const examLabelSpan = document.createElement("span"); 
            examLabelSpan.classList.add("label");
            examLabelSpan.textContent = "";
            examCountdown.appendChild(examDaysSpan);
        } else {
            examDaysSpan.textContent = daysLeft;
            const examLabelSpan = document.createElement("span"); 
            examLabelSpan.classList.add("label");
            examLabelSpan.textContent = daysLeft === 1 ? "day" : "days";
            examCountdown.appendChild(examDaysSpan);
            examCountdown.appendChild(examLabelSpan);
        } 

        examDashboard.appendChild(examInfo);
        examDashboard.appendChild(examCountdown);

        examsList.appendChild(examDashboard); 
    });
}


function editExam(exam){
    examSubject.value = exam.title; 
    examDate.value = exam.date; 
    examTime.value = exam.time || ""; 
    examLocation.value = exam.location || ""; 
    examType.value = exam.type; 
    examNotes.value = exam.note; 
    examID = exam.id; 

    examsForm.classList.remove("hidden"); 

    setTimeout(() => {
        examsForm.scrollIntoView({ 
            behavior: "smooth", 
            block: "start" 
        });
    }, 100);
}

function deleteExam(id) {
    exams = exams.filter((exam) => exam.id !== id);
    saveExams();
    renderExams(); 
    renderDashboardExams(); 
}

function setExamsActiveFilter(filter) {
    currentExamFilterBtn = filter;
    
    if (filter === "upcoming") {
        upcomingBtn.classList.add("active");
        pastBtn.classList.remove("active");
    } else { 
        upcomingBtn.classList.remove("active");
        pastBtn.classList.add("active");
    }
    
    renderExams();
    renderDashboardExams(); 
    updateExamsCount(); 
}


//------------------GPA Calculator page-------------------------
const clearAllData = document.getElementById("clear-all-btn");

const semesterGPA = document.getElementById("semester-gpa"); 
const cumulativeGPA = document.getElementById("cumulative-gpa"); 
const majorGPA = document.getElementById("major-gpa"); 
const totalCredits = document.getElementById("total-credits"); 

const semesterSelect = document.getElementById("semester-select"); 
const newSemesterBtn = document.getElementById("new-semester-btn");
const saveSemesterBtn = document.getElementById("save-semester-btn");

const currentGPA = document.getElementById("current-gpa"); 
const currentCredits = document.getElementById("current-credits"); 

const coursesTableBody = document.getElementById("courses-table-body");
const addCourseBtn = document.getElementById("add-course-btn"); 
const calculateBtn = document.getElementById("calculate-btn"); 

const savedSemestersList = document.querySelector(".saved-semesters-list"); 

const cGPAValue = document.getElementById("CGPA-value"); 
const mcGPAValue = document.getElementById("MCGPA-value"); 
const totalCreditsValue = document.getElementById("total-credits-value"); 

let goToGPAPage;
let gpaPageLink;

let semesters = []; 
let currentSemesterId = 1; 
let nextSemesterId = 2; 
let previousSemesterId = null;


const gradeMap = {
    "A": 4.0,
    "A-": 3.67,
    "B+": 3.33,
    "B": 3.0,
    "B-": 2.67,
    "C+": 2.33,
    "C": 2.0,
    "C-": 1.67,
    "D+": 1.33,
    "D": 1.0,
    "F": 0.0, 
    "E": null, 
    "W": null, 
    "WF": 0.0
};


function createFirstSemester(){
    const semester = {
        id: 1, 
        name: "Semester 1",
        courses: [], 
        isSaved:  false
    }
    
    semesters.push(semester); 
    currentSemesterId = 1; 
    nextSemesterId = 2; 
    saveGPAData(); 
}

function saveGPAData(){
    const gpaData = {
        semesters: semesters, 
        currentSemId: currentSemesterId,
        nextSemId: nextSemesterId
    }

    localStorage.setItem("GPAData", JSON.stringify(gpaData)); 
}

function loadGPAData(){
    const storedData = localStorage.getItem("GPAData"); 

    if(storedData){
        const data = JSON.parse(storedData); 
        semesters = data.semesters; 
        currentSemesterId = data.currentSemId; 
        nextSemesterId = data.nextSemId;
    } else{
        createFirstSemester(); 
    }
    renderSemesterSelect(); 
    renderCourses(); 
    renderSavedSemesters(); 
    calculateAllGPAs(); 
}

function renderSemesterSelect(){
    semesterSelect.innerHTML = ""; 

    semesters.forEach(semester =>{
        const option = document.createElement("option"); 
        option.value = semester.id; 
        option.textContent = semester.name; 

        if(semester.id === currentSemesterId){
            option.selected = true; 
        }
        semesterSelect.appendChild(option); 
    });
}

function renderCourses(){
    let currentSemester = semesters.find(semester => semester.id === currentSemesterId); 
    if(!currentSemester){
        return; 
    }
    coursesTableBody.innerHTML = ""; 

    currentSemester.courses.forEach(course =>{
        const courseRow = document.createElement("tr"); 
        courseRow.classList.add("course-row"); 

        const nameCell = document.createElement("td"); 
        const courseName = document.createElement("input"); 
        courseName.classList.add("course-name"); 
        courseName.type = "text"; 
        courseName.value = course.name; 
        courseName.placeholder = "Course name"; 

        courseName.addEventListener("input", (e) => {
            if(e.target.value.trim()!== ""){
                e.target.classList.remove("invalid"); 
            }
            course.name = e.target.value.toUpperCase();
            
            saveGPAData();
            calculateAllGPAs();
        });

        nameCell.appendChild(courseName);

        const creditsCell = document.createElement("td"); 
        const courseCredits = document.createElement("input"); 
        courseCredits.classList.add("course-credits"); 
        courseCredits.type = "number"; 
        courseCredits.value = course.credits; 
        courseCredits.step = "1"; 
        courseCredits.min = "1"; 
        courseCredits.max = "4"; 
        courseCredits.addEventListener("input", (e) => {
            course.credits = parseInt(e.target.value) || 0;
            saveGPAData();
            calculateAllGPAs();
        });
        creditsCell.appendChild(courseCredits);

        const gradeCell = document.createElement("td"); 
        const courseGrade = document.createElement("select"); 
        courseGrade.classList.add("course-grade");
        
        const grades = Object.keys(gradeMap); 

        for(let i = 0; i<grades.length; i++){
            const letter = grades[i]; 
            const value = gradeMap[letter]; 

            const option = document.createElement("option");
            if(value === null)
                option.value = letter; 
            else 
                option.value = value; 

            option.textContent = letter; 

            if(course.gradeLetter === letter)
                option.selected = true;

            courseGrade.appendChild(option); 
        }

        courseGrade.addEventListener("change", (e) => {
            const selectedValue = e.target.value;
            const selectedOption = e.target.options[e.target.selectedIndex];
            const selectedLetter = selectedOption.textContent;
            
            if (selectedValue === "E" || selectedValue === "W") {
                course.grade = null;
                course.gradeLetter = selectedValue;
            } else {
                course.grade = parseFloat(selectedValue);
                course.gradeLetter = selectedLetter;
            }
            
            saveGPAData();
            calculateAllGPAs();
        });
        

        const majorCell = document.createElement("td"); 
        majorCell.classList.add("major-checkbox"); 
        const majorCheckbox = document.createElement("input"); 
        majorCheckbox.classList.add("course-major"); 
        majorCheckbox.type = "checkbox"; 
        majorCheckbox.checked = course.isMajor || false;
        majorCheckbox.addEventListener("change", (e) => {
            course.isMajor = e.target.checked;
            saveGPAData();
            calculateAllGPAs();
        });
        majorCell.appendChild(majorCheckbox); 

        const actionsCell = document.createElement("td"); 
        actionsCell.classList.add("course-actions"); 
        const removeCourseBtn = document.createElement("button"); 
        removeCourseBtn.classList.add("remove-course-btn"); 
        removeCourseBtn.innerHTML = '<i class="fas fa-trash"></i>'; 
        removeCourseBtn.addEventListener("click", () => {
            const courseIndex = currentSemester.courses.findIndex(c => c.id === course.id); 
            if(courseIndex !== -1){
                currentSemester.courses.splice(courseIndex, 1); 
                saveGPAData(); 
                renderCourses(); 
                calculateAllGPAs(); 
            }
        });

        actionsCell.appendChild(removeCourseBtn); 

        gradeCell.appendChild(courseGrade); 

        courseRow.appendChild(nameCell); 
        courseRow.appendChild(creditsCell); 
        courseRow.appendChild(gradeCell); 
        courseRow.appendChild(majorCell); 
        courseRow.appendChild(actionsCell); 

        coursesTableBody.appendChild(courseRow);
    });
}

function calculateSemesterGPA(courses){
    let totalCredits = 0; 
    let totalCreditGrade =0; 
    courses.forEach(course =>{
        if(course.gradeLetter === "W" || course.gradeLetter === "E")
            return; 

        if (course.gradeLetter === "WF") {
            totalCredits += course.credits;
            totalCreditGrade += 0;
        } else {
            totalCredits += course.credits;
            totalCreditGrade += course.credits * course.grade;
        }
    });

    let semGPA = 0
    if(totalCredits!==0)
        semGPA = (totalCreditGrade / totalCredits).toFixed(2); 
    return semGPA; 
}

function calculateAllGPAs(){
    const currentSem = semesters.find(s => s.id === currentSemesterId);
    if(!currentSem) 
        return; 

    const currentCourses = currentSem.courses;

    const semGPA = calculateSemesterGPA(currentCourses); 
    semesterGPA.textContent = semGPA; 
    currentGPA.textContent = semGPA; 

    let allCourses = [];
    semesters.forEach(semester => {
        for (let i = 0; i < semester.courses.length; i++) {
            allCourses.push(semester.courses[i]);
        }
    });
    
    const cumGPA = calculateSemesterGPA(allCourses); 
    cumulativeGPA.textContent = cumGPA; 
    cGPAValue.textContent = cumGPA; 

    const majorCourses = allCourses.filter(course => course.isMajor === true); 
    const majGPA = calculateSemesterGPA(majorCourses); 
    majorGPA.textContent = majGPA; 
    mcGPAValue.textContent = majGPA; 

    let totalCred = 0;
    allCourses.forEach(course => {
        if (course.gradeLetter !== "W") {
            totalCred += course.credits;
        }
    });
    totalCredits.textContent = totalCred;
    totalCreditsValue.textContent = totalCred; 

    let currentCreditsTotal = 0;
    currentCourses.forEach(course => {
        if (course.gradeLetter !== "W" ) {
            currentCreditsTotal += course.credits;
        }
    });
    currentCredits.textContent = currentCreditsTotal;
}

function renderSavedSemesters(){
    savedSemestersList.innerHTML = ""; 

    semesters.forEach(semester => {
        if(semester.id === currentSemesterId || semester.isSaved !== true)
            return; 

        const SGPA = calculateSemesterGPA(semester.courses); 
        let totalCredit = 0; 

        semester.courses.forEach(course =>{
            if(course.gradeLetter !== "W" ){
                totalCredit += course.credits; 
            }
        });

        const semesterIndex = semesters.findIndex(s => s.id === semester.id);
        let coursesUpToThisSemester = [];
        for (let i = 0; i <= semesterIndex; i++) {
            coursesUpToThisSemester = coursesUpToThisSemester.concat(semesters[i].courses);
        }

        const courseCount = semester.courses.length; 

        const savedSemItem = document.createElement("div"); 
        savedSemItem.classList.add("saved-semester-item"); 
        
        const semHeader = document.createElement("div"); 
        semHeader.classList.add("semester-header"); 

        const semInfo = document.createElement("div"); 
        semInfo.classList.add("semester-info"); 
        semInfo.innerHTML = `
                <h4>${semester.name} </h4>  
                <p>${courseCount} course${courseCount !== 1 ? 's' : ''} • ${totalCredit} credits</p>`; 

        const semGPADisplay = document.createElement("div"); 
        semGPADisplay.classList.add("semester-gpa-display"); 

        const semGPA = document.createElement("span"); 
        semGPA.classList.add("semester-gpa"); 
        semGPA.textContent = SGPA; 

        const semCredits = document.createElement("span"); 
        semCredits.classList.add("credits"); 
        semCredits.textContent = totalCredit + " credits"; 

        const loadSem = document.createElement("button"); 
        loadSem.classList.add("load-semester-btn"); 
        loadSem.innerHTML = `<i class="fas fa-folder-open"></i>`;
        loadSem.addEventListener("click", (e)=>{
            e.stopPropagation();
            loadSemester(semester.id);
        });

        const deleteSem = document.createElement("span"); 
        deleteSem.classList.add("delete-semester-btn"); 
        deleteSem.innerHTML = `<i class="fas fa-trash"></i>`; 
        deleteSem.addEventListener("click", (e)=>{
            e.stopPropagation();
            semester.isSaved = false;
            saveGPAData(); 
            renderSavedSemesters(); 
        });

        const semCourses = document.createElement("div"); 
        semCourses.classList.add("semester-courses");
        semCourses.classList.add("hidden"); 
        savedSemItem.addEventListener("click", () => {
            semCourses.classList.toggle("hidden");
        });

        const semCoursesHeader = document.createElement("div"); 
        semCoursesHeader.classList.add("semester-courses-header");
        semCoursesHeader.innerHTML = `<span>Course</span><span>Credits</span><span>Grade</span>`; 
        semCourses.appendChild(semCoursesHeader); 


        semester.courses.forEach(subject => {
            const semCourse = document.createElement("div"); 
            semCourse.classList.add("semester-course");

            const nameSpan = document.createElement("span"); 
            nameSpan.textContent = subject.name;

            const creditsSpan = document.createElement("span"); 
            creditsSpan.textContent = subject.credits;

            const gradesSpan = document.createElement("span"); 
            gradesSpan.textContent = subject.gradeLetter;

            semCourse.appendChild(nameSpan); 
            semCourse.appendChild(creditsSpan); 
            semCourse.appendChild(gradesSpan); 

            semCourses.appendChild(semCourse); 
        }); 

        const majorCourses = coursesUpToThisSemester.filter(c => c.isMajor === true);

        let totalCreditsUpTo = 0;
        coursesUpToThisSemester.forEach(c => {
            if (c.gradeLetter !== "W") {
                totalCreditsUpTo += c.credits;
            }
        });

        const semGPASummary = document.createElement("div");
        semGPASummary.classList.add("semester-gpa-summary"); 

        const sgpaSummary = document.createElement("div");
        sgpaSummary.classList.add("summary-item"); 
        sgpaSummary.innerHTML = `<span class="summary-label">Semester GPA:</span><span class="summary-value">${SGPA}</span>`;
        semGPASummary.appendChild(sgpaSummary);

        const cgpaSummary = document.createElement("div");
        cgpaSummary.classList.add("summary-item"); 
        cgpaSummary.innerHTML = `<span class="summary-label">Cumulative GPA:</span><span class="summary-value">${calculateSemesterGPA(coursesUpToThisSemester)}</span>`;
        semGPASummary.appendChild(cgpaSummary);

        const mcgpaSummary = document.createElement("div");
        mcgpaSummary.classList.add("summary-item"); 
        mcgpaSummary.innerHTML = `<span class="summary-label">Major GPA:</span><span class="summary-value">${calculateSemesterGPA(majorCourses)}</span>`;
        semGPASummary.appendChild(mcgpaSummary);

        const creditsSummary = document.createElement("div");
        creditsSummary.classList.add("summary-item"); 
        creditsSummary.innerHTML = `<span class="summary-label">Total Credits:</span><span class="summary-value">${totalCreditsUpTo}</span>`;
        semGPASummary.appendChild(creditsSummary); 

        semCourses.appendChild(semGPASummary); 
   
        semGPADisplay.appendChild(semGPA); 
        semGPADisplay.appendChild(semCredits); 
        semGPADisplay.appendChild(loadSem); 
        semGPADisplay.appendChild(deleteSem); 

        semHeader.appendChild(semInfo); 
        semHeader.appendChild(semGPADisplay); 

        savedSemItem.appendChild(semHeader); 
        savedSemItem.appendChild(semCourses); 

        savedSemestersList.appendChild(savedSemItem); 
    });

}

function validateCourseNames() {
    let isValid = true;
    const allNameInputs = document.querySelectorAll(".course-name");
    
    allNameInputs.forEach(input => {
        if (input.value.trim() === "") {
            input.classList.add("invalid");
            isValid = false;
        } else {
            input.classList.remove("invalid");
        }
    });
    
    return isValid;
}

function loadSemester(semesterId) {
    previousSemesterId = currentSemesterId; 
    currentSemesterId = semesterId;
    saveGPAData();
    renderSemesterSelect();
    renderCourses();
    renderSavedSemesters();
    calculateAllGPAs();
}

clearAllData.addEventListener("click", () => {
    semesters = [];
    currentSemesterId = null;
    
    createFirstSemester();
    
    saveGPAData();
    renderSemesterSelect();
    renderCourses();
    renderSavedSemesters();
    calculateAllGPAs();
});


//Notes Section in Dashboard 
const notes = document.querySelector(".notes-textarea"); 
const charactersCount = document.querySelector(".char-count"); 
const autoSaveSpan = document.querySelector(".auto-save"); 

function saveNotes(){
    localStorage.setItem("notes", notes.value); 
}

function loadNotes(){
    const storedNotes = localStorage.getItem("notes"); 
    if (storedNotes) 
        notes.value = storedNotes;
    else 
        notes.value = ""; 

    updateCharCount(); 
}

function updateCharCount(){
    charactersCount.textContent = notes.value.length; 
}

notes.addEventListener("input", (e)=>{
    autoSaveSpan.textContent = "Saving..."; 
    setTimeout(() => {
        autoSaveSpan.textContent = "Auto-saved"; 
    }, 500);

    updateCharCount(); 
    saveNotes(); 
});


//-----------------Pomodoro Page-----------------------
const focusMode = document.getElementById("focus-mode"); 
const breakMode = document.getElementById("break-mode"); 

const timerDisplay = document.querySelector(".timer"); 

const progressBar = document.querySelector(".progress-bar"); 
const progressFill = document.querySelector(".progress-fill"); 

const startBtn = document.getElementById("start-btn"); 
const pauseBtn = document.getElementById("pause-btn"); 
const resetBtn = document.getElementById("reset-btn"); 

const focusUpBtn = document.getElementById("focus-up-btn"); 
const focusDownBtn = document.getElementById("focus-down-btn"); 
const breakUpBtn = document.getElementById("break-up-btn"); 
const breakDownBtn = document.getElementById("break-down-btn"); 

const focusMinutes = document.getElementById("focus-minutes"); 
const breakMinutes = document.getElementById("break-minutes"); 

const totalSessions = document.getElementById("total-sessions");
const totalFocus = document.getElementById("total-focus");

const emptyHistory = document.querySelector(".empty-history"); 
const sessionList = document.querySelector(".sessions-list")
const historyList = document.querySelector(".history-list"); 

const timerDisplayDashboard = document.querySelector(".timer-display");
const startBtnDashboard = document.getElementById("dashboard-start-btn"); 
let gotoPomodoroPage; 
let pomodoroPageLink; 

let focusTime = 25;
let breakTime = 5; 
let focusTimeInSecs = focusTime * 60; 
let breakTimeInSecs = breakTime * 60; 
let timeRemaining = focusTimeInSecs; 
let isActive = false; 
let isPaused = false; 
let isFocusMode = true; 
let sessionCount = 0;
let totalTime = 0; 
let timer = null; 
let sessions = []; 

function updateTimerDisplay(timeRemain){
    const minutes = Math.floor(timeRemain / 60); 
    const seconds = timeRemain % 60; 
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    timerDisplayDashboard.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; 
}

function updateProgress(){
    let total = isFocusMode ? focusTimeInSecs : breakTimeInSecs; 
    let percent = ((total - timeRemaining) / total) * 100; 
    progressFill.style.width = percent + "%"; 
}

function updateStats(){
    totalSessions.textContent = `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`;

    const hours = Math.floor(totalTime / 60); 
    const minutes = totalTime % 60; 
    totalFocus.textContent = `${hours}h ${minutes}m`;
}

function startTimer(){
    if(!isActive && !isPaused){
        isActive = true; 
        startBtn.disabled = true; 
        pauseBtn.disabled = false; 

        timer = setInterval(() => {   
            timeRemaining--; 
            updateTimerDisplay(timeRemaining);  
            updateProgress();
            if(timeRemaining===0)
                sessionComplete();

        }, 1000);
    }
}

function pauseTimer(){
    if(isActive){
        isActive = false;
        isPaused = true; 
        clearInterval(timer);
        startBtn.disabled = false; 
        pauseBtn.textContent = "Resume"; 
    }
}

function resumeTimer(){
    if(isPaused){
        isPaused = false; 
        isActive = true; 
        pauseBtn.textContent = "Pause"; 
        timer = setInterval(() => {
            timeRemaining--; 
            updateTimerDisplay(timeRemaining);  
            updateProgress();
            if(timeRemaining===0){
                if(isFocusMode)
                    sessionComplete();
                else
                    breakComplete();
            } 
        }, 1000);
    }
}

function resetTimer(){
    if(timer)
        clearInterval(timer); 

    isActive = false; 
    isPaused = false; 

    if(isFocusMode){
        timeRemaining = focusTimeInSecs;
    }
    else {
        timeRemaining = breakTimeInSecs;
    }

    startBtn.disabled = false; 
    pauseBtn.textContent = "Pause"; 
    pauseBtn.disabled = true; 

    updateTimerDisplay(timeRemaining);  
    updateProgress();
}

function clearOldSessions() {
    const oldCount = sessions.length;
    
    sessions = sessions.filter(session => session.date === todayStr);
    
    if (sessions.length !== oldCount) {
        sessionCount = sessions.length;
        totalTime = 0;
        sessions.forEach(session => {
            totalTime += session.duration;
        });
        renderHistory();
        updateStats();
        savePomodoro();
    }
}

function sessionComplete(){
    if(timer)
        clearInterval(timer); 

    isActive = false; 
    isPaused = false; 

    totalTime += focusTime; 
    sessionCount++; 
    updateStats(); 

    const now = new Date(); 
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 

    const newSession = {
        time: timeString,
        duration: focusTime, 
        date: todayStr
    };

    sessions.push(newSession);
    renderHistory();

    isFocusMode = false; 
    timeRemaining = breakTimeInSecs; 

    breakMode.classList.add("active"); 
    focusMode.classList.remove("active"); 
    updateProgress(); 
    updateTimerDisplay(timeRemaining); 

    startBtn.disabled = false;
    pauseBtn.textContent = "Pause";
    pauseBtn.disabled = true;

    startTimer(); 
    savePomodoro(); 
}

function breakComplete(){
    if(timer)
        clearInterval(timer); 

    isActive = false; 
    isPaused = false; 

    isFocusMode = true; 
    timeRemaining = focusTimeInSecs; 

    breakMode.classList.remove("active"); 
    focusMode.classList.add("active"); 
    updateProgress(); 
    updateTimerDisplay(timeRemaining); 

    startBtn.disabled = false;
    pauseBtn.textContent = "Pause";
    pauseBtn.disabled = true;
}

startBtn.addEventListener("click", ()=>{
    startTimer(); 
});

startBtnDashboard.addEventListener("click", ()=>{
    startTimer(); 
});

pauseBtn.addEventListener("click", ()=>{
    if(isActive && !isPaused)
        pauseTimer(); 
    else
        resumeTimer(); 
});

resetBtn.addEventListener("click", ()=>{
    resetTimer(); 
});

focusUpBtn.addEventListener("click", ()=>{
    if(focusTime < 120){
        focusTime +=5; 
        focusTimeInSecs = focusTime * 60; 

        if (isFocusMode && !isActive && !isPaused) {
            timeRemaining = focusTimeInSecs;
            updateTimerDisplay(timeRemaining);
            updateProgress();
        }
        focusMinutes.textContent = focusTime; 
    }
});

focusDownBtn.addEventListener("click", ()=>{
    if(focusTime > 25){
        focusTime -=5; 
        focusTimeInSecs = focusTime * 60; 

        if (isFocusMode && !isActive && !isPaused) {
            timeRemaining = focusTimeInSecs;
            updateTimerDisplay(timeRemaining);
            updateProgress();
        }
        focusMinutes.textContent = focusTime; 
    }
});

breakUpBtn.addEventListener("click", ()=>{
    if(breakTime < 30){
        breakTime +=5; 
        breakTimeInSecs = breakTime * 60; 

        if (!isFocusMode && !isActive && !isPaused) {
            timeRemaining = breakTimeInSecs;
            updateTimerDisplay(timeRemaining);
            updateProgress();
        }
        breakMinutes.textContent = breakTime; 
    }
});

breakDownBtn.addEventListener("click", ()=>{
    if(breakTime > 5){
        breakTime -=5; 
        breakTimeInSecs = breakTime * 60; 

        if (!isFocusMode && !isActive && !isPaused) {
            timeRemaining = breakTimeInSecs;
            updateTimerDisplay(timeRemaining);
            updateProgress();
        }
        breakMinutes.textContent = breakTime; 
    }
});

focusMode.addEventListener("click", () => {
    if (!isFocusMode) {
        if (timer) clearInterval(timer);
        isActive = false;
        isPaused = false;
        
        isFocusMode = true;
        timeRemaining = focusTimeInSecs;
        
        focusMode.classList.add("active");
        breakMode.classList.remove("active");
        updateTimerDisplay(timeRemaining);
        updateProgress();
        
        startBtn.disabled = false;
        pauseBtn.textContent = "Pause";
        pauseBtn.disabled = true;
    }
});

breakMode.addEventListener("click", () => {
    if (isFocusMode) {
        if (timer) clearInterval(timer);
        isActive = false;
        isPaused = false;
        
        isFocusMode = false;
        timeRemaining = breakTimeInSecs;
        
        breakMode.classList.add("active");
        focusMode.classList.remove("active");
        updateTimerDisplay(timeRemaining);
        updateProgress();
        
        startBtn.disabled = false;
        pauseBtn.textContent = "Pause";
        pauseBtn.disabled = true;
    }
});

function emptyHistoryState() {
  if (sessions.length === 0) {
    emptyHistory.classList.remove("hidden");
    sessionList.classList.add("hidden");
  } else {
    emptyHistory.classList.add("hidden");
    sessionList.classList.remove("hidden");
  }
}

function renderHistory(){
    sessionList.innerHTML = ""; 
    let sessionCounter  = 1; 
    
    sessions.forEach(session => {

        const sessionItem = document.createElement("div"); 
        sessionItem.classList.add("session-item"); 

        const sessionInfo = document.createElement("div"); 
        sessionInfo.classList.add("session-info"); 

        const sessionIcon = document.createElement("div"); 
        sessionIcon.classList.add("session-icon"); 
        sessionIcon.innerHTML = '<i class="fas fa-brain"></i>'; 

        const sessionDetails = document.createElement("div"); 
        sessionDetails.classList.add("session-details"); 
        sessionDetails.innerHTML = `<span class="session-number">Session ${sessionCounter}</span><span class="session-time">${session.time}</span>`;

        const sessionDuration = document.createElement("div"); 
        sessionDuration.classList.add("session-duration"); 
        sessionDuration.textContent = `${session.duration} min`; 

        sessionInfo.appendChild(sessionIcon);
        sessionInfo.appendChild(sessionDetails);

        sessionItem.appendChild(sessionInfo);
        sessionItem.appendChild(sessionDuration); 

        sessionList.appendChild(sessionItem); 
        sessionCounter++; 
    });
    emptyHistoryState();
}

function savePomodoro(){
    localStorage.setItem("sessions", JSON.stringify(sessions)); 
    renderHistory(); 
    updateStats(); 
    updateTimerDisplay(timeRemaining); 
}

function loadPomodoro(){
    const storedPomodoro = localStorage.getItem("sessions");
    if (storedPomodoro) {
        sessions = JSON.parse(storedPomodoro);
        clearOldSessions();  
    }

    renderHistory(); 
    updateStats(); 
    updateTimerDisplay(timeRemaining); 
}

window.addEventListener("DOMContentLoaded", () => {
    goToTaskPage = document.getElementById("goToTaskPage");
    tasksPageLink = document.querySelector('[data-page="tasks-page"]');

    goToExamPage = document.getElementById("goToExamsPage");
    examsPageLink = document.querySelector('[data-page="exams-page"]');

    goToGPAPage = document.getElementById("goToGPAPage"); 
    gpaPageLink = document.querySelector('[data-page="gpa-page"]');

    gotoPomodoroPage = document.getElementById("goToPomodoroPage"); 
    pomodoroPageLink = document.querySelector('[data-page="pomodoro-page"]');

    //Task page events
    saveTaskBtn.addEventListener("click", (e)=>{
        e.preventDefault(); 
        addTask(taskTitle.value, taskDueDate.value, taskNotes.value); 
    });

    cancelTaskForm.addEventListener("click", ()=>{
        clearForm(); 
        tasksForm.classList.add("hidden"); 
    });

    addTaskBtn.addEventListener("click", ()=>{
        tasksForm.classList.remove("hidden"); 
        clearForm(); 

        setTimeout(() => {
            tasksForm.scrollIntoView({ 
                behavior: "smooth", 
                block: "start" 
            });
        }, 100);
    })

    goToTaskPage.addEventListener("click", (e)=>{
        e.preventDefault(); 
        tasksPageLink.click();  
    });

    allBtn.addEventListener("click", () => setActiveFilter("all"));
    pendingBtn.addEventListener("click", () => setActiveFilter("pending"));
    completedBtn.addEventListener("click", () => setActiveFilter("completed"));


    //Exam page events
    saveExamBtn.addEventListener("click", (e)=>{
        e.preventDefault(); 
    
    if (examID !== null) {
        const examIndex = exams.findIndex(exam => exam.id === examID);
        
        if (examIndex !== -1) {
            exams[examIndex] = {
                id: examID,
                title: examSubject.value,
                date: examDate.value,
                location: examLocation.value,
                time: examTime.value,
                type: examType.value,
                note: examNotes.value
            };
            
            saveExams();
            renderExams();
            clearExamForm();
            
            examID = null;
            }
        }else{
            addExam(examSubject.value, examDate.value, examLocation.value, examTime.value, examType.value, examNotes.value); 
        }
        examsForm.classList.add("hidden");
    });

    cancelExamForm.addEventListener("click", ()=>{
        clearExamForm(); 
        examsForm.classList.add("hidden"); 
        examID = null; 
    });

    addExamBtn.addEventListener("click", ()=>{
        examsForm.classList.remove("hidden"); 
        clearExamForm(); 

        setTimeout(() => {
            examsForm.scrollIntoView({ 
                behavior: "smooth", 
                block: "start" 
            });
        }, 100);
    })

    upcomingBtn.addEventListener("click", () => setExamsActiveFilter("upcoming"));
    pastBtn.addEventListener("click", () => setExamsActiveFilter("past"));

    goToExamPage.addEventListener("click", (e)=>{
        e.preventDefault(); 
        examsPageLink.click();  
    });


    //GPA Calculator Page 
    addCourseBtn.addEventListener("click", ()=>{
        let currentSemester = semesters.find(semester => semester.id === currentSemesterId); 
        if(!currentSemester){
            return; 
        }

        let course = {
            id: Date.now(), 
            name: "", 
            credits: 3, 
            grade: 4.0, 
            gradeLetter: "A", 
            isMajor: false
        }

        currentSemester.courses.push(course); 
        saveGPAData(); 
        renderCourses(); 
        calculateAllGPAs(); 
    }); 


    newSemesterBtn.addEventListener("click", ()=>{
        if (semesters.length >= 12) {
            alert("Maximum 12 semesters reached. Cannot create more.");
            return;
        }

        if (!validateCourseNames()) {
            return;
        }
        let newSemester = {
            id: Date.now(), 
            name: "Semester " + nextSemesterId, 
            courses: [], 
            isSaved: false
        }

        semesters.push(newSemester); 
        currentSemesterId = newSemester.id;
        nextSemesterId++;

        saveGPAData(); 
        renderSemesterSelect(); 
        calculateAllGPAs(); 
        renderCourses(); 
        renderSavedSemesters()
    });

    saveSemesterBtn.addEventListener("click", ()=>{
        if (!validateCourseNames()) {
            return;
        }
        let currentSemester = semesters.find(semester => semester.id === currentSemesterId); 
        if(!currentSemester){
            return; 
        }

        currentSemester.isSaved = true; 

        if (previousSemesterId !== null) {
            currentSemesterId = previousSemesterId;
            previousSemesterId = null;
        } else {
            let newSemester = {
                id: Date.now(),
                name: "Semester " + nextSemesterId,
                courses: [],
                isSaved: false
            };
            semesters.push(newSemester);
            currentSemesterId = newSemester.id;
            nextSemesterId++;
        }

        saveGPAData();
        renderSemesterSelect();
        renderCourses();
        renderSavedSemesters();
        calculateAllGPAs();
    });

    semesterSelect.addEventListener("change", (e) => {
        if (!validateCourseNames()) {
            renderSemesterSelect();
            return;
        }
        loadSemester(parseInt(e.target.value));
    });

    goToGPAPage.addEventListener("click", (e)=>{
        e.preventDefault(); 
        gpaPageLink.click();  
    });

    //Pomodoro Page 
    gotoPomodoroPage.addEventListener("click", (e)=>{
        e.preventDefault(); 
        pomodoroPageLink.click();  
    });

    updateDateTime(); 

    loadTasks();
    updateTasksCount(); 
    tasksForm.classList.add("hidden"); 

    loadExams(); 
    updateExamsCount(); 
    examsForm.classList.add("hidden"); 

    loadGPAData(); 
    calculateAllGPAs(); 

    loadNotes(); 
    updateCharCount(); 

    loadPomodoro(); 
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            clearOldSessions();
        }
    });
});
